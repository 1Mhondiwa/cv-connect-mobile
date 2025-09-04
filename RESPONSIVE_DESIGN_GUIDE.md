# Responsive Design Guide for CV-Connect Mobile App

## Overview

This guide explains how to use the comprehensive responsive design system implemented in the CV-Connect mobile application. The system automatically adapts to different device sizes, orientations, and screen densities.

## 🚀 Quick Start

### 1. Import Responsive Utilities

```javascript
import { 
  scale, 
  verticalScale, 
  fontSize, 
  spacing, 
  borderRadius, 
  responsive,
  isTablet,
  isSmallDevice,
  isLargeDevice
} from '../utils/responsive';
```

### 2. Use Responsive Components

```javascript
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveCard from '../components/ResponsiveCard';
import ResponsiveButton from '../components/ResponsiveButton';
import ResponsiveInput from '../components/ResponsiveInput';
import ResponsiveText from '../components/ResponsiveText';
import ResponsiveGrid from '../components/ResponsiveGrid';
```

### 3. Use Responsive Hook

```javascript
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const MyComponent = () => {
  const { deviceType, layout, breakpoints } = useResponsiveLayout();
  
  // Use responsive utilities
  const gridColumns = layout.getGridColumns(2);
  const margin = layout.getMargin('lg');
  
  return (
    // Your component JSX
  );
};
```

## 📱 Device Detection

### Device Type Functions

```javascript
import { 
  isTablet, 
  isSmallDevice, 
  isMediumDevice, 
  isLargeDevice, 
  isExtraLargeDevice 
} from '../utils/responsive';

// Check device type
if (isTablet()) {
  // Tablet-specific logic
}

if (isSmallDevice()) {
  // Small device logic (iPhone SE, etc.)
}
```

### Breakpoint Detection

```javascript
const { breakpoints } = useResponsiveLayout();

if (breakpoints.isMobile) {
  // Mobile layout
} else if (breakpoints.isTablet) {
  // Tablet layout
} else if (breakpoints.isDesktop) {
  // Desktop layout
}
```

## 🎨 Responsive Styling

### Font Sizes

```javascript
// Predefined responsive font sizes
const textStyle = {
  fontSize: fontSize.md,        // 14px base, scales automatically
  fontSize: fontSize.lg,        // 16px base, scales automatically
  fontSize: fontSize.xl,        // 18px base, scales automatically
  fontSize: fontSize.xxl,       // 20px base, scales automatically
  fontSize: fontSize.xxxl,      // 24px base, scales automatically
  fontSize: fontSize.display,   // 32px base, scales automatically
};
```

### Spacing

```javascript
// Responsive spacing values
const containerStyle = {
  padding: spacing.md,          // 16px base, scales automatically
  margin: spacing.lg,           // 24px base, scales automatically
  gap: spacing.xl,              // 32px base, scales automatically
};
```

### Border Radius

```javascript
// Responsive border radius
const cardStyle = {
  borderRadius: borderRadius.md, // 12px base, scales automatically
  borderRadius: borderRadius.lg, // 16px base, scales automatically
  borderRadius: borderRadius.xl, // 20px base, scales automatically
};
```

## 🔧 Responsive Utilities

### Conditional Styling

```javascript
import { responsive } from '../utils/responsive';

const style = {
  // Different values for tablet vs mobile
  padding: responsive.ifTablet(24, 16),
  
  // Different values for different screen sizes
  fontSize: responsive.ifSmallDevice(12, 14),
  fontSize: responsive.ifLargeDevice(18, 14),
  
  // Responsive arrays
  columns: responsive.array(1, 2, 3), // mobile, tablet, desktop
  
  // Responsive objects
  dimensions: responsive.object(
    { width: '100%' },           // mobile
    { width: '50%' },            // tablet
    { width: '33%' }             // desktop
  ),
};
```

### Scaling Functions

```javascript
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const style = {
  // Scale based on screen width
  width: scale(100),           // Scales from 100px base
  
  // Scale based on screen height
  height: verticalScale(200),  // Scales from 200px base
  
  // Moderate scaling (less aggressive)
  padding: moderateScale(16, 0.5), // Scales with 0.5 factor
};
```

