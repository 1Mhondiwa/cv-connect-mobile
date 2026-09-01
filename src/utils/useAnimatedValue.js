import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Creates a stable Animated.Value that is safe to read during render.
 *
 * `useRef(new Animated.Value(x)).current` reads the ref during render, which
 * violates react-hooks/refs. This hook returns the value itself (not the ref
 * container), which is idiomatic for animation values because they are
 * mutable objects meant to be passed directly to Animated APIs and styles.
 */
export function useAnimatedValue(initialValue) {
  const valueRef = useRef(null);
  if (valueRef.current === null) {
    valueRef.current = new Animated.Value(initialValue);
  }
  return valueRef.current;
}
