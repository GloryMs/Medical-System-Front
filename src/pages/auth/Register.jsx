import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, Mail, Lock, User, Stethoscope, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import medilinklog1 from '../../assets/medilinklog1.png'

const registerSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().nullable(), // Optional phone number
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().required('Please select your role'),
  terms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Transform data to match backend expectations
      const postData = {
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: `${data.firstName} ${data.lastName}`, // Merge first and last name
        phoneNumber: data.phoneNumber || null // Include phone number or null if empty
      };
      
      await registerUser(postData);
      navigate('/login');
    } catch (error) {
      setError('root', { message: error.message });
    }
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
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our medical consultation platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                {...register('firstName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                {...register('lastName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('email')}
                type="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('phoneNumber')}
                type="tel"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register('role')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select your role</option>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
            {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-center">
            <input
              {...register('terms')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-red-600">{errors.terms.message}</p>}

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting || isLoading}
          >
            Create Account
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;