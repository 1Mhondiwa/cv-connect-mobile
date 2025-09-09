// Simplified signaling service for Expo Go compatibility
// This simulates WebRTC signaling without requiring native modules

class ExpoSignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.isConnected = false;
    this.callbacks = {
      onOffer: null,
      onAnswer: null,
      onIceCandidate: null,
      onUserJoined: null,
      onUserLeft: null,
      onError: null,
    };
  }

  // Connect to signaling server (simplified)
  connect(serverUrl = 'http://10.0.0.10:5000') {
    try {
      console.log('📡 Connecting to signaling server (simulated)');
      this.isConnected = true;
      
      // Simulate connection after a delay
      setTimeout(() => {
        console.log('📡 Signaling server connected (simulated)');
      }, 1000);
    } catch (error) {
      console.error('❌ Error connecting to signaling server:', error);
      throw error;
    }
  }

  // Join a room (simplified)
  joinRoom(roomId, userId) {
    if (this.isConnected) {
      this.roomId = roomId;
      console.log('🚪 Joined room (simulated):', roomId);
      
      // Simulate user joined event
      setTimeout(() => {
        if (this.callbacks.onUserJoined) {
          this.callbacks.onUserJoined({ userId, roomId });
        }
      }, 2000);
    }
  }

  // Leave the current room (simplified)
  leaveRoom() {
    if (this.roomId) {
      console.log('🚪 Left room (simulated)');
      this.roomId = null;
    }
  }

  // Send offer (simplified)
  sendOffer(offer) {
    if (this.isConnected && this.roomId) {
      console.log('📞 Offer sent (simulated)');
      
      // Simulate receiving answer after a delay
      setTimeout(() => {
        if (this.callbacks.onAnswer) {
          this.callbacks.onAnswer({
            answer: { type: 'answer', sdp: 'mock-answer' },
            roomId: this.roomId
          });
        }
      }, 3000);
    }
  }

  // Send answer (simplified)
  sendAnswer(answer) {
    if (this.isConnected && this.roomId) {
      console.log('📞 Answer sent (simulated)');
    }
  }

  // Send ICE candidate (simplified)
  sendIceCandidate(candidate) {
    if (this.isConnected && this.roomId) {
      console.log('🧊 ICE candidate sent (simulated)');
    }
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Disconnect from signaling server (simplified)
  disconnect() {
    if (this.isConnected) {
      this.leaveRoom();
      this.isConnected = false;
      console.log('📡 Disconnected from signaling server (simulated)');
    }
  }

  // Check if connected
  getIsConnected() {
    return this.isConnected;
  }

  // Get current room ID
  getRoomId() {
    return this.roomId;
  }
}

export default new ExpoSignalingService();
