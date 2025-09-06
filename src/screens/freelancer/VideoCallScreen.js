import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  BackHandler,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Surface,
  Button,
  IconButton,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av'; // Will be updated to expo-audio in future

// Responsive utilities
import {
  scale,
  verticalScale,
  fontSize,
  spacing,
  borderRadius,
} from '../../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoCallScreen = ({ navigation, route }) => {
  const { interviewId, interviewTitle, isHost = false } = route.params || {};
  
  // Video call state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: null,
    audio: null
  });
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [waitingMessage, setWaitingMessage] = useState('Connecting to interview...');

  // Refs
  const cameraRef = useRef(null);
  const callDurationInterval = useRef(null);
  const connectionTimeout = useRef(null);

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'End Call',
          'Are you sure you want to end this interview?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'End Call', style: 'destructive', onPress: endCall },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Initialize video call
  useEffect(() => {
    initializeVideoCall();
    return () => {
      cleanup();
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected && callStartTime) {
      callDurationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
    }

    return () => {
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
    };
  }, [isConnected, callStartTime]);

  const initializeVideoCall = async () => {
    try {
      console.log('🎥 Initializing video call for interview:', interviewId);
      setIsConnecting(true);
      setError(null);

      // Request permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setError('Camera and microphone permissions are required for video calls');
        setIsConnecting(false);
        return;
      }

      // Simulate connection process with realistic timing
      setWaitingMessage('Connecting to interview room...');
      
      // Simulate connection delay
      setTimeout(() => {
        setWaitingMessage('Establishing secure connection...');
      }, 1000);

      setTimeout(() => {
        setWaitingMessage('Waiting for associate to join...');
      }, 2000);

      // Auto-connect after 5 seconds to simulate successful connection
      connectionTimeout.current = setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setCallStartTime(Date.now());
        setWaitingMessage('');
        console.log('✅ Video call connected successfully');
      }, 5000);

    } catch (error) {
      console.error('❌ Error initializing video call:', error);
      setError('Failed to initialize video call. Please try again.');
      setIsConnecting(false);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('📹 Requesting camera and microphone permissions...');

      // Request camera permission
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      console.log('📹 Camera permission status:', cameraStatus.status);

      // Request microphone permission
      const audioStatus = await Audio.requestPermissionsAsync();
      console.log('🎤 Audio permission status:', audioStatus.status);

      setPermissionStatus({
        camera: cameraStatus.status,
        audio: audioStatus.status
      });

      const hasPermissions = cameraStatus.status === 'granted' && audioStatus.status === 'granted';
      
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone access are required for video interviews. Please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // You might want to use Linking.openSettings() here
            }},
          ]
        );
      }

      return hasPermissions;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('🔇 Mute toggled:', !isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log('📹 Video toggled:', !isVideoOn);
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
    console.log('🔄 Camera switched');
  };

  const endCall = () => {
    console.log('📞 Ending video call');
    cleanup();
    navigation.goBack();
  };

  const cleanup = () => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
    }
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
    }
    setIsConnected(false);
    setIsConnecting(false);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderConnectionScreen = () => (
    <View style={styles.connectionScreen}>
      <View style={styles.connectionContent}>
        <MaterialCommunityIcons
          name="video"
          size={80}
          color="#FF6B35"
          style={styles.connectionIcon}
        />
        <Text style={styles.connectionTitle}>Interview Video Call</Text>
        <Text style={styles.connectionSubtitle}>{interviewTitle}</Text>
        
        <ActivityIndicator 
          size="large" 
          color="#FF6B35" 
          style={styles.loadingIndicator}
        />
        
        <Text style={styles.connectionMessage}>{waitingMessage}</Text>
        
        <Button
          mode="outlined"
          onPress={endCall}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
      </View>
    </View>
  );

  const renderVideoCall = () => (
    <View style={styles.videoCallContainer}>
      {/* Main video area */}
      <View style={styles.videoArea}>
        {/* Remote video (larger) */}
        <View style={styles.remoteVideoContainer}>
          <View style={styles.remoteVideo}>
            <View style={styles.remoteVideoPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={80}
                color="#FFF"
              />
              <Text style={styles.remoteVideoText}>Associate</Text>
            </View>
          </View>
        </View>

        {/* Local video (smaller, overlay) */}
        <View style={styles.localVideoContainer}>
          {isVideoOn && permissionStatus.camera === 'granted' ? (
            <Camera
              ref={cameraRef}
              style={styles.localVideo}
              type={cameraType}
              ratio="16:9"
            >
              <View style={styles.localVideoOverlay}>
                <Text style={styles.localVideoText}>You</Text>
              </View>
            </Camera>
          ) : (
            <View style={styles.localVideoOff}>
              <MaterialCommunityIcons
                name="video-off"
                size={30}
                color="#FFF"
              />
              <Text style={styles.localVideoOffText}>Camera Off</Text>
            </View>
          )}
        </View>

        {/* Call info overlay */}
        <View style={styles.callInfoOverlay}>
          <View style={styles.callInfo}>
            <Text style={styles.callTitle}>{interviewTitle}</Text>
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          </View>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.controlsContainer}>
        <Surface style={styles.controlsBackground}>
          <View style={styles.controlsRow}>
            {/* Mute button */}
            <IconButton
              icon={isMuted ? "microphone-off" : "microphone"}
              iconColor={isMuted ? "#FF4444" : "#FFFFFF"}
              containerColor={isMuted ? "#FFE5E5" : "#4CAF50"}
              size={30}
              onPress={toggleMute}
              style={styles.controlButton}
            />

            {/* Video toggle button */}
            <IconButton
              icon={isVideoOn ? "video" : "video-off"}
              iconColor={isVideoOn ? "#FFFFFF" : "#FF4444"}
              containerColor={isVideoOn ? "#4CAF50" : "#FFE5E5"}
              size={30}
              onPress={toggleVideo}
              style={styles.controlButton}
            />

            {/* Switch camera button */}
            <IconButton
              icon="camera-flip"
              iconColor="#FFFFFF"
              containerColor="#6C757D"
              size={30}
              onPress={switchCamera}
              style={styles.controlButton}
            />

            {/* End call button */}
            <IconButton
              icon="phone-hangup"
              iconColor="#FFFFFF"
              containerColor="#FF4444"
              size={30}
              onPress={endCall}
              style={[styles.controlButton, styles.endCallButton]}
            />
          </View>
        </Surface>
      </View>
    </View>
  );

  const renderErrorScreen = () => (
    <View style={styles.errorScreen}>
      <View style={styles.errorContent}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={80}
          color="#FF4444"
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        
        <View style={styles.errorButtons}>
          <Button
            mode="contained"
            onPress={initializeVideoCall}
            style={styles.retryButton}
            labelStyle={styles.retryButtonLabel}
          >
            Try Again
          </Button>
          
          <Button
            mode="outlined"
            onPress={endCall}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {error ? renderErrorScreen() : 
       isConnecting ? renderConnectionScreen() : 
       renderVideoCall()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Connection Screen
  connectionScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  connectionContent: {
    alignItems: 'center',
    maxWidth: scale(300),
  },
  connectionIcon: {
    marginBottom: verticalScale(20),
  },
  connectionTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  connectionSubtitle: {
    fontSize: fontSize.lg,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: verticalScale(30),
  },
  loadingIndicator: {
    marginBottom: verticalScale(20),
  },
  connectionMessage: {
    fontSize: fontSize.md,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: verticalScale(40),
  },
  cancelButton: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  cancelButtonLabel: {
    color: '#FF4444',
    fontSize: fontSize.lg,
  },

  // Video Call Screen
  videoCallContainer: {
    flex: 1,
  },
  videoArea: {
    flex: 1,
    position: 'relative',
  },
  
  // Remote Video
  remoteVideoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  remoteVideoText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    marginTop: verticalScale(10),
  },

  // Local Video
  localVideoContainer: {
    position: 'absolute',
    top: verticalScale(20),
    right: scale(20),
    width: scale(120),
    height: verticalScale(160),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideo: {
    flex: 1,
  },
  localVideoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.xs,
  },
  localVideoText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  localVideoOff: {
    flex: 1,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoOffText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    marginTop: verticalScale(4),
  },

  // Call Info
  callInfoOverlay: {
    position: 'absolute',
    top: verticalScale(20),
    left: scale(20),
    right: scale(160), // Leave space for local video
  },
  callInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  callTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  callDuration: {
    color: '#4CAF50',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // Controls
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: verticalScale(40),
  },
  controlsBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    margin: spacing.lg,
    borderRadius: borderRadius.round,
    elevation: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    margin: 0,
  },
  endCallButton: {
    marginLeft: scale(10),
  },

  // Error Screen
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: scale(300),
  },
  errorIcon: {
    marginBottom: verticalScale(20),
  },
  errorTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  errorMessage: {
    fontSize: fontSize.md,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: verticalScale(30),
    lineHeight: fontSize.xxl,
  },
  errorButtons: {
    width: '100%',
    gap: verticalScale(12),
  },
  retryButton: {
    backgroundColor: '#FF6B35',
  },
  retryButtonLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
  },
});

export default VideoCallScreen;