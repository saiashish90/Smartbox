import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useBluetoothDevices } from '../../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../../hooks/useBluetoothPermission';

export default function PhoneScreen() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, isScanning, error, startScan } = useBluetoothDevices(hasPermission);

  const handleRetry = () => {
    startScan();
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
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceName}>
              {item.name || 'Unknown Device'}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
            {item.rssi && (
              <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
            )}
          </View>
        )}
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});
