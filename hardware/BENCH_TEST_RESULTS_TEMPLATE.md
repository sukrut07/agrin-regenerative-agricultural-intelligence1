# AgriSense Hardware Bench Test Results Sheet

> **Document ID:** AGRIN-HW-BTR-001  
> **Status:** Standard Operating Template  
> **Revision:** 1.0  
> **Target Platform:** AgriSense IoT Node (ESP32-DevKit-V1 / AgriN Custom Carrier Rev 1.0)  

---

## 1. Test Session Metadata

| Field | Record / Value |
| :--- | :--- |
| **Test Session ID** | `BTR-YYYYMMDD-EXP<N>` |
| **Execution Date (UTC)** | `YYYY-MM-DD HH:MM:SS` |
| **Lead Validation Engineer** | |
| **Test Location / Facility** | |
| **DUT Hardware Profile** | `ESP32-DevKit-V1-Standard` |
| **Carrier Board Revision** | `Rev 1.0 (Breadboard / Protoboard)` |
| **Device MAC Address / EUI** | `XX:XX:XX:XX:XX:XX` |
| **Device Assigned ID** | `agr-dev-xxxxxxxx` |
| **Firmware Git Commit SHA** | |
| **Firmware Build Version** | `2.1.0-bench-rel` |
| **Ambient Temperature (°C)** | `__._ °C` |
| **Ambient Relative Humidity (%)** | `__ %` |

---

## 2. Test & Measurement Equipment Log

Every instrument used during this bench validation run must be logged with calibration status before initiating measurements.

| Equipment Type | Manufacturer & Model | Serial Number | Calibration Expiry | Asset ID |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Multimeter (6.5 digit / DMM)** | Keysight / Fluke / Siglent | | | |
| **Programmable DC Power Supply** | Rigol / Korad / GW Instek | | | |
| **Digital Storage Oscilloscope / MSO** | Rigol / Siglent (100MHz+) | | | |
| **USB Logic Analyzer (8ch, 24MHz+)** | Saleae Logic 8 or compatible | | | |
| **Precision Temperature Reference** | Fluke Hart Scientific / Calibrated Thermometer | | | |
| **pH Buffer Kit (4.01, 7.00, 10.01 @ 25°C)** | Hamilton / Hanna NIST Traceable | Lot: | Exp: | |
| **EC Calibration Standard (1413 µS/cm)** | Hanna / Oakton NIST Traceable | Lot: | Exp: | |

---

## 3. Subsystem Bench Test Matrix

> **Result Classification Legend:**  
> - **PASS**: Measured parameter is strictly within documented min/max tolerance.  
> - **FAIL**: Measured parameter deviates from acceptable tolerance.  
> - **NOT TESTED**: Hardware not assembled, probe missing, or bench test deferred.

### 3.1 Power Subsystem & Voltage Rails

| Test ID | Peripheral | Test Description | Stimulus / Test Condition | Expected Range | Measured Value | Result | Notes / Trace |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PWR-01` | ESP32 Power | ESP32 3.3V Rail (VCC) under idle load | 5.0V USB input applied | 3.25 V – 3.35 V | `______ V` | `NOT TESTED` | Cold check passed prior to power |
| `PWR-02` | Sensor 5V Rail | Sensor 5.0V Rail under full sensor load | 5.0V bench supply applied | 4.90 V – 5.25 V | `______ V` | `NOT TESTED` | Must not dip below 4.75V |
| `PWR-03` | ADS1115 VDD | Supply voltage at ADS1115 pin 8 | Sourced from ESP32 3.3V rail | 3.25 V – 3.35 V | `______ V` | `NOT TESTED` | Must NEVER exceed 3.60V |
| `PWR-04` | Sleep Current | Deep sleep quiescent current | ESP32 in deep sleep, sensors powered off | < 25 µA | `______ µA` | `NOT TESTED` | Measured with high-side current shunt |
| `PWR-05` | Active Current | Peak transmit current | ESP32 Wi-Fi active TX (802.11b/g/n) | < 260 mA | `______ mA` | `NOT TESTED` | Peak current captured on DSO |
| `PWR-06` | Batt Sense Divider | Voltage at ESP32 GPIO 35 with 4.2V input | 4.200V applied to VBAT terminal | 1.800 V ± 0.05 V | `______ V` | `NOT TESTED` | 100k / 75k divider nominal 1.800V |

### 3.2 Analog Subsystem & ADS1115 ADC

| Test ID | Peripheral | Test Description | Stimulus / Test Condition | Expected Range | Measured Value | Result | Notes / Trace |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ADC-01` | ADS1115 I2C | I2C Device Address Acknowledgment | I2C Bus Scan at 100 kHz / 400 kHz | ACK at 0x48 | `______` | `NOT TESTED` | GPIO 21 (SDA), GPIO 22 (SCL) |
| `ADC-02` | ADS1115 A0 | Zero ground offset check | Pin A0 connected directly to AGND | 0 – 5 counts (<1 mV) | `______ mV` | `NOT TESTED` | PGA = ±4.096V |
| `ADC-03` | ADS1115 A1 | Precision voltage conversion check | 2.500V precision voltage standard on A1 | 2.495 V – 2.505 V | `______ V` | `NOT TESTED` | Error < 0.2% |
| `ADC-04` | I2C Bus Pull-ups | SCL & SDA Idle Voltage | Active pull-ups to 3.3V | 3.20 V – 3.35 V | `______ V` | `NOT TESTED` | Verifies pull-ups connected |

