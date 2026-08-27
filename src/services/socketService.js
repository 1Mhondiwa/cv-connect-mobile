import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.notificationHandlers = new Map();
  }

  async connect() {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        return;
      }

      this.socket = io('http://10.0.0.10:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on('receive_message', (message) => {
        // Notify all registered handlers
        this.messageHandlers.forEach(handler => {
          handler(message);
        });
      });

      this.socket.on('user_typing', (data) => {
        // Notify all registered typing handlers
        this.typingHandlers.forEach(handler => {
          handler(data);
        });
      });

      this.socket.on('message_error', (error) => {
        console.error('Message error:', error);
      });

      // Handle interview notifications
      this.socket.on('notification', (notificationData) => {
        // Notify all registered notification handlers
        this.notificationHandlers.forEach(handler => {
          handler(notificationData);
        });
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

  // Join user room for notifications
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_user_room', userId);
    }
  }

  // Leave user room
  leaveUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_user_room', userId);
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(conversationId, senderId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content
      });
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

  // Register notification handler
  onNotification(handler) {
    const id = Date.now().toString();
    this.notificationHandlers.set(id, handler);
    return id; // Return handler ID for removal
  }

  // Remove notification handler
  removeNotificationHandler(handlerId) {
    this.notificationHandlers.delete(handlerId);
  }

  // Check if connected
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService; 