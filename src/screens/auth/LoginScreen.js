import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, setToken, setUser } from '../../store/slices/authSlice';
import { getProfile } from '../../store/slices/freelancerSlice';
import { tokenService } from '../../services/api';
import VisitorTrackingService from '../../services/visitorTracking';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Force clear any cached data first
      await tokenService.removeToken();
      dispatch(setToken(null));
      dispatch(setUser(null));
      
      console.log('Attempting login with:', { email, password: '***' });
      const result = await dispatch(login({ email, password })).unwrap();
      console.log('Login successful:', result);
      
      // Track mobile login visit
      if (result.user) {
        try {
          await VisitorTrackingService.trackLogin(result.user.user_id);
          console.log('📱 Mobile login visit tracked');
        } catch (trackingError) {
          console.log('📱 Mobile login tracking error:', trackingError);
        }
      }
      
      // After successful login, fetch profile to check CV status
      if (result.user && result.user.user_type === 'freelancer') {
        try {
          console.log('Fetching profile to check CV status...');
          const profileResult = await dispatch(getProfile()).unwrap();
          console.log('Profile fetched:', profileResult);
        } catch (profileError) {
          console.log('Profile fetch error:', profileError);
        }
      }
      
      // Navigation will be handled by the AppNavigator based on auth state
    } catch (error) {
      console.log('Login failed:', error);
      Alert.alert('Login Failed', error || 'Please check your credentials');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your CV-Connect account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8B8B8B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#8B8B8B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#8B4513"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

                     {/* Register Link */}
           <View style={styles.registerContainer}>
             <Text style={styles.registerText}>Don't have an account? </Text>
             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
               <Text style={styles.registerLink}>Sign Up</Text>
             </TouchableOpacity>
           </View>

           {/* Admin Create Link */}
           <View style={styles.registerContainer}>
             <Text style={styles.registerText}>Need to create admin? </Text>
             <TouchableOpacity onPress={() => navigation.navigate('AdminCreate')}>
               <Text style={styles.registerLink}>Create Admin</Text>
             </TouchableOpacity>
           </View>

           {/* Associate Request Link */}
           <View style={styles.registerContainer}>
             <Text style={styles.registerText}>Want to become an associate? </Text>
             <TouchableOpacity onPress={() => navigation.navigate('AssociateRequest')}>
               <Text style={styles.registerLink}>Apply Here</Text>
             </TouchableOpacity>
           </View>

           
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
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
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F8F8F8',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#8B8B8B',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#4A4A4A',
    fontSize: 16,
  },
     registerLink: {
     color: '#8B4513',
     fontSize: 16,
     fontWeight: '600',
   },
   
 });

export default LoginScreen; 