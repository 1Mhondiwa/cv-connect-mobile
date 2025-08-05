import React, { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { getAdminStats } from '../../store/slices/adminSlice';

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, isLoading } = useSelector((state) => state.admin);

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

  // Load admin stats on component mount
  useEffect(() => {
    dispatch(getAdminStats());
  }, [dispatch]);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(getAdminStats());
    }, [dispatch])
  );

  const statsData = [
    { 
      title: 'Total Freelancers', 
      value: stats?.users?.freelancer || '0', 
      color: '#8B4513' 
    },
    { 
      title: 'Total Associates', 
      value: stats?.users?.associate || '0', 
      color: '#FF8C00' 
    },
    { 
      title: 'Total CVs', 
      value: stats?.total_cvs || '0', 
      color: '#10B981' 
    },
    { 
      title: 'Total Messages', 
      value: stats?.total_messages || '0', 
      color: '#1976D2' 
    },
  ];

  const quickActions = [
    { title: 'Manage Users', icon: '👥', onPress: () => navigation.navigate('Users') },
    { title: 'Add Associate', icon: '➕', onPress: () => navigation.navigate('Profile') },
    { title: 'System Stats', icon: '📊', onPress: () => dispatch(getAdminStats()) },
    { title: 'Profile Settings', icon: '⚙️', onPress: () => navigation.navigate('Profile') },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: `Total Freelancers: ${stats?.users?.freelancer || 0}`,
      time: 'Live',
      severity: 'info',
    },
    {
      id: 2,
      type: 'user_registration',
      message: `Total Associates: ${stats?.users?.associate || 0}`,
      time: 'Live',
      severity: 'info',
    },
    {
      id: 3,
      type: 'system_alert',
      message: `Total CVs Uploaded: ${stats?.total_cvs || 0}`,
      time: 'Live',
      severity: 'success',
    },
    {
      id: 4,
      type: 'payment',
      message: `Total Messages: ${stats?.total_messages || 0}`,
      time: 'Live',
      severity: 'info',
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#D32F2F';
      case 'warning': return '#FF8C00';
      case 'success': return '#388E3C';
      default: return '#1976D2';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.firstName || 'Admin'}!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* System Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Server Status</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
            <Text style={styles.statusValue}>CPU: 45% | RAM: 62%</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Database</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>Healthy</Text>
              </View>
            </View>
            <Text style={styles.statusValue}>Connections: 24/50</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>API Status</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.statusValue}>Response: 120ms avg</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Security</Text>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Secure</Text>
              </View>
            </View>
            <Text style={styles.statusValue}>Last scan: 2h ago</Text>
          </View>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.activityContainer}>
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllActivities')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityList}>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>
                  {getSeverityIcon(activity.severity)}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <View style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(activity.severity) }
              ]} />
            </View>
          ))}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>156</Text>
            <Text style={styles.quickStatLabel}>New Users (Today)</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>23</Text>
            <Text style={styles.quickStatLabel}>New Jobs (Today)</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>$2,450</Text>
            <Text style={styles.quickStatLabel}>Revenue (Today)</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>98.5%</Text>
            <Text style={styles.quickStatLabel}>Uptime</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#8B4513',
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
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#4A4A4A',
  },
  statusValue: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  activityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
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
  severityIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  quickStatsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#4A4A4A',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen; 