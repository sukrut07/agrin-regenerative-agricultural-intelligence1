# AgriSense Hardware & Subsystem Readiness Matrix

> **Document ID:** AGRIN-HW-MAT-001  
> **Status:** Phase 02.2 Hardware Readiness Baseline  
> **Target Platform:** AgriSense IoT Node (ESP32-DevKit-V1 / AgriN Custom Carrier Rev 1.0)  
> **Date:** 2026-11-17  

---

## 1. Subsystem Verification Level Hierarchy

To prevent premature claims of hardware completeness, every hardware subsystem, peripheral interface, and communication channel in AgriSense is tracked against six discrete, progressive verification tiers:

```
[Level 1: Code Verified]
        │
        ▼
[Level 2: Software Simulated]
        │
        ▼
[Level 3: Electrical Design Reviewed]
        │
        ▼
[Level 4: Bench Tested (Physical)]      <── HARDWARE INTEGRATION GATE (CURRENT POSITION)
        │
        ▼
[Level 5: Calibrated Against Reference (Physical)]
        │
        ▼
[Level 6: Field Validated (Physical)]
```

### Verification Level Definitions:
1. **Level 1 — Code Verified:** Firmware drivers, headers, algorithms, and logic compile clean with zero errors under both native toolchains and the `esp32dev` PlatformIO compiler.
2. **Level 2 — Software Simulated:** Automated test suites, HIL mock harnesses, and unit tests execute against simulated telemetry and mock peripherals with 100% pass rate.
3. **Level 3 — Electrical Design Reviewed:** Formal circuit analysis, pin multiplexing audits, voltage tolerance verification, decoupling, and boot-strapping behavior audits are complete.
4. **Level 4 — Bench Tested (Physical):** Real physical hardware assembled on bench with actual components; supply voltages, quiescent currents, bus transactions, and signal integrity verified with DMM and oscilloscope.
5. **Level 5 — Calibrated Against Reference (Physical):** Physical probes immersed in known primary chemical reference standards (NIST pH buffers 4.01/7.00/10.01, 1413 µS/cm EC, ice-point bath) and calibration coefficients flashed to device NVS.
6. **Level 6 — Field Validated (Physical):** Node installed in outdoor agricultural field environment, running autonomously on solar/battery power, transmitting reliable live soil data to AgriN for 14+ consecutive days.

---

## 2. Master Subsystem Readiness Matrix

> **CRITICAL DISCLOSURE:**  
> As of Phase 02.2, physical circuit assembly has **NOT** yet taken place.  
> Therefore, all physical laboratory checks (`Level 4`), calibration runs (`Level 5`), and field deployments (`Level 6`) are strictly designated as **NOT TESTED**.  
> No test results or calibration data are fabricated.

| Subsystem / Peripheral Interface | Level 1: Code Verified | Level 2: Software Simulated | Level 3: Electrical Reviewed | Level 4: Bench Tested (Physical) | Level 5: Calibrated Ref (Physical) | Level 6: Field Validated (Physical) | Current Subsystem Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ESP32 MCU Core & Power-On** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **5.0V & 3.3V Power Distribution** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Battery Divider (100k/75k to GPIO 35)**| **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **ADS1115 I2C ADC (GPIO 21/22, 0x48)**| **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Capacitive Moisture (ADS1115 A0)** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **DS18B20 Temp (GPIO 4, 1-Wire)** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Analog pH Sensor (ADS1115 A1)** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Analog EC Sensor (ADS1115 A2)** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **MAX3485 RS485 NPK (GPIO 16/17/27)** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Wi-Fi 802.11b/g/n & Reconnect** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **TLS 1.2/1.3 Root CA Verification** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **LittleFS Offline Storage Journal** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **NVS Persistent Device Config** | **PASS** | **PASS** | **PASS** | `NOT TESTED` | `NOT TESTED` | `NOT TESTED` | **Bench Ready (Pending Assembly)** |
| **Backend Telemetry Ingestion API** | **PASS** | **PASS** | **PASS** | **PASS (HIL Sim)** | **N/A** | `NOT TESTED` | **Production Ready (Verified)** |
| **AgriN Provenance & Confidence Engine**| **PASS** | **PASS** | **PASS** | **PASS (E2E Sim)** | **N/A** | `NOT TESTED` | **Production Ready (Verified)** |

---

## 3. Subsystem Detailed Analysis

### 3.1 ESP32 MCU Core & Power Subsystem
- **Status:** Level 1, 2, 3 Verified. Level 4–6 NOT TESTED.
- **Review Notes:**
  - ESP32-DevKit-V1 requires external 5.0V on VIN or USB.
  - Onboard AMS1117-3.3 regulates 3.3V. Current capacity: ~800 mA peak.
  - Total system active current during Wi-Fi TX burst: ~240 mA. Safe margin: ~70%.
  - Quiescent deep-sleep target: < 25 µA.
  - Pin strapping verification: GPIO 0, 2, 5, 12, 15 verified free of conflicting hard pull-ups/pull-downs. GPIO 27 chosen for RS485 DE/RE to completely eliminate GPIO 5 boot PWM glitch.

