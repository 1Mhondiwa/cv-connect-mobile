import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Surface, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

// Redux actions
import { fetchNotifications, markNotificationAsRead } from '../../store/slices/notificationSlice';

// Import responsive utilities
import { 
  scale, 
  verticalScale, 
  fontSize, 
  spacing, 
  borderRadius, 
  responsive,
} from '../../utils/responsive';

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchNotifications());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.is_read) {
      await dispatch(markNotificationAsRead(notification.notification_id));
    }

    // Navigate based on notification type
    if (notification.notification_type.includes('interview')) {
      navigation.navigate('Interviews');
    } else if (notification.notification_type.includes('message')) {
      navigation.navigate('Messages');
    }
  };

  const getTimeRemaining = (scheduledDate) => {
    if (!scheduledDate) return '';
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const diffMs = interviewDate - now;
    
    if (diffMs <= 0) {
      return 'Interview has passed';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  const shouldShowAlert = (scheduledDate) => {
    if (!scheduledDate) return false;
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const diffMs = interviewDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= 24 && diffHours > 0; // Show alert if within 24 hours
  };

  const getAlertMessage = (scheduledDate) => {
    if (!scheduledDate) return '';
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const diffMs = interviewDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours <= 1 && diffHours > 0) {
      return '🚨 Interview starting soon!';
    } else if (diffHours <= 24) {
      return '⚠️ Interview within 24 hours';
    }
    
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    if (type.includes('interview')) {
      return 'video';
    } else if (type.includes('message')) {
      return 'message';
    } else if (type.includes('hiring')) {
      return 'briefcase';
    }
    return 'bell';
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Notifications</Text>
          <TouchableOpacity
            style={styles.refreshHeaderButton}
            onPress={onRefresh}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          View and manage all your notifications
        </Text>
      </Surface>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationItem,
                  !notification.is_read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <Card style={styles.notificationCard} elevation={2}>
                  <Card.Content style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons 
                          name={getNotificationIcon(notification.notification_type)} 
                          size={24} 
                          color="#FF6B35" 
                        />
                      </View>
                      <View style={styles.notificationBody}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.is_read && styles.unreadText
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        
                        {/* Interview-specific details */}
                        {notification.notification_type.includes('interview') && notification.data?.scheduled_date && (
                          <View style={styles.interviewDetails}>
                            <Text style={styles.interviewDate}>
                              {formatDate(notification.data.scheduled_date)}
                            </Text>
                            <Text style={styles.countdownText}>
                              {getTimeRemaining(notification.data.scheduled_date)}
                            </Text>
                            {shouldShowAlert(notification.data.scheduled_date) && (
                              <Text style={styles.alertText}>
                                {getAlertMessage(notification.data.scheduled_date)}
                              </Text>
                            )}
                          </View>
                        )}
                        
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.created_at)}
                        </Text>
                      </View>
                      {!notification.is_read && <View style={styles.unreadDot} />}
                    </View>
                  </Card.Content>
                </Card>
                {index < notifications.length - 1 && <Divider style={styles.divider} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: '#666',
  },

  header: {
    backgroundColor: '#FF6B35',
    marginBottom: spacing.md,
    borderBottomLeftRadius: responsive.ifTablet(24, 20),
    borderBottomRightRadius: responsive.ifTablet(24, 20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.lg),
    paddingTop: responsive.ifTablet(70, 60),
    paddingBottom: responsive.ifTablet(spacing.lg, spacing.lg),
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: responsive.ifTablet(fontSize.xxl, fontSize.xl),
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  refreshHeaderButton: {
    padding: spacing.sm,
  },
  headerSubtitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  scrollContainer: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },

  notificationsList: {
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingBottom: responsive.ifTablet(spacing.xxl, spacing.xl),
  },

  notificationItem: {
    marginBottom: spacing.sm,
  },
  unreadNotification: {
    // Additional styling handled by card background
  },

  notificationCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFFFFF',
  },
  notificationContent: {
    padding: spacing.md,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  notificationBody: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  unreadText: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    color: '#666',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },

  interviewDetails: {
    backgroundColor: '#FFF5F2',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  interviewDate: {
    fontSize: fontSize.sm,
    color: '#333',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  countdownText: {
    fontSize: fontSize.sm,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  alertText: {
    fontSize: fontSize.sm,
    color: '#DC2626',
    fontWeight: '700',
    backgroundColor: '#FEF2F2',
    padding: spacing.xs,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  notificationTime: {
    fontSize: fontSize.xs,
    color: '#999',
    marginTop: spacing.xs,
  },

  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#FF6B35',
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
  },

  divider: {
    marginVertical: spacing.xs,
    backgroundColor: '#f0f0f0',
  },
});

export default NotificationsScreen;
