import React from 'react';
import { View, StyleSheet } from 'react-native';
import { responsive, spacing, isTablet, isSmallDevice } from '../utils/responsive';

const ResponsiveGrid = ({
  children,
  columns = 2,
  gap = spacing.md,
  style,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  ...props
}) => {
  // Determine optimal columns based on device type
  const getOptimalColumns = () => {
    if (isTablet()) {
      return Math.min(columns * 1.5, 4); // More columns on tablet
    }
    if (isSmallDevice()) {
      return 1; // Single column on small devices
    }
    return columns;
  };

  const optimalColumns = getOptimalColumns();
  const gridGap = responsive.ifTablet(gap * 1.2, gap);

  const gridStyle = [
    styles.grid,
    {
      gap: gridGap,
      alignItems,
      justifyContent,
    },
    style,
  ];

  // Clone children and add responsive styles
  const responsiveChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        style: [
          child.props.style,
          {
            flex: optimalColumns === 1 ? 1 : `0 0 calc(${100 / optimalColumns}% - ${gridGap / optimalColumns}px)`,
            marginBottom: gridGap,
          },
        ],
      });
    }
    return child;
  });

  return (
    <View style={gridStyle} {...props}>
      {responsiveChildren}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ResponsiveGrid;

