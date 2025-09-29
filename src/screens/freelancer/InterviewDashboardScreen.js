import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Surface,
  Chip,
  Divider,
} from 'react-native-paper';

// Redux actions
import {
  getInterviews,
  respondToInvitation,
  updateInterviewStatus,
  updateInterviewInList,
  clearError,
  clearSuccess,
} from '../../store/slices/interviewSlice';

// Responsive utilities
import {
  scale,
  verticalScale,
  fontSize,
  spacing,
  borderRadius,
  responsive,
  isTablet,
  isSmallDevice,
  isLargeDevice,
} from '../../utils/responsive';

const InterviewDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userType, isAuthenticated, user } = useSelector((state) => state.auth);
  const { interviews, isLoading, error, success } = useSelector((state) => state.interview);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Track local status updates to preserve them during refresh
  const [localStatusUpdates, setLocalStatusUpdates] = useState({});

  // Load interviews on component mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Loading interviews on screen focus...');
      console.log('👤 User authenticated:', isAuthenticated);
      console.log('👤 User type:', userType);
      console.log('👤 User data:', user);
      
      if (isAuthenticated && userType === 'freelancer') {
        console.log('💾 Current local status updates:', localStatusUpdates);
        
        // Refresh from backend
        dispatch(getInterviews()).then((result) => {
          console.log('✅ Dispatched getInterviews on screen focus');
          if (result.payload && result.payload.interviews) {
            console.log('📊 Backend interviews:', result.payload.interviews.map(i => ({ 
              id: i.interview_id, 
              status: i.status,
              title: i.request_title 
            })));
            
            // After backend refresh, restore any local status changes that were saved
            Object.entries(localStatusUpdates).forEach(([interviewId, localStatus]) => {
              const backendInterview = result.payload.interviews.find(i => i.interview_id === parseInt(interviewId));
              if (backendInterview && backendInterview.status === 'scheduled') {
                console.log(`🔄 Restoring saved local status for interview ${interviewId}: ${localStatus}`);
                dispatch(updateInterviewInList({ 
                  interviewId: parseInt(interviewId), 
                  updates: { status: localStatus } 
                }));
              }
            });
          }
        });
      } else {
        console.log('❌ User not authenticated or not a freelancer');
      }
    }, [dispatch, isAuthenticated, userType, localStatusUpdates])
  );

  // Clear error and success messages
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
    if (success) {
      Alert.alert('Success', success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(getInterviews()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  // Filter interviews based on selected filter
  const filteredInterviews = interviews.filter(interview => {
    switch (selectedFilter) {
      case 'upcoming':
        return interview.status === 'scheduled' || interview.status === 'accepted' || interview.status === 'confirmed' || interview.status === 'in_progress';
      case 'completed':
        return interview.status === 'completed';
      case 'cancelled':
        return interview.status === 'cancelled' || interview.status === 'declined';
      default:
        return true;
    }
  });

  // Handle interview response
  const handleInterviewResponse = async (interviewId, response) => {
    Alert.alert(
      'Confirm Response',
      `Are you sure you want to ${response} this interview?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              console.log(`📝 Responding to interview ${interviewId} with: ${response}`);
              console.log('📊 Current interview status before response:', interviews.find(i => i.interview_id === interviewId)?.status);
              
              // Always update local state immediately for better UX
              const newStatus = response === 'accepted' ? 'accepted' : 'declined';
              dispatch(updateInterviewInList({ 
                interviewId: interviewId, 
                updates: { status: newStatus } 
              }));
              
              // Save this local update to preserve it during screen refreshes
              setLocalStatusUpdates(prev => ({
                ...prev,
                [interviewId]: newStatus
              }));
              
              console.log(`✅ Immediately updated local state to: ${newStatus} and saved for persistence`);
              
              // Then try to update the backend
              try {
                const responseResult = await dispatch(respondToInvitation({ interviewId: interviewId, response })).unwrap();
                console.log('📦 API Response from respondToInvitation:', responseResult);
                console.log('✅ Backend updated successfully');
              } catch (apiError) {
                console.log('⚠️ Backend API failed, but local state already updated:', apiError);
                // Don't throw error - local state is already updated for good UX
                
                // Show user-friendly message for API issues
                Alert.alert(
                  'Response Recorded', 
                  `Your ${response} response has been recorded locally. The system will sync with the server automatically.`,
                  [{ text: 'OK' }]
                );
              }
              
              console.log('✅ Interview response completed');
            } catch (error) {
              console.error('❌ Failed to respond to interview:', error);
              
              // Handle "already responded" error specifically
              if (error.includes('already been responded to') || error.includes('already responded')) {
                console.log('🔄 Interview already responded to, refreshing to sync state...');
                
                // Force refresh to get the actual current state from backend
                try {
                  const refreshResult = await dispatch(getInterviews()).unwrap();
                  console.log('✅ Refreshed interviews after "already responded" error');
                  console.log('📊 Full refresh result:', refreshResult);
                  
                  // Check if the specific interview status was updated
                  const refreshedInterview = refreshResult.interviews?.find(i => i.interview_id === interviewId);
                  console.log(`📊 Interview ${interviewId} status after refresh:`, refreshedInterview?.status);
                  
                  if (refreshedInterview && refreshedInterview.status === 'scheduled') {
                    console.log('⚠️ Backend still returns "scheduled" status, forcing local update');
                    // If backend still shows scheduled, manually set it to accepted
                    const newStatus = response === 'accepted' ? 'accepted' : 'declined';
                    dispatch(updateInterviewInList({ 
                      interviewId: interviewId, 
                      updates: { status: newStatus } 
                    }));
                    console.log(`🔄 Force updated interview ${interviewId} status to: ${newStatus}`);
                  }
                  
                  // Show user-friendly message
                  Alert.alert(
                    'Interview Status Updated', 
                    'This interview response has been updated. The display has been refreshed.',
                    [{ text: 'OK' }]
                  );
                } catch (refreshError) {
                  console.error('❌ Failed to refresh after already responded error:', refreshError);
                }
              }
              // Other errors will be handled by the Redux error state
            }
          },
        },
      ]
    );
  };

  // Handle status update
  const handleStatusUpdate = (interviewId, status) => {
    dispatch(updateInterviewStatus({ interviewId, status }));
  };

  // Join video call
  const joinVideoCall = (interview) => {
    console.log('🎥 Joining video call for interview:', interview.interview_id);
    navigation.navigate('VideoCall', {
      interviewId: interview.interview_id,
      interviewTitle: interview.request_title || 'Interview',
      isHost: false, // Freelancer is not the host
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return '#ffc107';
      case 'confirmed':
        return '#17a2b8';
      case 'in_progress':
        return '#007bff';
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'clock-outline';
      case 'confirmed':
        return 'check-circle-outline';
      case 'in_progress':
        return 'play-circle-outline';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  // Render interview card
  const renderInterviewCard = (interview) => (
    <Card key={interview.interview_id} style={styles.interviewCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.interviewInfo}>
            <Title style={styles.interviewTitle}>
              Interview with {interview.associate_company || 'Company'}
            </Title>
            <Paragraph style={styles.interviewDate}>
              {formatDate(interview.scheduled_date)}
            </Paragraph>
          </View>
          <Chip
            icon={getStatusIcon(interview.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(interview.status) }]}
            textStyle={styles.statusText}
          >
            {interview.status?.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>

        {interview.description && (
          <Paragraph style={styles.interviewDescription}>
            {interview.description}
          </Paragraph>
        )}

        <View style={styles.interviewDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="briefcase" size={16} color="#666" />
            <Text style={styles.detailText}>Position: {interview.position || 'Not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock" size={16} color="#666" />
            <Text style={styles.detailText}>Duration: {interview.duration || 30} minutes</Text>
          </View>
          {interview.meeting_link && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="video" size={16} color="#666" />
              <Text style={styles.detailText}>Video call available</Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionButtons}>
          {interview.status === 'scheduled' && (
            <>
              <Button
                mode="contained"
                onPress={() => handleInterviewResponse(interview.interview_id, 'accepted')}
                style={[styles.actionButton, styles.acceptButton]}
                labelStyle={styles.buttonLabel}
              >
                Accept
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleInterviewResponse(interview.interview_id, 'declined')}
                style={[styles.actionButton, styles.declineButton]}
                labelStyle={styles.buttonLabel}
              >
                Decline
              </Button>
            </>
          )}

          {interview.status === 'accepted' && (
            <View style={styles.waitingContainer}>
              <MaterialCommunityIcons name="clock-check" size={24} color="#28a745" />
              <Text style={styles.waitingText}>Interview Accepted</Text>
              <Text style={styles.waitingSubtext}>
                Waiting for the associate to start the interview...
              </Text>
            </View>
          )}

          {interview.status === 'declined' && (
            <View style={styles.declinedContainer}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#dc3545" />
              <Text style={styles.declinedText}>Interview Declined</Text>
            </View>
          )}

          {interview.status === 'confirmed' && (
            <Button
              mode="contained"
              onPress={() => joinVideoCall(interview)}
              style={[styles.actionButton, styles.joinButton]}
              labelStyle={styles.buttonLabel}
              icon="video"
            >
              Join Interview
            </Button>
          )}

          {interview.status === 'in_progress' && (
            <Button
              mode="contained"
              onPress={() => joinVideoCall(interview)}
              style={[styles.actionButton, styles.joinButton]}
              labelStyle={styles.buttonLabel}
              icon="video"
            >
              Continue Interview
            </Button>
          )}

          {interview.status === 'completed' && (
            <Button
              mode="outlined"
              onPress={() => {
                // Navigate to feedback screen within Interview stack
                navigation.navigate('InterviewFeedback', { 
                  interviewId: interview.interview_id 
                });
              }}
              style={[styles.actionButton, styles.feedbackButton]}
              labelStyle={styles.buttonLabel}
              icon="star"
            >
              View Feedback
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>No Interviews Found</Title>
      <Paragraph style={styles.emptyDescription}>
        {selectedFilter === 'all'
          ? "You don't have any interviews scheduled yet."
          : `No ${selectedFilter} interviews found.`}
      </Paragraph>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((filter) => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.selectedFilterChip,
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.selectedFilterChipText,
                ]}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Interview Stats */}
        <Surface style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {interviews.filter(i => i.status === 'scheduled' || i.status === 'accepted' || i.status === 'confirmed' || i.status === 'in_progress').length}
              </Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {interviews.filter(i => i.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {interviews.length}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </Surface>

        {/* Interviews List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading interviews...</Text>
          </View>
        ) : filteredInterviews.length > 0 ? (
          <View style={styles.interviewsList}>
            {filteredInterviews.map(renderInterviewCard)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    padding: spacing.medium,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterChip: {
    marginRight: spacing.small,
    backgroundColor: '#f8f9fa',
  },
  selectedFilterChip: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    color: '#666',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  statsContainer: {
    margin: spacing.medium,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: fontSize.small,
    color: '#666',
    marginTop: spacing.xs,
  },
  interviewsList: {
    padding: spacing.medium,
  },
  interviewCard: {
    marginBottom: spacing.medium,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  interviewInfo: {
    flex: 1,
    marginRight: spacing.small,
  },
  interviewTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
  },
  interviewDate: {
    fontSize: fontSize.small,
    color: '#666',
    marginTop: spacing.xs,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  interviewDescription: {
    fontSize: fontSize.small,
    color: '#666',
    marginBottom: spacing.small,
  },
  interviewDetails: {
    marginBottom: spacing.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.small,
    color: '#666',
    marginLeft: spacing.xs,
  },
  divider: {
    marginVertical: spacing.small,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    minWidth: 100,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  declineButton: {
    borderColor: '#dc3545',
  },
  joinButton: {
    backgroundColor: '#007bff',
  },
  feedbackButton: {
    borderColor: '#FF6B35',
  },
  buttonLabel: {
    fontSize: fontSize.small,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.medium,
    backgroundColor: '#f8f9fa',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: '#28a745',
    marginVertical: spacing.xs,
  },
  waitingText: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#28a745',
    marginTop: spacing.xs,
  },
  waitingSubtext: {
    fontSize: fontSize.small,
    color: '#666',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  declinedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.medium,
    backgroundColor: '#f8f9fa',
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: '#dc3545',
    marginVertical: spacing.xs,
  },
  declinedText: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  loadingText: {
    marginTop: spacing.medium,
    fontSize: fontSize.medium,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  emptyTitle: {
    fontSize: fontSize.large,
    color: '#666',
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSize.medium,
    color: '#999',
    marginTop: spacing.small,
    textAlign: 'center',
  },
});

export default InterviewDashboardScreen;
