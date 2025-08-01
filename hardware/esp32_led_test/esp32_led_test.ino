//
// ESP32 BLE Static String Service Example
// Creates a BLE service with custom UUID for static string data transmission
// Modified to send static string to phone via BLE with auto-reconnection

#include "BLEDevice.h"
#include "BLEServer.h"
#include "BLEUtils.h"
#include "BLE2902.h"

// BLE Service and Characteristic UUIDs
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Static string to send
const char* staticMessage = "Hello from SmartBox! This is a static message from ESP32.";

unsigned long lastMessageSent = 0;
const unsigned long messageSendInterval = 2000; // Send message every 2 seconds

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
  Serial.println("Starting BLE Static String Service...");

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

  unsigned long currentMillis = millis();
  
  // Send static message every interval when connected
  if (deviceConnected && currentMillis - lastMessageSent >= messageSendInterval) {
    sendStaticMessage();
    lastMessageSent = currentMillis;
  }
  
  delay(20);
}

void sendStaticMessage() {
  // Create JSON formatted static message
  char messageData[300];
  snprintf(messageData, sizeof(messageData), 
    "{\"type\":\"static_message\",\"message\":\"%s\",\"timestamp\":%lu}",
    staticMessage,
    millis()
  );
  
  // Send via BLE
  pCharacteristic->setValue((uint8_t*)messageData, strlen(messageData));
  pCharacteristic->notify();
  Serial.println(messageData); // Also print to serial for debugging
}