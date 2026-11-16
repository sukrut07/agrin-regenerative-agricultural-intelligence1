#include "diagnostics.h"

#ifdef ARDUINO
#include <Arduino.h>
#include <esp_system.h>
#include <rom/rtc.h>
#endif

Diagnostics::Diagnostics()
    : m_failed_transmissions(0),
      m_successful_transmissions(0) {}

void Diagnostics::recordFailedTransmission() {
    m_failed_transmissions++;
}

void Diagnostics::recordSuccessfulTransmission() {
    m_successful_transmissions++;
}

const char* Diagnostics::getResetReason() const {
#ifdef ARDUINO
    RESET_REASON reason = rtc_get_reset_reason(0);
    switch (reason) {
        case 1:  return "POWERON_RESET";
        case 3:  return "SW_RESET";
        case 4:  return "OWDT_RESET";
        case 5:  return "DEEPSLEEP_RESET";
        case 6:  return "SDIO_RESET";
        case 7:  return "TG0WDT_SYS_RESET";
        case 8:  return "TG1WDT_SYS_RESET";
        case 9:  return "RTCWDT_SYS_RESET";
        case 11: return "TGWDT_CPU_RESET";
        case 12: return "SW_CPU_RESET";
        case 13: return "RTCWDT_CPU_RESET";
        case 14: return "EXT_CPU_RESET";
        case 15: return "RTCWDT_BROWN_OUT_RESET";
        case 16: return "RTCWDT_RTC_RESET";
        default: return "UNKNOWN_RESET";
    }
#else
    return "HOST_SIMULATED_STARTUP";
#endif
}

DeviceDiagnostics Diagnostics::getDiagnostics(float batt_volts, float batt_pct, int32_t rssi, size_t buffered_records) {
    DeviceDiagnostics d;
    d.battery_voltage = batt_volts;
    d.battery_percent = batt_pct;
    d.signal_rssi = rssi;

    // RSSI signal quality mapping (-100 dBm = 0%, -50 dBm = 100%)
    float sq = ((rssi + 100.0f) / 50.0f) * 100.0f;
    d.signal_quality = (sq < 0.0f) ? 0.0f : ((sq > 100.0f) ? 100.0f : sq);

#ifdef ARDUINO
    d.uptime_seconds = millis() / 1000;
    d.free_memory_bytes = ESP.getFreeHeap();
#else
    d.uptime_seconds = 3600;
    d.free_memory_bytes = 184500;
#endif

    d.failed_transmissions = m_failed_transmissions;
    d.buffered_records = static_cast<uint32_t>(buffered_records);

    return d;
}
