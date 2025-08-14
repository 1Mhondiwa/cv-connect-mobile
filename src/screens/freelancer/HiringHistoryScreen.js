import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { hiringAPI } from '../../services/api';

const HiringHistoryScreen = ({ navigation }) => {
  const [hiringHistory, setHiringHistory] = useState([]);
  const [currentHiring, setCurrentHiring] = useState(null);
  const [hiringStats, setHiringStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.freelancer);

  useEffect(() => {
    fetchHiringData();
  }, []);

  const fetchHiringData = async () => {
    try {
      setIsLoading(true);
      const [historyRes, currentRes, statsRes] = await Promise.all([
        hiringAPI.getHiringHistory(user.user_id),
        hiringAPI.getCurrentHiring(user.user_id),
        hiringAPI.getHiringStats(user.user_id)
      ]);

      // Ensure we always have arrays/objects, even if API returns unexpected data
      setHiringHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setCurrentHiring(currentRes.data || null);
      setHiringStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching hiring data:', error);
      // Set default empty values instead of showing error alert
      setHiringHistory([]);
      setCurrentHiring(null);
      setHiringStats({});
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHiringData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'offered': return '#FFA500';
      case 'accepted': return '#10B981';
      case 'active': return '#3B82F6';
      case 'completed': return '#059669';
      case 'terminated': return '#DC2626';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'offered': return 'Offer Received';
      case 'accepted': return 'Accepted';
      case 'active': return 'Currently Working';
      case 'completed': return 'Completed';
      case 'terminated': return 'Terminated';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount, currency = 'ZAR') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleRespondToOffer = async (hiringId, response) => {
    try {
      await hiringAPI.respondToOffer(hiringId, { response });
      Alert.alert('Success', `Offer ${response} successfully`);
      fetchHiringData(); // Refresh data
    } catch (error) {
      Alert.alert('Error', `Failed to ${response} offer`);
    }
  };

  const renderCurrentHiring = () => {
    if (!currentHiring) return null;

    return (
      <Card style={styles.currentHiringCard} elevation={3}>
        <Card.Content>
          <View style={styles.currentHiringHeader}>
            <MaterialCommunityIcons 
              name="briefcase" 
              size={24} 
              color="#FF6B35" 
            />
            <Text style={styles.currentHiringTitle}>Current Position</Text>
          </View>
          
          <Text style={styles.positionTitle}>{currentHiring.position_title}</Text>
          <Text style={styles.associateInfo}>
            {currentHiring.associate_contact} • {currentHiring.associate_industry}
          </Text>
          
          <View style={styles.currentHiringDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentHiring.status) }]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusText(currentHiring.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Salary:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(currentHiring.salary_amount, currentHiring.salary_currency)}
              </Text>
            </View>
            
            {currentHiring.start_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>{formatDate(currentHiring.start_date)}</Text>
              </View>
            )}
          </View>

          {currentHiring.status === 'offered' && (
            <View style={styles.offerActions}>
              <TouchableOpacity
                style={[styles.offerButton, styles.acceptButton]}
                onPress={() => handleRespondToOffer(currentHiring.hiring_id, 'accepted')}
              >
                <Text style={styles.offerButtonText}>Accept Offer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.offerButton, styles.rejectButton]}
                onPress={() => handleRespondToOffer(currentHiring.hiring_id, 'rejected')}
              >
                <Text style={styles.offerButtonText}>Decline Offer</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderHiringStats = () => {
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Hiring Statistics</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{hiringStats.total_hirings || 0}</Text>
              <Text style={styles.statLabel}>Total Positions</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{hiringStats.completed_positions || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{hiringStats.active_positions || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} elevation={2}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{hiringStats.pending_offers || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    );
  };

  const renderHiringHistory = () => {
    // Safety check: ensure hiringHistory is always an array
    if (!Array.isArray(hiringHistory) || hiringHistory.length === 0) {
      return (
        <View style={styles.noHistory}>
          <MaterialCommunityIcons name="briefcase-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noHistoryTitle}>No Hiring History Yet</Text>
          <Text style={styles.noHistorySubtitle}>
            When associates hire you, your positions will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Hiring History</Text>
        {hiringHistory.map((hiring, index) => (
          <Card key={hiring.hiring_id} style={styles.historyCard} elevation={2}>
            <Card.Content>
              <View style={styles.historyHeader}>
                <Text style={styles.historyPositionTitle}>{hiring.position_title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(hiring.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(hiring.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.historyAssociate}>
                {hiring.associate_contact} • {hiring.associate_industry}
              </Text>
              
              {hiring.project_description && (
                <Text style={styles.historyDescription}>{hiring.project_description}</Text>
              )}
              
              <View style={styles.historyDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hired:</Text>
                  <Text style={styles.detailValue}>{formatDate(hiring.hiring_date)}</Text>
                </View>
                
                {hiring.start_date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Started:</Text>
                    <Text style={styles.detailValue}>{formatDate(hiring.start_date)}</Text>
                  </View>
                )}
                
                {hiring.end_date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ended:</Text>
                    <Text style={styles.detailValue}>{formatDate(hiring.end_date)}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Salary:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(hiring.salary_amount, hiring.salary_currency)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading hiring history...</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hiring History</Text>
          <View style={styles.placeholder} />
        </View>
      </Surface>

      {/* Current Hiring */}
      {renderCurrentHiring()}

      {/* Hiring Statistics */}
      {renderHiringStats()}

      {/* Hiring History */}
      {renderHiringHistory()}
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6B35',
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  currentHiringCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  currentHiringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentHiringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  associateInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  currentHiringDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  offerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  historyContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  historyCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyPositionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  historyAssociate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historyDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  historyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  noHistory: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
  },
  noHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noHistorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HiringHistoryScreen;
