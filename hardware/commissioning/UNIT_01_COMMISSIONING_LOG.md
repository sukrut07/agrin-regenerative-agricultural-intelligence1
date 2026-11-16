# AgriSense Prototype Unit 01 — Master Commissioning Log

> **Document ID:** AGRIN-LOG-UNIT01-001  
> **Status:** ACTIVE COMMISSIONING LOG  
> **Target:** AgriSense Field Node Prototype Unit 01  
> **Governing Procedure:** `hardware/commissioning/UNIT_01_POWER_ON_PROCEDURE.md`  

---

## 1. Unit & Hardware Identification

| Parameter | Specification / Field Record | Verification |
| :--- | :--- | :---: |
| **Prototype Unit ID** | `AGRISENSE-PROTO-01` | [ ] Confirmed |
| **Carrier Board Revision** | `Rev 1.0 (Breadboard / Point-to-Point Carrier)` | [ ] Confirmed |
| **ESP32 DevKit Module** | `ESP32-DevKit-V1 (ESP32-WROOM-32, 30-Pin)` | [ ] Confirmed |
| **ESP32 Silicon MAC Address** | `[Enter MAC from boot log: XX:XX:XX:XX:XX:XX]` | [ ] Pending Boot |
| **Firmware Git Commit SHA** | `[Enter Git SHA at flash time]` | [ ] Confirmed |
| **Firmware Build Version** | `v2.1.0-diag-rel` | [ ] Confirmed |
| **Commissioning Facility** | `[Enter Lab Name & Bench ID]` | [ ] Confirmed |
| **Lead Validation Engineer** | `[Enter Lead Engineer Name]` | [ ] Confirmed |

---

## 2. Sensor BOM & Hardware Models Attached

| Subsystem | Sensor Type | Component / Module Make & Model | Interface & Pin | Physical Serial / Lot ID |
| :--- | :--- | :--- | :--- | :--- |
| **Moisture** | Capacitive Soil Moisture v1.2 | TLC555-based Analog Capacitive Blade | ADS1115 A0 (3.3V Rail) | `[Enter Serial / Lot]` |
| **Temperature** | Digital Soil Temperature | Dallas Maxim DS18B20 (Waterproof Probe) | GPIO 4 (1-Wire, 3.3V) | `[Enter 64-bit ROM]` |
| **Soil pH** | Analog pH Electrode & Board | Glass Bulb Combination Electrode + Amp | ADS1115 A1 (5.0V Rail) | `[Enter Electrode Model]` |
| **Soil EC** | Analog EC Conductivity | Dual Platinum Probe + AC Excitation Amp | ADS1115 A2 (5.0V Rail) | `[Enter Probe Model]` |
| **Soil NPK** | Modbus RTU 7-in-1 Probe | Industrial RS485 Soil Probe (External 12V)| UART2 (GPIO 16/17/27) | `[Enter Probe Serial]` |
| **ADC Unit** | 16-Bit $\Delta\Sigma$ ADC | Texas Instruments ADS1115 Breakout | I2C (GPIO 21/22, 0x48) | `[Enter Module Lot]` |
| **RS485 PHY** | 3.3V Transceiver | Maxim Integrated MAX3485 (SO-8 / DIP) | UART2 + GPIO 27 DE/RE | `[Enter Chip Marking]` |

---

## 3. Commissioning Execution Chronology

### Stage A: Cold Resistance Verification
- **Execution Date & Time:** `[YYYY-MM-DD HH:MM UTC]`
- **Measurement Register Reference:** `hardware/commissioning/UNIT_01_MEASUREMENT_REGISTER.md`
- **Result:** [ ] PASS (All 1.1–1.8 within spec) | [ ] FAIL (Short / Anomaly noted)
- **Technician Notes:** `____________________________________________________________________`

### Stage B: Human Safety Clearance & Gate Approval
- **Approved By (Lead Engineer):** `___________________________________`
- **Approval Date:** `[YYYY-MM-DD]`
- **Permission Granted:** [ ] YES — Proceed to Stage C with 150 mA current limit | [ ] NO — Hold

### Stage C & D: First Power Application & Voltage Rail Verification
- **Bench Supply Settings:** Voltage = `5.00 V` | Current Limit = `150 mA`
- **Measured Quiescent Current:** `____ mA` (Acceptable band: 55 mA – 90 mA)
- **Voltage Rail Measurements (DMM):**
  - ESP32 3V3 Pin: `____ V` (Expected: 3.25V – 3.35V)
  - ADS1115 Pin 8 (VDD): `____ V` (Expected: 3.25V – 3.35V) *(Must NOT exceed 3.45V!)*
  - Sensor 5V Rail: `____ V` (Expected: 4.90V – 5.20V)
  - GPIO 27 (DE/RE): `____ V` (Expected: < 0.05V)
  - GPIO 4 (1-Wire): `____ V` (Expected: 3.20V – 3.35V)
  - GPIO 21 (SDA): `____ V` (Expected: 3.20V – 3.35V)
  - GPIO 22 (SCL): `____ V` (Expected: 3.20V – 3.35V)
- **Result:** [ ] PASS | [ ] FAIL

### Stage E: Startup Boot Logs (ESP32 Serial at 115200 Baud)
*Paste actual serial terminal text output below:*
```text
[Awaiting Physical Serial Log Capture]
```

### Stage F: I2C Diagnostics & ADS1115 Discovery
*Paste output of 'I2C_SCAN' and 'ADS_STATUS' commands below:*
```text
[Awaiting I2C Bus Scan Output]
```

### Stage G: Sensor Verification & Controlled Activation Log
| Sensor | Physical Output Voltage Measured Before ADC | Safety Verified (`SENSOR_VERIFY`) | Enabled (`SENSOR_ENABLE`) | First Raw Reading | First Calibrated Value | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **DS18B20 Temp** | N/A (Digital 1-Wire) | [ ] Yes | [ ] Yes | `______` | `______ °C` | `NOT TESTED` |
| **Moisture** | `____ V` in air (< 3.3V) | [ ] Yes | [ ] Yes | `______` | `______ %` | `NOT TESTED` |
| **Soil pH** | `____ V` in air (~2.5V) | [ ] Yes | [ ] Yes | `______` | `______ pH` | `NOT TESTED` |
| **Soil EC** | `____ V` in air (< 0.1V) | [ ] Yes | [ ] Yes | `______` | `______ dS/m` | `NOT TESTED` |
| **RS485 NPK** | Differential A/B valid | [ ] Yes | [ ] Yes | `______` | `______ mg/kg`| `NOT TESTED` |

---

## 4. Anomaly and Remediation Tracking

| Anomaly ID | Stage Detected | Symptom Observed | Root Cause Analysis | Remediation Performed | Sign-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ANOM-01` | | | | | |
| `ANOM-02` | | | | | |

---

## 5. Final Stage 03.1 Disposition

- [ ] **UNIT 01 COMMISSIONING ACCEPTED:** All rails, peripherals, and sensors verified.
- [x] **PENDING PHYSICAL BENCH MEASUREMENTS:** Diagnostic firmware ready; awaiting hardware team cold measurements.
- [ ] **COMMISSIONING REJECTED:** Hardware failure or electrical overstress detected.

| Lead Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Hardware Engineer** | | ___________________________ | ___________ |
| **Embedded Firmware Lead** | | ___________________________ | ___________ |
| **AgriN Systems Architect** | | ___________________________ | ___________ |
