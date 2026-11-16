# AgriSense Prototype Unit 01 — Controlled Power-On Procedure

> **Document ID:** AGRIN-SOP-PWR-001  
> **Status:** Standard Operating Procedure  
> **Target:** AgriSense Field Node Prototype Unit 01  
> **Enforcement:** Mandatory sequential gating. No stage may be bypassed.  

---

## 1. Safety Principles & Zero-Damage Policy

To prevent silicon damage, electrical overstress, or brownout-induced latch-up:
1. **Never apply uncalibrated or unregulated power:** Always utilize a programmable DC bench power supply with precision current limiting ($CC$ mode) for initial bring-up.
2. **Never hot-plug sensor signal lines into the ADC:** Analog input lines must be isolated until the ADS1115 supply voltage (3.3V) and sensor conditioned output voltage range are physically measured with a calibrated DMM.
3. **Immediate Power Shutdown Criteria:**
   - Any rail voltage deviating by more than $\pm 5\%$ from nominal.
   - Any current consumption exceeding the pre-set stage limit.
   - Any component heating noticeably to the touch ($> 45^\circ\text{C}$).
   - Any smoke, odor, or audible squeal from inductors or regulators.

---

## 2. Sequential Staged Bring-Up Procedure

```
[Stage A: Cold Verification]
         │
         ▼
[Stage B: Human Safety Approval]
         │
         ▼
[Stage C: First Power Application (Current Limited)]
         │
         ▼
[Stage D: Rail Verification (DMM Measurement)]
         │
         ▼
[Stage E: ESP32-Only Startup & Boot Log Verification]
         │
         ▼
[Stage F: I2C Diagnostics & ADS1115 Discovery]
         │
         ▼
[Stage G: Individual Sensor Activation (Controlled Gating)]
```

---

### Stage A: Cold Electrical Verification

- **Preconditions:**
  - Board completely disconnected from all external power sources (USB, DC supply, battery).
  - All test points visually inspected under magnification for solder bridges, whiskers, or polarity inversion.
- **Actions:**
  - Measure and record Items 1.1 through 1.8 in `UNIT_01_MEASUREMENT_REGISTER.md`.
  - Confirm star ground continuity ($< 0.5\ \Omega$).
  - Confirm 3.3V-to-5V isolation ($> 5\text{ k}\Omega$).
  - Confirm GPIO 27 pull-down ($10\text{ k}\Omega \pm 2\%$).
- **Expected Results:** Every check marked `ACCEPTABLE` in the register.
- **Failure Conditions:** Any reading marked `FAIL` or `INVESTIGATE`.
- **Immediate Shutdown / Action:** Do not proceed. Trace PCB tracks / breadboard jumpers to eliminate short or misconnection.
- **Evidence Required:** Signed measurement register with photo documentation (`PHOTO-COLD-01` to `08`).

---

### Stage B: Human Safety Approval & Gate Review

- **Preconditions:** Stage A successfully completed with zero open defects.
- **Actions:**
  - Present `UNIT_01_MEASUREMENT_REGISTER.md` to Lead Hardware Engineer / Supervisor.
  - Review recorded values against nominal bands.
- **Expected Results:** Formal written sign-off approving transition to Stage C.
- **Failure Conditions:** Any unexplained discrepancy or unmeasured parameter.
- **Immediate Action:** Hold board unpowered until authorized.
- **Evidence Required:** Physical signature on Stage B gate clearance.

---

### Stage C: First Power Application (Current-Limited Supply)

- **Technical Analysis of Current Limits:**
  - ESP32-WROOM-32 idle boot current: $\approx 45\text{ mA} - 70\text{ mA}$.
  - Onboard AMS1117-3.3 regulator quiescent current: $\approx 5\text{ mA} - 10\text{ mA}$.
  - ADS1115 + MAX3485 (RX mode) quiescent current: $\approx 1.7\text{ mA}$.
  - Total expected unexcited baseline current: **$55\text{ mA} - 85\text{ mA}$**.
  - **Stage C Current Limit Setting:** Set bench power supply to **$5.00\text{V DC}$** with current limit strictly capped at **$150\text{ mA}$**.
