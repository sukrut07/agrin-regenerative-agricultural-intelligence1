/**
 * AgriSense Virtual ESP32 Node — Wokwi Simulation Firmware
 * ========================================================
 * Simulates high-precision multi-parameter agricultural telemetry:
 * - Soil Moisture (Capacitive ADC Pin 34 calibrated to 0-100%)
 * - Soil pH (Analog Signal Pin 35 with 2-point buffer curve)
 * - Electrical Conductivity (Pin 32 with KCl solution standard)
 * - Soil Temperature (DS18B20 digital 1-Wire on GPIO 4)
 * - NPK macronutrients (Simulated Modbus RS-485 holding registers)
 * 
 * Transmits authenticated JSON telemetry to AgriN FastAPI Backend.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ── Pin definitions matching hardware profile ──────────────────────────────
#define PIN_SOIL_MOISTURE  34
#define PIN_SOIL_PH        35
#define PIN_SOIL_EC        32
#define PIN_ONE_WIRE_BUS   4
#define PIN_STATUS_LED     2

// ── Networking & AgriN Backend Configuration ────────────────────────────────
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* BACKEND_URL   = "http://host.wokwi.internal:8000/api/telemetry/ingest";
const char* HEARTBEAT_URL = "http://host.wokwi.internal:8000/api/devices/agrisense-wokwi-01/heartbeat";
const char* DEVICE_TOKEN  = "agrin_dev_wokwi_simulated_key_99";
const char* DEVICE_ID     = "agrisense-wokwi-01";
const char* FARM_ID       = "farm-parbhani-01";
const char* FIELD_ID      = "fld-north-cotton-01";

OneWire oneWire(PIN_ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

unsigned long lastTelemetryTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 15000;  // 15 seconds in sim
const unsigned long HEARTBEAT_INTERVAL_MS = 30000;  // 30 seconds
int sequenceNumber = 1;

// Calibration parameters from hardware_profile.json
const int CALIB_DRY_ADC = 3150;
const int CALIB_WET_ADC = 1420;
const float PH7_VOLTAGE = 1.50;
const float PH_SLOPE    = -0.177;

float readMoisturePercent() {
  int raw = analogRead(PIN_SOIL_MOISTURE);
  float pct = map(raw, CALIB_DRY_ADC, CALIB_WET_ADC, 0, 100);
  return constrain(pct, 0.0f, 100.0f);
}

float readSoilPH() {
  int raw = analogRead(PIN_SOIL_PH);
  float voltage = (raw / 4095.0) * 3.3;
  float ph = 7.0 + ((voltage - PH7_VOLTAGE) / PH_SLOPE);
  return constrain(ph, 3.5f, 9.5f);
}

float readSoilEC() {
  int raw = analogRead(PIN_SOIL_EC);
  float voltage = (raw / 4095.0) * 3.3;
  float ec = voltage * 0.45; // dS/m
  return constrain(ec, 0.05f, 5.0f);
}

float readTemperatureC() {
  tempSensors.requestTemperatures();
  float temp = tempSensors.getTempCByIndex(0);
  if (temp < -50.0 || temp > 80.0) {
    temp = 27.5; // fallback simulated room temp
  }
  return temp;
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  String payload = String("{") +
    "\"firmware_version\":\"2.3.1\"," +
    "\"battery_voltage\":3.85," +
    "\"battery_percent\":82.0," +
    "\"signal_rssi\":-58," +
    "\"uptime_seconds\":" + String(millis() / 1000) + "," +
    "\"free_memory_bytes\":" + String(ESP.getFreeHeap()) +
  "}";

  int httpCode = http.POST(payload);
  Serial.printf("[HEARTBEAT] POST status: %d\n", httpCode);
  http.end();
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  digitalWrite(PIN_STATUS_LED, HIGH);

  float moisture = readMoisturePercent();
  float ph = readSoilPH();
  float ec = readSoilEC();
  float temp = readTemperatureC();
  int simN = 185;
  int simP = 28;
  int simK = 210;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  String payload = String("{") +
    "\"device_id\":\"" + DEVICE_ID + "\"," +
    "\"farm_id\":\"" + FARM_ID + "\"," +
    "\"field_id\":\"" + FIELD_ID + "\"," +
    "\"sequence_number\":" + String(sequenceNumber++) + "," +
    "\"firmware_version\":\"2.3.1\"," +
    "\"device_diagnostics\":{" +
      "\"battery_voltage\":3.82," +
      "\"battery_percent\":81.5," +
      "\"signal_rssi\":-60," +
      "\"signal_quality\":90.0" +
    "}," +
    "\"measurements\":[" +
      "{\"sensor_type\":\"SOIL_MOISTURE\",\"parameter_name\":\"Soil Moisture\",\"raw_value\":" + String(analogRead(PIN_SOIL_MOISTURE)) + ",\"calibrated_value\":" + String(moisture, 1) + ",\"unit\":\"%\",\"quality\":\"GOOD\",\"data_source\":\"SENSOR_MEASURED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"SOIL_TEMP\",\"parameter_name\":\"Soil Temperature\",\"raw_value\":" + String(temp, 1) + ",\"calibrated_value\":" + String(temp, 1) + ",\"unit\":\"°C\",\"quality\":\"GOOD\",\"data_source\":\"SENSOR_MEASURED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"SOIL_PH\",\"parameter_name\":\"Soil pH\",\"raw_value\":" + String(analogRead(PIN_SOIL_PH)) + ",\"calibrated_value\":" + String(ph, 2) + ",\"unit\":\"pH\",\"quality\":\"GOOD\",\"data_source\":\"SENSOR_MEASURED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"SOIL_EC\",\"parameter_name\":\"Electrical Conductivity\",\"raw_value\":" + String(analogRead(PIN_SOIL_EC)) + ",\"calibrated_value\":" + String(ec, 2) + ",\"unit\":\"dS/m\",\"quality\":\"GOOD\",\"data_source\":\"SENSOR_MEASURED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"NITROGEN\",\"parameter_name\":\"Nitrogen (N)\",\"calibrated_value\":" + String(simN) + ",\"unit\":\"kg/ha\",\"quality\":\"GOOD\",\"data_source\":\"ML_ESTIMATED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"PHOSPHORUS\",\"parameter_name\":\"Phosphorus (P)\",\"calibrated_value\":" + String(simP) + ",\"unit\":\"kg/ha\",\"quality\":\"GOOD\",\"data_source\":\"ML_ESTIMATED\",\"calibration_version\":\"1.0.0\"}," +
      "{\"sensor_type\":\"POTASSIUM\",\"parameter_name\":\"Potassium (K)\",\"calibrated_value\":" + String(simK) + ",\"unit\":\"kg/ha\",\"quality\":\"GOOD\",\"data_source\":\"ML_ESTIMATED\",\"calibration_version\":\"1.0.0\"}" +
    "]" +
  "}";

  Serial.println("[TELEMETRY] Transmitting authenticated payload...");
  int httpCode = http.POST(payload);
  Serial.printf("[TELEMETRY] Response Code: %d\n", httpCode);
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println(response);
  }
  http.end();

  digitalWrite(PIN_STATUS_LED, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  tempSensors.begin();

  Serial.println("\n🌾 AgriSense ESP32 Virtual Lab Initializing...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n✅ Connected to Wi-Fi! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n⚠️ Wi-Fi not connected (Simulation offline mode)");
  }

  sendHeartbeat();
  sendTelemetry();
}

void loop() {
  unsigned long now = millis();
  if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = now;
    sendHeartbeat();
  }
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;
    sendTelemetry();
  }
  delay(100);
}
