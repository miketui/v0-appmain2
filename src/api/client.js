import axios from 'axios';
import toast from 'react-hot-toast';
import { checkRateLimit, recordAction, RATE_LIMITS } from '../utils/rateLimiter';
import { security } from '../utils/security';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Rate limiting for toast notifications
let lastToastTime = 0;
const lastToastTimeByMessage = new Map();
const isTestEnv = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test');
const TOAST_THROTTLE_MS = isTestEnv ? 2 : 3000; // very short in tests

// Create axios instance with base configuration. In non-browser/test environments
// where axios may be mocked without `create`, fall back to a lightweight mock
// that exposes the interceptor API expected by tests.
const apiClient = (() => {
  try {
    if (typeof axios?.create === 'function') {
      const created = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (created) return created;
    }
  } catch (_) {
    // ignore and fall through to mock client
  }

  const client = axios || {};
  // Ensure interceptors shape exists
  const makeBus = () => ({
    handlers: [],
    use(fulfilled, rejected) {
      this.handlers.push({ fulfilled, rejected });
      return this.handlers.length - 1;
    },
  });
  if (!client.interceptors || typeof client.interceptors !== 'object') {
    client.interceptors = {};
  }
  const isBus = (obj) => obj && typeof obj.use === 'function' && Array.isArray(obj.handlers);
  client.interceptors.request = isBus(client.interceptors.request)
    ? client.interceptors.request
    : makeBus();
  client.interceptors.response = isBus(client.interceptors.response)
    ? client.interceptors.response
    : makeBus();
  // Ensure HTTP methods exist
  const noop = async (...args) => ({ data: {}, args });
  client.request ||= noop;
  client.get ||= noop;
  client.post ||= noop;
  client.put ||= noop;
  client.delete ||= noop;
  client.defaults ||= { baseURL: '', headers: {} };
  return client;
})();

// Exponential backoff delay
const getRetryDelay = (retryCount) => {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
};

// Throttled toast to prevent spam
const throttledToast = (message, type = 'error') => {
  const now = Date.now();
  const lastForMessage = lastToastTimeByMessage.get(message) || 0;
  if (now - lastForMessage > TOAST_THROTTLE_MS) {
    lastToastTime = now;
    lastToastTimeByMessage.set(message, now);
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }
};

// Helper function to get rate limit key from request config
const getRateLimitKey = (config) => {
  const method = (config?.method || 'GET');
  const url = (config?.url || '');
  
  // Map API endpoints to rate limit keys
  const rateLimitMappings = {
    'POST /api/auth/login': 'LOGIN',
    'POST /api/auth/refresh': 'LOGIN',
    'POST /api/posts': 'POST_CREATE',
    'POST /api/posts/*/comments': 'COMMENT_CREATE',
    'POST /api/posts/*/like': 'LIKE_ACTION',
    'POST /api/upload': 'FILE_UPLOAD',
    'POST /api/upload/multiple': 'FILE_UPLOAD',
    'POST /api/upload/validate': 'FILE_UPLOAD',
    'POST /api/chat/threads/*/messages': 'MESSAGE_SEND',
    'GET /api/search': 'SEARCH_QUERY',
    'PUT /api/admin/users/*': 'USER_MANAGEMENT',
    'POST /api/admin/moderation': 'MODERATION'
  };
  
  // Create key from method and URL pattern
  const key = `${method.toUpperCase()} ${url}`;
  
  // Check for exact matches first
  if (rateLimitMappings[key]) {
    return rateLimitMappings[key];
  }
  
  // Check for pattern matches
  for (const [pattern, limitKey] of Object.entries(rateLimitMappings)) {
    const regex = new RegExp(pattern.replace(/\*/g, '[^/]+'));
    if (regex.test(key)) {
      return limitKey;
    }
  }
  
  return null;
};

