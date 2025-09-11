import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import config from '../config/config';

// Create axios instance
const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retry: config.RETRY_ATTEMPTS,
  retryDelay: (retryCount) => {
    return retryCount * config.RETRY_DELAY; // time interval between retries
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Debug: Log successful responses
    console.log('API Response:', response.status, response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Network error
    if (!error.response) {
      console.error('Network Error:', error.message);
      // Check if it's a connection refused error (wrong port/IP)
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        return Promise.reject({
          ...error,
          message: 'Cannot connect to server. Please check if the server is running.'
        });
      }
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject({
          ...error,
          message: 'Request timed out. Please try again.'
        });
      }
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.'
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      console.log('Unauthorized access, removing token');
      await SecureStore.deleteItemAsync('authToken');
      // Let the component handle the redirect
      return Promise.reject({
        ...error,
        message: 'Session expired. Please login again.'
      });
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject({
        ...error,
        message: 'You do not have permission to perform this action.'
      });
    }

    // Handle 404 Not Found
    if (error.response.status === 404) {
      return Promise.reject({
        ...error,
        message: 'The requested resource was not found.'
      });
    }

    // Handle 422 Validation Error
    if (error.response.status === 422) {
      return Promise.reject({
        ...error,
        message: error.response.data.message || 'Validation failed. Please check your input.'
      });
    }

    // Handle 429 Too Many Requests
    if (error.response.status === 429) {
      return Promise.reject({
        ...error,
        message: 'Too many requests. Please try again later.'
      });
    }

    // Handle 500 Internal Server Error
    if (error.response.status >= 500) {
      return Promise.reject({
        ...error,
        message: 'Server error. Please try again later.'
      });
    }

    // Retry the request if we haven't reached max retries
    if (originalRequest.retry === undefined) {
      originalRequest.retry = 0;
    }

    if (originalRequest.retry < api.defaults.retry) {
      originalRequest.retry += 1;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, api.defaults.retryDelay(originalRequest.retry));
      });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  requestPasswordReset: (email) => api.post('/auth/request-reset', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  createAdmin: (adminData) => api.post('/auth/create-admin', adminData),
  submitAssociateRequest: (requestData) => api.post('/associate-request/submit', requestData),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/freelancer/profile'),
  updateProfile: (profileData) => api.put('/freelancer/profile', profileData),
  updateAvailability: (availabilityStatus) => api.put('/freelancer/availability', { availability_status: availabilityStatus }),
  uploadCV: (formData) => api.post('/freelancer/cv/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data, // Prevent axios from transforming FormData
  }),
  uploadProfileImage: (formData) => api.post('/freelancer/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProfileImage: () => api.delete('/freelancer/profile-image'),
  addSkill: (skillData) => api.post('/freelancer/skills', skillData),
  updateSkill: (skillId, skillData) => api.put(`/freelancer/skills/${skillId}`, skillData),
  deleteSkill: (skillId) => api.delete(`/freelancer/skills/${skillId}`),
  
  // Work Experience Management
  addWorkExperience: (workData) => api.post('/freelancer/work-experience', workData),
  updateWorkExperience: (workId, workData) => api.put(`/freelancer/work-experience/${workId}`, workData),
  deleteWorkExperience: (workId) => api.delete(`/freelancer/work-experience/${workId}`),
  
  // Education Management
  addEducation: (educationData) => api.post('/freelancer/education', educationData),
  updateEducation: (educationId, educationData) => api.put(`/freelancer/education/${educationId}`, educationData),
  deleteEducation: (educationId) => api.delete(`/freelancer/education/${educationId}`),
  
  // CV Parsed Data Management
  updateCVParsedData: (parsedData) => api.put('/freelancer/cv/parsed-data', { parsed_data: parsedData }),
  
  getDashboard: () => api.get('/freelancer/dashboard'),
  getActivity: () => api.get('/freelancer/activity'),
  getHiringStats: () => api.get('/freelancer/hiring/stats'),
  getHiringHistory: () => api.get('/freelancer/hiring/history'),
};

// Search API
export const searchAPI = {
  searchFreelancers: (params) => api.get('/search/freelancers', { params }),
  getFreelancerDetails: (id) => api.get(`/search/freelancers/${id}`),
  searchBySkill: (skillId, params) => api.get(`/search/freelancers/by-skill/${skillId}`, { params }),
  getSkills: () => api.get('/search/skills'),
  searchAssociates: (params) => api.get('/search/associates', { params }),
};

