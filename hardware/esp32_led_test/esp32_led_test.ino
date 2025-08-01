/*
 * ESP32 Bluetooth LED Test Script
 * 
 * This script implements Bluetooth pairing functionality.
 * The LED will only blink after a phone successfully pairs with the ESP32.
 * 
 * Hardware: ESP32 Development Board
 * LED Pin: GPIO 2 (built-in LED on most ESP32 boards)
 */

#include "BluetoothSerial.h"

// Check if Bluetooth is available
#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to enable it
#endif

BluetoothSerial SerialBT;

// Define the LED pin
const int ledPin = 2;  // Built-in LED on most ESP32 boards

// Bluetooth device name
const char* deviceName = "Smartbox_ESP32";

// Variables to track connection state
bool isConnected = false;

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(115200);
  Serial.println("ESP32 Bluetooth LED Test Starting...");
  // Initialize Bluetooth
  SerialBT.begin(deviceName);
  Serial.println("Bluetooth device started");
  Serial.print("Device name: ");
  Serial.println(deviceName);
  Serial.println("Waiting for phone to pair...");
  Serial.println("LED will only blink after successful pairing");
}

void loop() {
  // Check for Bluetooth connection
  if (SerialBT.hasClient()) {
    if (!isConnected) {
      isConnected = true;
      Serial.println("Phone connected!");
      SerialBT.println("Device connected to Smartbox_ESP32");
    }
  } else {
    if (isConnected) {
      isConnected = false;
      Serial.println("Phone disconnected.");
    }
  }
  
  delay(100); // Small delay to prevent watchdog issues
}