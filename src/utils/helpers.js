import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { VALIDATION_RULES, SOCIAL_PATTERNS, FILE_LIMITS } from './constants';

// Date and time utilities
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatTime = (date) => {
  return formatDate(date, 'h:mm a');
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirst).join(' ');
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

export const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const getMimeTypeFromExtension = (extension) => {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

export const isImageFile = (file) => {
  return FILE_LIMITS.allowedTypes.images.includes(file.type);
};

export const isDocumentFile = (file) => {
  return FILE_LIMITS.allowedTypes.documents.includes(file.type);
};

export const isVideoFile = (file) => {
  return FILE_LIMITS.allowedTypes.videos.includes(file.type);
};

export const validateFileSize = (file, maxSize = FILE_LIMITS.maxSize) => {
  return file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDisplayName = (name) => {
  if (!name) return false;
  if (name.length < VALIDATION_RULES.displayName.minLength) return false;
  if (name.length > VALIDATION_RULES.displayName.maxLength) return false;
  return VALIDATION_RULES.displayName.pattern.test(name);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  return VALIDATION_RULES.phone.pattern.test(phone);
};

export const validateSocialHandle = (handle, platform) => {
  if (!handle) return true; // Social handles are optional
  
  const pattern = SOCIAL_PATTERNS[platform];
  if (!pattern) return true;
  
  return pattern.test(handle);
};

export const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < VALIDATION_RULES.password.minLength) return false;
  return VALIDATION_RULES.password.pattern.test(password);
};

// URL utilities
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const createQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

// Local storage utilities
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

// Array utilities
export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Number utilities
export const formatNumber = (num, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCompactNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Debounce and throttle utilities
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep object utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

// Performance utilities
export const measurePerformance = (func, label = 'Operation') => {
  return (...args) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  };
};

// Development utilities
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

export const isProduction = () => {
  return import.meta.env.PROD;
};

export const debugLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

export default {
  // Date utilities
  formatDate,
  formatRelativeTime,
  formatTime,
  formatDateTime,
  
  // Text utilities
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  extractMentions,
  extractHashtags,
  
  // File utilities
  formatFileSize,
  getFileExtension,
  getMimeTypeFromExtension,
  isImageFile,
  isDocumentFile,
  isVideoFile,
  validateFileSize,
  validateFileType,
  
  // Validation utilities
  validateEmail,
  validateDisplayName,
  validatePhone,
  validateSocialHandle,
  validatePassword,
  
  // URL utilities
  isValidUrl,
  createQueryString,
  parseQueryString,
  
  // Storage utilities
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  
  // Array utilities
  uniqueBy,
  groupBy,
  sortBy,
  
  // Number utilities
  formatNumber,
  formatCompactNumber,
  clamp,
  random,
  
  // Color utilities
  hexToRgb,
  rgbToHex,
  
  // Function utilities
  debounce,
  throttle,
  
  // Object utilities
  deepClone,
  deepEqual,
  
  // Performance utilities
  measurePerformance,
  
  // Development utilities
  isDevelopment,
  isProduction,
  debugLog,
};