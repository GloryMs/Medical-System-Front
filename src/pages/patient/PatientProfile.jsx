import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  User,
  Heart,
  Phone,
  Shield,
  Bell,
  Globe,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Download,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  FileText,
  CreditCard,
  Users,
  Activity
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schemas
const personalInfoSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.string(),
  city: yup.string(),
  country: yup.string(),
  postalCode: yup.string()
});

const medicalHistorySchema = yup.object({
  bloodGroup: yup.string(),
  allergies: yup.string(),
  chronicConditions: yup.string(),
  medicalHistory: yup.string()
});

const emergencyContactSchema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone number is required'),
  relationship: yup.string().required('Relationship is required'),
  email: yup.string().email('Invalid email')
});

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const emergencyForm = useForm({
    resolver: yupResolver(emergencyContactSchema)
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
    loadEmergencyContacts();
    loadInsuranceInfo();
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
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        postalCode: profile.postalCode || ''
      });

      medicalForm.reset({
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies || '',
        chronicConditions: profile.chronicConditions || '',
        medicalHistory: profile.medicalHistory || ''
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

  const loadEmergencyContacts = async () => {
    try {
      const data = await execute(() => patientService.getEmergencyContacts());
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  };

  const loadInsuranceInfo = async () => {
    try {
      const data = await execute(() => patientService.getInsuranceInfo());
      setInsuranceInfo(data);
    } catch (error) {
      console.error('Failed to load insurance info:', error);
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
      if (selectedContact) {
        await execute(() => patientService.updateEmergencyContact(selectedContact.id, data));
      } else {
        await execute(() => patientService.addEmergencyContact(data));
      }
      await loadEmergencyContacts();
      setShowEmergencyContactModal(false);
      setSelectedContact(null);
      emergencyForm.reset();
    } catch (error) {
      console.error('Failed to save emergency contact:', error);
    }
  };

  const handleDeleteEmergencyContact = async () => {
    if (!deleteTarget) return;
    
    try {
      await execute(() => patientService.deleteEmergencyContact(deleteTarget.id));
      await loadEmergencyContacts();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete emergency contact:', error);
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
    { id: 'emergency', label: 'Emergency Contacts', icon: <Phone className="w-4 h-4" /> },
    { id: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" /> }
    // { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
    // { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> }
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
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary-600" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleAvatarUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.fullName || 'Patient Profile'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your personal information and preferences
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Profile {getProfileCompletionPercentage()}% complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="text-right">
                <div className="w-24 h-24 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
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
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <Card title="Personal Information">
                <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)}>
                  <div className="space-y-6 p-6">
                    {/* Basic Info */}
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
                          <p className="text-sm text-red-600 mt-1">
                            {personalForm.formState.errors.fullName.message}
                          </p>
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
                          type="tel"
                          {...personalForm.register('phoneNumber')}
                          disabled={!isEditing.personal}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <textarea
                            {...personalForm.register('address')}
                            disabled={!isEditing.personal}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

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
                              <option key={country.code} value={country.code}>
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                      {isEditing.personal ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
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
              <Card 
                title="Emergency Contacts"
                action={
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedContact(null);
                      setShowEmergencyContactModal(true);
                      emergencyForm.reset();
                    }}
                  >
                    Add Contact
                  </Button>
                }
              >
                <div className="p-6">
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-4">
                      {emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{contact.name}</h4>
                              <p className="text-sm text-gray-600">{contact.relationship}</p>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{contact.phone}</span>
                                </span>
                                {contact.email && (
                                  <span className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{contact.email}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowEmergencyContactModal(true);
                                emergencyForm.reset(contact);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={() => {
                                setDeleteTarget(contact);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No emergency contacts
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add emergency contacts to ensure we can reach someone in case of an emergency
                      </p>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedContact(null);
                          setShowEmergencyContactModal(true);
                          emergencyForm.reset();
                        }}
                      >
                        Add Emergency Contact
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <Card title="Insurance Information">
                <div className="p-6">
                  {insuranceInfo ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Insurance Provider
                          </label>
                          <p className="text-gray-900">{insuranceInfo.provider || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Policy Number
                          </label>
                          <p className="text-gray-900">{insuranceInfo.policyNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group Number
                          </label>
                          <p className="text-gray-900">{insuranceInfo.groupNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Effective Date
                          </label>
                          <p className="text-gray-900">{formatDate(insuranceInfo.effectiveDate)}</p>
                        </div>
                      </div>

                      {insuranceInfo.cardImage && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insurance Card
                          </label>
                          <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={insuranceInfo.cardImage}
                              alt="Insurance Card"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => {
                                setPreviewImage(insuranceInfo.cardImage);
                                setShowImageModal(true);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => setIsEditing({ ...isEditing, insurance: true })}
                        >
                          Update Insurance
                        </Button>
                        <input
                          type="file"
                          id="insurance-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              // Handle insurance card upload
                              patientService.uploadInsuranceCard(e.target.files[0])
                                .then(() => loadInsuranceInfo());
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          icon={<Upload className="w-4 h-4" />}
                          onClick={() => document.getElementById('insurance-upload').click()}
                        >
                          Upload Card
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No insurance information
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add your insurance information to streamline billing
                      </p>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsEditing({ ...isEditing, insurance: true })}
                      >
                        Add Insurance Info
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact Modal */}
      <FormModal
        isOpen={showEmergencyContactModal}
        onClose={() => {
          setShowEmergencyContactModal(false);
          setSelectedContact(null);
          emergencyForm.reset();
        }}
        onSubmit={emergencyForm.handleSubmit(handleEmergencyContactSubmit)}
        title={selectedContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        submitText={selectedContact ? 'Update Contact' : 'Add Contact'}
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...emergencyForm.register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="John Smith"
            />
            {emergencyForm.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">
                {emergencyForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <select
              {...emergencyForm.register('relationship')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            {emergencyForm.formState.errors.relationship && (
              <p className="text-sm text-red-600 mt-1">
                {emergencyForm.formState.errors.relationship.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              {...emergencyForm.register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="+1 (555) 123-4567"
            />
            {emergencyForm.formState.errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {emergencyForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              {...emergencyForm.register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="john.smith@email.com"
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteEmergencyContact}
        title="Delete Emergency Contact"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete Contact"
        type="error"
        isLoading={loading}
      />

      {/* Password Change Modal */}
      <FormModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          passwordForm.reset();
        }}
        onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
        title="Change Password"
        submitText="Update Password"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              {...passwordForm.register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              {...passwordForm.register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordForm.watch('newPassword') || 'Passwords do not match'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Insurance Card"
        size="lg"
      >
        <div className="flex justify-center">
          <img
            src={previewImage}
            alt="Insurance Card"
            className="max-w-full max-h-96 object-contain"
          />
        </div>
      </Modal>
    </div>
  );
};

export default PatientProfile;