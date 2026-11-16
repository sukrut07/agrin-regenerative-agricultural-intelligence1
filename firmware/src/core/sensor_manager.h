#ifndef AGRISENSE_SENSOR_MANAGER_H
#define AGRISENSE_SENSOR_MANAGER_H

#include <vector>
#include <memory>
#include "sensor_types.h"
#include "device_config.h"
#include "../sensors/moisture_sensor.h"
#include "../sensors/temperature_sensor.h"
#include "../sensors/ph_sensor.h"
#include "../sensors/ec_sensor.h"
#include "../sensors/npk_sensor.h"

class SensorManager {
public:
    SensorManager();

    bool init(const DeviceConfig& config);
    std::vector<SensorMeasurement> sampleAll(float& out_soil_temp);
    std::vector<std::pair<std::string, std::string>> getSensorStatuses() const;

    void updateCalibrations(const DeviceConfig& config);
    void setSimulationMode(bool enable_sim);

private:
    std::unique_ptr<MoistureSensor> m_moisture;
    std::unique_ptr<TemperatureSensor> m_temp;
    std::unique_ptr<PhSensor> m_ph;
    std::unique_ptr<EcSensor> m_ec;
    std::unique_ptr<NpkSensor> m_npk;

    bool m_npk_enabled;
    bool m_simulation_mode;
};

#endif // AGRISENSE_SENSOR_MANAGER_H
