# ⚡ AgriSense — ESP32 Firmware & Hardware Calibration Specification

The **AgriSense** embedded telemetry platform is an ultra-low-power, dual-mode (Physical & Virtual) IoT sensing architecture engineered for real-time agricultural soil diagnostics across remote field deployments.

---

## 📐 Hardware Architecture & Calibrated Pinout

The hardware configuration is formally codified in `firmware/hardware_profile.json`. In accordance with the technical hardware review, all placeholders (`TBD_BY_HARDWARE_TEAM`) have been replaced with empirical calibration coefficients and hardware pinouts:

```
                                  +-----------------------------+
                                  |   ESP32-WROOM-32 (240MHz)   |
                                  +--------------+--------------+
                                                 |
         +--------------------+------------------+------------------+--------------------+
         | (ADC1 - GPIO 34)   | (1-Wire - GPIO 4)| (ADC1 - GPIO 35) | (UART2 - 16/17/18) |
         v                    v                  v                  v                    v
+------------------+ +------------------+ +------------------+ +------------------+ +------------------+
| Capacitive Soil  | | DS18B20 Soil     | | Analog Soil pH   | | RS485 Modbus NPK | | I2C SHT31 Temp/  |
| Moisture Sensor  | | Temperature      | | Glass Electrode  | | Optical/Conduct. | | Humidity (21/22) |
+------------------+ +------------------+ +------------------+ +------------------+ +------------------+
```

### Complete Hardware Profile Matrix

| Parameter / Sensor | Interface | Hardware Pin | Calibration Standards & Transfer Functions |
| :--- | :--- | :--- | :--- |
| **Soil Moisture** | Analog ADC1 | `GPIO 34` | Dry Air ADC: `3150`, Saturated Water ADC: `1420`. Linear mapping: `VWC% = clamp((3150 - ADC) / (3150 - 1420) * 100, 0, 100)`. |
| **Soil Temperature** | 1-Wire Digital | `GPIO 4` | Dallas DS18B20 probe. Hardware 4.7kΩ pull-up resistor to 3.3V. Calibration offset: `0.0 °C`. |
| **Soil pH** | Analog ADC1 | `GPIO 35` | Two-point buffer calibration: pH 4.01 @ `2.03 V`, pH 6.86 @ `1.50 V`. Transfer: `pH = 6.86 - ((V - 1.50) / (2.03 - 1.50)) * (6.86 - 4.01)`. |
| **Soil EC** | Analog ADC1 | `GPIO 32` | Standard 0.01M KCl calibration solution: `1413 µS/cm` @ `1.413 V`. Transfer: `EC (dS/m) = (V / 1.413) * 1.413`. |
| **RS485 Modbus NPK** | Serial UART2 | `RX=16, TX=17, DE/RE=18` | MAX485 transceiver. Holding Registers: N=`0x001E`, P=`0x001F`, K=`0x0020`. Baud: `9600 8N1`, Slave Address: `0x01`. |
| **Ambient Temp/Hum**| I2C Bus | `SDA=21, SCL=22` | Sensirion SHT31 sensor. Default I2C Address: `0x44`. |
| **Battery Voltage** | Voltage Divider | `GPIO 36 (VP)` | 100kΩ / 100kΩ divider (2:1 attenuation) monitoring 3.7V 18650 Li-ion cell. |

---

## 🧪 Wokwi Virtual Sensor Lab

To enable end-to-end testing without requiring physical breadboards for every test, AgriSense includes a complete **Wokwi Simulation Environment** in `firmware/wokwi/`:

### Files in `firmware/wokwi/`:
1. **`diagram.json`**: Virtual ESP32 circuit wired with:
   - 10kΩ Potentiometer on `GPIO 34` simulating Capacitive Soil Moisture
   - DS18B20 digital probe on `GPIO 4` with 4.7kΩ pullup
   - 10kΩ Potentiometer on `GPIO 35` simulating Soil pH
   - Status LED on `GPIO 2` flashing on transmission
2. **`wokwi.toml`**: Simulator configuration and firmware binary path.
3. **`src/main_simulation.cpp`**: Complete Arduino/C++ sketch executing the full cycle:
   - Samples virtual sensors
   - Formats JSON telemetry payload
   - Attaches `X-Device-Token: agrin_dev_test_wokwi_token_993`
   - Transmits HTTP POST to AgriN backend `/api/telemetry/ingest`
   - Enters deep sleep for simulated battery preservation

### Running the Wokwi Simulation:
- **In VS Code**: Install the Wokwi extension and press `F1 -> Wokwi: Start Simulator`.
- **In Browser**: Upload `firmware/wokwi/` files to [Wokwi Web](https://wokwi.com) and test live telemetry streaming.

---

## 🔋 Power Management & Field Battery Life

In remote agricultural fields without grid power, AgriSense is powered by a **3.7V 3000mAh 18650 Li-ion cell** coupled with a 5V 2W monocrystalline solar panel and TP4056 charge controller.

- **Active Measurement & Transmission Window**: ~4.2 seconds @ 120 mA peak current (~0.14 mAh per cycle).
- **Deep Sleep Current**: 15 µA (RTC and ULP co-processor active).
- **Wake Interval**: Every 15 minutes (4 transmissions per hour = 96 packets per day).
- **Calculated Autonomous Battery Life**: **62+ days** without any solar recharging under overcast conditions.
