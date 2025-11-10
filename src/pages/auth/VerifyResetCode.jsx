import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock, Eye, EyeOff, Stethoscope, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../services/api/authService';
import { toast } from 'react-toastify';
import medilinklog1 from '../../assets/medilinklog1.png'

const verifyResetSchema = yup.object({
  code: yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be 6 digits'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const identifier = location.state?.identifier;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(verifyResetSchema),
  });

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate('/forgot-password');
    }
  }, [identifier, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.verifyResetCode({
        identifier,
        code: data.code,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successful!');
      
      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError('root', { 
        message: error.response?.data?.message || error.message || 'Verification failed' 
      });
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authService.requestPasswordReset(identifier);
      toast.success('New verification code sent!');
      setTimeLeft(600); // Reset timer
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-20 rounded-2xl flex items-center justify-center mb-2">
                <img 
                  src={medilinklog1} 
                  alt="Custom icon" 
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Password Reset Successful!</h2>
            <p className="mt-4 text-gray-600">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate('/login')}
                fullWidth
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Code</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code sent to <strong>{identifier}</strong>
          </p>
          {timeLeft > 0 ? (
            <p className="mt-1 text-sm text-primary-600 font-semibold">
              Code expires in: {formatTime(timeLeft)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-red-600 font-semibold">
              Code expired! Please request a new one.
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('code')}
                type="text"
                maxLength="6"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest font-bold ${
                  errors.code ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="000000"
              />
            </div>
            {errors.code && (
              <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || isLoading}
            disabled={timeLeft <= 0}
          >
            Reset Password
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Didn't receive the code? Resend
            </button>
            <div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Forgot Password
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCode;