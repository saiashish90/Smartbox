import { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

export const useBluetoothDevices = (hasPermission: boolean) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bleManager] = useState(() => new BleManager());

  const startScan = async () => {
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

      setIsScanning(true);
      setDevices([]);
      setError(null);

      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          setError(`Scan error: ${error.message}`);
          setIsScanning(false);
          return;
        }

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
              // Add new device
              return [...prevDevices, {
                id: device.id,
                name: device.name,
                rssi: device.rssi
              }];
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
  }, [bleManager]);

  return {
    devices,
    isScanning,
    error,
    startScan,
    stopScan,
  };
}; 