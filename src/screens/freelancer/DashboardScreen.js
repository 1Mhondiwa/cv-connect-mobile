import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, resetLogoutFlag } from '../../store/slices/authSlice';
import { getDashboardData, getProfile } from '../../store/slices/freelancerSlice';
import { tokenService } from '../../services/api';
import {
  Card,
  Button,
  IconButton,
  Surface,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';

  const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { dashboardData, profile, skills, isLoading } = useSelector((state) => state.freelancer);
    const theme = useTheme();



  useEffect(() => {
    loadDashboardData();
  }, []); // Run only once on mount

  // Refresh dashboard data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      // Load dashboard data and profile data
      await Promise.all([
        dispatch(getDashboardData()).unwrap(),
        dispatch(getProfile()).unwrap()
      ]);
    } catch (error) {
      // Error loading dashboard data
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

  const handleForceLogout = () => {
    Alert.alert(
      'Force Logout',
      'This will force logout and clear all stored data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Force Logout', onPress: async () => {
          try {
            // Clear token and force logout
            await tokenService.removeToken();
            dispatch(logout());
            dispatch(resetLogoutFlag());
          } catch (error) {
            // Logout error
          }
        }}
      ]
    );
  };

  const handleViewCV = async () => {
    if (!profile?.cv?.stored_filename) {
      Alert.alert('No CV', 'Please upload your CV first.');
      return;
    }

    try {
      // Debug: Log the CV data
      console.log('Dashboard CV Data:', profile.cv);
      console.log('Stored filename:', profile.cv.stored_filename);
      
      // Construct the full URL to the CV file
              const cvUrl = `http://192.168.101.122:5000/uploads/cvs/${profile.cv.stored_filename}`;
      console.log('Opening CV URL:', cvUrl);
      
      // Show debug info
      Alert.alert(
        'CV URL Debug', 
        `Trying to access: ${cvUrl}\n\nStored filename: ${profile.cv.stored_filename}\nOriginal filename: ${profile.cv.original_filename}`,
        [
          {
            text: 'View in Browser',
            onPress: async () => {
              try {
                const canOpen = await Linking.canOpenURL(cvUrl);
                if (canOpen) {
                  await Linking.openURL(cvUrl);
                } else {
                  Alert.alert('Error', 'Cannot open CV file in browser.');
                }
              } catch (error) {
                console.error('Error opening URL:', error);
                Alert.alert('Error', 'Failed to open URL in browser');
              }
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error opening CV:', error);
      Alert.alert('Error', 'Failed to open CV file');
    }
  };



  const stats = [
    { 
      title: 'Profile Views', 
      value: dashboardData?.profile_views || '0', 
      color: '#FF6B35',
      icon: 'eye'
    },
    { 
      title: 'Messages', 
      value: dashboardData?.unread_messages || '0', 
      color: '#8B4513',
      icon: 'message'
    },
    { 
      title: 'Applications', 
      value: dashboardData?.applications || '0', 
      color: '#FF8C00',
      icon: 'briefcase'
    },
    { 
      title: 'Skills', 
      value: ((profile?.skills?.length || 0) + (profile?.cv_skills?.length || 0)).toString(), 
      color: '#8B4513',
      icon: 'star'
    },
  ];

  const quickActions = [
    { 
      title: 'Edit Profile', 
      icon: 'account-edit', 
      onPress: () => navigation.navigate('Profile'),
      color: '#8B4513'
    },
    { 
      title: 'Search Jobs', 
      icon: 'magnify', 
      onPress: () => Alert.alert('Coming Soon', 'Search feature coming soon!'),
      color: '#FF6B35'
    },
    { 
      title: 'Messages', 
      icon: 'message', 
      onPress: () => navigation.navigate('Messages'),
      color: '#8B4513'
    },
    { 
      title: 'View CV', 
      icon: 'file-document', 
      onPress: handleViewCV,
      color: '#8B4513'
    },
    { 
      title: 'Force Logout', 
      icon: 'logout-variant', 
      onPress: handleForceLogout,
      color: '#EF4444'
    },
  ];

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
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Surface>

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
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Card key={index} style={styles.actionCard} elevation={3}>
              <TouchableOpacity onPress={action.onPress} style={styles.actionTouchable}>
                <Card.Content style={styles.actionContent}>
                  <IconButton
                    icon={action.icon}
                    size={32}
                    iconColor={action.color}
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </Card.Content>
              </TouchableOpacity>
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
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});

export default DashboardScreen; 