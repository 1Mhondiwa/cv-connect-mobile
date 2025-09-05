import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing notifications...');
        const success = await notificationService.initialize();
        
        if (success) {
          const token = notificationService.getExpoPushToken();
          setExpoPushToken(token);
          setIsInitialized(true);
          console.log('✅ Notifications initialized successfully');
        } else {
          console.log('❌ Failed to initialize notifications');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // Send interview scheduled notification
  const sendInterviewScheduled = async (interviewId, title, scheduledDate) => {
    try {
      const notificationId = await notificationService.sendInterviewScheduledNotification(
        interviewId,
        title,
        scheduledDate
      );
      
      if (notificationId) {
        console.log('📅 Interview scheduled notification sent:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('❌ Failed to send interview scheduled notification:', error);
    }
    return null;
  };

  // Send interview reminder
  const sendInterviewReminder = async (interviewId, title, scheduledDate) => {
    try {
      const notificationId = await notificationService.scheduleInterviewReminder(
        interviewId,
        scheduledDate,
        title
      );
      
      if (notificationId) {
        console.log('⏰ Interview reminder scheduled:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('❌ Failed to schedule interview reminder:', error);
    }
    return null;
  };

  // Send interview feedback notification
  const sendInterviewFeedback = async (interviewId, title) => {
    try {
      const notificationId = await notificationService.sendInterviewFeedbackNotification(
        interviewId,
        title
      );
      
      if (notificationId) {
        console.log('⭐ Interview feedback notification sent:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('❌ Failed to send interview feedback notification:', error);
    }
    return null;
  };

  // Send interview cancelled notification
  const sendInterviewCancelled = async (interviewId, title) => {
    try {
      const notificationId = await notificationService.sendInterviewCancelledNotification(
        interviewId,
        title
      );
      
      if (notificationId) {
        console.log('❌ Interview cancelled notification sent:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('❌ Failed to send interview cancelled notification:', error);
    }
    return null;
  };

  // Send custom notification
  const sendCustomNotification = async (title, body, data = {}) => {
    try {
      const notificationId = await notificationService.scheduleLocalNotification(
        title,
        body,
        data
      );
      
      if (notificationId) {
        console.log('📨 Custom notification sent:', notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('❌ Failed to send custom notification:', error);
    }
    return null;
  };

  // Cancel notification
  const cancelNotification = async (notificationId) => {
    try {
      await notificationService.cancelNotification(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error);
    }
  };

  // Cancel all notifications
  const cancelAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      console.log('❌ All notifications cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error);
    }
  };

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      const { status } = await notificationService.registerForPushNotificationsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return false;
    }
  };

  // Show notification permission alert
  const showPermissionAlert = () => {
    Alert.alert(
      'Enable Notifications',
      'To receive interview updates and reminders, please enable notifications in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => {
          // This would typically open device settings
          console.log('Opening device settings...');
        }}
      ]
    );
  };

  const value = {
    isInitialized,
    expoPushToken,
    notifications,
    sendInterviewScheduled,
    sendInterviewReminder,
    sendInterviewFeedback,
    sendInterviewCancelled,
    sendCustomNotification,
    cancelNotification,
    cancelAllNotifications,
    requestPermissions,
    showPermissionAlert,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
