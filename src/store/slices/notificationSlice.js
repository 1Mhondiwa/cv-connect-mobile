// store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewAPI } from '../../services/api';

// Async thunks for API calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}) => {
    const response = await interviewAPI.getNotifications(params);
    return response.data;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId) => {
    const response = await interviewAPI.markNotificationAsRead(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    lastFetched: null
  },
  reducers: {
    // Add new notification from WebSocket
    addNotification: (state, action) => {
      const notification = action.payload;
      // Add to beginning of array (most recent first)
      state.notifications.unshift({
        notification_id: notification.notification_id,
        notification_type: notification.notification_type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        is_read: false,
        created_at: notification.created_at,
        is_new: true // Flag to show it's a new notification
      });
      
      // Update unread count
      state.unreadCount += 1;
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    // Mark notification as read locally
    markAsReadLocal: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.notification_id === notificationId);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.is_new = false;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    // Remove new flag from notifications
    clearNewFlags: (state) => {
      state.notifications.forEach(notification => {
        notification.is_new = false;
      });
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data || [];
        state.unreadCount = action.payload.data ? action.payload.data.filter(n => !n.is_read).length : 0;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.notification_id === notificationId);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          notification.is_new = false;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const {
  addNotification,
  markAsReadLocal,
  clearNotifications,
  clearNewFlags,
  setError,
  clearError
} = notificationSlice.actions;

export default notificationSlice.reducer;
