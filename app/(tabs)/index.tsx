import React, { useEffect } from 'react';
import ConnectedState from '../../components/ConnectedState';
import DeviceList from '../../components/DeviceList';
import PermissionRequest from '../../components/PermissionRequest';
import { useBluetoothConnection } from '../../hooks/useBluetoothConnection';
import { useBluetoothDevices } from '../../hooks/useBluetoothDevices';
import { useBluetoothPermission } from '../../hooks/useBluetoothPermission';
import { useGPSTracking } from '../../hooks/useGPSTracking';

export default function IndexScreen() {
  // All hooks managed at the top level
  const { hasPermission, requestBluetoothPermissions } = useBluetoothPermission();
  const { devices, error, isScanning, refreshDevices } = useBluetoothDevices(hasPermission);
  const { connectedDevice, isConnecting, gpsData, connectToDevice, disconnectFromDevice } = useBluetoothConnection();
  const { 
    isTracking, 
    trackPoints, 
    startTracking, 
    stopTracking, 
    addTrackPoint, 
    getTrackingDuration, 
    formatDuration 
  } = useGPSTracking();

  // Add GPS data to tracking when available
  useEffect(() => {
    if (gpsData && isTracking) {
      addTrackPoint(gpsData);
    }
  }, [gpsData, isTracking, addTrackPoint]);

  // Render based on app state
  if (!hasPermission) {
    return <PermissionRequest requestBluetoothPermissions={requestBluetoothPermissions} />;
  }

  if (connectedDevice) {
    return (
      <ConnectedState
        connectedDevice={connectedDevice}
        gpsData={gpsData}
        isTracking={isTracking}
        trackPoints={trackPoints}
        disconnectFromDevice={disconnectFromDevice}
        startTracking={startTracking}
        stopTracking={stopTracking}
        getTrackingDuration={getTrackingDuration}
        formatDuration={formatDuration}
      />
    );
  }

  return (
    <DeviceList
      devices={devices}
      error={error}
      isScanning={isScanning}
      isConnecting={isConnecting}
      connectedDevice={connectedDevice}
      connectToDevice={connectToDevice}
      refreshDevices={refreshDevices}
    />
  );
}
