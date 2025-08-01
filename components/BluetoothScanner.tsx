import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothDevices } from '../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../hooks/useBluetoothPermission';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

interface GPSData {
  type: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  satellites: number;
  date: string;
  time: string;
  timestamp: number;
}

interface BluetoothScannerProps {
  connectedDevice: any;
  isConnecting: boolean;
  gpsData: GPSData | null;
  connectToDevice: (device: any) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
}

export default function BluetoothScanner({
  connectedDevice,
  isConnecting,
  gpsData,
  connectToDevice,
  disconnectFromDevice,
}: BluetoothScannerProps) {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, error, isScanning, refreshDevices } = useBluetoothDevices(hasPermission);

  const renderGPSInfo = () => {
    if (!gpsData) {
      return (
        <View style={phoneScreenStyles.gpsCard}>
          <Text style={phoneScreenStyles.gpsCardTitle}>GPS Information</Text>
          <Text style={phoneScreenStyles.gpsCardSubtitle}>Waiting for GPS data...</Text>
        </View>
      );
    }

    return (
      <View style={phoneScreenStyles.gpsCard}>
        <Text style={phoneScreenStyles.gpsCardTitle}>GPS Information</Text>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Location:</Text>
          <Text style={phoneScreenStyles.gpsValue}>
            {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Altitude:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.altitude.toFixed(1)} m</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Speed:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.speed.toFixed(1)} m/s</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Course:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.course.toFixed(1)}°</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Satellites:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.satellites}</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Date:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.date}</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Time:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.time}</Text>
        </View>
      </View>
    );
  };

  const renderDeviceItem = ({ item }: { item: any }) => {
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
          {isConnected && (
            <TouchableOpacity 
              style={phoneScreenStyles.disconnectButton}
              onPress={disconnectFromDevice}
            >
              <Text style={phoneScreenStyles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          )}
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

  // If connected to a device, show only that device as a pill at the top
  if (connectedDevice) {
    const connectedDeviceData = devices.find(device => device.id === connectedDevice.id);
    
    return (
      <View style={phoneScreenStyles.container}>
        {/* Connected Device Pill */}
        <TouchableOpacity 
          style={phoneScreenStyles.connectedDevicePill}
          onPress={disconnectFromDevice}
        >
          <Text style={phoneScreenStyles.pillDeviceName}>
            {connectedDeviceData?.name || 'SmartBox'}
          </Text>
        </TouchableOpacity>
        
        {/* GPS Information Card */}
        {renderGPSInfo()}
      </View>
    );
  }

  // Show device list when not connected
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
      
      {devices.length === 0 && (
        <Text style={phoneScreenStyles.emptyText}>
          No devices found. Make sure your ESP32 is powered on and advertising.
        </Text>
      )}
    </View>
  );
} 