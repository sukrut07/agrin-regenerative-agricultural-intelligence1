# AgriSense System Integration & Pre-Deployment Checklist

> **Document ID:** AGRIN-INT-CHK-001  
> **Status:** Final Field Gate Verification  
> **Target:** AgriSense Field Nodes (ESP32-DevKit-V1 / Carrier Board)  
> **Scope:** Hardware, Firmware, Electrical Safety, Ingestion API, and Agronomic Pipeline Integration  

---

## 1. System Identification

- **Device Name:** `AgriSense-Node-Parbhani-01`
- **Device Hardware ID (MAC):** `________________________`
- **Assigned AgriN Device ID:** `________________________`
- **Target Field / Farm ID:** `________________________`
- **Assigned Crop & Soil Profile:** `Cotton / Vertisol (Deep Black Soil)`
- **Integration Lead Engineer:** `________________________`
- **Date of Verification:** `YYYY-MM-DD`

---

## 2. Phase 1: Mechanical & Physical Enclosure Verification

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **M-01** | Enclosure Ingress Rating | IP65 or IP67 weatherproof enclosure with intact EPDM/silicone gasket | [ ] | Gasket clean, properly seated |
| **M-02** | Cable Glands & Feedthroughs | PG7/PG9 glands installed with rubber seals sized to sensor cable outer diameters | [ ] | No gaps or pinch damage |
| **M-03** | Internal Mounting & Standoffs | ESP32 DevKit and carrier board securely fastened with nylon/brass standoffs | [ ] | Anti-vibration secure |
| **M-04** | Moisture Protection | 5g/10g silica gel desiccant packet placed inside enclosure | [ ] | Fresh indicator card (blue) |
| **M-05** | Conformal Coating | PCB moisture-barrier conformal coating applied to all components except connectors & antenna | [ ] | UV inspection verified |
| **M-06** | Connector Keying & Labeling | JST-XH / screw terminals keyed and distinctly labeled (PWR, I2C, 1W, RS485) | [ ] | Prevents misconnection |

---

## 3. Phase 2: Electrical Safety & Power Subsystem Verification

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **E-01** | Common Ground Bus | Star ground integrity: 0.0 Ω resistance between ESP32 GND, ADS1115 GND, and all sensor grounds | [ ] | DMM 4-wire measurement |
| **E-02** | 3.3V Power Rail Voltage | Voltage measured across ESP32 3V3 pin and GND is 3.25V – 3.35V | [ ] | Within LDO tolerance |
| **E-03** | 5.0V Sensor Rail Voltage | Voltage measured across sensor 5V bus is 4.90V – 5.25V under load | [ ] | Powers pH & EC boards |
| **E-04** | ADS1115 Analog Input Range | ADS1115 VDD pin measured at 3.3V; no analog channel exceeds 3.3V under any condition | [ ] | Hard ceiling: 3.60V max |
| **E-05** | RS485 DE/RE Safe Boot State | GPIO 27 verified at 0.0V (LOW) during boot, reset, and deep sleep via 10 kΩ pull-down | [ ] | Eliminates bus contention |
| **E-06** | Battery Reverse Polarity Protection | Schottky diode (SS34) or P-channel MOSFET circuit verified on battery input | [ ] | Prevents reverse hookup damage |
| **E-07** | Battery Voltage Divider | R1 (100 kΩ) & R2 (75 kΩ) verified; 4.2V battery produces exactly ~1.80V on GPIO 35 | [ ] | ADC1 linear region |

---

## 4. Phase 3: Firmware, Security & Cryptography Verification

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **F-01** | Production Firmware Build | Build flashed from clean release tag with compiler optimizations (`-Os`) | [ ] | Commit SHA logged |
| **F-02** | Device Registration & Auth | Device registered via `POST /api/devices/register`; Bearer Token written to NVS | [ ] | Token valid & authenticated |
| **F-03** | TLS Certificate Verification | `WiFiClientSecure` actively validating Let's Encrypt ISRG Root X1 CA; `setInsecure()` strictly absent | [ ] | Zero TLS bypasses |
| **F-04** | Hardware Watchdog Timer | ESP32 Task Watchdog Timer (TWDT) enabled with 30-second timeout | [ ] | Prevents lockups |
| **F-05** | LittleFS Flash Journaling | Offline telemetry queue partition (`spiffs`/`littlefs`) mounted and clean | [ ] | Recovers on power drop |
| **F-06** | Debug Output Sanitization | Verbose UART logging disabled or set to `ERROR`/`WARN` for deployment | [ ] | Protects credentials |

