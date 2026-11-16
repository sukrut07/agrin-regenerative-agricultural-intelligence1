# AgriSense Prototype Unit 01 — Hardware Configuration & Pinout Specification

> **Document ID:** AGRIN-CFG-UNIT01-001  
> **Target:** AgriSense Field Node Prototype Unit 01  
> **Controller:** ESP32-DevKit-V1 (30-pin, ESP32-WROOM-32, 4MB Flash)  
> **Revision:** Prototype Carrier Rev 1.0  

---

## 1. Master GPIO & Peripheral Allocation Table

| ESP32 Pin | GPIO | Direction | Peripheral / Subsystem | Connected Node | Logic Level | Pull Resistor / Strap State | Critical Safety Notes |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **EN** | EN | Input | Chip Enable / Reset | Tactile Pushbutton | 3.3V | Internal 10 kΩ pull-up | Active LOW reset. |
| **P23** | 23 | I/O | General Purpose | Unused (Spare) | 3.3V | None | Available for future expansion. |
| **P22** | 22 | I/O | I2C Clock (SCL) | ADS1115 SCL (Pin 10) | 3.3V | 4.7 kΩ pull-up to 3.3V | Parallel pull-up with breakout. |
| **P21** | 21 | I/O | I2C Data (SDA) | ADS1115 SDA (Pin 9) | 3.3V | 4.7 kΩ pull-up to 3.3V | Parallel pull-up with breakout. |
| **P19** | 19 | I/O | General Purpose | Unused (Spare) | 3.3V | None | Available for future expansion. |
| **P18** | 18 | Output | Sensor Power Gate | P-MOSFET SI2301 Gate | 3.3V | 10 kΩ pull-up to 3.3V | Optional sleep power switch. |
| **P5** | 5 | I/O | Strapping Pin | Unused (Isolated) | 3.3V | Boot Strap PWM | **DO NOT USE FOR RS485 DE/RE!** |
| **P17** | 17 | Output | UART2 TX (TX2) | MAX3485 DI (Pin 4) | 3.3V | None | Modbus RTU Transmit. |
| **P16** | 16 | Input | UART2 RX (RX2) | MAX3485 RO (Pin 1) | 3.3V | None | Modbus RTU Receive. |
| **P4** | 4 | I/O | 1-Wire Digital Bus | DS18B20 Data Line | 3.3V | 4.7 kΩ pull-up to 3.3V | Waterproof temp probe line. |
| **P2** | 2 | Output | Status LED / Strap | Onboard Blue LED | 3.3V | Internal pull-down | Strapping pin. |
| **P15** | 15 | Output | Network LED / Strap | Optional Green LED | 3.3V | Internal pull-up | Strapping pin. Keep floating at boot. |
| **P27** | 27 | Output | RS485 Direction Control| MAX3485 DE & RE (Pins 2,3)| 3.3V | **10 kΩ pull-down to GND** | **CRITICAL:** Forces RX mode at boot. |
| **P34** | 34 | Input | Battery Voltage Sense | Divider Midpoint (R1/R2) | 0–2.1V | External 100k/100k divider | ADC1_CH6 (Input only, no pull-up). |
| **P35** | 35 | Input | General ADC | Unused (Spare ADC1) | 3.3V | None | ADC1_CH7 (Input only). |
| **3V3** | — | Power | Regulated 3.3V Rail | ADS1115, MAX3485, DS18B20 | 3.30V | Bulk Cap (10 µF) | Sourced from ESP32 AMS1117 LDO. |
| **VIN** | — | Power | Primary 5.0V Input | Bench DC Supply / USB 5V | 5.00V | Decoupling Cap (100 µF) | Powers ESP32 LDO & pH/EC modules. |
| **GND** | — | Power | Common Star Ground | System Common Ground | 0.00V | Star configuration | Shared ground across all components. |

---

## 2. ADS1115 External 16-Bit ADC Channel Mapping

| ADS1115 Pin | Channel | Sensor Assigned | Input Signal Type | Expected Signal Range | PGA Gain Setting | Full Scale Range |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Pin 4** | **A0** | Capacitive Soil Moisture v1.2 | Analog DC Voltage | 1.10 V – 3.00 V | `GAIN_TWOTHIRDS` | $\pm 6.144\text{ V}$ |
| **Pin 5** | **A1** | Analog Soil pH Electrode Board | Conditioned Analog DC | 1.20 V – 3.20 V | `GAIN_TWOTHIRDS` | $\pm 6.144\text{ V}$ |
| **Pin 6** | **A2** | Analog Soil EC Probe Board | Conditioned Analog DC | 0.05 V – 3.20 V | `GAIN_TWOTHIRDS` | $\pm 6.144\text{ V}$ |
| **Pin 7** | **A3** | Auxiliary / Spare ADC Channel | Floating / Grounded | 0.00 V | `GAIN_TWOTHIRDS` | $\pm 6.144\text{ V}$ |

> **ELECTRICAL INPUT CEILING:**  
> ADS1115 VDD is powered from 3.30V. Absolute maximum analog input voltage is:  
> $$V_{\text{in(max)}} = V_{\text{DD}} + 0.3\text{V} = 3.60\text{V}$$  
> Any voltage exceeding 3.60V will cause forward biasing of internal ESD protection diodes and permanent damage.

---

## 3. Power Distribution & Decoupling Scheme

```
[Bench DC Supply / USB 5.0V]
         │
         ├───► [100 µF Electrolytic] ───► ESP32 VIN (Pin 30)
         │                                    │
         │                             [AMS1117-3.3 LDO]
         │                                    │
         │                                    ├───► ESP32 3V3 Rail (3.30V)
         │                                    │        ├───► [10 µF Bulk Tantalum]
         │                                    │        ├───► ADS1115 VDD [100 nF Cap]
         │                                    │        ├───► MAX3485 VCC [100 nF Cap]
         │                                    │        ├───► DS18B20 VDD [100 nF Cap]
         │                                    │        └───► Moisture Sensor VCC
         │
         ├───► Sensor 5V Bus ─────────────────┼───► Analog pH Conditioning Board VCC
                                              └───► Analog EC Conditioning Board VCC
```

---

## 4. RS485 / Modbus Physical Layer Interface

```
ESP32 DevKit V1                 MAX3485 Transceiver                Industrial NPK Probe
─────────────────              ─────────────────────               ────────────────────
GPIO 17 (TX2)   ──────────────► DI (Pin 4)
GPIO 16 (RX2)   ◄────────────── RO (Pin 1)
GPIO 27         ──────────────► DE (Pin 3) & RE (Pin 2)
   │
 [10 kΩ]
   │
  GND
                                A (Pin 6) ───────────────────────── RS485 A (Yellow Wire)
                                                    │
                                                 [120 Ω]
                                                    │
                                B (Pin 7) ───────────────────────── RS485 B (Blue Wire)
```

> [!WARNING]
> The Industrial NPK probe requires an external **9V–24V DC** power supply (Brown wire = V+, Black wire = GND).  
> **DO NOT connect the 12V supply to any pin on the ESP32 or MAX3485.**  
> Connect the 12V power supply ground to the system common ground bus.
