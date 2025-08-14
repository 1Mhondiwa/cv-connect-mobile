import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
  }

  async connect() {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        console.log('No auth token found, cannot connect to socket');
        return;
      }

      this.socket = io('http://192.168.101.104:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
      });

      this.socket.on('receive_message', (message) => {
        console.log('Received message:', message);
        // Notify all registered handlers
        this.messageHandlers.forEach(handler => {
          handler(message);
        });
      });

      this.socket.on('user_typing', (data) => {
        console.log('User typing:', data);
        // Notify all registered typing handlers
        this.typingHandlers.forEach(handler => {
          handler(data);
        });
      });

      this.socket.on('message_error', (error) => {
        console.error('Message error:', error);
      });

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
      console.log(`Joined conversation: ${conversationId}`);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
      console.log(`Left conversation: ${conversationId}`);
    }
  }

  sendMessage(conversationId, senderId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      });
      console.log(`Sent message to conversation: ${conversationId}`);
    }
  }

  sendTypingIndicator(conversationId, userId, typing) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        conversation_id: conversationId,
        user_id: userId,
        typing: typing
      });
    }
  }

  // Register message handler
  onMessage(handler) {
    const id = Date.now().toString();
    this.messageHandlers.set(id, handler);
    return id; // Return handler ID for removal
  }

  // Remove message handler
  removeMessageHandler(handlerId) {
    this.messageHandlers.delete(handlerId);
  }

  // Register typing handler
  onTyping(handler) {
    const id = Date.now().toString();
    this.typingHandlers.set(id, handler);
    return id; // Return handler ID for removal
  }

  // Remove typing handler
  removeTypingHandler(handlerId) {
    this.typingHandlers.delete(handlerId);
  }

  // Check if connected
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 