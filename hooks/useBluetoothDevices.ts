import { useEffect, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnected?: boolean;
  isConnecting?: boolean;
}

// Define your service UUIDs here
const MANUFACTURER_SERVICE_UUIDS = [
  // Smartbox ESP32 custom service UUID
  '12345678-1234-1234-1234-123456789abc'
];

export const useBluetoothDevices = (hasPermission: boolean) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bleManager] = useState(() => new BleManager());
  const [scanTimeout, setScanTimeout] = useState<number | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // startScan is a function to start the scan for devices
  const startScan = async () => {

    // if the permission is not granted, set the error to 'Bluetooth permissions not granted' and return
    if (!hasPermission) {
      setError('Bluetooth permissions not granted');
      return;
    }

    try {
      // Check if Bluetooth is enabled
      const state = await bleManager.state();
      if (state !== 'PoweredOn') {
        setError('Bluetooth is not enabled. Please enable Bluetooth and try again.');
        return;
      }

      // set the isScanning to true and devices to an empty array and error to null
      setIsScanning(true);
      setDevices([]);
      setError(null);

      // Scan for all devices first, then filter by service UUIDs
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          setError(`Scan error: ${error.message}`);
          setIsScanning(false);
          return;
        }

        // if the device is found, check if it has our service UUID
        if (device) {
          setDevices(prevDevices => {
            // Check if device already exists
            const exists = prevDevices.find(d => d.id === device.id);
            if (exists) {
              // Update existing device
              return prevDevices.map(d => 
                d.id === device.id 
                  ? { ...d, name: device.name, rssi: device.rssi }
                  : d
              );
            } else {
              // Only check service UUID for new devices
              const hasOurService = device.serviceUUIDs?.some(uuid => 
                MANUFACTURER_SERVICE_UUIDS.includes(uuid)
              );
              
              // Only add devices that have our service UUID or have a name that matches our device
              if (hasOurService || device.name?.includes('Smartbox')) {
                return [...prevDevices, {
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi,
                  isConnected: false,
                  isConnecting: false
                }];
              } else {
                // Return unchanged list if device doesn't meet criteria
                return prevDevices;
              }
            }
          });
        }
      });

    } catch (error) {
      console.log('Error starting scan:', error);
      setError(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    try {
      bleManager.stopDeviceScan();
      setIsScanning(false);
      setError(null);
    } catch (error) {
      console.log('Error stopping scan:', error);
    }
  };

  // Function to connect to a device
  const connectToDevice = async (deviceId: string) => {
    try {
      // Update device status to connecting
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isConnecting: true }
            : device
        )
      );

      // Get the device
      const device = await bleManager.devices([deviceId]);
      if (device.length === 0) {
        throw new Error('Device not found');
      }

      const targetDevice = device[0];

      // Connect to the device
      const connectedDevice = await targetDevice.connect({
        requestMTU: 512,
        timeout: 10000,
      });

      // Discover services
      const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();

      setConnectedDevice(discoveredDevice);

      // Update device status to connected
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isConnected: true, isConnecting: false }
            : device
        )
      );

      console.log('Successfully connected to device:', discoveredDevice.name);
      return discoveredDevice;

    } catch (error) {
      console.log('Error connecting to device:', error);
      
      // Update device status to not connecting
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isConnecting: false }
            : device
        )
      );

      throw error;
    }
  };

  // Function to disconnect from a device
  const disconnectFromDevice = async (deviceId: string) => {
    try {
      if (connectedDevice && connectedDevice.id === deviceId) {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
      }

      // Update device status
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, isConnected: false, isConnecting: false }
            : device
        )
      );

      console.log('Successfully disconnected from device');
    } catch (error) {
      console.log('Error disconnecting from device:', error);
      throw error;
    }
  };

  // Function to handle device pairing (connect/disconnect)
  const handleDevicePress = async (deviceId: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      if (device.isConnected) {
        // If connected, disconnect
        await disconnectFromDevice(deviceId);
      } else {
        // If not connected, connect
        await connectToDevice(deviceId);
      }
    } catch (error) {
      console.log('Error handling device press:', error);
      setError(`Failed to ${devices.find(d => d.id === deviceId)?.isConnected ? 'disconnect from' : 'connect to'} device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (hasPermission) {
      startScan();
    }

    return () => {
      stopScan();
    };
  }, [hasPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        bleManager.destroy();
      } catch (error) {
        console.log('Error destroying BLE manager:', error);
      }
    };
  }, [bleManager, scanTimeout]);

  return {
    devices,
    isScanning,
    error,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    handleDevicePress,
    connectedDevice,
  };
}; 