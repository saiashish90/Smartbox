import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

interface PermissionRequestProps {
  requestBluetoothPermissions: () => Promise<void>;
}

export default function PermissionRequest({ requestBluetoothPermissions }: PermissionRequestProps) {
  return (
    <View style={phoneScreenStyles.container}>
      <Text style={phoneScreenStyles.title}>Bluetooth Permissions Required</Text>
      <Text style={phoneScreenStyles.description}>
        This app needs Bluetooth permissions to check for paired devices.
      </Text>
      <TouchableOpacity style={phoneScreenStyles.button} onPress={requestBluetoothPermissions}>
        <Text style={phoneScreenStyles.buttonText}>Grant Bluetooth Permissions</Text>
      </TouchableOpacity>
    </View>
  );
} 