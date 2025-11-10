import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/auth/Input';
import RoleSelectionModal from '../../components/auth/RoleSelectionModal';
import { Mail, Lock, Stethoscope } from 'lucide-react';
import { toast } from 'react-toastify';
import medilinklog1 from '../../assets/medilinklog1.png'

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

    try {
      const response = await login(data);
      
      // Show success toast
      toast.success('Login successful! Redirecting...');
      
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
      
      // Show error toast
      toast.error(message);
      
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

    try {
      const response = await googleLogin({
        idToken: pendingGoogleCredential,
        role: selectedRole
      });

      // Show success toast
      toast.success('Google Sign-In successful! Redirecting...');

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
      const message = error?.message || 'Google Sign-In failed. Please try again.';
      
      // Show error toast
      toast.error(message);
      
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
    toast.error('Google Sign-In failed. Please try again or use email login.');
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
              <div className="w-24 h-20 rounded-2xl flex items-center justify-center mb-2">
                <img 
                  src={medilinklog1} 
                  alt="Custom icon" 
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your Medical Consultation account
            </p>
          </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
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
                  to="/forgot-password"
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
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
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

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services script loaded');
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      onError(new Error('Failed to load Google Sign-In'));
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      );

      console.log('Google Sign-In initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      onError(error);
    }
  };

  const handleCredentialResponse = (response) => {
    console.log('Google credential received');
    if (response.credential) {
      onCredentialReceived(response.credential);
    } else {
      onError(new Error('No credential received from Google'));
    }
  };

  return null;
};

export default Login;