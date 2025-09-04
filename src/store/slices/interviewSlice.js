import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewAPI } from '../../services/api';

// Async thunks
export const getInterviews = createAsyncThunk(
  'interview/getInterviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.getInterviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interviews');
    }
  }
);

export const scheduleInterview = createAsyncThunk(
  'interview/scheduleInterview',
  async (interviewData, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.scheduleInterview(interviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule interview');
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  'interview/respondToInvitation',
  async ({ invitationId, response }, { rejectWithValue }) => {
    try {
      const apiResponse = await interviewAPI.respondToInvitation(invitationId, response);
      return apiResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to invitation');
    }
  }
);

export const updateInterviewStatus = createAsyncThunk(
  'interview/updateInterviewStatus',
  async ({ interviewId, status }, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.updateInterviewStatus(interviewId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update interview status');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'interview/submitFeedback',
  async ({ interviewId, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.submitFeedback(interviewId, feedbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const getMyFeedback = createAsyncThunk(
  'interview/getMyFeedback',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.getMyFeedback();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback');
    }
  }
);

export const getInterviewDetails = createAsyncThunk(
  'interview/getInterviewDetails',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.getInterviewDetails(interviewId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview details');
    }
  }
);

export const startVideoCall = createAsyncThunk(
  'interview/startVideoCall',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.startVideoCall(interviewId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start video call');
    }
  }
);

export const endVideoCall = createAsyncThunk(
  'interview/endVideoCall',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await interviewAPI.endVideoCall(interviewId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end video call');
    }
  }
);

const initialState = {
  interviews: [],
  myFeedback: null,
  selectedInterview: null,
  isLoading: false,
  error: null,
  success: null,
  videoCallActive: false,
  currentVideoCall: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setSelectedInterview: (state, action) => {
      state.selectedInterview = action.payload;
    },
    clearSelectedInterview: (state) => {
      state.selectedInterview = null;
    },
    setVideoCallActive: (state, action) => {
      state.videoCallActive = action.payload;
    },
    setCurrentVideoCall: (state, action) => {
      state.currentVideoCall = action.payload;
    },
    updateInterviewInList: (state, action) => {
      const { interviewId, updates } = action.payload;
      const index = state.interviews.findIndex(interview => interview.interview_id === interviewId);
      if (index !== -1) {
        state.interviews[index] = { ...state.interviews[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get interviews
      .addCase(getInterviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInterviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interviews = action.payload.interviews || [];
      })
      .addCase(getInterviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Schedule interview
      .addCase(scheduleInterview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Interview scheduled successfully';
        if (action.payload.interview) {
          state.interviews.unshift(action.payload.interview);
        }
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Respond to invitation
      .addCase(respondToInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Response submitted successfully';
        // Update the interview in the list
        const { interviewId, updates } = action.payload;
        const index = state.interviews.findIndex(interview => interview.interview_id === interviewId);
        if (index !== -1) {
          state.interviews[index] = { ...state.interviews[index], ...updates };
        }
      })
      .addCase(respondToInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update interview status
      .addCase(updateInterviewStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInterviewStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Interview status updated successfully';
        // Update the interview in the list
        const { interviewId, updates } = action.payload;
        const index = state.interviews.findIndex(interview => interview.interview_id === interviewId);
        if (index !== -1) {
          state.interviews[index] = { ...state.interviews[index], ...updates };
        }
      })
      .addCase(updateInterviewStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Feedback submitted successfully';
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get my feedback
      .addCase(getMyFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myFeedback = action.payload;
      })
      .addCase(getMyFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get interview details
      .addCase(getInterviewDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInterviewDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedInterview = action.payload.interview;
      })
      .addCase(getInterviewDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Start video call
      .addCase(startVideoCall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startVideoCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videoCallActive = true;
        state.currentVideoCall = action.payload;
        state.success = 'Video call started successfully';
      })
      .addCase(startVideoCall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // End video call
      .addCase(endVideoCall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endVideoCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videoCallActive = false;
        state.currentVideoCall = null;
        state.success = 'Video call ended successfully';
      })
      .addCase(endVideoCall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setSelectedInterview,
  clearSelectedInterview,
  setVideoCallActive,
  setCurrentVideoCall,
  updateInterviewInList,
} = interviewSlice.actions;

export default interviewSlice.reducer;
