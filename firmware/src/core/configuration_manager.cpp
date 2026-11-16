#include "configuration_manager.h"

#ifdef ARDUINO
#include <Arduino.h>
#include <Preferences.h>
static Preferences g_prefs;
#endif

ConfigurationManager::ConfigurationManager()
    : m_is_loaded(false) {}

bool ConfigurationManager::load(DeviceConfig& out_config) {
    // 1. Establish hardcoded default safe baseline
    out_config.device_id = "agrisense-dev-001";
    out_config.api_key = "agrisense_sec_default";
    out_config.farm_id = "farm-parbhani-01";
    out_config.field_id = "field-cotton-north";
    out_config.device_name = "AgriSense-Field-Probe";
    out_config.firmware_version = "2.0.0";
    out_config.hardware_profile = "ESP32-DevKit-V1-Standard";

    out_config.wifi_ssid = "AgriNet-Farm-WiFi";
    out_config.wifi_password = ""; // Secure default: no hardcoded credentials
    out_config.api_base_url = "http://192.168.1.100:8000";

    out_config.sampling_interval_sec = 60;
    out_config.telemetry_interval_sec = 300;
    out_config.heartbeat_interval_sec = 120;

    out_config.enable_moisture = true;
    out_config.enable_temperature = true;
    out_config.enable_ph = true;
    out_config.enable_ec = true;
    out_config.enable_npk = false; // Disabled by default until RS485 probe attached
    out_config.enable_simulation_mode = false;

    // Default calibration parameters
    out_config.calib_moisture.raw_dry = 2850.0f;
    out_config.calib_moisture.raw_wet = 1350.0f;
    out_config.calib_ph.v_ph4 = 2.95f;
    out_config.calib_ph.v_ph7 = 2.45f;
    out_config.calib_ec.v_calib_1413 = 1.45f;

#ifdef ARDUINO
    // 2. Read from persistent non-volatile storage (NVS) if provisioned
    if (g_prefs.begin("agrisense_cfg", true)) { // Read-only mode
        if (g_prefs.isKey("device_id")) out_config.device_id = g_prefs.getString("device_id", out_config.device_id.c_str()).c_str();
        if (g_prefs.isKey("api_key")) out_config.api_key = g_prefs.getString("api_key", out_config.api_key.c_str()).c_str();
        if (g_prefs.isKey("farm_id")) out_config.farm_id = g_prefs.getString("farm_id", out_config.farm_id.c_str()).c_str();
        if (g_prefs.isKey("field_id")) out_config.field_id = g_prefs.getString("field_id", out_config.field_id.c_str()).c_str();
        if (g_prefs.isKey("wifi_ssid")) out_config.wifi_ssid = g_prefs.getString("wifi_ssid", out_config.wifi_ssid.c_str()).c_str();
        if (g_prefs.isKey("wifi_pass")) out_config.wifi_password = g_prefs.getString("wifi_pass", out_config.wifi_password.c_str()).c_str();
        if (g_prefs.isKey("api_url")) out_config.api_base_url = g_prefs.getString("api_url", out_config.api_base_url.c_str()).c_str();

        if (g_prefs.isKey("cal_m_dry")) out_config.calib_moisture.raw_dry = g_prefs.getFloat("cal_m_dry", out_config.calib_moisture.raw_dry);
        if (g_prefs.isKey("cal_m_wet")) out_config.calib_moisture.raw_wet = g_prefs.getFloat("cal_m_wet", out_config.calib_moisture.raw_wet);
        if (g_prefs.isKey("cal_ph4")) out_config.calib_ph.v_ph4 = g_prefs.getFloat("cal_ph4", out_config.calib_ph.v_ph4);
        if (g_prefs.isKey("cal_ph7")) out_config.calib_ph.v_ph7 = g_prefs.getFloat("cal_ph7", out_config.calib_ph.v_ph7);
        if (g_prefs.isKey("cal_ec1413")) out_config.calib_ec.v_calib_1413 = g_prefs.getFloat("cal_ec1413", out_config.calib_ec.v_calib_1413);

        g_prefs.end();
    }
#endif

    m_is_loaded = true;
    return true;
}

bool ConfigurationManager::save(const DeviceConfig& config) {
#ifdef ARDUINO
    if (g_prefs.begin("agrisense_cfg", false)) { // Read-Write mode
        g_prefs.putString("device_id", config.device_id.c_str());
        g_prefs.putString("api_key", config.api_key.c_str());
        g_prefs.putString("farm_id", config.farm_id.c_str());
        g_prefs.putString("field_id", config.field_id.c_str());
        g_prefs.putString("wifi_ssid", config.wifi_ssid.c_str());
        g_prefs.putString("wifi_pass", config.wifi_password.c_str());
        g_prefs.putString("api_url", config.api_base_url.c_str());

        g_prefs.putFloat("cal_m_dry", config.calib_moisture.raw_dry);
        g_prefs.putFloat("cal_m_wet", config.calib_moisture.raw_wet);
        g_prefs.putFloat("cal_ph4", config.calib_ph.v_ph4);
        g_prefs.putFloat("cal_ph7", config.calib_ph.v_ph7);
        g_prefs.putFloat("cal_ec1413", config.calib_ec.v_calib_1413);

        g_prefs.end();
        return true;
    }
    return false;
#else
    (void)config;
    return true;
#endif
}

bool ConfigurationManager::resetToDefaults(DeviceConfig& out_config) {
#ifdef ARDUINO
    if (g_prefs.begin("agrisense_cfg", false)) {
        g_prefs.clear();
        g_prefs.end();
    }
#endif
    return load(out_config);
}
