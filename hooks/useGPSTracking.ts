import { useCallback, useState } from 'react';

export interface TrackPoint {
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

export interface GPSData {
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

export const useGPSTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
  const [trackingStartTime, setTrackingStartTime] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    try {
      setIsTracking(true);
      setTrackingStartTime(Date.now());
      setTrackPoints([]);
    } catch (error) {
      throw error;
    }
  }, []);

  const stopTracking = useCallback(() => {
    try {
      setIsTracking(false);
      setTrackingStartTime(null);
    } catch (error) {
      throw error;
    }
  }, []);

  const addTrackPoint = useCallback((gpsData: GPSData) => {
    if (!isTracking) return;

    try {
      // Validate GPS data
      if (!gpsData || typeof gpsData.latitude !== 'number' || typeof gpsData.longitude !== 'number') {
        return;
      }

      // Validate coordinates are within reasonable bounds
      if (gpsData.latitude < -90 || gpsData.latitude > 90 || 
          gpsData.longitude < -180 || gpsData.longitude > 180) {
        return;
      }

      const trackPoint: TrackPoint = {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        altitude: gpsData.altitude || 0,
        speed: gpsData.speed || 0,
        course: gpsData.course || 0,
        satellites: gpsData.satellites || 0,
        date: gpsData.date || new Date().toISOString().split('T')[0],
        time: gpsData.time || new Date().toISOString().split('T')[1].split('.')[0],
        timestamp: gpsData.timestamp || Date.now(),
      };

      setTrackPoints(prev => [...prev, trackPoint]);
    } catch (error) {
      // Silently handle errors to prevent crashes
    }
  }, [isTracking]);

  const getTrackingDuration = useCallback(() => {
    if (!trackingStartTime) return 0;
    return Date.now() - trackingStartTime;
  }, [trackingStartTime]);

  const formatDuration = useCallback((duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }, []);

  return {
    isTracking,
    trackPoints,
    trackingStartTime,
    startTracking,
    stopTracking,
    addTrackPoint,
    getTrackingDuration,
    formatDuration,
  };
}; 