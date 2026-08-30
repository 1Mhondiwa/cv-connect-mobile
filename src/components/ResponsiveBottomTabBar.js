import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  responsive, 
  spacing, 
  fontSize, 
  iconSize, 
  isTablet,
  isSmallDevice 
} from '../utils/responsive';

// Responsive bottom tab bar configuration — pure function (no hooks, safe for non-component usage)
// Pass `insets` from `useSafeAreaInsets()` when called inside a component.
export const getResponsiveTabBarConfig = (insets = { bottom: 0 }) => {
  const getTabBarHeight = () => {
    if (isTablet()) {
      return Platform.OS === 'ios' ? 90 : 80;
    }
    if (isSmallDevice()) {
      return Platform.OS === 'ios' ? 85 : 75;
    }
    return Platform.OS === 'ios' ? 90 : 80;
  };

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

  const getIconSize = () => {
    if (isTablet()) {
      return iconSize.lg;
    }
    if (isSmallDevice()) {
      return iconSize.sm;
    }
    return iconSize.md;
  };

  const getLabelFontSize = () => {
    if (isTablet()) {
      return fontSize.sm;
    }
    if (isSmallDevice()) {
      return fontSize.xs;
    }
    return fontSize.sm;
  };

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

// Hook version — use inside components to get insets-aware config
export const useResponsiveTabBarConfig = () => {
  const insets = useSafeAreaInsets();
  return getResponsiveTabBarConfig(insets);
};

// Responsive tab bar style generator — pure version
export const getResponsiveTabBarStyle = (insets) => {
  const config = getResponsiveTabBarConfig(insets);
  return {
    backgroundColor: '#FFFFFF',
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
    borderTopLeftRadius: responsive.ifTablet(20, 16),
    borderTopRightRadius: responsive.ifTablet(20, 16),
    borderBottomLeftRadius: responsive.ifTablet(20, 16),
    borderBottomRightRadius: responsive.ifTablet(20, 16),
    borderTopWidth: 0,
    borderWidth: responsive.ifTablet(2, 1),
    borderColor: '#E0E0E0',
    ...config.padding,
  };
};

export const useResponsiveTabBarStyle = () => {
  const config = useResponsiveTabBarConfig();
  return {
    backgroundColor: '#FFFFFF',
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
    borderTopLeftRadius: responsive.ifTablet(20, 16),
    borderTopRightRadius: responsive.ifTablet(20, 16),
    borderBottomLeftRadius: responsive.ifTablet(20, 16),
    borderBottomRightRadius: responsive.ifTablet(20, 16),
    borderTopWidth: 0,
    borderWidth: responsive.ifTablet(2, 1),
    borderColor: '#E0E0E0',
    ...config.padding,
  };
};

// Responsive tab bar label style generator — pure + hook
export const getResponsiveTabBarLabelStyle = (insets) => {
  const config = getResponsiveTabBarConfig(insets);
  return {
    fontSize: config.labelFontSize,
    fontWeight: responsive.ifTablet('600', '500'),
    marginTop: config.labelMargin,
    color: '#8B4513',
  };
};

export const useResponsiveTabBarLabelStyle = () => {
  const config = useResponsiveTabBarConfig();
  return {
    fontSize: config.labelFontSize,
    fontWeight: responsive.ifTablet('600', '500'),
    marginTop: config.labelMargin,
    color: '#8B4513',
  };
};

// Responsive tab bar icon style generator — pure + hook
export const getResponsiveTabBarIconStyle = (insets) => {
  const config = getResponsiveTabBarConfig(insets);
  return {
    width: config.iconSize,
    height: config.iconSize,
    marginBottom: responsive.ifTablet(4, 2),
  };
};

export const useResponsiveTabBarIconStyle = () => {
  const config = useResponsiveTabBarConfig();
  return {
    width: config.iconSize,
    height: config.iconSize,
    marginBottom: responsive.ifTablet(4, 2),
  };
};

// Responsive tab bar container for additional customization
export const ResponsiveTabBarContainer = ({ children, style, ...props }) => {
  const config = useResponsiveTabBarConfig();
  const containerStyle = [
    {
      minHeight: config.height,
      backgroundColor: '#FFFFFF',
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
  useResponsiveTabBarConfig,
  getResponsiveTabBarStyle,
  useResponsiveTabBarStyle,
  getResponsiveTabBarLabelStyle,
  useResponsiveTabBarLabelStyle,
  getResponsiveTabBarIconStyle,
  useResponsiveTabBarIconStyle,
  ResponsiveTabBarContainer,
  ResponsiveTabBarItem,
};
