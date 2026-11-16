#include "diagnostics/hardware_bringup.h"
#include "pins.h"
#include "config.h"
#include "calibration.h"

#include <cstdio>
#include <cstring>
#include <algorithm>
#include <sstream>

#ifdef ARDUINO
#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <esp_system.h>
#include <esp_chip_info.h>
#endif

namespace AgriSenseDiagnostics {

static const char* SENSOR_NAMES[] = {
    "SOIL_MOISTURE",
    "SOIL_TEMPERATURE",
    "SOIL_PH",
    "SOIL_EC",
    "SOIL_NPK"
};

static const char* SENSOR_UNITS[] = {
    "%",
    "celsius",
    "pH",
    "dS/m",
    "mg/kg"
};

HardwareBringup& HardwareBringup::getInstance() {
    static HardwareBringup s_instance;
    return s_instance;
}

HardwareBringup::HardwareBringup()
    : m_initialized(false),
      m_ads1115_detected(false),
      m_ds18b20_detected(false) {
    registerDefaultSensorStates();
}

void HardwareBringup::registerDefaultSensorStates() {
    for (size_t i = 0; i < static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT); ++i) {
        m_sensors[i].type = static_cast<SensorType>(i);
        m_sensors[i].name = SENSOR_NAMES[i];
        m_sensors[i].enabled = false; // SAFE DEFAULT: ALL DISABLED
        m_sensors[i].hardware_verified = false;
        m_sensors[i].calibrated = false;
        m_sensors[i].fault_state = SensorFaultState::AWAITING_VOLTAGE_VERIFICATION;
        m_sensors[i].last_raw = 0.0f;
        m_sensors[i].last_calibrated = 0.0f;
        strncpy(m_sensors[i].unit, SENSOR_UNITS[i], sizeof(m_sensors[i].unit) - 1);
        m_sensors[i].last_sample_time_ms = 0;
        strncpy(m_sensors[i].last_error_msg, "Sensor disabled - awaiting physical electrical verification", sizeof(m_sensors[i].last_error_msg) - 1);
    }
}

void HardwareBringup::init() {
#ifdef ARDUINO
    // Configure RS485 direction pin as output and FORCE LOW (Receiver mode)
    pinMode(PIN_RS485_DE_RE, OUTPUT);
    digitalWrite(PIN_RS485_DE_RE, LOW);

    // Initialize I2C Bus on standard ESP32 pins
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

    // Configure battery ADC pin
    pinMode(PIN_BATTERY_ADC, INPUT);
#endif

    m_initialized = true;
    m_ads1115_detected = testADS1115Presence();
    std::string rom_id;
    m_ds18b20_detected = testDS18B20Presence(rom_id);
}

