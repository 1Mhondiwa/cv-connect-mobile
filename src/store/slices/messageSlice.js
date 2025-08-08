import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      console.log('fetchMessages called with conversationId:', conversationId);
      const response = await messageAPI.getMessages(conversationId, params);
      console.log('fetchMessages response:', response.data);
      return { conversationId, messages: response.data };
    } catch (error) {
      console.error('fetchMessages error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage(conversationId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.createConversation(recipientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      console.log('markConversationAsRead called with conversationId:', conversationId);
      const response = await messageAPI.markAsRead(conversationId);
      console.log('markConversationAsRead response:', response.data);
      return { conversationId, ...response.data };
    } catch (error) {
      console.error('markConversationAsRead error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const initialState = {
  conversations: [],
  messages: {},
  currentConversation: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
  typingUsers: {},
  socketConnected: false,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Check if message already exists to avoid duplicates
      const existingMessage = state.messages[conversationId].find(
        m => m.message_id === message.message_id
      );
      if (!existingMessage) {
        state.messages[conversationId].push(message);
        // Update conversation's last message
        const conversation = state.conversations.find(c => c.conversation_id === conversationId);
        if (conversation) {
          conversation.last_message = message.content;
          conversation.last_message_time = message.sent_at;
          conversation.unread_count = (conversation.unread_count || 0) + 1;
        }
      }
    },
    markAsRead: (state, action) => {
      const { conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach(message => {
          message.read_at = new Date().toISOString();
        });
      }
      // Update conversation unread count
      const conversation = state.conversations.find(c => c.conversation_id === conversationId);
      if (conversation) {
        conversation.unread_count = 0;
      }
    },
    setTypingUser: (state, action) => {
      const { conversationId, userId, typing } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = new Set();
      }
      if (typing) {
        state.typingUsers[conversationId].add(userId);
      } else {
        state.typingUsers[conversationId].delete(userId);
      }
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.conversation_id === conversationId);
      if (conversation) {
        conversation.last_message = message.content;
        conversation.last_message_time = message.sent_at;
        // Move conversation to top
        state.conversations = [
          conversation,
          ...state.conversations.filter(c => c.conversation_id !== conversationId)
        ];
      }
    },
    clearMessages: (state) => {
      state.messages = {};
      state.currentConversation = null;
      state.typingUsers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations || [];
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages.messages || [];
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload.data;
        const conversationId = message.conversation_id;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
        // Update conversation's last message
        const conversation = state.conversations.find(c => c.conversation_id === conversationId);
        if (conversation) {
          conversation.last_message = message.content;
          conversation.last_message_time = message.sent_at;
          // Move conversation to top
          state.conversations = [
            conversation,
            ...state.conversations.filter(c => c.conversation_id !== conversationId)
          ];
        }
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        // Refresh conversations list
        // This will be handled by the component calling fetchConversations
      })
      // Mark as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId].forEach(message => {
            message.read_at = new Date().toISOString();
          });
        }
        // Update conversation unread count
        const conversation = state.conversations.find(c => c.conversation_id === conversationId);
        if (conversation) {
          conversation.unread_count = 0;
        }
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.total_unread || 0;
      });
  },
});

export const { 
  clearError, 
  setCurrentConversation, 
  addMessage, 
  markAsRead, 
  setTypingUser, 
  setSocketConnected,
  updateConversationLastMessage,
  clearMessages
} = messageSlice.actions;

export default messageSlice.reducer; 