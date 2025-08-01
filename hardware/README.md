# Hardware Setup for Smartbox

This folder contains hardware scripts and documentation for the Smartbox project.

## ESP32 Bluetooth LED Test Script

### File: `esp32_led_test/esp32_led_test.ino`

This is an enhanced Arduino sketch that implements Bluetooth pairing functionality. The built-in LED will only blink after a phone successfully pairs with the ESP32 via Bluetooth.

### Requirements

- ESP32 Development Board
- USB cable for programming
- Arduino IDE with ESP32 board support
- Smartphone with Bluetooth capability

### Setup Instructions

1. **Install ESP32 Board Support in Arduino IDE:**
   - Open Arduino IDE
   - Go to File > Preferences
   - Add this URL to "Additional Board Manager URLs": `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Go to Tools > Board > Boards Manager
   - Search for "ESP32" and install "ESP32 by Espressif Systems"

2. **Configure Board Settings:**
   - Select your ESP32 board: Tools > Board > ESP32 Arduino > ESP32 Dev Module
   - Set upload speed: Tools > Upload Speed > 115200
   - Select the correct COM port: Tools > Port > (your ESP32 port)

3. **Upload the Script:**
   - Open `esp32_led_test.ino` in Arduino IDE
   - Click the Upload button (→)
   - Wait for upload to complete

4. **Test the Bluetooth Connection:**
   - After upload, the ESP32 will appear as "Smartbox_ESP32" in your phone's Bluetooth settings
   - Pair your phone with the ESP32
   - Once paired, the built-in LED will start blinking every 2 seconds
   - Open Serial Monitor (Tools > Serial Monitor) to see connection status
   - Set baud rate to 115200
   - You should see "Phone connected! Starting LED blink..." when paired

### Expected Behavior

- ESP32 appears as "Smartbox_ESP32" in Bluetooth settings
- LED remains OFF until phone pairs with ESP32
- Once paired, LED starts blinking every 2 seconds
- LED stops blinking when phone disconnects
- Serial monitor shows connection status and LED state
- If this works, your ESP32 Bluetooth functionality is working correctly

### Troubleshooting

- **LED doesn't flash:** Check if your ESP32 board uses a different pin for the built-in LED
- **Upload fails:** Check USB connection and board selection
- **No serial output:** Verify baud rate is set to 115200
- **Bluetooth not working:** Make sure Bluetooth is enabled in Arduino IDE board settings
- **Phone can't find device:** Check if ESP32 is powered and Bluetooth is initialized
- **LED doesn't blink after pairing:** Check serial monitor for connection status messages

### Next Steps

Once this Bluetooth test works, you can proceed to implement:
- GPS data transmission over Bluetooth
- Custom data protocols for GPS coordinates
- Integration with the React Native app for GPS tracking
- Battery management and power optimization

## Hardware Components Needed

- ESP32 Development Board
- GPS Module (for future implementation)
- Bluetooth module (built into ESP32)
- Power supply/battery pack
- Connecting wires and breadboard 