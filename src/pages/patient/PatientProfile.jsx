import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Heart,
  Phone,
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Calendar,
  Mail,
  Building,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schemas
const personalInfoSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string(),
  city: yup.string(),
  country: yup.string(),
  postalCode: yup.string()
});

const medicalHistorySchema = yup.object().shape({
  bloodGroup: yup.string(),
  allergies: yup.string(),
  chronicConditions: yup.string(),
  medicalHistory: yup.string()
});

const emergencyContactSchema = yup.object().shape({
  emergencyContactName: yup.string().required('Contact name is required'),
  emergencyContactPhone: yup.string().required('Contact phone is required')
});

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [countries, setCountries] = useState([]);

  // Form setup for different sections
  const personalForm = useForm({
    resolver: yupResolver(personalInfoSchema)
  });

  const medicalForm = useForm({
    resolver: yupResolver(medicalHistorySchema)
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadProfile();
    loadCountries();
  }, []);

  // Update forms when profile data changes
  useEffect(() => {
    if (profile) {
      personalForm.reset({
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        postalCode: profile.postalCode || ''
      });

      medicalForm.reset({
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies || '',
        chronicConditions: profile.chronicConditions || '',
        medicalHistory: profile.medicalHistory || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || ''
      });
    }
  }, [profile, personalForm, medicalForm]);

  const loadProfile = async () => {
    try {
      const data = await execute(() => patientService.getProfile());
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await execute(() => commonService.getAllCountries());
      setCountries(data || []);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const handlePersonalInfoSubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => patientService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, personal: false });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleMedicalHistorySubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => patientService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, medical: false });
    } catch (error) {
      console.error('Failed to update medical history:', error);
    }
  };

  const handleEmergencyContactSubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => patientService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, emergency: false });
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const result = await execute(() => patientService.uploadAvatar(file));
      setProfile({ ...profile, avatar: result.avatarUrl });
      updateUser({ avatar: result.avatarUrl });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      await execute(() => patientService.changePassword(data));
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      'fullName', 'dateOfBirth', 'gender', 'phoneNumber', 
      'address', 'bloodGroup', 'emergencyContactName'
    ];
    
    const completedFields = fields.filter(field => profile[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical History', icon: <Heart className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Contacts', icon: <Phone className="w-4 h-4" /> }
  ];

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary-600" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleAvatarUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* User Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h1>
                  <p className="text-gray-600">{profile?.email}</p>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-primary-600">{getProfileCompletionPercentage()}%</p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProfileCompletionPercentage() / 100)}`}
                      className="text-primary-500 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {getProfileCompletionPercentage()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <Card title="Personal Information">
                <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)}>
                  <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          {...personalForm.register('fullName')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {personalForm.formState.errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{personalForm.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          {...personalForm.register('dateOfBirth')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          {...personalForm.register('gender')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          {...personalForm.register('phoneNumber')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          {...personalForm.register('email')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        {...personalForm.register('address')}
                        disabled={!isEditing.personal}
                        placeholder="Street address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          {...personalForm.register('city')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          {...personalForm.register('country')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          {...personalForm.register('postalCode')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      {isEditing.personal ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            icon={<X className="w-4 h-4" />}
                            onClick={() => {
                              setIsEditing({ ...isEditing, personal: false });
                              personalForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            icon={<Save className="w-4 h-4" />}
                            loading={loading}
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => setIsEditing({ ...isEditing, personal: true })}
                        >
                          Edit Information
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Card>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
              <Card title="Medical History">
                <form onSubmit={medicalForm.handleSubmit(handleMedicalHistorySubmit)}>
                  <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Group
                        </label>
                        <select
                          {...medicalForm.register('bloodGroup')}
                          disabled={!isEditing.medical}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergies
                      </label>
                      <textarea
                        {...medicalForm.register('allergies')}
                        disabled={!isEditing.medical}
                        rows={3}
                        placeholder="List any known allergies (medications, food, environmental, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chronic Conditions
                      </label>
                      <textarea
                        {...medicalForm.register('chronicConditions')}
                        disabled={!isEditing.medical}
                        rows={3}
                        placeholder="List any ongoing medical conditions (diabetes, hypertension, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical History
                      </label>
                      <textarea
                        {...medicalForm.register('medicalHistory')}
                        disabled={!isEditing.medical}
                        rows={5}
                        placeholder="Provide details about past surgeries, hospitalizations, family history, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      {isEditing.medical ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            icon={<X className="w-4 h-4" />}
                            onClick={() => {
                              setIsEditing({ ...isEditing, medical: false });
                              medicalForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            icon={<Save className="w-4 h-4" />}
                            loading={loading}
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => setIsEditing({ ...isEditing, medical: true })}
                        >
                          Edit Medical History
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Card>
            )}

            {/* Emergency Contacts Tab */}
            {activeTab === 'emergency' && (
              <Card title="Emergency Contact Information">
                <form onSubmit={medicalForm.handleSubmit(handleEmergencyContactSubmit)}>
                  <div className="space-y-6 p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Emergency Contact Information
                          </h4>
                          <p className="text-sm text-blue-700">
                            This information will be used to contact someone in case of a medical emergency.
                            Please ensure the details are accurate and up to date.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Name *
                        </label>
                        <input
                          {...medicalForm.register('emergencyContactName')}
                          disabled={!isEditing.emergency}
                          placeholder="Full name of emergency contact"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {medicalForm.formState.errors.emergencyContactName && (
                          <p className="text-red-500 text-sm mt-1">
                            {medicalForm.formState.errors.emergencyContactName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          {...medicalForm.register('emergencyContactPhone')}
                          disabled={!isEditing.emergency}
                          placeholder="Phone number with country code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        {medicalForm.formState.errors.emergencyContactPhone && (
                          <p className="text-red-500 text-sm mt-1">
                            {medicalForm.formState.errors.emergencyContactPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Display current emergency contact if exists */}
                    {profile?.emergencyContactName && !isEditing.emergency && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 rounded-full p-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {profile.emergencyContactName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {profile.emergencyContactPhone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      {isEditing.emergency ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            icon={<X className="w-4 h-4" />}
                            onClick={() => {
                              setIsEditing({ ...isEditing, emergency: false });
                              medicalForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            icon={<Save className="w-4 h-4" />}
                            loading={loading}
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => setIsEditing({ ...isEditing, emergency: true })}
                        >
                          {profile?.emergencyContactName ? 'Update Contact' : 'Add Contact'}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setPreviewImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img src={previewImage} alt="Preview" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile