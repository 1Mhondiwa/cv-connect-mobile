import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '../../services/api';

// Async thunks
export const uploadCV = createAsyncThunk(
  'freelancer/uploadCV',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.uploadCV(formData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to upload CV';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getProfile = createAsyncThunk(
  'freelancer/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'freelancer/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('updateProfile thunk: Sending data:', profileData);
      const response = await profileAPI.updateProfile(profileData);
      console.log('updateProfile thunk: Response received:', response.data);
      return response.data;
    } catch (error) {
      // Preserve the full error object for debugging
      console.error('updateProfile thunk error:', error);
      console.error('updateProfile error.response:', error.response);
      console.error('updateProfile error.response.data:', error.response?.data);
      
      // Return only serializable error data
      return rejectWithValue({
        message: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update profile',
        responseData: error.response?.data,
        status: error.response?.status
      });
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'freelancer/updateAvailability',
  async (availabilityStatus, { rejectWithValue }) => {
    try {
      console.log('updateAvailability thunk: Sending availability:', availabilityStatus);
      const response = await profileAPI.updateAvailability(availabilityStatus);
      console.log('updateAvailability thunk: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('updateAvailability thunk error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update availability',
        responseData: error.response?.data,
        status: error.response?.status
      });
    }
  }
);

export const getDashboardData = createAsyncThunk(
  'freelancer/getDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get dashboard data');
    }
  }
);

export const getSkills = createAsyncThunk(
  'freelancer/getSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getSkills();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get skills');
    }
  }
);

export const addSkill = createAsyncThunk(
  'freelancer/addSkill',
  async (skillData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.addSkill(skillData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add skill');
    }
  }
);

export const updateSkill = createAsyncThunk(
  'freelancer/updateSkill',
  async ({ skillId, skillData }, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateSkill(skillId, skillData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update skill');
    }
  }
);

export const deleteSkill = createAsyncThunk(
  'freelancer/deleteSkill',
  async (skillId, { rejectWithValue }) => {
    try {
      const response = await profileAPI.deleteSkill(skillId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete skill');
    }
  }
);

const initialState = {
  profile: null,
  dashboardData: null,
  skills: [],
  isLoading: false,
  error: null,
  hasCV: false,
};

const freelancerSlice = createSlice({
  name: 'freelancer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setHasCV: (state, action) => {
      state.hasCV = action.payload;
    },
    resetFreelancerState: (state) => {
      state.profile = null;
      state.dashboardData = null;
      state.skills = [];
      state.hasCV = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload CV
      .addCase(uploadCV.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadCV.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only set hasCV to true if parsing was successful
        const parsingSuccessful = !action.payload.parsed_data?.parsing_error;
        state.hasCV = parsingSuccessful;
        state.error = null;
        // Update profile with CV information
        if (state.profile) {
          state.profile.cv = {
            cv_id: action.payload.cv_id,
            original_filename: action.payload.file.originalname,
            stored_filename: action.payload.file.filename,
            file_size: action.payload.file.size,
            parsing_status: parsingSuccessful ? 'completed' : 'failed'
          };
        }
      })
      .addCase(uploadCV.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract profile data from the response
        const profileData = action.payload.profile || action.payload;
        state.profile = profileData;
        
        // Check if CV exists and has valid data (parsing completed successfully)
        const hasCV = !!(profileData.cv && profileData.cv.cv_id && profileData.cv.parsing_status === 'completed');
        

        
        // Always update hasCV to ensure correct state
        state.hasCV = hasCV;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Availability
      .addCase(updateAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, availability: action.payload.availability };
        state.error = null;
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Dashboard Data
      .addCase(getDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
        state.error = null;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Skills
      .addCase(getSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = action.payload;
        state.error = null;
      })
      .addCase(getSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Skill
      .addCase(addSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSkill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills.push(action.payload);
        state.error = null;
      })
      .addCase(addSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Skill
      .addCase(updateSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.skills.findIndex(skill => skill.skill_id === action.payload.skill_id);
        if (index !== -1) {
          state.skills[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Skill
      .addCase(deleteSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = state.skills.filter(skill => skill.skill_id !== action.payload.skill_id);
        state.error = null;
      })
      .addCase(deleteSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setHasCV, resetFreelancerState } = freelancerSlice.actions;
export default freelancerSlice.reducer; 