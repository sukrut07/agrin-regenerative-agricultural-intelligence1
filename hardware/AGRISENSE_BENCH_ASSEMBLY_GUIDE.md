# AgriSense IoT Node — Hardware Bench Wiring & Assembly Guide

**Document ID**: `AGR-HW-SOP-001`  
**Revision**: `2.2.0`  
**Classification**: Engineering Assembly Specification  
**Target Hardware**: ESP32 DevKit V1 (30-pin & 36-pin WROOM-32 Module)  

---

## 1. Scope & Objective

This document provides the definitive, physical assembly and electrical wiring specification for building the **AgriSense IoT Bench Prototype**. It translates the audited Phase 02.1 firmware configuration into physical electrical connections, pin assignments, connector types, and safety isolation boundaries.

> [!IMPORTANT]
> **Strict Physical Testing Status**: This is an engineering design and bench preparation document. All physical measurements, wire continuity, and rail voltages must be verified on the physical test bench with a multimeter **before** applying battery or USB power.

---

## 2. Bill of Materials (BOM) & Component Specifications

| Item | Component Description | Model / Spec Assumed | Operating Voltage | Interface Type | Critical Assumptions & Datasheet Checks |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **U1** | Microcontroller Dev Board | ESP32 DevKit V1 (ESP-WROOM-32) | 3.3V Logic (5V USB in) | I2C, UART, 1-Wire, ADC | 30-pin or 36-pin footprint; 3.3V GPIO limits strictly enforced. |
| **U2** | 16-Bit Analog-to-Digital Converter | ADS1115 Breakout Module | **3.3V VDD** | I2C (`0x48`) | **MUST be powered from 3.3V rail**. Never apply $>3.6\text{V}$ to A0–A3. |
| **U3** | RS485 Differential Transceiver | **MAX3485** Module (or bare IC) | **3.3V VCC** | UART2 (RX2, TX2, DE/RE) | **MUST be MAX3485 (3.3V)**, NOT legacy MAX485 (5V). |
| **S1** | Capacitive Soil Moisture Sensor | Capacitive Moisture v1.2 / v2.0 | 3.3V VCC | Analog (0.0–3.0V) | Conformal coating required on exposed electronics. Output $\rightarrow$ ADS1115 A0. |
| **S2** | Waterproof Soil Temp Probe | DS18B20 (Stainless Tube) | 3.0V–5.5V (Use 3.3V) | Dallas OneWire | **4.7 kΩ pull-up resistor to 3.3V** mandatory on data line. |
| **S3** | Soil pH Probe & Interface Board | Analog pH Sensor with BNC Board | 3.3V VCC (or 5V if buffered) | Analog (0.0–3.0V) | Output voltage swing MUST NOT exceed 3.3V. Output $\rightarrow$ ADS1115 A1. |
| **S4** | Soil EC Conductivity Probe | Analog EC Sensor Interface Board | 3.3V VCC | Analog (0.0–3.0V) | Platinum electrode AC excitation. Output $\rightarrow$ ADS1115 A2. |
| **S5** | Soil NPK 7-in-1 Sensor (Optional) | Modbus RTU RS485 Soil Probe | 9V–24V DC External | RS485 Differential (A/B) | Requires separate 12V boost converter. RS485 lines to MAX3485 A/B. |
| **R1** | Voltage Divider Resistor 1 | 100 kΩ 0.25W 1% Metal Film | — | Passive | Upper battery divider leg ($V_{\text{batt}} \rightarrow \text{GPIO 34}$). |
| **R2** | Voltage Divider Resistor 2 | 100 kΩ 0.25W 1% Metal Film | — | Passive | Lower battery divider leg ($\text{GPIO 34} \rightarrow \text{GND}$). |
| **R3** | OneWire Pull-Up Resistor | 4.7 kΩ 0.25W 5% Carbon/Metal | — | Passive | Pull-up between GPIO 4 and 3.3V rail. |
| **R4** | RS485 DE/RE Pull-Down Resistor | 10 kΩ 0.25W 5% Carbon/Metal | — | Passive | Pull-down between GPIO 27 and GND (forces RX on boot). |
| **R5** | RS485 Bus Termination Resistor| 120 Ω 0.25W Metal Film | — | Passive | Placed across RS485 lines A and B at cable ends. |
| **C1** | ADC Anti-Aliasing Filter Cap | 100 nF (0.1 µF) Ceramic 50V | — | Passive | Connected in parallel with R2 (GPIO 34 to GND). |
| **C2** | ADS1115 Decoupling Capacitor | 100 nF Ceramic 50V | — | Passive | Placed physically across ADS1115 VDD and GND pins. |
| **C3** | Rail Bulk Decoupling Capacitor | 10 µF 16V Tantalum / Electrolytic| — | Passive | Across 3.3V rail and GND to suppress Wi-Fi burst transients. |
| **Q1** | High-Side Power Switch (Optional)| SI2301 P-Channel MOSFET | 3.3V Rail | Switching Gate | Gate driven by GPIO 18 (low-power sensor power gating). |
| **PWR1**| Solar Charge Controller | CN3065 (or TP4056 with Protection)| 4.4V–6.0V Solar In | Li-ion Charger | Set charge current to 500 mA (prog resistor 2.4 kΩ). |
| **BAT1**| Rechargeable Li-ion Battery | 18650 Protected 3.7V 2600 mAh | 3.2V–4.2V | Battery Pack | Integrated BMS protection board against over-discharge (<2.8V). |

