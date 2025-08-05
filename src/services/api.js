import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
const API_BASE_URL = 'http://10.254.29.174:5000/api'; // Your computer's IP address

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('authToken');
      // You might want to redirect to login here
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
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/freelancer/profile'),
  updateProfile: (profileData) => api.put('/freelancer/profile', profileData),
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
  getDashboard: () => api.get('/freelancer/dashboard'),
};

// Search API
export const searchAPI = {
  searchFreelancers: (params) => api.get('/search/freelancers', { params }),
  getFreelancerDetails: (id) => api.get(`/search/freelancers/${id}`),
  searchBySkill: (skillId, params) => api.get(`/search/freelancers/by-skill/${skillId}`, { params }),
  getSkills: () => api.get('/search/skills'),
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
};

// Token management
export const tokenService = {
  saveToken: async (token) => {
    await SecureStore.setItemAsync('authToken', token);
  },
  getToken: async () => {
    return await SecureStore.getItemAsync('authToken');
  },
  removeToken: async () => {
    await SecureStore.deleteItemAsync('authToken');
  },
};

export default api; 