### 3.2 Battery Monitoring Subsystem
- **Status:** Level 1, 2, 3 Verified. Level 4–6 NOT TESTED.
- **Review Notes:**
  - Resistor divider: R1 = 100 kΩ (1%), R2 = 75 kΩ (1%). Division ratio: 0.42857.
  - At maximum Li-Ion charge (4.20V), voltage presented to GPIO 35 is 1.800V.
  - GPIO 35 is ADC1 (independent of Wi-Fi SAR ADC2 contention).
  - Firmware utilizes `analogReadMilliVolts()` with factory eFuse calibration.
  - Non-linear 12-point piecewise OCV discharge curve implemented in `calibration.h`.

### 3.3 Analog Subsystem (ADS1115 16-Bit ADC)
- **Status:** Level 1, 2, 3 Verified. Level 4–6 NOT TESTED.
- **Review Notes:**
  - ADS1115 powered exclusively from ESP32 3.3V rail.
  - Supply voltage ceiling: 3.30V. Maximum safe analog input: 3.60V (VDD + 0.3V).
  - Capacitive soil moisture sensor output: 1.1V to 3.0V (100% compliant with 3.3V ceiling).
  - Analog pH signal conditioning board: Powered from 5.0V, but internal op-amp output is centered at 2.50V (range ~1.2V to 3.3V). Hardware verification must ensure pH circuit cannot drive A1 above 3.3V under abnormal conditions.
  - I2C Bus: GPIO 21 (SDA), GPIO 22 (SCL), external 4.7 kΩ pull-ups to 3.3V.

### 3.4 1-Wire Digital Subsystem (DS18B20)
- **Status:** Level 1, 2, 3 Verified. Level 4–6 NOT TESTED.
- **Review Notes:**
  - Dedicated pin: GPIO 4.
  - External 4.7 kΩ pull-up to 3.3V.
  - DallasTemperature library with Dallas 1-Wire CRC-8 validation active.
  - Guard conditions: Disconnected probe returns -127.0°C or 85.0°C; firmware filters these out and flags status as `MISSING`.

### 3.5 RS485 Industrial Subsystem (NPK Soil Sensor)
- **Status:** Level 1, 2, 3 Verified. Level 4–6 NOT TESTED.
- **Review Notes:**
  - Transceiver: MAX3485 (true 3.3V transceiver).
  - UART2: GPIO 16 (RX2), GPIO 17 (TX2). Baud rate: 9600 baud, 8 data bits, no parity, 1 stop bit.
  - Direction Control (DE/RE): GPIO 27.
  - Critical Electrical Guard: 10 kΩ pull-down resistor on GPIO 27 ensures receiver mode (RO active, DI disabled) during power-on, reset, and deep sleep.
  - Critical Firmware Guard: 1050 µs delay enforced following `Serial2.flush()` prior to de-asserting DE/RE to guarantee the stop bit clears the physical bus.

### 3.6 Software, Firmware & Ingestion Backend
- **Status:** Level 1, 2, 3, and Simulated Bench Ingest Verified.
- **Review Notes:**
  - C++ Native Unit Tests: 100% PASS (Native Clang/G++).
  - PlatformIO Build for `esp32dev`: 100% SUCCESS (Flash: 64.5%, RAM: 16.5%).
  - HIL Test Harness: 5 Passed, 0 Failed, 7 Not Tested (Physical).
  - Backend Telemetry E2E Regression Suite: 152 Passed, 0 Failed.
  - Honest Provenance: Unmeasured NPK sensors are explicitly tagged `UNAVAILABLE`, preserving responsible AI integrity.

---

## 4. Hardware Gate Review & Prerequisites for Field Deployment

Before any AgriSense device is deployed in an agricultural field, the following milestones must be achieved:

| Phase Milestone | Required Verification | Responsible Lead | Gate Status |
| :--- | :--- | :--- | :---: |
| **M1: Pre-Power Electrical Inspection** | Cold resistance & power rail verification (`PRE_POWER_ELECTRICAL_CHECKLIST.md`) | HW Lead | **READY FOR EXECUTION** |
| **M2: Breadboard / Bench Assembly** | Physical wiring according to `AGRISENSE_BENCH_ASSEMBLY_GUIDE.md` | HW Tech | **READY FOR EXECUTION** |
| **M3: Laboratory Sensor Calibration** | Chemical calibration logged in `AGRISENSE_SENSOR_CALIBRATION_RECORD.md` | Agronomist / Chemist | **READY FOR EXECUTION** |
| **M4: HIL Telemetry Ingest** | 24-hour continuous live telemetry transmission to AgriN backend | Embedded Lead | **PENDING M2 & M3** |
| **M5: Environmental Stress Test** | Thermal chamber cycling (-5°C to +55°C) & IP67 enclosure seal check | HW QA | **PENDING M4** |
| **M6: Pilot Field Trial** | 14-day autonomous farm deployment in Parbhani, Maharashtra | Field Lead | **PENDING M5** |
