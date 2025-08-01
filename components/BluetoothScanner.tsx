import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothDevices } from '../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../hooks/useBluetoothPermission';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

export default function BluetoothScanner() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, isScanning, error, startScan, handleDevicePress, connectedDevice } = useBluetoothDevices(hasPermission);

  const handleRetry = () => {
    startScan();
  };

  // Check if any device is connected
  const connectedDeviceInfo = devices.find(device => device.isConnected);

  const renderDeviceItem = ({ item }: { item: any }) => {
    const getStatusText = () => {
      if (item.isConnecting) return 'Connecting...';
      if (item.isConnected) return 'Connected';
      return 'Tap to connect';
    };

    const getStatusColor = () => {
      if (item.isConnecting) return '#FFA500'; // Orange
      if (item.isConnected) return '#4CAF50'; // Green
      return '#666'; // Gray
    };

    return (
      <TouchableOpacity 
        style={[
          phoneScreenStyles.deviceItem,
          item.isConnected && phoneScreenStyles.connectedDevice,
          item.isConnecting && phoneScreenStyles.connectingDevice
        ]}
        onPress={() => handleDevicePress(item.id)}
        disabled={item.isConnecting}
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
          {item.isConnecting && (
            <ActivityIndicator size="small" color="#FFA500" style={phoneScreenStyles.loadingIndicator} />
          )}
          <Text style={[phoneScreenStyles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // If a device is connected, show only the pill
  if (connectedDeviceInfo) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          style={phoneScreenStyles.connectedPill}
          onPress={() => handleDevicePress(connectedDeviceInfo.id)}
        >
          <Text style={phoneScreenStyles.pillText}>
            {connectedDeviceInfo.name || 'Connected Device'}
          </Text>
          <Text style={phoneScreenStyles.pillDisconnectText}>
            Tap to disconnect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={phoneScreenStyles.container}>
        <Text style={phoneScreenStyles.title}>Bluetooth Permissions Required</Text>
        <Text style={phoneScreenStyles.description}>
          This app needs Bluetooth permissions to scan for nearby devices.
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
        <TouchableOpacity style={phoneScreenStyles.button} onPress={handleRetry}>
          <Text style={phoneScreenStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={phoneScreenStyles.container}>
      <Text style={phoneScreenStyles.title}>
        {isScanning ? 'Scanning for devices...' : 'Nearby Bluetooth Devices'}
      </Text>
      <Text style={phoneScreenStyles.subtitle}>
        Tap on a device to connect or disconnect
      </Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        ListEmptyComponent={
          <Text style={phoneScreenStyles.emptyText}>
            {isScanning ? 'Searching for devices...' : 'No devices found'}
          </Text>
        }
      />
    </View>
  );
} 