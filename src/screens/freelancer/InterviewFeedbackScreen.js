import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Surface,
  ProgressBar,
  Chip,
  Divider,
} from 'react-native-paper';

// Redux actions
import {
  getMyFeedback,
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

const InterviewFeedbackScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { myFeedback, isLoading, error, success } = useSelector((state) => state.interview);
  
  const [refreshing, setRefreshing] = useState(false);

  // Load feedback on component mount
  useEffect(() => {
    console.log('🔄 InterviewFeedbackScreen: Loading feedback...');
    dispatch(getMyFeedback());
  }, [dispatch]);

  // Clear error and success messages
  useEffect(() => {
    console.log('📊 InterviewFeedbackScreen state:', { myFeedback, isLoading, error, success });
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
    if (success) {
      Alert.alert('Success', success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch, myFeedback, isLoading]);

  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(getMyFeedback()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  // Render star rating
  const renderStarRating = (rating, maxRating = 5) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={20}
          color={i <= rating ? '#FFD700' : '#ccc'}
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  // Render skill rating
  const renderSkillRating = (skill, rating) => (
    <View key={skill} style={styles.skillRating}>
      <Text style={styles.skillName}>{skill}</Text>
      <View style={styles.ratingContainer}>
        <ProgressBar
          progress={rating / 5}
          color="#FF6B35"
          style={styles.progressBar}
        />
        <Text style={styles.ratingText}>{rating}/5</Text>
      </View>
    </View>
  );

  // Render feedback card
  const renderFeedbackCard = (feedback) => (
    <Card key={feedback.feedback_id || feedback.interview_id} style={styles.feedbackCard}>
      <Card.Content>
        <View style={styles.feedbackHeader}>
          <View style={styles.feedbackInfo}>
            <Title style={styles.feedbackTitle}>
              Interview for {feedback.job_title || 'Position'}
            </Title>
            <Text style={styles.feedbackDate}>
              {new Date(feedback.feedback_date || feedback.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Chip
            icon="star"
            style={styles.ratingChip}
            textStyle={styles.ratingChipText}
          >
            {feedback.overall_rating || 0}/5
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* Overall Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          {renderStarRating(feedback.overall_rating)}
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Chip
            icon={feedback.recommendation === 'hire' ? 'thumb-up' : feedback.recommendation === 'maybe' ? 'help' : 'thumb-down'}
            style={[
              styles.recommendationChip,
              {
                backgroundColor: feedback.recommendation === 'hire' ? '#28a745' : feedback.recommendation === 'maybe' ? '#ffc107' : '#dc3545',
              },
            ]}
            textStyle={styles.recommendationChipText}
          >
            {feedback.recommendation === 'hire' ? 'Hire' : feedback.recommendation === 'maybe' ? 'Maybe' : 'No Hire'}
          </Chip>
        </View>

        {/* Skill Ratings */}
        {(feedback.technical_skills_rating || feedback.communication_rating || feedback.cultural_fit_rating) && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skill Ratings</Text>
            {feedback.technical_skills_rating && renderSkillRating('Technical Skills', feedback.technical_skills_rating)}
            {feedback.communication_rating && renderSkillRating('Communication', feedback.communication_rating)}
            {feedback.cultural_fit_rating && renderSkillRating('Cultural Fit', feedback.cultural_fit_rating)}
          </View>
        )}

        {/* Strengths */}
        {feedback.strengths && (
          <View style={styles.strengthsSection}>
            <Text style={styles.sectionTitle}>Strengths</Text>
            <Text style={styles.feedbackText}>{feedback.strengths}</Text>
          </View>
        )}

        {/* Areas for Improvement */}
        {feedback.areas_for_improvement && (
          <View style={styles.improvementSection}>
            <Text style={styles.sectionTitle}>Areas for Improvement</Text>
            <Text style={styles.feedbackText}>{feedback.areas_for_improvement}</Text>
          </View>
        )}

        {/* Additional Comments */}
        {feedback.detailed_feedback && (
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Detailed Feedback</Text>
            <Text style={styles.feedbackText}>{feedback.detailed_feedback}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Render summary stats
  const renderSummaryStats = () => {
    if (!myFeedback || !myFeedback.summary) return null;

    const { summary } = myFeedback;
    
    return (
      <Surface style={styles.summaryContainer}>
        <Title style={styles.summaryTitle}>Your Interview Performance</Title>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>{summary.totalInterviews || 0}</Text>
            <Text style={styles.summaryLabel}>Total Interviews</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>{summary.averageRating?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.summaryLabel}>Avg Rating</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>
              {summary.totalInterviews > 0 ? Math.round((summary.hireRecommendations / summary.totalInterviews) * 100) : 0}%
            </Text>
            <Text style={styles.summaryLabel}>Hire Rate</Text>
          </View>
        </View>
      </Surface>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="star-outline" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>No Feedback Yet</Title>
      <Paragraph style={styles.emptyDescription}>
        You haven't received any interview feedback yet. Complete some interviews to see your performance feedback here.
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading feedback...</Text>
          </View>
        ) : myFeedback && myFeedback.feedback_list && myFeedback.feedback_list.length > 0 ? (
          <>
            {renderSummaryStats()}
            <View style={styles.feedbackList}>
              {myFeedback.feedback_list.map(renderFeedbackCard)}
            </View>
          </>
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
  summaryContainer: {
    margin: spacing.medium,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  summaryLabel: {
    fontSize: fontSize.small,
    color: '#666',
    marginTop: spacing.xs,
  },
  feedbackList: {
    padding: spacing.medium,
  },
  feedbackCard: {
    marginBottom: spacing.medium,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  feedbackInfo: {
    flex: 1,
    marginRight: spacing.small,
  },
  feedbackTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackDate: {
    fontSize: fontSize.small,
    color: '#666',
    marginTop: spacing.xs,
  },
  ratingChip: {
    backgroundColor: '#FF6B35',
  },
  ratingChipText: {
    color: '#fff',
    fontSize: fontSize.small,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: spacing.small,
  },
  ratingSection: {
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.small,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationSection: {
    marginBottom: spacing.medium,
  },
  recommendationChip: {
    alignSelf: 'flex-start',
  },
  recommendationChipText: {
    color: '#fff',
    fontSize: fontSize.small,
    fontWeight: 'bold',
  },
  skillsSection: {
    marginBottom: spacing.medium,
  },
  skillRating: {
    marginBottom: spacing.small,
  },
  skillName: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.small,
  },
  ratingText: {
    fontSize: fontSize.small,
    color: '#666',
    minWidth: 30,
    textAlign: 'right',
  },
  strengthsSection: {
    marginBottom: spacing.medium,
  },
  improvementSection: {
    marginBottom: spacing.medium,
  },
  commentsSection: {
    marginBottom: spacing.medium,
  },
  feedbackText: {
    fontSize: fontSize.small,
    color: '#666',
    lineHeight: 20,
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

export default InterviewFeedbackScreen;