- **Preconditions:**
  - Programmable DC supply calibrated, output switched **OFF**.
  - Positive lead connected to ESP32 VIN (or 5V input rail); negative lead to System GND.
  - No external analog sensors plugged into ADS1115 terminals.
- **Actions:**
  - Enable bench DC supply output.
  - Observe real-time current draw on power supply display.
- **Expected Results:** Current stabilizes between $55\text{ mA}$ and $90\text{ mA}$. Constant Voltage ($CV$) indicator remains illuminated; Constant Current ($CC$) mode must **NOT** engage.
- **Failure Conditions:** Current immediately hits $150\text{ mA}$ limit; voltage collapses; supply switches to $CC$ mode.
- **Immediate Shutdown Procedure:** Hit **OUTPUT OFF** button on supply within 2 seconds. Disconnect leads.
- **Evidence Required:** Photo of bench power supply display showing voltage ($5.00\text{V}$) and steady current ($< 90\text{ mA}$).

---

### Stage D: Voltage Rail Verification (Under Power)

- **Preconditions:** Stage C power stable at $< 90\text{ mA}$.
- **Actions:**
  - Use DMM in DC Voltage mode to measure the following critical test points:
    1. **ESP32 3V3 Pin to GND:** Verify onboard LDO output ($3.25\text{V} - 3.35\text{V}$).
    2. **ADS1115 Pin 8 (VDD) to GND:** Verify ADC supply voltage ($3.25\text{V} - 3.35\text{V}$).  
       *(CRITICAL: If reading is $> 3.45\text{V}$, shut down immediately. ADS1115 must never see 5V).*
    3. **GPIO 27 to GND:** Verify RS485 direction pin is held LOW ($< 0.10\text{V}$) by 10 kΩ pull-down.
    4. **GPIO 4 (1-Wire) to GND:** Verify pulled HIGH to 3.3V ($3.20\text{V} - 3.35\text{V}$) by 4.7 kΩ resistor.
    5. **GPIO 21 (SDA) & GPIO 22 (SCL) to GND:** Verify both lines pulled HIGH to 3.3V ($3.20\text{V} - 3.35\text{V}$).
- **Expected Results:** All rails within $\pm 3\%$ of nominal 3.30V.
- **Failure Conditions:** Any rail out of tolerance; ADS1115 VDD connected to 5V rail; GPIO 27 floating high.
- **Immediate Shutdown Procedure:** Turn off DC supply.
- **Evidence Required:** DMM screen recordings logged in `UNIT_01_COMMISSIONING_LOG.md`.

---

### Stage E: ESP32-Only Startup & Boot Log Verification

- **Preconditions:** Stage D voltage rails verified safe.
- **Actions:**
  - Connect USB-to-UART cable (or onboard micro-USB) to host computer.
  - Open serial terminal at `115200 baud`, 8N1.
  - Press the physical `EN` (Reset) button on the ESP32.
  - Observe bootloader output and AgriSense bring-up diagnostic banner.
- **Expected Results:**
  - Clean ESP32 ROM boot message: `rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)`.
  - AgriSense diagnostic banner displays:
    ```
    ==================================================================
      AGRISENSE IOT PROTOTYPE UNIT 01 — CONTROLLED BRING-UP HARNESS  
    ==================================================================
      Firmware Version : 2.1.0
      Chip Model       : ESP32 (Cores: 2) (Rev 1)
      CPU Frequency    : 240 MHz
      Reset Reason     : POWERON_RESET
    ------------------------------------------------------------------
      SAFETY STATE: All analog sensor acquisitions are DISABLED by default.
      Type 'HELP' for diagnostic command list.
    ==================================================================
    ```
