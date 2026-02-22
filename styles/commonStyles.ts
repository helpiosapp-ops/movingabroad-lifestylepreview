
import { StyleSheet } from 'react-native';

export const colors = {
  // Light mode colors
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
    primaryLight: '#E3F2FD',
    error: '#FF3B30',
    success: '#34C759',
    inputBackground: '#F5F5F7',
  },
  // Dark mode colors
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#3A3A3C',
    primary: '#0A84FF',
    primaryLight: '#1E3A5F',
    error: '#FF453A',
    success: '#32D74B',
    inputBackground: '#1C1C1E',
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
});
