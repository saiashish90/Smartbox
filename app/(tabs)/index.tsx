import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BluetoothScanner from '../../components/BluetoothScanner';
import TrackMap from '../../components/TrackMap';
import { useBluetoothConnection } from '../../hooks/useBluetoothConnection';
import { useGPSTracking } from '../../hooks/useGPSTracking';
import { phoneScreenStyles } from '../../styles/phoneScreenStyles';

export default function PhoneScreen() {
  const {
    connectedDevice,
    isConnecting,
    gpsData,
    connectToDevice,
    disconnectFromDevice,
  } = useBluetoothConnection();

  const {
    isTracking,
    trackPoints,
    startTracking,
    stopTracking,
    addTrackPoint,
    getTrackingDuration,
    formatDuration,
  } = useGPSTracking();

  const [isStartingTracking, setIsStartingTracking] = useState(false);

  // Add GPS data to track when tracking is active
  useEffect(() => {
    if (gpsData && isTracking) {
      try {
        addTrackPoint(gpsData);
      } catch (error) {
        console.log('Error adding track point:', error);
      }
    }
  }, [gpsData, isTracking, addTrackPoint]);

  const handleStartTracking = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Please connect to a device first.');
      return;
    }

    try {
      setIsStartingTracking(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      startTracking();
    } catch (error) {
      Alert.alert('Error', 'Failed to start tracking. Please try again.');
    } finally {
      setIsStartingTracking(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      stopTracking();
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tracking. Please try again.');
    }
  };

  const renderTrackingControls = () => {
    if (!connectedDevice) return null;

    return (
      <View style={phoneScreenStyles.trackingControls}>
        <Text style={phoneScreenStyles.trackingTitle}>GPS Tracking</Text>
        
        {isTracking && (
          <View style={phoneScreenStyles.trackingInfo}>
            <Text style={phoneScreenStyles.trackingDuration}>
              Duration: {formatDuration(getTrackingDuration())}
            </Text>
            <Text style={phoneScreenStyles.trackingPoints}>
              Points: {trackPoints.length}
            </Text>
          </View>
        )}
        
        <View style={phoneScreenStyles.trackingButtons}>
          {!isTracking ? (
            <TouchableOpacity
              style={[
                phoneScreenStyles.trackingButton, 
                phoneScreenStyles.startButton,
                isStartingTracking && { opacity: 0.6 }
              ]}
              onPress={handleStartTracking}
              disabled={isStartingTracking}
            >
              <Text style={phoneScreenStyles.trackingButtonText}>
                {isStartingTracking ? 'Starting...' : 'Start Tracking'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[phoneScreenStyles.trackingButton, phoneScreenStyles.stopButton]}
              onPress={handleStopTracking}
            >
              <Text style={phoneScreenStyles.trackingButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTrackMap = () => {
    if (!connectedDevice || trackPoints.length === 0) {
      return null;
    }

    return (
      <View style={phoneScreenStyles.mapSection}>
        <TrackMap 
          trackPoints={trackPoints}
          currentLocation={gpsData ? { latitude: gpsData.latitude, longitude: gpsData.longitude } : undefined}
          isTracking={isTracking}
        />
      </View>
    );
  };

  return (
    <ScrollView 
      style={phoneScreenStyles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={true}
    >
      <BluetoothScanner
        connectedDevice={connectedDevice}
        isConnecting={isConnecting}
        gpsData={gpsData}
        connectToDevice={connectToDevice}
        disconnectFromDevice={disconnectFromDevice}
      />
      
      {renderTrackingControls()}
      {renderTrackMap()}
    </ScrollView>
  );
}
