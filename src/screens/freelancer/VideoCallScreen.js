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
  TouchableOpacity,
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as ScreenCapture from 'expo-screen-capture';

// Responsive utilities
import {
  scale,
  verticalScale,
  fontSize,
  spacing,
  borderRadius,
  responsive,
  isTablet,
  isSmallDevice,
  isLargeDevice,
} from '../../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoCallScreen = ({ route, navigation }) => {
  const { interviewId, interviewTitle, isHost } = route.params || {};
  
  // Video call state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [waitingMessage, setWaitingMessage] = useState('Connecting to interview...');
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState({
    camera: null,
    audio: null
  });
  const [cameraType, setCameraType] = useState('front');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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
      const interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now - callStartTime) / 1000);
        setCallDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected, callStartTime]);

  const initializeVideoCall = async () => {
    try {
      console.log('🎥 Initializing video call...');
      setIsConnecting(true);
      setError(null);

      // Request permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setError('Camera and microphone permissions are required for video calls');
        setIsConnecting(false);
        return;
      }

      // Initialize audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Simulate connection process
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setCallStartTime(new Date());
        setWaitingMessage('Connected to interview');
      }, 2000);

    } catch (err) {
      console.error('❌ Error initializing video call:', err);
      setError('Failed to initialize video call');
      setIsConnecting(false);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('📹 Requesting camera and microphone permissions...');

      // Request camera permission using the new hook
      let cameraGranted = false;
      if (permission?.granted) {
        cameraGranted = true;
        console.log('📹 Camera permission already granted');
      } else if (requestPermission) {
        const cameraResult = await requestPermission();
        cameraGranted = cameraResult.granted;
        console.log('📹 Camera permission status:', cameraResult.granted);
      } else {
        console.log('📹 Camera permission hook not available, assuming granted');
        cameraGranted = true; // Fallback for development
      }

      // Request microphone permission
      const audioStatus = await Audio.requestPermissionsAsync();
      console.log('🎤 Audio permission status:', audioStatus.status);

      const hasPermissions = cameraGranted && audioStatus.status === 'granted';
      
      setPermissionStatus({
        camera: cameraGranted ? 'granted' : 'denied',
        audio: audioStatus.status
      });

      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone access are required for video interviews. Please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // You can add Linking.openSettings() here if needed
            }},
          ]
        );
      }

      return hasPermissions;
    } catch (err) {
      console.error('❌ Error requesting permissions:', err);
      return false;
    }
  };

  const toggleMute = async () => {
    try {
      if (isMuted) {
        // Unmute - enable audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('🔊 Audio unmuted');
      } else {
        // Mute - disable audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log('🔇 Audio muted');
      }
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('❌ Error toggling audio:', err);
      // Still toggle the state even if audio mode fails
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log('📹 Video toggled:', !isVideoOn);
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === 'back'
        ? 'front'
        : 'back'
    );
    console.log('🔄 Camera switched to:', cameraType === 'back' ? 'front' : 'back');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    console.log('📱 Fullscreen toggled:', !isFullscreen);
  };

  const toggleScreenSharing = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        await ScreenCapture.stopScreenCaptureAsync();
        setIsScreenSharing(false);
        console.log('📺 Screen sharing stopped');
      } else {
        // Start screen sharing
        const hasPermission = await ScreenCapture.requestPermissionsAsync();
        if (hasPermission.granted) {
          await ScreenCapture.startScreenCaptureAsync();
          setIsScreenSharing(true);
          console.log('📺 Screen sharing started');
        } else {
          Alert.alert(
            'Permission Required',
            'Screen recording permission is required for screen sharing.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('❌ Error toggling screen sharing:', err);
      Alert.alert(
        'Screen Sharing Error',
        'Failed to start/stop screen sharing. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const endCall = async () => {
    console.log('📞 Ending video call');
    await cleanup();
    navigation.goBack();
  };

  const cleanup = async () => {
    console.log('🧹 Cleaning up video call resources');
    setIsConnected(false);
    setIsConnecting(false);
    setCallStartTime(null);
    setCallDuration(0);
    
    // Clear intervals
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
      callDurationInterval.current = null;
    }
    
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }

    // Stop screen sharing if active
    if (isScreenSharing) {
      try {
        await ScreenCapture.stopScreenCaptureAsync();
        setIsScreenSharing(false);
      } catch (err) {
        console.error('❌ Error stopping screen sharing:', err);
      }
    }

    // Reset audio mode
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.error('❌ Error resetting audio mode:', err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={60}
            color="#FF6B35"
          />
          <Title style={styles.errorTitle}>Connection Error</Title>
          <Paragraph style={styles.errorMessage}>{error}</Paragraph>
          <Button
            mode="contained"
            onPress={initializeVideoCall}
            style={styles.retryButton}
            labelStyle={styles.buttonLabel}
          >
            Try Again
          </Button>
          {error.includes('permissions') && (
            <Button
              mode="outlined"
              onPress={requestPermissions}
              style={styles.permissionButton}
              labelStyle={styles.buttonLabel}
            >
              Request Permissions
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={endCall}
            style={styles.endCallButton}
            labelStyle={styles.buttonLabel}
          >
            End Call
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
       {/* Main video area */}
       <View style={styles.videoContainer}>
         {isConnecting ? (
           <View style={styles.connectingContainer}>
             <ActivityIndicator size="large" color="#FF6B35" />
             <Text style={styles.connectingText}>{waitingMessage}</Text>
           </View>
         ) : (
           <>
             {/* Remote video (other participant) */}
             <TouchableOpacity 
               style={isFullscreen ? styles.fullscreenVideo : styles.remoteVideoContainer}
               onPress={toggleFullscreen}
               activeOpacity={0.8}
             >
               <View style={styles.remoteVideo}>
                 {isScreenSharing ? (
                   <View style={styles.screenShareContainer}>
                     <MaterialCommunityIcons
                       name="monitor"
                       size={60}
                       color="#FFF"
                     />
                     <Text style={styles.screenShareText}>Screen Sharing</Text>
                   </View>
                 ) : (
                   <>
                     <MaterialCommunityIcons
                       name="account"
                       size={isFullscreen ? 120 : 80}
                       color="#FFF"
                     />
                     <Text style={styles.remoteVideoText}>
                       {isHost ? 'Freelancer' : 'Associate'}
                     </Text>
                   </>
                 )}
               </View>
             </TouchableOpacity>

             {/* Local video (yourself) */}
             <TouchableOpacity 
               style={isFullscreen ? styles.localVideoSmall : styles.localVideoContainer}
               onPress={toggleFullscreen}
               activeOpacity={0.8}
             >
               {isVideoOn && permissionStatus.camera === 'granted' ? (
                 <CameraView
                   ref={cameraRef}
                   style={styles.localVideo}
                   facing={cameraType}
                 >
                   <View style={styles.localVideoOverlay}>
                     <Text style={styles.localVideoText}>You</Text>
                   </View>
                 </CameraView>
               ) : (
                 <View style={styles.localVideoOff}>
                   <MaterialCommunityIcons
                     name="video-off"
                     size={isFullscreen ? 20 : 30}
                     color="#FFF"
                   />
                   <Text style={[styles.localVideoOffText, isFullscreen && styles.localVideoOffTextSmall]}>
                     {permissionStatus.camera !== 'granted' ? 'Camera Permission Required' : 'Camera Off'}
                   </Text>
                 </View>
               )}
             </TouchableOpacity>
           </>
         )}

        {/* Call duration */}
        {isConnected && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {formatDuration(callDuration)}
            </Text>
          </View>
        )}
      </View>

       {/* Bottom controls */}
       <View style={styles.controlsContainer}>
         <Surface style={styles.controlsSurface}>
           <IconButton
             icon={isMuted ? 'microphone-off' : 'microphone'}
             iconColor="#FFFFFF"
             containerColor={isMuted ? "#FF6B35" : "#6C757D"}
             size={30}
             onPress={toggleMute}
             style={styles.controlButton}
           />

           <IconButton
             icon="camera-flip"
             iconColor="#FFFFFF"
             containerColor="#6C757D"
             size={30}
             onPress={switchCamera}
             style={styles.controlButton}
           />

           <IconButton
             icon={isVideoOn ? 'video' : 'video-off'}
             iconColor="#FFFFFF"
             containerColor={isVideoOn ? "#6C757D" : "#FF6B35"}
             size={30}
             onPress={toggleVideo}
             style={styles.controlButton}
           />

           <IconButton
             icon={isScreenSharing ? 'monitor-off' : 'monitor'}
             iconColor="#FFFFFF"
             containerColor={isScreenSharing ? "#FF6B35" : "#6C757D"}
             size={30}
             onPress={toggleScreenSharing}
             style={styles.controlButton}
           />

           <IconButton
             icon="phone-hangup"
             iconColor="#FFFFFF"
             containerColor="#DC3545"
             size={30}
             onPress={endCall}
             style={styles.controlButton}
           />
         </Surface>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  connectingText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  remoteVideoText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
  },
  localVideoContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: scale(120),
    height: scale(90),
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  localVideoSmall: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: scale(80),
    height: scale(60),
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  fullscreenVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenShareContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  screenShareText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  localVideoText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  localVideoOff: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoOffText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  localVideoOffTextSmall: {
    fontSize: fontSize.xs - 2,
    marginTop: spacing.xs - 2,
  },
  durationContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  controlsSurface: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  controlButton: {
    marginHorizontal: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: '#1a1a1a',
  },
  errorTitle: {
    color: '#FFF',
    fontSize: fontSize.xxl,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#CCC',
    fontSize: fontSize.md,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: fontSize.xxl,
  },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: '#FF6B35',
  },
  permissionButton: {
    marginTop: spacing.md,
    borderColor: '#FF6B35',
  },
  endCallButton: {
    marginTop: spacing.md,
    borderColor: '#FF6B35',
  },
  buttonLabel: {
    color: '#FFF',
    fontSize: fontSize.md,
  },
});

export default VideoCallScreen;