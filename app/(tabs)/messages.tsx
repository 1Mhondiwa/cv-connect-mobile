import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Conversation {
  conversation_id: number;
  associate_name?: string;
  associate_email?: string;
  last_message?: string;
  unread_count: number;
}

export default function FreelancerMessages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      fetch('http://10.254.121.136:5000/api/message/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setConversations(data.conversations || []);
          else Alert.alert('Error', data.message || 'Failed to load messages');
        })
        .catch(() => Alert.alert('Error', 'Could not connect to server.'))
        .finally(() => setLoading(false));
    };
    fetchMessages();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item: Conversation) => item.conversation_id?.toString() || Math.random().toString()}
        renderItem={({ item }: { item: Conversation }) => (
          <View style={styles.messageCard}>
            <Text style={styles.label}>Associate: {item.associate_name || item.associate_email}</Text>
            <Text style={styles.label}>Last Message: {item.last_message || 'No messages yet.'}</Text>
            <Text style={styles.unread}>Unread: {item.unread_count}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.label}>No conversations found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#462918' },
  label: { fontSize: 16, marginBottom: 4, color: '#444' },
  unread: { fontSize: 14, color: '#fd680e', fontWeight: 'bold' },
  messageCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
}); 