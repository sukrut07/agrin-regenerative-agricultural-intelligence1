# AgriSense IoT — Build, Flash, and Debugging Guide

**Version**: `2.0.0`  
**Classification**: Developer & Production Deployment SOP  
**Target Hardware**: ESP32 DevKit V1 (ESP-WROOM-32)  

---

## 1. Development Environment Setup

### Required Tools
1. **Python 3.10+**: Ensure Python is installed and accessible from terminal.
2. **PlatformIO Core (CLI)** or **VS Code with PlatformIO Extension**:
   ```bash
   pip install platformio
   ```
3. **USB-to-UART Bridge Drivers**:
   - Most ESP32 DevKit V1 boards use either **CP2102** (Silicon Labs) or **CH340** (WCH).
   - If device is not recognized on USB insertion, install the appropriate driver:
     - [CP210x Driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
     - [CH340/CH341 Driver](http://www.wch-ic.com/downloads/CH341SER_ZIP.html)

---

## 2. Compilation Profiles

The `platformio.ini` is pre-configured with two targeted environments:

```ini
[env:esp32dev]
platform = espressif32 @ ^6.5.0
board = esp32dev
framework = arduino
board_build.filesystem = littlefs
monitor_speed = 115200
lib_deps =
    bblanchon/ArduinoJson @ ^7.0.0
    adafruit/Adafruit ADS1X15 @ ^2.4.0
    paulstoffregen/OneWire @ ^2.3.8
    milesburton/DallasTemperature @ ^3.11.0

[env:native]
platform = native
build_flags = -std=c++17
```

---

## 3. Building and Flashing

### Step 1: Open Terminal in `firmware/`
```bash
cd s:\AgriN-Regenerative-Agricultural-Intelligence\firmware
```

### Step 2: Build Firmware (ESP32 target)
```bash
python -m platformio run -e esp32dev
```
PlatformIO will download all libraries (ArduinoJson, Adafruit ADS1X15, OneWire, DallasTemperature) and compile the complete binary image.

### Step 3: Flash to Physical ESP32
Connect your ESP32 DevKit V1 via USB, then run:
```bash
python -m platformio run -e esp32dev --target upload
```
*Note*: If the upload halts at `Connecting........_____.....`, press and hold the **BOOT** button on the ESP32 DevKit board for 2 seconds until the flashing percentage begins.

### Step 4: Flash LittleFS File System
To create and format the LittleFS storage partition for offline telemetry buffering:
```bash
python -m platformio run -e esp32dev --target uploadfs
```

---

## 4. Serial Monitoring & Real-time Debugging

Launch the interactive serial monitor:
```bash
python -m platformio device monitor -b 115200
```

### Expected Startup Log Output
```
[BOOT] AgriSense IoT Firmware v2.0.0 Starting...
[BOOT] Reset Reason: Power-on Reset
[INIT] Mounting LittleFS storage... OK (Total: 960 KB, Used: 12 KB)
[INIT] Loading NVS persistent configuration... OK
[INIT] Initializing I2C Bus (SDA: 21, SCL: 22)... OK
[INIT] Detecting ADS1115 ADC at 0x48... FOUND (16-bit)
[INIT] Initializing OneWire on GPIO 4... FOUND 1 sensor(s)
[INIT] Initializing RS485 UART2 (RX: 16, TX: 17, DE: 5)... OK
[WIFI] Connecting to SSID 'AgriFarm-North'...
[WIFI] Connected! IP: 192.168.1.145, RSSI: -64 dBm
[SENSORS] Sampling cycle starting...
[SENSORS] Soil Temp: 24.3 °C (GOOD, SENSOR_MEASURED)
[SENSORS] Moisture:  38.5 % (GOOD, SENSOR_MEASURED, Raw: 2110)
[SENSORS] Soil pH:   6.82 (GOOD, SENSOR_MEASURED, Temp-Compensated)
[SENSORS] Soil EC:   1.42 dS/m (GOOD, SENSOR_MEASURED, 25°C Normalized)
[SENSORS] Soil NPK:  N:45, P:22, K:180 mg/kg (GOOD, Modbus RTU)
[POWER] Battery: 3.94 V (74%, Normal)
[INGEST] Transmitting telemetry to https://agrin.internal/api/telemetry/ingest...
[INGEST] HTTP 201 Created! (Telemetry ID: tel-3a9d21, Saved: 7 measurements)
[HEARTBEAT] Heartbeat acknowledged by server. Free Heap: 192,480 bytes.
```

---

## 5. Troubleshooting & Error Codes

| Symptom / Log Output | Root Cause | Resolution |
| :--- | :--- | :--- |
| `ADS1115 NOT FOUND at 0x48` | I2C wiring issue, wrong pull-ups, or disconnected VDD | Check 3.3V power to ADS1115; verify SDA $\rightarrow$ GPIO 21, SCL $\rightarrow$ GPIO 22; check ADDR is grounded. |
| `Soil Temp: -127.0 °C` | OneWire line disconnected or missing 4.7 kΩ pull-up | Check 4.7 kΩ pull-up resistor between GPIO 4 and 3.3V rail. Check DS18B20 wiring. |
| `Soil Temp: +85.0 °C` | Reading scratchpad before ADC conversion finished | Ensure `requestTemperatures()` delay is at least 750 ms for 12-bit mode. |
| `Soil pH: 3.0 (OUT_OF_RANGE)` | BNC connector loose or signal wire broken | Inspect BNC plug; check signal conditioning potentiometer offset. |
| `HTTP 401 Unauthorized` | Invalid `X-Device-ID` or `X-API-Key` | Verify device is registered in AgriN backend; update credentials in NVS. |
| `HTTP 500 / Connection Refused` | Backend unreachable or offline | Telemetry is safely buffered to LittleFS flash; device will auto-drain on reconnect. |
