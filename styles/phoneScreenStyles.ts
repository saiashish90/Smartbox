import { StyleSheet } from 'react-native';

export const phoneScreenStyles = StyleSheet.create({
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  devicesContainer: {
    marginBottom: 20,
  },
  devicesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
}); 