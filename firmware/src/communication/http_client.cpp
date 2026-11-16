#include "http_client.h"

#ifdef ARDUINO
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

// ISRG Root X1 (Let's Encrypt / Production AgriN HTTPS Root Certificate)
static const char* AGRISENSE_ROOT_CA =
    "-----BEGIN CERTIFICATE-----\n"
    "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\n"
    "-----END CERTIFICATE-----\n";
#endif

HttpClient::HttpClient(const std::string& base_url, const Authentication& auth)
    : m_base_url(base_url), m_auth(auth) {}

HttpResponse HttpClient::executePost(const std::string& url, const std::string& json_payload) {
    HttpResponse resp;

#ifdef ARDUINO
    bool is_https = (url.rfind("https://", 0) == 0);
    HTTPClient http;
    WiFiClient plainClient;
    WiFiClientSecure secureClient;
    bool begin_ok = false;

    if (is_https) {
        // SECURITY REQUIREMENT: Validate server certificates against trusted root CA.
        // Never disable certificate verification (no setInsecure).
        secureClient.setCACert(AGRISENSE_ROOT_CA);
        secureClient.setTimeout(10);
        begin_ok = http.begin(secureClient, url.c_str());
    } else {
        plainClient.setTimeout(10);
        begin_ok = http.begin(plainClient, url.c_str());
    }

    if (!begin_ok) {
        resp.success = false;
        resp.error_message = "Failed to initialize HTTP(S) connection";
        return resp;
    }

    http.setTimeout(10000); // 10 second timeout

    // Add headers
    auto headers = m_auth.getAuthHeaders();
    for (const auto& kv : headers) {
        http.addHeader(kv.first.c_str(), kv.second.c_str());
    }

    int httpCode = http.POST(json_payload.c_str());
    resp.status_code = httpCode;

    if (httpCode > 0) {
        resp.body = http.getString().c_str();
        resp.success = (httpCode == 200 || httpCode == 201);
        if (!resp.success) {
            resp.error_message = std::string("HTTP Error: ") + std::to_string(httpCode);
        }
    } else {
        resp.success = false;
        resp.error_message = http.errorToString(httpCode).c_str();
    }

    http.end();
#else
    // Host / simulation fallback: mock success for testing
    (void)url;
    (void)json_payload;
    resp.status_code = 201;
    resp.body = "{\"status\": \"SUCCESS\", \"telemetry_id\": \"mock-telemetry-001\"}";
    resp.success = true;
#endif

    return resp;
}

HttpResponse HttpClient::postTelemetry(const TelemetryPacket& packet) {
    std::string url = m_base_url + "/api/telemetry/ingest";
    std::string json = packet.toJson();
    return executePost(url, json);
}

HttpResponse HttpClient::postHeartbeat(const HeartbeatPacket& heartbeat) {
    std::string url = m_base_url + "/api/devices/" + m_auth.getDeviceId() + "/heartbeat";
    std::string json = heartbeat.toJson();
    return executePost(url, json);
}
