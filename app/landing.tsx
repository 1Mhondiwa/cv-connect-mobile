import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CV-Connect</Text>
      <Text style={styles.subtitle}>Connecting Freelancers, Associates, and Admins</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => router.push('/login')}>
        <Text style={styles.buttonOutlineText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A1CEDC',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1D3D47',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    color: '#1D3D47',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1D3D47',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    borderColor: '#1D3D47',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonOutlineText: {
    color: '#1D3D47',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 