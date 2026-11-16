#include "device_manager.h"
#include "configuration_manager.h"
#include "pins.h"
#include <ctime>

#ifdef ARDUINO
#include <Arduino.h>
#endif

DeviceManager::DeviceManager()
    : m_state(DeviceState::BOOT),
      m_sequence_counter(1),
      m_last_sample_time(0),
      m_last_telemetry_time(0),
      m_last_heartbeat_time(0),
      m_last_wifi_retry_time(0) {}

std::string DeviceManager::getCurrentIsoTimestamp() {
#ifdef ARDUINO
    // When NTP is available, format standard UTC ISO-8601 string
    time_t now;
    time(&now);
    struct tm timeinfo;
    if (gmtime_r(&now, &timeinfo) && timeinfo.tm_year > (2020 - 1900)) {
        char buf[32];
        strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
        return std::string(buf);
    }
    // Fallback: system uptime format
    uint32_t s = millis() / 1000;
    return std::string("2026-11-17T00:00:00Z"); // Default timestamp baseline
#else
    return "2026-11-17T00:00:00Z";
#endif
}

bool DeviceManager::setup() {
    // 1. Load Configuration
    ConfigurationManager config_mgr;
    config_mgr.load(m_config);

    // 2. Initialize Subsystems
    m_sensor_mgr = std::unique_ptr<SensorManager>(new SensorManager());
    m_diagnostics = std::unique_ptr<Diagnostics>(new Diagnostics());
    m_wifi_mgr = std::unique_ptr<WifiManager>(new WifiManager(m_config.wifi_ssid, m_config.wifi_password));
    m_auth = std::unique_ptr<Authentication>(new Authentication(m_config.device_id, m_config.api_key));
    m_http_client = std::unique_ptr<HttpClient>(new HttpClient(m_config.api_base_url, *m_auth));
    m_buffer = std::unique_ptr<TelemetryBuffer>(new TelemetryBuffer(120));
    m_battery = std::unique_ptr<BatteryMonitor>(new BatteryMonitor(PIN_BATTERY_ADC, BATTERY_DIVIDER_RATIO));

    // 3. Initialize Sensors
    m_state = DeviceState::INIT_SENSORS;
    m_sensor_mgr->init(m_config);
    m_battery->init();
    m_buffer->init();

    // 4. Connect to Wi-Fi
    m_state = DeviceState::CONNECTING_WIFI;
    if (m_wifi_mgr->connect()) {
        m_state = DeviceState::ONLINE;
    } else {
        m_state = DeviceState::OFFLINE_BUFFERING;
    }

    return true;
}

bool DeviceManager::triggerSensorSample() {
    float soil_temp = 25.0f;
    auto measurements = m_sensor_mgr->sampleAll(soil_temp);

    float batt_volts = 3.85f, batt_pct = 80.0f;
    if (m_battery) {
        m_battery->sample(batt_volts, batt_pct);
    }

    int32_t rssi = m_wifi_mgr ? m_wifi_mgr->getRssi() : -100;
    size_t buffered = m_buffer ? m_buffer->count() : 0;
    auto diag = m_diagnostics->getDiagnostics(batt_volts, batt_pct, rssi, buffered);

    TelemetryPacket packet;
    packet.device_id = m_config.device_id;
    packet.farm_id = m_config.farm_id;
    packet.field_id = m_config.field_id;
    packet.timestamp_iso = getCurrentIsoTimestamp();
    packet.sequence_number = m_sequence_counter++;
    packet.firmware_version = m_config.firmware_version;
    packet.is_synthetic = m_config.enable_simulation_mode;
    packet.measurements = measurements;
    packet.diagnostics = diag;

    // Buffer the packet
    if (m_buffer) {
        m_buffer->push(packet);
    }

    return true;
}

bool DeviceManager::triggerTelemetryTransmit() {
    if (!m_wifi_mgr || !m_wifi_mgr->isConnected()) {
        m_state = DeviceState::OFFLINE_BUFFERING;
        return false;
    }

    m_state = DeviceState::TRANSMITTING;
    flushOfflineBuffer();
    m_state = DeviceState::ONLINE;
    return true;
}

void DeviceManager::flushOfflineBuffer() {
    if (!m_buffer || m_buffer->isEmpty() || !m_http_client) {
        return;
    }

    TelemetryPacket packet;
    while (m_buffer->peek(packet)) {
        auto resp = m_http_client->postTelemetry(packet);
        if (resp.success) {
            m_buffer->removeFront();
            if (m_diagnostics) m_diagnostics->recordSuccessfulTransmission();
        } else {
            // Stop flushing on network or server error; retry on next cycle
            if (m_diagnostics) m_diagnostics->recordFailedTransmission();
            break;
        }
    }
}

bool DeviceManager::triggerHeartbeat() {
    if (!m_wifi_mgr || !m_wifi_mgr->isConnected() || !m_http_client) {
        return false;
    }

    float batt_volts = 3.85f, batt_pct = 80.0f;
    if (m_battery) {
        m_battery->sample(batt_volts, batt_pct);
    }

    HeartbeatPacket hb;
    hb.battery_voltage = batt_volts;
    hb.battery_percent = batt_pct;
    hb.signal_rssi = m_wifi_mgr->getRssi();
#ifdef ARDUINO
    hb.uptime_seconds = millis() / 1000;
    hb.free_memory_bytes = ESP.getFreeHeap();
#else
    hb.uptime_seconds = 3600;
    hb.free_memory_bytes = 184000;
#endif
    hb.firmware_version = m_config.firmware_version;
    hb.sensor_statuses = m_sensor_mgr->getSensorStatuses();

    auto resp = m_http_client->postHeartbeat(hb);
    return resp.success;
}

void DeviceManager::loop() {
#ifdef ARDUINO
    uint32_t now = millis();

    // 1. Periodic Sensor Acquisition
    if (now - m_last_sample_time >= (m_config.sampling_interval_sec * 1000)) {
        m_last_sample_time = now;
        triggerSensorSample();
    }

    // 2. Periodic Telemetry Transmission
    if (now - m_last_telemetry_time >= (m_config.telemetry_interval_sec * 1000)) {
        m_last_telemetry_time = now;
        triggerTelemetryTransmit();
    }

    // 3. Periodic Heartbeat Ping
    if (now - m_last_heartbeat_time >= (m_config.heartbeat_interval_sec * 1000)) {
        m_last_heartbeat_time = now;
        triggerHeartbeat();
    }

    // 4. Background Wi-Fi Reconnection check (every 30s if disconnected)
    if (!m_wifi_mgr->isConnected() && (now - m_last_wifi_retry_time >= 30000)) {
        m_last_wifi_retry_time = now;
        if (m_wifi_mgr->connect()) {
            m_state = DeviceState::ONLINE;
            flushOfflineBuffer(); // Flush any pending buffered telemetry
        }
    }
#endif
}
