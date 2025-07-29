import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#ffffff',
  default: '#444444',
  heading: '#462918',
  accent: '#fd680e',
  surface: '#ffffff',
  contrast: '#ffffff',
};

function sanitizeInput(str: string) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
}

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    // Sanitize inputs
    const cleanFirstName = sanitizeInput(firstName);
    const cleanLastName = sanitizeInput(lastName);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanCountryCode = sanitizeInput(countryCode).replace(/[^+\d]/g, '');
    const cleanPhone = sanitizeInput(phone).replace(/\D/g, '');
    const fullPhone = `${cleanCountryCode}${cleanPhone}`;
    const cleanPassword = password.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPhone || !cleanPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.254.121.136:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          first_name: cleanFirstName,
          last_name: cleanLastName,
          phone: fullPhone,
        })
      });
      console.log('HTTP status:', response.status);
      const data = await response.json();
      console.log('Register response:', data); // Debugging
      if (response.ok && data.success) {
        Alert.alert('Registered!', 'Registration successful. Please log in.');
        router.replace('/login');
      } else {
        Alert.alert('Registration failed', data.message || 'Could not register.');
        console.log(data.message );
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
            <Text style={styles.title}>Register</Text>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} placeholder="Enter your first name" placeholderTextColor="#bbb" value={firstName} onChangeText={setFirstName} />
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} placeholder="Enter your last name" placeholderTextColor="#bbb" value={lastName} onChangeText={setLastName} />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#bbb" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={styles.countryCodeInput}
                placeholder="+1"
                placeholderTextColor="#bbb"
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                maxLength={4}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#bbb"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#bbb" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor="#bbb" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Login</Text></Text>
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
    maxWidth: 400,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  countryCodeInput: {
    width: 60,
    height: 48,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.default,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
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