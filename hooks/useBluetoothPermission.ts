import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useBluetoothPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check location permission (required for Bluetooth scanning)
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        // Check Bluetooth permissions for Android 12+ (API 31+)
        let bluetoothScanGranted = true;
        let bluetoothConnectGranted = true;

        if (Platform.Version >= 31) {
          bluetoothScanGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
          );
          bluetoothConnectGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );
        }

        const allPermissionsGranted = locationGranted && bluetoothScanGranted && bluetoothConnectGranted;
        setHasPermission(allPermissionsGranted);
      } catch (error) {
        setHasPermission(false);
      }
    }
  };

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissionsToRequest = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ];

        // Add Bluetooth permissions for Android 12+ (API 31+)
        if (Platform.Version >= 31) {
          permissionsToRequest.push(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );
        }

        const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
        
        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        setHasPermission(allGranted);
      } catch (error) {
        await checkPermission();
      }
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    hasPermission,
    requestBluetoothPermissions,
  };
}; 