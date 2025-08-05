import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchConversations } from '../../store/slices/messageSlice';

const AssociateMessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { conversations, isLoading } = useSelector((state) => state.messages);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      await dispatch(fetchConversations()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load conversations');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      freelancerName: conversation.freelancer_name,
      freelancerId: conversation.freelancer_id,
    });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = (conversation) => {
    const hasUnread = conversation.unread_count > 0;
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => handleConversationPress(conversation)}
      >
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={32} color="#FF6B35" />
          {hasUnread && <View style={styles.unreadBadge} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.freelancerName, hasUnread && styles.unreadName]}>
              {conversation.freelancer_name}
            </Text>
            <Text style={styles.lastMessageTime}>
              {formatLastMessageTime(conversation.last_message_time)}
            </Text>
          </View>
          
          <Text style={[styles.lastMessage, hasUnread && styles.unreadMessage]} numberOfLines={2}>
            {conversation.last_message || 'No messages yet'}
          </Text>
          
          {hasUnread && (
            <View style={styles.unreadIndicator}>
              <Text style={styles.unreadCount}>{conversation.unread_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Your conversations with freelancers</Text>
      </View>

      {/* Messages List */}
      <ScrollView
        style={styles.conversationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {conversations.length > 0 ? (
          conversations.map(conversation => renderConversationItem(conversation))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-text-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start messaging freelancers to begin conversations
            </Text>
            <TouchableOpacity
              style={styles.startSearchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
              <Text style={styles.startSearchText}>Find Freelancers</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  unreadConversation: {
    backgroundColor: '#FFF8F0',
  },
  avatar: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  unreadName: {
    fontWeight: 'bold',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#666666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  unreadMessage: {
    color: '#333333',
    fontWeight: '500',
  },
  unreadIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  startSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  startSearchText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AssociateMessagesScreen; 