import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothDevices } from '../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../hooks/useBluetoothPermission';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

export default function BluetoothScanner() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, error, isScanning, refreshDevices } = useBluetoothDevices(hasPermission);

  const renderDeviceItem = ({ item }: { item: any }) => {
    const getStatusText = () => {
      if (item.isPaired) return 'Paired';
      return 'Available';
    };

    const getStatusColor = () => {
      if (item.isPaired) return '#4CAF50'; // Green
      return '#666'; // Gray
    };

    return (
      <View 
        style={[
          phoneScreenStyles.deviceItem,
          item.isPaired && phoneScreenStyles.connectedDevice
        ]}
      >
        <View style={phoneScreenStyles.deviceInfo}>
          <Text style={phoneScreenStyles.deviceName}>
            {item.name || 'Unknown Device'}
          </Text>
          <Text style={phoneScreenStyles.deviceId}>{item.id}</Text>
          {item.rssi && (
            <Text style={phoneScreenStyles.deviceRssi}>Signal: {item.rssi} dBm</Text>
          )}
        </View>
        <View style={phoneScreenStyles.deviceStatus}>
          <Text style={[phoneScreenStyles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    );
  };

  if (!hasPermission) {
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

  if (error) {
    return (
      <View style={phoneScreenStyles.container}>
        <Text style={phoneScreenStyles.title}>Bluetooth Error</Text>
        <Text style={phoneScreenStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={phoneScreenStyles.container}>
      <Text style={phoneScreenStyles.title}>
        Bluetooth Devices
      </Text>
      <Text style={phoneScreenStyles.subtitle}>
        {devices.length > 0 ? `${devices.length} device(s) found` : 'No devices found'}
      </Text>
      
      {devices.length > 0 && (
        <View style={phoneScreenStyles.devicesContainer}>
          <Text style={phoneScreenStyles.devicesSectionTitle}>
            Available Devices
          </Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={renderDeviceItem}
            scrollEnabled={false}
          />
        </View>
      )}
      
      {devices.length === 0 && (
        <Text style={phoneScreenStyles.emptyText}>
          No devices found. Make sure your ESP32 is powered on and advertising.
        </Text>
      )}
    </View>
  );
} 