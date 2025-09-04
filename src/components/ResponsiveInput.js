import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { responsive, fontSize, spacing, borderRadius, inputDimensions } from '../utils/responsive';

const ResponsiveInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  labelStyle,
  size = 'medium', // small, medium, large
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const containerStyles = [
    styles.container,
    error && styles.errorContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const inputStyles = [
    styles.input,
    styles[size],
    multiline && styles.multiline,
    error && styles.errorInput,
    disabled && styles.disabledInput,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    styles[`${size}Label`],
    error && styles.errorLabel,
    labelStyle,
  ];

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <TextInput
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8B8B8B"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  smallLabel: {
    fontSize: fontSize.xs,
  },
  mediumLabel: {
    fontSize: fontSize.sm,
  },
  largeLabel: {
    fontSize: fontSize.md,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    color: '#333',
  },
  small: {
    ...inputDimensions.small,
  },
  medium: {
    ...inputDimensions.medium,
  },
  large: {
    ...inputDimensions.large,
  },
  multiline: {
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorContainer: {
    marginBottom: spacing.sm,
  },
  errorInput: {
    borderColor: '#D32F2F',
  },
  errorLabel: {
    color: '#D32F2F',
  },
  errorText: {
    fontSize: fontSize.xs,
    color: '#D32F2F',
    marginTop: spacing.xs,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#8B8B8B',
  },
});

export default ResponsiveInput;