SystemInfo HardwareBringup::getSystemInfo() {
    SystemInfo info;
    memset(&info, 0, sizeof(info));
    strncpy(info.firmware_version, AGRISENSE_FW_VERSION, sizeof(info.firmware_version) - 1);

#ifdef ARDUINO
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);

    snprintf(info.chip_model, sizeof(info.chip_model), "ESP32 (Cores: %d)", chip_info.cores);
    info.chip_revision = chip_info.revision;
    info.cpu_freq_mhz = getCpuFrequencyMhz();
    info.flash_size_mb = spi_flash_get_chip_size() / (1024 * 1024);
    info.free_heap_bytes = esp_get_free_heap_size();
    info.min_free_heap_bytes = esp_get_minimum_free_heap_size();

    esp_reset_reason_t reason = esp_reset_reason();
    switch (reason) {
        case ESP_RST_POWERON:   strncpy(info.reset_reason, "POWERON_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_SW:        strncpy(info.reset_reason, "SOFTWARE_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_PANIC:     strncpy(info.reset_reason, "PANIC_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_INT_WDT:   strncpy(info.reset_reason, "INT_WDT_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_TASK_WDT:  strncpy(info.reset_reason, "TASK_WDT_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_DEEPSLEEP: strncpy(info.reset_reason, "DEEP_SLEEP_RESET", sizeof(info.reset_reason) - 1); break;
        case ESP_RST_BROWNOUT:  strncpy(info.reset_reason, "BROWNOUT_RESET", sizeof(info.reset_reason) - 1); break;
        default:                snprintf(info.reset_reason, sizeof(info.reset_reason), "RESET_CODE_%d", (int)reason); break;
    }

    String mac = WiFi.macAddress();
    strncpy(info.mac_address, mac.c_str(), sizeof(info.mac_address) - 1);
#else
    strncpy(info.chip_model, "ESP32-WROOM-32 (Native Sim)", sizeof(info.chip_model) - 1);
    info.chip_revision = 1;
    info.cpu_freq_mhz = 240;
    info.flash_size_mb = 4;
    info.free_heap_bytes = 184320;
    info.min_free_heap_bytes = 160000;
    strncpy(info.reset_reason, "POWERON_RESET", sizeof(info.reset_reason) - 1);
    strncpy(info.mac_address, "A4:CF:12:88:5A:01", sizeof(info.mac_address) - 1);
#endif

    return info;
}

void HardwareBringup::printStartupBanner() {
#ifdef ARDUINO
    SystemInfo sys = getSystemInfo();
    Serial.println("\r\n==================================================================");
    Serial.println("  AGRISENSE IOT PROTOTYPE UNIT 01 — CONTROLLED BRING-UP HARNESS  ");
    Serial.println("==================================================================");
    Serial.printf ("  Firmware Version : %s\r\n", sys.firmware_version);
    Serial.printf ("  Chip Model       : %s (Rev %u)\r\n", sys.chip_model, sys.chip_revision);
    Serial.printf ("  CPU Frequency    : %u MHz\r\n", sys.cpu_freq_mhz);
    Serial.printf ("  Flash Size       : %u MB\r\n", sys.flash_size_mb);
    Serial.printf ("  Reset Reason     : %s\r\n", sys.reset_reason);
    Serial.printf ("  Device MAC       : %s\r\n", sys.mac_address);
    Serial.printf ("  Free Heap        : %u bytes (Min: %u bytes)\r\n", sys.free_heap_bytes, sys.min_free_heap_bytes);
    Serial.println("------------------------------------------------------------------");
    Serial.println("  SAFETY STATE: All analog sensor acquisitions are DISABLED by default.");
    Serial.println("  Type 'HELP' for diagnostic command list.");
    Serial.println("==================================================================\r\n");
#endif
}

std::vector<I2CScanResult> HardwareBringup::scanI2CBus() {
    std::vector<I2CScanResult> results;
#ifdef ARDUINO
    for (uint8_t addr = 1; addr < 127; ++addr) {
        Wire.beginTransmission(addr);
        uint8_t err = Wire.endTransmission();
        if (err == 0) {
            I2CScanResult res;
            res.address = addr;
            res.acknowledged = true;
            if (addr == 0x48) {
                strncpy(res.device_description, "ADS1115 ADC (ADDR=GND)", sizeof(res.device_description) - 1);
            } else if (addr == 0x49) {
                strncpy(res.device_description, "ADS1115 ADC (ADDR=VDD)", sizeof(res.device_description) - 1);
            } else if (addr == 0x4A) {
                strncpy(res.device_description, "ADS1115 ADC (ADDR=SDA)", sizeof(res.device_description) - 1);
            } else if (addr == 0x4B) {
                strncpy(res.device_description, "ADS1115 ADC (ADDR=SCL)", sizeof(res.device_description) - 1);
            } else if (addr == 0x3C || addr == 0x3D) {
                strncpy(res.device_description, "OLED Display SSD1306", sizeof(res.device_description) - 1);
            } else if (addr == 0x68) {
                strncpy(res.device_description, "DS3231 RTC / MPU6050", sizeof(res.device_description) - 1);
            } else {
                snprintf(res.device_description, sizeof(res.device_description), "Generic I2C Device (0x%02X)", addr);
            }
            results.push_back(res);
        }
    }
#else
    // Simulated scan for native builds
    I2CScanResult sim;
    sim.address = 0x48;
    sim.acknowledged = true;
    strncpy(sim.device_description, "ADS1115 ADC (ADDR=GND) [Simulated]", sizeof(sim.device_description) - 1);
    results.push_back(sim);
#endif
    return results;
}

bool HardwareBringup::testADS1115Presence() {
#ifdef ARDUINO
    Wire.beginTransmission(ADS1115_I2C_ADDR);
    uint8_t err = Wire.endTransmission();
    m_ads1115_detected = (err == 0);
    return m_ads1115_detected;
#else
    m_ads1115_detected = true;
    return true;
#endif
}

bool HardwareBringup::testDS18B20Presence(std::string& out_rom_id) {
#ifdef ARDUINO
    OneWire ow(PIN_ONEWIRE_TEMP);
    uint8_t addr[8];
    ow.reset_search();
    if (!ow.search(addr)) {
        ow.reset_search();
        out_rom_id = "NOT_FOUND";
        m_ds18b20_detected = false;
        return false;
    }

    if (OneWire::crc8(addr, 7) != addr[7]) {
        out_rom_id = "CRC_ERROR";
        m_ds18b20_detected = false;
        return false;
    }

    char buf[20];
    snprintf(buf, sizeof(buf), "%02X%02X%02X%02X%02X%02X%02X%02X",
             addr[0], addr[1], addr[2], addr[3], addr[4], addr[5], addr[6], addr[7]);
    out_rom_id = std::string(buf);
    m_ds18b20_detected = true;
    return true;
#else
    out_rom_id = "28FF4A12881501C4";
    m_ds18b20_detected = true;
    return true;
#endif
}

bool HardwareBringup::testRS485Interface() {
#ifdef ARDUINO
    pinMode(PIN_RS485_DE_RE, OUTPUT);
    digitalWrite(PIN_RS485_DE_RE, LOW); // Confirm receiver mode
    return true;
#else
    return true;
#endif
}

bool HardwareBringup::readBatteryVoltage(float& out_v_adc, float& out_v_batt, float& out_pct) {
#ifdef ARDUINO
    uint32_t mv = analogReadMilliVolts(PIN_BATTERY_ADC);
    out_v_adc = mv / 1000.0f;
    CalibrationMath::computeBattery(out_v_adc, BATTERY_DIVIDER_RATIO, out_v_batt, out_pct);
    return (out_v_batt >= 2.50f && out_v_batt <= 4.40f);
#else
    out_v_adc = 1.90f;
    out_v_batt = 3.80f;
    out_pct = 75.0f;
    return true;
#endif
}

bool HardwareBringup::isSensorEnabled(SensorType type) const {
    size_t idx = static_cast<size_t>(type);
    if (idx >= static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)) return false;
    return m_sensors[idx].enabled;
}

bool HardwareBringup::verifyHardwareSafety(SensorType type, bool verified) {
    size_t idx = static_cast<size_t>(type);
    if (idx >= static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)) return false;
    m_sensors[idx].hardware_verified = verified;
    if (verified) {
        m_sensors[idx].fault_state = SensorFaultState::NOT_INITIALIZED;
        strncpy(m_sensors[idx].last_error_msg, "Hardware verified safe. Ready to enable.", sizeof(m_sensors[idx].last_error_msg) - 1);
    } else {
        m_sensors[idx].enabled = false;
        m_sensors[idx].fault_state = SensorFaultState::AWAITING_VOLTAGE_VERIFICATION;
        strncpy(m_sensors[idx].last_error_msg, "Hardware safety unverified - acquisition locked", sizeof(m_sensors[idx].last_error_msg) - 1);
    }
    return true;
}

