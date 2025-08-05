import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFreelancers, getAssociates, toggleUserActive, getAdminStats } from '../../store/slices/adminSlice';
import { adminAPI } from '../../services/api';

const AdminUsersScreen = () => {
  const dispatch = useDispatch();
  const { freelancers, associates, isLoading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('freelancers');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Refresh users when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      await Promise.all([
        dispatch(getFreelancers()).unwrap(),
        dispatch(getAssociates()).unwrap(),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
    });
  };

  const handleAddFreelancer = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.first_name || !formData.last_name || !formData.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsAddingUser(true);

    try {
      const response = await adminAPI.addFreelancer({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });

      if (response.success) {
        Alert.alert(
          'Success', 
          'Freelancer account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowAddModal(false);
                resetForm();
                loadUsers(); // Refresh the list
                dispatch(getAdminStats()); // Refresh dashboard stats
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Add freelancer error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to create freelancer account'
      );
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus, userName) => {
    try {
      await dispatch(toggleUserActive(userId)).unwrap();
      Alert.alert(
        'Success',
        `${userName} has been ${currentStatus ? 'deactivated' : 'activated'} successfully!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const confirmToggleStatus = (userId, currentStatus, userName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: () => handleToggleUserStatus(userId, currentStatus, userName),
          style: currentStatus ? 'destructive' : 'default'
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderUserCard = (user, userType) => {
    const isFreelancer = userType === 'freelancer';
    const userName = isFreelancer 
      ? `${user.first_name || 'N/A'} ${user.last_name || 'N/A'}`
      : user.contact_person || 'N/A';
    
    return (
      <View key={user.user_id} style={[styles.userCard, !user.is_active && styles.inactiveUser]}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userType}>
              {isFreelancer ? 'Freelancer' : 'Associate'} • {user.industry || 'N/A'}
            </Text>
          </View>
          <View style={styles.userStatus}>
            <View style={[styles.statusBadge, user.is_active ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.statusText}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Joined: </Text>
            {formatDate(user.created_at)}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Last Login: </Text>
            {formatDate(user.last_login)}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Verified: </Text>
            {user.is_verified ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              user.is_active ? styles.deactivateButton : styles.activateButton
            ]}
            onPress={() => confirmToggleStatus(user.user_id, user.is_active, userName)}
          >
            <MaterialCommunityIcons
              name={user.is_active ? 'account-off' : 'account-check'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>Manage freelancers and associates</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'freelancers' && styles.activeTab]}
          onPress={() => setActiveTab('freelancers')}
        >
          <Text style={[styles.tabText, activeTab === 'freelancers' && styles.activeTabText]}>
            Freelancers ({freelancers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'associates' && styles.activeTab]}
          onPress={() => setActiveTab('associates')}
        >
          <Text style={[styles.tabText, activeTab === 'associates' && styles.activeTabText]}>
            Associates ({associates.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'freelancers' ? (
          freelancers.length > 0 ? (
            freelancers.map(user => renderUserCard(user, 'freelancer'))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No freelancers found</Text>
            </View>
          )
        ) : (
          associates.length > 0 ? (
            associates.map(user => renderUserCard(user, 'associate'))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No associates found</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {activeTab === 'freelancers' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add Freelancer Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Freelancer</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChangeText={(value) => handleInputChange('first_name', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChangeText={(value) => handleInputChange('last_name', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, isAddingUser && styles.disabledButton]}
                onPress={handleAddFreelancer}
                disabled={isAddingUser}
              >
                <Text style={styles.addButtonText}>
                  {isAddingUser ? 'Adding...' : 'Add Freelancer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  usersList: {
    flex: 1,
    padding: 20,
  },
  userCard: {
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
  inactiveUser: {
    opacity: 0.6,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  inactiveBadge: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#333333',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  activateButton: {
    backgroundColor: '#10B981',
  },
  deactivateButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AdminUsersScreen; 