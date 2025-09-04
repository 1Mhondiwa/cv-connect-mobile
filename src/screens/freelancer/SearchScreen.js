import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Surface, useTheme, TextInput, Avatar, Divider, Badge } from 'react-native-paper';


import { searchAPI } from '../../services/api';

const SearchScreen = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [associates, setAssociates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchAssociates();
    } else {
      setAssociates([]);
    }
  }, [searchQuery]);

  const searchAssociates = async () => {
    try {
      setIsLoading(true);
      const response = await searchAPI.searchAssociates({
        keyword: searchQuery.trim(),
        limit: 20
      });
      
      if (response.data.success) {
        setAssociates(response.data.associates || []);
      } else {
        setAssociates([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setAssociates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (searchQuery.trim()) {
      await searchAssociates();
    }
    setRefreshing(false);
  };

  const handleStartConversation = async (associateId) => {
    // Freelancers cannot start conversations - they can only respond
    Alert.alert(
      'Cannot Start Conversation',
      'Freelancers can only respond to conversations that employers and clients start with them.',
      [{ text: 'OK' }]
    );
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

      {/* Search Input */}
      <Card style={styles.searchCard} elevation={4}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.cardTitle}>
            View Associates (Read Only)
          </Text>
          
          <Text variant="bodyMedium" style={styles.cardDescription}>
            Search for associates and employers (view only - you cannot start conversations).
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="Search Associates"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, company, industry, or email"
              style={styles.textInput}
              outlineColor="#E0E0E0"
              activeOutlineColor="#FF6B35"
              left={<TextInput.Icon icon="magnify" />}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Search Results */}
      {searchQuery.trim() && (
        <Card style={styles.resultsCard} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.resultsTitle}>
              Search Results ({associates.length})
            </Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text>Searching...</Text>
              </View>
            ) : associates.length > 0 ? (
              <FlatList
                data={associates}
                keyExtractor={(item) => item.associate_id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.associateItem}>
                    <View style={styles.associateInfo}>
                      <Avatar.Text 
                        size={40} 
                        label={(item.contact_person || 'A').substring(0, 2).toUpperCase()}
                        style={styles.avatar}
                      />
                      <View style={styles.associateDetails}>
                        <Text variant="titleMedium" style={styles.associateName}>
                          {item.contact_person || 'Unknown'}
                        </Text>
                        <Text variant="bodySmall" style={styles.companyName}>
                          {item.company_name || 'No company'}
                        </Text>
                        <Text variant="bodySmall" style={styles.industry}>
                          {item.industry || 'No industry'}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => handleStartConversation(item.associate_id)}
                      style={styles.messageButton}
                      icon="eye"
                      compact
                      disabled={true}
                    >
                      View Only
                    </Button>
                  </View>
                )}
                ItemSeparatorComponent={() => <Divider style={styles.separator} />}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            ) : (
              <View style={styles.noResults}>
                <Text variant="bodyMedium" style={styles.noResultsText}>
                  No associates found. Try a different search term.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

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
  searchCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  resultsCard: {
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
  resultsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  associateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  associateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#FF6B35',
  },
  associateDetails: {
    flex: 1,
  },
  associateName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    color: '#666',
    marginBottom: 2,
  },
  industry: {
    color: '#888',
    fontSize: 12,
  },
  messageButton: {
    backgroundColor: '#FF6B35',
  },
  separator: {
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    textAlign: 'center',
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