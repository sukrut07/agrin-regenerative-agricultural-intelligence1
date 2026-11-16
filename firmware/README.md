# AgriSense IoT ESP32 Firmware — AgriN Platform

**Firmware Version**: `2.0.0`  
**Target Hardware**: ESP32 DevKit V1 (ESP32-WROOM-32, 30-pin & 36-pin)  
**Framework**: Arduino on ESP-IDF / PlatformIO  
**Platform**: `espressif32 @ ^6.5.0`  
**Communication**: Native Wi-Fi 802.11 b/g/n, HTTPS REST API (TLS 1.2/1.3)  

---

## 1. Overview

The **AgriSense IoT Firmware** connects field-deployed soil and environmental sensors directly to the **AgriN — Regenerative Agricultural Intelligence Network** cloud backend. Designed for harsh agricultural environments, the firmware features robust sensor failover, non-blocking telemetry ingestion, offline FIFO flash buffering, dynamic laboratory calibration profiles, and deep battery power monitoring.

```
       +-------------------------------------------------------+
       |                  AgriSense IoT Node                   |
       |                   (ESP32 DevKit V1)                   |
       +-------------------------------------------------------+
        |         |             |            |               |
     (Analog) (OneWire)     (Analog)     (Analog)       (RS485 Modbus)
        |         |             |            |               |
     ADS1115   DS18B20       ADS1115      ADS1115         MAX3485
     Ch 0      GPIO 4        Ch 1         Ch 2         GPIO 16/17/5
        |         |             |            |               |
    Capacitive  Soil          Soil         Soil           Soil NPK
     Moisture   Temp           pH           EC          (N-P-K-pH-EC)
```

---

## 2. Key Features

- **Multi-Sensor Bus Support**:
  - **Capacitive Moisture Sensor v1.2 / v2.0**: High-precision 16-bit analog sampling via ADS1115 (Ch 0) with Exponential Moving Average (EMA) noise filtering and open/short detection.
  - **DS18B20 Digital Temperature**: 12-bit OneWire protocol with full CRC-8 validation, disconnection fallback (-127°C trap), and 85°C power-on transient filter.
  - **Analog Soil pH Probe**: Glass electrode signal conditioning board sampled via ADS1115 (Ch 1) with live Nernst equation temperature compensation.
  - **Analog Soil EC Probe**: Conductivity interface sampled via ADS1115 (Ch 2) with 25°C temperature normalization.
  - **RS485 Modbus RTU NPK Probe (Optional)**: Hardware Serial2 with MAX3485 transceiver, DE/RE direction switching, CRC-16 Modbus checking, and graceful `UNAVAILABLE` fallback when hardware is omitted.
- **Fail-Safe & Fault-Tolerant Architecture**:
  - Modular driver design: Failure or disconnection of any single sensor never blocks or crashes remaining sensors or system loops.
  - Strict data provenance: Every measurement is tagged with its origin (`SENSOR_MEASURED` vs. `SYNTHETIC`) and quality grade (`GOOD`, `DEGRADED`, `CALIBRATION_EXPIRED`, `OUT_OF_RANGE`, `SENSOR_OFFLINE`, `INVALID`).
- **Offline Telemetry Buffering**:
  - Ring FIFO queue in non-volatile flash memory (LittleFS) buffering up to 500 telemetry packets (~72 hours of hourly readings).
  - Automatic FIFO drain upon Wi-Fi / backend reconnection.
- **Power Management & Diagnostics**:
  - Integrated battery voltage divider monitor with Li-ion discharge curve percentage calculation.
  - Runtime diagnostic counters: heap memory tracking, Wi-Fi RSSI, reset reason extraction, transmission success/failure rates.
  - Deep sleep cycle support with configurable wake-up intervals.

---

## 3. Directory Layout

```
firmware/
├── platformio.ini               # PlatformIO build definition (esp32dev + native unit test)
├── include/
│   ├── config.h                 # Firmware version, timing intervals, buffer limits
│   ├── pins.h                   # 3.3V GPIO assignments and ADS1115 channel map
│   ├── sensor_types.h           # Shared enums and data structures matching AgriN backend
│   ├── calibration.h            # Calibration models (Moisture, Nernst pH, 25°C EC)
│   ├── device_config.h          # NVS persistent runtime device configuration
│   └── telemetry.h              # Telemetry and heartbeat serialization schemas
├── src/
│   ├── main.cpp                 # Arduino setup() and loop() orchestration
│   ├── core/
│   │   ├── configuration_manager.* # NVS persistent storage manager
│   │   ├── device_manager.*        # Central finite state machine (FSM)
│   │   ├── diagnostics.*           # System health and memory monitor
│   │   ├── sensor_manager.*        # Multi-sensor acquisition engine
│   │   └── telemetry_serializer.cpp# Fast JSON encoder matching FastAPI schema
│   ├── sensors/
│   │   ├── sensor_base.h           # Abstract polymorphic sensor driver base
│   │   ├── moisture_sensor.*       # Capacitive moisture driver with EMA filter
│   │   ├── temperature_sensor.*    # DS18B20 OneWire driver with CRC check
│   │   ├── ph_sensor.*             # Soil pH driver with Nernst slope compensation
│   │   ├── ec_sensor.*             # Soil EC driver with 25°C normalization
│   │   └── npk_sensor.*            # RS485 Modbus RTU NPK driver
│   ├── communication/
│   │   ├── wifi_manager.*          # Wi-Fi STA connection with exponential backoff
│   │   ├── authentication.*        # Device header signing (X-Device-ID, X-API-Key)
│   │   └── http_client.*           # HTTPS ingest & heartbeat REST client
│   ├── storage/
│   │   └── telemetry_buffer.*      # LittleFS non-volatile FIFO ring buffer
│   └── power/
│       └── battery_monitor.*       # Battery voltage divider & Li-ion fuel gauge
├── test/
│   └── test_firmware.cpp        # Native C++ unit tests (CRC16, math, buffers)
└── docs/                        # Complete technical guides
```

---

## 4. Quick Start

### Prerequisites
1. Install [Visual Studio Code](https://code.visualstudio.com/) with the [PlatformIO IDE Extension](https://platformio.org/platformio-ide) (or CLI).
2. Connect ESP32 DevKit V1 via Micro-USB to your computer.

### Build and Flash
```bash
cd firmware

# Build firmware for ESP32
python -m platformio run -e esp32dev

# Upload firmware to ESP32 (auto-detects COM port)
python -m platformio run -e esp32dev --target upload

# Open Serial Monitor (115200 baud)
python -m platformio device monitor -b 115200
```

### Run Native Host Tests
```bash
python -m platformio run -e native
```

---

## 5. Technical Documentation Links

- [Firmware Architecture Document](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/FIRMWARE_ARCHITECTURE.md)
- [Sensor Integration Guide](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/SENSOR_INTEGRATION_GUIDE.md)
- [Pin Configuration & Electrical Guide](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/PIN_CONFIGURATION_GUIDE.md)
- [Sensor Calibration Procedures](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/CALIBRATION_PROCEDURES.md)
- [Telemetry Communication & Protocol Spec](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/TELEMETRY_COMMUNICATION_GUIDE.md)
- [Build, Flash, & Debugging Guide](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/BUILD_AND_FLASH_GUIDE.md)
- [Hardware Team Pre-Flight Checklist](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/HARDWARE_TEAM_CHECKLIST.md)
- [Phase 02 Completion Report](file:///s:/AgriN-Regenerative-Agricultural-Intelligence/firmware/PHASE_02_COMPLETION_REPORT.md)
