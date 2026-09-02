import { useState } from 'react';
import { Animated } from 'react-native';

/**
 * Creates a stable Animated.Value that is safe to read during render.
 *
 * `useRef(new Animated.Value(x)).current` reads the ref during render, which
 * violates react-hooks/refs. This hook returns the value itself (not the ref
 * container), which is idiomatic for animation values because they are
 * mutable objects meant to be passed directly to Animated APIs and styles.
 *
 * Implemented with useState's lazy initializer, which runs exactly once and
 * keeps the same instance across renders.
 */
export function useAnimatedValue(initialValue) {
  const [value] = useState(() => new Animated.Value(initialValue));
  return value;
}
