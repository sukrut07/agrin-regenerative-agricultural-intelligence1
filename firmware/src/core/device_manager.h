#ifndef AGRISENSE_DEVICE_MANAGER_H
#define AGRISENSE_DEVICE_MANAGER_H

#include <memory>
#include <string>
#include "device_config.h"
#include "sensor_manager.h"
#include "diagnostics.h"
#include "../communication/wifi_manager.h"
#include "../communication/http_client.h"
#include "../communication/authentication.h"
#include "../storage/telemetry_buffer.h"
#include "../power/battery_monitor.h"

enum class DeviceState {
    BOOT,
    INIT_SENSORS,
    CONNECTING_WIFI,
    ONLINE,
    OFFLINE_BUFFERING,
    TRANSMITTING,
    ERROR_RECOVERY
};

class DeviceManager {
public:
    DeviceManager();

    bool setup();
    void loop();

    // Trigger individual cycles programmatically (for testing)
    bool triggerSensorSample();
    bool triggerTelemetryTransmit();
    bool triggerHeartbeat();

    DeviceState getState() const { return m_state; }
    const DeviceConfig& getConfig() const { return m_config; }

private:
    DeviceConfig m_config;
    DeviceState m_state;
    uint32_t m_sequence_counter;

    // Subsystems
    std::unique_ptr<SensorManager> m_sensor_mgr;
    std::unique_ptr<Diagnostics> m_diagnostics;
    std::unique_ptr<WifiManager> m_wifi_mgr;
    std::unique_ptr<Authentication> m_auth;
    std::unique_ptr<HttpClient> m_http_client;
    std::unique_ptr<TelemetryBuffer> m_buffer;
    std::unique_ptr<BatteryMonitor> m_battery;

    // Timers (in ms)
    uint32_t m_last_sample_time;
    uint32_t m_last_telemetry_time;
    uint32_t m_last_heartbeat_time;
    uint32_t m_last_wifi_retry_time;

    void flushOfflineBuffer();
    std::string getCurrentIsoTimestamp();
};

#endif // AGRISENSE_DEVICE_MANAGER_H
