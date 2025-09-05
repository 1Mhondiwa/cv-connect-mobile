import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

export const useVideoCall = (interviewId, isHost = false) => {
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

  // Initialize video call
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

  // Request permissions
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

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('🔇 Mute toggled:', !isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log('📹 Video toggled:', !isVideoOn);
  };

  // Toggle screen share
  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    console.log('🖥️ Screen share toggled:', !isScreenSharing);
  };

  // End call
  const endCall = () => {
    setIsConnected(false);
    setCallStartTime(null);
    setCallDuration(0);
    cleanup();
  };

  // Cleanup
  const cleanup = () => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
    }
    // In a real implementation, you would stop camera/microphone streams here
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    isMuted,
    isVideoOn,
    isScreenSharing,
    callDuration,
    callStartTime,
    error,
    permissionGranted,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    initializeVideoCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endCall,
    cleanup,
    formatDuration,
  };
};

export default useVideoCall;
