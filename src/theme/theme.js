import { DefaultTheme } from 'react-native-paper';
import { 
  fontSize, 
  spacing, 
  borderRadius, 
  iconSize, 
  buttonSize, 
  cardDimensions, 
  inputDimensions,
  headerDimensions,
  navigationDimensions,
  responsive,
  platform,
  safeArea
} from '../utils/responsive';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary colors - Brown and Orange
    primary: '#8B4513', // Saddle Brown
    primaryDark: '#654321', // Dark Brown
    secondary: '#FF8C00', // Dark Orange
    accent: '#FFA500', // Orange
    
    // Background colors
    background: '#FFFFFF', // White
    surface: '#F8F8F8', // Light Gray
    card: '#FFFFFF', // White
    
    // Text colors
    text: '#1A1A1A', // Almost Black
    textSecondary: '#4A4A4A', // Dark Gray
    textLight: '#8B8B8B', // Medium Gray
    
    // Status colors
    error: '#D32F2F', // Red
    warning: '#FF8C00', // Orange
    success: '#388E3C', // Green
    info: '#1976D2', // Blue
    
    // Border and divider colors
    border: '#E0E0E0', // Light Gray
    borderLight: '#F0F0F0', // Very Light Gray
    divider: '#BDBDBD', // Medium Gray
    
    // Custom colors
    brown: {
      light: '#D2B48C', // Tan
      medium: '#8B4513', // Saddle Brown
      dark: '#654321', // Dark Brown
    },
    orange: {
      light: '#FFB74D', // Light Orange
      medium: '#FF8C00', // Dark Orange
      dark: '#E65100', // Very Dark Orange
    },
    black: {
      pure: '#000000', // Pure Black
      soft: '#1A1A1A', // Soft Black
      charcoal: '#2C2C2C', // Charcoal
    },
    white: {
      pure: '#FFFFFF', // Pure White
      off: '#F8F8F8', // Off White
      cream: '#F5F5DC', // Cream
    },
    
    // Gradients
    gradientStart: '#8B4513', // Brown
    gradientEnd: '#FF8C00', // Orange
    
    // Overlays and shadows
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
  },
  // Responsive spacing using the responsive utilities
  spacing,
  borderRadius,
  iconSize,
  buttonSize,
  cardDimensions,
  inputDimensions,
  headerDimensions,
  navigationDimensions,
  
  // Responsive utilities
  responsive,
  platform,
  safeArea,
  
  // Responsive font sizes
  fontSize,
  
  // Responsive shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: responsive.ifTablet(2, 1),
      },
      shadowOpacity: 0.1,
      shadowRadius: responsive.ifTablet(4, 2),
      elevation: responsive.ifTablet(3, 2),
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: responsive.ifTablet(3, 2),
      },
      shadowOpacity: 0.15,
      shadowRadius: responsive.ifTablet(6, 4),
      elevation: responsive.ifTablet(5, 4),
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: responsive.ifTablet(5, 4),
      },
      shadowOpacity: 0.2,
      shadowRadius: responsive.ifTablet(10, 8),
      elevation: responsive.ifTablet(8, 8),
    },
  },
}; 