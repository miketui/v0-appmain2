// Application constants and configuration

export const APP_CONFIG = {
  name: 'Haus of Basquiat',
  description: 'A vibrant community platform for the ballroom and voguing scene',
  version: '1.0.0',
  author: 'Terragon Labs',
};

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// User roles and permissions
export const USER_ROLES = {
  APPLICANT: 'Applicant',
  MEMBER: 'Member', 
  LEADER: 'Leader',
  ADMIN: 'Admin',
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  BANNED: 'banned',
};

// Ballroom-specific constants
export const BALLROOM_CATEGORIES = [
  'Voguing',
  'Runway',
  'Fashion',
  'Performance', 
  'Realness',
  'Butch Queen',
  'Femme Queen',
  'Butch',
  'House Parent',
  'Commentary',
];

export const FAMOUS_HOUSES = [
  'House of Aviance',
  'House of Mizrahi',
  'House of Labeija',
  'House of Pendavis',
  'House of Xtravaganza',
  'House of Ninja',
  'House of Prodigy',
  'House of Balenciaga',
  'House of Mugler',
  'House of Saint Laurent',
];

// File upload limits
export const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    videos: ['video/mp4', 'video/webm', 'video/ogg'],
  },
};

// Post visibility options
export const POST_VISIBILITY = {
  PUBLIC: 'public',
  HOUSE_ONLY: 'house_only', 
  MEMBERS_ONLY: 'members_only',
};

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  MESSAGE: 'message',
  APPLICATION: 'application',
  SYSTEM: 'system',
};

// Theme colors (matching Tailwind config)
export const THEME_COLORS = {
  ballroom: {
    red: '#dc2626',
    blue: '#2563eb',
    yellow: '#eab308',
    gold: '#fbbf24',
    purple: '#9333ea',
    green: '#16a34a',
  },
  status: {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#eab308',
    info: '#2563eb',
  },
};

// Social media patterns
export const SOCIAL_PATTERNS = {
  instagram: /^@[\w](?:[\w.]{0,28}[\w])?$/,
  tiktok: /^@[\w](?:[\w.]{0,22}[\w])?$/,
  twitter: /^@[\w]{1,15}$/,
  youtube: /^[\w-]{1,100}$/,
};

// Validation rules
export const VALIDATION_RULES = {
  displayName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_'.]+$/,
  },
  bio: {
    maxLength: 500,
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
};

// Cache configurations
export const CACHE_CONFIG = {
  userProfile: 5 * 60 * 1000, // 5 minutes
  posts: 2 * 60 * 1000, // 2 minutes
  documents: 10 * 60 * 1000, // 10 minutes
  notifications: 1 * 60 * 1000, // 1 minute
};

// Local storage keys
export const STORAGE_KEYS = {
  authToken: 'haus_auth_token',
  userProfile: 'haus_user_profile',
  recentSearches: 'haus_recent_searches',
  preferences: 'haus_user_preferences',
  drafts: 'haus_post_drafts',
};

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You need to be logged in to perform this action.',
  forbidden: 'You don\'t have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  rateLimited: 'Too many requests. Please wait a moment and try again.',
  serverError: 'Server error. Please try again later.',
  generic: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  login: 'Welcome back!',
  logout: 'You have been logged out successfully.',
  profileUpdated: 'Your profile has been updated.',
  postCreated: 'Your post has been shared!',
  postLiked: 'Post liked!',
  commentAdded: 'Comment added!',
  messagesSent: 'Message sent!',
  documentUploaded: 'Document uploaded successfully!',
  applicationSubmitted: 'Your application has been submitted for review.',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableChat: true,
  enableDocuments: true,
  enableNotifications: true,
  enableAnalytics: import.meta.env.PROD,
  enablePWA: true,
  enableRealtime: true,
  enableFileUpload: true,
  enableVideoChat: false, // Future feature
  enablePayments: false, // Future feature
};

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  postsPerPage: 10,
  messagesPerPage: 50,
  documentsPerPage: 20,
  notificationsPerPage: 20,
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default {
  APP_CONFIG,
  API_CONFIG,
  USER_ROLES,
  USER_STATUS,
  BALLROOM_CATEGORIES,
  FAMOUS_HOUSES,
  FILE_LIMITS,
  POST_VISIBILITY,
  NOTIFICATION_TYPES,
  THEME_COLORS,
  SOCIAL_PATTERNS,
  VALIDATION_RULES,
  CACHE_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  PAGINATION,
  BREAKPOINTS,
};