bool HardwareBringup::enableSensor(SensorType type, const std::string& confirm_token) {
    size_t idx = static_cast<size_t>(type);
    if (idx >= static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)) return false;

    // Safety Interlock: Explicit confirmation token required
    if (confirm_token != "CONFIRM_VOLTAGE_VERIFIED") {
        strncpy(m_sensors[idx].last_error_msg, "ERROR: Invalid confirmation token", sizeof(m_sensors[idx].last_error_msg) - 1);
        return false;
    }

    // Safety Interlock: Must be pre-verified by technician
    if (!m_sensors[idx].hardware_verified) {
        strncpy(m_sensors[idx].last_error_msg, "ERROR: Hardware voltage check not completed", sizeof(m_sensors[idx].last_error_msg) - 1);
        return false;
    }

    m_sensors[idx].enabled = true;
    m_sensors[idx].fault_state = SensorFaultState::VALID_READING;
    strncpy(m_sensors[idx].last_error_msg, "None (Operational)", sizeof(m_sensors[idx].last_error_msg) - 1);
    return true;
}

bool HardwareBringup::disableSensor(SensorType type) {
    size_t idx = static_cast<size_t>(type);
    if (idx >= static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)) return false;
    m_sensors[idx].enabled = false;
    m_sensors[idx].fault_state = SensorFaultState::NOT_INITIALIZED;
    strncpy(m_sensors[idx].last_error_msg, "Sensor disabled by operator command", sizeof(m_sensors[idx].last_error_msg) - 1);
    return true;
}

