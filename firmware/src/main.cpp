#include <stdint.h>
#include "config.h"
#include "core/device_manager.h"
#include "diagnostics/hardware_bringup.h"

#ifdef ARDUINO
#include <Arduino.h>
#endif

// Global Device Manager Instance
static DeviceManager g_deviceManager;

#ifdef ARDUINO
void setup() {
    // Initialize Serial Port for Diagnostics
    Serial.begin(SERIAL_DEBUG_BAUD);
    delay(1000);

    // Initialize bring-up diagnostics harness & print safety banner
    AgriSenseDiagnostics::HardwareBringup::getInstance().init();
    AgriSenseDiagnostics::HardwareBringup::getInstance().printStartupBanner();

    // Run hardware & subsystem setup
    if (g_deviceManager.setup()) {
        Serial.println("[BOOT] Device Manager initialized successfully.");
    } else {
        Serial.println("[BOOT ERROR] Failed to initialize one or more subsystems.");
    }

    // Trigger initial baseline sensor sampling and transmission
    Serial.println("[BOOT] Executing initial baseline sensor sampling...");
    g_deviceManager.triggerSensorSample();
    g_deviceManager.triggerTelemetryTransmit();
    g_deviceManager.triggerHeartbeat();
}

void loop() {
    AgriSenseDiagnostics::HardwareBringup::getInstance().processSerialCommands();
    g_deviceManager.loop();
    delay(10); // Yield to FreeRTOS scheduler
}
#else
// Host C++ entry point (for desktop verification)
#include <iostream>

int main(int argc, char** argv) {
    (void)argc;
    (void)argv;
    std::cout << "AgriSense Native Host Test Executable v" << AGRISENSE_FW_VERSION << std::endl;
    AgriSenseDiagnostics::HardwareBringup::getInstance().init();
    std::cout << AgriSenseDiagnostics::HardwareBringup::getInstance().executeCommand("HELP");
    g_deviceManager.setup();
    g_deviceManager.triggerSensorSample();
    g_deviceManager.triggerTelemetryTransmit();
    std::cout << "Host execution test passed." << std::endl;
    return 0;
}
#endif
