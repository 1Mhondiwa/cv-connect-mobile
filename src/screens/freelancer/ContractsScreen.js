import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Surface, Button, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { profileAPI } from '../../services/api';

// Import responsive utilities
import { 
  scale, 
  verticalScale, 
  fontSize, 
  spacing, 
  borderRadius, 
  responsive,
} from '../../utils/responsive';

const ContractsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingContracts, setUploadingContracts] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching contracts for freelancer...');
      const response = await profileAPI.getHiringHistory();
      
      if (response.data.success) {
        setContracts(response.data.hiring_history || []);
        console.log('✅ Contracts loaded:', response.data.hiring_history?.length || 0);
      } else {
        setError('Failed to fetch contracts');
        console.error('❌ API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
      setError('Failed to load contracts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981'; // Green
      case 'completed':
        return '#059652'; // Dark green
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, rateType) => {
    if (!amount) return 'N/A';
    return `R${amount} (${rateType || 'hourly'})`;
  };

  const handleDownloadContract = async (contractPath) => {
    if (!contractPath) {
      Alert.alert('Error', 'Contract file not available');
      return;
    }

    try {
      console.log('📄 Downloading contract:', contractPath);
      
      // Construct full URL
      const fullUrl = contractPath.startsWith('http') 
        ? contractPath 
        : `http://localhost:5000${contractPath}`;
      
      console.log('📄 Full contract URL:', fullUrl);
      
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(fullUrl);
      
      if (canOpen) {
        await Linking.openURL(fullUrl);
        console.log('✅ Contract opened successfully');
      } else {
        Alert.alert('Error', 'Cannot open contract file. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error opening contract:', error);
      Alert.alert('Error', 'Failed to open contract. Please try again.');
    }
  };

  const handleUploadSignedContract = async (hireId, file) => {
    if (!file) return;

    console.log('📤 Starting signed contract upload for hire ID:', hireId);

    // Validate file type
    if (file.mimeType !== 'application/pdf') {
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: 'Please select a PDF file'
      }));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: 'File size must be less than 10MB'
      }));
      return;
    }

    setUploadingContracts(prev => ({ ...prev, [hireId]: true }));
    setUploadErrors(prev => ({ ...prev, [hireId]: '' }));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('signed_contract', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      console.log('📤 Uploading signed contract...');
      
      const response = await profileAPI.uploadSignedContract(hireId, formData);

      if (response.data.success) {
        console.log('✅ Signed contract uploaded successfully');
        
        // Refresh contracts list
        await fetchContracts();
        
        Alert.alert('Success', 'Signed contract uploaded successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading signed contract:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to upload signed contract';
      
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: errorMessage
      }));
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploadingContracts(prev => ({ ...prev, [hireId]: false }));
    }
  };

  const handleSelectFile = async (hireId) => {
    try {
      console.log('📁 Opening file picker for hire ID:', hireId);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📁 Selected file:', file);
        
        await handleUploadSignedContract(hireId, file);
      }
    } catch (error) {
      console.error('❌ Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const openContactMethod = (type, value) => {
    if (!value) return;

    let url = '';
    switch (type) {
      case 'phone':
        url = `tel:${value}`;
        break;
      case 'email':
        url = `mailto:${value}`;
        break;
      case 'website':
        url = value.startsWith('http') ? value : `https://${value}`;
        break;
    }

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('❌ Error opening contact method:', err);
        Alert.alert('Error', 'Cannot open contact method. Please try again.');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading contracts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchContracts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (contracts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="file-document-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No Contracts Yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't been hired for any projects yet. Keep building your profile and applying for opportunities!
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchContracts}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FF6B35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Contracts</Text>
          <TouchableOpacity
            style={styles.refreshHeaderButton}
            onPress={fetchContracts}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          View and manage your contract agreements with associates
        </Text>
      </Surface>

      {/* Contracts List */}
      <View style={styles.contractsList}>
        {contracts.map((contract, index) => (
          <Card key={index} style={styles.contractCard} elevation={3}>
            <Card.Content style={styles.contractContent}>
              {/* Contract Header */}
              <View style={styles.contractHeader}>
                <View style={styles.projectInfo}>
                  <MaterialCommunityIcons 
                    name="briefcase" 
                    size={20} 
                    color="#FF6B35" 
                  />
                  <Text style={styles.projectTitle}>{contract.project_title}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(contract.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(contract.status)}
                  </Text>
                </View>
              </View>

              {/* Project Details */}
              <View style={styles.projectDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Hired: {formatDate(contract.hire_date)}
                  </Text>
                </View>

                {contract.agreed_rate && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatCurrency(contract.agreed_rate, contract.rate_type)}
                    </Text>
                  </View>
                )}

                {contract.start_date && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="play" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Start: {formatDate(contract.start_date)}
                    </Text>
                  </View>
                )}

                {contract.expected_end_date && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="stop" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      End: {formatDate(contract.expected_end_date)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Company Information */}
              {contract.company_contact && (
                <View style={styles.companySection}>
                  <Text style={styles.sectionTitle}>Company Contact</Text>
                  <Text style={styles.companyName}>{contract.company_contact}</Text>
                  
                  {contract.industry && (
                    <Text style={styles.companyDetail}>Industry: {contract.industry}</Text>
                  )}
                </View>
              )}

              {/* Project Description */}
              {contract.project_description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Project Description</Text>
                  <Text style={styles.descriptionText}>
                    {contract.project_description.length > 150 
                      ? `${contract.project_description.substring(0, 150)}...` 
                      : contract.project_description
                    }
                  </Text>
                </View>
              )}

              {/* Contract Actions */}
              <View style={styles.contractActions}>
                {contract.contract_pdf_path ? (
                  <View style={styles.actionButtons}>
                    {/* Download Contract Button */}
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadContract(contract.contract_pdf_path)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="download" size={18} color="#fff" />
                      <Text style={styles.buttonText}>Download Contract</Text>
                    </TouchableOpacity>

                    {/* Upload Section */}
                    <View style={styles.uploadSection}>
                      {contract.signed_contract_pdf_path && (
                        <View style={styles.uploadStatus}>
                          <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                          <Text style={styles.uploadStatusText}>
                            Signed contract uploaded
                          </Text>
                          {contract.signed_contract_uploaded_at && (
                            <Text style={styles.uploadDateText}>
                              {formatDate(contract.signed_contract_uploaded_at)}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Upload Button */}
                      <TouchableOpacity
                        style={[
                          styles.uploadButton,
                          contract.signed_contract_pdf_path && styles.reuploadButton
                        ]}
                        onPress={() => handleSelectFile(contract.hire_id)}
                        activeOpacity={0.7}
                        disabled={uploadingContracts[contract.hire_id]}
                      >
                        {uploadingContracts[contract.hire_id] ? (
                          <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.buttonText}>Uploading...</Text>
                          </>
                        ) : (
                          <>
                            <MaterialCommunityIcons name="upload" size={18} color="#fff" />
                            <Text style={styles.buttonText}>
                              {contract.signed_contract_pdf_path 
                                ? 'Re-upload Signed Contract' 
                                : 'Upload Signed Contract'
                              }
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      {/* Upload Error */}
                      {uploadErrors[contract.hire_id] && (
                        <Text style={styles.uploadError}>
                          {uploadErrors[contract.hire_id]}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noContractSection}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#CCC" />
                    <Text style={styles.noContractText}>No contract available</Text>
                  </View>
                )}
              </View>

              {/* Contact Methods */}
              {(contract.company_email || contract.phone || contract.website) && (
                <View style={styles.contactSection}>
                  <Text style={styles.sectionTitle}>Contact Methods</Text>
                  
                  {contract.company_email && (
                    <TouchableOpacity 
                      style={styles.contactMethod}
                      onPress={() => openContactMethod('email', contract.company_email)}
                    >
                      <MaterialCommunityIcons name="email" size={16} color="#8B5CF6" />
                      <Text style={styles.contactText}>{contract.company_email}</Text>
                    </TouchableOpacity>
                  )}

                  {contract.phone && (
                    <TouchableOpacity 
                      style={styles.contactMethod}
                      onPress={() => openContactMethod('phone', contract.phone)}
                    >
                      <MaterialCommunityIcons name="phone" size={16} color="#10B981" />
                      <Text style={styles.contactText}>{contract.phone}</Text>
                    </TouchableOpacity>
                  )}

                  {contract.website && (
                    <TouchableOpacity 
                      style={styles.contactMethod}
                      onPress={() => openContactMethod('website', contract.website)}
                    >
                      <MaterialCommunityIcons name="web" size={16} color="#3B82F6" />
                      <Text style={styles.contactText}>{contract.website}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: '#666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: '#888',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#FF6B35',
    marginBottom: spacing.md,
    borderBottomLeftRadius: responsive.ifTablet(24, 20),
    borderBottomRightRadius: responsive.ifTablet(24, 20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.lg),
    paddingTop: responsive.ifTablet(70, 60),
    paddingBottom: responsive.ifTablet(spacing.lg, spacing.lg),
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: responsive.ifTablet(fontSize.xxl, fontSize.xl),
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  refreshHeaderButton: {
    padding: spacing.sm,
  },
  headerSubtitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  contractsList: {
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingBottom: responsive.ifTablet(spacing.xxl, spacing.xxl),
  },

  contractCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
  },
  contractContent: {
    padding: spacing.lg,
  },

  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#333',
    marginLeft: spacing.sm,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },

  projectDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: '#666',
    marginLeft: spacing.sm,
  },

  companySection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.sm,
  },
  companyName: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#555',
    marginBottom: spacing.xs,
  },
  companyDetail: {
    fontSize: fontSize.sm,
    color: '#666',
  },

  descriptionSection: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: fontSize.sm,
    color: '#666',
    lineHeight: 20,
  },

  contractActions: {
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  downloadButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  uploadSection: {
    marginTop: spacing.sm,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  uploadStatusText: {
    fontSize: fontSize.sm,
    color: '#10B981',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  uploadDateText: {
    fontSize: fontSize.xs,
    color: '#666',
    marginLeft: spacing.sm,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  reuploadButton: {
    backgroundColor: '#6c757d',
  },
  uploadError: {
    fontSize: fontSize.xs,
    color: '#EF4444',
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  noContractSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  noContractText: {
    fontSize: fontSize.sm,
    color: '#999',
    marginLeft: spacing.sm,
  },

  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: spacing.md,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: '#3B82F6',
    marginLeft: spacing.sm,
    textDecorationLine: 'underline',
  },
});

export default ContractsScreen;
