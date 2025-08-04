import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { phoneScreenStyles } from '../styles/phoneScreenStyles';
import TrackMap from './TrackMap';

interface GPSData {
  type: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  satellites: number;
  accuracy: number;
  date: string;
  time: string;
  timestamp: number;
}

interface TrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  satellites: number;
  accuracy: number;
  date: string;
  time: string;
  timestamp: number;
}

interface ConnectedStateProps {
  connectedDevice: any;
  gpsData: GPSData | null;
  isTracking: boolean;
  trackPoints: TrackPoint[];
  disconnectFromDevice: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  getTrackingDuration: () => number;
  formatDuration: (duration: number) => string;
}

export default function ConnectedState({
  connectedDevice,
  gpsData,
  isTracking,
  trackPoints,
  disconnectFromDevice,
  startTracking,
  stopTracking,
  getTrackingDuration,
  formatDuration,
}: ConnectedStateProps) {
  
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
          <Text style={phoneScreenStyles.gpsLabel}>Accuracy:</Text>
          <Text style={phoneScreenStyles.gpsValue}>
            {gpsData.accuracy ? `${gpsData.accuracy.toFixed(1)} m` : 'N/A'}
          </Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Date:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.date}</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Time:</Text>
          <Text style={phoneScreenStyles.gpsValue}>{gpsData.time}</Text>
        </View>
        
        <View style={phoneScreenStyles.gpsDataRow}>
          <Text style={phoneScreenStyles.gpsLabel}>Last Update:</Text>
          <Text style={phoneScreenStyles.gpsValue}>
            {new Date(gpsData.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderTrackingControls = () => {
    return (
      <View style={phoneScreenStyles.trackingControls}>
        <Text style={phoneScreenStyles.trackingTitle}>GPS Tracking</Text>
        
        {isTracking && (
          <Text style={phoneScreenStyles.trackingDuration}>
            Duration: {formatDuration(getTrackingDuration())}
          </Text>
        )}
        
        <View style={phoneScreenStyles.trackingButtons}>
          {!isTracking ? (
            <TouchableOpacity 
              style={phoneScreenStyles.startTrackingButton}
              onPress={startTracking}
            >
              <Text style={phoneScreenStyles.startTrackingButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={phoneScreenStyles.stopTrackingButton}
              onPress={stopTracking}
            >
              <Text style={phoneScreenStyles.stopTrackingButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={phoneScreenStyles.container}>
      {/* Connected Device Pill - Floating */}
      <TouchableOpacity 
        style={phoneScreenStyles.connectedDevicePill}
        onPress={disconnectFromDevice}
      >
        <Text style={phoneScreenStyles.pillDeviceName}>
          {connectedDevice?.name || 'SmartBox'}
        </Text>
      </TouchableOpacity>
      
      {/* GPS Information Card */}
      {renderGPSInfo()}
      
      {/* Tracking Controls */}
      {renderTrackingControls()}
      
      {/* Track Map */}
      <TrackMap 
        trackPoints={trackPoints}
        currentLocation={gpsData ? { latitude: gpsData.latitude, longitude: gpsData.longitude } : undefined}
        isTracking={isTracking}
      />
    </View>
  );
} 