import React from 'react';
import { View, StyleSheet } from 'react-native';
import { responsive, spacing, borderRadius, shadows } from '../utils/responsive';

const ResponsiveCard = ({
  children,
  style,
  size = 'medium', // small, medium, large
  padding = true,
  margin = true,
  shadow = 'medium',
  ...props
}) => {
  const shadowStyleMap = {
    small: styles.shadowSmall,
    medium: styles.shadowMedium,
    large: styles.shadowLarge,
  };

  const cardStyle = [
    styles.card,
    styles[size],
    padding && styles.padding,
    margin && styles.margin,
    shadow && shadowStyleMap[shadow],
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
  },
  small: {
    padding: spacing.md,
    margin: spacing.sm,
  },
  medium: {
    padding: spacing.lg,
    margin: spacing.md,
  },
  large: {
    padding: spacing.xl,
    margin: spacing.lg,
  },
  padding: {
    padding: responsive.ifTablet(spacing.lg, spacing.md),
  },
  margin: {
    margin: responsive.ifTablet(spacing.md, spacing.sm),
  },
  shadowSmall: shadows.small,
  shadowMedium: shadows.medium,
  shadowLarge: shadows.large,
});

export default ResponsiveCard;

