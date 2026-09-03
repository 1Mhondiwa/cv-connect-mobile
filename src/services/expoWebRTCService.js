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
      return true;
    } catch (error) {
      console.error('❌ Error initializing Expo WebRTC:', error);
      throw error;
    }
  }

  // Get user media (simplified - returns mock stream)
  async getUserMedia() {
    try {
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
    return { type: 'offer', sdp: 'mock-offer' };
  }

  // Create answer (simplified)
  async createAnswer() {
    return { type: 'answer', sdp: 'mock-answer' };
  }

  // Set remote description (simplified)
  async setRemoteDescription(_sessionDescription) {
      // Simulate connection after a delay
      setTimeout(() => {
        this.isConnected = true;
      }, 2000);
  }

  // Add ICE candidate (simplified)
  async addIceCandidate(_candidate) {
  }

  // Switch camera (simplified)
  async switchCamera() {
  }

  // Toggle audio (simplified)
  toggleAudio() {
    return true;
  }

  // Toggle video (simplified)
  toggleVideo() {
    return true;
  }

  // Send signaling message (simplified)
  sendSignalingMessage(_message) {
  }

  // Set signaling channel (simplified)
  setSignalingChannel(channel) {
    this.signalingChannel = channel;
  }

  // Clean up resources
  cleanup() {
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
