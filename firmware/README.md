# 🔌 AgriSense IoT ESP32 Firmware — AgriN Platform

> **Navigation:** [Root README](../README.md) · [Hardware & Commissioning](../hardware/README.md) · [Wokwi Lab](wokwi/README.md) · [Backend](../backend/README.md) · [Docs Hub](../docs/README.md)

**Firmware Version:** `2.0.0`  
**Target Hardware:** ESP32 DevKit V1 (`ESP32-WROOM-32`)  
**Framework:** Arduino on ESP-IDF / PlatformIO (`espressif32 @ ^6.5.0`)  
**Communication:** Wi-Fi `802.11 b/g/n`, HTTPS REST API (`TLS 1.2/1.3`, ISRG Root X1 verification)

---

## 📑 Table of Contents
- [1. Overview & Bus Topology](#1-overview--bus-topology)
- [2. Key Safety & Acquisition Features](#2-key-safety--acquisition-features)
- [3. Directory Layout](#3-directory-layout)
- [4. Quick Start & Host Tests](#4-quick-start--host-tests)
- [5. Firmware & Audit Documentation Index](#5-firmware--audit-documentation-index)
- [6. Wokwi Virtual Sensor Lab](#6-wokwi-virtual-sensor-lab)
- [7. Power Management](#7-power-management)

---

## 1. Overview & Bus Topology

```text
       +-------------------------------------------------------+
       |                  AgriSense IoT Node                   |
       |                   (ESP32 DevKit V1)                   |
       +-------------------------------------------------------+
        |         |             |            |               |
     (I2C)     (OneWire)      (I2C)        (I2C)       (RS485 UART2)
        |         |             |            |               |
     ADS1115   DS18B20       ADS1115      ADS1115         MAX3485
     Ch 0      GPIO 4        Ch 1         Ch 2         GPIO 16/17/27
        |         |             |            |               |
    Capacitive  Soil          Soil         Soil           Soil NPK
     Moisture   Temp           pH           EC        (Optional Modbus)
```

> Pin allocations match [include/pins.h](include/pins.h): RS485 `DE/RE` uses non-strapping **`GPIO 27`** (avoiding `GPIO 5` boot PWM contention), and battery monitoring reads **`GPIO 34`** (`100kΩ / 100kΩ` divider).

---

## 2. Key Safety & Acquisition Features

- **Analog Bring-Up Safety Gate (`diagnostics/hardware_bringup.*`)**: All analog sensor channels boot in `DISABLED` / `AWAITING_VOLTAGE_VERIFICATION` state until verified within the `3.30V` ESP32 ADC limit.
- **Multi-Sensor Drivers (`src/sensors/`)**:
  - **Capacitive Moisture (`ADS1115 Ch 0`)**: 16-bit ADC sampling with EMA noise filtering and open/short fault trapping.
  - **DS18B20 Temperature (`GPIO 4`)**: 1-Wire CRC-8 validation filtering `-127°C` disconnect and `85°C` power-on transient codes.
  - **Soil pH (`ADS1115 Ch 1`) & EC (`ADS1115 Ch 2`)**: Nernst and `25°C` temperature compensation models.
  - **RS485 Modbus RTU NPK (`MAX3485`, `GPIO 16/17/27`)**: CRC-16 Modbus checking and `1050 µs` TX-flush guard; reports `UNAVAILABLE` cleanly when omitted.
- **Offline Flash Buffering (`LittleFS`)**: Ring FIFO journal buffering packets during connectivity drops and replaying cleanly on reconnect.
- **Strict Provenance & Security**: Every packet carries calibrated provenance (`SENSOR_MEASURED` vs `SYNTHETIC`), quality grades, TLS CA validation (`setCACert`), and device auth headers.

---

## 3. Directory Layout

```text
firmware/
├── platformio.ini                   # PlatformIO targets (`esp32dev` + `native` unit tests)
├── hardware_profile.json            # Calibrated sensor bounds & hardware profile
├── include/
│   ├── config.h                     # Firmware version, intervals, buffer limits
│   ├── pins.h                       # Authoritative 3.3V GPIO & ADS1115 channel map
│   ├── sensor_types.h               # Shared enums matching AgriN backend schemas
│   ├── calibration.h                # Moisture, Nernst pH, 25°C EC & 12-pt Li-ion OCV models
│   ├── device_config.h              # NVS persistent configuration structures
│   ├── telemetry.h                  # JSON packet schemas
│   └── diagnostics/hardware_bringup.h  # Safe Stage A commissioning diagnostics header
├── src/
│   ├── main.cpp                     # Arduino setup/loop & diagnostic console dispatch
│   ├── core/                        # configuration_manager, device_manager, diagnostics, sensor_manager, serializer
│   ├── sensors/                     # sensor_base, moisture, temperature, ph, ec, npk
│   ├── communication/               # wifi_manager, authentication, http_client (Root CA TLS)
│   ├── storage/                     # telemetry_buffer (LittleFS FIFO journal)
│   ├── power/                       # battery_monitor
│   └── diagnostics/                 # hardware_bringup.cpp
├── test/test_firmware.cpp           # Native C++ unit tests
└── wokwi/                           # Browser / VS Code virtual ESP32 testbench
```

---

## 4. Quick Start & Host Tests

```bash
cd firmware

# Build embedded ESP32 firmware
python -m platformio run -e esp32dev

# Run native C++ host unit tests
python -m platformio run -e native

# Upload & monitor physical ESP32 over USB serial
python -m platformio run -e esp32dev --target upload
python -m platformio device monitor -b 115200
```

Python firmware bring-up and backend contract tests:
```bash
.venv/bin/pytest tests/test_firmware_diagnostics_unit.py -v
```

---

## 5. Firmware & Audit Documentation Index

| Category | Documents |
| :--- | :--- |
| **Architecture & Hardware** | [FIRMWARE_ARCHITECTURE.md](FIRMWARE_ARCHITECTURE.md) · [AGRISENSE_FIRMWARE_SPEC.md](AGRISENSE_FIRMWARE_SPEC.md) · [PIN_CONFIGURATION_GUIDE.md](PIN_CONFIGURATION_GUIDE.md) · [SENSOR_INTEGRATION_GUIDE.md](SENSOR_INTEGRATION_GUIDE.md) |
| **Setup, Calibration & Protocol** | [BUILD_AND_FLASH_GUIDE.md](BUILD_AND_FLASH_GUIDE.md) · [CALIBRATION_PROCEDURES.md](CALIBRATION_PROCEDURES.md) · [TELEMETRY_COMMUNICATION_GUIDE.md](TELEMETRY_COMMUNICATION_GUIDE.md) · [HARDWARE_TEAM_CHECKLIST.md](HARDWARE_TEAM_CHECKLIST.md) |
| **Engineering Audits** | [FIRMWARE_SECURITY_AUDIT.md](FIRMWARE_SECURITY_AUDIT.md) · [ELECTRICAL_SAFETY_AUDIT.md](ELECTRICAL_SAFETY_AUDIT.md) · [SENSOR_CALIBRATION_AUDIT.md](SENSOR_CALIBRATION_AUDIT.md) · [POWER_MANAGEMENT_AUDIT.md](POWER_MANAGEMENT_AUDIT.md) · [BACKEND_CONTRACT_TEST_REPORT.md](BACKEND_CONTRACT_TEST_REPORT.md) |
| **Phase Reports & Bench Links** | [PHASE_02_COMPLETION_REPORT.md](PHASE_02_COMPLETION_REPORT.md) · [PHASE_02_1_COMPLETION_REPORT.md](PHASE_02_1_COMPLETION_REPORT.md) · [Hardware Commissioning Hub](../hardware/README.md) |

---

## 6. Wokwi Virtual Sensor Lab

See [wokwi/README.md](wokwi/README.md) for instructions on launching `diagram.json` / `wokwi.toml` / `src/main_simulation.cpp` in VS Code or on [Wokwi.com](https://wokwi.com).

---

## 7. Power Management

Powered by a **3.7V 3000mAh 18650 Li-ion cell** with a `5V 2W` solar panel and charge controller:
- Active measurement & Wi-Fi TX burst: `~4.2s @ 120 mA` peak (`~0.14 mAh` per cycle)
- Deep sleep budget: `15 µA` target, `15-minute` wake intervals (`96` transmissions/day)
- Autonomous overcast estimate: `62+ days` without solar recharge (full analysis in [POWER_MANAGEMENT_AUDIT.md](POWER_MANAGEMENT_AUDIT.md)).
