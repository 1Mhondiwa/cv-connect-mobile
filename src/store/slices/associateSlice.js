import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { associateAPI } from '../../services/api';

// Async thunks
export const fetchAssociateDashboardStats = createAsyncThunk(
  'associate/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await associateAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAssociateProfile = createAsyncThunk(
  'associate/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await associateAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateAssociateProfile = createAsyncThunk(
  'associate/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await associateAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  dashboardStats: {
    total_freelancers: 0,
    total_conversations: 0,
    unread_messages: 0,
    recent_activity: []
  },
  profile: null,
  isLoading: false,
  error: null,
};

const associateSlice = createSlice({
  name: 'associate',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAssociateData: (state) => {
      state.dashboardStats = initialState.dashboardStats;
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchAssociateDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssociateDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAssociateDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchAssociateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssociateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAssociateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateAssociateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssociateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        state.error = null;
      })
      .addCase(updateAssociateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAssociateData } = associateSlice.actions;
export default associateSlice.reducer; 