import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#ffffff',
  default: '#444444',
  heading: '#462918',
  accent: '#fd680e',
  surface: '#ffffff',
  contrast: '#ffffff',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.254.121.136:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('jwt_token', data.token);
        Alert.alert('Logged in!', 'Login successful.');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#bbb" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#bbb" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.contrast} /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.link}>Don't have an account? <Text style={styles.linkAccent}>Register</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: COLORS.heading,
    letterSpacing: 1,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginBottom: 4,
    fontSize: 16,
    color: COLORS.default,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.default,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.contrast,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  link: {
    color: COLORS.default,
    fontSize: 16,
    textAlign: 'center',
  },
  linkAccent: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
}); 