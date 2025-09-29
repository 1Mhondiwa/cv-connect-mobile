import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { tokenService } from '../services/api';
import { setToken, setUser } from '../store/slices/authSlice';
import { getProfile } from '../store/slices/freelancerSlice';
import socketService from '../services/socketService';
import { setSocketConnected } from '../store/slices/messageSlice';

const Stack = createStackNavigator();

// Landing and Splash Screens
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HiringHistoryScreen from '../screens/freelancer/HiringHistoryScreen';
import ContractsScreen from '../screens/freelancer/ContractsScreen';
import AdminCreateScreen from '../screens/auth/AdminCreateScreen';
import AssociateRequestScreen from '../screens/associate/AssociateRequestScreen';

// Freelancer Screens
import CVUploadScreen from '../screens/freelancer/CVUploadScreen';
import FreelancerTabNavigator from './FreelancerTabNavigator';

// Admin Screens
import AdminTabNavigator from './AdminTabNavigator';

// Associate Screens
import AssociateTabNavigator from './AssociateTabNavigator';

// Loading Screen
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
    <ActivityIndicator size="large" color="#FF6B35" />
  </View>
);

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="AdminCreate" component={AdminCreateScreen} />
    <Stack.Screen name="AssociateRequest" component={AssociateRequestScreen} />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, user, userType, hasExplicitlyLoggedOut } = useSelector((state) => state.auth);
  const { hasCV, isLoading: profileLoading } = useSelector((state) => state.freelancer);
  
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const initializationRef = useRef(false);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !hasExplicitlyLoggedOut) {
      // Connect to WebSocket
      socketService.connect();
      
      // Update socket connection status
      const checkConnection = () => {
        dispatch(setSocketConnected(socketService.getConnectionStatus()));
      };
      
      // Check connection status periodically
      const interval = setInterval(checkConnection, 5000);
      
      return () => {
        clearInterval(interval);
        socketService.disconnect();
      };
    } else {
      // Disconnect WebSocket when user is not authenticated
      socketService.disconnect();
      dispatch(setSocketConnected(false));
    }
  }, [isAuthenticated, hasExplicitlyLoggedOut]);

  // Initialize token from SecureStore on app start
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // For testing, always start with Auth screen
        // Comment out the token restoration for now
        /*
        const token = await tokenService.getToken();
        
        if (token && isMounted) {
          dispatch(setToken(token));
          
          // Fetch profile to check CV status
          try {
            const profileResult = await dispatch(getProfile()).unwrap();
            
            if (profileResult && profileResult.profile && isMounted) {
              dispatch(setUser(profileResult.profile));
            }
          } catch (profileError) {
            // If profile fetch fails, clear the token
            if (isMounted) {
              await tokenService.removeToken();
              dispatch(setToken(null));
            }
          }
        }
        */
        
        // Add minimum delay to show splash screen
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only once on mount

  // Show splash screen while initializing
  if (!isInitialized) {
    return <SplashScreen />;
  }

  // Show loading screen while auth is loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Determine which screen to show
  let screenToShow = 'Auth';
  
  // Only show authenticated screens if user is authenticated AND hasn't explicitly logged out
  if (isAuthenticated && !hasExplicitlyLoggedOut) {
    if (userType === 'admin') {
      // Admin users go directly to admin dashboard
      screenToShow = 'Admin';
    } else if (userType === 'associate') {
      // Associate users go to associate dashboard (to be implemented)
      screenToShow = 'Associate';
    } else if (userType === 'freelancer') {
      // For freelancers, check if they have a valid CV
      if (hasCV === true) {
        screenToShow = 'Main';
      } else {
        screenToShow = 'CVUpload';
      }
    }
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {screenToShow === 'Auth' && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {screenToShow === 'CVUpload' && (
        <Stack.Screen name="CVUpload" component={CVUploadScreen} />
      )}
      {screenToShow === 'Main' && (
        <>
          <Stack.Screen name="Main" component={FreelancerTabNavigator} />
          <Stack.Screen name="HiringHistory" component={HiringHistoryScreen} />
          <Stack.Screen name="Contracts" component={ContractsScreen} />
        </>
      )}
      {screenToShow === 'Admin' && (
        <Stack.Screen name="Admin" component={AdminTabNavigator} />
      )}
      {screenToShow === 'Associate' && (
        <Stack.Screen name="Associate" component={AssociateTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 