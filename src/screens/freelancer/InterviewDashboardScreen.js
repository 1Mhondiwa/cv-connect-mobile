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

  // Load interviews on component mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Loading interviews...');
      console.log('👤 User authenticated:', isAuthenticated);
      console.log('👤 User type:', userType);
      console.log('👤 User data:', user);
      
      if (isAuthenticated && userType === 'freelancer') {
        dispatch(getInterviews());
      } else {
        console.log('❌ User not authenticated or not a freelancer');
      }
    }, [dispatch, isAuthenticated, userType])
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
        return interview.status === 'scheduled' || interview.status === 'confirmed';
      case 'completed':
        return interview.status === 'completed';
      case 'cancelled':
        return interview.status === 'cancelled';
      default:
        return true;
    }
  });

  // Handle interview response
  const handleInterviewResponse = (interviewId, response) => {
    Alert.alert(
      'Confirm Response',
      `Are you sure you want to ${response} this interview?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(respondToInvitation({ invitationId: interviewId, response }));
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
  const joinVideoCall = (meetingLink) => {
    if (meetingLink) {
      Linking.openURL(meetingLink).catch(err => {
        Alert.alert('Error', 'Could not open video call link');
      });
    }
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
                onPress={() => handleInterviewResponse(interview.interview_id, 'accept')}
                style={[styles.actionButton, styles.acceptButton]}
                labelStyle={styles.buttonLabel}
              >
                Accept
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleInterviewResponse(interview.interview_id, 'decline')}
                style={[styles.actionButton, styles.declineButton]}
                labelStyle={styles.buttonLabel}
              >
                Decline
              </Button>
            </>
          )}

          {interview.status === 'confirmed' && (
            <Button
              mode="contained"
              onPress={() => joinVideoCall(interview.meeting_link)}
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
              onPress={() => joinVideoCall(interview.meeting_link)}
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
                // Navigate to feedback screen through Profile stack
                navigation.navigate('Profile', { 
                  screen: 'InterviewFeedback', 
                  params: { interviewId: interview.interview_id } 
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
                {interviews.filter(i => i.status === 'scheduled' || i.status === 'confirmed').length}
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
