import { StyleSheet } from 'react-native';

export const phoneStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grantedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f44336',
    marginBottom: 30,
    lineHeight: 24,
  },
}); 