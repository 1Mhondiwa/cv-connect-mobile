import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { logout } from '../../store/slices/authSlice';
import { fetchAssociateDashboardStats } from '../../store/slices/associateSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AssociateDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardStats, isLoading } = useSelector((state) => state.associate);

  // Load dashboard stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAssociateDashboardStats());
    }, [dispatch])
  );

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

  const handleRefresh = () => {
    dispatch(fetchAssociateDashboardStats());
  };

  const statsData = [
    { 
      title: 'Total Freelancers', 
      value: (dashboardStats?.total_freelancers || 0).toString(), 
      color: '#8B4513',
      icon: 'account-group'
    },
    { 
      title: 'Conversations', 
      value: (dashboardStats?.total_conversations || 0).toString(), 
      color: '#FF8C00',
      icon: 'message-text'
    },
    { 
      title: 'Unread Messages', 
      value: (dashboardStats?.unread_messages || 0).toString(), 
      color: '#10B981',
      icon: 'message-badge'
    },
    { 
      title: 'Saved Profiles', 
      value: (dashboardStats?.saved_profiles || 0).toString(), 
      color: '#1976D2',
      icon: 'bookmark'
    },
  ];

  const quickActions = [
    { 
      title: 'Find Freelancers', 
      icon: 'magnify', 
      onPress: () => navigation.navigate('Search'),
      description: 'Search and filter freelancers'
    },
    { 
      title: 'View Messages', 
      icon: 'message-text', 
      onPress: () => navigation.navigate('Messages'),
      description: 'Check your conversations'
    },
    { 
      title: 'Saved Profiles', 
      icon: 'bookmark', 
      onPress: () => navigation.navigate('Saved'),
      description: 'View saved freelancer profiles'
    },
    { 
      title: 'Profile Settings', 
      icon: 'account-cog', 
      onPress: () => navigation.navigate('Profile'),
      description: 'Manage your profile'
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.contact_person || 'Associate'}!</Text>
          <Text style={styles.company}>{user?.industry || 'Company'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <View style={styles.statHeader}>
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <MaterialCommunityIcons name={action.icon} size={32} color="#FF6B35" />
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading activity...</Text>
            </View>
          ) : (dashboardStats?.recent_activity || []).length > 0 ? (
            (dashboardStats?.recent_activity || []).map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <MaterialCommunityIcons 
                  name={activity.last_message ? "message-text" : "account-search"} 
                  size={20} 
                  color={activity.last_message ? "#10B981" : "#FF6B35"} 
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    {activity.last_message 
                      ? `Conversation with ${activity.first_name} ${activity.last_name}`
                      : `Started conversation with ${activity.first_name} ${activity.last_name}`
                    }
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.last_message_time || activity.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clock-outline" size={40} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Start conversations with freelancers to see activity here</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FF6B35',
  },
  greeting: {
    fontSize: 16,
    color: '#F5F5DC',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  company: {
    fontSize: 14,
    color: '#F5F5DC',
    marginTop: 2,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statTitle: {
    fontSize: 12,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  activityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AssociateDashboardScreen; 