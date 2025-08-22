import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  setUser,
  clearError
} from '../store/slices/authSlice';
import authService from '../services/api/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(state => state.auth);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Verify token is still valid
          const userData = await authService.checkAuth();
          dispatch(setUser(userData));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        authService.logout();
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  // Google login function
  const googleLogin = async (googleToken) => {
    try {
      dispatch(loginStart());
      const response = await authService.googleLogin(googleToken);
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch(loginStart());
      const response = await authService.register(userData);
      // Don't auto-login after registration, user needs to verify email
      return response;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    } finally {
      dispatch(loginFailure(null)); // Clear loading state
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch(logoutAction());
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch(setUser(response));
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Resend verification function
  const resendVerification = async (email) => {
    try {
      const response = await authService.resendVerification(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Enable 2FA function
  const enable2FA = async () => {
    try {
      const response = await authService.enable2FA();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify 2FA function
  const verify2FA = async (token, secret) => {
    try {
      const response = await authService.verify2FA(token, secret);
      dispatch(setUser(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Disable 2FA function
  const disable2FA = async (token) => {
    try {
      const response = await authService.disable2FA(token);
      dispatch(setUser(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Clear error function
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user is verified
  const isVerified = () => {
    return user?.isVerified === true;
  };

  // Check if user has active subscription (for patients)
  const hasActiveSubscription = () => {
    if (user?.role !== 'PATIENT') return true;
    return user?.subscription?.status === 'ACTIVE';
  };

  // Check if doctor is verified
  const isDoctorVerified = () => {
    if (user?.role !== 'DOCTOR') return true;
    return user?.verificationStatus === 'VERIFIED';
  };

  // Get user's full name
  const getFullName = () => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  // Get user's initials
  const getInitials = () => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get user's display name
  const getDisplayName = () => {
    const fullName = getFullName();
    if (fullName) return fullName;
    return user?.email || 'User';
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const userData = await authService.checkAuth();
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || initializing,
    error,
    initializing,

    // Actions
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    enable2FA,
    verify2FA,
    disable2FA,
    clearAuthError,
    refreshUser,

    // Utility functions
    hasRole,
    hasAnyRole,
    isVerified,
    hasActiveSubscription,
    isDoctorVerified,
    getFullName,
    getInitials,
    getDisplayName,
  };
};