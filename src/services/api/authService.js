import { api } from './apiClient';

const authService = {
  // Login with email and password
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    
    // Store tokens and user info
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response;
  },

  // Google OAuth login
  googleLogin: async (googleToken) => {
    const response = await api.post('/api/auth/google', { token: googleToken });
    
    // Store tokens and user info
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/auth/refresh', { refreshToken });
    
    // Update stored tokens
    localStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response;
  },

  // Change password (authenticated user)
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response;
  },

  // Resend email verification
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await api.post('/api/auth/2fa/enable');
    return response;
  },

  // Verify 2FA setup
  verify2FA: async (token, secret) => {
    const response = await api.post('/api/auth/2fa/verify', { token, secret });
    return response;
  },

  // Disable 2FA
  disable2FA: async (token) => {
    const response = await api.post('/api/auth/2fa/disable', { token });
    return response;
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      const response = await api.get('/api/auth/me');
      
      // Update user info in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/profile', userData);
    
    // Update user info in localStorage
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/api/auth/account', {
      data: { password }
    });
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response;
  },
};

export default authService;