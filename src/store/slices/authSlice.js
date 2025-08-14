import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, tokenService } from '../../services/api';
import { resetFreelancerState } from './freelancerSlice';
import { resetAdminState } from './adminSlice';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Debug: Log the response structure
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      console.log('Token:', response.data?.token);
      
      // Validate token before saving
      if (!response.data?.token) {
        console.error('No token received in response');
        return rejectWithValue('No authentication token received from server');
      }
      
      // Ensure token is a string
      const token = String(response.data.token);
      await tokenService.saveToken(token);
      
      return response.data;
    } catch (error) {
      // Handle network errors and other types of errors
      if (!error.response) {
        // Network error (no response from server)
        return rejectWithValue(error.message || 'Network error. Please check your connection.');
      }
      // Server error with response
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestPasswordReset(emailData.email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request password reset');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Remove token from secure storage
      await tokenService.removeToken();
      // Reset freelancer state
      dispatch(resetFreelancerState());
      // Reset admin state
      dispatch(resetAdminState());
      return null;
    } catch (error) {
      // Even if there's an error, try to remove the token
      try {
        await tokenService.removeToken();
      } catch (e) {
        console.log('Error removing token:', e);
      }
      return rejectWithValue('Logout failed');
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userType: null, // 'freelancer', 'associate', 'admin'
  hasExplicitlyLoggedOut: false, // Track if user has explicitly logged out
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.userType = action.payload?.user_type || null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // If we have a token, we should be authenticated
      if (action.payload) {
        state.isAuthenticated = true;
        state.hasExplicitlyLoggedOut = false; // Reset logout flag when setting token
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.userType = null;
      }

    },
    resetLogoutFlag: (state) => {
      state.hasExplicitlyLoggedOut = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.userType = action.payload.user.user_type;
        state.hasExplicitlyLoggedOut = false; // Reset logout flag on successful login
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
        state.token = action.payload.data.token;
        state.userType = action.payload.data.user_type;
        state.hasExplicitlyLoggedOut = false; // Reset logout flag on successful registration
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.userType = null;
        state.error = null;
        state.hasExplicitlyLoggedOut = true; // Mark that user has explicitly logged out
      })
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, setToken, resetLogoutFlag } = authSlice.actions;
export default authSlice.reducer; 