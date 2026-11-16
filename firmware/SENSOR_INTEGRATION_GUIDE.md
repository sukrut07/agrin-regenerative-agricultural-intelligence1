# AgriSense IoT — Sensor Integration Guide

**Version**: `2.0.0`  
**Classification**: Hardware & Driver Integration Specification  
**Target Hardware**: ESP32 DevKit V1 (ESP32-WROOM-32)  

---

## 1. Overview

This document provides complete electrical specifications, pin assignments, signal conditioning requirements, driver implementations, and error handling for all supported sensors in the AgriSense IoT node.

Each sensor is encapsulated in an independent C++ driver inheriting from `SensorBase`. A hardware failure, disconnection, or short circuit on one sensor will never crash or prevent sampling on the others.

---

## 2. Sensor Driver Reference & Wiring

### 2.1 Capacitive Soil Moisture Sensor (v1.2 / v2.0)

- **Measurement Principle**: Dielectric frequency oscillation proportional to soil volumetric water content.
- **Physical Interface**: Analog voltage output (0.0V to 3.0V).
- **ADC Interface**: Connected to ADS1115 (16-bit ADC) Channel 0 via I2C (`0x48`).
- **Operating Voltage**: 3.3V VCC, GND.
- **ESP32 Connection**: Does NOT connect directly to ESP32 analog pins (avoids non-linear ADC and 5V burn-out). ADS1115 handles conversion at 16-bit resolution.
- **Driver**: `MoistureSensor` (`firmware/src/sensors/moisture_sensor.cpp`).
- **Mathematical Processing**:
  - Oversampling: 5 consecutive samples acquired with 10 ms inter-sample delay.
  - Exponential Moving Average (EMA) smoothing: $\alpha = 0.3$.
  - Linear/Non-linear Calibration:
    $$\text{Moisture}_{\%} = \left( \frac{\text{Raw}_{\text{dry}} - \text{Raw}}{\text{Raw}_{\text{dry}} - \text{Raw}_{\text{wet}}} \right) \times 100.0$$
- **Fault Detection**:
  - Open circuit / Disconnected probe: Raw ADC > 3200 (in 3.3V full-scale). Tagged as `SENSOR_OFFLINE`.
  - Short circuit: Raw ADC < 500. Tagged as `INVALID`.
  - Normal range: 0.0% to 100.0% VWC.

---

### 2.2 DS18B20 Digital Waterproof Temperature Sensor

- **Measurement Principle**: Bandgap semiconductor temperature sensor with 12-bit delta-sigma ADC.
- **Physical Interface**: Dallas OneWire serial bus (1-wire protocol).
- **ESP32 Connection**: GPIO 4 (OneWire Data Pin).
- **Operating Voltage**: 3.3V VCC, GND.
- **Pull-up Resistor**: External **4.7 kΩ** resistor between 3.3V and GPIO 4 (Mandatory).
- **Driver**: `TemperatureSensor` (`firmware/src/sensors/temperature_sensor.cpp`).
- **Validation & Fault Detection**:
  - **CRC-8 Verification**: Every Dallas OneWire scratchpad read is verified with 8-bit polynomial CRC.
  - **Disconnection Trap**: Returns `-127.0°C` when the bus is pulled low or sensor is disconnected. Marked as `SENSOR_OFFLINE`.
  - **Power-on Reset Trap**: Returns `+85.0°C` before conversion completes. Marked as `INVALID` and rejected on subsequent readings.
  - **Operating Limits**: Valid range: `-20.0°C` to `+60.0°C`. Values outside are flagged `OUT_OF_RANGE`.

---

### 2.3 Soil pH Sensor & Conditioning Board

- **Measurement Principle**: Ion-selective glass electrode producing Nernst voltage vs. reference calomel/AgCl electrode.
- **Physical Interface**: BNC probe connector connected to signal conditioning board.
- **Conditioning Board Output**: Analog voltage (0.0V to 3.3V).
- **ADC Interface**: Connected to ADS1115 Channel 1.
- **Operating Voltage**: 3.3V VCC. (If using 5V board, a precision resistive voltage divider or 3.3V LDO MUST be used).
- **Driver**: `PhSensor` (`firmware/src/sensors/ph_sensor.cpp`).
- **Nernst Equation & Temperature Compensation**:
  $$E = E_0 - \left( \frac{2.3026 \cdot R \cdot T}{F} \right) \cdot \text{pH}$$
  The Nernst slope changes by $+0.1984\text{ mV/pH/}^\circ\text{C}$. The driver dynamically ingests live temperature from `TemperatureSensor`:
  $$\text{Slope}_T = \text{Slope}_{25^\circ\text{C}} \times \left( \frac{T_{\text{soil}} + 273.15}{298.15} \right)$$
