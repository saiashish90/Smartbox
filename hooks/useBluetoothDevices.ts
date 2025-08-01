import { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

const TARGET_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

export const useBluetoothDevices = (hasPermission: boolean) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bleManager] = useState(() => new BleManager());

  const startScan = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setDevices([]);

      const state = await bleManager.state();
      if (state !== 'PoweredOn') {
        setError('Bluetooth is not enabled. Please enable Bluetooth and try again.');
        return;
      }

      // Start scanning for devices with the specific service UUID
      bleManager.startDeviceScan([TARGET_SERVICE_UUID], null, (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          setError('Failed to scan for devices');
          return;
        }

        if (device) {
          // Additional check to ensure the device has the target service
          const hasTargetService = device.serviceUUIDs?.includes(TARGET_SERVICE_UUID);
          
          if (hasTargetService) {
            setDevices(prev => {
              // Avoid duplicates
              const exists = prev.find(d => d.id === device.id);
              if (exists) return prev;
              
              return [...prev, {
                id: device.id,
                name: device.name,
                rssi: device.rssi
              }];
            });
          }
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 10000);

    } catch (error) {
      console.log('Error starting scan:', error);
      setError('Failed to start scanning');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (hasPermission) {
      startScan();
    } else {
      setError('Bluetooth permissions not granted');
    }
  }, [hasPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        bleManager.stopDeviceScan();
        bleManager.destroy();
      } catch (error) {
        console.log('Error destroying BLE manager:', error);
      }
    };
  }, [bleManager]);

  return {
    devices,
    error,
    isScanning,
    refreshDevices: startScan,
  };
}; 