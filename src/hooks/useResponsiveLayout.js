import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { 
  isTablet, 
  isSmallDevice, 
  isMediumDevice, 
  isLargeDevice, 
  isExtraLargeDevice,
  responsive,
  spacing,
  fontSize,
  borderRadius
} from '../utils/responsive';

export const useResponsiveLayout = () => {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  // Device type detection
  const deviceType = {
    isTablet: isTablet(),
    isSmallDevice: isSmallDevice(),
    isMediumDevice: isMediumDevice(),
    isLargeDevice: isLargeDevice(),
    isExtraLargeDevice: isExtraLargeDevice(),
  };

  // Responsive breakpoints
  const breakpoints = {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
  };

  // Responsive spacing multipliers
  const spacingMultiplier = responsive.ifTablet(1.2, 1);
  const fontSizeMultiplier = responsive.ifTablet(1.1, 1);

  // Responsive layout helpers
  const layout = {
    // Grid columns based on screen size
    getGridColumns: (baseColumns = 2) => {
      if (deviceType.isTablet) return Math.min(baseColumns * 1.5, 4);
      if (deviceType.isSmallDevice) return 1;
      return baseColumns;
    },

    // Responsive margins
    getMargin: (size = 'md') => {
      const baseMargin = spacing[size] || spacing.md;
      return baseMargin * spacingMultiplier;
    },

    // Responsive padding
    getPadding: (size = 'md') => {
      const basePadding = spacing[size] || spacing.md;
      return basePadding * spacingMultiplier;
    },

    // Responsive font sizes
    getFontSize: (size = 'md') => {
      const baseFontSize = fontSize[size] || fontSize.md;
      return baseFontSize * fontSizeMultiplier;
    },

    // Responsive border radius
    getBorderRadius: (size = 'md') => {
      return borderRadius[size] || borderRadius.md;
    },

    // Responsive card dimensions
    getCardDimensions: (size = 'medium') => {
      const dimensions = {
        small: { padding: spacing.sm, margin: spacing.xs },
        medium: { padding: spacing.md, margin: spacing.sm },
        large: { padding: spacing.lg, margin: spacing.md },
      };
      return dimensions[size] || dimensions.medium;
    },

    // Responsive button dimensions
    getButtonDimensions: (size = 'medium') => {
      const dimensions = {
        small: { height: 36, paddingHorizontal: 16, paddingVertical: 8 },
        medium: { height: 44, paddingHorizontal: 20, paddingVertical: 12 },
        large: { height: 52, paddingHorizontal: 24, paddingVertical: 16 },
      };
      return dimensions[size] || dimensions.medium;
    },
  };

  // Orientation detection
  const orientation = {
    isPortrait: dimensions.height > dimensions.width,
    isLandscape: dimensions.width > dimensions.height,
  };

  // Safe area helpers
  const safeArea = {
    top: deviceType.isTablet ? 44 : 24,
    bottom: deviceType.isTablet ? 34 : 0,
    left: 0,
    right: 0,
  };

  return {
    dimensions,
    deviceType,
    breakpoints,
    layout,
    orientation,
    safeArea,
    responsive,
    spacing,
    fontSize,
    borderRadius,
  };
};

