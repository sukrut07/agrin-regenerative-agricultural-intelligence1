#include "sensor_manager.h"
#include "pins.h"

#ifdef ARDUINO
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>
Adafruit_ADS1115 g_ads;
bool g_ads_initialized = false;
#endif

SensorManager::SensorManager()
    : m_npk_enabled(false),
      m_simulation_mode(false) {}

bool SensorManager::init(const DeviceConfig& config) {
    m_simulation_mode = config.enable_simulation_mode;
    m_npk_enabled = config.enable_npk;

#ifdef ARDUINO
    // Initialize I2C Bus on GPIO 21 (SDA) and GPIO 22 (SCL)
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    // Initialize ADS1115 external ADC at address 0x48
    if (g_ads.begin(ADS1115_I2C_ADDR)) {
        g_ads_initialized = true;
        // 2/3x gain +/- 6.144V 1 bit = 0.1875mV (suitable for 3.3V and 5V modules)
        g_ads.setGain(GAIN_TWOTHIRDS);
    } else {
        g_ads_initialized = false;
    }
#endif

    // Instantiate modular sensor drivers
    m_moisture = std::unique_ptr<MoistureSensor>(new MoistureSensor("moisture-01", config.calib_moisture, ADS1115_CH_SOIL_MOISTURE));
    m_temp = std::unique_ptr<TemperatureSensor>(new TemperatureSensor("ds18b20-01", PIN_ONEWIRE_TEMP));
    m_ph = std::unique_ptr<PhSensor>(new PhSensor("ph-01", config.calib_ph, ADS1115_CH_SOIL_PH));
    m_ec = std::unique_ptr<EcSensor>(new EcSensor("ec-01", config.calib_ec, ADS1115_CH_SOIL_EC));

    NpkRegisters npk_regs;
    m_npk = std::unique_ptr<NpkSensor>(new NpkSensor(PIN_RS485_RX, PIN_RS485_TX, PIN_RS485_DE_RE, npk_regs));

    // Initialize all attached drivers
    m_moisture->init();
    m_temp->init();
    m_ph->init();
    m_ec->init();
    m_npk->init();

    return true;
}

void SensorManager::setSimulationMode(bool enable_sim) {
    m_simulation_mode = enable_sim;
    if (m_moisture) m_moisture->setSimulatedReading(2100.0f, enable_sim);
    if (m_temp) m_temp->setSimulatedReading(24.5f, enable_sim);
    if (m_ph) m_ph->setSimulatedReading(2.45f, enable_sim);
    if (m_ec) m_ec->setSimulatedReading(0.55f, enable_sim);
}

void SensorManager::updateCalibrations(const DeviceConfig& config) {
    if (m_moisture) m_moisture->updateCalibration(config.calib_moisture);
    if (m_ph) m_ph->updateCalibration(config.calib_ph);
    if (m_ec) m_ec->updateCalibration(config.calib_ec);
    m_npk_enabled = config.enable_npk;
}

std::vector<SensorMeasurement> SensorManager::sampleAll(float& out_soil_temp) {
    std::vector<SensorMeasurement> measurements;

    // 1. Sample Temperature first, as pH and EC calibration models require soil temperature compensation
    SensorMeasurement temp_m;
    if (m_temp) {
        temp_m = m_temp->sample();
        out_soil_temp = temp_m.is_valid ? temp_m.calibrated_value : 25.0f;
        measurements.push_back(temp_m);
    } else {
        out_soil_temp = 25.0f;
    }

    // 2. Sample Capacitive Soil Moisture
    if (m_moisture) {
        measurements.push_back(m_moisture->sample(out_soil_temp));
    }

    // 3. Sample Soil pH (temperature compensated)
    if (m_ph) {
        measurements.push_back(m_ph->sample(out_soil_temp));
    }

    // 4. Sample Soil EC (normalized to 25°C)
    if (m_ec) {
        measurements.push_back(m_ec->sample(out_soil_temp));
    }

    // 5. Sample NPK Modbus (returns 3 measurements: N, P, K)
    if (m_npk) {
        auto npk_meas = m_npk->sampleAll(m_npk_enabled);
        for (auto& item : npk_meas) {
            measurements.push_back(item);
        }
    }

    return measurements;
}

std::vector<std::pair<std::string, std::string>> SensorManager::getSensorStatuses() const {
    std::vector<std::pair<std::string, std::string>> statuses;

    statuses.push_back({"SOIL_TEMP", (m_temp && m_temp->isAvailable()) ? "OK" : "ERROR"});
    statuses.push_back({"SOIL_MOISTURE", (m_moisture && m_moisture->isAvailable()) ? "OK" : "ERROR"});
    statuses.push_back({"SOIL_PH", (m_ph && m_ph->isAvailable()) ? "OK" : "ERROR"});
    statuses.push_back({"SOIL_EC", (m_ec && m_ec->isAvailable()) ? "OK" : "ERROR"});
    statuses.push_back({"NPK", m_npk_enabled ? ((m_npk && m_npk->isAvailable()) ? "OK" : "ERROR") : "DISABLED"});

    return statuses;
}
