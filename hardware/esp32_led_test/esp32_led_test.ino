#include <TinyGPS.h>

//
// ESP32 BLE Static String Service Example with GPS
// Creates a BLE service with custom UUID for static string data transmission
// Modified to send static string to phone via BLE with auto-reconnection
// Added GPS functionality using NEO-6M module on RX2/TX2

#include "BLEDevice.h"
#include "BLEServer.h"
#include "BLEUtils.h"
#include "BLE2902.h"
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// GPS Configuration
#define GPS_RX 16  // ESP32 RX2 pin
#define GPS_TX 17  // ESP32 TX2 pin
#define GPS_BAUD 9600

// BLE Service and Characteristic UUIDs
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// GPS objects
TinyGPSPlus gps;
HardwareSerial GPSSerial(2); // Use UART2

unsigned long lastMessageSent = 0;
const unsigned long messageSendInterval = 2000; // Send GPS data every 2 seconds
unsigned long lastGPSPrint = 0;
const unsigned long gpsPrintInterval = 10000; // Print GPS data every 10 seconds

// Callback class for BLE server events
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected - will auto-reconnect");
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE Static String Service with GPS...");

  // Initialize GPS
  GPSSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("GPS initialized on RX2/TX2");

  // Initialize BLE
  BLEDevice::init("SmartBox");
  
  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // Create a BLE Descriptor
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  startAdvertising();
  
  Serial.println("Waiting for a client connection to notify...");
  Serial.println("GPS data will be printed to serial...");
}

void startAdvertising() {
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);  // Enable scan response for better discovery
  pAdvertising->setMinPreferred(0x06);  // Set minimum preferred interval
  pAdvertising->setMaxPreferred(0x12);  // Set maximum preferred interval
  BLEDevice::startAdvertising();
  Serial.println("Started advertising");
}

void loop() {
  // Read GPS data
  while (GPSSerial.available() > 0) {
    if (gps.encode(GPSSerial.read())) {
      // GPS data was successfully parsed
    }
  }

  // Print GPS data to serial
  unsigned long currentMillis = millis();
  if (currentMillis - lastGPSPrint >= gpsPrintInterval) {
    printGPSData();
    lastGPSPrint = currentMillis;
  }

  // Handle BLE connection state and auto-reconnection
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give the bluetooth stack the chance to get things ready
    startAdvertising(); // restart advertising
    Serial.println("Restarted advertising for reconnection");
    oldDeviceConnected = deviceConnected;
  }
  
  // Connecting
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    Serial.println("Client connected successfully");
  }

  // Send GPS data every interval when connected
  if (deviceConnected && currentMillis - lastMessageSent >= messageSendInterval) {
    sendGPSData();
    lastMessageSent = currentMillis;
  }
  
  delay(20);
}

void sendGPSData() {
  // Create JSON formatted GPS data
  char messageData[500];
  
  if (gps.location.isValid()) {
    snprintf(messageData, sizeof(messageData), 
      "{\"type\":\"gps_data\",\"latitude\":%.6f,\"longitude\":%.6f,\"altitude\":%.1f,\"speed\":%.1f,\"course\":%.1f,\"satellites\":%d,\"date\":\"%02d/%02d/%04d\",\"time\":\"%02d:%02d:%02d\",\"timestamp\":%lu}",
      gps.location.lat(),
      gps.location.lng(),
      gps.altitude.isValid() ? gps.altitude.meters() : 0.0,
      gps.speed.isValid() ? gps.speed.kmph() : 0.0,
      gps.course.isValid() ? gps.course.deg() : 0.0,
      gps.satellites.value(),
      gps.date.isValid() ? gps.date.month() : 0,
      gps.date.isValid() ? gps.date.day() : 0,
      gps.date.isValid() ? gps.date.year() : 0,
      gps.time.isValid() ? gps.time.hour() : 0,
      gps.time.isValid() ? gps.time.minute() : 0,
      gps.time.isValid() ? gps.time.second() : 0,
      millis()
    );
  } else {
    // No GPS fix available
    snprintf(messageData, sizeof(messageData), 
      "{\"type\":\"gps_data\",\"status\":\"no_fix\",\"satellites\":%d,\"timestamp\":%lu}",
      gps.satellites.value(),
      millis()
    );
  }
  
  // Send via BLE
  pCharacteristic->setValue((uint8_t*)messageData, strlen(messageData));
  pCharacteristic->notify();
  Serial.println(messageData); // Also print to serial for debugging
}

void printGPSData() {
  Serial.println("=== GPS Data ===");
  
  if (gps.location.isValid()) {
    Serial.print("Latitude: ");
    Serial.println(gps.location.lat(), 6);
    Serial.print("Longitude: ");
    Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("Location: Not available");
  }

  if (gps.date.isValid()) {
    Serial.print("Date: ");
    Serial.print(gps.date.month());
    Serial.print("/");
    Serial.print(gps.date.day());
    Serial.print("/");
    Serial.println(gps.date.year());
  } else {
    Serial.println("Date: Not available");
  }

  if (gps.time.isValid()) {
    Serial.print("Time: ");
    if (gps.time.hour() < 10) Serial.print("0");
    Serial.print(gps.time.hour());
    Serial.print(":");
    if (gps.time.minute() < 10) Serial.print("0");
    Serial.print(gps.time.minute());
    Serial.print(":");
    if (gps.time.second() < 10) Serial.print("0");
    Serial.println(gps.time.second());
  } else {
    Serial.println("Time: Not available");
  }

  Serial.print("Satellites: ");
  Serial.println(gps.satellites.value());

  Serial.print("Altitude: ");
  if (gps.altitude.isValid()) {
    Serial.print(gps.altitude.meters());
    Serial.println(" meters");
  } else {
    Serial.println("Not available");
  }

  Serial.print("Speed: ");
  if (gps.speed.isValid()) {
    Serial.print(gps.speed.kmph());
    Serial.println(" km/h");
  } else {
    Serial.println("Not available");
  }

  Serial.print("Course: ");
  if (gps.course.isValid()) {
    Serial.print(gps.course.deg());
    Serial.println(" degrees");
  } else {
    Serial.println("Not available");
  }

  Serial.println("==================");
}