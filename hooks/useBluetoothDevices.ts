import { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

export const useBluetoothDevices = (hasPermission: boolean) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bleManager] = useState(() => new BleManager());
  const [allDiscoveredDevices, setAllDiscoveredDevices] = useState<BluetoothDevice[]>([]);

  // Target service UUID to filter devices
  const TARGET_SERVICE_UUID = "00001ff8-0000-1000-8000-00805f9b34fb";

  const startScan = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setDevices([]);
      setAllDiscoveredDevices([]);

      const state = await bleManager.state();
      if (state !== 'PoweredOn') {
        setError('Bluetooth is not enabled. Please enable Bluetooth and try again.');
        return;
      }

      // Start scanning for all devices, then filter by service UUID
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          setError('Failed to scan for devices');
          return;
        }

        if (device) {
          // Store all discovered devices for debugging
          setAllDiscoveredDevices(prev => {
            const exists = prev.find(d => d.id === device.id);
            if (exists) return prev;
            
            return [...prev, {
              id: device.id,
              name: device.name,
              rssi: device.rssi
            }];
          });

          // Check if device has the target service in its advertised services
          const hasTargetService = device.serviceUUIDs?.some(uuid => 
            uuid.toLowerCase() === TARGET_SERVICE_UUID.toLowerCase()
          );
          
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
        
        // If no filtered devices found, show all devices as fallback
        if (devices.length === 0 && allDiscoveredDevices.length > 0) {
          console.log('No devices with target service found. Showing all devices as fallback.');
          setDevices(allDiscoveredDevices);
        }
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