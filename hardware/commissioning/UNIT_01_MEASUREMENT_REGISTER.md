# AgriSense Prototype Unit 01 — Cold-Check Physical Measurement Register

> **Document ID:** AGRIN-REG-UNIT01-001  
> **Status:** PENDING BENCH MEASUREMENT  
> **Target:** AgriSense Field Node Prototype Unit 01  
> **Hardware Profile:** ESP32-DevKit-V1 (30-pin) + Carrier Prototype Board Rev 1.0  
> **Safety Notice:** Complete ALL measurements with board UNPOWERED before applying any voltage source.  

---

## 1. Register Metadata

| Parameter | Specification / Field Record |
| :--- | :--- |
| **Unit Serial Number / ID** | `AGRISENSE-PROTO-01` |
| **Carrier Board Revision** | `Rev 1.0 (Breadboard / Point-to-Point Carrier)` |
| **ESP32 DevKit Model** | `ESP32-WROOM-32 (30-Pin NodeMCU style)` |
| **Measurement Date & Time** | `[YYYY-MM-DD HH:MM UTC - Enter at test time]` |
| **Measurement Location** | `[Hardware Laboratory / Bench ID]` |
| **Lead Validation Engineer** | `[Enter Engineer Name]` |
| **Verification Instrument (DMM)** | `[Enter DMM Make, Model, Serial, Cal Date]` |
| **Instrument Resolution / Mode** | `Resistance (Ω / kΩ) & Audible Continuity` |

---

## 2. Measurement Status Legend

- **`NOT MEASURED`**: Initial state; physical probes have not yet touched the test points.
- **`PENDING REVIEW`**: Measurement recorded by technician; awaiting lead engineer sign-off.
- **`ACCEPTABLE`**: Measured value is strictly within the specified tolerance band.
- **`INVESTIGATE`**: Measured value deviates from expectation but does not present an immediate safety hazard; requires explanation.
- **`FAIL`**: Measured parameter represents a hazardous short circuit, missing pull-down, or over-voltage risk. **HALT WORK IMMEDIATELY.**

---

## 3. Unpowered Cold-Check Measurement Table

> [!CAUTION]
> If any measurement results in `FAIL`, do **NOT** connect USB, battery, or DC bench supply. Troubleshoot and resolve the defect before re-testing.

