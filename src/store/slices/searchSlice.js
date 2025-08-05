import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchAPI } from '../../services/api';

// Async thunks
export const searchFreelancers = createAsyncThunk(
  'search/searchFreelancers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await searchAPI.searchFreelancers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search freelancers');
    }
  }
);

export const fetchFreelancerDetails = createAsyncThunk(
  'search/fetchFreelancerDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await searchAPI.getFreelancerDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch freelancer details');
    }
  }
);

export const fetchSkills = createAsyncThunk(
  'search/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchAPI.getSkills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch skills');
    }
  }
);

const initialState = {
  freelancers: [],
  selectedFreelancer: null,
  skills: [],
  searchFilters: {
    skills: [],
    location: '',
    experience: '',
    availability: '',
  },
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = {
        skills: [],
        location: '',
        experience: '',
        availability: '',
      };
    },
    setSelectedFreelancer: (state, action) => {
      state.selectedFreelancer = action.payload;
    },
    clearSelectedFreelancer: (state) => {
      state.selectedFreelancer = null;
    },
    resetSearch: (state) => {
      state.freelancers = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Freelancers
      .addCase(searchFreelancers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchFreelancers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { freelancers, hasMore, currentPage } = action.payload;
        if (currentPage === 1) {
          state.freelancers = freelancers;
        } else {
          state.freelancers = [...state.freelancers, ...freelancers];
        }
        state.hasMore = hasMore;
        state.currentPage = currentPage;
        state.error = null;
      })
      .addCase(searchFreelancers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Freelancer Details
      .addCase(fetchFreelancerDetails.fulfilled, (state, action) => {
        state.selectedFreelancer = action.payload;
      })
      // Fetch Skills
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.skills = action.payload.skills || [];
      });
  },
});

export const {
  clearError,
  setSearchFilters,
  clearSearchFilters,
  setSelectedFreelancer,
  clearSelectedFreelancer,
  resetSearch,
} = searchSlice.actions;
export default searchSlice.reducer; 