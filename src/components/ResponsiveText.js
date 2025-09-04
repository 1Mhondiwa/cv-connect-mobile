import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { responsive, fontSize, isTablet, isSmallDevice } from '../utils/responsive';

const ResponsiveText = ({
  children,
  style,
  size = 'md', // xs, sm, md, lg, xl, xxl, xxxl, display, displayLarge
  weight = 'regular', // light, regular, medium, bold
  color = '#333',
  align = 'left',
  numberOfLines,
  ellipsizeMode = 'tail',
  ...props
}) => {
  const getResponsiveFontSize = () => {
    const baseSize = fontSize[size] || fontSize.md;
    
    // Adjust font size based on device type
    if (isTablet()) {
      return baseSize * 1.1; // Slightly larger on tablets
    }
    if (isSmallDevice()) {
      return baseSize * 0.9; // Slightly smaller on small devices
    }
    return baseSize;
  };

  const textStyle = [
    styles.text,
    {
      fontSize: getResponsiveFontSize(),
      fontWeight: weight,
      color,
      textAlign: align,
    },
    style,
  ];

  return (
    <Text
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
  },
});

export default ResponsiveText;

