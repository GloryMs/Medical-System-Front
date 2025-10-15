import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import Button from '../../components/auth/Button';
import Button from '../../components/common/Button';
import Input from '../../components/auth/Input';
import RoleSelectionModal from '../../components/auth/RoleSelectionModal';
import { Mail, Lock, AlertCircle, Stethoscope  } from 'lucide-react';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  /**
   * Handle traditional email/password login
   */
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login(data);
      
      // Navigate based on user role
      const role = response.role;
      let dashboardRoute = '/app';
      
      switch(role) {
        case 'PATIENT':
          dashboardRoute = '/app/patient/dashboard';
          break;
        case 'DOCTOR':
          dashboardRoute = '/app/doctor/dashboard';
          break;
        case 'ADMIN':
          dashboardRoute = '/app/admin/dashboard';
          break;
        default:
          dashboardRoute = '/app';
      }
      
      navigate(dashboardRoute);
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 
                     error.message || 
                     'Login failed. Please check your credentials.';
      setErrorMessage(message);
      setError('root', {
        type: 'manual',
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google Sign-In button click
   * Shows role selection modal first
   */
  const handleGoogleSignInClick = (credential) => {
    // Store the credential and show role selection modal
    setPendingGoogleCredential(credential);
    setShowRoleModal(true);
  };

  /**
   * Handle role selection from modal
   * Completes the Google Sign-In with selected role
   */
  const handleRoleSelect = async (selectedRole) => {
    if (!pendingGoogleCredential) return;

    setGoogleLoading(true);
    setErrorMessage('');

    try {
      const response = await googleLogin({
        idToken: pendingGoogleCredential,
        role: selectedRole
      });

      // Close modal
      setShowRoleModal(false);
      
      // Navigate based on role
      let dashboardRoute = '/app';
      switch(selectedRole) {
        case 'PATIENT':
          dashboardRoute = '/app/patient/dashboard';
          break;
        case 'DOCTOR':
          dashboardRoute = '/app/doctor/dashboard';
          break;
        case 'ADMIN':
          dashboardRoute = '/app/admin/dashboard';
          break;
        default:
          dashboardRoute = '/app';
      }
      
      navigate(dashboardRoute);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setErrorMessage('Google Sign-In failed. Please try again.');
      setError('root', {
        type: 'manual',
        message: 'Google Sign-In failed. Please try again.',
      });
      setShowRoleModal(false);
    } finally {
      setGoogleLoading(false);
      setPendingGoogleCredential(null);
    }
  };

  /**
   * Handle Google Sign-In error
   */
  const handleGoogleError = (error) => {
    console.error('Google Sign-In error:', error);
    setErrorMessage('Google Sign-In failed. Please try again or use email login.');
    setError('root', {
      type: 'manual',
      message: 'Google Sign-In failed. Please try again.',
    });
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    setShowRoleModal(false);
    setPendingGoogleCredential(null);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Medical Consultation account
            </p>
          </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="space-y-3">
            <div id="google-signin-button" className="w-full"></div>
            
            {/* Initialize Google Sign-In */}
            <GoogleSignInInitializer 
              onCredentialReceived={handleGoogleSignInClick}
              onError={handleGoogleError}
            />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading || googleLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer - Removed Terms/Privacy as it's not in Register */}
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={handleModalClose}
        onRoleSelect={handleRoleSelect}
        loading={googleLoading}
      />
    </div>
  );
};

/**
 * Component to initialize Google Sign-In
 */
const GoogleSignInInitializer = ({ onCredentialReceived, onError }) => {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // DEBUG: Check if Client ID is loaded
  console.log('Google Client ID:', GOOGLE_CLIENT_ID);
  
  React.useEffect(() => {
    // Check if Client ID is valid
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'undefined') {
      console.error('ERROR: REACT_APP_GOOGLE_CLIENT_ID is not defined in .env file');
      onError(new Error('Google Client ID not configured'));
      return;
    }

    // Check if script already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Sign-In script loaded successfully');
      // Wait a bit for Google to initialize
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          initializeGoogleSignIn();
        } else {
          console.error('Google Sign-In API not available after script load');
          onError(new Error('Failed to initialize Google Sign-In'));
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      onError(new Error('Failed to load Google Sign-In'));
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [GOOGLE_CLIENT_ID, onError]);

  const initializeGoogleSignIn = () => {
    try {
      console.log('Initializing Google Sign-In with Client ID:', GOOGLE_CLIENT_ID);
      
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        // Clear any existing content
        buttonDiv.innerHTML = '';
        
        window.google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonDiv.offsetWidth || 350
          }
        );
        console.log('Google Sign-In button rendered successfully');
      } else {
        console.error('google-signin-button div not found');
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      onError(error);
    }
  };

  const handleCredentialResponse = (response) => {
    console.log('Received credential response from Google');
    if (response.credential) {
      console.log('Credential received, length:', response.credential.length);
      onCredentialReceived(response.credential);
    } else {
      console.error('No credential in response');
      onError(new Error('No credential received'));
    }
  };

  return null;
};

export default Login;