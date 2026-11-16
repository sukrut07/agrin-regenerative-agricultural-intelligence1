# AgriSense IoT Node — Hardware Team Pre-Flight Verification Checklist

**Version**: `2.0.0`  
**Classification**: Quality Assurance & Assembly Verification Protocol  
**Target Board**: ESP32 DevKit V1 Hardware Node (or custom PCB)  

---

## 1. Electrical & Power Rail Verification (Unpowered & Bench Power)

Before inserting the ESP32 module or attaching any physical sensors, perform cold-continuity and rail voltage checks:

- [ ] **Short Circuit Check**:
  - Multimeter in continuity mode between **3V3 Rail** and **GND**: Must show open circuit (resistance $> 100\text{ k}\Omega$).
  - Multimeter in continuity mode between **5V / VBUS Rail** and **GND**: Must show open circuit.
- [ ] **Voltage Regulator Validation**:
  - Power via 3.7V Li-ion battery or 5V bench supply.
  - Measure 3V3 rail with calibrated multimeter: Must be **$3.30\text{ V} \pm 0.05\text{ V}$**.
  - Measure 5V boost converter output: Must be **$5.00\text{ V} \pm 0.10\text{ V}$**.
- [ ] **Battery Charger Check (CN3065 / TP4056)**:
  - Connect 6V solar panel or 5V USB to solar input.
  - Verify charging LED activates.
  - Measure battery charge cutoff voltage: Must not exceed **$4.20\text{ V} \pm 0.03\text{ V}$**.
- [ ] **Battery Voltage Divider Check**:
  - Apply 4.00V to battery terminals.
  - Measure voltage at ESP32 GPIO 34 test point: Must measure exactly **$2.00\text{ V} \pm 0.02\text{ V}$** ($K=2.000$).
  - Verify 100 nF ceramic capacitor is present between GPIO 34 and GND for anti-aliasing.

---

## 2. Bus Lines & Resistor Verification

- [ ] **OneWire Bus (GPIO 4)**:
  - Verify **4.7 kΩ $\pm 1\%$ resistor** is soldered between GPIO 4 and the **3.3V rail**.
  - **CRITICAL**: Confirm pull-up is tied to **3.3V**, NEVER to 5V!
  - Unconnected GPIO 4 must measure 3.3V logic HIGH with multimeter.
- [ ] **I2C Bus (GPIO 21 SDA, GPIO 22 SCL)**:
  - Verify 4.7 kΩ pull-up resistors to 3.3V are present on both SDA and SCL.
  - Verify ADS1115 ADDR pin is tied to GND (sets I2C address to `0x48`).
- [ ] **RS485 Modbus Transceiver (MAX3485)**:
  - Confirm transceiver IC is **MAX3485** (3.3V rated), NOT a 5V MAX485.
  - Confirm pins `DE` and `RE` are tied together and routed to ESP32 **GPIO 5**.
  - Confirm `RO` is routed to **GPIO 16** (RX2) and `DI` is routed to **GPIO 17** (TX2).
  - Verify 120 Ω bus termination resistor is placed across A and B terminals on long wire runs.

---

## 3. Sensor Probe Integration & Pre-Deployment Check

- [ ] **Capacitive Moisture Sensor v1.2**:
  - Inspect PCB edge: Verify conformal coating or waterproofing silicone covers the top electronics and IC.
  - Connect analog output to ADS1115 A0.
  - Measure voltage in dry air: Should read ~2.8V – 3.0V.
  - Touch capacitive plate with damp cloth: Voltage should drop significantly to ~1.4V – 1.8V.
- [ ] **DS18B20 Temperature Probe**:
  - Connect Red (VDD $\rightarrow$ 3.3V), Black (GND), Yellow/Blue (Data $\rightarrow$ GPIO 4).
  - Verify probe tip is sealed with waterproof epoxy inside stainless steel tube.
  - In serial monitor, confirm temperature reads room ambient (e.g. 22°C – 26°C), NOT `-127.0°C` or `+85.0°C`.
- [ ] **Soil pH Conditioning Board**:
  - Supply board with 3.3V.
  - Connect BNC probe. Submerge into pH 7.00 buffer: Voltage into ADS1115 A1 should read $2.45\text{ V} \pm 0.15\text{ V}$.
  - Submerge into pH 4.01 buffer: Voltage should read $2.95\text{ V} \pm 0.15\text{ V}$.
- [ ] **Soil EC Conductivity Probe**:
  - Connect probe into ADS1115 A2.
  - Probe in dry air: Voltage ~0.0V.
  - Probe submerged in 1413 µS/cm standard solution: Voltage should read $1.45\text{ V} \pm 0.10\text{ V}$.
- [ ] **RS485 NPK Sensor (If installed)**:
  - Power probe from 12V boost rail.
  - Connect A $\rightarrow$ A, B $\rightarrow$ B.
  - Confirm serial monitor outputs valid Nitrogen, Phosphorus, Potassium readings without CRC timeout errors.
  - If NPK probe is omitted for lower-cost field tier: Confirm firmware logs `UNAVAILABLE` and continues operating smoothly.

---

## 4. Mechanical Enclosure & Environmental Sealing

- [ ] **IP65/IP67 Weatherproofing**:
  - Verify PG7 / PG9 cable glands are tightened around sensor cables with rubber seals compressed.
  - Verify silica gel desiccant pack is placed inside the enclosure to absorb condensation.
  - Inspect lid silicone gasket for proper seating before closing screws.
  - Verify solar panel cable enters from the bottom of the enclosure to form a drip loop.

---

## 5. Hardware Sign-Off Sheet

| Test Stage | Inspected By | Date Verified | Pass / Fail | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Power Rails & 3.3V Verification** | | | | |
| **Pull-up Resistors & Level Shift** | | | | |
| **ADS1115 I2C Bus Detection** | | | | |
| **DS18B20 Temp Probe Validation** | | | | |
| **Capacitive Moisture Dry/Wet Test**| | | | |
| **pH Buffer 4/7 Calibration** | | | | |
| **EC 1413 µS/cm Calibration** | | | | |
| **Battery Divider Calibration (GPIO 34)** | | | | |
| **Enclosure Gasket & Drip Loops** | | | | |
