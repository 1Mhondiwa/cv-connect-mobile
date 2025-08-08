import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { fetchAssociateProfile, updateAssociateProfile } from '../../store/slices/associateSlice';

const AssociateProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading } = useSelector((state) => state.associate);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    contact_person: '',
    industry: '',
    phone: '',
    address: '',
    website: '',
  });

  // Load profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAssociateProfile());
    }, [dispatch])
  );

  // Update local state when profile data is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        contact_person: profile.contact_person || '',
        industry: profile.industry || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleProfileImageUpload = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Implement profile image upload
        Alert.alert('Success', 'Profile image uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateAssociateProfile(profileData)).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setProfileData({
        contact_person: profile.contact_person || '',
        industry: profile.industry || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
      });
    }
    setIsEditing(false);
  };

  const updateProfileField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProfileSection = (title, icon, children) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={20} color="#FF6B35" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderEditableField = (label, value, field, placeholder, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => updateProfileField(field, text)}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not specified'}</Text>
      )}
    </View>
  );

  if (isLoading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your associate profile</Text>
      </View>

      {/* Profile Image Section */}
      <View style={styles.section}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#FF6B35" />
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={handleProfileImageUpload}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Information */}
      {renderProfileSection('Basic Information', 'account', (
        <View>
          {renderEditableField('Contact Person', profileData.contact_person, 'contact_person', 'Enter contact person name')}
          {renderEditableField('Industry', profileData.industry, 'industry', 'Enter industry')}
          {renderEditableField('Phone', profileData.phone, 'phone', 'Enter phone number', 'phone-pad')}
        </View>
      ))}

      {/* Contact Information */}
      {renderProfileSection('Contact Information', 'map-marker', (
        <View>
          {renderEditableField('Address', profileData.address, 'address', 'Enter company address')}
          {renderEditableField('Website', profileData.website, 'website', 'Enter website URL', 'url')}
        </View>
      ))}

      {/* Account Information */}
      {renderProfileSection('Account Information', 'shield-account', (
        <View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email}</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Account Type</Text>
            <Text style={styles.fieldValue}>Associate</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Member Since</Text>
            <Text style={styles.fieldValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      ))}

      {/* Statistics */}
      {renderProfileSection('Statistics', 'chart-line', (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Freelancers Contacted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Active Conversations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Saved Profiles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Projects Started</Text>
          </View>
        </View>
      ))}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
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
  profileImageContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 80,
    height: 80,
  },
  profileImage: {
    marginBottom: 16,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 8,
    right: '35%',
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: '#666666',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
});

export default AssociateProfileScreen; 