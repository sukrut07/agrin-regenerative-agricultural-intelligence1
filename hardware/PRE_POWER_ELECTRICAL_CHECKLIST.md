# AgriSense IoT Node — Pre-Power Electrical Verification Checklist

**Document ID**: `AGR-HW-CHK-001`  
**Revision**: `2.2.0`  
**Classification**: Mandatory Safety Verification Protocol  
**Pre-requisite**: Must be completed and signed by the hardware engineer **BEFORE** applying battery or USB power.  

---

## 1. Safety Directives & Golden Rules

> [!CAUTION]
> **ELECTRICAL SAFETY GOLDEN RULES**:
> 1. **Zero 5V on ESP32 GPIOs**: Never expose any ESP32 GPIO pin to voltage $>3.3\text{V}$.
> 2. **ADS1115 Input Ceiling**: Never apply voltage $>3.6\text{V}$ (VDD + 0.3V) to ADS1115 analog inputs A0–A3.
> 3. **No Unverified Sensor Outputs**: Never connect an unverified sensor output directly to an ESP32 or ADS1115 input pin without prior oscilloscope or bench power meter verification.
> 4. **Reverse Polarity Isolation**: Always check battery and solar polarity with a multimeter before plugging into JST connectors.

---

## 2. Unpowered Cold Continuity & Resistance Checks

Execute all checks using a calibrated digital multimeter in resistance / continuity mode with all power sources **DISCONNECTED**:

| Test ID | Measurement Test Points | Target Resistance | Measured Value | Result (PASS / FAIL) | Action on Failure |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **CR-01** | **3.3V Rail to GND** | $>10\text{ k}\Omega$ (No short) | ________ Ω | [ ] PASS [ ] FAIL | STOP! Trace power bus for bridge solder, inverted capacitor, or shorted IC. |
| **CR-02** | **5V / VIN Rail to GND** | $>50\text{ k}\Omega$ (No short) | ________ Ω | [ ] PASS [ ] FAIL | STOP! Inspect USB connector and voltage regulator input. |
| **CR-03** | **Battery Pad (+) to Battery Pad (-)** | $>100\text{ k}\Omega$ | ________ Ω | [ ] PASS [ ] FAIL | STOP! Inspect reverse protection diode and charger input FET. |
| **CR-04** | **OneWire Pull-Up (GPIO 4 to 3.3V)** | $4.7\text{ k}\Omega \pm 5\%$ | ________ Ω | [ ] PASS [ ] FAIL | Inspect R3. Ensure pull-up ties to 3.3V, NOT 5V! |
| **CR-05** | **OneWire Isolation (GPIO 4 to 5V)** | Open Circuit ($>1\text{ M}\Omega$) | ________ Ω | [ ] PASS [ ] FAIL | CRITICAL! Pull-up must never connect to 5V rail. Re-solder to 3.3V. |
| **CR-06** | **RS485 Pull-Down (GPIO 27 to GND)** | $10\text{ k}\Omega \pm 5\%$ | ________ Ω | [ ] PASS [ ] FAIL | Install mandatory 10 kΩ pull-down resistor on DE/RE line. |
| **CR-07** | **I2C Bus Pull-Ups (GPIO 21/22 to 3.3V)**| $2.2\text{ k}\Omega - 10\text{ k}\Omega$ | ________ Ω | [ ] PASS [ ] FAIL | Verify SDA and SCL pull-up resistors are tied to 3.3V rail. |
| **CR-08** | **ADS1115 ADDR Pin to GND** | $0.0\ \Omega \pm 0.5\ \Omega$ (Direct short)| ________ Ω | [ ] PASS [ ] FAIL | Solder ADDR pin to GND to lock I2C address to `0x48`. |
| **CR-09** | **Battery Divider R1 (Batt+ to GPIO 34)**| $100\text{ k}\Omega \pm 1\%$ | ________ Ω | [ ] PASS [ ] FAIL | Replace R1 with precision 100 kΩ 1% metal film resistor. |
| **CR-10** | **Battery Divider R2 (GPIO 34 to GND)** | $100\text{ k}\Omega \pm 1\%$ | ________ Ω | [ ] PASS [ ] FAIL | Replace R2 with precision 100 kΩ 1% metal film resistor. |
| **CR-11** | **Common Ground Star Integrity** | $<0.2\ \Omega$ across all modules| ________ Ω | [ ] PASS [ ] FAIL | Re-route ground lines to common star ground terminal. |

