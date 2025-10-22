import { authAPI } from './api';

/**
 * Authentication service for managing user authentication state
 * Handles login, logout, token management, and user data persistence
 */
class AuthService {
  constructor() {
    this.user = null;
    this.token = null;
    this.loadFromStorage();
  }

  /**
   * Load user data and token from localStorage
   */
  loadFromStorage() {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuth();
    }
  }

  /**
   * Save user data and token to localStorage
   */
  saveToStorage() {
    try {
      if (this.user && this.token) {
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  clearAuth() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Login response
   */
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        this.user = response.data.user;
        this.token = response.data.token;
        this.saveToStorage();
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user (admin only)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response
   */
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // If admin is registering themselves, log them in
        if (userData.email === this.user?.email) {
          this.user = response.data.user;
          this.token = response.data.token;
          this.saveToStorage();
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   */
  logout() {
    this.clearAuth();
  }

  /**
   * Get current user
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get current token
   * @returns {string|null} - Current token or null
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!(this.user && this.token);
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has role
   */
  hasRole(role) {
    return this.user?.role === role;
  }

  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is judge
   * @returns {boolean} - True if user is judge
   */
  isJudge() {
    return this.hasRole('judge');
  }

  /**
   * Refresh user profile from server
   * @returns {Promise<Object>} - Updated user data
   */
  async refreshProfile() {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success) {
        this.user = response.data.user;
        this.saveToStorage();
      }
      
      return response;
    } catch (error) {
      // If profile refresh fails, user might be logged out
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Update response
   */
  async updateProfile(profileData) {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        this.user = response.data.user;
        this.saveToStorage();
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if token is expired
   * @returns {boolean} - True if token is expired
   */
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get user's full name or username
   * @returns {string} - User's display name
   */
  getDisplayName() {
    if (!this.user) return '';
    
    return this.user.username || this.user.email || 'User';
  }

  /**
   * Get user's initials for avatar
   * @returns {string} - User's initials
   */
  getInitials() {
    if (!this.user) return 'U';
    
    const name = this.getDisplayName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;