# AgriSense IoT — Pin Configuration & Electrical Guide

**Version**: `2.0.0`  
**Classification**: Electrical & Schematic Specification  
**Target Board**: ESP32 DevKit V1 (30-pin & 36-pin WROOM-32)  
**Strict Rule**: **3.3V Logic Compliance on all ESP32 GPIO Pins**  

---

## 1. Master GPIO Mapping Table

| ESP32 Pin | Function / Peripheral | Connected Device | Voltage Level | Electrical Requirements / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GPIO 21** | I2C SDA (Data) | ADS1115 ADC (Pin 4) | 3.3V Logic | Shared I2C bus; external 4.7 kΩ pull-up to 3.3V (or internal pull-up) |
| **GPIO 22** | I2C SCL (Clock) | ADS1115 ADC (Pin 3) | 3.3V Logic | Shared I2C bus; 100 kHz standard / 400 kHz fast mode |
| **GPIO 4** | OneWire Data Bus | DS18B20 Temp Probe | 3.3V Logic | **Mandatory 4.7 kΩ pull-up** between 3.3V rail and GPIO 4 |
| **GPIO 16** | UART2 RX (`RX2`) | MAX3485 `RO` (Receiver Out)| 3.3V Logic | Hardware Serial2; RS485 communication line |
| **GPIO 17** | UART2 TX (`TX2`) | MAX3485 `DI` (Driver In) | 3.3V Logic | Hardware Serial2; RS485 transmission line |
| **GPIO 5** | GPIO Output (Control)| MAX3485 `DE` + `RE` tied | 3.3V Logic | Direction control: HIGH = Transmit, LOW = Receive |
| **GPIO 34** | ADC1_CH6 (Input Only)| Battery Voltage Divider | 0.0V–3.1V Max | **Input Only pin**. Dual-resistor divider (100 kΩ / 100 kΩ) |
| **GPIO 2** | GPIO Output | Onboard Status LED | 3.3V | Blinks on boot, heartbeat, and error states |
| **3V3 Pin** | Power Supply Out | ADS1115, DS18B20, MAX3485 | 3.3V Regulated | Clean filtered power rail from onboard AMS1117 LDO |
| **GND Pin** | Common Ground | All sensors & modules | 0.0V Reference | Common ground star-topology to reduce analog noise |

---

## 2. ADS1115 16-Bit I2C ADC Channel Assignments

The ADS1115 external ADC solves the non-linearity and high-frequency noise inherent in the ESP32 internal ADC. It is configured for Single-Ended sampling with an I2C slave address of `0x48` (ADDR tied to GND).

| ADS1115 Pin | Sensor Channel | Physical Input | Max Allowed Voltage | Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **A0** | Channel 0 | Capacitive Soil Moisture v1.2 | 3.3V (0.0V – 3.0V typ.) | 16-bit (0.1875 mV/LSB at 6.144V FSR) |
| **A1** | Channel 1 | Soil pH Conditioning Board | 3.3V (0.0V – 3.3V typ.) | 16-bit |
| **A2** | Channel 2 | Soil EC Interface Board | 3.3V (0.0V – 3.0V typ.) | 16-bit |
| **A3** | Channel 3 | Auxiliary Expansion (Spare) | 3.3V | 16-bit |
| **VDD** | Power In | ESP32 3V3 Rail | 3.3V | Decoupled with 100 nF ceramic capacitor |
| **GND** | Ground | Common Ground | 0.0V | Connected to star ground |
| **ADDR**| Address Select | Ground | 0.0V | Sets I2C address to `0x48` |

---

## 3. Battery Voltage Divider Network

To monitor the 3.7V nominal (4.2V max) 18650 Li-ion battery using ESP32 GPIO 34, a precision voltage divider is required:

```
    Battery V+ (3.2V - 4.2V)
          |
         [R1: 100 kΩ (1% metal film)]
          |
          +-----> ESP32 GPIO 34 (ADC1_CH6)  (Max: 2.10V at 4.2V Batt)
          |
         [R2: 100 kΩ (1% metal film)]
          |
         [C1: 100 nF ceramic filter cap to GND]
          |
         GND
```

### Divider Equations
- **Divider Ratio**: $K = \frac{R_1 + R_2}{R_2} = \frac{100\,\text{k}\Omega + 100\,\text{k}\Omega}{100\,\text{k}\Omega} = 2.000$
- **At 4.20V (100% Full Charge)**: $V_{\text{pin}} = \frac{4.20\text{ V}}{2} = 2.10\text{ V}$ (well within ESP32 3.3V max rating).
- **At 3.20V (0% Cutoff Charge)**: $V_{\text{pin}} = \frac{3.20\text{ V}}{2} = 1.60\text{ V}$.
- **Firmware Calculation**:
  $$V_{\text{battery}} = V_{\text{GPIO34}} \times 2.0$$
  $$\text{Battery}_{\%} = \left( \frac{V_{\text{battery}} - 3.20\text{ V}}{4.20\text{ V} - 3.20\text{ V}} \right) \times 100.0\%$$

---

## 4. Electrical Safety & Level Shifting Rules

> [!CAUTION]
> **Never connect 5V logic signals directly to ESP32 GPIO pins.**
> The ESP32 is NOT 5V tolerant. Applying 5V to any GPIO pin will degrade or permanently destroy the internal ESD protection diodes and silicon gates.

### Safe Wiring Rules
1. **MAX3485 vs MAX485**:
   - Always use the **MAX3485** transceiver which operates natively at **3.3V**.
   - If using a legacy **MAX485** (which requires 5V VCC), you MUST place a bidirectional logic level shifter (or resistive divider on `RO`) between the MAX485 and ESP32 GPIO 16.
2. **OneWire Bus Power**:
   - Power DS18B20 from 3.3V (VCC pin) and ensure the 4.7 kΩ pull-up resistor is tied to **3.3V**, never 5V.
3. **Soil pH Conditioning Boards**:
   - Many commercial hobby pH boards specify 5.0V supply. When supplied with 5V, their analog output can swing up to 4.2V.
   - For safe operation, supply the pH board with 3.3V if supported, or feed its output through a resistive divider / buffer before entering ADS1115 (which is 3.3V-powered).
4. **Decoupling Capacitors**:
   - Place a 100 nF ceramic capacitor physically close to the VDD pin of the ADS1115 and MAX3485 to filter high-frequency switching transients during Wi-Fi transmission bursts.
