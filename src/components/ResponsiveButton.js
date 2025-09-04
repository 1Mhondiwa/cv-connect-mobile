import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { responsive, fontSize, spacing, borderRadius, buttonSize } from '../utils/responsive';

const ResponsiveButton = ({
  children,
  onPress,
  style,
  textStyle,
  size = 'medium', // small, medium, large
  variant = 'primary', // primary, secondary, outline, ghost
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.round,
    flexDirection: 'row',
  },
  // Size variants
  small: {
    ...buttonSize.small,
    borderRadius: borderRadius.round,
  },
  medium: {
    ...buttonSize.medium,
    borderRadius: borderRadius.round,
  },
  large: {
    ...buttonSize.large,
    borderRadius: borderRadius.round,
  },
  // Variant styles
  primary: {
    backgroundColor: '#FF6B35',
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: '#8B4513',
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  // Text styles for sizes
  smallText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  mediumText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  largeText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  // Text styles for variants
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#FF6B35',
  },
  ghostText: {
    color: '#FF6B35',
  },
  // Utility styles
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default ResponsiveButton;

