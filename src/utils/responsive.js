import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  } else {
    return adjustedWidth >= 1920 && adjustedHeight >= 1080;
  }
};

export const isSmallDevice = () => SCREEN_WIDTH < 375;
export const isMediumDevice = () => SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = () => SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768;
export const isExtraLargeDevice = () => SCREEN_WIDTH >= 768;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive scaling based on screen width
export const scale = (size) => {
  const newSize = size * (SCREEN_WIDTH / 375); // Base width is 375 (iPhone X)
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive scaling for height
export const verticalScale = (size) => {
  const newSize = size * (SCREEN_HEIGHT / 812); // Base height is 812 (iPhone X)
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive scaling for moderate changes
export const moderateScale = (size, factor = 0.5) => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive font sizes
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(18),
  xxl: scale(20),
  xxxl: scale(24),
  display: scale(32),
  displayLarge: scale(48),
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
};

// Responsive padding
export const padding = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
};

// Responsive margins
export const margin = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
};

// Responsive border radius
export const borderRadius = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  round: scale(50),
  pill: scale(100),
};

// Responsive icon sizes
export const iconSize = {
  xs: scale(16),
  sm: scale(20),
  md: scale(24),
  lg: scale(32),
  xl: scale(40),
  xxl: scale(48),
};

// Responsive button sizes
export const buttonSize = {
  small: {
    height: scale(36),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
  },
  medium: {
    height: scale(44),
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
  },
  large: {
    height: scale(52),
    paddingHorizontal: scale(24),
    paddingVertical: scale(16),
  },
};

// Responsive card dimensions
export const cardDimensions = {
  small: {
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: borderRadius.md,
  },
  medium: {
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
  },
  large: {
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
  },
};

// Responsive input dimensions
export const inputDimensions = {
  small: {
    height: scale(40),
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  medium: {
    height: scale(48),
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  large: {
    height: scale(56),
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.lg,
  },
};

// Responsive header dimensions
export const headerDimensions = {
  small: {
    height: scale(56),
    paddingHorizontal: spacing.md,
  },
  medium: {
    height: scale(64),
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: scale(72),
    paddingHorizontal: spacing.xl,
  },
};

// Responsive navigation dimensions
export const navigationDimensions = {
  tabBarHeight: Platform.OS === 'ios' ? scale(83) : scale(60),
  headerHeight: Platform.OS === 'ios' ? scale(44) : scale(56),
  statusBarHeight: Platform.OS === 'ios' ? scale(44) : scale(24),
};

// Responsive grid system
export const grid = {
  columns: isTablet() ? 12 : 6,
  gutter: spacing.md,
  margin: spacing.md,
};

// Responsive breakpoints
export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
};

// Responsive utilities
export const responsive = {
  // Conditional styling based on device type
  ifTablet: (tabletStyle, mobileStyle) => isTablet() ? tabletStyle : mobileStyle,
  ifSmallDevice: (smallStyle, defaultStyle) => isSmallDevice() ? smallStyle : defaultStyle,
  ifLargeDevice: (largeStyle, defaultStyle) => isLargeDevice() ? largeStyle : defaultStyle,
  
  // Responsive arrays for different screen sizes
  array: (mobile, tablet, desktop) => {
    if (isTablet()) return tablet;
    if (SCREEN_WIDTH >= breakpoints.desktop) return desktop;
    return mobile;
  },
  
  // Responsive objects for different screen sizes
  object: (mobile, tablet, desktop) => {
    if (isTablet()) return { ...mobile, ...tablet };
    if (SCREEN_WIDTH >= breakpoints.desktop) return { ...mobile, ...tablet, ...desktop };
    return mobile;
  },
};

// Platform-specific adjustments
export const platform = {
  ios: Platform.OS === 'ios',
  android: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

// Safe area utilities
export const safeArea = {
  top: Platform.OS === 'ios' ? 44 : 24,
  bottom: Platform.OS === 'ios' ? 34 : 0,
  left: 0,
  right: 0,
};

// Export all utilities
export default {
  // Device detection
  isTablet,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isExtraLargeDevice,
  
  // Dimensions
  screenWidth,
  screenHeight,
  
  // Scaling functions
  scale,
  verticalScale,
  moderateScale,
  
  // Responsive values
  fontSize,
  spacing,
  padding,
  margin,
  borderRadius,
  iconSize,
  buttonSize,
  cardDimensions,
  inputDimensions,
  headerDimensions,
  navigationDimensions,
  
  // Grid system
  grid,
  breakpoints,
  
  // Utilities
  responsive,
  platform,
  safeArea,
};

