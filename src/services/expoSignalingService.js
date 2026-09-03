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
  connect(_serverUrl = 'http://10.0.0.10:5000') {
    try {
      this.isConnected = true;
      
      // Simulate connection after a delay
      setTimeout(() => {
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
      this.roomId = null;
    }
  }

  // Send offer (simplified)
  sendOffer(_offer) {
    if (this.isConnected && this.roomId) {
      
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
  sendAnswer(_answer) {
  }

  // Send ICE candidate (simplified)
  sendIceCandidate(_candidate) {
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