## 🧩 Responsive Components

### ResponsiveContainer

```javascript
import ResponsiveContainer from '../components/ResponsiveContainer';

// Basic container
<ResponsiveContainer>
  <Text>Content</Text>
</ResponsiveContainer>

// Scrollable container
<ResponsiveContainer scrollable>
  <Text>Scrollable content</Text>
</ResponsiveContainer>

// Keyboard avoiding container
<ResponsiveContainer keyboardAvoiding>
  <TextInput placeholder="Type here" />
</ResponsiveContainer>

// Custom styling
<ResponsiveContainer 
  style={{ backgroundColor: '#f0f0f0' }}
  padding={false}
  safeArea={false}
>
  <Text>Custom styled content</Text>
</ResponsiveContainer>
```

### ResponsiveCard

```javascript
import ResponsiveCard from '../components/ResponsiveCard';

// Different sizes
<ResponsiveCard size="small">
  <Text>Small card content</Text>
</ResponsiveCard>

<ResponsiveCard size="medium">
  <Text>Medium card content</Text>
</ResponsiveCard>

<ResponsiveCard size="large">
  <Text>Large card content</Text>
</ResponsiveCard>

// Custom styling
<ResponsiveCard 
  style={{ backgroundColor: '#e3f2fd' }}
  shadow="large"
  padding={false}
>
  <Text>Custom card</Text>
</ResponsiveCard>
```

### ResponsiveButton

```javascript
import ResponsiveButton from '../components/ResponsiveButton';

// Different sizes and variants
<ResponsiveButton size="small" variant="primary">
  Small Primary
</ResponsiveButton>

<ResponsiveButton size="medium" variant="outline">
  Medium Outline
</ResponsiveButton>

<ResponsiveButton size="large" variant="secondary">
  Large Secondary
</ResponsiveButton>

<ResponsiveButton size="medium" variant="ghost">
  Ghost Button
</ResponsiveButton>

// Full width button
<ResponsiveButton fullWidth>
  Full Width Button
</ResponsiveButton>

// Disabled button
<ResponsiveButton disabled>
  Disabled Button
</ResponsiveButton>
```

### ResponsiveInput

```javascript
import ResponsiveInput from '../components/ResponsiveInput';

// Different sizes
<ResponsiveInput 
  size="small"
  label="Small Input"
  placeholder="Enter text"
  value={text}
  onChangeText={setText}
/>

<ResponsiveInput 
  size="medium"
  label="Medium Input"
  placeholder="Enter text"
  value={text}
  onChangeText={setText}
/>

<ResponsiveInput 
  size="large"
  label="Large Input"
  placeholder="Enter text"
  value={text}
  onChangeText={setText}
/>

// With error handling
<ResponsiveInput 
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  keyboardType="email-address"
/>

// Multiline input
<ResponsiveInput 
  label="Description"
  placeholder="Enter description"
  value={description}
  onChangeText={setDescription}
  multiline
  numberOfLines={4}
/>
```

### ResponsiveText

```javascript
import ResponsiveText from '../components/ResponsiveText';

// Different sizes
<ResponsiveText size="xs">Extra Small Text</ResponsiveText>
<ResponsiveText size="sm">Small Text</ResponsiveText>
<ResponsiveText size="md">Medium Text</ResponsiveText>
<ResponsiveText size="lg">Large Text</ResponsiveText>
<ResponsiveText size="xl">Extra Large Text</ResponsiveText>
<ResponsiveText size="xxl">Extra Extra Large Text</ResponsiveText>
<ResponsiveText size="xxxl">Extra Extra Extra Large Text</ResponsiveText>
<ResponsiveText size="display">Display Text</ResponsiveText>

// Different weights
<ResponsiveText weight="light">Light Text</ResponsiveText>
<ResponsiveText weight="regular">Regular Text</ResponsiveText>
<ResponsiveText weight="medium">Medium Text</ResponsiveText>
<ResponsiveText weight="bold">Bold Text</ResponsiveText>

// Different colors and alignment
<ResponsiveText color="#FF6B35" align="center">
  Orange Centered Text
</ResponsiveText>

// With line limits
<ResponsiveText numberOfLines={2} ellipsizeMode="tail">
  Long text that will be truncated after two lines...
</ResponsiveText>
```

