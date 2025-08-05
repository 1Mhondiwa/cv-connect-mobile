import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '../../services/api';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadCV = createAsyncThunk(
  'profile/uploadCV',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.uploadCV(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload CV');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await profileAPI.uploadProfileImage(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false,
  uploadProgress: 0,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Upload CV
      .addCase(uploadCV.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(uploadCV.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(uploadCV.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Upload Profile Image
      .addCase(uploadProfileImage.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUploadProgress, resetUploadProgress } = profileSlice.actions;
export default profileSlice.reducer; 