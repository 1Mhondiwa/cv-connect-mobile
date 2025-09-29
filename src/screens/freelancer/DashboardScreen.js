import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import socketService from '../../services/socketService';
import VisitorTrackingService from '../../services/visitorTracking';
import { addNotification, fetchNotifications, markNotificationAsRead } from '../../store/slices/notificationSlice';

import { profileAPI } from '../../services/api';
import { updateAvailability, getProfile } from '../../store/slices/freelancerSlice';
import { logout } from '../../store/slices/authSlice';

import {
  Card,
  IconButton,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import responsive utilities
import { 
  scale, 
  verticalScale, 
  fontSize, 
  spacing, 
  borderRadius, 
  responsive,
  isTablet,
  isSmallDevice,
  isLargeDevice
} from '../../utils/responsive';

// Helper function to get activity color based on status
const getActivityColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#059652'; // Success green
    case 'pending':
      return '#ffc107'; // Warning yellow
    case 'failed':
      return '#df1529'; // Error red
    default:
      return '#FF6B35'; // Default orange
  }
};

const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const { dashboardData, profile, skills, isLoading } = useSelector((state) => state.freelancer);
    const { notifications, unreadCount, isLoading: notificationsLoading } = useSelector((state) => state.notifications);
    // Debug logging for component state
    console.log('🚀 DashboardScreen rendered');
    console.log('🚀 user:', user);
    console.log('🚀 dashboardData:', dashboardData);
    console.log('🚀 profile:', profile);
    
      // Local state for activities
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isRefreshingActivities, setIsRefreshingActivities] = useState(false);
  
  // Local state for hiring data
  const [hiringStats, setHiringStats] = useState(null);
  const [hiringHistory, setHiringHistory] = useState([]);
  const [hiringLoading, setHiringLoading] = useState(false);
  
  // Local state for countdown timer
  const [currentTime, setCurrentTime] = useState(new Date());
    




  useEffect(() => {
    loadDashboardData();
    // Delay fetchActivity to ensure dashboard data is loaded first
    setTimeout(() => {
      fetchActivity();
    }, 1000);
    // Fetch hiring data
    fetchHiringData();
    // Fetch notifications
    fetchNotificationData();
    setupRealTimeUpdates();
    
    return () => {
      // Cleanup message handler when component unmounts
      // Note: WebSocket cleanup is handled by socketService
    };
  }, []); // Run only once on mount

  // Real-time countdown timer for interviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Periodic profile refresh for real-time updates (every 5 minutes)
  useEffect(() => {
    const profileRefreshTimer = setInterval(() => {
      console.log('🔄 Periodic profile refresh for real-time updates...');
      dispatch(getProfile());
    }, 300000); // 5 minutes

    return () => clearInterval(profileRefreshTimer);
  }, [dispatch]);

  // Periodic notifications refresh for real-time updates (every 60 seconds)
  useEffect(() => {
    const notificationsRefreshTimer = setInterval(() => {
      console.log('🔔 Periodic notifications refresh for real-time updates...');
      fetchNotificationData();
    }, 60000); // 60 seconds

    return () => clearInterval(notificationsRefreshTimer);
  }, []);

  // Refresh notifications when screen is focused (similar to interviews screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Dashboard screen focused - refreshing notifications...');
      fetchNotificationData();
    }, [])
  );

  // Refresh dashboard data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 Dashboard screen focused - refreshing all data...');
      loadDashboardData();
      fetchActivity();
      fetchHiringData();
      // Refresh profile data to get latest completed jobs
      dispatch(getProfile());
      // Refresh notifications to get latest interview notifications
      fetchNotificationData();
    });

    return unsubscribe;
  }, [navigation]);

  // Update activities when dashboard data changes (fallback)
  useEffect(() => {
    if (dashboardData?.recent_activity && activities.length === 0) {
      console.log('🔄 Dashboard data updated, syncing activities...');
      console.log('📊 Dashboard activities:', dashboardData.recent_activity);
      setActivities(dashboardData.recent_activity);
    }
  }, [dashboardData?.recent_activity, activities.length]);
  


  // Debug: Log activities state changes
  useEffect(() => {
    console.log('📊 Activities state updated:', activities);
  }, [activities]);







  const setupRealTimeUpdates = () => {
    // Connect to WebSocket if not already connected
    if (!socketService.getConnectionStatus()) {
      socketService.connect();
    }

    // Join user room for notifications
    if (user?.user_id) {
      socketService.joinUserRoom(user.user_id);
    }

    // Register message handler for real-time updates
    const messageHandlerId = socketService.onMessage((message) => {
      console.log('📨 Real-time message received:', message);
      
      // Note: Message count updates are now handled by navigation badge
      // The Redux store will automatically update the unread count
    });

    // Register notification handler for interview notifications
    const notificationHandlerId = socketService.onNotification((notificationData) => {
      console.log('📱 Real-time notification received:', notificationData);
      
      if (notificationData.type === 'interview_notification') {
        // Add the new notification to Redux store
        dispatch(addNotification(notificationData.notification));
        console.log('✅ Added new notification to Redux store');
      }
      
      // Refresh notifications to get the latest from backend
      fetchNotificationData();
      console.log('🔄 Refreshed notifications after real-time update');
    });

    // Store handler IDs for cleanup (you might want to store these in component state)
    return { messageHandlerId, notificationHandlerId };
  };

  const fetchNotificationData = async () => {
    try {
      console.log('📱 Fetching notifications...');
      await dispatch(fetchNotifications({ limit: 20 })).unwrap();
      console.log('📱 Notifications fetched successfully');
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await dispatch(markNotificationAsRead(notification.notification_id)).unwrap();
      }

      // Navigate to the dedicated notifications screen to show all notifications
      console.log('📱 Navigating to Notifications screen from dashboard notification');
      navigation.navigate('Notifications');
    } catch (error) {
      console.error('❌ Failed to handle notification press:', error);
    }
  };

  // Calculate time remaining for interview countdown
  const getTimeRemaining = (scheduledDate) => {
    if (!scheduledDate) return null;
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const timeDiff = interviewDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Interview time has passed';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Check if alert should be shown for interview
  const shouldShowAlert = (scheduledDate) => {
    if (!scheduledDate) return false;
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const timeDiff = interviewDate.getTime() - now.getTime();
    
    // Convert to hours
    const hoursUntilInterview = timeDiff / (1000 * 60 * 60);
    
    // Show alerts only when:
    // - 24 hours or less (but more than 2 hours)
    // - 2 hours or less (but more than 30 minutes)
    // - 30 minutes or less
    return hoursUntilInterview <= 24 && hoursUntilInterview > 0;
  };

  // Get alert message based on time remaining
  const getAlertMessage = (scheduledDate) => {
    if (!scheduledDate) return null;
    
    const now = new Date();
    const interviewDate = new Date(scheduledDate);
    const timeDiff = interviewDate.getTime() - now.getTime();
    
    const hoursUntilInterview = timeDiff / (1000 * 60 * 60);
    const minutesUntilInterview = timeDiff / (1000 * 60);
    
    if (minutesUntilInterview <= 30) {
      return '🚨 Interview starts in 30 minutes or less!';
    } else if (hoursUntilInterview <= 2) {
      return '⏰ Interview reminder: 2 hours or less remaining!';
    } else if (hoursUntilInterview <= 24) {
      return '📅 Interview reminder: Less than 24 hours to go!';
    }
    
    return null;
  };

  

  const loadDashboardData = async () => {
    try {
      // Dashboard data is loaded via Redux store
      // The component will automatically re-render when the store updates
      console.log('✅ Dashboard data loading handled by Redux store');
      
      // Track mobile dashboard visit
      if (user?.user_id) {
        try {
          await VisitorTrackingService.trackDashboard(user.user_id);
          console.log('📱 Mobile dashboard visit tracked');
        } catch (trackingError) {
          console.log('📱 Mobile dashboard tracking error:', trackingError);
        }
      }
    } catch (error) {
      // Error loading dashboard data
      console.error('Error loading dashboard data:', error);
    }
  };



  const fetchActivity = async () => {
    try {
      console.log('🔍 Fetching activities...');
      
      // First try to get activities from the dedicated endpoint
      if (profileAPI && typeof profileAPI.getActivity === 'function') {
        try {
          const response = await profileAPI.getActivity();
          console.log('📡 API Response from /freelancer/activity:', response);
          
          if (response.data.success) {
            console.log('✅ Activities fetched successfully from API');
            setActivities(response.data.activities || []);
            setActivityLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('⚠️ API call failed, using dashboard data fallback');
        }
      }
      
      // Fallback: use activities from dashboard data
      if (dashboardData?.recent_activity) {
        console.log('🔄 Using activities from dashboard data');
        setActivities(dashboardData.recent_activity);
      } else {
        console.log('📭 No activities available');
        setActivities([]);
      }
    } catch (error) {
      console.error('❌ Error in fetchActivity:', error);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const refreshActivities = async () => {
    try {
      setIsRefreshingActivities(true);
      console.log('🔄 Refreshing activities...');
      await fetchActivity();
      console.log('✅ Activities refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing activities:', error);
      // Don't show alert, just log the error
    } finally {
      setIsRefreshingActivities(false);
    }
  };

  const fetchHiringData = async () => {
    try {
      setHiringLoading(true);
      console.log('🔄 Fetching hiring data...');
      
      // Fetch hiring statistics
      const statsResponse = await profileAPI.getHiringStats();
      if (statsResponse.data.success) {
        setHiringStats(statsResponse.data.stats);
        console.log('✅ Hiring stats fetched:', statsResponse.data.stats);
      }
      
      // Fetch hiring history
      const historyResponse = await profileAPI.getHiringHistory();
      if (historyResponse.data.success) {
        setHiringHistory(historyResponse.data.hiring_history);
        console.log('✅ Hiring history fetched:', historyResponse.data.hiring_history);
      }
    } catch (error) {
      console.error('❌ Error fetching hiring data:', error);
    } finally {
      setHiringLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const newStatus = profile?.availability_status === 'available' ? 'unavailable' : 'available';
      
      const result = await dispatch(updateAvailability(newStatus)).unwrap();
      
      if (result.success) {
        // Show success message
        const statusText = newStatus === 'available' ? 'Available for Work' : 'Not Available';
        Alert.alert('Success', `Status updated to: ${statusText}`);
        // Refresh profile data to update the UI
        dispatch(getProfile());
      } else {
        Alert.alert('Error', 'Failed to update availability status');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability status. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => dispatch(logout()) }
      ]
    );
  };








  // Debug logging for stats
  console.log('📊 Building stats array...');
  console.log('📊 profile?.skills?.length:', profile?.skills?.length);
  console.log('📊 profile?.cv_skills?.length:', profile?.cv_skills?.length);
  console.log('📊 profile?.completed_jobs?.length:', profile?.completed_jobs?.length);
  
  const stats = [
    { 
      title: 'Skills', 
      value: ((profile?.skills?.length || 0) + (profile?.cv_skills?.length || 0)).toString(), 
      color: '#FF6B35',
      icon: 'star'
    }
  ];

  // Add Jobs Completed stat if freelancer has completed jobs
  if (profile?.completed_jobs && profile.completed_jobs.length > 0) {
    stats.push({
      title: 'Jobs Completed',
      value: profile.completed_jobs.length.toString(),
      color: '#059652', // Green color matching web
      icon: 'briefcase'
    });
  }
  
  console.log('📊 Final stats array:', stats);

  const quickActions = [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
         <ScrollView 
       style={styles.container}
     >
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.first_name || 'User'}!</Text>
            <View style={styles.headerAvailability}>
              <View style={[
                styles.headerStatusDot, 
                { backgroundColor: profile?.availability_status === 'available' ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={styles.headerStatusText}>
                {profile?.availability_status === 'available' ? 'Available for Work' : 'Not Available'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Interview Notifications Section */}
      {(() => {
        // Filter for dashboard display - hide past interviews but keep recent notifications
        const now = new Date();
        const dashboardNotifications = notifications.filter(notification => {
          // Keep unread notifications
          if (!notification.is_read) return true;
          
          // For interview notifications, filter out past ones ON DASHBOARD ONLY
          if (notification.notification_type.includes('interview') && notification.data?.scheduled_date) {
            const interviewDate = new Date(notification.data.scheduled_date);
            return interviewDate >= now; // Only keep upcoming interviews on dashboard
          }
          
          // Keep other types if they're recent (within last 7 days)
          const notificationDate = new Date(notification.created_at);
          const daysDiff = (now - notificationDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        
        // Sort by urgency: unread first, then by scheduled date for interviews
        const sortedNotifications = dashboardNotifications.sort((a, b) => {
          // Unread notifications first
          if (!a.is_read && b.is_read) return -1;
          if (a.is_read && !b.is_read) return 1;
          
          // For interview notifications, sort by scheduled date (earliest first)
          if (a.data?.scheduled_date && b.data?.scheduled_date) {
            return new Date(a.data.scheduled_date) - new Date(b.data.scheduled_date);
          }
          
          // Fall back to creation date
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        // Get top 2 most urgent notifications for dashboard
        const urgentNotifications = sortedNotifications.slice(0, 2);
        
        return urgentNotifications.length > 0 && (
          <View style={styles.notificationContainer}>
            <Card style={styles.notificationCard} elevation={3}>
              <Card.Content style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <MaterialCommunityIcons name="bell" size={24} color="#FF6B35" />
                  <Text style={styles.notificationTitle}>
                    Urgent Notifications ({urgentNotifications.length})
                  </Text>
                  {notifications.length > 2 && (
                    <TouchableOpacity 
                      style={styles.viewAllButton}
                      onPress={() => navigation.navigate('Notifications')}
                    >
                      <Text style={styles.viewAllText}>View All ({notifications.length})</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {urgentNotifications.map((notification, index) => (
                  <TouchableOpacity
                    key={notification.notification_id}
                    style={[
                      styles.notificationItem,
                      styles.compactNotificationItem,
                      !notification.is_read && styles.unreadNotification
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationContent}>
                      <Text style={[
                        styles.notificationMessage,
                        styles.compactNotificationMessage,
                        !notification.is_read && styles.unreadNotificationText
                      ]}>
                        {notification.title}
                      </Text>
                      {notification.notification_type.includes('interview') && notification.data?.scheduled_date && (
                        <Text style={styles.compactCountdownText}>
                          {getTimeRemaining(notification.data.scheduled_date)}
                        </Text>
                      )}
                      {notification.notification_type === 'interview_reminder' && notification.data?.scheduled_date && shouldShowAlert(notification.data.scheduled_date) && (
                        <Text style={styles.compactAlertText}>
                          {getAlertMessage(notification.data.scheduled_date)}
                        </Text>
                      )}
                    </View>
                    {!notification.is_read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </Card.Content>
            </Card>
          </View>
        );
      })()}

      {/* Availability Status Toggle - Prominent and Easy Access */}
      <View style={styles.availabilityContainer}>
        <Card style={styles.availabilityCard} elevation={3}>
          <Card.Content style={styles.availabilityContent}>
            <View style={styles.availabilityHeader}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={24} 
                color="#FF6B35" 
              />
              <Text style={styles.availabilityTitle}>Availability Status</Text>
            </View>
            
            <View style={styles.availabilityStatus}>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: profile?.availability_status === 'available' ? '#10B981' : '#EF4444' }
                ]} />
                <Text style={styles.statusText}>
                  {profile?.availability_status === 'available' ? 'Available for Work' : 
                   profile?.availability_status === 'unavailable' ? 'Not Available' : 'Loading...'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.availabilityToggleButton,
                  { backgroundColor: profile?.availability_status === 'available' ? '#EF4444' : 
                     profile?.availability_status === 'unavailable' ? '#10B981' : '#6B7280' }
                ]}
                onPress={() => {
                  handleAvailabilityToggle();
                }}
                activeOpacity={0.7}
                disabled={!profile?.availability_status}
              >
                <MaterialCommunityIcons 
                  name={profile?.availability_status === 'available' ? 'close-circle' : 
                        profile?.availability_status === 'unavailable' ? 'check-circle' : 'clock-outline'} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.toggleButtonText}>
                  {profile?.availability_status === 'available' ? 'Set Unavailable' : 
                   profile?.availability_status === 'unavailable' ? 'Set Available' : 'Loading...'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.availabilityNote}>
              Tap the button above to quickly change your availability status
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.availabilityContainer}>
        <Card style={styles.availabilityCard} elevation={3}>
          <Card.Content style={styles.availabilityContent}>
            <View style={styles.availabilityHeader}>
              <MaterialCommunityIcons 
                name="compass-outline" 
                size={24} 
                color="#FF6B35" 
              />
              <Text style={styles.availabilityTitle}>Quick Actions</Text>
            </View>
            
            <Text style={styles.availabilityNote}>
              Access your hiring history and contract documents
            </Text>
            
            {/* Hiring History Button */}
            <TouchableOpacity
              style={styles.hiringHistoryButton}
              onPress={() => navigation.navigate('HiringHistory')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="briefcase-clock" 
                size={20} 
                color="#FF6B35" 
              />
              <Text style={styles.hiringHistoryButtonText}>View Hiring History</Text>
            </TouchableOpacity>

            {/* Contracts Button */}
            <TouchableOpacity
              style={styles.hiringHistoryButton}
              onPress={() => navigation.navigate('Contracts')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="file-document-multiple" 
                size={20} 
                color="#FF6B35" 
              />
              <Text style={styles.hiringHistoryButtonText}>My Contracts</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              console.log('🔄 Manual profile refresh for stats...');
              dispatch(getProfile());
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={16} color="#8B4513" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} style={[styles.statCard, { borderLeftColor: stat.color }]} elevation={2}>
              <Card.Content style={styles.statContent}>
                <IconButton
                  icon={stat.icon}
                  size={24}
                  iconColor={stat.color}
                  style={styles.statIcon}
                />
                                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
                <View style={styles.statTitleRow}>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>



      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshActivities}
            activeOpacity={0.7}
            disabled={isRefreshingActivities}
          >
            {isRefreshingActivities ? (
              <ActivityIndicator size="small" color="#8B4513" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={16} color="#8B4513" />
            )}
          </TouchableOpacity>
        </View>
        <Card style={styles.activityCard} elevation={2}>
          <Card.Content>
            {activityLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.loadingText}>Loading activities...</Text>
              </View>
            ) : activities.length > 0 ? (
              (() => {
                console.log('📊 Rendering activities:', activities);
                return activities.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: getActivityColor(activity.status) }]} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>{activity.activity_type}</Text>
                      <Text style={styles.activityTime}>
                        {new Date(activity.activity_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                      <Text style={[styles.activityStatus, { color: getActivityColor(activity.status) }]}>
                        {activity.status}
                      </Text>
                    </View>
                  </View>
                ));
              })()
            ) : (
              <View style={styles.noActivity}>
                <Text style={styles.noActivityText}>No recent activity</Text>
                <Text style={styles.noSkillsSubtext}>Start by updating your profile or adding skills!</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>


      

      

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerText: {
    flex: 1,
  },
  headerAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  headerStatusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(6),
  },
  headerStatusText: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
  },
  greeting: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.md),
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: responsive.ifTablet(fontSize.xxxl, fontSize.xxl),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  statsContainer: {
    padding: responsive.ifTablet(spacing.lg, spacing.md),
  },
  sectionTitle: {
    fontSize: responsive.ifTablet(fontSize.xxl, fontSize.xl),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: responsive.ifTablet('row', 'column'),
    flexWrap: responsive.ifTablet('wrap', 'nowrap'),
    gap: responsive.ifTablet(spacing.md, spacing.sm),
  },
  statCard: {
    flex: responsive.ifTablet(1, undefined),
    minWidth: responsive.ifTablet('45%', '100%'),
    borderRadius: borderRadius.lg,
    borderLeftWidth: responsive.ifTablet(4, 4),
  },
  statContent: {
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.md, spacing.md),
  },
  statIcon: {
    marginBottom: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  statValue: {
    fontSize: responsive.ifTablet(fontSize.xxxl, fontSize.xxl),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.xs,
  },

  statTitle: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    textAlign: 'center',
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  actionsContainer: {
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingBottom: responsive.ifTablet(spacing.lg, spacing.md),
  },
  actionsGrid: {
    flexDirection: responsive.ifTablet('row', 'column'),
    flexWrap: responsive.ifTablet('wrap', 'nowrap'),
    gap: responsive.ifTablet(spacing.md, spacing.sm),
  },
  actionCard: {
    flex: responsive.ifTablet(1, undefined),
    minWidth: responsive.ifTablet('45%', '100%'),
    borderRadius: borderRadius.lg,
  },
  actionTouchable: {
    flex: 1,
  },
  cvContainer: {
    padding: responsive.ifTablet(spacing.lg, spacing.md),
  },
  cvCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
  },
  cvInfo: {
    alignItems: 'center',
  },
  cvFileName: {
    fontSize: responsive.ifTablet(fontSize.lg, fontSize.md),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  cvFileSize: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#666',
    marginBottom: responsive.ifTablet(spacing.md, spacing.md),
  },
  cvButtonsContainer: {
    flexDirection: responsive.ifTablet('row', 'column'),
    gap: responsive.ifTablet(spacing.md, spacing.sm),
  },
  cvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.ifTablet(spacing.md, spacing.md),
    paddingVertical: responsive.ifTablet(spacing.md, spacing.md),
    borderRadius: responsive.ifTablet(spacing.sm, spacing.sm),
    minWidth: responsive.ifTablet(140, 120),
    justifyContent: 'center',
  },
  viewCVButton: {
    backgroundColor: '#FF6B35',
  },
  uploadCVButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  viewCVButtonText: {
    color: '#FFFFFF',
  },
  uploadCVButtonText: {
    color: '#FF6B35',
  },
  cvButtonText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    marginLeft: 8,
  },
  cvUploadContainer: {
    alignItems: 'center',
    paddingVertical: responsive.ifTablet(spacing.xl, spacing.lg),
  },
  cvUploadText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.md),
    color: '#666',
    marginTop: responsive.ifTablet(spacing.md, spacing.sm),
    marginBottom: responsive.ifTablet(spacing.md, spacing.md),
    textAlign: 'center',
  },
  actionContent: {
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.xl, spacing.lg),
  },
  actionIcon: {
    marginBottom: responsive.ifTablet(spacing.md, spacing.md),
  },
  actionTitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },


  activityContainer: {
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingBottom: responsive.ifTablet(spacing.xxl, spacing.xxl),
  },
  activityCard: {
    borderRadius: borderRadius.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.ifTablet(spacing.md, spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: responsive.ifTablet(spacing.md, spacing.md),
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.xs, spacing.xs),
  },
  activityTime: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    marginBottom: responsive.ifTablet(spacing.xs, spacing.xs),
  },
  activityStatus: {
    fontSize: responsive.ifTablet(fontSize.xs, fontSize.xs),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noActivity: {
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.xxl, spacing.xxl),
  },
  noActivityText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.md),
    fontWeight: '600',
    color: '#666',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  noActivitySubtext: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.xxl, spacing.xxl),
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: '#666',
  },
  availabilityContainer: {
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingBottom: responsive.ifTablet(spacing.md, spacing.md),
  },
  availabilityCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: responsive.ifTablet(4, 4),
    borderLeftColor: '#FF6B35',
  },
  availabilityContent: {
    padding: responsive.ifTablet(spacing.md, spacing.md),
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.ifTablet(spacing.md, spacing.md),
  },
  availabilityTitle: {
    fontSize: responsive.ifTablet(fontSize.lg, fontSize.md),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  availabilityStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.ifTablet(spacing.md, spacing.md),
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  statusText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.md),
    fontWeight: '600',
    color: '#333',
  },
  availabilityToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.ifTablet(spacing.md, spacing.md),
    paddingHorizontal: responsive.ifTablet(spacing.md, spacing.md),
    borderRadius: responsive.ifTablet(24, 20),
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: responsive.ifTablet(160, 140),
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    marginLeft: responsive.ifTablet(spacing.sm, scale(6)),
  },
  availabilityNote: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    textAlign: 'center',
    marginTop: responsive.ifTablet(spacing.sm, spacing.sm),
    fontStyle: 'italic',
  },
  hiringHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F2',
    paddingVertical: responsive.ifTablet(spacing.md, spacing.md),
    paddingHorizontal: responsive.ifTablet(spacing.md, spacing.md),
    borderRadius: responsive.ifTablet(spacing.sm, spacing.sm),
    marginTop: responsive.ifTablet(spacing.md, spacing.md),
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  hiringHistoryButtonText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: responsive.ifTablet(spacing.sm, spacing.sm),
  },

  // Notification styles
  notificationContainer: {
    marginHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    marginVertical: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  notificationCard: {
    backgroundColor: '#FFF9F7',
    borderRadius: responsive.ifTablet(spacing.md, spacing.sm),
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  notificationContent: {
    padding: responsive.ifTablet(spacing.md, spacing.sm),
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  notificationTitle: {
    fontSize: responsive.ifTablet(fontSize.lg, fontSize.md),
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: responsive.ifTablet(spacing.sm, spacing.sm),
    flex: 1,
  },
  viewAllButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: responsive.ifTablet(spacing.sm, spacing.xs),
    paddingVertical: responsive.ifTablet(spacing.xs, scale(2)),
    borderRadius: responsive.ifTablet(spacing.sm, scale(4)),
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.ifTablet(spacing.sm, spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  unreadNotification: {
    backgroundColor: '#FFF0E6',
    borderRadius: responsive.ifTablet(spacing.sm, spacing.sm),
    marginVertical: responsive.ifTablet(spacing.xs, spacing.xs),
  },
  notificationMessage: {
    flex: 1,
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.xs, scale(2)),
    fontWeight: '600',
  },
  notificationSubMessage: {
    flex: 1,
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    marginBottom: responsive.ifTablet(spacing.xs, scale(2)),
    fontStyle: 'italic',
  },
  countdownText: {
    flex: 1,
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#FF6B35',
    marginBottom: responsive.ifTablet(spacing.xs, scale(2)),
    fontWeight: '600',
  },
  interviewDate: {
    flex: 1,
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.xs, scale(2)),
    fontWeight: '500',
  },
  alertText: {
    flex: 1,
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#DC2626',
    marginBottom: responsive.ifTablet(spacing.xs, scale(2)),
    fontWeight: '700',
    backgroundColor: '#FEF2F2',
    padding: responsive.ifTablet(spacing.xs, scale(4)),
    borderRadius: responsive.ifTablet(spacing.xs, scale(4)),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unreadNotificationText: {
    fontWeight: '600',
    color: '#FF6B35',
  },
  notificationTime: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
  },
  unreadDot: {
    width: responsive.ifTablet(scale(8), scale(6)),
    height: responsive.ifTablet(scale(8), scale(6)),
    borderRadius: responsive.ifTablet(scale(4), scale(3)),
    backgroundColor: '#FF6B35',
    marginLeft: responsive.ifTablet(spacing.sm, spacing.sm),
  },
  
  // Compact notification styles
  compactNotificationItem: {
    paddingVertical: responsive.ifTablet(spacing.sm, scale(6)),
    marginVertical: responsive.ifTablet(spacing.xs, scale(2)),
  },
  compactNotificationMessage: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    marginBottom: responsive.ifTablet(scale(2), scale(1)),
    lineHeight: responsive.ifTablet(20, 16),
  },
  compactCountdownText: {
    fontSize: responsive.ifTablet(fontSize.xs, scale(10)),
    color: '#FF6B35',
    fontWeight: '600',
  },
  compactAlertText: {
    fontSize: responsive.ifTablet(fontSize.xs, scale(10)),
    color: '#DC2626',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: responsive.ifTablet(scale(4), scale(2)),
    borderRadius: responsive.ifTablet(scale(4), scale(2)),
    marginTop: responsive.ifTablet(scale(2), scale(1)),
  },

});

export default DashboardScreen; 