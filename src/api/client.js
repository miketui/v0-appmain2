import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    if (import.meta.env.DEV) {
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // Handle specific error codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('token');
          
          // Only show error if not already on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          }
        }
        break;
        
      case 403:
        // Forbidden
        toast.error('You don\'t have permission to perform this action.');
        break;
        
      case 404:
        // Not found
        if (import.meta.env.DEV) {
          toast.error('Resource not found.');
        }
        break;
        
      case 429:
        // Rate limited
        toast.error('Too many requests. Please wait a moment and try again.');
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        // Other errors
        const errorMessage = data?.message || data?.error || 'An error occurred';
        if (status >= 400 && status < 500) {
          toast.error(errorMessage);
        } else {
          console.error('API Error:', error);
          toast.error('Something went wrong. Please try again.');
        }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Authentication
  auth: {
    login: (email) => apiClient.post('/api/auth/login', { email }),
    getProfile: () => apiClient.get('/api/auth/profile'),
    updateProfile: (data) => apiClient.put('/api/auth/profile', data),
    apply: (applicationData) => apiClient.post('/api/auth/apply', { applicantData: applicationData }),
  },
  
  // Posts
  posts: {
    getAll: (params = {}) => apiClient.get('/api/posts', { params }),
    getById: (id) => apiClient.get(`/api/posts/${id}`),
    create: (data) => apiClient.post('/api/posts', data),
    update: (id, data) => apiClient.put(`/api/posts/${id}`, data),
    delete: (id) => apiClient.delete(`/api/posts/${id}`),
    like: (id, liked = true) => apiClient.post(`/api/posts/${id}/like`, { liked }),
    comment: (id, content) => apiClient.post(`/api/posts/${id}/comments`, { content }),
  },
  
  // Documents
  documents: {
    getAll: (params = {}) => apiClient.get('/api/documents', { params }),
    getById: (id) => apiClient.get(`/api/documents/${id}`),
    upload: (formData) => apiClient.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => apiClient.get(`/api/documents/${id}/download`),
    delete: (id) => apiClient.delete(`/api/documents/${id}`),
  },
  
  // Chat
  chat: {
    getThreads: () => apiClient.get('/api/chat/threads'),
    getThread: (id) => apiClient.get(`/api/chat/threads/${id}`),
    createThread: (data) => apiClient.post('/api/chat/threads', data),
    getMessages: (threadId, params = {}) => apiClient.get(`/api/chat/threads/${threadId}/messages`, { params }),
    sendMessage: (threadId, data) => apiClient.post(`/api/chat/threads/${threadId}/messages`, data),
    markAsRead: (threadId, messageId) => apiClient.put(`/api/chat/threads/${threadId}/messages/${messageId}/read`),
  },
  
  // Users
  users: {
    getAll: (params = {}) => apiClient.get('/api/users', { params }),
    getById: (id) => apiClient.get(`/api/users/${id}`),
    search: (query) => apiClient.get('/api/users/search', { params: { q: query } }),
  },
  
  // Houses
  houses: {
    getAll: () => apiClient.get('/api/houses'),
    getById: (id) => apiClient.get(`/api/houses/${id}`),
    create: (data) => apiClient.post('/api/houses', data),
    update: (id, data) => apiClient.put(`/api/houses/${id}`, data),
    getMembers: (id) => apiClient.get(`/api/houses/${id}/members`),
  },
  
  // Notifications
  notifications: {
    getAll: (params = {}) => apiClient.get('/api/notifications', { params }),
    markAsRead: (id) => apiClient.put(`/api/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/api/notifications/read-all'),
    delete: (id) => apiClient.delete(`/api/notifications/${id}`),
  },
  
  // Admin
  admin: {
    getApplications: (params = {}) => apiClient.get('/api/admin/applications', { params }),
    updateApplication: (id, data) => apiClient.put(`/api/admin/applications/${id}`, data),
    getAnalytics: () => apiClient.get('/api/admin/analytics'),
    getUsers: (params = {}) => apiClient.get('/api/admin/users', { params }),
    updateUser: (id, data) => apiClient.put(`/api/admin/users/${id}`, data),
  },
  
  // Search
  search: {
    global: (query, params = {}) => apiClient.get('/api/search', { params: { q: query, ...params } }),
  },
  
  // File uploads
  upload: {
    single: (file, onProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
    },
    
    multiple: (files, onProgress) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      return apiClient.post('/api/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
    },
  },
};

// Utility functions
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  if (customMessage) {
    toast.error(customMessage);
    return;
  }
  
  const message = error.response?.data?.message || 
                 error.response?.data?.error || 
                 error.message || 
                 'An unexpected error occurred';
  
  toast.error(message);
};

export const isApiError = (error) => {
  return error.response && error.response.status;
};

export const getApiErrorStatus = (error) => {
  return error.response?.status;
};

export const getApiErrorMessage = (error) => {
  return error.response?.data?.message || 
         error.response?.data?.error || 
         error.message || 
         'An unexpected error occurred';
};

export default apiClient;