# AgriSense IoT Node — Sensor Calibration & Agronomic Formula Audit

**Version**: `2.1.0`  
**Classification**: Metrology, Agronomic Modeling & Mathematical Formula Audit  
**Auditor**: Principal Embedded Systems & Metrology Architect  
**Scope**: Capacitive Moisture, Nernst pH, 25°C Normalized EC, Modbus RTU NPK, and DS18B20 Temperature  

---

## 1. Executive Summary

Every mathematical transformation, physical unit conversion, calibration baseline, and error guard implemented in `firmware/include/calibration.h` and sensor drivers was audited. Mathematical defects (such as division-by-zero on uncalibrated probes and negative denominators under temperature disconnects) were resolved and validated via automated unit testing.

### Calibration Audit Status Matrix

| Sensor Subsystem | Mathematical Model | Error Safeguards Verified | Automated Test Status | Field Ready? |
| :--- | :--- | :--- | :--- | :--- |
| **Capacitive Moisture** | Dielectric ratio: $(\text{Dry} - \text{Raw})/(\text{Dry} - \text{Wet}) \times 100$ | Range clamping $[0, 100\%]$; open/short circuit fault traps | **PASS** | Lab calibrated |
| **Soil pH** | Glass electrode Nernst model with dynamic $T$ Kelvin compensation | Division-by-zero guard on identical buffers; rail fault trap | **PASS** | Lab calibrated |
| **Soil EC** | Conductance ratio with $25^\circ\text{C}$ temperature coefficient ($\alpha=0.02$) | Temperature clamping $[0, 50^\circ\text{C}]$ prevents negative denominators | **PASS** | Lab calibrated |
| **Soil NPK** | Modbus RTU Read Holding Registers (Func `0x03`) | Big-Endian byte order; CRC-16 Modbus; 1050 µs guard time | **PASS** | Factory calibrated |
| **DS18B20 Temp** | 12-bit bandgap ADC OneWire protocol | CRC-8 polynomial check; $-127^\circ\text{C}$ & $+85^\circ\text{C}$ traps | **PASS** | Factory calibrated |

---

## 2. Soil Moisture Mathematical Calibration Audit

### 2.1 Physics & Conversion Direction
Capacitive sensors measure the dielectric permittivity of the soil matrix:
- **Dry Air / Dry Soil**: Dielectric constant $\approx 1-4$. High oscillation frequency / high voltage ($\text{Raw}_{\text{dry}} \approx 2850$).
- **Saturated Soil / Water**: Dielectric constant of water $\approx 80$. Low oscillation frequency / low voltage ($\text{Raw}_{\text{wet}} \approx 1350$).

The implemented equation correctly inverts this relationship:
$$\text{Moisture}_{\%} = \left( \frac{\text{Raw}_{\text{dry}} - \text{Raw}_{\text{ADC}}}{\text{Raw}_{\text{dry}} - \text{Raw}_{\text{wet}}} \right) \times 100.0\%$$

### 2.2 Boundary & Clamping Audit
- When $\text{Raw}_{\text{ADC}} \ge \text{Raw}_{\text{dry}}$: Evaluates to $\le 0.0\% \rightarrow$ clamped to `0.0%`.
- When $\text{Raw}_{\text{ADC}} \le \text{Raw}_{\text{wet}}$: Evaluates to $\ge 100.0\% \rightarrow$ clamped to `100.0%`.
- Exponential Moving Average (EMA) smoothing ($\alpha = 0.3$) stabilizes readings against capacitive RF noise.
- **Hardware Fault Trapping**:
  - Raw ADC $< 100$ indicates short-to-ground or broken trace $\rightarrow$ flagged `INVALID`.
  - Raw ADC $> 32500$ indicates disconnected input or floating pin $\rightarrow$ flagged `SENSOR_OFFLINE`.

---

## 3. Soil pH Nernst Model & Temperature Compensation Audit

