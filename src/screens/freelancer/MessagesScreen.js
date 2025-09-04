import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Surface, useTheme, Avatar, Divider, Badge } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, fetchUnreadCount } from '../../store/slices/messageSlice';
import socketService from '../../services/socketService';
import { setSocketConnected, addMessage } from '../../store/slices/messageSlice';

const MessagesScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { conversations, isLoading, error, unreadCount, socketConnected } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();
    
    // Set up message handler
    const messageHandlerId = socketService.onMessage((message) => {
      dispatch(addMessage({
        conversationId: message.conversation_id,
        message: message
      }));
    });

    // Fetch conversations and unread count
    loadData();

    return () => {
      socketService.removeMessageHandler(messageHandlerId);
    };
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchConversations()).unwrap(),
        dispatch(fetchUnreadCount()).unwrap()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  const renderConversation = ({ item }) => {
    const isUnread = item.unread_count > 0;
    const lastMessageTime = formatTime(item.last_message_time);
    const truncatedMessage = truncateMessage(item.last_message);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.conversation_id,
          recipientName: item.freelancer_name || item.associate_name,
          recipientId: item.freelancer_id || item.associate_id
        })}
        style={styles.conversationItem}
      >
        <View style={styles.conversationContent}>
          <Avatar.Text 
            size={50} 
            label={(item.freelancer_name || item.associate_name || 'U').substring(0, 2).toUpperCase()}
            style={[styles.avatar, isUnread && styles.unreadAvatar]}
          />
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text variant="titleMedium" style={[styles.name, isUnread && styles.unreadName]}>
                {item.freelancer_name || item.associate_name || 'Unknown User'}
              </Text>
              <Text variant="bodySmall" style={styles.time}>
                {lastMessageTime}
              </Text>
            </View>
                         <View style={styles.messagePreview}>
               <Text 
                 variant="bodyMedium" 
                 style={[styles.lastMessage, isUnread && styles.unreadMessage]}
                 numberOfLines={1}
               >
                 {truncatedMessage || 'Tap to respond to message'}
               </Text>
               {isUnread && (
                 <Badge style={styles.badge} size={20}>
                   {item.unread_count}
                 </Badge>
               )}
             </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyCard} elevation={4}>
      <Card.Content style={styles.emptyCardContent}>
        <IconButton
          icon="message-text-outline"
          size={60}
          iconColor={theme.colors.primary}
          style={styles.emptyIcon}
        />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Messages Yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptyDescription}>
          You can only respond to conversations that employers and clients start with you. Check back later for new messages.
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="message-text"
            size={60}
            iconColor={theme.colors.primary}
            style={styles.messageIcon}
          />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Messages
            </Text>
                         <Text variant="bodyMedium" style={styles.subtitleText}>
               {conversations.length > 0 
                 ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
                 : 'You can only respond to messages from employers and clients'
               }
             </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadIndicator}>
                <Badge style={styles.headerBadge} size={16}>
                  {unreadCount}
                </Badge>
                <Text variant="bodySmall" style={styles.unreadText}>
                  unread message{unreadCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Surface>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.conversation_id.toString()}
          style={styles.conversationList}
          contentContainerStyle={styles.conversationListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <Divider style={styles.separator} />}
        />
      ) : (
        <ScrollView 
          style={styles.emptyContainer} 
          contentContainerStyle={styles.emptyContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 50,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitleText: {
    color: '#666',
  },
  unreadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerBadge: {
    backgroundColor: '#FF6B35',
    marginRight: 8,
  },
  unreadText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  conversationList: {
    flex: 1,
  },
  conversationListContent: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 4,
    elevation: 2,
  },
  conversationContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  unreadAvatar: {
    backgroundColor: '#FF6B35',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: '600',
    color: '#333',
  },
  unreadName: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  time: {
    color: '#999',
    fontSize: 12,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    color: '#666',
    marginRight: 8,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#FF6B35',
  },
  separator: {
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emptyCardContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 50,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },

});

export default MessagesScreen; 