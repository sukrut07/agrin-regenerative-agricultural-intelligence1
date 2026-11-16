#ifndef AGRISENSE_DIAGNOSTICS_H
#define AGRISENSE_DIAGNOSTICS_H

#include "sensor_types.h"

class Diagnostics {
public:
    Diagnostics();

    DeviceDiagnostics getDiagnostics(float batt_volts, float batt_pct, int32_t rssi, size_t buffered_records);
    void recordFailedTransmission();
    void recordSuccessfulTransmission();
    const char* getResetReason() const;

private:
    uint32_t m_failed_transmissions;
    uint32_t m_successful_transmissions;
};

#endif // AGRISENSE_DIAGNOSTICS_H
