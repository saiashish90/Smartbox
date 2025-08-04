import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

interface DeviceListProps {
  devices: BluetoothDevice[];
  error: string | null;
  isScanning: boolean;
  isConnecting: boolean;
  connectedDevice: any;
  connectToDevice: (device: BluetoothDevice) => Promise<void>;
  refreshDevices: () => void;
}

export default function DeviceList({
  devices,
  error,
  isScanning,
  isConnecting,
  connectedDevice,
  connectToDevice,
  refreshDevices,
}: DeviceListProps) {
  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => {
    const isConnected = connectedDevice?.id === item.id;
    
    const getStatusText = () => {
      if (isConnected) return 'Connected';
      if (isConnecting && connectedDevice?.id === item.id) return 'Connecting...';
      return 'Available';
    };

    const getStatusColor = () => {
      if (isConnected) return '#4CAF50'; // Green
      if (isConnecting && connectedDevice?.id === item.id) return '#FF9800'; // Orange
      return '#666'; // Gray
    };

    return (
      <View 
        style={[
          phoneScreenStyles.deviceItem,
          isConnected && phoneScreenStyles.connectedDevice
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
          {!isConnected && !isConnecting && (
            <TouchableOpacity 
              style={phoneScreenStyles.connectButton}
              onPress={() => connectToDevice(item)}
              disabled={isConnecting}
            >
              <Text style={phoneScreenStyles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <View style={phoneScreenStyles.container}>
        <Text style={phoneScreenStyles.title}>Bluetooth Error</Text>
        <Text style={phoneScreenStyles.errorText}>{error}</Text>
        <TouchableOpacity style={phoneScreenStyles.button} onPress={refreshDevices}>
          <Text style={phoneScreenStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={phoneScreenStyles.container}>
      {devices.length > 0 && (
        <View style={phoneScreenStyles.devicesContainer}>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={renderDeviceItem}
            scrollEnabled={false}
          />
        </View>
      )}
      
      {devices.length === 0 && !isScanning && (
        <Text style={phoneScreenStyles.emptyText}>
          No devices found. Make sure your ESP32 is powered on and advertising.
        </Text>
      )}

      {isScanning && (
        <Text style={phoneScreenStyles.emptyText}>
          Scanning for devices...
        </Text>
      )}
    </View>
  );
} 