# AgriSense IoT — Telemetry Communication & Protocol Specification

**Version**: `2.0.0`  
**Classification**: Networking & Data Protocol Specification  
**Endpoints**: FastAPI AgriN Ingest (`/api/telemetry/ingest`) and Heartbeat (`/api/devices/{id}/heartbeat`)  

---

## 1. Network Topology & Protocol Stack

```
   [ESP32 Node]
        |
    (TLS 1.2 / HTTPS REST)
        |
        v
   [Wi-Fi Access Point / Cellular Gateway]
        |
        v
   [AgriN Cloud Backend (FastAPI / Uvicorn)]
        |
        +---> SQLite / PostgreSQL (iot_telemetry & iot_devices)
        |
        +---> TelemetryToIntelligenceBridge
        |
        v
   [AgriN AI Engine (Soil, Moisture, Suitability, Irrigation)]
```

---

## 2. Authentication Protocol

All HTTP requests transmitted by the ESP32 firmware MUST supply hardware authentication headers:
- `X-Device-ID`: The unique hardware identifier configured during provisioning (e.g., `agrisense-alpha-001`).
- `X-API-Key`: The 64-character hex secret token provisioned during device registration.
- `Content-Type`: `application/json`.

If credentials fail verification, the server responds with `401 Unauthorized` or `403 Forbidden`. The firmware logs the error and throttles retries to avoid flooding the server.

---

## 3. Telemetry Ingest Payload Specification

### Endpoint: `POST /api/telemetry/ingest`

#### JSON Request Schema
```json
{
  "device_id": "agrisense-alpha-001",
  "firmware_version": "2.0.0",
  "data_source": "SENSOR_MEASURED",
  "timestamp": "2026-11-16T19:25:00Z",
  "measurements": [
    {
      "sensor_type": "SOIL_MOISTURE",
      "raw_value": 2100.5,
      "calibrated_value": 38.2,
      "unit": "%",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "calib-moisture-2026-v1",
      "is_valid": true
    },
    {
      "sensor_type": "SOIL_TEMP",
      "raw_value": 24.8,
      "calibrated_value": 24.8,
      "unit": "degC",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "factory-ds18b20",
      "is_valid": true
    },
    {
      "sensor_type": "SOIL_PH",
      "raw_value": 2.52,
      "calibrated_value": 6.85,
      "unit": "pH",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "calib-ph-2026-v1",
      "is_valid": true
    },
    {
      "sensor_type": "SOIL_EC",
      "raw_value": 1.48,
      "calibrated_value": 1.46,
      "unit": "dS/m",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "calib-ec-2026-v1",
      "is_valid": true
    },
    {
      "sensor_type": "NITROGEN",
      "raw_value": 45.0,
      "calibrated_value": 45.0,
      "unit": "mg/kg",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "factory-modbus",
      "is_valid": true
    },
    {
      "sensor_type": "PHOSPHORUS",
      "raw_value": 22.0,
      "calibrated_value": 22.0,
      "unit": "mg/kg",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "factory-modbus",
      "is_valid": true
    },
    {
      "sensor_type": "POTASSIUM",
      "raw_value": 180.0,
      "calibrated_value": 180.0,
      "unit": "mg/kg",
      "quality": "GOOD",
      "data_source": "SENSOR_MEASURED",
      "calibration_version": "factory-modbus",
      "is_valid": true
    }
  ],
  "battery_voltage": 3.92,
  "battery_percentage": 72.0,
  "signal_rssi": -65
}
```

#### Server Response (HTTP 201 Created)
```json
{
  "status": "ingested",
  "telemetry_id": "tel-e49f8721",
  "device_id": "agrisense-alpha-001",
  "measurements_saved": 7,
  "intelligence_triggered": true,
  "timestamp": "2026-11-16T19:25:01Z"
}
```

---

## 4. Heartbeat Payload Specification

### Endpoint: `POST /api/devices/{id}/heartbeat`

The heartbeat is a low-overhead diagnostic packet sent every 60 seconds to maintain device online status without triggering heavy AI inference.

#### JSON Request Schema
```json
{
  "device_id": "agrisense-alpha-001",
  "firmware_version": "2.0.0",
  "battery_voltage": 3.92,
  "battery_percentage": 72.0,
  "free_heap_bytes": 185420,
  "signal_rssi": -65,
  "uptime_seconds": 86400,
  "reset_reason": "POWERON_RESET",
  "sensor_status_flags": 31,
  "last_telemetry_status": "OK",
  "packets_transmitted": 144,
  "packets_buffered": 0
}
```

#### Server Response (HTTP 200 OK)
```json
{
  "status": "heartbeat_acknowledged",
  "device_id": "agrisense-alpha-001",
  "server_time": "2026-11-16T19:25:05Z",
  "firmware_up_to_date": true
}
```

---

## 5. Offline Buffering & Automatic Draining

1. **Network Disruption**: When Wi-Fi is unavailable or the backend responds with HTTP 500, 502, 503, or timeout (10 seconds), the telemetry record is converted into an offline packet and pushed into LittleFS flash FIFO (`storage/telemetry_buffer`).
2. **Buffer Capacity**: Holds up to **500 packets** (~72 hours at 1 packet every 10 minutes).
3. **Circular Ring Overwrite**: If the flash buffer exceeds 500 packets, the oldest packet is dropped (FIFO) to ensure recent data is always retained.
4. **Reconnection Drain**: Upon successful connection to Wi-Fi and the backend, the device enters the `FLUSH_BUFFER` state, sending up to 5 buffered packets per cycle with 500 ms delay between requests until the queue is completely drained.
