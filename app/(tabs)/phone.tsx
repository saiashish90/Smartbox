import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothPermission } from '../../hooks/useBluetoothPermission';

export default function PhoneScreen() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();

  if (hasPermission) {
    return (
      <View>
        <Text>hello</Text>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity onPress={requestBluetoothPermissions}>
        <Text>Grant Bluetooth Permissions</Text>
      </TouchableOpacity>
    </View>
  );
}
