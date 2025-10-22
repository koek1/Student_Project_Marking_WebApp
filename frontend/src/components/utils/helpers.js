import { format, parseISO, isValid } from 'date-fns';
import { clsx } from 'clsx';

// Utility functions for common operations

// Format date for display
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};


// Format date with time for display
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};


// Format date for API
export const formatDateForAPI = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};


//Format datetime for API
export const formatDateTimeForAPI = (date) => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};


// Combine class names using clsx

export const cn = (...classes) => {
  return clsx(classes);
};


// Capitalize first letter of string
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


//Capitalize all words in string
export const titleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};



//Generate initials from name
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};


//Truncate text to specified length
export const truncateText = (text, length, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};


//Format number with commas
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
};


// Format percentage
export const formatPercentage = (num, decimals = 1) => {
  if (typeof num !== 'number') return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
};


//Generate random ID
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


//Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};


//Deep clone object
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
  return obj;
};


// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};


// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


// Validate student number format (8 digits)
export const isValidStudentNumber = (studentNumber) => {
  const studentNumberRegex = /^\d{8}$/;
  return studentNumberRegex.test(studentNumber);
};


// Get file extension from filename
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  return filename.split('.').pop().toLowerCase();
};


// Format file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


// Sleep for specified milliseconds
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


// Retry function with exponential backoff
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export default {
  formatDate,
  formatDateTime,
  formatDateForAPI,
  formatDateTimeForAPI,
  cn,
  capitalize,
  titleCase,
  getInitials,
  truncateText,
  formatNumber,
  formatPercentage,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  isValidEmail,
  isValidStudentNumber,
  getFileExtension,
  formatFileSize,
  sleep,
  retry
};