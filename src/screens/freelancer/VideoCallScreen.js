import React, { useState, useEffect } from 'react';
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('🔇 Mute toggled:', !isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log('📹 Video toggled:', !isVideoOn);
  };

  const switchCamera = () => {
    console.log('🔄 Camera switched');
  };

  const endCall = () => {
    console.log('📞 Ending video call');
    cleanup();
    navigation.goBack();
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up video call resources');
    setIsConnected(false);
    setIsConnecting(false);
    setCallStartTime(null);
    setCallDuration(0);
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
          <View style={styles.remoteVideoContainer}>
            <View style={styles.remoteVideo}>
              <MaterialCommunityIcons
                name="account"
                size={80}
                color="#FFF"
              />
              <Text style={styles.remoteVideoText}>
                {isHost ? 'Freelancer' : 'Associate'}
              </Text>
            </View>
          </View>
        )}

        {/* Local video (smaller, overlay) */}
        <View style={styles.localVideoContainer}>
          {isVideoOn ? (
            <View style={styles.localVideo}>
              <MaterialCommunityIcons
                name="account"
                size={30}
                color="#FFF"
              />
              <View style={styles.localVideoOverlay}>
                <Text style={styles.localVideoText}>You</Text>
              </View>
            </View>
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
            icon="video"
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