### ResponsiveGrid

```javascript
import ResponsiveGrid from '../components/ResponsiveGrid';

// Basic grid
<ResponsiveGrid columns={2}>
  <View style={styles.item}>Item 1</View>
  <View style={styles.item}>Item 2</View>
  <View style={styles.item}>Item 3</View>
  <View style={styles.item}>Item 4</View>
</ResponsiveGrid>

// Custom gap and alignment
<ResponsiveGrid 
  columns={3} 
  gap={24} 
  alignItems="center"
  justifyContent="space-between"
>
  <View style={styles.item}>Item 1</View>
  <View style={styles.item}>Item 2</View>
  <View style={styles.item}>Item 3</View>
</ResponsiveGrid>
```

## 🎯 Best Practices

### 1. Use Responsive Components When Possible

```javascript
// ✅ Good - Uses responsive components
<ResponsiveContainer scrollable>
  <ResponsiveGrid columns={2}>
    <ResponsiveCard size="medium">
      <ResponsiveText size="lg" weight="bold">Title</ResponsiveText>
      <ResponsiveText size="md">Description</ResponsiveText>
    </ResponsiveCard>
  </ResponsiveGrid>
</ResponsiveContainer>

// ❌ Avoid - Hard-coded values
<View style={{ padding: 16, margin: 16 }}>
  <Text style={{ fontSize: 16 }}>Title</Text>
</View>
```

### 2. Use Responsive Utilities for Custom Styling

```javascript
// ✅ Good - Uses responsive utilities
const styles = StyleSheet.create({
  container: {
    padding: responsive.ifTablet(spacing.xl, spacing.lg),
    margin: responsive.ifTablet(spacing.xxl, spacing.lg),
  },
  title: {
    fontSize: responsive.ifTablet(fontSize.xxl, fontSize.xl),
    marginBottom: responsive.ifTablet(spacing.lg, spacing.md),
  },
});

// ❌ Avoid - Hard-coded values
const styles = StyleSheet.create({
  container: {
    padding: 24,
    margin: 32,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
});
```

### 3. Use the Responsive Hook for Complex Logic

```javascript
// ✅ Good - Uses responsive hook
const MyComponent = () => {
  const { deviceType, layout, breakpoints } = useResponsiveLayout();
  
  const gridColumns = layout.getGridColumns(2);
  const cardPadding = layout.getPadding('lg');
  
  return (
    <ResponsiveGrid columns={gridColumns}>
      <ResponsiveCard size="medium" style={{ padding: cardPadding }}>
        Content
      </ResponsiveCard>
    </ResponsiveGrid>
  );
};

// ❌ Avoid - Complex inline responsive logic
const MyComponent = () => {
  return (
    <View style={{ 
      flexDirection: isTablet() ? 'row' : 'column',
      padding: isTablet() ? 24 : 16 
    }}>
      Content
    </View>
  );
};
```

### 4. Test on Different Devices

- Test on small phones (iPhone SE)
- Test on medium phones (iPhone 12/13/14)
- Test on large phones (iPhone 12/13/14 Pro Max)
- Test on tablets (iPad)
- Test in different orientations

## 🔍 Debugging

### Enable Responsive Logging

```javascript
import { responsive } from '../utils/responsive';

// Log device type
console.log('Is Tablet:', responsive.isTablet());
console.log('Is Small Device:', responsive.isSmallDevice());

// Log responsive values
console.log('Font Size MD:', fontSize.md);
console.log('Spacing LG:', spacing.lg);
console.log('Border Radius MD:', borderRadius.md);
```

### Use the Responsive Hook for Debugging

