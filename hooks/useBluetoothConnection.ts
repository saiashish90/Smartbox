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
      console.log('Attempting to connect to device:', device.id);
      
      // Connect to the device
      const connectedDevice = await bleManager.connectToDevice(device.id, {
        requestMTU: 512,
        timeout: 10000,
      });
      
      console.log('Connected to device:', connectedDevice.id);
      
      // Discover services
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Services discovered');
      
      // Find the specific service and characteristic
      const services = await connectedDevice.services();
      const targetService = services.find(service => 
        service.uuid.toLowerCase() === '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
      );
      
      if (!targetService) {
        throw new Error('Target service not found');
      }
      
      const characteristics = await targetService.characteristics();
      const targetCharacteristic = characteristics.find(char => 
        char.uuid.toLowerCase() === 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
      );
      
      if (!targetCharacteristic) {
        throw new Error('Target characteristic not found');
      }
      
      // Subscribe to notifications
      await targetCharacteristic.monitor((error, characteristic) => {
        if (error) {
          console.log('Notification error:', error);
          return;
        }
        
        if (characteristic && characteristic.value) {
          const data = characteristic.value;
          const decodedData = atob(data);
          
          try {
            // Parse the GPS data
            const parsedData = JSON.parse(decodedData);
            if (parsedData.type === 'gps_data') {
              setGpsData(parsedData);
            }
          } catch (parseError) {
            console.log('Failed to parse GPS data:', parseError);
          }
        }
      });
      
      setConnectedDevice(connectedDevice);
      
    } catch (error) {
      console.log('Connection error:', error);
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
        console.log('Disconnected from SmartBox');
      } catch (error) {
        console.log('Disconnect error:', error);
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