### 3.1 Nernst Equation Model
The potential developed by a glass electrode is governed by the Nernst equation:
$$E = E_0 - \left( \frac{2.3026 \cdot R \cdot T}{F} \right) \cdot \text{pH}$$
where $R = 8.3144\ \text{J/(mol}\cdot\text{K)}$, $F = 96485\ \text{C/mol}$, and $T$ is absolute temperature in Kelvin.

At $25^\circ\text{C}$ ($298.15\text{ K}$), the theoretical slope is $-59.16\text{ mV/pH}$. As soil temperature changes, the slope scales proportionally by:
$$\text{TempFactor} = \frac{T_{\text{soil}} + 273.15}{298.15}$$

### 3.2 Audit Defect Resolution
- **Defect Identified**: If an unprovisioned node runs with identical calibration voltages ($V_{\text{pH4}} = V_{\text{pH7}} = 2.50\text{V}$), the slope calculation $(7.0 - 4.01) / (V_{\text{pH7}} - V_{\text{pH4}})$ results in a division-by-zero floating-point exception (`+inf` or `NaN`), corrupting AI models.
- **Resolution Implemented in Phase 02.1**:
  ```cpp
  if (std::fabs(cal.v_ph7 - cal.v_ph4) < 0.05f) {
      return 7.0f; // Safe neutral fallback
  }
  ```
- **Range Clamping**: The calculated pH is strictly clamped to $[3.00, 10.00]$, matching agronomic bounds. Values outside trigger `OUT_OF_RANGE` telemetry flags.

---

## 4. Soil EC Temperature Normalization Audit

### 4.1 $25^\circ\text{C}$ Reference Normalization
Electrical conductivity increases by approximately $2.0\%$ per $^\circ\text{C}$ increase in temperature due to reduced ion viscosity. Agronomic salinity thresholds are defined strictly at $25^\circ\text{C}$:
$$\text{EC}_{25} = \frac{\text{EC}_T}{1 + \alpha \cdot (T_{\text{soil}} - 25.0)}$$
where $\alpha = 0.02\ / ^\circ\text{C}$ (configurable via `EcCalibration.temp_coefficient`).

### 4.2 Audit Defect Resolution
- **Defect Identified**: If the temperature sensor is disconnected or faulty, returning $-127.0^\circ\text{C}$:
  $$1 + 0.02 \cdot (-127.0 - 25.0) = 1 + 0.02 \cdot (-152.0) = 1 - 3.04 = -2.04$$
  Dividing raw EC by a negative number would produce a negative electrical conductivity reading, which is physically impossible and causes database validation failure.
- **Resolution Implemented in Phase 02.1**:
  ```cpp
  float safe_temp = agrisense_util::clamp(soil_temp_c, 0.0f, 50.0f);
  float temp_correction = 1.0f + cal.temp_coefficient * (safe_temp - 25.0f);
  if (temp_correction <= 0.1f) temp_correction = 0.1f;
  float ec_25 = raw_ec / temp_correction;
  ```
  Verified via automated unit test: `test_calibration_math()` (**PASS**).

---

## 5. RS485 Modbus RTU NPK Probe Protocol Audit

### 5.1 Protocol Compliance
- **Modbus Function**: `0x03` (Read Holding Registers).
- **Slave Address**: `0x01` (Factory standard for commercial Chinese 7-in-1 / 3-in-1 NPK probes).
- **Register Map**:
  - Nitrogen ($N$): Address `0x001E` (30 decimal), Unit: mg/kg (or mg/L).
  - Phosphorus ($P$): Address `0x001F` (31 decimal), Unit: mg/kg.
  - Potassium ($K$): Address `0x0020` (32 decimal), Unit: mg/kg.
- **Byte Order**: Big-Endian (High Byte first, Low Byte second).
- **CRC-16 Polynomial**: `0xA001` (Standard Modbus CRC). Verified against test vectors (**PASS**).

### 5.2 Transmission Line Timing Audit
- At 9600 baud, 1 character time is $10 / 9600 \approx 1042\ \mu\text{s}$.
- The firmware now enforces `delayMicroseconds(1050)` after `flush()` before de-asserting `DE/RE` to LOW, preventing truncation of the final stop bit on the RS485 bus.
