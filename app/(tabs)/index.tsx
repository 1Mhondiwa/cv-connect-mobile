import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DashboardData {
  profile_completion: number;
  total_applications: number;
  pending_applications: number;
  accepted_applications: number;
  rejected_applications: number;
  total_conversations: number;
  unread_messages: number;
  recent_jobs_matching: number;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      fetch('http://10.254.121.136:5000/api/freelancer/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setDashboard(data.dashboard);
          else Alert.alert('Error', data.message || 'Failed to load dashboard');
        })
        .catch(() => Alert.alert('Error', 'Could not connect to server.'))
        .finally(() => setLoading(false));
    };
    fetchDashboard();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!dashboard) return <View style={styles.center}><Text>No dashboard data.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.label}>Profile Completion: {dashboard.profile_completion}%</Text>
      <Text style={styles.label}>Total Applications: {dashboard.total_applications}</Text>
      <Text style={styles.label}>Pending Applications: {dashboard.pending_applications}</Text>
      <Text style={styles.label}>Accepted Applications: {dashboard.accepted_applications}</Text>
      <Text style={styles.label}>Rejected Applications: {dashboard.rejected_applications}</Text>
      <Text style={styles.label}>Total Conversations: {dashboard.total_conversations}</Text>
      <Text style={styles.label}>Unread Messages: {dashboard.unread_messages}</Text>
      <Text style={styles.label}>Recent Jobs Matching: {dashboard.recent_jobs_matching}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#462918' },
  label: { fontSize: 18, marginBottom: 8, color: '#444' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
