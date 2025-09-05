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
  
  // Get interview ID from route params
  const interviewId = route?.params?.interviewId;
  console.log('🎯 InterviewFeedbackScreen: Interview ID from params:', interviewId);

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

     // Filter feedback data based on interview ID
   const getFilteredFeedback = () => {
     if (!myFeedback || !myFeedback.feedback_list) {
       console.log('🚫 No feedback data available');
       return null;
     }
     
     console.log('🔍 Filtering feedback for interviewId:', interviewId);
     console.log('📊 Available interviews:', myFeedback.feedback_list.map(i => ({
       id: i.interview_id,
       date: i.scheduled_date,
       hasFeedback: !!i.feedback_id
     })));
     
     if (interviewId) {
       // Show only specific interview feedback
       const specificInterview = myFeedback.feedback_list.find(interview => 
         interview.interview_id === parseInt(interviewId)
       );
       
       console.log('🎯 Specific interview found:', specificInterview ? 'YES' : 'NO');
       if (specificInterview) {
         console.log('📄 Interview details:', {
           id: specificInterview.interview_id,
           date: specificInterview.scheduled_date,
           title: specificInterview.job_title,
           hasFeedback: !!specificInterview.feedback_id
         });
       }
       
       if (specificInterview) {
         return {
           feedback_list: [specificInterview],
           summary: {
             totalInterviews: 1,
             feedbackReceived: specificInterview.feedback_id ? 1 : 0,
             averageRating: specificInterview.overall_rating || 0,
             hireRecommendations: specificInterview.recommendation === 'hire' ? 1 : 0,
             maybeRecommendations: specificInterview.recommendation === 'maybe' ? 1 : 0,
             noHireRecommendations: specificInterview.recommendation === 'no_hire' ? 1 : 0
           }
         };
       } else {
         console.log('❌ No interview found with ID:', interviewId);
         return {
           feedback_list: [],
           summary: {
             totalInterviews: 0,
             feedbackReceived: 0,
             averageRating: 0,
             hireRecommendations: 0,
             maybeRecommendations: 0,
             noHireRecommendations: 0
           }
         };
       }
     }
     
     // Show all feedback if no specific interview ID
     console.log('📜 Showing all feedback (no specific interview ID)');
     return myFeedback;
   };

  const filteredFeedback = getFilteredFeedback();

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
  const renderFeedbackCard = (interview) => (
    <Card key={interview.interview_id} style={styles.feedbackCard}>
      <Card.Content>
        <View style={styles.feedbackHeader}>
          <View style={styles.feedbackInfo}>
            <Title style={styles.feedbackTitle}>
              Interview for {interview.job_title || 'Position'}
            </Title>
            <Text style={styles.feedbackDate}>
              {new Date(interview.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.interviewerText}>
              {interview.company_industry} • Interviewed by {interview.interviewer_name}
            </Text>
          </View>
          {interview.feedback_id && (
            <Chip
              icon="star"
              style={styles.ratingChip}
              textStyle={styles.ratingChipText}
            >
              {interview.overall_rating || 0}/5
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        {interview.feedback_id ? (
          // Show feedback if it exists
          <>
            {/* Overall Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Overall Rating</Text>
              {renderStarRating(interview.overall_rating)}
            </View>

            {/* Recommendation */}
            <View style={styles.recommendationSection}>
              <Text style={styles.sectionTitle}>Recommendation</Text>
              <Chip
                icon={interview.recommendation === 'hire' ? 'thumb-up' : interview.recommendation === 'maybe' ? 'help' : 'thumb-down'}
                style={[
                  styles.recommendationChip,
                  {
                    backgroundColor: interview.recommendation === 'hire' ? '#28a745' : interview.recommendation === 'maybe' ? '#ffc107' : '#dc3545',
                  },
                ]}
                textStyle={styles.recommendationChipText}
              >
                {interview.recommendation === 'hire' ? 'Hire' : interview.recommendation === 'maybe' ? 'Maybe' : 'No Hire'}
              </Chip>
            </View>

            {/* Skill Ratings */}
            {(interview.technical_skills_rating || interview.communication_rating || interview.cultural_fit_rating) && (
              <View style={styles.skillsSection}>
                <Text style={styles.sectionTitle}>Skill Ratings</Text>
                {interview.technical_skills_rating && renderSkillRating('Technical Skills', interview.technical_skills_rating)}
                {interview.communication_rating && renderSkillRating('Communication', interview.communication_rating)}
                {interview.cultural_fit_rating && renderSkillRating('Cultural Fit', interview.cultural_fit_rating)}
              </View>
            )}

            {/* Strengths */}
            {interview.strengths && (
              <View style={styles.strengthsSection}>
                <Text style={styles.sectionTitle}>Strengths</Text>
                <Text style={styles.feedbackText}>{interview.strengths}</Text>
              </View>
            )}

            {/* Areas for Improvement */}
            {interview.areas_for_improvement && (
              <View style={styles.improvementSection}>
                <Text style={styles.sectionTitle}>Areas for Improvement</Text>
                <Text style={styles.feedbackText}>{interview.areas_for_improvement}</Text>
              </View>
            )}

            {/* Additional Comments */}
            {interview.detailed_feedback && (
              <View style={styles.commentsSection}>
                <Text style={styles.sectionTitle}>Detailed Feedback</Text>
                <Text style={styles.feedbackText}>{interview.detailed_feedback}</Text>
              </View>
            )}

            {/* Feedback Date */}
            {interview.feedback_date && (
              <View style={styles.feedbackDateSection}>
                <Text style={styles.feedbackDateText}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                  {' '}Feedback received on {new Date(interview.feedback_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </>
        ) : (
          // Show pending feedback message
          <View style={styles.pendingFeedbackSection}>
            <MaterialCommunityIcons name="clock-outline" size={48} color="#ccc" />
            <Text style={styles.pendingTitle}>Feedback Pending</Text>
            <Text style={styles.pendingDescription}>
              The associate hasn't submitted feedback for this interview yet.
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Render summary stats
  const renderSummaryStats = () => {
    if (!filteredFeedback || !filteredFeedback.summary) return null;

    const { summary } = filteredFeedback;
    
    return (
      <Surface style={styles.summaryContainer}>
        <Title style={styles.summaryTitle}>
          {interviewId ? 'Interview Feedback' : 'Your Interview Performance'}
        </Title>
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
            <Text style={styles.summaryNumber}>{summary.hireRecommendations || 0}</Text>
            <Text style={styles.summaryLabel}>Hire Recommendations</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>{summary.feedbackReceived || 0}</Text>
            <Text style={styles.summaryLabel}>Feedback Received</Text>
          </View>
        </View>
      </Surface>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="star-outline" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>
        {interviewId ? 'No Feedback for This Interview' : 'No Feedback Yet'}
      </Title>
      <Paragraph style={styles.emptyDescription}>
        {interviewId 
          ? 'This interview doesn\'t have any feedback yet. The associate may not have submitted feedback for this interview.'
          : 'You haven\'t received any interview feedback yet. Complete some interviews to see your performance feedback here.'
        }
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
                 ) : filteredFeedback && filteredFeedback.feedback_list && filteredFeedback.feedback_list.length > 0 ? (
           <>
             {/* Debug info */}
             {console.log('🎨 Rendering feedback:', {
               interviewId,
               feedbackCount: filteredFeedback.feedback_list.length,
               interviews: filteredFeedback.feedback_list.map(i => i.interview_id)
             })}
             {renderSummaryStats()}
             <View style={styles.feedbackList}>
               {filteredFeedback.feedback_list.map(renderFeedbackCard)}
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
  interviewerText: {
    fontSize: fontSize.small,
    color: '#888',
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
  pendingFeedbackSection: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  pendingTitle: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#666',
    marginTop: spacing.medium,
    textAlign: 'center',
  },
  pendingDescription: {
    fontSize: fontSize.small,
    color: '#999',
    marginTop: spacing.small,
    textAlign: 'center',
    paddingHorizontal: spacing.medium,
  },
  feedbackDateSection: {
    marginTop: spacing.medium,
    alignItems: 'flex-end',
  },
  feedbackDateText: {
    fontSize: fontSize.small,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default InterviewFeedbackScreen;
