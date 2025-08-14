import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { getDashboardData, getProfile, updateAvailability } from '../../store/slices/freelancerSlice';
import socketService from '../../services/socketService';

import { profileAPI } from '../../services/api';

import {
  Card,
  IconButton,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';


  const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { dashboardData, profile, skills, isLoading } = useSelector((state) => state.freelancer);
    
    // Local state for real-time message count
    const [realTimeMessageCount, setRealTimeMessageCount] = useState(0);
    const [messageHandlerId, setMessageHandlerId] = useState(null);
    const [isUpdatingMessages, setIsUpdatingMessages] = useState(false);

  // Log when real-time message count changes
  useEffect(() => {
    console.log('Real-time message count updated:', realTimeMessageCount);
  }, [realTimeMessageCount]);

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();
    
    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(() => {
      updateMessageCount();
    }, 30000); // 30 seconds
    
    return () => {
      // Cleanup message handler and interval when component unmounts
      if (messageHandlerId) {
        socketService.removeMessageHandler(messageHandlerId);
      }
      clearInterval(intervalId);
    };
  }, []); // Run only once on mount

  // Refresh dashboard data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const setupRealTimeUpdates = () => {
    // Connect to WebSocket if not already connected
    if (!socketService.getConnectionStatus()) {
      socketService.connect();
    }

    // Register message handler for real-time updates
    const handlerId = socketService.onMessage((message) => {
      console.log('Real-time message received:', message);
      // Update message count in real-time
      updateMessageCount();
    });

    setMessageHandlerId(handlerId);
  };

  const updateMessageCount = async () => {
    try {
      setIsUpdatingMessages(true);
      console.log('Updating message count...');
      
      // Use Redux action to get latest dashboard data
      const result = await dispatch(getDashboardData()).unwrap();
      console.log('Dashboard data updated:', result);
      
      // The backend returns { success: true, dashboard: { unread_messages: 2 } }
      if (result?.dashboard?.unread_messages !== undefined) {
        setRealTimeMessageCount(result.dashboard.unread_messages);
        console.log('Message count updated to:', result.dashboard.unread_messages);
      } else {
        console.log('No unread_messages in response:', result);
      }
    } catch (error) {
      console.error('Error updating message count:', error);
      Alert.alert('Error', 'Failed to refresh message count. Please try again.');
    } finally {
      setIsUpdatingMessages(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load dashboard data and profile data
      const [dashboardResult, profileResult] = await Promise.all([
        dispatch(getDashboardData()).unwrap(),
        dispatch(getProfile()).unwrap()
      ]);
      
      // Set initial message count using correct nested structure
      if (dashboardResult?.dashboard?.unread_messages !== undefined) {
        setRealTimeMessageCount(dashboardResult.dashboard.unread_messages);
        console.log('Initial message count set to:', dashboardResult.dashboard.unread_messages);
      }
    } catch (error) {
      // Error loading dashboard data
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
          } catch (error) {
            // Logout error
          }
        }}
      ]
    );
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








  const stats = [
    { 
      title: 'Messages', 
      value: realTimeMessageCount.toString(), 
      color: '#8B4513',
      icon: 'message'
    },
    { 
      title: 'Skills', 
      value: ((profile?.skills?.length || 0) + (profile?.cv_skills?.length || 0)).toString(), 
      color: '#FF6B35',
      icon: 'star'
    },
  ];

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
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Surface>

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
          </Card.Content>
        </Card>
      </View>



      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
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
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                
                {/* Add refresh button for messages */}
                {stat.title === 'Messages' && (
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() => {
                      console.log('Refresh button clicked for messages');
                      updateMessageCount();
                    }}
                    activeOpacity={0.7}
                    disabled={isUpdatingMessages}
                  >
                    {isUpdatingMessages ? (
                      <ActivityIndicator size="small" color="#8B4513" />
                    ) : (
                      <MaterialCommunityIcons name="refresh" size={16} color="#8B4513" />
                    )}
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>







      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard} elevation={2}>
          <Card.Content>
            {dashboardData?.recent_activity?.length > 0 ? (
              dashboardData.recent_activity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: '#FF6B35' }]} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity.description}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6B35',
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  headerAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerStatusText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
  },
  actionTouchable: {
    flex: 1,
  },
  cvContainer: {
    padding: 16,
  },
  cvCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cvInfo: {
    alignItems: 'center',
  },
  cvFileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cvFileSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cvButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cvUploadContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cvUploadText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionContent: {
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 8,
    padding: 4,
  },

  activityContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  activityCard: {
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  noActivity: {
    alignItems: 'center',
    padding: 24,
  },
  noActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  availabilityContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  availabilityCard: {
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  availabilityContent: {
    padding: 16,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  availabilityStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  availabilityToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 140,
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  availabilityNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  hiringHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  hiringHistoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
});

export default DashboardScreen; 