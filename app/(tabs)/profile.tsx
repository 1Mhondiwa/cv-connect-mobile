import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Skill {
  skill_name: string;
}
interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  skills: Skill[];
}

export default function FreelancerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      fetch('http://10.254.121.136:5000/api/freelancer/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setProfile(data.profile);
          else Alert.alert('Error', data.message || 'Failed to load profile');
        })
        .catch(() => Alert.alert('Error', 'Could not connect to server.'))
        .finally(() => setLoading(false));
    };
    fetchProfile();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!profile) return <View style={styles.center}><Text>No profile data.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name: {profile.first_name} {profile.last_name}</Text>
      <Text style={styles.label}>Email: {profile.email}</Text>
      <Text style={styles.label}>Phone: {profile.phone}</Text>
      <Text style={styles.label}>Skills:</Text>
      {profile.skills && profile.skills.length > 0 ? (
        profile.skills.map((skill: Skill, idx: number) => (
          <Text key={idx} style={styles.skill}>{skill.skill_name}</Text>
        ))
      ) : (
        <Text style={styles.skill}>No skills listed.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#462918' },
  label: { fontSize: 18, marginBottom: 8, color: '#444' },
  skill: { fontSize: 16, marginLeft: 12, color: '#fd680e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
}); 