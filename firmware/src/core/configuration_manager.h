#ifndef AGRISENSE_CONFIGURATION_MANAGER_H
#define AGRISENSE_CONFIGURATION_MANAGER_H

#include "device_config.h"

class ConfigurationManager {
public:
    ConfigurationManager();

    bool load(DeviceConfig& out_config);
    bool save(const DeviceConfig& config);
    bool resetToDefaults(DeviceConfig& out_config);

private:
    bool m_is_loaded;
};

#endif // AGRISENSE_CONFIGURATION_MANAGER_H
