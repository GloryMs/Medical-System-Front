import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api/authService';

/**
 * Custom React hook for Google OAuth authentication
 */
export const useGoogleAuth = () => {
  const navigate = useNavigate();

  /**
   * Initialize Google Sign-In
   * This should be called when component mounts
   */
  const initializeGoogleSignIn = useCallback(() => {
    // Load Google Sign-In library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /**
   * Handle Google Sign-In response
   * @param {Object} response - Google Sign-In response containing credential
   * @param {string} role - User role (PATIENT, DOCTOR, ADMIN) - REQUIRED
   */
  const handleGoogleSignIn = useCallback(async (response, role) => {
    if (!role) {
      throw new Error('Role is required for Google Sign-In');
    }
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the ID token to your backend
      const authResponse = await authService.googleLogin({
        idToken: response.credential,
        role: role
      });

      // Store authentication data
      localStorage.setItem('accessToken', authResponse.token);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      
      const userData = {
        id: authResponse.userId,
        email: authResponse.email,
        role: authResponse.role,
        fullName: authResponse.fullName
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // Navigate based on role
      const dashboardRoutes = {
        PATIENT: '/app/patient/dashboard',
        DOCTOR: '/app/doctor/dashboard',
        ADMIN: '/app/admin/dashboard'
      };

      const route = dashboardRoutes[authResponse.role] || '/app';
      navigate(route);

      return authResponse;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }, [navigate]);

  /**
   * Initialize Google One Tap
   * @param {string} clientId - Your Google Client ID
   * @param {Function} onSuccess - Callback for successful sign-in
   * @param {Function} onError - Callback for errors
   */
  const initializeOneTap = useCallback((clientId, onSuccess, onError) => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onSuccess,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Display the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        }
      });
    } else {
      console.error('Google Sign-In library not loaded');
      if (onError) onError(new Error('Google Sign-In library not loaded'));
    }
  }, []);

  /**
   * Render Google Sign-In button
   * @param {string} elementId - ID of the div element to render button
   * @param {string} clientId - Your Google Client ID
   * @param {Function} callback - Callback function for sign-in response
   */
  const renderGoogleButton = useCallback((elementId, clientId, callback) => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback
      });

      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%'
        }
      );
    }
  }, []);

  return {
    initializeGoogleSignIn,
    handleGoogleSignIn,
    initializeOneTap,
    renderGoogleButton
  };
};