| Test ID | Test Points | Expected Range | Technical Justification | Module State (Connected / Isolated) | Actual Measured Value | Verification Status | Evidence Ref (Photo / Lab Log) | Reviewer Approval |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **1.1** | **GND Star Continuity**<br>`ESP32 GND` $\leftrightarrow$ `ADS1115 GND`<br>`ESP32 GND` $\leftrightarrow$ `Sensor Term GND`<br>`ESP32 GND` $\leftrightarrow$ `Power Input GND` | $< 0.5\ \Omega$<br>(Continuous) | Unbroken star ground reference prevents ground loops and analog offset errors across sensors. | All modules mounted | `______` $\Omega$<br>`______` $\Omega$<br>`______` $\Omega$ | `NOT MEASURED` | `PHOTO-COLD-01` | [ ] Approved |
| **1.2** | **3.3V Rail Isolation**<br>`ESP32 3V3` $\leftrightarrow$ `GND` | $> 1\text{ k}\Omega$<br>(Typ. $> 10\text{ k}\Omega$) | Verifies no direct solder bridge or damaged decoupling capacitor across 3.3V power bus. | All modules mounted | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-02` | [ ] Approved |
| **1.3** | **5.0V Rail Isolation**<br>`ESP32 VIN` $\leftrightarrow$ `GND` | $> 5\text{ k}\Omega$<br>(Typ. $> 50\text{ k}\Omega$) | Verifies no short circuit on primary 5V supply bus before applying external current. | All modules mounted | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-03` | [ ] Approved |
| **1.4** | **3.3V to 5.0V Rail Isolation**<br>`ESP32 3V3` $\leftrightarrow$ `ESP32 VIN (5V)` | $> 5\text{ k}\Omega$<br>(High Impedance) | **CRITICAL SAFETY CHECK:** A bridge between 5V and 3.3V destroys the ESP32 silicon and ADS1115 ADC instantly. | All modules mounted | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-04` | [ ] Approved |
| **1.5** | **GPIO 27 RS485 DE/RE Pull-Down**<br>`ESP32 GPIO 27` $\leftrightarrow$ `GND` | $9.8\text{ k}\Omega - 10.2\text{ k}\Omega$<br>(10 kΩ ± 2%) | Ensures MAX3485 DE/RE is held in Receiver Mode (`LOW`) during boot, reset, and deep sleep. | MAX3485 connected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-05` | [ ] Approved |
| **1.6** | **DS18B20 1-Wire Pull-Up**<br>`ESP32 GPIO 4` $\leftrightarrow$ `3V3 Rail` | $4.6\text{ k}\Omega - 4.8\text{ k}\Omega$<br>(4.7 kΩ ± 2%) | Required pull-up for open-drain Dallas 1-Wire bus communication. Must be referenced to 3.3V. | Probe connected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-06` | [ ] Approved |
| **1.7A**| **I2C Bus SDA Pull-Up**<br>`ESP32 GPIO 21 (SDA)` $\leftrightarrow$ `3V3` | $2.0\text{ k}\Omega - 4.8\text{ k}\Omega$<br>(See Section 4) | Validates pull-up network to 3.3V. Accounts for onboard module resistors in parallel. | ADS1115 connected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-07A` | [ ] Approved |
| **1.7B**| **I2C Bus SCL Pull-Up**<br>`ESP32 GPIO 22 (SCL)` $\leftrightarrow$ `3V3` | $2.0\text{ k}\Omega - 4.8\text{ k}\Omega$<br>(See Section 4) | Validates pull-up network to 3.3V. Accounts for onboard module resistors in parallel. | ADS1115 connected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-07B` | [ ] Approved |
| **1.8A**| **Battery Divider Upper Leg (R1)**<br>`VBAT Input` $\leftrightarrow$ `GPIO 34` | $98\text{ k}\Omega - 102\text{ k}\Omega$<br>(100 kΩ ± 2%) | Top leg of precision battery divider. Protects ADC1_CH6 from voltages exceeding 3.3V. | Battery disconnected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-08A` | [ ] Approved |
| **1.8B**| **Battery Divider Lower Leg (R2)**<br>`GPIO 34` $\leftrightarrow$ `GND` | $98\text{ k}\Omega - 102\text{ k}\Omega$<br>(100 kΩ ± 2%) | Bottom leg of precision battery divider ($K=2.000$ ratio). | Battery disconnected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-08B` | [ ] Approved |
| **1.8C**| **Battery Divider Total Resistance**<br>`VBAT Input` $\leftrightarrow$ `GND` | $196\text{ k}\Omega - 204\text{ k}\Omega$<br>(200 kΩ ± 2%) | Total DC leakage through divider when battery is attached: $I_{leak} \approx 21\ \mu\text{A}$ at 4.2V. | Battery disconnected | `______` $\text{k}\Omega$ | `NOT MEASURED` | `PHOTO-COLD-08C` | [ ] Approved |

---

## 4. Special Technical Assessment: I2C Parallel Resistor Analysis (Item 1.7)

Many commercial ADS1115 breakout boards (e.g. Adafruit, CJMCU, Waveshare) incorporate onboard **10 kΩ pull-up resistors** connected from SDA and SCL to the breakout's VDD terminal.

When external **4.7 kΩ pull-up resistors** are simultaneously soldered on the carrier board, the effective parallel pull-up resistance is:

$$R_{\text{effective}} = \frac{R_{\text{carrier}} \times R_{\text{breakout}}}{R_{\text{carrier}} + R_{\text{breakout}}} = \frac{4.7\text{ k}\Omega \times 10.0\text{ k}\Omega}{4.7\text{ k}\Omega + 10.0\text{ k}\Omega} = 3.197\text{ k}\Omega$$

- **Acceptable I2C Resistance Band for 100 kHz / 400 kHz Standard Mode:** $1.8\text{ k}\Omega \le R_{\text{effective}} \le 4.8\text{ k}\Omega$.
- **Hazardous Condition ($R_{\text{effective}} < 1.5\text{ k}\Omega$):** Overly strong pull-up. The open-drain output FETs inside the ESP32 and ADS1115 may be unable to sink enough current ($I_{OL}$) to pull the bus voltage below the logic-low input threshold $V_{IL} = 0.3 \times 3.3\text{V} = 0.99\text{V}$, resulting in bus lockup or communication errors.
- **Action for Hardware Technician:** Measure Items 1.7A and 1.7B with ADS1115 breakout plugged in. If reading is between $2.0\text{ k}\Omega$ and $4.8\text{ k}\Omega$, mark `ACCEPTABLE`. If reading is $< 1.5\text{ k}\Omega$, remove the external 4.7 kΩ resistors and rely on the module pull-ups.

---

## 5. Engineer Sign-Off for Stage A (Cold Verification)

> **STRICT SAFETY RULE:** Power must NOT be applied to Prototype Unit 01 until every item in Section 3 is marked `ACCEPTABLE` and signed below.

| Role | Engineer Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Measurement Technician** | | ___________________________ | ___________ |
| **Senior Hardware Engineer** | | ___________________________ | ___________ |
| **IoT Lead Architect** | | ___________________________ | ___________ |
