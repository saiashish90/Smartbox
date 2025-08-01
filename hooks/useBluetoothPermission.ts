import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export const useBluetoothPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setHasPermission(granted);
    }
  };

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      // Check current permission first
      const currentPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (currentPermission) {
        setHasPermission(true);
        return;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Permission request timeout')), 5000);
      });
      
      try {
        const granted = await Promise.race([
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ),
          timeoutPromise
        ]);
        
        // Set permission based on the result directly
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        // If it times out, try to check current permission again
        try {
          const newPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          setHasPermission(newPermission);
        } catch (checkError) {
          // Handle check error if needed
        }
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