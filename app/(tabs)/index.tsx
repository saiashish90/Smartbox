import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothDevices } from '../../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../../hooks/useBluetoothPermission';

export default function PhoneScreen() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, isScanning, error, startScan, handleDevicePress } = useBluetoothDevices(hasPermission);

  const handleRetry = () => {
    startScan();
  };

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
          styles.deviceItem,
          item.isConnected && styles.connectedDevice,
          item.isConnecting && styles.connectingDevice
        ]}
        onPress={() => handleDevicePress(item.id)}
        disabled={item.isConnecting}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {item.name || 'Unknown Device'}
          </Text>
          <Text style={styles.deviceId}>{item.id}</Text>
          {item.rssi && (
            <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
          )}
        </View>
        <View style={styles.deviceStatus}>
          {item.isConnecting && (
            <ActivityIndicator size="small" color="#FFA500" style={styles.loadingIndicator} />
          )}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bluetooth Permissions Required</Text>
        <Text style={styles.description}>
          This app needs Bluetooth permissions to scan for nearby devices.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestBluetoothPermissions}>
          <Text style={styles.buttonText}>Grant Bluetooth Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bluetooth Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isScanning ? 'Scanning for devices...' : 'Nearby Bluetooth Devices'}
      </Text>
      <Text style={styles.subtitle}>
        Tap on a device to connect or disconnect
      </Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isScanning ? 'Searching for devices...' : 'No devices found'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#ff4444',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectedDevice: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  connectingDevice: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deviceStatus: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});
