// Simplified WebRTC service for Expo Go compatibility
// This simulates WebRTC functionality using Expo's built-in capabilities

class ExpoWebRTCService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.isConnected = false;
    this.signalingChannel = null;
  }

  // Initialize WebRTC connection (simplified for Expo Go)
  async initialize(isInitiator = false) {
    try {
      this.isInitiator = isInitiator;
      console.log('🎥 Initializing Expo-compatible video call...');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Expo WebRTC:', error);
      throw error;
    }
  }

  // Get user media (simplified - returns mock stream)
  async getUserMedia() {
    try {
      console.log('📹 Getting user media (Expo compatible)');
      // Return a mock stream object for Expo Go compatibility
      this.localStream = {
        toURL: () => 'mock-local-stream',
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => []
      };
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  // Create offer (simplified)
  async createOffer() {
    try {
      console.log('📞 Creating offer (simulated)');
      return { type: 'offer', sdp: 'mock-offer' };
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  // Create answer (simplified)
  async createAnswer() {
    try {
      console.log('📞 Creating answer (simulated)');
      return { type: 'answer', sdp: 'mock-answer' };
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      throw error;
    }
  }

  // Set remote description (simplified)
  async setRemoteDescription(sessionDescription) {
    try {
      console.log('📞 Setting remote description (simulated)');
      // Simulate connection after a delay
      setTimeout(() => {
        this.isConnected = true;
        console.log('🔗 Connection established (simulated)');
      }, 2000);
    } catch (error) {
      console.error('❌ Error setting remote description:', error);
      throw error;
    }
  }

  // Add ICE candidate (simplified)
  async addIceCandidate(candidate) {
    try {
      console.log('🧊 Adding ICE candidate (simulated)');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
      throw error;
    }
  }

  // Switch camera (simplified)
  async switchCamera() {
    try {
      console.log('🔄 Camera switched (simulated)');
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      throw error;
    }
  }

  // Toggle audio (simplified)
  toggleAudio() {
    try {
      console.log('🔊 Audio toggled (simulated)');
      return true;
    } catch (error) {
      console.error('❌ Error toggling audio:', error);
      return false;
    }
  }

  // Toggle video (simplified)
  toggleVideo() {
    try {
      console.log('📹 Video toggled (simulated)');
      return true;
    } catch (error) {
      console.error('❌ Error toggling video:', error);
      return false;
    }
  }

  // Send signaling message (simplified)
  sendSignalingMessage(message) {
    console.log('📡 Signaling message (simulated):', message);
  }

  // Set signaling channel (simplified)
  setSignalingChannel(channel) {
    this.signalingChannel = channel;
  }

  // Clean up resources
  cleanup() {
    console.log('🧹 Cleaning up Expo WebRTC resources');
    this.localStream = null;
    this.remoteStream = null;
    this.isConnected = false;
    this.signalingChannel = null;
  }

  // Get local stream URL for RTCView (simplified)
  getLocalStreamURL() {
    return this.localStream ? this.localStream.toURL() : null;
  }

  // Get remote stream URL for RTCView (simplified)
  getRemoteStreamURL() {
    return this.remoteStream ? this.remoteStream.toURL() : null;
  }

  // Check if connected
  isConnected() {
    return this.isConnected;
  }

  // Get connection state
  getConnectionState() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

export default new ExpoWebRTCService();