---

## 5. Phase 4: Sensor Array Integration & Live Calibration

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :--- | :--- |
| **S-01** | Capacitive Soil Moisture | Air Dry reads 0% (±2%); Saturated water reads 100% (±3%); raw ADC within 1000–3200 | [ ] | Dual baseline confirmed |
| **S-02** | DS18B20 Soil Temperature | Temperature reads room ambient (±0.5°C); 1-Wire CRC verified; no disconnected -127°C | [ ] | Factory ROM logged |
| **S-03** | Soil pH Sensor | 2-point buffer test (pH 4.01 & 7.00) confirms slope within 92%–105% of Nernstian ideal | [ ] | Zero-div guard confirmed |
| **S-04** | Soil EC Sensor | 1413 µS/cm standard solution reads within ±5% after automatic temperature compensation | [ ] | Normalized to 25°C |
| **S-05** | RS485 Modbus NPK Sensor | Modbus RTU holding registers return valid non-negative readings OR flagged as UNAVAILABLE | [ ] | No arbitrary zero injection |

---

## 6. Phase 5: Network Resiliency & Ingestion Pipeline Verification

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **N-01** | AP Association & DHCP | Node associates with Wi-Fi AP and obtains valid IP in < 5 seconds | [ ] | RSSI > -75 dBm |
| **N-02** | HTTP Ingest Response | Node successfully posts telemetry to `POST /api/telemetry` with `201 Created` | [ ] | Verified in database |
| **N-03** | Offline Journal Spooling | When Wi-Fi is powered off, node stores 5+ consecutive readings to flash without panic | [ ] | Zero packet loss |
| **N-04** | Queue Replay on Restoral | When Wi-Fi is restored, node transmits stored records in FIFO sequence with server ACK | [ ] | All buffers cleared |
| **N-05** | Deduplication Protection | Submitting identical timestamp and sequence number yields proper deduplication | [ ] | Database uniqueness enforced |

---

## 7. Phase 6: Agronomic Intelligence & Farmer Dashboard Verification

| Item # | Inspection Item | Acceptance Criteria | Verified | Comments / Notes |
| :---: | :--- | :--- | :---: | :--- |
| **A-01** | Honest Provenance Tagging | AgriN Confidence Report tags measured parameters `SENSOR_MEASURED` and unmeasured `UNAVAILABLE` | [ ] | Zero fabrication |
| **A-02** | Soil Health & Crop Advisory | Intelligence pipeline successfully generates crop suitability and irrigation guidance | [ ] | Vertisol / Cotton rules |
| **A-03** | React Dashboard Display | Live reading cards update on farmer web dashboard (`/iot-devices`) with real values | [ ] | Telemetry card green |
| **A-04** | Historical Trend Graphing | Telemetry history endpoint `/api/telemetry/{device_id}/history` returns chart series | [ ] | Verified in UI |

---

## 8. Final Deployment Sign-Off & Disposition

### Final System Disposition:
- [ ] **CERTIFIED FOR FIELD DEPLOYMENT**  
- [x] **READY FOR PHYSICAL BENCH ASSEMBLY (Software, Firmware, Schematics & Tests 100% Complete)**  
- [ ] **DEFICIENT — RETURN FOR REMEDIATION**  

### Signatures:

| Role | Printed Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Hardware Lead Engineer** | | ___________________________ | ___________ |
| **Firmware Architect** | | ___________________________ | ___________ |
| **Agronomic System Lead** | | ___________________________ | ___________ |
| **Quality Assurance Lead** | | ___________________________ | ___________ |