- **Fault Detection**:
  - Disconnected BNC probe: Voltage floats to rail (0.0V or 3.3V). Flagged as `SENSOR_OFFLINE`.
  - Operational Limits: `3.00` to `10.00` pH. Readings outside are clamped and flagged `OUT_OF_RANGE`.

---

### 2.4 Soil Electrical Conductivity (EC) Sensor

- **Measurement Principle**: Alternating current (AC) excitation across dual platinum pins to prevent electrode polarization.
- **Physical Interface**: Interface board analog voltage output (0.0V to 3.0V).
- **ADC Interface**: Connected to ADS1115 Channel 2.
- **Operating Voltage**: 3.3V VCC.
- **Driver**: `EcSensor` (`firmware/src/sensors/ec_sensor.cpp`).
- **Temperature Normalization (to 25°C)**:
  Standard agricultural soil EC is defined at 25°C. The driver normalizes raw reading using a temperature coefficient ($\alpha = 0.02 / ^\circ\text{C}$):
  $$\text{EC}_{25} = \frac{\text{EC}_T}{1 + 0.02 \cdot (T_{\text{soil}} - 25.0)}$$
- **Fault Detection**:
  - Probe in dry air: Voltage ~0.0V $\rightarrow 0.0\text{ dS/m}$. Tagged as `GOOD`.
  - Short circuit: Voltage > 3.1V $\rightarrow \text{EC} > 20.0\text{ dS/m}$. Flagged as `INVALID`.

---

### 2.5 RS485 Modbus RTU Soil NPK Sensor (Optional)

- **Measurement Principle**: High-precision multi-pin optical/electrochemical probe with integrated Modbus RTU processor.
- **Physical Interface**: RS485 differential bus (A / B lines).
- **Transceiver Module**: **MAX3485** (3.3V transceiver) connected to ESP32 Hardware Serial2 (`UART_NUM_2`):
  - `RO` (Receiver Output) $\rightarrow$ ESP32 GPIO 16 (RX2).
  - `DI` (Driver Input) $\rightarrow$ ESP32 GPIO 17 (TX2).
  - `DE` / `RE` (Driver/Receiver Enable) $\rightarrow$ ESP32 GPIO 5.
- **Operating Voltage**: Probe requires 9V–24V DC external supply; MAX3485 requires 3.3V VCC.
- **Modbus Protocol Details**:
  - Baud rate: 9600 bps, 8 Data Bits, 1 Stop Bit, No Parity.
  - Modbus Slave ID: `0x01`.
  - Function Code: `0x03` (Read Holding Registers).
  - Start Register: `0x001E` (30 decimal) or `0x0000` (configurable in `NpkSensorConfig`).
  - Response Data: Nitrogen (mg/kg), Phosphorus (mg/kg), Potassium (mg/kg).
- **Driver**: `NpkSensor` (`firmware/src/sensors/npk_sensor.cpp`).
- **CRC-16 Modbus Verification**: Every frame sent and received is checked with standard CRC-16 (polynomial `0xA001`).
- **Graceful Degradation**:
  If the RS485 probe is not connected, the driver times out after 200 ms, logs `UNAVAILABLE`, tags data source as `SYNTHETIC` or `UNAVAILABLE`, and allows the system to continue running without blocking.

---

## 3. Sensor Bus Isolation Summary

```
                      +-------------------+
                      |   ESP32 DevKit    |
                      +-------------------+
                       |      |       |
                 +-----+      |       +---------------+
                 | I2C        | OneWire               | UART2 + GPIO 5
                 v            v                       v
            +---------+   +---------+            +---------+
            | ADS1115 |   | DS18B20 |            | MAX3485 |
            | 16-Bit  |   | (Temp)  |            | (RS485) |
            +---------+   +---------+            +---------+
             |   |   |                                |
             |   |   +--> Soil EC Probe               v
             |   +------> Soil pH Probe          Soil NPK Probe
             +----------> Capacitive Moisture
```
