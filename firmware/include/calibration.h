#ifndef AGRISENSE_CALIBRATION_H
#define AGRISENSE_CALIBRATION_H

#include <stdint.h>
#include <string>
#include <algorithm>
#include <cmath>

namespace agrisense_util {
    template <typename T>
    inline T clamp(T v, T lo, T hi) {
        return (v < lo) ? lo : ((v > hi) ? hi : v);
    }
}

/**
 * Soil Moisture Calibration Parameters (Capacitive Dielectric)
 */
struct MoistureCalibration {
    float raw_dry = 2850.0f;       // ADC reading in completely dry air
    float raw_wet = 1350.0f;       // ADC reading in water-saturated soil
    std::string version = "1.0.0";
};

/**
 * Soil pH Calibration Parameters (Glass Electrode Nernst Model)
 */
struct PhCalibration {
    float v_ph4 = 2.95f;          // Measured voltage at pH 4.01 buffer
    float v_ph7 = 2.45f;          // Measured voltage at pH 7.00 neutral buffer
    float v_ph10 = 1.95f;         // Measured voltage at pH 10.00 alkaline buffer (optional)
    bool use_three_point = false;
    std::string version = "1.0.0";
};

/**
 * Soil Electrical Conductivity (EC) Calibration Parameters
 */
struct EcCalibration {
    float v_calib_1413 = 1.45f;   // Measured voltage in 1413 uS/cm (1.413 dS/m) KCl solution
    float standard_ec_dsm = 1.413f;
    float temp_coefficient = 0.02f; // Standard 2.0% per °C temperature compensation
    std::string version = "1.0.0";
};

/**
 * Mathematical Transformation Utilities
 */
class CalibrationMath {
public:
    /**
     * Converts raw capacitive ADC reading to Soil Moisture percentage (0.0 to 100.0%)
     */
    static float rawToSoilMoisture(float raw_adc, const MoistureCalibration& cal) {
        if (std::abs(cal.raw_dry - cal.raw_wet) < 1.0f) {
            return 0.0f;
        }
        // In capacitive probes, higher voltage/ADC count = DRY, lower = WET
        float moisture = ((cal.raw_dry - raw_adc) / (cal.raw_dry - cal.raw_wet)) * 100.0f;
        return agrisense_util::clamp(moisture, 0.0f, 100.0f);
    }

    /**
     * Calculates Soil pH from analog voltage with optional Nernst temperature compensation.
     * Nernst equation: E = E0 - (2.303 * R * T / F) * pH
     * Slope adjusts proportionally to absolute temperature (Kelvin).
     */
    static float voltageToPh(float voltage, const PhCalibration& cal, float soil_temp_c = 25.0f) {
        // Zero-division safeguard against uncalibrated identical buffer points
        if (std::fabs(cal.v_ph7 - cal.v_ph4) < 0.05f) {
            return 7.0f; // Safe neutral fallback
        }

        float kelvin_ref = 298.15f; // 25°C
        float kelvin_actual = 273.15f + agrisense_util::clamp(soil_temp_c, 0.0f, 60.0f);
        float temp_factor = kelvin_actual / kelvin_ref;

        if (cal.use_three_point && std::fabs(cal.v_ph10 - cal.v_ph7) >= 0.05f) {
            if (voltage >= cal.v_ph7) {
                // Acidic range (pH 4 - 7)
                float base_slope = (7.0f - 4.01f) / (cal.v_ph7 - cal.v_ph4);
                float slope = base_slope * temp_factor;
                float ph = 7.0f + (voltage - cal.v_ph7) * slope;
                return agrisense_util::clamp(ph, 3.0f, 10.0f);
            } else {
                // Alkaline range (pH 7 - 10)
                float base_slope = (10.0f - 7.0f) / (cal.v_ph10 - cal.v_ph7);
                float slope = base_slope * temp_factor;
                float ph = 7.0f + (voltage - cal.v_ph7) * slope;
                return agrisense_util::clamp(ph, 3.0f, 10.0f);
            }
        }

        // Standard 2-point linear interpolation
        float base_slope = (7.0f - 4.01f) / (cal.v_ph7 - cal.v_ph4);
        float slope = base_slope * temp_factor;
        float ph = 7.0f + (voltage - cal.v_ph7) * slope;
        return agrisense_util::clamp(ph, 3.0f, 10.0f);
    }

    /**
     * Calculates Soil EC in dS/m normalized to 25°C reference temperature.
     * EC_25 = EC_T / (1 + alpha * (T - 25))
     */
    static float voltageToEc(float voltage, const EcCalibration& cal, float soil_temp_c = 25.0f) {
        if (cal.v_calib_1413 <= 0.01f) {
            return 0.0f;
        }
        float raw_ec = (voltage / cal.v_calib_1413) * cal.standard_ec_dsm;
        float safe_temp = agrisense_util::clamp(soil_temp_c, 0.0f, 50.0f);
        float temp_correction = 1.0f + cal.temp_coefficient * (safe_temp - 25.0f);
        if (temp_correction <= 0.1f) {
            temp_correction = 0.1f;
        }
        float ec_25 = raw_ec / temp_correction;
        return agrisense_util::clamp(ec_25, 0.0f, 20.0f);
    }

    /**
     * Piecewise-linear Lithium-Ion (18650 / LiPo) OCV discharge model.
     * Accurately models the 3.65V-3.85V capacity plateau rather than a crude straight line.
     */
    static float batteryVoltageToPercent(float voltage) {
        if (voltage >= 4.18f) return 100.0f;
        if (voltage <= 3.20f) return 0.0f;

        struct OcvPoint { float v; float pct; };
        static const OcvPoint ocv_table[] = {
            {4.18f, 100.0f},
            {4.05f,  90.0f},
            {3.95f,  80.0f},
            {3.86f,  70.0f},
            {3.80f,  60.0f},
            {3.76f,  50.0f},
            {3.72f,  40.0f},
            {3.68f,  30.0f},
            {3.64f,  20.0f},
            {3.55f,  10.0f},
            {3.40f,   5.0f},
            {3.20f,   0.0f}
        };
        constexpr size_t n_points = sizeof(ocv_table) / sizeof(ocv_table[0]);

        for (size_t i = 0; i < n_points - 1; ++i) {
            if (voltage >= ocv_table[i + 1].v) {
                float v_span = ocv_table[i].v - ocv_table[i + 1].v;
                float pct_span = ocv_table[i].pct - ocv_table[i + 1].pct;
                float factor = (voltage - ocv_table[i + 1].v) / v_span;
                return ocv_table[i + 1].pct + factor * pct_span;
            }
        }
        return 0.0f;
    }

    /**
     * Calculates battery voltage and remaining percentage from ADC reading.
     */
    static void computeBattery(float adc_volts, float divider_ratio, float& out_voltage, float& out_pct) {
        out_voltage = adc_volts * divider_ratio;
        out_pct = batteryVoltageToPercent(out_voltage);
    }
};

#endif // AGRISENSE_CALIBRATION_H
