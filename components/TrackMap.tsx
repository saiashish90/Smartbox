import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { TrackPoint } from '../hooks/useGPSTracking';

interface TrackMapProps {
  trackPoints: TrackPoint[];
  currentLocation?: { latitude: number; longitude: number };
  isTracking?: boolean;
}

export default function TrackMap({ 
  trackPoints, 
  currentLocation, 
  isTracking = false 
}: TrackMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useGoogleProvider, setUseGoogleProvider] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Auto-center map on current location when it updates
  useEffect(() => {
    if (currentLocation && mapRef.current && isTracking && mapLoaded) {
      try {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        // Silently handle animation errors
      }
    }
  }, [currentLocation, isTracking, mapLoaded]);

  const getMapRegion = () => {
    if (trackPoints.length === 0) {
      return {
        latitude: currentLocation?.latitude || 37.78825,
        longitude: currentLocation?.longitude || -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const latitudes = trackPoints.map(point => point.latitude);
    const longitudes = trackPoints.map(point => point.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max(maxLat - minLat, 0.01);
    const lngDelta = Math.max(maxLng - minLng, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta * 1.1,
      longitudeDelta: lngDelta * 1.1,
    };
  };

  const getPolylineCoordinates = () => {
    return trackPoints.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  };

  const handleMapError = (error: any) => {
    if (useGoogleProvider && Platform.OS === 'android') {
      setUseGoogleProvider(false);
      setMapError(null);
      return;
    }
    
    setMapError('Failed to load map. Please check your internet connection.');
  };

  const handleMapLoad = () => {
    setMapLoaded(true);
    setMapError(null);
  };

  const handleRetry = () => {
    setMapError(null);
    setMapLoaded(false);
    setUseGoogleProvider(false);
  };

  if (mapError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>GPS Track</Text>
        <Text style={styles.subtitle}>
          {trackPoints.length} track points recorded
        </Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{mapError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPS Track</Text>
      <Text style={styles.subtitle}>
        {trackPoints.length} track points recorded
      </Text>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={useGoogleProvider ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          initialRegion={getMapRegion()}
          onError={handleMapError}
          onLoad={handleMapLoad}
          loadingEnabled={true}
          loadingIndicatorColor="#666666"
          loadingBackgroundColor="#ffffff"
        >
          {/* Current location marker */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Current Location"
              description="Your current position"
              pinColor="#007AFF"
            />
          )}

          {/* Track path polyline */}
          {trackPoints.length > 1 && (
            <Polyline
              coordinates={getPolylineCoordinates()}
              strokeColor="#007AFF"
              strokeWidth={3}
              lineDashPattern={[1]}
            />
          )}
          
          {/* Show start marker */}
          {trackPoints.length > 0 && (
            <Marker
              coordinate={{
                latitude: trackPoints[0].latitude,
                longitude: trackPoints[0].longitude,
              }}
              title="Start"
              description="Track start point"
              pinColor="green"
            />
          )}
          
          {/* Show end marker */}
          {trackPoints.length > 1 && (
            <Marker
              coordinate={{
                latitude: trackPoints[trackPoints.length - 1].latitude,
                longitude: trackPoints[trackPoints.length - 1].longitude,
              }}
              title="End"
              description="Track end point"
              pinColor="red"
            />
          )}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  mapContainer: {
    height: 300,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 