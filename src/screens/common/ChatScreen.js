import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, IconButton, Surface, useTheme, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, markConversationAsRead, addMessage, setTypingUser } from '../../store/slices/messageSlice';
import socketService from '../../services/socketService';
import { tokenService } from '../../services/api';

const ChatScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { conversationId, recipientName, recipientId } = route.params;
  
  console.log('ChatScreen received params:', { conversationId, recipientName, recipientId });
  const { messages, isLoading, error, typingUsers } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const flatListRef = useRef(null);
  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    // Validate conversationId
    if (!conversationId) {
      console.error('No conversationId provided to ChatScreen');
      Alert.alert('Error', 'Invalid conversation. Please try again.');
      navigation.goBack();
      return;
    }

    // Set up navigation title
    navigation.setOptions({
      title: recipientName || 'Chat',
      headerTitleStyle: { color: '#FF6B35' },
    });

    // Join conversation room
    socketService.joinConversation(conversationId);

    // Set up message handler for this conversation
    const messageHandlerId = socketService.onMessage((message) => {
      if (message.conversation_id === conversationId) {
        dispatch(addMessage({
          conversationId: message.conversation_id,
          message: message
        }));
        // Mark as read if we're the recipient
        if (message.sender_id !== user?.user_id) {
          dispatch(markConversationAsRead(conversationId));
        }
      }
    });

    // Set up typing handler
    const typingHandlerId = socketService.onTyping((data) => {
      if (data.conversation_id === conversationId) {
        dispatch(setTypingUser({
          conversationId: conversationId,
          userId: data.user_id,
          typing: data.typing
        }));
      }
    });

    // Load messages
    loadMessages();

    // Mark conversation as read
    dispatch(markConversationAsRead(conversationId));

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.removeMessageHandler(messageHandlerId);
      socketService.removeTypingHandler(typingHandlerId);
      // Clear typing indicator when leaving
      if (user?.user_id) {
        socketService.sendTypingIndicator(conversationId, user.user_id, false);
      }
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages for conversationId:', conversationId);
      await dispatch(fetchMessages({ conversationId, params: { limit: 50 } })).unwrap();
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      // Clear typing indicator
      if (user?.user_id) {
        socketService.sendTypingIndicator(conversationId, user.user_id, false);
      }

      // Send message via API
      await dispatch(sendMessage({ conversationId, content: messageText.trim() })).unwrap();
      
      // Clear input
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);
    
    // Send typing indicator
    if (user?.user_id) {
      socketService.sendTypingIndicator(conversationId, user.user_id, true);
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        socketService.sendTypingIndicator(conversationId, user.user_id, false);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message) => {
    return message.sender_id === user?.user_id;
  };

  const renderMessage = ({ item: message }) => {
    const ownMessage = isOwnMessage(message);
    const messageTime = formatTime(message.sent_at);

    return (
      <View style={[styles.messageContainer, ownMessage && styles.ownMessageContainer]}>
        <View style={[styles.messageBubble, ownMessage ? styles.ownMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, ownMessage && styles.ownMessageText]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, ownMessage && styles.ownMessageTime]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    const typingUsersInConversation = typingUsers[conversationId] || new Set();
    const otherUsersTyping = Array.from(typingUsersInConversation).filter(id => id !== user?.user_id);
    
    if (otherUsersTyping.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {recipientName} is typing...
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Start the conversation!</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted={false}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderTypingIndicator}
        ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
      />

      <Surface style={styles.inputContainer} elevation={4}>
        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            value={messageText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            style={styles.textInput}
            multiline
            maxLength={1000}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            disabled={isSending}
          />
          <IconButton
            icon={isSending ? "loading" : "send"}
            size={24}
            iconColor={messageText.trim() && !isSending ? "#FF6B35" : "#999"}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            style={styles.sendButton}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    elevation: 1,
  },
  ownMessageBubble: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageSeparator: {
    height: 8,
  },
  typingContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  typingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  sendButton: {
    margin: 0,
  },
});

export default ChatScreen; 