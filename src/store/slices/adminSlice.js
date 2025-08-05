import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

// Async thunks
export const getAdminStats = createAsyncThunk(
  'admin/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get admin stats');
    }
  }
);

export const getFreelancers = createAsyncThunk(
  'admin/getFreelancers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getFreelancers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get freelancers');
    }
  }
);

export const getAssociates = createAsyncThunk(
  'admin/getAssociates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAssociates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get associates');
    }
  }
);

export const toggleUserActive = createAsyncThunk(
  'admin/toggleUserActive',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.toggleUserActive(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
);

export const addAssociate = createAsyncThunk(
  'admin/addAssociate',
  async (associateData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.addAssociate(associateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add associate');
    }
  }
);

const initialState = {
  stats: null,
  freelancers: [],
  associates: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAdminState: (state) => {
      state.stats = null;
      state.freelancers = [];
      state.associates = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Admin Stats
      .addCase(getAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Freelancers
      .addCase(getFreelancers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFreelancers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.freelancers = action.payload.freelancers;
        state.error = null;
      })
      .addCase(getFreelancers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Associates
      .addCase(getAssociates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAssociates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.associates = action.payload.associates;
        state.error = null;
      })
      .addCase(getAssociates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle User Active
      .addCase(toggleUserActive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the user's active status in the appropriate list
        const { userId, is_active } = action.payload;
        
        // Update in freelancers list
        const freelancerIndex = state.freelancers.findIndex(f => f.user_id === userId);
        if (freelancerIndex !== -1) {
          state.freelancers[freelancerIndex].is_active = is_active;
        }
        
        // Update in associates list
        const associateIndex = state.associates.findIndex(a => a.user_id === userId);
        if (associateIndex !== -1) {
          state.associates[associateIndex].is_active = is_active;
        }
        
        state.error = null;
      })
      .addCase(toggleUserActive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Associate
      .addCase(addAssociate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addAssociate.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the new associate to the list
        state.associates.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(addAssociate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetAdminState } = adminSlice.actions;
export default adminSlice.reducer; 