import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addAssociate, getAdminStats } from '../../store/slices/adminSlice';
import { adminAPI } from '../../services/api';

const AdminProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.admin);

  // Add Associate Form State
  const [showAddAssociate, setShowAddAssociate] = useState(false);
  const [associateForm, setAssociateForm] = useState({
    email: '',
    password: '',
    industry: '',
    contact_person: '',
    phone: '',
    address: '',
    website: '',
  });

  const handleAddAssociate = async () => {
    // Validate required fields
    if (!associateForm.email || !associateForm.password || !associateForm.industry || !associateForm.contact_person || !associateForm.phone) {
      Alert.alert('Required Fields', 'Please fill in all required fields:\n\n• Email\n• Password\n• Industry\n• Contact Person\n• Phone\n\nAddress and Website are optional.');
      return;
    }

    try {
      await dispatch(addAssociate(associateForm)).unwrap();
      Alert.alert('Success', 'Associate added successfully!');
      
      // Refresh admin stats to update the dashboard
      dispatch(getAdminStats());
      
      // Reset form
      setAssociateForm({
        email: '',
        password: '',
        industry: '',
        contact_person: '',
        phone: '',
        address: '',
        website: '',
      });
      setShowAddAssociate(false);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to add associate');
    }
  };

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
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        });

        try {
          const response = await adminAPI.uploadProfileImage(formData);
          Alert.alert('Success', 'Profile image uploaded successfully!');
        } catch (error) {
          Alert.alert('Error', 'Failed to upload profile image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDeleteProfileImage = async () => {
    Alert.alert(
      'Delete Profile Image',
      'Are you sure you want to delete your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteProfileImage();
              Alert.alert('Success', 'Profile image deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile image');
            }
          },
        },
      ]
    );
  };

  const updateAssociateForm = (field, value) => {
    setAssociateForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your profile and add associates</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#FF6B35" />
            <View style={styles.profileImageActions}>
              <TouchableOpacity style={styles.imageActionButton} onPress={handleProfileImageUpload}>
                <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageActionButton, styles.deleteButton]} onPress={handleDeleteProfileImage}>
                <MaterialCommunityIcons name="delete" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.email || 'Admin User'}</Text>
            <Text style={styles.profileRole}>System Administrator</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Add Associate Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Add New Associate</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAddAssociate(!showAddAssociate)}
          >
            <MaterialCommunityIcons
              name={showAddAssociate ? 'minus' : 'plus'}
              size={24}
              color="#FF6B35"
            />
          </TouchableOpacity>
        </View>

        {showAddAssociate && (
          <View style={styles.addAssociateForm}>
            <Text style={styles.formSubtitle}>Create a new associate account</Text>
            <Text style={styles.optionalNote}>* Required fields | Address and Website are optional</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={associateForm.email}
              onChangeText={(value) => updateAssociateForm('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={associateForm.password}
              onChangeText={(value) => updateAssociateForm('password', value)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Industry *"
              value={associateForm.industry}
              onChangeText={(value) => updateAssociateForm('industry', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact Person *"
              value={associateForm.contact_person}
              onChangeText={(value) => updateAssociateForm('contact_person', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone *"
              value={associateForm.phone}
              onChangeText={(value) => updateAssociateForm('phone', value)}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company address"
              value={associateForm.address}
              onChangeText={(value) => updateAssociateForm('address', value)}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.fieldLabel}>Website (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company website URL"
              value={associateForm.website}
              onChangeText={(value) => updateAssociateForm('website', value)}
              keyboardType="url"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.disabledButton]}
              onPress={handleAddAssociate}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>
                {isLoading ? 'Adding...' : 'Add Associate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowAddAssociate(true)}>
            <MaterialCommunityIcons name="account-plus" size={32} color="#FF6B35" />
            <Text style={styles.actionTitle}>Add Associate</Text>
            <Text style={styles.actionDescription}>Create new associate account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleProfileImageUpload}>
            <MaterialCommunityIcons name="camera" size={32} color="#FF6B35" />
            <Text style={styles.actionTitle}>Upload Photo</Text>
            <Text style={styles.actionDescription}>Change profile picture</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
    width: 80,
    height: 80,
  },
  profileImageActions: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  toggleButton: {
    padding: 8,
  },
  addAssociateForm: {
    marginTop: 16,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  optionalNote: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default AdminProfileScreen; 