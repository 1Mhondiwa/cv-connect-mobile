import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface, useTheme, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { createConversation } from '../../store/slices/messageSlice';

const SearchScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [associateId, setAssociateId] = useState('');

  const handleStartConversation = async () => {
    if (!associateId.trim()) {
      Alert.alert('Error', 'Please enter an Associate ID');
      return;
    }

    try {
      const result = await dispatch(createConversation(associateId.trim())).unwrap();
      Alert.alert(
        'Success', 
        'Conversation created! Check your Messages tab to start chatting.',
        [
          {
            text: 'Go to Messages',
            onPress: () => navigation.navigate('Messages')
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      setAssociateId('');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create conversation');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="magnify"
            size={60}
            iconColor={theme.colors.primary}
            style={styles.searchIcon}
          />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Find Jobs
            </Text>
            <Text variant="bodyMedium" style={styles.subtitleText}>
              Search and discover opportunities
            </Text>
          </View>
        </View>
      </Surface>

      {/* Test Conversation Card */}
      <Card style={styles.testCard} elevation={4}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.cardTitle}>
            Test Real-Time Messaging
          </Text>
          
          <Text variant="bodyMedium" style={styles.cardDescription}>
            Start a conversation with an associate to test the real-time messaging feature.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="Associate ID"
              value={associateId}
              onChangeText={setAssociateId}
              placeholder="Enter Associate ID (e.g., 1)"
              style={styles.textInput}
              keyboardType="numeric"
              outlineColor="#E0E0E0"
              activeOutlineColor="#FF6B35"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleStartConversation}
            style={styles.startConversationButton}
            contentStyle={styles.buttonContent}
            icon="message-plus"
            disabled={!associateId.trim()}
          >
            Start Conversation
          </Button>

          <Text variant="bodySmall" style={styles.noteText}>
            Note: You need to have an associate account with the specified ID in the database.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} elevation={4}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.cardTitle}>
            Coming Soon!
          </Text>
          
          <Text variant="bodyMedium" style={styles.cardDescription}>
            Job search features are being developed. You'll be able to:
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium">Search jobs by keywords</Text>
            </View>
            <View style={styles.featureItem}>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium">Filter by skills and location</Text>
            </View>
            <View style={styles.featureItem}>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium">View job details and requirements</Text>
            </View>
            <View style={styles.featureItem}>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium">Apply to jobs directly</Text>
            </View>
            <View style={styles.featureItem}>
              <IconButton
                icon="check-circle"
                size={20}
                iconColor={theme.colors.primary}
              />
              <Text variant="bodyMedium">Save favorite jobs</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Dashboard')}
            style={styles.backButton}
            contentStyle={styles.backButtonContent}
            icon="arrow-left"
          >
            Back to Dashboard
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
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
  testCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  cardDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  startConversationButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },
  noteText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  featuresList: {
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
  },
  backButtonContent: {
    height: 48,
  },
});

export default SearchScreen; 