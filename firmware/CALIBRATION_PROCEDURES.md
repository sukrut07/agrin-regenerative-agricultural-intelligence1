# AgriSense IoT — Sensor Calibration Procedures

**Version**: `2.0.0`  
**Classification**: Laboratory & Field Operating Procedure (SOP)  
**Target Hardware**: Capacitive Moisture, Analog pH, Analog EC, and DS18B20 Sensors  

---

## 1. Overview

Accurate agricultural intelligence depends directly on sensor calibration fidelity. Raw factory analog readings exhibit probe-to-probe tolerances, component drift, and cable resistance variations.

This standard operating procedure (SOP) provides step-by-step instructions for performing laboratory calibrations, calculating calibration coefficients, and storing them permanently in ESP32 Non-Volatile Storage (NVS) without recompiling firmware.

---

## 2. Capacitive Soil Moisture Sensor Calibration

Capacitive moisture sensors measure dielectric permittivity. High dielectric constant (water ~80) drops the output frequency/voltage, while low dielectric constant (air ~1, dry soil ~3-5) produces high voltage.

### Equipment Required
- AgriSense IoT node connected to PC via Serial (115200 baud).
- Dry air environment (clean dry lab bench).
- 500 mL beaker of deionized/tap water (100% saturation test).
- Repacked sample of regional soil type (for bulk density matching).

### Step-by-Step Procedure
1. **Dry Air Calibration ($Raw_{\text{dry}}$)**:
   - Hold the capacitive probe clean and completely dry in ambient air (do not touch the capacitive PCB area with hands).
   - In serial monitor, observe `RAW_ADC` value for Channel 0 over 30 seconds.
   - Record the stable mean value. Typical nominal: `2850` (on 16-bit ADS1115 scale).
2. **Saturated Soil / Water Calibration ($Raw_{\text{wet}}$)**:
   - Submerge probe up to the marked white moisture indicator line into water-saturated soil or water.
   - Ensure no air bubbles cling to the sensor PCB.
   - Record stable mean `RAW_ADC` value. Typical nominal: `1350`.
3. **Saving to NVS**:
   - Save via serial CLI command or REST configuration endpoint:
     ```json
     {
       "moisture": {
         "raw_dry": 2840.0,
         "raw_wet": 1360.0,
         "version": "calib-lab-2026-v1"
       }
     }
     ```

---

## 3. Soil pH Sensor Calibration (Nernst Model)

The glass electrode generates millivolts proportional to hydrogen ion activity ($H^+$). Calibration establishes the zero-point ($V_{\text{pH7}}$) and slope sensitivity ($V_{\text{pH4}}$).

### Buffer Solutions Required
- Certified NIST standard pH 7.00 buffer solution.
- Certified NIST standard pH 4.01 buffer solution.
- Optional: Certified NIST standard pH 10.01 buffer solution (for alkaline soils).
- Wash bottle with deionized (DI) water.
- Lint-free laboratory wipes (Kimwipes).

### Procedure
1. **Probe Rinse & Preparation**:
   - Remove storage cap containing 3M KCl solution. Rinse glass bulb thoroughly with DI water and gently dab dry with a lint-free wipe (never rub glass).
2. **Neutral Point ($V_{\text{pH7}}$)**:
   - Submerge probe and temperature sensor into pH 7.00 buffer.
   - Stir gently and wait 60 seconds for temperature and millivolt stabilization.
   - Record analog voltage ($V_{\text{pH7}}$). Typical nominal: `2.450 V`.
3. **Acidic Point ($V_{\text{pH4}}$)**:
   - Rinse probe with DI water. Submerge into pH 4.01 buffer.
   - Wait 60 seconds for stabilization.
   - Record analog voltage ($V_{\text{pH4}}$). Typical nominal: `2.950 V`.
4. **Alkaline Point (Optional $V_{\text{pH10}}$)**:
   - Rinse probe. Submerge into pH 10.01 buffer. Record voltage ($V_{\text{pH10}}$). Typical nominal: `1.950 V`.
5. **Nernst Slope Calculation**:
   $$\text{Slope}_{25} = \frac{7.00 - 4.01}{V_{\text{pH7}} - V_{\text{pH4}}}$$
   The firmware automatically updates temperature compensation in real-time using DS18B20 live readings.

---

## 4. Soil EC (Electrical Conductivity) Calibration

Soil salinity is measured via electrical conductance in dS/m (or mS/cm) normalized to standard 25°C.

### Standard Solutions Required
- Certified 1413 µS/cm (1.413 dS/m) KCl calibration standard solution.
- Deionized water for rinsing.

### Procedure
1. **Zero Point Verification**:
   - Hold EC probe in dry air. Voltage output should be $0.00 \pm 0.05\text{ V}$.
   - Output reading in air will report `0.00 dS/m`.
2. **Standard KCl Calibration ($V_{\text{calib\_1413}}$)**:
   - Submerge both platinum electrodes into the 1413 µS/cm solution. Ensure probe does not touch the bottom or sides of the container.
   - Submerge the DS18B20 temperature sensor in the same container.
   - Allow reading to settle for 30 seconds.
   - Record voltage ($V_{\text{calib\_1413}}$). Typical nominal: `1.450 V`.
3. **Temperature Compensation Check**:
   $$\text{EC}_{25} = \frac{(V_{\text{actual}} / V_{\text{calib\_1413}}) \times 1.413}{1 + 0.02 \cdot (T_{\text{soil}} - 25.0)}$$
   The firmware applies the standard 2.0% per °C temperature correction coefficient.

---

## 5. Calibration Version Tracking & Expiration

Each sensor's calibration record includes:
- `calibration_version`: Unique string identifier (e.g., `CAL-FIELD-2026-03`).
- `calibrated_at`: ISO 8601 UTC timestamp of calibration.
- `expiry_days`: Recommended calibration validity window (e.g., 90 days for pH, 180 days for EC).

When the validity window expires, the firmware continues sampling but automatically updates `MeasurementQuality` from `GOOD` to `CALIBRATION_EXPIRED`, signaling the AgriN backend to prompt the field technician for probe maintenance while preserving data flow.