// Messages API
export const messageAPI = {
  getConversations: () => api.get('/message/conversations'),
  createConversation: (recipientId) => api.post('/message/conversations', { recipient_id: recipientId }),
  getMessages: (conversationId, params) => api.get(`/message/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) => api.post(`/message/conversations/${conversationId}/messages`, { content }),
  deleteMessage: (messageId) => api.delete(`/message/messages/${messageId}`),
  markAsRead: (conversationId) => api.put(`/message/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get('/message/unread-count'),
};

// Admin API
export const adminAPI = {
  addAssociate: (associateData) => api.post('/auth/add-associate', associateData),
  addFreelancer: (freelancerData) => api.post('/auth/add-freelancer', freelancerData),
  getStats: () => api.get('/admin/stats'),
  getFreelancers: () => api.get('/admin/freelancers'),
  getAssociates: () => api.get('/admin/associates'),
  toggleUserActive: (userId) => api.put(`/admin/users/${userId}/toggle-active`),
  uploadProfileImage: (formData) => api.post('/admin/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProfileImage: () => api.delete('/admin/profile-image'),
};

// Associate API
export const associateAPI = {
  getProfile: () => api.get('/associate/profile'),
  updateProfile: (profileData) => api.put('/associate/profile', profileData),
  getDashboard: () => api.get('/associate/dashboard'),
  getDashboardStats: () => api.get('/associate/dashboard-stats'),
  getSavedProfiles: () => api.get('/associate/saved-profiles'),
  checkIfSaved: (freelancerId) => api.get(`/associate/check-saved/${freelancerId}`),
  saveProfile: (freelancerId) => api.post('/associate/save-profile', { freelancer_id: freelancerId }),
  removeSaved: (freelancerId) => api.delete(`/associate/remove-saved/${freelancerId}`),
};

// Hiring API
export const hiringAPI = {
  getHiringHistory: (freelancerId) => api.get(`/hiring/freelancer/${freelancerId}/history`),
  getCurrentHiring: (freelancerId) => api.get(`/hiring/freelancer/${freelancerId}/current`),
  getHiringStats: (freelancerId) => api.get(`/hiring/freelancer/${freelancerId}/stats`),
  respondToOffer: (hiringId, data) => api.put(`/hiring/${hiringId}/respond`, data),
  updateHiringStatus: (hiringId, data) => api.put(`/hiring/${hiringId}/status`, data),
};

// Interview API
export const interviewAPI = {
  // Schedule interview (for associates)
  scheduleInterview: (interviewData) => api.post('/interview/schedule', interviewData),
  
  // Get interviews for current user
  getInterviews: (params) => api.get('/interview/', { params }),
  
  // Respond to interview invitation
  respondToInvitation: (interviewId, response) => api.post('/interview/respond', { interview_id: interviewId, response }),
  
  // Update interview status
  updateInterviewStatus: (interviewId, status) => api.put('/interview/status', { interview_id: interviewId, status }),
  
  // Submit interview feedback (for associates)
  submitFeedback: (interviewId, feedbackData) => api.post('/interview/feedback', { interview_id: interviewId, ...feedbackData }),
  
  // Get interview feedback (for freelancers)
  getMyFeedback: () => api.get('/interview/my-feedback'),
  
  // Get interview details (using the main endpoint with ID filter)
  getInterviewDetails: (interviewId) => api.get('/interview/', { params: { interview_id: interviewId } }),
  
  // Start video call (update interview status to in_progress)
  startVideoCall: (interviewId) => api.put('/interview/status', { interview_id: interviewId, status: 'in_progress' }),
  
  // End video call (update interview status to completed)
  endVideoCall: (interviewId) => api.put('/interview/status', { interview_id: interviewId, status: 'completed' }),
};

// Token management
export const tokenService = {
  saveToken: async (token) => {
    // Validate token before saving
    if (!token) {
      throw new Error('Token is required');
    }
    
    // Ensure token is a string
    const tokenString = String(token);
    
    // Validate token format (basic JWT validation)
    if (!tokenString.includes('.')) {
      throw new Error('Invalid token format');
    }
    
    await SecureStore.setItemAsync('authToken', tokenString);
  },
  getToken: async () => {
    return await SecureStore.getItemAsync('authToken');
  },
  removeToken: async () => {
    await SecureStore.deleteItemAsync('authToken');
  },
};

export default api; 