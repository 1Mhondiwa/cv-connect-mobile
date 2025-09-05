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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callDurationInterval = useRef(null);

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isConnected) {
          Alert.alert(
            'End Call',
            'Are you sure you want to end this interview?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'End Call', style: 'destructive', onPress: endCall },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isConnected])
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
      setIsConnecting(true);
      setError(null);

      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Camera and microphone permissions are required for video calls');
        return;
      }

      setPermissionGranted(true);

      // Simulate connection process
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setCallStartTime(Date.now());
        console.log('📹 Video call connected successfully');
      }, 2000);

    } catch (error) {
      console.error('❌ Error initializing video call:', error);
      setError('Failed to initialize video call. Please try again.');
      setIsConnecting(false);
    }
  };

  const requestPermissions = async () => {
    try {
      // In a real implementation, you would request camera and microphone permissions
      // For now, we'll simulate permission granted
      console.log('📹 Requesting camera and microphone permissions...');
      return true;
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

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    console.log('🖥️ Screen share toggled:', !isScreenSharing);
  };

  const endCall = () => {
    setIsConnected(false);
    setCallStartTime(null);
    setCallDuration(0);
    cleanup();
    navigation.goBack();
  };

  const cleanup = () => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
    }
    // In a real implementation, you would stop camera/microphone streams here
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderConnectingScreen = () => (
    <View style={styles.connectingContainer}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Title style={styles.connectingTitle}>Connecting to Interview</Title>
      <Paragraph style={styles.connectingSubtitle}>
        {isHost ? 'Starting video call...' : 'Joining video call...'}
      </Paragraph>
      <Text style={styles.interviewTitle}>{interviewTitle || 'Interview'}</Text>
    </View>
  );

  const renderErrorScreen = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle" size={64} color="#dc3545" />
      <Title style={styles.errorTitle}>Connection Failed</Title>
      <Paragraph style={styles.errorSubtitle}>{error}</Paragraph>
      <Button
        mode="contained"
        onPress={initializeVideoCall}
        style={styles.retryButton}
        labelStyle={styles.buttonLabel}
      >
        Try Again
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        labelStyle={styles.buttonLabel}
      >
        Cancel
      </Button>
    </View>
  );

  const renderVideoCall = () => (
    <View style={styles.videoCallContainer}>
      {/* Remote Video (Main) */}
      <View style={styles.remoteVideoContainer}>
        <Surface style={styles.remoteVideo}>
          <View style={styles.remoteVideoPlaceholder}>
            <MaterialCommunityIcons name="account" size={80} color="#666" />
            <Text style={styles.remoteVideoText}>
              {isHost ? 'Waiting for freelancer...' : 'Waiting for associate...'}
            </Text>
          </View>
        </Surface>
      </View>

      {/* Local Video (Picture-in-Picture) */}
      <View style={styles.localVideoContainer}>
        <Surface style={styles.localVideo}>
          <View style={styles.localVideoPlaceholder}>
            <MaterialCommunityIcons name="account" size={40} color="#666" />
          </View>
        </Surface>
      </View>

      {/* Call Info */}
      <View style={styles.callInfoContainer}>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        <Text style={styles.callTitle}>{interviewTitle || 'Interview'}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Surface style={styles.controls} elevation={8}>
          <IconButton
            icon={isMuted ? 'microphone-off' : 'microphone'}
            size={32}
            iconColor={isMuted ? '#dc3545' : '#fff'}
            style={[styles.controlButton, isMuted && styles.controlButtonMuted]}
            onPress={toggleMute}
          />
          
          <IconButton
            icon="phone-hangup"
            size={32}
            iconColor="#fff"
            style={[styles.controlButton, styles.endCallButton]}
            onPress={endCall}
          />
          
          <IconButton
            icon={isVideoOn ? 'video' : 'video-off'}
            size={32}
            iconColor={isVideoOn ? '#fff' : '#dc3545'}
            style={[styles.controlButton, !isVideoOn && styles.controlButtonMuted]}
            onPress={toggleVideo}
          />
          
          <IconButton
            icon={isScreenSharing ? 'monitor' : 'monitor-off'}
            size={32}
            iconColor={isScreenSharing ? '#28a745' : '#fff'}
            style={[styles.controlButton, isScreenSharing && styles.controlButtonActive]}
            onPress={toggleScreenShare}
          />
        </Surface>
      </View>
    </View>
  );

  if (error) {
    return renderErrorScreen();
  }

  if (isConnecting) {
    return renderConnectingScreen();
  }

  return renderVideoCall();
};

const styles = StyleSheet.create({
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: spacing.large,
  },
  connectingTitle: {
    color: '#fff',
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    marginTop: spacing.large,
    textAlign: 'center',
  },
  connectingSubtitle: {
    color: '#ccc',
    fontSize: fontSize.medium,
    marginTop: spacing.small,
    textAlign: 'center',
  },
  interviewTitle: {
    color: '#FF6B35',
    fontSize: fontSize.large,
    fontWeight: '600',
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: spacing.large,
  },
  errorTitle: {
    color: '#dc3545',
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    marginTop: spacing.large,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#ccc',
    fontSize: fontSize.medium,
    marginTop: spacing.small,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.large,
  },
  cancelButton: {
    borderColor: '#666',
    paddingHorizontal: spacing.large,
  },
  buttonLabel: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
  },
  videoCallContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideoPlaceholder: {
    alignItems: 'center',
  },
  remoteVideoText: {
    color: '#666',
    fontSize: fontSize.medium,
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  localVideoContainer: {
    position: 'absolute',
    top: spacing.large,
    right: spacing.medium,
    width: 120,
    height: 160,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoPlaceholder: {
    alignItems: 'center',
  },
  callInfoContainer: {
    position: 'absolute',
    top: spacing.large,
    left: spacing.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.medium,
  },
  callDuration: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
  callTitle: {
    color: '#ccc',
    fontSize: fontSize.small,
    marginTop: spacing.xs,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: spacing.large,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  controlButton: {
    marginHorizontal: spacing.small,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonMuted: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
  },
  endCallButton: {
    backgroundColor: '#dc3545',
  },
});

export default VideoCallScreen;