const SensorChannelStatus& HardwareBringup::getSensorStatus(SensorType type) const {
    size_t idx = static_cast<size_t>(type);
    if (idx >= static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)) {
        return m_sensors[0];
    }
    return m_sensors[idx];
}

std::string HardwareBringup::getSensorFaultString(SensorFaultState state) const {
    switch (state) {
        case SensorFaultState::NOT_CONNECTED: return "NOT_CONNECTED";
        case SensorFaultState::NOT_INITIALIZED: return "NOT_INITIALIZED";
        case SensorFaultState::AWAITING_VOLTAGE_VERIFICATION: return "AWAITING_VOLTAGE_VERIFICATION";
        case SensorFaultState::INVALID_READING: return "INVALID_READING";
        case SensorFaultState::VALID_READING: return "VALID_READING";
        case SensorFaultState::VOLTAGE_FAULT: return "VOLTAGE_FAULT";
        case SensorFaultState::COMMUNICATION_TIMEOUT: return "COMMUNICATION_TIMEOUT";
        default: return "UNKNOWN_FAULT";
    }
}

std::string HardwareBringup::maskSecret(const std::string& secret) {
    if (secret.length() <= 4) {
        return "****";
    }
    std::string masked = secret.substr(0, 2);
    masked.append(secret.length() - 4, '*');
    masked.append(secret.substr(secret.length() - 2, 2));
    return masked;
}

