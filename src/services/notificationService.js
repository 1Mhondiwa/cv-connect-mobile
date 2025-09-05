import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      console.log('🔔 Initializing notification service...');
      
      // Register for push notifications
      await this.registerForPushNotificationsAsync();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      return false;
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Expo push token:', token);
    } else {
      console.log('⚠️ Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    return token;
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type) {
      case 'interview_scheduled':
        this.handleInterviewScheduled(data);
        break;
      case 'interview_reminder':
        this.handleInterviewReminder(data);
        break;
      case 'interview_feedback':
        this.handleInterviewFeedback(data);
        break;
      case 'interview_cancelled':
        this.handleInterviewCancelled(data);
        break;
      default:
        console.log('📨 Unknown notification type:', data?.type);
    }
  }

  // Handle notification response (user tapped notification)
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'interview_scheduled':
      case 'interview_reminder':
        // Navigate to interviews tab
        this.navigateToInterviews();
        break;
      case 'interview_feedback':
        // Navigate to feedback screen
        this.navigateToFeedback(data.interviewId);
        break;
      case 'interview_cancelled':
        // Navigate to interviews tab
        this.navigateToInterviews();
        break;
    }
  }

  // Handle interview scheduled notification
  handleInterviewScheduled(data) {
    console.log('📅 Interview scheduled notification:', data);
    // You can add custom logic here, like updating Redux state
  }

  // Handle interview reminder notification
  handleInterviewReminder(data) {
    console.log('⏰ Interview reminder notification:', data);
    // You can add custom logic here, like updating Redux state
  }

  // Handle interview feedback notification
  handleInterviewFeedback(data) {
    console.log('⭐ Interview feedback notification:', data);
    // You can add custom logic here, like updating Redux state
  }

  // Handle interview cancelled notification
  handleInterviewCancelled(data) {
    console.log('❌ Interview cancelled notification:', data);
    // You can add custom logic here, like updating Redux state
  }

  // Navigate to interviews tab
  navigateToInterviews() {
    // This will be implemented when we have navigation context
    console.log('🧭 Navigating to interviews tab');
  }

  // Navigate to feedback screen
  navigateToFeedback(interviewId) {
    // This will be implemented when we have navigation context
    console.log('🧭 Navigating to feedback for interview:', interviewId);
  }

  // Schedule local notification
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null, // null means show immediately
      });
      
      console.log('📅 Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule local notification:', error);
      return null;
    }
  }

  // Schedule interview reminder
  async scheduleInterviewReminder(interviewId, interviewDate, title) {
    const triggerDate = new Date(interviewDate);
    triggerDate.setMinutes(triggerDate.getMinutes() - 30); // 30 minutes before
    
    if (triggerDate > new Date()) {
      return await this.scheduleLocalNotification(
        'Interview Reminder',
        `Your interview for "${title}" is in 30 minutes`,
        {
          type: 'interview_reminder',
          interviewId,
          title,
        },
        { date: triggerDate }
      );
    }
    
    return null;
  }

  // Send interview scheduled notification
  async sendInterviewScheduledNotification(interviewId, title, scheduledDate) {
    return await this.scheduleLocalNotification(
      'New Interview Scheduled',
      `You have a new interview for "${title}" on ${new Date(scheduledDate).toLocaleDateString()}`,
      {
        type: 'interview_scheduled',
        interviewId,
        title,
        scheduledDate,
      }
    );
  }

  // Send interview feedback notification
  async sendInterviewFeedbackNotification(interviewId, title) {
    return await this.scheduleLocalNotification(
      'Interview Feedback Available',
      `Feedback is now available for your interview: "${title}"`,
      {
        type: 'interview_feedback',
        interviewId,
        title,
      }
    );
  }

  // Send interview cancelled notification
  async sendInterviewCancelledNotification(interviewId, title) {
    return await this.scheduleLocalNotification(
      'Interview Cancelled',
      `Your interview for "${title}" has been cancelled`,
      {
        type: 'interview_cancelled',
        interviewId,
        title,
      }
    );
  }

  // Cancel notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ All notifications cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error);
    }
  }

  // Get expo push token
  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export default new NotificationService();