### 3.3 Soil Sensor Acquisition & Calibration

| Test ID | Peripheral | Test Description | Stimulus / Test Condition | Expected Range | Measured Value | Result | Notes / Trace |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SEN-MOIST-01`| Capacitive V1.2 | Raw voltage in dry air baseline | Probe suspended in air, 25°C | 2.75 V – 3.10 V | `______ V` | `NOT TESTED` | Calibrated VWC = 0.0% |
| `SEN-MOIST-02`| Capacitive V1.2 | Raw voltage in deionized water | Probe immersed to line in DI water | 1.10 V – 1.45 V | `______ V` | `NOT TESTED` | Calibrated VWC = 100.0% |
| `SEN-TEMP-01` | DS18B20 Temp | Ice bath zero reference | Probe submerged in crushed ice bath | -0.5 °C – +0.5 °C | `______ °C` | `NOT TESTED` | 4.7 kΩ pull-up to 3.3V |
| `SEN-TEMP-02` | DS18B20 Temp | Ambient reference validation | Ambient room compared to lab standard | ±0.5 °C vs ref | `______ °C` | `NOT TESTED` | CRC verification enforced |
| `SEN-PH-01`   | Analog pH Kit | Neutral Buffer calibration | Probe submerged in pH 7.00 NIST buffer | 6.95 – 7.05 pH | `______ pH` | `NOT TESTED` | V_neutral ~2.50V |
| `SEN-PH-02`   | Analog pH Kit | Acidic Buffer calibration | Probe submerged in pH 4.01 NIST buffer | 3.95 – 4.05 pH | `______ pH` | `NOT TESTED` | Slope calculation verified |
| `SEN-PH-03`   | Analog pH Kit | Alkaline Buffer calibration | Probe submerged in pH 10.01 NIST buffer| 9.95 – 10.05 pH| `______ pH` | `NOT TESTED` | Three-point curve fit |
| `SEN-EC-01`   | Analog EC Kit | Conductivity standard response | Submerged in 1413 µS/cm standard sol | 1380 – 1445 µS/cm | `______ µS/cm` | `NOT TESTED`| Temp compensation active |
| `SEN-NPK-01`  | RS485 NPK Probe| Modbus RTU Slave 0x01 Read | Query holding registers 0x001E-0x0020 | Valid N, P, K values | `______ mg/kg`| `NOT TESTED`| 9600 baud, 8N1, DE/RE GPIO 27 |

### 3.4 Communication, Security & Ingestion

| Test ID | Peripheral | Test Description | Stimulus / Test Condition | Expected Range | Measured Value | Result | Notes / Trace |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `COM-WIFI-01` | ESP32 Wi-Fi | Association & DHCP Lease Time | Standard 2.4 GHz WPA2 Access Point | < 5.0 seconds | `______ s` | `NOT TESTED` | RSSI > -70 dBm |
| `COM-TLS-01`  | WiFiClientSecure| ISRG Root X1 TLS Certificate Check | Connect to AgriN HTTPS Endpoint | Verified (Zero bypass)| `______` | `NOT TESTED` | setInsecure() prohibited |
| `COM-AUTH-01` | HTTP Client | Bearer Token Authentication | POST /api/telemetry with device token | HTTP 201 Created | `______` | `NOT TESTED` | Token loaded from NVS |
| `COM-INGEST-01`| Backend Ingest | Ingestion Latency | End-to-end telemetry POST to ACK | < 1200 ms | `______ ms` | `NOT TESTED` | Verified in db |
| `QUEUE-01`    | LittleFS Flash | Offline buffer spooling | Disconnect Wi-Fi AP, collect 10 records | 10 records saved | `______` | `NOT TESTED` | LittleFS flash verified |
| `QUEUE-02`    | LittleFS Flash | Offline buffer replay | Reconnect Wi-Fi AP, verify FIFO replay | All replayed & purged| `______` | `NOT TESTED` | Sequence order preserved |

---

## 4. Anomaly and Defect Tracking Log

| Defect ID | Associated Test ID | Symptom / Measured Anomaly | Root Cause Analysis | Corrective Action Taken | Status (Open / Resolved) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DEF-001` | | | | | |
| `DEF-002` | | | | | |

---

## 5. Engineering Sign-Off and Validation Disposition

### Bench Validation Disposition:
- [ ] **ACCEPTED FOR FIELD DEPLOYMENT** (All tests PASS, zero critical defects)
- [ ] **CONDITIONAL ACCEPTANCE** (Minor non-critical defects noted, bench operational)
- [x] **BENCH READY / PENDING PHYSICAL HARDWARE ASSEMBLY** (Design and software verified; physical testing NOT TESTED)
- [ ] **REJECTED** (Critical electrical or functional failure detected)

### Formal Approvals:

| Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Test Execution Engineer** | | ___________________________ | ___________ |
| **Principal Hardware Engineer** | | ___________________________ | ___________ |
| **IoT Firmware Architect** | | ___________________________ | ___________ |
| **Backend Integration Lead** | | ___________________________ | ___________ |
