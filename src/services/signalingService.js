import { io } from 'socket.io-client';
import webrtcService from './webrtcService';

class SignalingService {
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

  // Connect to signaling server
  connect(serverUrl = 'http://10.0.0.10:5000') {
    try {
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.setupEventListeners();
      console.log('📡 Connected to signaling server');
    } catch (error) {
      console.error('❌ Error connecting to signaling server:', error);
      throw error;
    }
  }

  // Set up socket event listeners
  setupEventListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('📡 Signaling server connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('📡 Signaling server disconnected');
    });

    this.socket.on('offer', async (data) => {
      console.log('📞 Received offer');
      if (this.callbacks.onOffer) {
        await this.callbacks.onOffer(data);
      }
    });

    this.socket.on('answer', async (data) => {
      console.log('📞 Received answer');
      if (this.callbacks.onAnswer) {
        await this.callbacks.onAnswer(data);
      }
    });

    this.socket.on('ice-candidate', async (data) => {
      console.log('🧊 Received ICE candidate');
      if (this.callbacks.onIceCandidate) {
        await this.callbacks.onIceCandidate(data);
      }
    });

    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data.userId);
      if (this.callbacks.onUserJoined) {
        this.callbacks.onUserJoined(data);
      }
    });

    this.socket.on('user-left', (data) => {
      console.log('👤 User left:', data.userId);
      if (this.callbacks.onUserLeft) {
        this.callbacks.onUserLeft(data);
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Signaling error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });
  }

  // Join a room
  joinRoom(roomId, userId) {
    if (this.socket && this.isConnected) {
      this.roomId = roomId;
      this.socket.emit('join-room', { roomId, userId });
      console.log('🚪 Joined room:', roomId);
    }
  }

  // Leave the current room
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
      this.roomId = null;
      console.log('🚪 Left room');
    }
  }

  // Send offer
  sendOffer(offer) {
    if (this.socket && this.roomId) {
      this.socket.emit('offer', {
        roomId: this.roomId,
        offer: offer,
      });
      console.log('📞 Offer sent');
    }
  }

  // Send answer
  sendAnswer(answer) {
    if (this.socket && this.roomId) {
      this.socket.emit('answer', {
        roomId: this.roomId,
        answer: answer,
      });
      console.log('📞 Answer sent');
    }
  }

  // Send ICE candidate
  sendIceCandidate(candidate) {
    if (this.socket && this.roomId) {
      this.socket.emit('ice-candidate', {
        roomId: this.roomId,
        candidate: candidate,
      });
      console.log('🧊 ICE candidate sent');
    }
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Disconnect from signaling server
  disconnect() {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('📡 Disconnected from signaling server');
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

export default new SignalingService();