```javascript
const { deviceType, breakpoints, dimensions } = useResponsiveLayout();

useEffect(() => {
  console.log('Device Type:', deviceType);
  console.log('Breakpoints:', breakpoints);
  console.log('Dimensions:', dimensions);
}, [deviceType, breakpoints, dimensions]);
```

## 📚 Examples

### Complete Responsive Screen Example

```javascript
import React from 'react';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveCard from '../components/ResponsiveCard';
import ResponsiveButton from '../components/ResponsiveButton';
import ResponsiveText from '../components/ResponsiveText';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ExampleScreen = () => {
  const { deviceType, layout } = useResponsiveLayout();
  
  return (
    <ResponsiveContainer scrollable>
      {/* Header */}
      <ResponsiveCard size="large" style={{ marginBottom: 24 }}>
        <ResponsiveText size="display" weight="bold" align="center">
          Welcome to CV-Connect
        </ResponsiveText>
        <ResponsiveText size="lg" align="center" color="#666">
          Your professional networking platform
        </ResponsiveText>
      </ResponsiveCard>
      
      {/* Action Buttons */}
      <ResponsiveGrid columns={deviceType.isTablet ? 3 : 2} gap={16}>
        <ResponsiveButton size="large" variant="primary">
          Get Started
        </ResponsiveButton>
        <ResponsiveButton size="large" variant="outline">
          Learn More
        </ResponsiveButton>
        {deviceType.isTablet && (
          <ResponsiveButton size="large" variant="secondary">
            Contact Us
          </ResponsiveButton>
        )}
      </ResponsiveGrid>
      
      {/* Content Cards */}
      <ResponsiveGrid columns={deviceType.isTablet ? 2 : 1} gap={20}>
        <ResponsiveCard size="medium">
          <ResponsiveText size="xl" weight="bold">Feature 1</ResponsiveText>
          <ResponsiveText size="md" color="#666">
            Description of feature 1
          </ResponsiveText>
        </ResponsiveCard>
        
        <ResponsiveCard size="medium">
          <ResponsiveText size="xl" weight="bold">Feature 2</ResponsiveText>
          <ResponsiveText size="md" color="#666">
            Description of feature 2
          </ResponsiveText>
        </ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default ExampleScreen;
```

## 🎨 Customization

### Extending the Theme

```javascript
// In theme/theme.js
import { fontSize, spacing, borderRadius } from '../utils/responsive';

export const theme = {
  // ... existing theme
  customSizes: {
    heroHeight: responsive.ifTablet(400, 300),
    cardWidth: responsive.ifTablet('50%', '100%'),
    buttonHeight: responsive.ifTablet(56, 48),
  },
};
```

### Creating Custom Responsive Components

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { responsive, spacing, borderRadius } from '../utils/responsive';

const CustomResponsiveComponent = ({ children, style, ...props }) => {
  const componentStyle = [
    styles.base,
    {
      padding: responsive.ifTablet(spacing.xl, spacing.lg),
      borderRadius: responsive.ifTablet(borderRadius.xl, borderRadius.lg),
    },
    style,
  ];
  
  return (
    <View style={componentStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomResponsiveComponent;
```

## 🚀 Performance Tips

1. **Memoize Responsive Values**: Use `useMemo` for expensive responsive calculations
2. **Avoid Inline Styles**: Use StyleSheet.create for better performance
3. **Batch Updates**: Update multiple responsive values together when possible
4. **Use Responsive Components**: They're optimized for performance

## 📱 Testing Checklist

- [ ] Small phone (iPhone SE) - 375x667
- [ ] Medium phone (iPhone 12) - 390x844
- [ ] Large phone (iPhone 12 Pro Max) - 428x926
- [ ] Small tablet (iPad Mini) - 768x1024
- [ ] Large tablet (iPad Pro) - 1024x1366
- [ ] Landscape orientation
- [ ] Portrait orientation
- [ ] Different font sizes (Accessibility settings)
- [ ] Dark mode (if applicable)

This responsive design system ensures your CV-Connect mobile app looks great and functions perfectly on all devices! 🎉

