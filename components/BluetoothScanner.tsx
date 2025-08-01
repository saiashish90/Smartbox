import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { useBluetoothDevices } from '../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../hooks/useBluetoothPermission';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';

export default function BluetoothScanner() {
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, error, isScanning, refreshDevices } = useBluetoothDevices(hasPermission);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bleManager] = useState(() => new BleManager());

  const connectToDevice = async (device: any) => {
    try {
      setIsConnecting(true);
      console.log('Attempting to connect to device:', device.id);
      
      // Connect to the device
      const connectedDevice = await bleManager.connectToDevice(device.id, {
        requestMTU: 512,
        timeout: 10000,
      });
      
      console.log('Connected to device:', connectedDevice.id);
      
      // Discover services
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Services discovered');
      
      // Find the specific service and characteristic
      const services = await connectedDevice.services();
      const targetService = services.find(service => 
        service.uuid.toLowerCase() === '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
      );
      
      if (!targetService) {
        throw new Error('Target service not found');
      }
      
      const characteristics = await targetService.characteristics();
      const targetCharacteristic = characteristics.find(char => 
        char.uuid.toLowerCase() === 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
      );
      
      if (!targetCharacteristic) {
        throw new Error('Target characteristic not found');
      }
      
      // Subscribe to notifications
      await targetCharacteristic.monitor((error, characteristic) => {
        if (error) {
          console.log('Notification error:', error);
          return;
        }
        
        if (characteristic && characteristic.value) {
          const data = characteristic.value;
          const decodedData = atob(data);
          console.log('Received data:', decodedData);
          Alert.alert('Data Received', decodedData);
        }
      });
      
      setConnectedDevice(connectedDevice);
      Alert.alert('Success', 'Connected to SmartBox! You should now receive time data.');
      
    } catch (error) {
      console.log('Connection error:', error);
      Alert.alert('Connection Failed', 'Could not connect to device. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        Alert.alert('Disconnected', 'Disconnected from SmartBox');
      } catch (error) {
        console.log('Disconnect error:', error);
      }
    }
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