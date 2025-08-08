import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { messageAPI, associateAPI } from '../../services/api';
import { fetchAssociateDashboardStats } from '../../store/slices/associateSlice';

const FreelancerDetailScreen = ({ route, navigation }) => {
  const { freelancer } = route.params;
  const dispatch = useDispatch();
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);

  const handleMessageFreelancer = async () => {
    try {
      // First, try to create a conversation or get existing one
      // Use freelancer_id for conversation creation, not user_id
      const response = await messageAPI.createConversation(freelancer.freelancer_id);
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

  // Check if profile is already saved when component mounts
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        setIsCheckingSaved(true);
        const response = await associateAPI.checkIfSaved(freelancer.freelancer_id);
        setIsSaved(response.data.is_saved);
      } catch (error) {
        console.error('Error checking if profile is saved:', error);
        setIsSaved(false);
      } finally {
        setIsCheckingSaved(false);
      }
    };
    
    checkIfSaved();
  }, [freelancer.freelancer_id]);

  const handleSaveProfile = async () => {
    try {
      if (isSaved) {
        // Remove from saved
        await associateAPI.removeSaved(freelancer.freelancer_id);
        setIsSaved(false);
        Alert.alert('Profile Removed', `${freelancer.first_name} ${freelancer.last_name}'s profile has been removed from saved!`);
      } else {
        // Save profile
        await associateAPI.saveProfile(freelancer.freelancer_id);
        setIsSaved(true);
        Alert.alert('Profile Saved', `${freelancer.first_name} ${freelancer.last_name}'s profile has been saved!`);
      }
      
      // Refresh dashboard stats to update saved profiles count
      dispatch(fetchAssociateDashboardStats());
    } catch (error) {
      console.error('Error saving/removing profile:', error);
      Alert.alert('Error', 'Failed to save/remove profile. Please try again.');
    }
  };

  const renderSection = (title, icon, children) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={20} color="#FF6B35" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderSkillTag = (skill, index) => {
    const skillName = typeof skill === 'string' ? skill : skill.skill_name || skill.name || 'Unknown Skill';
    return (
      <View key={index} style={styles.skillTag}>
        <Text style={styles.skillText}>{skillName}</Text>
      </View>
    );
  };

  const renderEducationItem = (education, index) => (
    <View key={index} style={styles.educationItem}>
      <Text style={styles.educationInstitution}>{education.institution}</Text>
      <Text style={styles.educationDegree}>{education.degree}</Text>
      <Text style={styles.educationPeriod}>
        {education.start_date} - {education.end_date || 'Present'}
      </Text>
    </View>
  );

  const renderWorkExperienceItem = (experience, index) => (
    <View key={index} style={styles.experienceItem}>
      <Text style={styles.experienceTitle}>{experience.title}</Text>
      <Text style={styles.experienceCompany}>{experience.company}</Text>
      <Text style={styles.experiencePeriod}>
        {experience.start_date} - {experience.end_date || 'Present'}
      </Text>
      <Text style={styles.experienceDescription}>{experience.description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Freelancer Profile</Text>
      </View>

      {/* Profile Overview */}
      <View style={styles.profileOverview}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={60} color="#FF6B35" />
        </View>
        <View style={styles.basicInfo}>
          <Text style={styles.freelancerName}>
            {freelancer.first_name} {freelancer.last_name}
          </Text>
          <Text style={styles.freelancerEmail}>{freelancer.email}</Text>
          <Text style={styles.freelancerPhone}>{freelancer.phone || 'Phone not provided'}</Text>
          
          {/* Availability Status */}
          <View style={styles.availabilityContainer}>
                          <View style={[styles.availabilityDot, freelancer.availability_status === 'available' ? styles.availableDot : styles.unavailableDot]} />
              <Text style={[styles.availabilityText, freelancer.availability_status === 'available' ? styles.availableText : styles.unavailableText]}>
                {freelancer.availability_status === 'available' ? 'Available for Work' : 'Not Available for Work'}
            </Text>
          </View>
        </View>
      </View>

             {/* Skills */}
       {freelancer.skills && freelancer.skills.length > 0 && renderSection('Skills', 'tools', (
         <View style={styles.skillsList}>
           {freelancer.skills.map((skill, index) => renderSkillTag(skill, index))}
         </View>
       ))}

      {/* Education */}
      {freelancer.education && freelancer.education.length > 0 && renderSection('Education', 'school', (
        <View>
          {freelancer.education.map(renderEducationItem)}
        </View>
      ))}

      {/* Work Experience */}
      {freelancer.work_experience && freelancer.work_experience.length > 0 && renderSection('Work Experience', 'briefcase', (
        <View>
          {freelancer.work_experience.map(renderWorkExperienceItem)}
        </View>
      ))}

      {/* Contact Information */}
      {renderSection('Contact Information', 'map-marker', (
        <View>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="email" size={16} color="#666666" />
            <Text style={styles.contactText}>{freelancer.email}</Text>
          </View>
          {freelancer.phone && (
            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="phone" size={16} color="#666666" />
              <Text style={styles.contactText}>{freelancer.phone}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessageFreelancer}>
          <MaterialCommunityIcons name="message-text" size={20} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isSaved && styles.savedButton]} 
          onPress={handleSaveProfile}
          disabled={isCheckingSaved}
        >
          <MaterialCommunityIcons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={isSaved ? "#FFFFFF" : "#FF6B35"} 
          />
          <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
            {isCheckingSaved ? 'Checking...' : isSaved ? 'Saved' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileOverview: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  basicInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  freelancerEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  freelancerPhone: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#1976D2',
  },
  educationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  educationInstitution: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  educationDegree: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  educationPeriod: {
    fontSize: 12,
    color: '#8B4513',
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  experiencePeriod: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 8,
  },
  saveButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  savedButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  savedButtonText: {
    color: '#FFFFFF',
  },
  // Availability styles
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableDot: {
    backgroundColor: '#10B981',
  },
  unavailableDot: {
    backgroundColor: '#EF4444',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availableText: {
    color: '#10B981',
  },
  unavailableText: {
    color: '#EF4444',
  },
});

export default FreelancerDetailScreen; 