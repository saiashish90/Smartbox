#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// RaceChrono BLE Service UUID
#define RACECHRONO_SERVICE_UUID        "00001ff8-0000-1000-8000-00805f9b34fb"
#define RACECHRONO_SERVICE_UUID_16BIT  "1ff8"

// GPS Characteristics UUIDs (based on RaceChrono API)
#define GPS_MAIN_CHARACTERISTIC_UUID   "00000003-0000-1000-8000-00805f9b34fb"
#define GPS_TIME_CHARACTERISTIC_UUID   "00000004-0000-1000-8000-00805f9b34fb"

// Device name that will appear in RaceChrono
#define DEVICE_NAME "Smartbox DIY"

// GPS Configuration
#define GPS_RX 16  // ESP32 RX2 pin
#define GPS_TX 17  // ESP32 TX2 pin
#define GPS_BAUD 9600

// UBX binary commands for NEO-6M configuration
const unsigned char UBX_5HZ[] PROGMEM = {
  0xB5,0x62,0x06,0x08,0x06,0x00,0xC8,0x00,0x01,0x00,0x01,0x00,0xDE,0x6A // 5Hz update rate
};

const unsigned char UBX_DISABLE_GLL[] PROGMEM = {
  0xB5,0x62,0x06,0x01,0x08,0x00,0xF0,0x01,0x00,0x00,0x00,0x00,0x00,0x01,0x01,0x2B // GxGLL off
};

const unsigned char UBX_DISABLE_GSA[] PROGMEM = {
  0xB5,0x62,0x06,0x01,0x08,0x00,0xF0,0x02,0x00,0x00,0x00,0x00,0x00,0x01,0x02,0x32 // GxGSA off
};

const unsigned char UBX_DISABLE_GSV[] PROGMEM = {
  0xB5,0x62,0x06,0x01,0x08,0x00,0xF0,0x03,0x00,0x00,0x00,0x00,0x00,0x01,0x03,0x39 // GxGSV off
};

const unsigned char UBX_DISABLE_VTG[] PROGMEM = {
  0xB5,0x62,0x06,0x01,0x08,0x00,0xF0,0x05,0x00,0x00,0x00,0x00,0x00,0x01,0x05,0x47 // GxVTG off
};

// BLE Server and Service objects
BLEServer* pServer = NULL;
BLEService* pRaceChronoService = NULL;

// GPS Characteristics
BLECharacteristic* pGpsMainCharacteristic = NULL;
BLECharacteristic* pGpsTimeCharacteristic = NULL;

// GPS object
TinyGPSPlus gps;
HardwareSerial GPSSerial(2); // Use Serial2 (RX2, TX2)

// GPS variables
int gpsPreviousDateAndHour = 0;
uint8_t gpsSyncBits = 0;
uint8_t tempData[20];
int ledState = LOW;

// Connection state
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Connection callback class
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected to RaceChrono");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected from RaceChrono");
    }
};

void gpsSetup() {
    // Initialize GPS on Serial2 (RX2, TX2)
    GPSSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX, GPS_TX);
    Serial.println("GPS initialized on Serial2");
    
    // Configure NEO-6M for 5Hz update rate and enable only RMC and GGA
    delay(1000); // Wait for GPS to initialize
    
    Serial.println("Configuring GPS with UBX binary commands...");
    
    // Set update rate to 5Hz
    Serial.println("Setting GPS to 5Hz update rate...");
    for(unsigned int i = 0; i < sizeof(UBX_5HZ); i++) {
        GPSSerial.write(pgm_read_byte(UBX_5HZ + i));
    }
    delay(100);
    
    // Disable GLL sentences
    // Serial.println("Disabling GLL sentences...");
    // for(unsigned int i = 0; i < sizeof(UBX_DISABLE_GLL); i++) {
    //     GPSSerial.write(pgm_read_byte(UBX_DISABLE_GLL + i));
    // }
    // delay(100);
    
    // // Disable GSA sentences
    // Serial.println("Disabling GSA sentences...");
    // for(unsigned int i = 0; i < sizeof(UBX_DISABLE_GSA); i++) {
    //     GPSSerial.write(pgm_read_byte(UBX_DISABLE_GSA + i));
    // }
    // delay(100);
    
    // // Disable GSV sentences
    // Serial.println("Disabling GSV sentences...");
    // for(unsigned int i = 0; i < sizeof(UBX_DISABLE_GSV); i++) {
    //     GPSSerial.write(pgm_read_byte(UBX_DISABLE_GSV + i));
    // }
    // delay(100);
    
    // // Disable VTG sentences
    // Serial.println("Disabling VTG sentences...");
    // for(unsigned int i = 0; i < sizeof(UBX_DISABLE_VTG); i++) {
    //     GPSSerial.write(pgm_read_byte(UBX_DISABLE_VTG + i));
    // }
    // delay(100);
    
    Serial.println("GPS configuration complete - Only RMC and GGA enabled at 5Hz");
}

