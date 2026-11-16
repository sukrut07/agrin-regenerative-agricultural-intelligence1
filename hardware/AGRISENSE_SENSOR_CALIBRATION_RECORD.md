# AgriSense Sensor Calibration & Bench Verification Record

> **Document ID:** AGRIN-CAL-REC-001  
> **Status:** Standard Operating Calibration Record  
> **Target:** Field Node Multi-Sensor Array  
> **Standard:** ISO/IEC 17025 Traceable Practice Guidelines  

---

## 1. Calibration Session & Device Identification

| Parameter | Recorded Value |
| :--- | :--- |
| **Calibration Session ID** | `CAL-YYYYMMDD-DEV<N>` |
| **Calibration Date & Time (UTC)**| `YYYY-MM-DD HH:MM:SS` |
| **Executing Calibration Technician**| |
| **Quality Assurance Officer** | |
| **Device Hardware ID (EUI-48 / MAC)**| `XX:XX:XX:XX:XX:XX` |
| **Assigned AgriN Device ID** | `agr-dev-xxxxxxxx` |
| **Firmware Revision** | `v2.1.0-bench-rel` |
| **Ambient Air Temperature** | `__._ °C` |
| **Ambient Relative Humidity** | `__ %` |
| **Atmospheric Pressure** | `____ hPa` |

---

## 2. Chemical Reference Standards Traceability

| Standard Type | Nominal Value | Lot / Batch Number | Expiration Date | Manufacturer |
| :--- | :--- | :--- | :--- | :--- |
| **pH Buffer 1 (Neutral)** | 7.000 pH @ 25°C | | | Hamilton / Hanna |
| **pH Buffer 2 (Acidic)** | 4.010 pH @ 25°C | | | Hamilton / Hanna |
| **pH Buffer 3 (Alkaline)** | 10.010 pH @ 25°C | | | Hamilton / Hanna |
| **Conductivity Standard** | 1413 µS/cm @ 25°C | | | Hanna / Oakton |
| **Deionized Water (DI)** | < 1.0 µS/cm | | | In-house Millipore |
| **Reference Thermometer** | 0.01 °C resolution | | | Fluke / Hart Scientific |

---

## 3. Sensor Calibration Data Sheets

### 3.1 Capacitive Soil Moisture Sensor (v1.2 Analog)

*Connected to ADS1115 Channel A0 (PGA = ±4.096V)*

- **Air Dry Baseline (0.0% VWC):**
  - Raw ADC Counts: `__________ counts`
  - Computed Voltage: `__________ V` (Target: 2.75V – 3.10V)
- **Saturated DI Water Baseline (100.0% VWC):**
  - Raw ADC Counts: `__________ counts`
  - Computed Voltage: `__________ V` (Target: 1.10V – 1.45V)
- **Calibration Coefficients to Flash (NVS):**
  - `CALIB_MOISTURE_AIR_RAW` = `__________`
  - `CALIB_MOISTURE_WATER_RAW` = `__________`
- **Verification Check:**
  - Air test: Calibrated Moisture Output = `0.0 %` [PASS / FAIL]
  - Submerged test: Calibrated Moisture Output = `100.0 %` [PASS / FAIL]

---

### 3.2 Soil Temperature Sensor (DS18B20 1-Wire Digital)

*Connected to ESP32 GPIO 4 (External 4.7 kΩ Pull-up to 3.3V)*

- **64-bit ROM / Scratchpad Address:** `0x________________`
- **Ice-Water Slurry Test (0.00°C Reference):**
  - Reference Thermometer: `0.00 °C`
  - DS18B20 Raw Reading: `__._ °C` (Acceptance: -0.50°C to +0.50°C)
  - Error: `__._ °C`
- **Ambient Room Temperature Test:**
  - Reference Thermometer: `__._ °C`
  - DS18B20 Raw Reading: `__._ °C` (Acceptance: ±0.50°C of ref)
  - Error: `__._ °C`
- **CRC Error Rate:** `0 / 100 queries` [PASS / FAIL]

---

### 3.3 Soil pH Electrode & Signal Conditioner

*Connected to ADS1115 Channel A1 (Signal Conditioning Board powered by 5.0V)*

- **Step 1: Neutral Buffer Calibration (pH 7.00 @ 25°C):**
  - Solution Temp: `__._ °C` (Temperature-compensated target: `_____ pH`)
  - Measured ADC Raw Counts: `__________ counts`
  - Measured Voltage ($V_{7.00}$): `__________ V` (Nominal target: 2.500 V)
