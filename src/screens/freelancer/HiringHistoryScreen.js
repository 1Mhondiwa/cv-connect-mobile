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
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Surface } from 'react-native-paper';

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

const HiringHistoryScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [hiringHistory, setHiringHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHiringHistory();
  }, []);

  const fetchHiringHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching hiring history for freelancer...');
      const response = await profileAPI.getHiringHistory();
      
      if (response.data.success) {
        setHiringHistory(response.data.hiring_history);
        console.log('✅ Hiring history fetched:', response.data.hiring_history);
      } else {
        setError('Failed to fetch hiring history');
        console.error('❌ API returned success: false');
      }
    } catch (error) {
      console.error('❌ Error fetching hiring history:', error);
      setError('Failed to load hiring history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHiringHistory();
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
      case 'on_hold':
        return '#F59E0B'; // Yellow
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
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
    return `$${amount} (${rateType || 'hourly'})`;
  };

  const openWebsite = (url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      Linking.openURL(url);
    }
  };

  const openPhone = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const openEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (loading) {
      return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading hiring history...</Text>
        </View>
      );
    }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHiringHistory}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hiringHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="briefcase-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No Hiring History Yet</Text>
        <Text style={styles.emptySubtitle}>
          When associates hire you for projects, your hiring history will appear here
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchHiringHistory}>
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
          <Text style={styles.headerTitle}>Hiring History</Text>
          <View style={styles.headerRight} />
        </View>
        <Text style={styles.headerSubtitle}>
          Your project history and company relationships
        </Text>
      </Surface>

      {/* Hiring History List */}
      <View style={styles.hiringList}>
        {hiringHistory.map((hire, index) => (
          <Card key={index} style={styles.hiringCard} elevation={3}>
            <Card.Content style={styles.hiringContent}>
              {/* Project Header */}
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <MaterialCommunityIcons 
                    name="briefcase" 
                    size={20} 
                    color="#FF6B35" 
                  />
                  <Text style={styles.projectTitle}>{hire.project_title}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(hire.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(hire.status)}
                  </Text>
                </View>
              </View>

              {/* Company Information */}
              <View style={styles.companySection}>
                <Text style={styles.sectionTitle}>Company Contact Details</Text>
                
                <View style={styles.companyInfo}>
                  <View style={styles.companyRow}>
                    <MaterialCommunityIcons 
                      name="office-building" 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.companyName}>
                      {hire.company_contact || 'Company Contact N/A'}
                    </Text>
                  </View>

                  {hire.company_contact && (
                    <View style={styles.companyRow}>
                      <MaterialCommunityIcons 
                        name="account" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.companyDetail}>
                        Contact: {hire.company_contact}
                      </Text>
                    </View>
                  )}

                  {hire.industry && (
                    <View style={styles.companyRow}>
                      <MaterialCommunityIcons 
                        name="domain" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.companyDetail}>
                        {hire.industry}
                      </Text>
                    </View>
                  )}

                  {hire.website && (
                    <TouchableOpacity 
                      style={styles.companyRow}
                      onPress={() => openWebsite(hire.website)}
                    >
                      <MaterialCommunityIcons 
                        name="web" 
                        size={16} 
                        color="#3B82F6" 
                      />
                      <Text style={[styles.companyDetail, styles.linkText]}>
                        {hire.website}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {hire.phone && (
                    <TouchableOpacity 
                      style={styles.companyRow}
                      onPress={() => openPhone(hire.phone)}
                    >
                      <MaterialCommunityIcons 
                        name="phone" 
                        size={16} 
                        color="#10B981" 
                      />
                      <Text style={[styles.companyDetail, styles.linkText]}>
                        {hire.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {hire.company_email && (
                    <TouchableOpacity 
                      style={styles.companyRow}
                      onPress={() => openEmail(hire.company_email)}
                    >
                      <MaterialCommunityIcons 
                        name="email" 
                        size={16} 
                        color="#8B5CF6" 
                      />
                      <Text style={[styles.companyDetail, styles.linkText]}>
                        {hire.company_email}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {hire.address && (
                    <View style={styles.companyRow}>
                      <MaterialCommunityIcons 
                        name="map-marker" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.companyDetail}>
                        {hire.address}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Project Details */}
              <View style={styles.projectSection}>
                <Text style={styles.sectionTitle}>Project Details</Text>
                
                <View style={styles.projectDetails}>
                  {hire.project_description && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="text" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        {hire.project_description}
                      </Text>
                    </View>
                  )}

                  {hire.agreed_terms && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="file-document" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        {hire.agreed_terms}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.detailText}>
                      Hired: {formatDate(hire.hire_date)}
                    </Text>
                  </View>

                  {hire.start_date && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="play-circle" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        Start: {formatDate(hire.start_date)}
                      </Text>
                    </View>
                  )}

                  {hire.expected_end_date && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="stop-circle" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        Expected End: {formatDate(hire.expected_end_date)}
                      </Text>
                    </View>
                  )}

                  {hire.actual_end_date && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        Completed: {formatDate(hire.actual_end_date)}
                      </Text>
                    </View>
                  )}

                  {hire.agreed_rate && (
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons 
                        name="currency-usd" 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.detailText}>
                        Rate: {formatCurrency(hire.agreed_rate, hire.rate_type)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Notes Section */}
              {(hire.associate_notes || hire.freelancer_notes) && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  
                                                {hire.associate_notes && (
                                <View style={styles.noteItem}>
                                  <Text style={styles.noteLabel}>Client Notes:</Text>
                                  <Text style={styles.noteText}>{hire.associate_notes}</Text>
                                </View>
                              )}

                  {hire.freelancer_notes && (
                    <View style={styles.noteItem}>
                      <Text style={styles.noteLabel}>Your Notes:</Text>
                      <Text style={styles.noteText}>{hire.freelancer_notes}</Text>
                    </View>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          You have been hired for {hiringHistory.length} project{hiringHistory.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summarySubtext}>
          Keep building your professional relationships!
        </Text>
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
    padding: responsive.ifTablet(spacing.xl, spacing.lg),
  },
  loadingText: {
    marginTop: responsive.ifTablet(spacing.md, spacing.sm),
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.xl, spacing.lg),
  },
  errorText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#EF4444',
    textAlign: 'center',
    marginTop: responsive.ifTablet(spacing.md, spacing.sm),
    marginBottom: responsive.ifTablet(spacing.lg, spacing.md),
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingVertical: responsive.ifTablet(spacing.md, spacing.sm),
    borderRadius: responsive.ifTablet(borderRadius.md, borderRadius.sm),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.ifTablet(spacing.xl, spacing.lg),
  },
  emptyTitle: {
    fontSize: responsive.ifTablet(fontSize.xl, fontSize.lg),
    fontWeight: 'bold',
    color: '#333',
    marginTop: responsive.ifTablet(spacing.lg, spacing.md),
    marginBottom: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  emptySubtitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#666',
    textAlign: 'center',
    lineHeight: responsive.ifTablet(24, 20),
    marginBottom: responsive.ifTablet(spacing.lg, spacing.md),
  },
  refreshButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
    paddingVertical: responsive.ifTablet(spacing.md, spacing.sm),
    borderRadius: responsive.ifTablet(borderRadius.md, borderRadius.sm),
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: responsive.ifTablet(spacing.xl, spacing.lg),
    paddingBottom: responsive.ifTablet(spacing.lg, spacing.md),
    paddingHorizontal: responsive.ifTablet(spacing.lg, spacing.md),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  backButton: {
    padding: responsive.ifTablet(spacing.xs, spacing.xxs),
    marginRight: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  headerTitle: {
    fontSize: responsive.ifTablet(fontSize.xxl, fontSize.xl),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerRight: {
    width: responsive.ifTablet(40, 32),
  },
  headerSubtitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#666',
  },
  hiringList: {
    padding: responsive.ifTablet(spacing.lg, spacing.md),
    gap: responsive.ifTablet(spacing.md, spacing.sm),
  },
  hiringCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
    marginBottom: responsive.ifTablet(spacing.md, spacing.sm),
  },
  hiringContent: {
    padding: responsive.ifTablet(spacing.lg, spacing.md),
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsive.ifTablet(spacing.md, spacing.sm),
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  projectTitle: {
    fontSize: responsive.ifTablet(fontSize.lg, fontSize.md),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: responsive.ifTablet(spacing.sm, spacing.xs),
    paddingVertical: responsive.ifTablet(spacing.xs, 2),
    borderRadius: responsive.ifTablet(12, 8),
  },
  statusText: {
    fontSize: responsive.ifTablet(fontSize.xs, fontSize.xxs),
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.xs),
    marginTop: responsive.ifTablet(spacing.md, spacing.sm),
  },
  companySection: {
    marginBottom: responsive.ifTablet(spacing.md, spacing.sm),
  },
  companyInfo: {
    gap: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  companyName: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    fontWeight: '600',
    color: '#333',
  },
  companyDetail: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    flex: 1,
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  projectSection: {
    marginBottom: responsive.ifTablet(spacing.md, spacing.sm),
  },
  projectDetails: {
    gap: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  detailText: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    flex: 1,
    lineHeight: responsive.ifTablet(20, 18),
  },
  notesSection: {
    marginBottom: responsive.ifTablet(spacing.md, spacing.sm),
  },
  noteItem: {
    marginBottom: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  noteLabel: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.xs, 2),
  },
  noteText: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#666',
    lineHeight: responsive.ifTablet(20, 18),
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: responsive.ifTablet(spacing.lg, spacing.md),
    padding: responsive.ifTablet(spacing.lg, spacing.md),
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: responsive.ifTablet(fontSize.lg, fontSize.md),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.ifTablet(spacing.sm, spacing.xs),
  },
  summaryText: {
    fontSize: responsive.ifTablet(fontSize.md, fontSize.sm),
    color: '#666',
    marginBottom: responsive.ifTablet(spacing.xs, 2),
  },
  summarySubtext: {
    fontSize: responsive.ifTablet(fontSize.sm, fontSize.xs),
    color: '#999',
    fontStyle: 'italic',
  },
});

export default HiringHistoryScreen;