void gpsLoop() {
    // Read GPS data
    while (GPSSerial.available() > 0) {
        char c = GPSSerial.read();
        
        // Print raw NMEA sentences as they come in
        if (c == '$') {
            // Start of NMEA sentence
            Serial.print("RAW NMEA: $");
        } else if (c == '\n') {
            // End of NMEA sentence
            Serial.println();
        } else {
            // Print character as part of NMEA sentence
            Serial.print(c);
        }
        
        if (gps.encode(c)) {
            // Toggle LED every time valid GPS data is received
            ledState = ledState == LOW ? HIGH : LOW;
            digitalWrite(2, ledState); // Built-in LED on GPIO 2

            // Only process if we have a valid fix
            if (gps.location.isValid() && gps.date.isValid() && gps.time.isValid()) {
                // Calculate date field
                int dateAndHour = (gps.date.year() * 8928) + ((gps.date.month()-1) * 744) + ((gps.date.day()-1) * 24) + gps.time.hour();
                if (gpsPreviousDateAndHour != dateAndHour) {
                    gpsPreviousDateAndHour = dateAndHour;
                    gpsSyncBits++;
                }

                // Calculate time field
                int timeSinceHourStart = (gps.time.minute() * 30000) + (gps.time.second() * 500) + (gps.time.centisecond() * 5);

                // Calculate latitude and longitude (convert to fixed point format)
                int latitude = gps.location.lat() * 10000000;  // Convert to fixed point
                int longitude = gps.location.lng() * 10000000; // Convert to fixed point

                // Calculate altitude, speed and bearing
                int altitude = gps.altitude.meters() > 6000.f ? 
                    (max(0, (int)round(gps.altitude.meters() + 500.f)) & 0x7FFF) | 0x8000 : 
                    max(0, (int)round((gps.altitude.meters() + 500.f) * 10.f)) & 0x7FFF; 
                
                int speed = gps.speed.kmph() > 600.f ? 
                    ((max(0, (int)round(gps.speed.kmph() * 10.f))) & 0x7FFF) | 0x8000 : 
                    (max(0, (int)round(gps.speed.kmph() * 100.f))) & 0x7FFF; 
                
                int bearing = max(0, (int)round(gps.course.deg() * 100.f));

                // Create main data
                tempData[0] = ((gpsSyncBits & 0x7) << 5) | ((timeSinceHourStart >> 16) & 0x1F);
                tempData[1] = timeSinceHourStart >> 8;
                tempData[2] = timeSinceHourStart;
                tempData[3] = ((min(0x3, (int)(gps.satellites.value() > 0 ? 1 : 0)) & 0x3) << 6) | ((min(0x3F, (int)gps.satellites.value())) & 0x3F);
                tempData[4] = latitude >> 24;
                tempData[5] = latitude >> 16;
                tempData[6] = latitude >> 8;
                tempData[7] = latitude >> 0;
                tempData[8] = longitude >> 24;
                tempData[9] = longitude >> 16;
                tempData[10] = longitude >> 8;
                tempData[11] = longitude >> 0;
                tempData[12] = altitude >> 8;
                tempData[13] = altitude;
                tempData[14] = speed >> 8;
                tempData[15] = speed;
                tempData[16] = bearing >> 8;
                tempData[17] = bearing;
                tempData[18] = round(gps.hdop.value() * 10.f);
                tempData[19] = 0xFF; // Unimplemented 
               
                // Notify main characteristics if connected
                if (deviceConnected && pGpsMainCharacteristic) {
                    pGpsMainCharacteristic->setValue(tempData, 20);
                    pGpsMainCharacteristic->notify();
                }

                // Create time data
                tempData[0] = ((gpsSyncBits & 0x7) << 5) | ((dateAndHour >> 16) & 0x1F);
                tempData[1] = dateAndHour >> 8;
                tempData[2] = dateAndHour;

                // Notify time characteristics if connected
                if (deviceConnected && pGpsTimeCharacteristic) {
                    pGpsTimeCharacteristic->setValue(tempData, 3);
                    pGpsTimeCharacteristic->notify();
                }

                // Debug output
                Serial.printf("GPS: Lat=%.6f, Lon=%.6f, Alt=%.1f, Speed=%.1f, Sat=%d, Fix=%s\n", 
                             gps.location.lat(), gps.location.lng(), gps.altitude.meters(), 
                             gps.speed.kmph(), gps.satellites.value(), 
                             gps.location.isValid() ? "Valid" : "Invalid");
            }
        }
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Starting Smartbox DIY BLE Device with GPS...");

    // Initialize LED
    pinMode(2, OUTPUT);
    digitalWrite(2, ledState);

    // Initialize GPS
    gpsSetup();

    // Initialize BLE
    BLEDevice::init(DEVICE_NAME);
    
    // Create BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create RaceChrono Service
    pRaceChronoService = pServer->createService(RACECHRONO_SERVICE_UUID);

    // Create GPS Characteristics
    pGpsMainCharacteristic = pRaceChronoService->createCharacteristic(
        GPS_MAIN_CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
    );
    pGpsMainCharacteristic->addDescriptor(new BLE2902());

    pGpsTimeCharacteristic = pRaceChronoService->createCharacteristic(
        GPS_TIME_CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
    );
    pGpsTimeCharacteristic->addDescriptor(new BLE2902());

    // Start the service
    pRaceChronoService->start();

    // Start advertising
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(RACECHRONO_SERVICE_UUID);
    pAdvertising->setScanResponse(true);  // Enable scan response for better discovery
    pAdvertising->setMinPreferred(0x06);  // Set minimum preferred interval
    pAdvertising->setMaxPreferred(0x12);  // Set maximum preferred interval
    BLEDevice::startAdvertising();
    
    Serial.println("BLE Device started and advertising");
    Serial.print("Device Name: ");
    Serial.println(DEVICE_NAME);
    Serial.print("Service UUID: ");
    Serial.println(RACECHRONO_SERVICE_UUID);
    Serial.println("GPS functionality enabled");
    Serial.println("Device should now be discoverable by RaceChrono");
}

void loop() {
    // Handle disconnection and reconnection
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("Start advertising");
        oldDeviceConnected = deviceConnected;
    }
    
    // Handle connection
    if (deviceConnected && !oldDeviceConnected) {
        // do stuff here on connecting
        oldDeviceConnected = deviceConnected;
    }

    // Process GPS data
    gpsLoop();

    delay(10); // Small delay to prevent overwhelming the system
}