- **Failure Conditions:** Boot loop / continuous panic (`rst:0x10 (RTCWDT_RTC_RESET)`); brownout reset (`rst:0x1b (BROWNOUT_RESET)`); garbled baud rate characters.
- **Immediate Shutdown:** Disconnect USB and DC power. Inspect for ground bounce or insufficient bypass capacitance.
- **Evidence Required:** Text capture of clean boot log saved in commissioning log.

---

### Stage F: I2C Diagnostics & ADS1115 Discovery

- **Preconditions:** Stage E completed with interactive diagnostic prompt available.
- **Actions:**
  - Send serial command: `I2C_SCAN`.
  - Send serial command: `ADS_STATUS`.
- **Expected Results:**
  - `I2C_SCAN` detects device acknowledgment at address **`0x48`** (`ADS1115 ADC (ADDR=GND)`).
  - `ADS_STATUS` returns `I2C ACK: ACKNOWLEDGED (SUCCESS)`.
- **Failure Conditions:** `No I2C devices responded!`; bus error; SDA/SCL stuck low.
- **Immediate Action:** Power down. Inspect I2C wiring (SDA $\leftrightarrow$ GPIO 21, SCL $\leftrightarrow$ GPIO 22) and pull-up resistor integrity.
- **Evidence Required:** Output capture of `I2C_SCAN` and `ADS_STATUS`.

---

### Stage G: Individual Sensor Activation (Controlled Gating)

- **Preconditions:** Stages A through F passed.
- **Strict Rule:** Only **one** sensor may be physically connected and electrically verified at a time.
- **Activation Sequence:**

#### G.1 — Soil Temperature (DS18B20 1-Wire Digital)
1. With power OFF, plug DS18B20 probe into 3-pin terminal (VDD=3.3V, GND, DATA=GPIO 4).
2. Power up. Send command: `TEMP_STATUS`.
3. Verify probe detected with valid 64-bit ROM ID (Family code `0x28`).
4. Execute: `SENSOR_VERIFY TEMP`.
5. Execute: `SENSOR_ENABLE TEMP CONFIRM_VOLTAGE_VERIFIED`.

#### G.2 — Soil Moisture (Capacitive Analog v1.2)
1. Measure moisture sensor VCC and GND terminals: verify strictly 3.3V.
2. Measure analog output pin in air with DMM: verify output is between $2.75\text{V}$ and $3.10\text{V}$ (must be $< 3.30\text{V}$).
3. Connect signal wire to ADS1115 channel A0.
4. Execute: `SENSOR_VERIFY MOISTURE`.
5. Execute: `SENSOR_ENABLE MOISTURE CONFIRM_VOLTAGE_VERIFIED`.

#### G.3 — Soil pH Conditioning Board
1. Measure signal conditioning board output in air with DMM: verify output is between $2.40\text{V}$ and $2.60\text{V}$ (never $> 3.30\text{V}$).
2. Connect signal wire to ADS1115 channel A1.
3. Execute: `SENSOR_VERIFY PH`.
4. Execute: `SENSOR_ENABLE PH CONFIRM_VOLTAGE_VERIFIED`.

#### G.4 — Soil EC Conditioning Board
1. Measure signal conditioning board output in air with DMM: verify output is $< 0.10\text{V}$.
2. Connect signal wire to ADS1115 channel A2.
3. Execute: `SENSOR_VERIFY EC`.
4. Execute: `SENSOR_ENABLE EC CONFIRM_VOLTAGE_VERIFIED`.

#### G.5 — RS485 NPK Probe (MAX3485)
1. Verify MAX3485 $V_{CC}$ is 3.3V.
2. Connect RS485 A and B lines to NPK probe with $120\ \Omega$ termination resistor across A and B.
3. Verify isolated external 12V supply is connected ONLY to NPK probe power wires (Brown/Black). **DO NOT CONNECT 12V TO ESP32!**
4. Execute: `SENSOR_VERIFY NPK`.
5. Execute: `SENSOR_ENABLE NPK CONFIRM_VOLTAGE_VERIFIED`.