---

## 3. Master Pin Mapping & Interconnect Table

```
+-----------------------------------------------------------------------------------------+
|                                    ESP32 DevKit V1                                      |
+-----------------------------------------------------------------------------------------+
       |             |              |                |               |              |
    GPIO 21       GPIO 22        GPIO 4           GPIO 16         GPIO 17        GPIO 27
    (I2C SDA)     (I2C SCL)     (OneWire)        (UART2 RX)      (UART2 TX)    (RS485 DIR)
       |             |              |                |               |              |
       v             v              v                v               v              v
  +--------------------+       +---------+      +---------------------------------------+
  |    ADS1115 ADC     |       | DS18B20 |      |          MAX3485 Transceiver          |
  | Pin 4       Pin 3  |       | Data    |      | RO             DI           DE / RE   |
  +--------------------+       +---------+      +---------------------------------------+
    |    |    |                                      |                            |
   (A0) (A1) (A2)                              (A / B Lines)                 (10k Pull-Down
    |    |    +--> Soil EC Probe                     |                        to GND)
    |    +-------> Soil pH Probe                     v
    +------------> Capacitive Moisture         RS485 Soil NPK
```

### 3.1 Detailed Wiring Schedule

| From Device | Pin Name | Wire Color | To Device | Pin Name | Signal Type | Electrical Requirement / Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ESP32** | 3V3 (Out) | Red | **ADS1115** | VDD | Power (3.3V) | Decouple with 100 nF ceramic cap to GND |
| **ESP32** | GND | Black | **ADS1115** | GND | Ground | Common star ground reference |
| **ESP32** | GPIO 21 | Blue | **ADS1115** | SDA (Pin 4) | Digital I2C | 4.7 kΩ pull-up to 3.3V (if not on breakout) |
| **ESP32** | GPIO 22 | Yellow | **ADS1115** | SCL (Pin 3) | Digital I2C | 4.7 kΩ pull-up to 3.3V (if not on breakout) |
| **ADS1115** | ADDR | Black | **ADS1115** | GND | Config | Ground sets I2C address to `0x48` |
| **ADS1115** | A0 | Orange | **Moisture S1** | Signal (AOUT) | Analog (0–3V)| Capacitive moisture analog voltage |
| **ADS1115** | A1 | Violet | **Soil pH S3** | Signal (Po) | Analog (0–3V)| pH conditioning module analog output |
| **ADS1115** | A2 | Brown | **Soil EC S4** | Signal (AOUT) | Analog (0–3V)| EC interface module analog output |
| **ESP32** | GPIO 4 | Green | **DS18B20 S2** | Data (DQ) | Digital OneWire| **Mandatory 4.7 kΩ pull-up to 3.3V** |
| **DS18B20** | VDD | Red | **ESP32** | 3V3 Rail | Power (3.3V) | Tie to 3.3V rail |
| **DS18B20** | GND | Black | **ESP32** | GND | Ground | Tie to common star ground |
| **ESP32** | GPIO 16 (RX2)| White | **MAX3485** | RO (Rx Out) | Digital UART | 3.3V logic line |
| **ESP32** | GPIO 17 (TX2)| Gray | **MAX3485** | DI (Tx In) | Digital UART | 3.3V logic line |
| **ESP32** | GPIO 27 | Purple | **MAX3485** | DE + \RE tied | Digital Output| **10 kΩ external pull-down to GND** |
| **MAX3485** | VCC | Red | **ESP32** | 3V3 Rail | Power (3.3V) | **MUST be 3.3V**, never connect to 5V |
| **MAX3485** | GND | Black | **ESP32** | GND | Ground | Common ground |
| **MAX3485** | A | Blue twisted | **NPK S5** | RS485 A (+) | Differential | 120 Ω termination resistor across A/B |
| **MAX3485** | B | White twisted| **NPK S5** | RS485 B (-) | Differential | Shielded twisted pair recommended |
| **Battery (+) | V+ (3.2–4.2V)| Red | **Divider R1** | Input Leg | Analog Power | Protected Li-ion 18650 positive terminal |
| **Divider R1** | Midpoint | Orange | **ESP32** | GPIO 34 (ADC1)| Analog Input | 100 nF capacitor from midpoint to GND |
| **Divider R2** | Lower Leg | Black | **ESP32** | GND | Ground | 100 kΩ to GND ($K=2.000$) |