---

## 3. Powered Rail Verification (MCU & Probes Unpopulated)

Apply 3.7V from an adjustable bench power supply with current limit set to **100 mA**:

| Test ID | Test Condition | Test Point | Target Voltage Range | Measured | Result |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **VR-01** | Bench supply 3.7V on battery terminals | ESP32 3V3 Pin | $3.28\text{ V} - 3.35\text{ V}$ | ______ V | [ ] PASS [ ] FAIL |
| **VR-02** | Bench supply 3.7V on battery terminals | ADS1115 VDD Pin | $3.28\text{ V} - 3.35\text{ V}$ | ______ V | [ ] PASS [ ] FAIL |
| **VR-03** | Bench supply 3.7V on battery terminals | MAX3485 VCC Pin | $3.28\text{ V} - 3.35\text{ V}$ | ______ V | [ ] PASS [ ] FAIL |
| **VR-04** | Bench supply 4.20V on battery terminals | GPIO 34 Test Point | **$2.10\text{ V} \pm 0.03\text{ V}$** | ______ V | [ ] PASS [ ] FAIL |
| **VR-05** | Bench supply 3.20V on battery terminals | GPIO 34 Test Point | **$1.60\text{ V} \pm 0.03\text{ V}$** | ______ V | [ ] PASS [ ] FAIL |
| **VR-06** | Solar In 5.5V applied to solar pads | Battery Charger Output Pad | $4.18\text{ V} - 4.22\text{ V}$ (Cutoff)| ______ V | [ ] PASS [ ] FAIL |
| **VR-07** | RS485 Transceiver Quiescent State | GPIO 27 (DE/RE) | $<0.10\text{ V}$ (Strictly LOW) | ______ V | [ ] PASS [ ] FAIL |

---

## 4. Sensor Interface Compatibility & Datasheet Flags

Review physical hardware modules against manufacturer datasheets before connecting signal lines:

```
+-----------------------------------------------------------------------------------------+
|                                    DATASHEET FLAGS                                      |
+-----------------------------------------------------------------------------------------+
| [FLAG 1] Soil pH Conditioning Board Supply:                                            |
|   - Many generic analog pH boards specify 5.0V VCC.                                     |
|   - IF supplied with 5.0V, output voltage swings up to 4.2V!                            |
|   - ACTION: Verify module works at 3.3V. If not, add resistive divider (10k/20k).       |
|                                                                                         |
| [FLAG 2] Soil EC Conditioning Board Supply:                                             |
|   - Confirm AC excitation circuit operates cleanly at 3.3V without clipping.            |
|   - ACTION: Measure output in air (0.0V) and KCl standard (<2.5V) before connecting.    |
|                                                                                         |
| [FLAG 3] RS485 NPK Sensor Power Rail:                                                   |
|   - Commercial NPK probes require 9V - 24V DC external power.                           |
|   - NEVER CONNECT 12V SUPPLY TO ESP32 OR ADS1115 RAILS!                                |
|   - ACTION: Isolate 12V supply; connect ONLY ground reference and RS485 A/B lines.      |
|                                                                                         |
| [FLAG 4] DS18B20 Parasitic Power Mode:                                                  |
|   - Firmware expects normal powered mode (VDD = 3.3V, GND = GND, DQ = GPIO 4).          |
|   - ACTION: Do NOT tie VDD to GND for parasitic mode; provide active 3.3V supply.       |
+-----------------------------------------------------------------------------------------+
```

---

## 5. Pre-Power Sign-off Gate

The electrical technician and lead embedded engineer must certify that all pre-power checks have passed before any physical sensor or ESP32 board is powered:

- **Inspecting Engineer**: ___________________________
- **Date**: ___________________________
- **Overall Result**: **[ ] APPROVED TO POWER ON  |  [ ] REJECTED — DEFECTS PRESENT**
- **Notes / Anomalies**: ___________________________________________________________
