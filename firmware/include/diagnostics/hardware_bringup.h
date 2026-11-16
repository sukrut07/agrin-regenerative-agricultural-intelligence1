#ifndef AGRISENSE_HARDWARE_BRINGUP_H
#define AGRISENSE_HARDWARE_BRINGUP_H

#include <stdint.h>
#include <string>
#include <vector>

/**
 * ============================================================================
 * AgriSense Hardware Bring-Up & Controlled Commissioning Diagnostics
 * ============================================================================
 * 
 * Target: Prototype Unit 01 (ESP32-DevKit-V1)
 * Rules:
 *  1. Zero sensor excitation or analog sampling unless explicitly authorized.
 *  2. Distinguishes NOT_CONNECTED, NOT_INITIALIZED, INVALID_READING, VALID_READING.
 *  3. Masks all credentials, API keys, and tokens in serial output.
 *  4. Fully cross-compiles on both 'esp32dev' and 'native' target platforms.
 */

namespace AgriSenseDiagnostics {

enum class SensorType {
    SOIL_MOISTURE = 0,
    SOIL_TEMPERATURE,
    SOIL_PH,
    SOIL_EC,
    SOIL_NPK,
    SENSOR_TYPE_COUNT
};

enum class SensorFaultState {
    NOT_CONNECTED = 0,
    NOT_INITIALIZED,
    AWAITING_VOLTAGE_VERIFICATION,
    INVALID_READING,
    VALID_READING,
    VOLTAGE_FAULT,
    COMMUNICATION_TIMEOUT
};

struct SensorChannelStatus {
    SensorType type;
    const char* name;
    bool enabled;
    bool hardware_verified;
    bool calibrated;
    SensorFaultState fault_state;
    float last_raw;
    float last_calibrated;
    char unit[16];
    uint32_t last_sample_time_ms;
    char last_error_msg[64];
};

struct SystemInfo {
    char chip_model[32];
    uint32_t chip_revision;
    uint32_t cpu_freq_mhz;
    uint32_t flash_size_mb;
    uint32_t free_heap_bytes;
    uint32_t min_free_heap_bytes;
    char reset_reason[32];
    char mac_address[24];
    char firmware_version[16];
};

struct I2CScanResult {
    uint8_t address;
    bool acknowledged;
    char device_description[48];
};

class HardwareBringup {
public:
    static HardwareBringup& getInstance();

    // Initialization & lifecycle
    void init();
    void processSerialCommands();

    // System inspection
    SystemInfo getSystemInfo();
    void printStartupBanner();
    void printSystemStatus();

    // Peripheral diagnostics
    std::vector<I2CScanResult> scanI2CBus();
    bool testADS1115Presence();
    bool testDS18B20Presence(std::string& out_rom_id);
    bool testRS485Interface();
    bool readBatteryVoltage(float& out_v_adc, float& out_v_batt, float& out_pct);

    // Controlled sensor activation mechanism (Task 4)
    bool isSensorEnabled(SensorType type) const;
    bool verifyHardwareSafety(SensorType type, bool verified);
    bool enableSensor(SensorType type, const std::string& confirm_token);
    bool disableSensor(SensorType type);
    bool sampleSensor(SensorType type, SensorChannelStatus& out_status);

    const SensorChannelStatus& getSensorStatus(SensorType type) const;
    std::string getSensorFaultString(SensorFaultState state) const;

    // Command dispatcher (Task 7)
    std::string executeCommand(const std::string& command_line);

    // Masking utility for safe logging
    static std::string maskSecret(const std::string& secret);

private:
    HardwareBringup();
    ~HardwareBringup() = default;

    HardwareBringup(const HardwareBringup&) = delete;
    HardwareBringup& operator=(const HardwareBringup&) = delete;

    SensorChannelStatus m_sensors[static_cast<size_t>(SensorType::SENSOR_TYPE_COUNT)];
    bool m_initialized;
    bool m_ads1115_detected;
    bool m_ds18b20_detected;
    std::string m_serial_input_buffer;

    void registerDefaultSensorStates();
};

} // namespace AgriSenseDiagnostics

#endif // AGRISENSE_HARDWARE_BRINGUP_H