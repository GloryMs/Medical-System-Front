import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Heart, 
  Phone, 
  Shield, 
  Upload,
  Trash2,
  Plus,
  Eye,
  Calendar
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schemas
const personalInfoSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  postalCode: yup.string().required('Postal code is required')
});

const medicalHistorySchema = yup.object({
  bloodGroup: yup.string(),
  allergies: yup.string(),
  chronicConditions: yup.string(),
  medicalHistory: yup.string()
});

const emergencyContactSchema = yup.object({
  name: yup.string().required('Name is required'),
  relationship: yup.string().required('Relationship is required'),
  phoneNumber: yup.string().required('Phone number is required'),
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
        // Update existing contact
        const updatedContact = await execute(() => 
          patientService.updateEmergencyContact(selectedContact.id, data)
        );
        setEmergencyContacts(prev => 
          prev.map(contact => contact.id === selectedContact.id ? updatedContact : contact)
        );
      } else {
        // Create new contact
        const newContact = await execute(() => patientService.createEmergencyContact(data));
        setEmergencyContacts(prev => [...prev, newContact]);
      }
      setShowEmergencyContactModal(false);
      setSelectedContact(null);
      emergencyForm.reset();
    } catch (error) {
      console.error('Failed to save emergency contact:', error);
    }
  };

  const handleDeleteEmergencyContact = async () => {
    try {
      await execute(() => patientService.deleteEmergencyContact(deleteTarget.id));
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete emergency contact:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const updatedProfile = await execute(() => patientService.uploadAvatar(formData));
        setProfile(updatedProfile);
        updateUser({ ...user, avatar: updatedProfile.avatar });
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updatedProfile = await execute(() => patientService.removeAvatar());
      setProfile(updatedProfile);
      updateUser({ ...user, avatar: null });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
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

  // Updated tabs without Preferences and Security
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical History', icon: <Heart className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Contacts', icon: <Phone className="w-4 h-4" /> },
    { id: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" /> }
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
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <label className="bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.fullName || 'Complete your profile'}
                  </h1>
                  <p className="text-gray-600">
                    Patient ID: {profile?.patientId || 'N/A'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active Patient
                    </span>
                    <span className="text-sm text-gray-500">
                      Member since {formatDate(profile?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-2">Profile Completion</p>
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
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
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-100'
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
                <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="p-6">
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
                        <p className="text-red-500 text-sm mt-1">
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
                      {personalForm.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.dateOfBirth.message}
                        </p>
                      )}
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
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {personalForm.formState.errors.gender && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.gender.message}
                        </p>
                      )}
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
                      {personalForm.formState.errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        {...personalForm.register('address')}
                        disabled={!isEditing.personal}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      {personalForm.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        {...personalForm.register('city')}
                        disabled={!isEditing.personal}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      {personalForm.formState.errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        {...personalForm.register('country')}
                        disabled={!isEditing.personal}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {personalForm.formState.errors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        {...personalForm.register('postalCode')}
                        disabled={!isEditing.personal}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      {personalForm.formState.errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {personalForm.formState.errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
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
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setIsEditing({ ...isEditing, personal: true })}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
              <Card title="Medical History">
                <form onSubmit={medicalForm.handleSubmit(handleMedicalHistorySubmit)} className="p-6">
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
                        <option value="">Select blood group</option>
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Known Allergies
                      </label>
                      <textarea
                        {...medicalForm.register('allergies')}
                        disabled={!isEditing.medical}
                        rows={3}
                        placeholder="List any known allergies to medications, foods, or other substances"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chronic Conditions
                      </label>
                      <textarea
                        {...medicalForm.register('chronicConditions')}
                        disabled={!isEditing.medical}
                        rows={3}
                        placeholder="List any ongoing medical conditions or chronic illnesses"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
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
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setIsEditing({ ...isEditing, medical: true })}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {/* Emergency Contacts Tab */}
            {activeTab === 'emergency' && (
              <Card title="Emergency Contacts">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                      Add emergency contacts who can be reached in case of medical emergencies.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedContact(null);
                        emergencyForm.reset();
                        setShowEmergencyContactModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {emergencyContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No emergency contacts added yet.</p>
                      <p className="text-sm">Add contacts who can be reached in emergencies.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emergencyContacts.map((contact) => (
                        <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{contact.name}</h4>
                              <p className="text-sm text-gray-600">{contact.relationship}</p>
                              <p className="text-sm text-gray-600">{contact.phoneNumber}</p>
                              {contact.email && (
                                <p className="text-sm text-gray-600">{contact.email}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedContact(contact);
                                  emergencyForm.reset(contact);
                                  setShowEmergencyContactModal(true);
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDeleteTarget(contact);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-6 h-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-900">
                              {insuranceInfo.providerName}
                            </h4>
                            <p className="text-sm text-blue-700">
                              Policy Number: {insuranceInfo.policyNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group Number
                          </label>
                          <p className="text-gray-900">{insuranceInfo.groupNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Policy Holder
                          </label>
                          <p className="text-gray-900">{insuranceInfo.policyHolder}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship to Patient
                          </label>
                          <p className="text-gray-900">{insuranceInfo.relationshipToPatient}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Coverage Type
                          </label>
                          <p className="text-gray-900">{insuranceInfo.coverageType}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button variant="outline">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Update Insurance
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No insurance information on file.</p>
                      <p className="text-sm mb-4">Add your insurance details to streamline billing.</p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Insurance
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
      {showEmergencyContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            
            <form onSubmit={emergencyForm.handleSubmit(handleEmergencyContactSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  {...emergencyForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {emergencyForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
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
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
                {emergencyForm.formState.errors.relationship && (
                  <p className="text-red-500 text-sm mt-1">
                    {emergencyForm.formState.errors.relationship.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  {...emergencyForm.register('phoneNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {emergencyForm.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {emergencyForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...emergencyForm.register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {emergencyForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {emergencyForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEmergencyContactModal(false);
                    setSelectedContact(null);
                    emergencyForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {selectedContact ? 'Update' : 'Add'} Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Emergency Contact
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteEmergencyContact}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Profile Picture</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {profile?.avatar && (
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;