std::string HardwareBringup::executeCommand(const std::string& command_line) {
    std::istringstream iss(command_line);
    std::string cmd;
    iss >> cmd;
    std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::toupper);

    if (cmd == "HELP") {
        std::ostringstream oss;
        oss << "Available Diagnostic Commands:\r\n"
            << "  HELP                     - Show this list\r\n"
            << "  INFO                     - Display ESP32 chip & system details\r\n"
            << "  STATUS                   - Report overall system and sensor state\r\n"
            << "  I2C_SCAN                 - Scan I2C bus (GPIO 21/22) for connected devices\r\n"
            << "  ADS_STATUS               - Check ADS1115 ADC communication & presence\r\n"
            << "  TEMP_STATUS              - Query DS18B20 1-Wire temperature sensor\r\n"
            << "  RS485_STATUS             - Inspect MAX3485 DE/RE control pin state\r\n"
            << "  BATTERY_STATUS           - Sample battery voltage via calibrated ADC1\r\n"
            << "  WIFI_STATUS              - Inspect Wi-Fi link state (Credentials masked)\r\n"
            << "  BACKEND_STATUS           - Ingestion API endpoint status (Token masked)\r\n"
            << "  SENSOR_VERIFY <NAME>     - Mark sensor hardware verified (MOISTURE, TEMP, PH, EC, NPK)\r\n"
            << "  SENSOR_ENABLE <NAME> <TOKEN> - Enable sensor (Requires token: CONFIRM_VOLTAGE_VERIFIED)\r\n"
            << "  SENSOR_DISABLE <NAME>    - Disable sensor acquisition\r\n";
        return oss.str();
    } else if (cmd == "INFO") {
        SystemInfo sys = getSystemInfo();
        std::ostringstream oss;
        oss << "System Hardware Info:\r\n"
            << "  Firmware Version : " << sys.firmware_version << "\r\n"
            << "  Chip Model       : " << sys.chip_model << " (Rev " << sys.chip_revision << ")\r\n"
            << "  CPU Frequency    : " << sys.cpu_freq_mhz << " MHz\r\n"
            << "  Flash Size       : " << sys.flash_size_mb << " MB\r\n"
            << "  Reset Reason     : " << sys.reset_reason << "\r\n"
            << "  MAC Address      : " << sys.mac_address << "\r\n"
            << "  Free Heap Bytes  : " << sys.free_heap_bytes << " (Min: " << sys.min_free_heap_bytes << ")\r\n";
        return oss.str();
    } else if (cmd == "STATUS") {
        std::ostringstream oss;
        oss << "AgriSense Subsystem Readiness Status:\r\n";
        for (size_t i = 0; i < static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT); ++i) {
            oss << "  [" << m_sensors[i].name << "]: "
                << (m_sensors[i].enabled ? "ENABLED" : "DISABLED")
                << " | Safety Verified: " << (m_sensors[i].hardware_verified ? "YES" : "NO")
                << " | State: " << getSensorFaultString(m_sensors[i].fault_state) << "\r\n"
                << "      Status Msg: " << m_sensors[i].last_error_msg << "\r\n";
        }
        return oss.str();
    } else if (cmd == "I2C_SCAN") {
        auto devices = scanI2CBus();
        std::ostringstream oss;
        oss << "I2C Bus Scan Results (SDA=GPIO " << PIN_I2C_SDA << ", SCL=GPIO " << PIN_I2C_SCL << "):\r\n";
        if (devices.empty()) {
            oss << "  No I2C devices responded! Check pull-ups and power connections.\r\n";
        } else {
            for (const auto& dev : devices) {
                char buf[16];
                snprintf(buf, sizeof(buf), "0x%02X", dev.address);
                oss << "  - Found device at " << buf << " -> " << dev.device_description << "\r\n";
            }
        }
        return oss.str();
    } else if (cmd == "ADS_STATUS") {
        bool present = testADS1115Presence();
        std::ostringstream oss;
        oss << "ADS1115 External ADC Interface:\r\n"
            << "  Address       : 0x48 (ADDR tied to GND)\r\n"
            << "  I2C ACK       : " << (present ? "ACKNOWLEDGED (SUCCESS)" : "NO ACK (FAULT)") << "\r\n"
            << "  VDD Voltage   : Must be 3.3V (NEVER 5.0V!)\r\n"
            << "  Max Safe Vin  : 3.60V\r\n";
        return oss.str();
    } else if (cmd == "TEMP_STATUS") {
        std::string rom_id;
        bool found = testDS18B20Presence(rom_id);
        std::ostringstream oss;
        oss << "DS18B20 1-Wire Temperature Interface:\r\n"
            << "  Pin           : GPIO " << PIN_ONEWIRE_TEMP << " (4.7 kOhm pull-up required)\r\n"
            << "  Probe Found   : " << (found ? "YES" : "NO") << "\r\n"
            << "  64-bit ROM ID : " << rom_id << "\r\n";
        return oss.str();
    } else if (cmd == "RS485_STATUS") {
        std::ostringstream oss;
        oss << "RS485 / MAX3485 Interface:\r\n"
            << "  UART Port     : UART2 (RX=GPIO " << PIN_RS485_RX << ", TX=GPIO " << PIN_RS485_TX << ")\r\n"
            << "  Direction Pin : GPIO " << PIN_RS485_DE_RE << " (Active HIGH = TX, LOW = RX)\r\n"
            << "  Boot Pull-Down: 10 kOhm to GND mandatory\r\n"
            << "  Current Mode  : RECEIVE (Safe default)\r\n";
        return oss.str();
    } else if (cmd == "BATTERY_STATUS") {
        float vadc = 0.0f, vbatt = 0.0f, pct = 0.0f;
        readBatteryVoltage(vadc, vbatt, pct);
        std::ostringstream oss;
        oss << "Battery Voltage Monitor:\r\n"
            << "  ADC Channel   : GPIO " << PIN_BATTERY_ADC << " (ADC1_CH6)\r\n"
            << "  Pin Voltage   : " << vadc << " V\r\n"
            << "  Battery Volt  : " << vbatt << " V\r\n"
            << "  Est. State    : " << pct << " %\r\n";
        return oss.str();
    } else if (cmd == "SENSOR_VERIFY") {
        std::string name;
        iss >> name;
        std::transform(name.begin(), name.end(), name.begin(), ::toupper);
        for (size_t i = 0; i < static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT); ++i) {
            if (name == SENSOR_NAMES[i] || (name == "MOISTURE" && i == 0) || (name == "TEMP" && i == 1) || (name == "PH" && i == 2) || (name == "EC" && i == 3) || (name == "NPK" && i == 4)) {
                verifyHardwareSafety(static_cast<SensorType>(i), true);
                return std::string("Hardware safety verified for sensor: ") + SENSOR_NAMES[i] + "\r\n";
            }
        }
        return "ERROR: Unknown sensor name. Use MOISTURE, TEMP, PH, EC, or NPK.\r\n";
    } else if (cmd == "SENSOR_ENABLE") {
        std::string name, token;
        iss >> name >> token;
        std::transform(name.begin(), name.end(), name.begin(), ::toupper);
        for (size_t i = 0; i < static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT); ++i) {
            if (name == SENSOR_NAMES[i] || (name == "MOISTURE" && i == 0) || (name == "TEMP" && i == 1) || (name == "PH" && i == 2) || (name == "EC" && i == 3) || (name == "NPK" && i == 4)) {
                if (enableSensor(static_cast<SensorType>(i), token)) {
                    return std::string("SUCCESS: Sensor enabled: ") + SENSOR_NAMES[i] + "\r\n";
                } else {
                    return std::string("FAILED: ") + m_sensors[i].last_error_msg + "\r\n";
                }
            }
        }
        return "ERROR: Unknown sensor name.\r\n";
    } else if (cmd == "SENSOR_DISABLE") {
        std::string name;
        iss >> name;
        std::transform(name.begin(), name.end(), name.begin(), ::toupper);
        for (size_t i = 0; i < static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT); ++i) {
            if (name == SENSOR_NAMES[i] || (name == "MOISTURE" && i == 0) || (name == "TEMP" && i == 1) || (name == "PH" && i == 2) || (name == "EC" && i == 3) || (name == "NPK" && i == 4)) {
                disableSensor(static_cast<SensorType>(i));
                return std::string("Sensor disabled: ") + SENSOR_NAMES[i] + "\r\n";
            }
        }
        return "ERROR: Unknown sensor name.\r\n";
    }

    return "Unknown command. Type 'HELP' for valid commands.\r\n";
}

void HardwareBringup::processSerialCommands() {
#ifdef ARDUINO
    while (Serial.available()) {
        char c = static_cast<char>(Serial.read());
        if (c == '\r' || c == '\n') {
            if (!m_serial_input_buffer.empty()) {
                std::string response = executeCommand(m_serial_input_buffer);
                Serial.print(response.c_str());
                m_serial_input_buffer.clear();
            }
        } else {
            if (m_serial_input_buffer.length() < 128) {
                m_serial_input_buffer.push_back(c);
            }
        }
    }
#endif
}

} // namespace AgriSenseDiagnostics