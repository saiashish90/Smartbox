# Smartbox - GPS Tracking App

A React Native/Expo application for GPS tracking with Bluetooth connectivity and real-time map visualization.

## Features

### 🗺️ Enhanced GPS Tracking Map
- **Real-time tracking**: Auto-centers map on current location during active tracking
- **Track visualization**: Displays complete track path with polyline
- **Multiple markers**: Shows start point (green), end point (red), and current location (blue)
- **Google Maps integration**: Uses Google Maps provider for enhanced map features
- **Map controls**: Includes compass, scale, and "My Location" button
- **No API key required**: Works without Google Maps API key for basic functionality

### 📱 Bluetooth Connectivity
- Scan and connect to Bluetooth devices
- Real-time GPS data reception
- Device status monitoring

### 🎯 GPS Tracking Features
- Start/stop tracking functionality
- Track point recording with timestamp
- Duration tracking with formatted display
- Track clearing capability
- Real-time GPS data display

## Technical Stack

- **React Native** with **Expo**
- **react-native-maps** for map functionality
- **react-native-ble-plx** for Bluetooth connectivity
- **expo-location** for location services
- **TypeScript** for type safety

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. **Connect to Device**: Use the Bluetooth scanner to find and connect to your GPS device
2. **Start Tracking**: Once connected, press "Start Tracking" to begin recording GPS data
3. **View Map**: The map will automatically show your track and current location
4. **Stop Tracking**: Press "Stop Tracking" to end the recording session
5. **Clear Track**: Use "Clear Track" to reset the recorded data

## Map Features

The enhanced TrackMap component includes:

- **Auto-centering**: Map automatically follows your current location during active tracking
- **Track visualization**: Complete path shown with blue polyline
- **Smart markers**: 
  - Green marker: Track start point
  - Red marker: Track end point  
  - Blue marker: Current location
- **Google Maps features**: Compass, scale, and location button
- **Responsive design**: Adapts to different screen sizes

## Permissions

The app requires the following permissions:
- Bluetooth connectivity
- Location access (fine and coarse)
- Location services

## Development

The project uses:
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Custom hooks** for GPS tracking and Bluetooth management
- **Modular components** for maintainability

## File Structure

```
Smartbox/
├── app/                    # Expo Router app directory
├── components/            # React components
│   ├── BluetoothScanner.tsx
│   └── TrackMap.tsx      # Enhanced GPS tracking map
├── hooks/                # Custom React hooks
│   ├── useBluetoothConnection.ts
│   ├── useBluetoothDevices.ts
│   ├── useBluetoothPermission.ts
│   └── useGPSTracking.ts
├── styles/               # Style definitions
└── hardware/            # ESP32 hardware code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
