import { useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

interface GPSData {
  type: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  satellites: number;
  accuracy: number;
  date: string;
  time: string;
  timestamp: number;
}

export const useBluetoothConnection = () => {
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gpsData, setGpsData] = useState<GPSData | null>(null);
  const [bleManager] = useState(() => new BleManager());

  const connectToDevice = async (device: any) => {
    try {
      setIsConnecting(true);
      
      // Connect to the device
      const connectedDevice = await bleManager.connectToDevice(device.id, {
        requestMTU: 512,
        timeout: 10000,
      });
      
      // Discover services
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      // Find the RaceChrono service and GPS main characteristic
      const services = await connectedDevice.services();
      const targetService = services.find(service => 
        service.uuid.toLowerCase() === '00001ff8-0000-1000-8000-00805f9b34fb'
      );
      
      if (!targetService) {
        throw new Error('RaceChrono service not found');
      }
      
      const characteristics = await targetService.characteristics();
      const targetCharacteristic = characteristics.find(char => 
        char.uuid.toLowerCase() === '00000003-0000-1000-8000-00805f9b34fb'
      );
      
      if (!targetCharacteristic) {
        throw new Error('Target characteristic not found');
      }
      
      // Subscribe to notifications
      await targetCharacteristic.monitor((error, characteristic) => {
        if (error) {
          return;
        }
        
        if (characteristic && characteristic.value) {
          const data = characteristic.value;
          
          try {
            // Parse RaceChrono GPS binary data
            // The characteristic.value is a base64-encoded string, so decode it first
            // Use React Native compatible base64 decoding
            const decoded = atob(data);
            const buffer = new Uint8Array(decoded.length);
            for (let i = 0; i < decoded.length; i++) {
              buffer[i] = decoded.charCodeAt(i);
            }

            if (buffer.length >= 20) {
              // Extract time data (first 3 bytes)
              const timeSinceHourStart = (buffer[0] & 0x1F) << 16 | buffer[1] << 8 | buffer[2];
              const minutes = Math.floor(timeSinceHourStart / 30000);
              const seconds = Math.floor((timeSinceHourStart % 30000) / 500);
              const centiseconds = Math.floor((timeSinceHourStart % 500) / 5);
              
              // Extract satellite info (byte 3)
              const satellites = buffer[3] & 0x3F;
              const fixQuality = (buffer[3] >> 6) & 0x3;
              
              // Extract latitude and longitude (bytes 4-11)
              const latitude = (buffer[4] << 24 | buffer[5] << 16 | buffer[6] << 8 | buffer[7]) / 10000000;
              const longitude = (buffer[8] << 24 | buffer[9] << 16 | buffer[10] << 8 | buffer[11]) / 10000000;
              
              // Extract altitude (bytes 12-13)
              let altitude = (buffer[12] << 8 | buffer[13]);
              if (altitude & 0x8000) {
                altitude = (altitude & 0x7FFF) - 500;
              } else {
                altitude = (altitude / 10) - 500;
              }
              
              // Extract speed (bytes 14-15)
              let speed = (buffer[14] << 8 | buffer[15]);
              if (speed & 0x8000) {
                speed = (speed & 0x7FFF) / 10;
              } else {
                speed = speed / 100;
              }
              
              // Extract bearing (bytes 16-17)
              const bearing = (buffer[16] << 8 | buffer[17]) / 100;
              
              // Extract HDOP (byte 18)
              const hdop = buffer[18] / 10;
              
              // Create GPS data object
              const gpsData: GPSData = {
                type: 'gps_data',
                latitude,
                longitude,
                altitude,
                speed,
                course: bearing,
                satellites,
                accuracy: hdop,
                date: new Date().toISOString().split('T')[0], // Current date
                time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`,
                timestamp: Date.now(),
              };
              
              setGpsData(gpsData);
            }
          } catch (parseError) {
            // Silent fail for parsing errors
          }
        }
      });
      
      setConnectedDevice(connectedDevice);
      
    } catch (error) {
      // Handle connection errors silently
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setGpsData(null); // Clear GPS data when disconnecting
      } catch (error) {
        // Handle disconnect errors silently
      }
    }
  };

  return {
    connectedDevice,
    isConnecting,
    gpsData,
    connectToDevice,
    disconnectFromDevice,
  };
}; 