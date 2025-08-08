import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchAPI, messageAPI } from '../../services/api';

const AssociateSearchScreen = ({ navigation }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'

  useEffect(() => {
    loadFreelancers();
  }, [searchQuery, selectedSkills]);

  const loadFreelancers = async () => {
    try {
      setIsLoading(true);
      const response = await searchAPI.searchFreelancers({
        keyword: searchQuery || undefined,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
        limit: 50
      });
      console.log('Search response:', response.data);
      console.log('Freelancers data structure:', response.data.freelancers);
      setFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error('Error loading freelancers:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load freelancers';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFreelancers();
    setRefreshing(false);
  };

  // Filter freelancers by availability status
  const filteredFreelancers = freelancers.filter(freelancer => {
    if (availabilityFilter === 'all') return true;
    if (availabilityFilter === 'available') return freelancer.availability_status === 'available';
    if (availabilityFilter === 'unavailable') return freelancer.availability_status !== 'available';
    return true;
  });

  const handleViewProfile = (freelancer) => {
    navigation.navigate('FreelancerDetail', { freelancer });
  };

  const handleMessageFreelancer = async (freelancer) => {
    try {
      console.log('Creating conversation with freelancer:', freelancer);
      // First, try to create a conversation or get existing one
      // Use freelancer_id for conversation creation, not user_id
      const response = await messageAPI.createConversation(freelancer.freelancer_id);
      console.log('Conversation creation response:', response.data);
      const conversationId = response.data.conversation_id;
      
      // Navigate to chat screen with conversation ID
      navigation.navigate('Chat', { 
        conversationId: conversationId,
        recipientName: `${freelancer.first_name} ${freelancer.last_name}`,
        recipientId: freelancer.freelancer_id
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const handleSaveProfile = (freelancer) => {
    Alert.alert('Profile Saved', `${freelancer.first_name} ${freelancer.last_name}'s profile has been saved!`);
  };

  const renderFreelancerCard = (freelancer) => {
    // Handle skills data structure - could be array of strings or array of objects
    const skills = freelancer.skills || [];
    const skillNames = skills.map(skill => 
      typeof skill === 'string' ? skill : skill.skill_name || skill.name || 'Unknown Skill'
    );
    const displaySkills = skillNames.slice(0, 3); // Show only first 3 skills

    return (
      <View key={freelancer.user_id} style={styles.freelancerCard}>
        <View style={styles.cardHeader}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={32} color="#FF6B35" />
            </View>
            <View style={styles.basicInfo}>
              <Text style={styles.freelancerName}>
                {freelancer.first_name} {freelancer.last_name}
              </Text>
              <Text style={styles.freelancerEmail}>{freelancer.email}</Text>
                             <Text style={styles.skillsCount}>
                 {skillNames.length} skills • {freelancer.education?.length || 0} education
               </Text>
            </View>
          </View>
          <View style={styles.statusIndicator}>
                          <View style={[styles.statusDot, freelancer.availability_status === 'available' ? styles.availableDot : styles.unavailableDot]} />
              <Text style={[styles.statusText, freelancer.availability_status === 'available' ? styles.availableText : styles.unavailableText]}>
                {freelancer.availability_status === 'available' ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>

        {displaySkills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsList}>
              {displaySkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
                             {skillNames.length > 3 && (
                 <TouchableOpacity 
                   style={styles.moreSkillsTag}
                   onPress={() => handleViewProfile(freelancer)}
                 >
                   <Text style={styles.moreSkillsText}>+{skillNames.length - 3} more</Text>
                 </TouchableOpacity>
               )}
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewProfile(freelancer)}
          >
            <MaterialCommunityIcons name="eye" size={16} color="#FF6B35" />
            <Text style={styles.actionButtonText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => handleMessageFreelancer(freelancer)}
          >
            <MaterialCommunityIcons name="message-text" size={16} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, styles.messageButtonText]}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSaveProfile(freelancer)}
          >
            <MaterialCommunityIcons name="bookmark-outline" size={16} color="#8B4513" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Freelancers</Text>
        <Text style={styles.headerSubtitle}>Search and connect with talented professionals</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, skills, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filter by Skills</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.skillsFilterList}>
              {['React Native', 'JavaScript', 'Python', 'UI/UX', 'Mobile Development', 'Web Development'].map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillFilterTag,
                    selectedSkills.includes(skill) && styles.selectedSkillTag
                  ]}
                  onPress={() => {
                    if (selectedSkills.includes(skill)) {
                      setSelectedSkills(selectedSkills.filter(s => s !== skill));
                    } else {
                      setSelectedSkills([...selectedSkills, skill]);
                    }
                  }}
                >
                  <Text style={[
                    styles.skillFilterText,
                    selectedSkills.includes(skill) && styles.selectedSkillFilterText
                  ]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <Text style={styles.filterTitle}>Filter by Availability</Text>
          <View style={styles.availabilityFilterList}>
            <TouchableOpacity
              style={[
                styles.availabilityFilterTag,
                availabilityFilter === 'all' && styles.selectedAvailabilityTag
              ]}
              onPress={() => setAvailabilityFilter('all')}
            >
              <Text style={[
                styles.availabilityFilterText,
                availabilityFilter === 'all' && styles.selectedAvailabilityFilterText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.availabilityFilterTag,
                availabilityFilter === 'available' && styles.selectedAvailabilityTag
              ]}
              onPress={() => setAvailabilityFilter('available')}
            >
              <View style={styles.availabilityFilterContent}>
                <View style={styles.availableDot} />
                <Text style={[
                  styles.availabilityFilterText,
                  availabilityFilter === 'available' && styles.selectedAvailabilityFilterText
                ]}>
                  Available
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.availabilityFilterTag,
                availabilityFilter === 'unavailable' && styles.selectedAvailabilityTag
              ]}
              onPress={() => setAvailabilityFilter('unavailable')}
            >
              <View style={styles.availabilityFilterContent}>
                <View style={styles.unavailableDot} />
                <Text style={[
                  styles.availabilityFilterText,
                  availabilityFilter === 'unavailable' && styles.selectedAvailabilityFilterText
                ]}>
                  Not Available
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Freelancers List */}
      <ScrollView
        style={styles.freelancersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading freelancers...</Text>
          </View>
        ) : filteredFreelancers.length > 0 ? (
          filteredFreelancers.map(freelancer => renderFreelancerCard(freelancer))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No freelancers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  skillsFilterList: {
    flexDirection: 'row',
    gap: 8,
  },
  skillFilterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSkillTag: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  skillFilterText: {
    fontSize: 12,
    color: '#666666',
  },
  selectedSkillFilterText: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  freelancersList: {
    flex: 1,
    padding: 20,
  },
  freelancerCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
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
  basicInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  freelancerEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  skillsCount: {
    fontSize: 12,
    color: '#8B4513',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  availableDot: {
    backgroundColor: '#10B981',
  },
  unavailableDot: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  availableText: {
    color: '#10B981',
  },
  unavailableText: {
    color: '#EF4444',
  },
  skillsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#1976D2',
  },
  moreSkillsTag: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreSkillsText: {
    fontSize: 12,
    color: '#666666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    gap: 4,
  },
  messageButton: {
    backgroundColor: '#FF6B35',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  messageButtonText: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  // Availability filter styles
  availabilityFilterList: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  availabilityFilterTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedAvailabilityTag: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  availabilityFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityFilterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedAvailabilityFilterText: {
    color: '#FFFFFF',
  },
});

export default AssociateSearchScreen; 