- **Step 2: Acidic Buffer Calibration (pH 4.01 @ 25°C):**
  - Solution Temp: `__._ °C` (Temperature-compensated target: `_____ pH`)
  - Measured ADC Raw Counts: `__________ counts`
  - Measured Voltage ($V_{4.01}$): `__________ V` (Nominal target: ~3.050 V)
- **Step 3: Alkaline Buffer Calibration (pH 10.01 @ 25°C):**
  - Solution Temp: `__._ °C` (Temperature-compensated target: `_____ pH`)
  - Measured ADC Raw Counts: `__________ counts`
  - Measured Voltage ($V_{10.01}$): `__________ V` (Nominal target: ~1.950 V)
- **Derived Calibration Constants:**
  - Calculated Acid Slope ($S_{acid} = \frac{V_{4.01} - V_{7.00}}{4.01 - 7.00}$): `_____ mV/pH` (Theoretical: -59.16 mV/pH)
  - Electrode Nernst Efficiency: `___._ %` (Acceptance: 92% – 105%)
- **Coefficients Committed to NVS:**
  - `CALIB_PH_V7` = `______` mV
  - `CALIB_PH_SLOPE_ACID` = `______` mV/pH
  - `CALIB_PH_SLOPE_BASE` = `______` mV/pH

---

### 3.4 Soil Electrical Conductivity (EC) Sensor

*Connected to ADS1115 Channel A2*

- **Step 1: Dry Air Zero Check:**
  - Measured Voltage: `0.000 V`
  - Computed EC: `0.0 µS/cm` [PASS / FAIL]
- **Step 2: Conductivity Standard (1413 µS/cm @ 25°C):**
  - Solution Temp ($T_{meas}$): `__._ °C`
  - Temperature Normalized Target: $EC_{ref} = \frac{1413}{1.0 + 0.020 \times (T_{meas} - 25.0)}$ = `_____ µS/cm`
  - Measured ADC Counts: `__________ counts`
  - Measured Voltage: `__________ V`
- **Calibration Factor ($K_{cell}$):**
  - Derived $K_{cell}$ factor: `______`
  - Flash NVS Parameter `CALIB_EC_KCELL` = `______`
- **Verification in Secondary Solution (e.g. 500 µS/cm or Diluted standard):**
  - Expected EC: `_____ µS/cm` | Measured EC: `_____ µS/cm` | Error: `__._ %` (Max 5.0%)

---

### 3.5 Soil NPK Modbus RS485 Probe

*Connected to MAX3485 (UART2: GPIO 16 RX, GPIO 17 TX, GPIO 27 DE/RE)*

- **Modbus RTU Communication Verification:**
  - Baud: 9600, Data: 8-bit, Parity: None, Stop: 1-bit
  - Modbus Slave ID: `0x01` (Factory default)
  - Read Holding Registers command: `01 03 00 1E 00 03 65 CD`
  - Response Hex Dump: `________________________________`
  - Modbus CRC-16 Checksum: [VALID / CORRUPT]
- **Baseline Measurements in Calibrated Soil Reference Sample:**
  - Nitrogen (N): `_____ mg/kg`
  - Phosphorus (P): `_____ mg/kg`
  - Potassium (K): `_____ mg/kg`
- **Status:** [FUNCTIONAL / UNINSTALLED / UNAVAILABLE]
  *(Note: If NPK probe is uninstalled or absent, verify firmware outputs status UNAVAILABLE without fabricating zeroes)*

---

## 4. NVS Flash Persistence & Verification

After acquiring all calibration coefficients, execute the NVS provisioning command:

```bash
# Example provisioning via serial terminal CLI
agrisense-cli config set-calib \
  --moist-air 2980 \
  --moist-water 1250 \
  --ph-v7 2502 \
  --ph-slope-acid -57.8 \
  --ec-kcell 1.024
```

### Verification Checks:
1. Power cycle the ESP32 (hard reset via EN button).
2. Read back stored NVS parameters via debug serial log:
   - [ ] Stored `CALIB_MOISTURE_AIR_RAW` matches calibrated value.
   - [ ] Stored `CALIB_MOISTURE_WATER_RAW` matches calibrated value.
   - [ ] Stored `CALIB_PH_V7` matches calibrated value.
   - [ ] Stored `CALIB_PH_SLOPE_ACID` matches calibrated value.
   - [ ] Stored `CALIB_EC_KCELL` matches calibrated value.

---

## 5. Calibration Sign-Off & Certificate of Compliance

I hereby certify that the above sensor calibrations were conducted in accordance with documented standard laboratory procedures using traceable instruments and fresh chemical standards.

| Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Calibration Specialist** | | ___________________________ | ___________ |
| **Laboratory Supervisor** | | ___________________________ | ___________ |
| **Lead IoT Systems Engineer** | | ___________________________ | ___________ |
