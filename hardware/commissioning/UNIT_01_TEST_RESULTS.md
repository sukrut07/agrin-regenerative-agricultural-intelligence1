# AgriSense Prototype Unit 01 — Bench Test Results & Evidence Log

> **Document ID:** AGRIN-TR-UNIT01-001  
> **Status:** PENDING PHYSICAL EXECUTION  
> **Target:** AgriSense Prototype Unit 01 (ESP32-DevKit-V1 + Carrier Rev 1.0)  
> **Mandatory Rule:** Do NOT mark simulated tests as physical passes. Record only actual physical instrument readings.  

---

## 1. Test Session Overview

| Metadata Field | Value / Bench Record |
| :--- | :--- |
| **Prototype Unit ID** | `AGRISENSE-PROTO-01` |
| **Execution Date** | `[Enter Date: YYYY-MM-DD]` |
| **Bench Location** | `[Enter Lab Name & Bench ID]` |
| **Lead Hardware Engineer** | `[Enter Name]` |
| **Witness / QA Lead** | `[Enter Name]` |
| **Digital Multimeter (DMM)** | `[Enter Make, Model, Serial, Cal Date]` |
| **DC Power Supply** | `[Enter Make, Model, Current Limit Resolution]` |
| **Digital Storage Oscilloscope** | `[Enter Make, Model, Bandwidth]` |

---

## 2. Test Execution Matrix

### Phase 1: Unpowered Cold-Check Verification

| Test ID | Subsystem | Verification Description | Expected Range | Actual Measured Value | Status | Sign-Off |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `COLD-01` | Star Ground | Resistance between ESP32 GND and all module grounds | $< 0.5\ \Omega$ | `______` $\Omega$ | `NOT TESTED` | [ ] |
| `COLD-02` | 3.3V Isolation | Resistance between ESP32 3V3 rail and GND | $> 1\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-03` | 5.0V Isolation | Resistance between ESP32 VIN (5V rail) and GND | $> 5\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-04` | 3.3V/5V Rail Isolation | Resistance between 3.3V rail and 5V rail | $> 5\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-05` | RS485 Pull-Down | Resistance between GPIO 27 and GND | $9.8\text{ k}\Omega - 10.2\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-06` | DS18B20 Pull-Up | Resistance between GPIO 4 and 3.3V rail | $4.6\text{ k}\Omega - 4.8\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-07` | I2C Bus Pull-Ups | Resistance between SDA/SCL and 3.3V rail | $2.0\text{ k}\Omega - 4.8\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |
| `COLD-08` | Battery Divider | Resistance of R1 (100k) and R2 (100k) | $98\text{ k}\Omega - 102\text{ k}\Omega$ | `______` $\text{k}\Omega$ | `NOT TESTED` | [ ] |

---

### Phase 2: Controlled Power-On & Voltage Rail Verification

| Test ID | Subsystem | Verification Description | Expected Range | Actual Measured Value | Status | Sign-Off |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `PWR-01` | Quiescent Current | DC bench supply current with ESP32 unexcited | $55\text{ mA} - 90\text{ mA}$ | `______` $\text{mA}$ | `NOT TESTED` | [ ] |
| `PWR-02` | ESP32 3.3V Rail | Voltage measured across ESP32 3V3 pin and GND | $3.25\text{ V} - 3.35\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `PWR-03` | ADS1115 VDD | Voltage measured at ADS1115 Pin 8 to GND | $3.25\text{ V} - 3.35\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `PWR-04` | Sensor 5V Rail | Voltage measured across sensor 5V rail to GND | $4.90\text{ V} - 5.20\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `PWR-05` | GPIO 27 Level | Boot voltage measured at GPIO 27 to GND | $< 0.05\text{ V}$ (LOW) | `______` $\text{V}$ | `NOT TESTED` | [ ] |

---

### Phase 3: Peripheral & Bus Communication Verification

| Test ID | Subsystem | Verification Description | Expected Range | Actual Measured Value | Status | Sign-Off |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `BUS-01` | I2C Discovery | Address 0x48 acknowledged during `I2C_SCAN` | ACK at `0x48` | `______` | `NOT TESTED` | [ ] |
| `BUS-02` | ADS1115 Status | `ADS_STATUS` reports config register read | SUCCESS | `______` | `NOT TESTED` | [ ] |
| `BUS-03` | DS18B20 1-Wire | `TEMP_STATUS` returns valid 64-bit ROM ID | Family `0x28` | `______` | `NOT TESTED` | [ ] |
| `BUS-04` | RS485 Interface | `RS485_STATUS` confirms GPIO 27 LOW & UART2 | RECEIVE (LOW) | `______` | `NOT TESTED` | [ ] |

---

### Phase 4: Individual Sensor Acquisition & Calibration

| Test ID | Sensor | Verification Description | Expected Range | Actual Measured Value | Status | Sign-Off |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `SEN-01` | DS18B20 Temp | Ambient room temperature measurement | $20.0^\circ\text{C} - 30.0^\circ\text{C}$ | `______` $^\circ\text{C}$ | `NOT TESTED` | [ ] |
| `SEN-02` | Capacitive Moist | Raw ADC voltage in dry air baseline | $2.75\text{ V} - 3.10\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `SEN-03` | Capacitive Moist | Raw ADC voltage in deionized water baseline | $1.10\text{ V} - 1.45\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `SEN-04` | Soil pH Board | Raw ADC voltage in pH 7.00 buffer solution | $2.40\text{ V} - 2.60\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `SEN-05` | Soil pH Board | Raw ADC voltage in pH 4.01 buffer solution | $2.95\text{ V} - 3.20\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `SEN-06` | Soil EC Board | Raw ADC voltage in 1413 µS/cm standard | $1.20\text{ V} - 1.80\text{ V}$ | `______` $\text{V}$ | `NOT TESTED` | [ ] |
| `SEN-07` | RS485 NPK Probe | Modbus RTU holding register query (FC 0x03) | Valid N, P, K | `______` $\text{mg/kg}$ | `NOT TESTED` | [ ] |

---

### Phase 5: Live Telemetry Ingestion & Dashboard Verification

| Test ID | Subsystem | Verification Description | Expected Response | Actual Server Response | Status | Sign-Off |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| `ING-01` | Wi-Fi Link | Association with test AP & IP acquisition | $< 5.0\text{ seconds}$ | `______` $\text{s}$ | `NOT TESTED` | [ ] |
| `ING-02` | Ingestion API | `POST /api/telemetry` with Bearer auth token | HTTP `201 Created` | `______` | `NOT TESTED` | [ ] |
| `ING-03` | DB Persistence | Sensor measurements queryable in SQL database | Records match | `______` | `NOT TESTED` | [ ] |
| `ING-04` | Provenance Audit | Uninstalled sensors marked UNAVAILABLE (not 0) | UNAVAILABLE | `______` | `NOT TESTED` | [ ] |
| `ING-05` | React Dashboard | Live reading cards update on farmer dashboard | UI displays real | `______` | `NOT TESTED` | [ ] |

---

## 3. Discrepancy & Deviation Log

| Discrepancy ID | Associated Test ID | Observed Behavior | Remediation Taken | Engineer Initials |
| :--- | :--- | :--- | :--- | :--- |
| `DISC-01` | | | | |
| `DISC-02` | | | | |

---

## 4. Overall Prototype Disposition

- [ ] **STAGE 03.1 ACCEPTED FOR SENSOR CALIBRATION (PHASE 03.2)**  
- [x] **READY FOR BENCH MEASUREMENTS (Software & Documentation 100% Prepared)**  
- [ ] **REJECTED (Defect requires rework)**  
