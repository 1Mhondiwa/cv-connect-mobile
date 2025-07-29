import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#ffffff',
  heading: '#462918',
  accent: '#fd680e',
};

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 2.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 1200); // Show splash for 1.2s, then animate out for 0.7s
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity, transform: [{ scale }] }]}> 
      <Text style={styles.splashText}>
        <Text style={styles.splashAccent}>CV</Text>
        <Text style={styles.splashConnect}> CONNECT</Text>
      </Text>
    </Animated.View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);

  useEffect(() => {
    if (!showSplash) {
      AsyncStorage.getItem('jwt_token').then(token => {
        setIsAuthenticated(!!token);
      });
    }
  }, [showSplash]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isAuthenticated === null) {
    // Still checking auth
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="register" options={{ title: 'Register' }} />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  splashText: {
    fontSize: 44,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(70,41,24,0.12)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: 0,
  },
  splashAccent: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    letterSpacing: 4,
    fontSize: 44,
  },
  splashConnect: {
    color: COLORS.heading,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    letterSpacing: 4,
    fontSize: 44,
  },
});
