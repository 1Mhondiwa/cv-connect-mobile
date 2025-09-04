import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  responsive, 
  spacing, 
  fontSize, 
  iconSize, 
  navigationDimensions,
  isTablet,
  isSmallDevice 
} from '../utils/responsive';

// Responsive bottom tab bar configuration
export const getResponsiveTabBarConfig = () => {
  const insets = useSafeAreaInsets();
  
  // Responsive height based on device type
  const getTabBarHeight = () => {
    if (isTablet()) {
      return Platform.OS === 'ios' ? 90 : 80;
    }
    if (isSmallDevice()) {
      return Platform.OS === 'ios' ? 85 : 75;
    }
    return Platform.OS === 'ios' ? 90 : 80;
  };

  // Responsive padding based on device type
  const getTabBarPadding = () => {
    if (isTablet()) {
      return {
        paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16,
        paddingTop: 12,
        paddingHorizontal: 16,
      };
    }
    if (isSmallDevice()) {
      return {
        paddingBottom: Platform.OS === 'ios' ? insets.bottom + 4 : 12,
        paddingTop: 8,
        paddingHorizontal: 12,
      };
    }
    return {
      paddingBottom: Platform.OS === 'ios' ? insets.bottom + 6 : 14,
      paddingTop: 10,
      paddingHorizontal: 14,
    };
  };

  // Responsive icon size based on device type
  const getIconSize = () => {
    if (isTablet()) {
      return iconSize.lg; // 32px on tablets
    }
    if (isSmallDevice()) {
      return iconSize.sm; // 20px on small devices
    }
    return iconSize.md; // 24px on standard devices
  };

  // Responsive label font size based on device type
  const getLabelFontSize = () => {
    if (isTablet()) {
      return fontSize.sm; // 12px on tablets
    }
    if (isSmallDevice()) {
      return fontSize.xs; // 10px on small devices
    }
    return fontSize.sm; // 12px on standard devices
  };

  // Responsive label margin based on device type
  const getLabelMargin = () => {
    if (isTablet()) {
      return 4;
    }
    if (isSmallDevice()) {
      return 1;
    }
    return 2;
  };

  return {
    height: getTabBarHeight(),
    padding: getTabBarPadding(),
    iconSize: getIconSize(),
    labelFontSize: getLabelFontSize(),
    labelMargin: getLabelMargin(),
  };
};

// Responsive tab bar style generator
export const getResponsiveTabBarStyle = () => {
  const config = getResponsiveTabBarConfig();
  
  return {
    backgroundColor: '#FFFFFF',
    borderTopWidth: responsive.ifTablet(2, 1),
    borderTopColor: '#E0E0E0',
    height: config.height,
    elevation: responsive.ifTablet(12, 8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsive.ifTablet(-3, -2),
    },
    shadowOpacity: responsive.ifTablet(0.15, 0.1),
    shadowRadius: responsive.ifTablet(6, 4),
    // Rounded corners on all sides
    borderTopLeftRadius: responsive.ifTablet(20, 16),
    borderTopRightRadius: responsive.ifTablet(20, 16),
    borderBottomLeftRadius: responsive.ifTablet(20, 16),
    borderBottomRightRadius: responsive.ifTablet(20, 16),
    // Remove default border top since we're using rounded corners
    borderTopWidth: 0,
    // Add a subtle border around all sides for better definition
    borderWidth: responsive.ifTablet(2, 1),
    borderColor: '#E0E0E0',
    ...config.padding,
  };
};

// Responsive tab bar label style generator
export const getResponsiveTabBarLabelStyle = () => {
  const config = getResponsiveTabBarConfig();
  
  return {
    fontSize: config.labelFontSize,
    fontWeight: responsive.ifTablet('600', '500'),
    marginTop: config.labelMargin,
    color: '#8B4513', // Default inactive color
  };
};

// Responsive tab bar icon style generator
export const getResponsiveTabBarIconStyle = () => {
  const config = getResponsiveTabBarConfig();
  
  return {
    width: config.iconSize,
    height: config.iconSize,
    marginBottom: responsive.ifTablet(4, 2),
  };
};

// Responsive tab bar container for additional customization
export const ResponsiveTabBarContainer = ({ children, style, ...props }) => {
  const config = getResponsiveTabBarConfig();
  
  const containerStyle = [
    {
      minHeight: config.height,
      backgroundColor: '#FFFFFF',
      // Rounded corners for custom tab bar containers
      borderRadius: responsive.ifTablet(20, 16),
      borderWidth: responsive.ifTablet(2, 1),
      borderColor: '#E0E0E0',
    },
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

// Responsive tab bar item for individual tab customization
export const ResponsiveTabBarItem = ({ children, style, ...props }) => {
  const config = getResponsiveTabBarConfig();
  
  const itemStyle = [
    {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: responsive.ifTablet(spacing.sm, spacing.xs),
    },
    style,
  ];

  return (
    <View style={itemStyle} {...props}>
      {children}
    </View>
  );
};

// Export all utilities for use in navigation files
export default {
  getResponsiveTabBarConfig,
  getResponsiveTabBarStyle,
  getResponsiveTabBarLabelStyle,
  getResponsiveTabBarIconStyle,
  ResponsiveTabBarContainer,
  ResponsiveTabBarItem,
};
