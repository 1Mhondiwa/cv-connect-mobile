import { 
  RTCPeerConnection, 
  RTCView, 
  mediaDevices, 
  RTCIceCandidate,
  RTCSessionDescription 
} from 'react-native-webrtc';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.signalingChannel = null;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  // Initialize WebRTC connection
  async initialize(isInitiator = false) {
    try {
      this.isInitiator = isInitiator;
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
      });

      // Set up event listeners
      this.setupPeerConnectionListeners();

      // Get user media
      await this.getUserMedia();

      return true;
    } catch (error) {
      console.error('❌ Error initializing WebRTC:', error);
      throw error;
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia() {
    try {
      const constraints = {
        audio: true,
        video: {
          frameRate: 30,
          facingMode: 'user',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      console.log('📹 Local stream obtained');
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  // Set up peer connection event listeners
  setupPeerConnectionListeners() {
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📹 Remote stream received');
      this.remoteStream = event.streams[0];
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate generated');
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection.connectionState);
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection.iceConnectionState);
    };
  }

  // Create offer (for initiator)
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('📞 Offer created');
      return offer;
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  // Create answer (for receiver)
  async createAnswer() {
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('📞 Answer created');
      return answer;
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      throw error;
    }
  }

  // Set remote description
  async setRemoteDescription(sessionDescription) {
    try {
      await this.peerConnection.setRemoteDescription(sessionDescription);
      console.log('📞 Remote description set');
    } catch (error) {
      console.error('❌ Error setting remote description:', error);
      throw error;
    }
  }

  // Add ICE candidate
  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('🧊 ICE candidate added');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
      throw error;
    }
  }

  // Switch camera
  async switchCamera() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          await videoTrack._switchCamera();
          console.log('🔄 Camera switched');
        }
      }
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      throw error;
    }
  }

  // Mute/unmute audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🔊 Audio toggled:', audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Enable/disable video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video toggled:', videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Send signaling message (implement based on your signaling server)
  sendSignalingMessage(message) {
    if (this.signalingChannel) {
      this.signalingChannel.send(JSON.stringify(message));
    } else {
      console.log('📡 Signaling message:', message);
      // In a real implementation, this would send to your signaling server
    }
  }

  // Set signaling channel
  setSignalingChannel(channel) {
    this.signalingChannel = channel;
  }

  // Clean up resources
  cleanup() {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.remoteStream = null;
      this.signalingChannel = null;
      
      console.log('🧹 WebRTC resources cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up WebRTC:', error);
    }
  }

  // Get local stream URL for RTCView
  getLocalStreamURL() {
    return this.localStream ? this.localStream.toURL() : null;
  }

  // Get remote stream URL for RTCView
  getRemoteStreamURL() {
    return this.remoteStream ? this.remoteStream.toURL() : null;
  }

  // Check if connected
  isConnected() {
    return this.peerConnection && 
           this.peerConnection.connectionState === 'connected';
  }

  // Get connection state
  getConnectionState() {
    return this.peerConnection ? this.peerConnection.connectionState : 'disconnected';
  }
}

export default new WebRTCService();
