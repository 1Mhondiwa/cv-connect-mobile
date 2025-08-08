import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { associateAPI } from '../../services/api';
import { fetchAssociateDashboardStats } from '../../store/slices/associateSlice';

const SavedProfilesScreen = ({ navigation }) => {
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const loadSavedProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await associateAPI.getSavedProfiles();
      console.log('Saved profiles response:', response.data);
      setSavedProfiles(response.data.data || []);
    } catch (error) {
      console.error('Error loading saved profiles:', error);
      Alert.alert('Error', 'Failed to load saved profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedProfiles();
    // Also refresh dashboard stats
    dispatch(fetchAssociateDashboardStats());
    setRefreshing(false);
  };

  useEffect(() => {
    loadSavedProfiles();
    // Also refresh dashboard stats when screen loads
    dispatch(fetchAssociateDashboardStats());
  }, [dispatch]);

  const handleViewProfile = (profile) => {
    navigation.navigate('FreelancerDetail', { freelancer: profile });
  };

  const handleMessageProfile = (profile) => {
    navigation.navigate('Chat', {
      conversationId: profile.conversation_id,
      recipientName: `${profile.first_name} ${profile.last_name}`,
      recipientId: profile.freelancer_id,
    });
  };

  const renderProfileCard = (profile) => (
    <View key={profile.freelancer_id} style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={32} color="#FF6B35" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profile.first_name} {profile.last_name}
          </Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <Text style={styles.profileSkills}>
            {profile.skills?.slice(0, 3).map(skill => 
              typeof skill === 'string' ? skill : skill.skill_name || skill.name
            ).join(', ')}
          </Text>
          
          {/* Availability Status */}
          <View style={styles.availabilityContainer}>
                          <View style={[styles.availabilityDot, profile.availability_status === 'available' ? styles.availableDot : styles.unavailableDot]} />
              <Text style={[styles.availabilityText, profile.availability_status === 'available' ? styles.availableText : styles.unavailableText]}>
                {profile.availability_status === 'available' ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.profileActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewProfile(profile)}
        >
          <MaterialCommunityIcons name="eye" size={16} color="#FF6B35" />
          <Text style={styles.actionText}>View Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => handleMessageProfile(profile)}
        >
          <MaterialCommunityIcons name="message-text" size={16} color="#FFFFFF" />
          <Text style={[styles.actionText, styles.messageText]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading saved profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Profiles</Text>
        <Text style={styles.headerSubtitle}>Your bookmarked freelancer profiles</Text>
      </View>

      {/* Profiles List */}
      <ScrollView
        style={styles.profilesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {savedProfiles.length > 0 ? (
          savedProfiles.map(profile => renderProfileCard(profile))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bookmark-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No saved profiles yet</Text>
            <Text style={styles.emptySubtext}>
              Save freelancer profiles to view them here later
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
  profilesList: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  profileSkills: {
    fontSize: 12,
    color: '#888888',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  messageButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  actionText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  messageText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
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
  // Availability styles
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availableDot: {
    backgroundColor: '#10B981',
  },
  unavailableDot: {
    backgroundColor: '#EF4444',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availableText: {
    color: '#10B981',
  },
  unavailableText: {
    color: '#EF4444',
  },
});

export default SavedProfilesScreen; 