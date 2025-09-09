import io from 'socket.io-client';

class RealWebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
    this.userType = null;
    this.userId = null;
    this.isConnected = false;
    
    // Callbacks
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
  }

  // Initialize WebRTC connection
  async initialize(userType, userId, roomId) {
    this.userType = userType;
    this.userId = userId;
    this.roomId = roomId;

    // Connect to signaling server
    this.socket = io('http://10.0.0.10:5000', {
      transports: ['websocket', 'polling']
    });

    this.setupSocketListeners();
    
    // Join room
    this.socket.emit('join-room', {
      roomId,
      userType,
      userId
    });

    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      });
      console.log('✅ Got local media stream');
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw error;
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to signaling server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from signaling server');
      this.isConnected = false;
    });

    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data);
      if (this.onUserJoined) {
        this.onUserJoined(data);
      }
    });

    this.socket.on('user-left', (data) => {
      console.log('👤 User left:', data);
      if (this.onUserLeft) {
        this.onUserLeft(data);
      }
    });

    this.socket.on('existing-participants', (participants) => {
      console.log('👥 Existing participants:', participants);
      // If there are existing participants, create peer connection
      if (participants.length > 0) {
        this.createPeerConnection();
        this.createOffer();
      }
    });

    this.socket.on('offer', async (data) => {
      console.log('📤 Received offer from:', data.userType);
      await this.handleOffer(data.offer);
    });

    this.socket.on('answer', async (data) => {
      console.log('📤 Received answer from:', data.userType);
      await this.handleAnswer(data.answer);
    });

    this.socket.on('ice-candidate', async (data) => {
      console.log('🧊 Received ICE candidate from:', data.userType);
      await this.handleIceCandidate(data.candidate);
    });
  }

  // Create peer connection
  createPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📹 Received remote stream');
      this.remoteStream = event.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: this.roomId
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection.connectionState);
      this.isConnected = this.peerConnection.connectionState === 'connected';
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection.iceConnectionState);
    };
  }

  // Create and send offer
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('offer', {
        offer,
        roomId: this.roomId
      });
      
      console.log('📤 Sent offer');
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  // Handle incoming offer
  async handleOffer(offer) {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection();
      }
      
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.socket.emit('answer', {
        answer,
        roomId: this.roomId
      });
      
      console.log('📤 Sent answer');
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  // Handle incoming answer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('✅ Set remote description');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('✅ Added ICE candidate');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Switch camera
  async switchCamera() {
    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const constraints = {
          video: { 
            width: 1280, 
            height: 720, 
            facingMode: videoTrack.getSettings().facingMode === 'user' ? 'environment' : 'user'
          },
          audio: true
        };
        
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        // Replace the video track
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
        
        // Stop old track and update local stream
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);
        
        return newVideoTrack.getSettings().facingMode;
      }
    } catch (error) {
      console.error('❌ Error switching camera:', error);
    }
    return null;
  }

  // Start screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      this.socket.emit('screen-share-start', {
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      return false;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }

      this.socket.emit('screen-share-stop', {
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
      return false;
    }
  }

  // Cleanup
  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.remoteStream = null;
  }

  // Getters
  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  getConnectionState() {
    return this.peerConnection ? this.peerConnection.connectionState : 'disconnected';
  }
}

export default RealWebRTCService;
