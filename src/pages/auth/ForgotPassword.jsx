import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, ArrowLeft, Stethoscope, Phone, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import authService from '../../services/api/authService';
import { toast } from 'react-toastify';

const forgotPasswordSchema = yup.object({
  identifier: yup.string()
    .required('Email or phone number is required')
    .test('valid-identifier', 'Please enter a valid email or phone number', (value) => {
      if (!value) return false;
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid phone (basic check for numbers)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return emailRegex.test(value) || (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10);
    }),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const identifier = watch('identifier');
  const isEmail = identifier && identifier.includes('@');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(data.identifier);
      setSuccess(true);
      toast.success(response.message || 'Verification code sent successfully!');
      
      // Navigate to verify code page after 2 seconds
      setTimeout(() => {
        navigate('/verify-reset-code', { 
          state: { identifier: data.identifier } 
        });
      }, 2000);
    } catch (error) {
      setError('root', { 
        message: error.response?.data?.message || error.message || 'Failed to send verification code' 
      });
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Check Your {isEmail ? 'Email' : 'Phone'}</h2>
            <p className="mt-4 text-gray-600">
              We've sent a verification code to <strong>{identifier}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              The code will expire in 10 minutes.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate('/verify-reset-code', { state: { identifier } })}
                fullWidth
              >
                Enter Verification Code
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
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address or phone number and we'll send you a verification code to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              {identifier && identifier.includes('@') ? (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              ) : (
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              )}
              <input
                {...register('identifier')}
                type="text"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="email@example.com or +1234567890"
              />
            </div>
            {errors.identifier && (
              <p className="text-sm text-red-600 mt-1">{errors.identifier.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              You can use either your registered email or phone number
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || isLoading}
          >
            Send Verification Code
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;