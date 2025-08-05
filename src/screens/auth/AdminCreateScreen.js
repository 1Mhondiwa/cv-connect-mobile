import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';

const AdminCreateScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateAdmin = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.secretKey) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.createAdmin({
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey,
      });

      if (response.success) {
        Alert.alert(
          'Success', 
          'Admin account created successfully! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to create admin account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#FF6B35' }]}>
            Create Admin Account
          </Text>
          <Text style={[styles.subtitle, { color: '#8B4513' }]}>
            Enter your details and secret key to create an admin account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#8B4513' }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: '#8B4513' }]}
              placeholder="Enter your email"
              placeholderTextColor="#8B4513"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#8B4513' }]}>Password</Text>
            <TextInput
              style={[styles.input, { borderColor: '#8B4513' }]}
              placeholder="Enter your password"
              placeholderTextColor="#8B4513"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#8B4513' }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, { borderColor: '#8B4513' }]}
              placeholder="Confirm your password"
              placeholderTextColor="#8B4513"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#8B4513' }]}>Secret Key</Text>
            <TextInput
              style={[styles.input, { borderColor: '#8B4513' }]}
              placeholder="Enter admin secret key"
              placeholderTextColor="#8B4513"
              value={formData.secretKey}
              onChangeText={(value) => handleInputChange('secretKey', value)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: '#FF6B35' },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleCreateAdmin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create Admin Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.linkText, { color: '#8B4513' }]}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default AdminCreateScreen; 