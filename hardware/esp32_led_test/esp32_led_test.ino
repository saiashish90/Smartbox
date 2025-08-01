//
// ESP32 BLE Time Service Example
// Creates a BLE service with custom UUID for time data transmission
// Modified to send current time to phone via BLE

#include "BLEDevice.h"
#include "BLEServer.h"
#include "BLEUtils.h"
#include "BLE2902.h"
#include <time.h>

// BLE Service and Characteristic UUIDs
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// NTP Server to get time
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0; // No timezone offset
const int daylightOffset_sec = 0; // No daylight saving

unsigned long lastTimeSent = 0;
const unsigned long timeSendInterval = 1000; // Send time every 1 second

// Callback class for BLE server events
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected");
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE Time Service...");

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
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);  // Enable scan response for better discovery
  pAdvertising->setMinPreferred(0x06);  // Set minimum preferred interval
  pAdvertising->setMaxPreferred(0x12);  // Set maximum preferred interval
  BLEDevice::startAdvertising();
  Serial.println("Waiting for a client connection to notify...");
  
  // Initialize time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time sync...");
  time_t now = 0;
  while (now < 24 * 3600) {
    delay(100);
    now = time(nullptr);
  }
  Serial.println("Time synchronized!");
}

void loop() {
  // Handle BLE connection state
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
  }
  
  // Connecting
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  unsigned long currentMillis = millis();
  
  // Send time data every second when connected
  if (deviceConnected && currentMillis - lastTimeSent >= timeSendInterval) {
    sendTimeData();
    lastTimeSent = currentMillis;
  }
  
  delay(20);
}

void sendTimeData() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  
  // Create JSON formatted time data
  char timeData[200];
  snprintf(timeData, sizeof(timeData), 
    "{\"type\":\"time\",\"timestamp\":%ld,\"hour\":%d,\"minute\":%d,\"second\":%d,\"day\":%d,\"month\":%d,\"year\":%d}",
    now,
    timeinfo.tm_hour,
    timeinfo.tm_min, 
    timeinfo.tm_sec,
    timeinfo.tm_mday,
    timeinfo.tm_mon + 1,
    timeinfo.tm_year + 1900
  );
  
  // Send via BLE
  pCharacteristic->setValue((uint8_t*)timeData, strlen(timeData));
  pCharacteristic->notify();
  Serial.println(timeData); // Also print to serial for debugging
}