---

## 4. Hardware Verification vs. Assumptions

The hardware team must strictly verify the following assumptions against the physical modules received:

| Subsystem | Verified Firmware Setting | Unverified Physical Assumption | Bench Action Required |
| :--- | :--- | :--- | :--- |
| **RS485 Direction** | GPIO 27 output; HIGH=TX, LOW=RX | External 10 kΩ pull-down resistor present | Measure resistance from GPIO 27 to GND; must be $10\text{ k}\Omega \pm 5\%$. |
| **OneWire Temp** | GPIO 4 1-Wire protocol with CRC-8 | Pull-up resistor is tied to 3.3V, not 5V | Measure unpowered resistance from GPIO 4 to 3.3V rail ($4.7\text{ k}\Omega$). |
| **ADS1115 I2C** | Address `0x48` configured | ADDR pin is tied directly to GND | Check continuity from ADS1115 ADDR pin to GND pin ($0.0\ \Omega$). |
| **Soil pH Board** | Nernst slope calculation | Output voltage does not exceed 3.3V | Measure pH board output with probe in pH 4 buffer; confirm $<3.2\text{V}$. |
| **Soil EC Board** | Normalized to 25°C at 1.413 dS/m | Module power supply rating | Confirm module operates on 3.3V without signal distortion. |
| **RS485 NPK Probe**| Modbus FC 0x03, 9600-8-N-1 | Exact register address map & power rail | **DO NOT WIRE 12V TO ESP32!** Confirm separate isolated 12V boost rail. |
| **Battery Divider**| $K = 2.000$ ratio ($100\text{k}/100\text{k}$) | Resistors are 1% tolerance metal film | Measure actual resistance of R1 and R2 with calibrated ohmmeter. |

---

## 5. Safe Bench Power-On Sequence

> [!CAUTION]
> Applying power in the incorrect order or with inverted polarity will permanently destroy the ESP32 and ADS1115 silicon. Follow this sequence exactly:

### Power-On Procedure
1. **Visual & Continuity Inspection**: Execute [hardware/PRE_POWER_ELECTRICAL_CHECKLIST.md](PRE_POWER_ELECTRICAL_CHECKLIST.md) completely.
2. **Cold Bench Power Check (MCU Unpopulated)**:
   - Apply 3.7V from an adjustable current-limited bench power supply (set limit to 100 mA).
   - Measure 3.3V rail voltage on DevKit socket with a calibrated digital multimeter. **Target: $3.30\text{ V} \pm 0.05\text{ V}$**.
   - If voltage is $<3.20\text{ V}$ or $>3.45\text{ V}$, turn OFF bench supply immediately.
3. **Mount ESP32 Module**:
   - Disconnect power. Seat ESP32 module into female header socket. Confirm pin 1 orientation.
4. **Connect Peripheral Sensors Sequentially**:
   - Step A: Connect ADS1115 only $\rightarrow$ power on $\rightarrow$ verify I2C discovery (`0x48`) in serial console.
   - Step B: Connect DS18B20 temperature probe $\rightarrow$ verify temperature reading (20–25°C).
   - Step C: Connect capacitive moisture probe $\rightarrow$ verify raw ADC counts (~2850 in air).
   - Step D: Connect pH & EC conditioning boards $\rightarrow$ verify analog voltage levels.
   - Step E: Connect MAX3485 RS485 module $\rightarrow$ verify DE/RE direction switching.
5. **Attach Battery & Solar Charger**:
   - Connect protected 18650 cell $\rightarrow$ verify battery ADC reads within $\pm 0.05\text{V}$ of multimeter.

### Safe Shutdown Procedure
1. Disconnect external solar panel input.
2. Disconnect USB serial debugging cable.
3. Disengage battery pack via mechanical slide switch (or disconnect JST battery lead).
