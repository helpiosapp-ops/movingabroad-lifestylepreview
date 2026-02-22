
import { StyleSheet } from 'react-native';

// Premium color palette inspired by high-end travel apps
export const colors = {
  // Light mode - Sophisticated neutrals with warm accents
  light: {
    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#9E9E9E',
    
    // Primary - Deep Teal (luxury travel aesthetic)
    primary: '#0A7B83',
    primaryLight: '#E8F5F6',
    primaryDark: '#065A60',
    
    // Accent - Warm Coral
    accent: '#FF6B6B',
    accentLight: '#FFE5E5',
    
    // Borders & Dividers
    border: '#E8E8E8',
    borderLight: '#F5F5F5',
    
    // Status
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
    
    // Gradients
    gradientStart: '#0A7B83',
    gradientEnd: '#0D9BA5',
    
    // Input
    inputBackground: '#F8F8F8',
    inputBorder: '#E0E0E0',
  },
  
  // Dark mode - Rich blacks with vibrant accents
  dark: {
    // Backgrounds
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceElevated: '#242424',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    
    // Primary - Bright Teal
    primary: '#14B8C4',
    primaryLight: '#1A2E30',
    primaryDark: '#0FA8B3',
    
    // Accent - Vibrant Coral
    accent: '#FF8787',
    accentLight: '#2A1F1F',
    
    // Borders & Dividers
    border: '#2A2A2A',
    borderLight: '#1F1F1F',
    
    // Status
    success: '#3DDC84',
    warning: '#FFB84D',
    error: '#FF6B6B',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.05)',
    
    // Gradients
    gradientStart: '#14B8C4',
    gradientEnd: '#17D4E1',
    
    // Input
    inputBackground: '#1F1F1F',
    inputBorder: '#2A2A2A',
  },
};

export const typography = {
  // Font sizes
  h1: 34,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Font weights
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  button: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body,
  },
});