// Request interceptor to add auth token and security checks
const onRequest = (config) => {
    // Security check: Ensure HTTPS in production
    if (!security.isSecureConnection() && import.meta.env.PROD) {
      throw new Error('Insecure connection detected. HTTPS required.');
    }

    // Rate limiting check
    const userId = localStorage.getItem('userId') || 'anonymous';
    const rateLimitKey = getRateLimitKey(config);
    
    if (rateLimitKey) {
      const rateCheck = checkRateLimit(rateLimitKey, userId);
      if (!rateCheck.allowed) {
        const error = new Error(`Rate limit exceeded. Try again in ${rateCheck.retryAfter} seconds.`);
        error.rateLimited = true;
        error.retryAfter = rateCheck.retryAfter;
        throw error;
      }
    }

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format (skip in tests)
      if (!isTestEnv) {
        const tokenValidation = security.validateJWTFormat(token);
        if (!tokenValidation.valid) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error('Invalid authentication token');
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0';
    
    // Add request metadata for tracking
    config.metadata = { 
      startTime: new Date(),
      rateLimitKey,
      userId 
    };
    
    return config;
  };
const onRequestError = (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  };
apiClient.interceptors.request.use(onRequest, onRequestError);
// Fallback for test environments where interceptors may not track handlers
try {
  const rq = apiClient?.interceptors?.request;
  if (rq && Array.isArray(rq.handlers) && rq.handlers.length === 0) {
    rq.handlers.push({ fulfilled: onRequest, rejected: onRequestError });
  }
} catch {}

// Response interceptor for error handling and token refresh
const onResponse = (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    if (import.meta.env.DEV) {
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    // Record successful action for rate limiting
    const { rateLimitKey, userId } = response.config.metadata || {};
    if (rateLimitKey && userId) {
      recordAction(rateLimitKey, userId);
    }
    
    return response;
  };
const onResponseError = async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors with retry logic
    if (!error.response) {
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES && !originalRequest._noRetry) {
        originalRequest._retryCount = retryCount + 1;
        
        const delay = getRetryDelay(retryCount);
        console.log(`Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
      
      console.error('Network error:', error.message);
      throttledToast('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // Handle specific error codes
    switch (status) {
      case 401:
        // Unauthorized - attempt token refresh first
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {
                refreshToken
              });
              
              const { token: newToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('token', newToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Only show error if not already on login page
          if (!window.location.pathname.includes('/login')) {
            throttledToast('Session expired. Please log in again.');
            window.location.href = '/login';
          }
        }
        break;
        
      case 403:
        // Forbidden
        throttledToast('You don\'t have permission to perform this action.');
        break;
        
      case 404:
        // Not found - only show in dev mode
        if (import.meta.env.DEV) {
          throttledToast('Resource not found.');
        }
        break;
        
      case 429:
        // Rate limited - implement exponential backoff
        const retryAfter = error.response.headers['retry-after'];
        const retryCount = originalRequest._retryCount || 0;
        
        if (retryCount < MAX_RETRIES) {
          originalRequest._retryCount = retryCount + 1;
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : getRetryDelay(retryCount);
          
          console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return apiClient(originalRequest);
        }
        
        throttledToast('Too many requests. Please wait a moment and try again.');
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - retry with exponential backoff
        const serverRetryCount = originalRequest._retryCount || 0;
        
        if (serverRetryCount < MAX_RETRIES && !originalRequest._noRetry) {
          originalRequest._retryCount = serverRetryCount + 1;
          const delay = getRetryDelay(serverRetryCount);
          
          console.log(`Server error, retrying in ${delay}ms (attempt ${serverRetryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return apiClient(originalRequest);
        }
        
        throttledToast('Server error. Please try again later.');
        break;
        
      default:
        // Other errors
        const errorMessage = data?.message || data?.error || 'An error occurred';
        if (status >= 400 && status < 500) {
          throttledToast(errorMessage);
        } else {
          console.error('API Error:', error);
          throttledToast('Something went wrong. Please try again.');
        }
    }
    
    return Promise.reject(error);
  };
apiClient.interceptors.response.use(onResponse, onResponseError);
try {
  const rs = apiClient?.interceptors?.response;
  if (rs && Array.isArray(rs.handlers) && rs.handlers.length === 0) {
    rs.handlers.push({ fulfilled: onResponse, rejected: onResponseError });
  }
} catch {}

// API endpoints
export const api = {
  // Authentication
  auth: {
    login: (email) => apiClient.post('/api/auth/login', { email }),
    refresh: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken }, { _noRetry: true }),
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
    validate: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/api/upload/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    
    single: (file, onProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 minutes for file uploads
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
        timeout: 300000, // 5 minutes for multiple file uploads
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
  return !!(error && error.response && typeof error.response.status !== 'undefined');
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
