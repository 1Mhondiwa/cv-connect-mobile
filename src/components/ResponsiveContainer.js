import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { responsive, isTablet } from '../utils/responsive';

const ResponsiveContainer = ({
  children,
  style,
  scrollable = false,
  keyboardAvoiding = false,
  safeArea = true,
  padding = true,
  backgroundColor = '#f5f5f5',
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    {
      flex: 1,
      backgroundColor,
      paddingHorizontal: padding ? responsive.ifTablet(24, 16) : 0,
      paddingTop: safeArea ? insets.top : 0,
      paddingBottom: safeArea ? insets.bottom : 0,
    },
    style,
  ];

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        {...props}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={{
          paddingBottom: responsive.ifTablet(32, 24),
        }}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

export default ResponsiveContainer;

