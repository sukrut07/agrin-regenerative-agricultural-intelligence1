# 🔌 AgriSense — Wokwi Virtual ESP32 Hardware Lab

The **AgriSense Virtual Lab** provides an interactive hardware simulation environment using [Wokwi](https://wokwi.com). It enables agronomists, software developers, and evaluators to test the end-to-end telemetry ingestion pipeline without requiring physical microcontrollers or soil probe hardware on every test bench.

---

## 🛠 Simulated Hardware Architecture

The simulation models an **ESP32 DevKit V1** wired to four agricultural sensor signals and a status LED:

| Sensor / Module | Interface | Pin / Address | Simulation Component | Function |
| :--- | :--- | :--- | :--- | :--- |
| **Capacitive Soil Moisture** | Analog ADC | GPIO 34 (ADC1_CH6) | Potentiometer | Calibrated between dry ADC (3150) and wet ADC (1420) |
| **Soil pH Probe** | Analog ADC | GPIO 35 (ADC1_CH7) | Potentiometer | Voltage curve centered around neutral pH 7.0 (1.50 V) |
| **Soil EC Sensor** | Analog ADC | GPIO 32 (ADC1_CH4) | Potentiometer | Calibrated against 1413 µS/cm KCl reference solution |
| **Soil Temperature** | Digital 1-Wire | GPIO 4 | DS18B20 + 4.7kΩ Pullup | High-precision digital temperature measurement |
| **NPK Macronutrients** | RS-485 Modbus | UART2 (RX 16 / TX 17) | Virtual RS-485 Probe | Holding registers for Nitrogen, Phosphorus, Potassium |
| **Ingest Activity LED** | Digital Output | GPIO 2 | Green LED | Blinks during HTTP POST telemetry transmission |

---

## 🚀 How to Run the Simulation

### Option 1: Browser-based Simulation (1-Click)
1. Navigate to [Wokwi.com](https://wokwi.com) and start a new **ESP32** project.
2. Replace `diagram.json` with `firmware/wokwi/diagram.json`.
3. Copy `firmware/wokwi/src/main_simulation.cpp` into `sketch.ino`.
4. Connect to your local backend using the **Wokwi IoT Gateway** (`host.wokwi.internal:8000`).
5. Click **Start Simulation**. Adjust the potentiometers to simulate drought, irrigation, or fertilizer application and observe live readings streaming into the AgriN **AgriSense Device Monitor** page!

### Option 2: Local Simulation with VS Code & PlatformIO
1. Install the **Wokwi Simulator** extension in VS Code.
2. Open `firmware/wokwi/diagram.json`.
3. Press `F1` and select **Wokwi: Start Simulator**.
4. The virtual ESP32 will boot, connect to virtual Wi-Fi (`Wokwi-GUEST`), and begin transmitting telemetry payloads to `/api/telemetry/ingest`.

---

## 🔐 Security & Calibration Data Contracts

1. **Device Authentication**:
   Every telemetry request carries an `X-Device-Token` header (`agrin_dev_...`) matching the registered device record in SQLite / PostgreSQL.
2. **Measurement Provenance**:
   - Moisture, Temp, pH, EC: marked `SENSOR_MEASURED` (or `SYNTHETIC` in simulation mode).
   - NPK: marked `ML_ESTIMATED` unless verified Modbus RS-485 probe hardware is detected.
3. **Replay Protection**:
   Incoming payload timestamps are validated within a temporal window (±15 min) to prevent replay attacks and clock drift.
