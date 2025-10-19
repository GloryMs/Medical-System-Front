import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, Stethoscope, Award, Briefcase, DollarSign, Phone,
  Edit, Save, Upload, Camera, Star, MapPin, Mail, Building, Globe
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';
import commonService from '../../services/api/commonService';

const DoctorProfile = () => {
  const { execute, loading } = useApi();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('professional');
  const [isEditing, setIsEditing] = useState({
    professional: false,
    specialization: false,
    pricing: false,
    contact: false
  });

  // Medical configurations
  const [specializations, setSpecializations] = useState([]);
  const [subSpecializations, setSubSpecializations] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  
  // Selected values for multi-select fields
  const [selectedSubSpecializations, setSelectedSubSpecializations] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const professionalForm = useForm();
  const specializationForm = useForm();
  const pricingForm = useForm();
  const contactForm = useForm();

  useEffect(() => {
    loadProfile();
    loadMedicalConfigurations();
  }, []);

  useEffect(() => {
    if (profile) {
      // Reset professional form
      professionalForm.reset({
        fullName: profile.fullName || '',
        licenseNumber: profile.licenseNumber || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        qualifications: profile.qualifications || '',
        professionalSummary: profile.professionalSummary || '',
        researchAreas: profile.researchAreas || '',
        languages: profile.languages || '',
        hospitalAffiliation: profile.hospitalAffiliation || ''
      });

      // Reset contact form
      contactForm.reset({
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || ''
      });

      // Reset pricing form
      pricingForm.reset({
        hourlyRate: profile.hourlyRate || '',
        caseRate: profile.caseRate || profile.baseConsultationFee || '',
        emergencyRate: profile.emergencyRate || profile.urgentCaseFee || '',
        maxConcurrentCases: profile.maxConcurrentCases || 10
      });

      // Reset specialization form
      specializationForm.reset({
        primarySpecialization: profile.primarySpecialization || '',
        acceptsSecondOpinions: profile.acceptsSecondOpinions ?? true,
        acceptsComplexCases: profile.acceptsComplexCases ?? true,
        acceptsUrgentCases: profile.acceptsUrgentCases ?? true
      });

      // Set multi-select values
      setSelectedSubSpecializations(profile.subSpecializations || []);
      setSelectedDiseases(profile.diseaseExpertiseCodes || []);
      setSelectedSymptoms(profile.symptomExpertiseCodes || []);
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const data = await execute(() => doctorService.getProfile());
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadMedicalConfigurations = async () => {
    try {
      // Load all configurations in parallel
      const [specs, subSpecs, diseaseData, symptomData] = await Promise.all([
        execute(() => commonService.getMedicalConfigurations('SPECIALIZATION')),
        execute(() => commonService.getMedicalConfigurations('SUBSPECIALIZATION')),
        execute(() => commonService.getMedicalConfigurations('diseases')),
        execute(() => commonService.getMedicalConfigurations('symptoms'))
      ]);
      
      setSpecializations(specs || []);
      setSubSpecializations(subSpecs || []);
      setDiseases(diseaseData || []);
      setSymptoms(symptomData || []);
    } catch (error) {
      console.error('Failed to load medical configurations:', error);
    }
  };

  const handleProfessionalInfoSubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => doctorService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, professional: false });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSpecializationSubmit = async (data) => {
    try {
      // Include multi-select values in the update
      const updateData = {
        ...data,
        subSpecializations: selectedSubSpecializations,
        diseaseExpertiseCodes: selectedDiseases,
        symptomExpertiseCodes: selectedSymptoms
      };
      
      const updatedProfile = await execute(() => doctorService.updateProfile(updateData));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, specialization: false });
    } catch (error) {
      console.error('Failed to update specialization:', error);
    }
  };

  const handlePricingSubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => doctorService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, pricing: false });
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const handleContactSubmit = async (data) => {
    try {
      const updatedProfile = await execute(() => doctorService.updateProfile(data));
      setProfile(updatedProfile);
      setIsEditing({ ...isEditing, contact: false });
    } catch (error) {
      console.error('Failed to update contact info:', error);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await execute(() => doctorService.uploadAvatar(file));
        await loadProfile();
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };

  const getVerificationBadgeColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    const fields = ['fullName', 'licenseNumber', 'primarySpecialization', 'yearsOfExperience', 
                   'phoneNumber', 'email', 'qualifications', 'professionalSummary'];
    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value && value !== '' && value !== 0;
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  // Helper function to get filtered subspecializations based on primary specialization
  const getFilteredSubSpecializations = () => {
    const primarySpec = specializationForm.watch('primarySpecialization');
    if (!primarySpec) return [];
    return subSpecializations.filter(sub => sub.parentCode === primarySpec);
  };

  // Multi-select handlers
  const toggleSubSpecialization = (code) => {
    setSelectedSubSpecializations(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const toggleDisease = (code) => {
    setSelectedDiseases(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const toggleSymptom = (code) => {
    setSelectedSymptoms(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  if (!profile && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'professional', label: 'Professional Info', icon: <User className="w-4 h-4" /> },
    { id: 'specialization', label: 'Specialization', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'pricing', label: 'Fees & Capacity', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact Info', icon: <Phone className="w-4 h-4" /> }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary-600" />
                    )}
                  </div>
                  <button
                    onClick={() => document.getElementById('avatar-upload').click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <Camera className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">Dr. {profile?.fullName || 'Doctor'}</h1>
                    <Badge color={getVerificationBadgeColor(profile?.verificationStatus)}>
                      {profile?.verificationStatus || 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{profile?.primarySpecialization || 'General Practice'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>{profile?.yearsOfExperience || 0} years experience</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{profile?.rating?.toFixed(1) || '0.0'} rating</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile?.consultationCount || 0} consultations</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Profile Completion</div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${getProfileCompletionPercentage()}%` }} />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{getProfileCompletionPercentage()}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-8 border-t">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {activeTab === 'professional' && (
            <Card title="Professional Information">
              <form onSubmit={professionalForm.handleSubmit(handleProfessionalInfoSubmit)}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input {...professionalForm.register('fullName')} disabled={!isEditing.professional} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                      <input {...professionalForm.register('licenseNumber')} disabled={!isEditing.professional} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                      <input type="number" {...professionalForm.register('yearsOfExperience')} disabled={!isEditing.professional} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Affiliation</label>
                      <input {...professionalForm.register('hospitalAffiliation')} disabled={!isEditing.professional} placeholder="Hospital or clinic name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications & Certifications</label>
                    <textarea {...professionalForm.register('qualifications')} disabled={!isEditing.professional} rows={3} placeholder="MD, Board Certified, etc." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                    <textarea {...professionalForm.register('professionalSummary')} disabled={!isEditing.professional} rows={4} placeholder="Brief overview of your expertise..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Areas & Special Interests</label>
                    <textarea {...professionalForm.register('researchAreas')} disabled={!isEditing.professional} rows={3} placeholder="Research, publications, interests..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                    <input {...professionalForm.register('languages')} disabled={!isEditing.professional} placeholder="English, German, Spanish..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    {isEditing.professional ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => { setIsEditing({ ...isEditing, professional: false }); professionalForm.reset(); }}>Cancel</Button>
                        <Button type="submit" icon={<Save className="w-4 h-4" />} loading={loading}>Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditing({ ...isEditing, professional: true })}>Edit Professional Info</Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'specialization' && (
            <Card title="Specialization & Expertise">
              <form onSubmit={specializationForm.handleSubmit(handleSpecializationSubmit)}>
                <div className="p-6 space-y-6">
                  {/* Primary Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Specialization *</label>
                    <select 
                      {...specializationForm.register('primarySpecialization')} 
                      disabled={!isEditing.specialization} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select specialization</option>
                      {specializations.map(spec => (
                        <option key={spec.code} value={spec.code}>{spec.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Specializations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Specializations</label>
                    {!isEditing.specialization ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubSpecializations.length > 0 ? (
                          selectedSubSpecializations.map(code => {
                            const subSpec = subSpecializations.find(s => s.code === code);
                            return (
                              <span key={code} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                {subSpec?.name || code}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-sm">No sub-specializations selected</span>
                        )}
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {getFilteredSubSpecializations().map(subSpec => (
                            <label key={subSpec.code} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedSubSpecializations.includes(subSpec.code)}
                                onChange={() => toggleSubSpecialization(subSpec.code)}
                                className="mr-2 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm">{subSpec.name}</span>
                            </label>
                          ))}
                          {getFilteredSubSpecializations().length === 0 && (
                            <span className="text-gray-500 text-sm">Select a primary specialization first</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Disease Expertise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Disease Expertise</label>
                    {!isEditing.specialization ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDiseases.length > 0 ? (
                          selectedDiseases.map(code => {
                            const disease = diseases.find(d => d.icdCode === code || d.code === code);
                            return (
                              <span key={code} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                {disease?.name || code}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-sm">No disease expertise selected</span>
                        )}
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {diseases.map(disease => (
                            <label key={disease.icdCode || disease.code} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedDiseases.includes(disease.icdCode || disease.code)}
                                onChange={() => toggleDisease(disease.icdCode || disease.code)}
                                className="mr-2 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm">{disease.name} ({disease.icdCode || disease.code})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Symptom Expertise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptom Expertise</label>
                    {!isEditing.specialization ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSymptoms.length > 0 ? (
                          selectedSymptoms.map(code => {
                            const symptom = symptoms.find(s => s.code === code);
                            return (
                              <span key={code} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                {symptom?.name || code}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-sm">No symptom expertise selected</span>
                        )}
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <div className="space-y-2">
                          {symptoms.map(symptom => (
                            <label key={symptom.code} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedSymptoms.includes(symptom.code)}
                                onChange={() => toggleSymptom(symptom.code)}
                                className="mr-2 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm">{symptom.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Case Preferences */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Case Preferences</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium text-gray-900">Accept Second Opinions</div>
                          <div className="text-sm text-gray-600">Willing to provide second opinion consultations</div>
                        </div>
                        <input 
                          type="checkbox" 
                          {...specializationForm.register('acceptsSecondOpinions')} 
                          disabled={!isEditing.specialization} 
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" 
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium text-gray-900">Accept Complex Cases</div>
                          <div className="text-sm text-gray-600">Handle high-complexity medical cases</div>
                        </div>
                        <input 
                          type="checkbox" 
                          {...specializationForm.register('acceptsComplexCases')} 
                          disabled={!isEditing.specialization} 
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" 
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="font-medium text-gray-900">Accept Urgent Cases</div>
                          <div className="text-sm text-gray-600">Available for time-sensitive consultations</div>
                        </div>
                        <input 
                          type="checkbox" 
                          {...specializationForm.register('acceptsUrgentCases')} 
                          disabled={!isEditing.specialization} 
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50" 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    {isEditing.specialization ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => { 
                            setIsEditing({ ...isEditing, specialization: false }); 
                            specializationForm.reset();
                            // Reset to original values
                            setSelectedSubSpecializations(profile?.subSpecializations || []);
                            setSelectedDiseases(profile?.diseaseExpertiseCodes || []);
                            setSelectedSymptoms(profile?.symptomExpertiseCodes || []);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" icon={<Save className="w-4 h-4" />} loading={loading}>Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditing({ ...isEditing, specialization: true })}>Edit Specialization</Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          )}
          {activeTab === 'pricing' && (
            <Card title="Consultation Fees & Capacity">
              <form onSubmit={pricingForm.handleSubmit(handlePricingSubmit)}>
                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Set your consultation fees and case capacity. These rates will be displayed to patients.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                      <input type="number" step="0.01" {...pricingForm.register('hourlyRate')} disabled={!isEditing.pricing} placeholder="N/A" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                      <p className="text-xs text-gray-500 mt-1">For time-based consultations</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Standard Case Fee ($)</label>
                      <input type="number" step="0.01" {...pricingForm.register('caseRate')} disabled={!isEditing.pricing} placeholder="N/A" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                      <p className="text-xs text-gray-500 mt-1">Standard case consultation</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency/Urgent Fee ($)</label>
                      <input type="number" step="0.01" {...pricingForm.register('emergencyRate')} disabled={!isEditing.pricing} placeholder="N/A" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                      <p className="text-xs text-gray-500 mt-1">For urgent cases</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Cases</label>
                        <input type="number" {...pricingForm.register('maxConcurrentCases')} disabled={!isEditing.pricing} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                        <p className="text-xs text-gray-500 mt-1">Maximum active cases you can handle</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Active Cases</label>
                        <input type="text" value={profile?.activeCases || 0} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                        <p className="text-xs text-gray-500 mt-1">Current workload</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    {isEditing.pricing ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => { setIsEditing({ ...isEditing, pricing: false }); pricingForm.reset(); }}>Cancel</Button>
                        <Button type="submit" icon={<Save className="w-4 h-4" />} loading={loading}>Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditing({ ...isEditing, pricing: true })}>Edit Pricing</Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'contact' && (
            <Card title="Contact Information">
              <form onSubmit={contactForm.handleSubmit(handleContactSubmit)}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input {...contactForm.register('phoneNumber')} disabled={!isEditing.contact} placeholder="+1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" {...contactForm.register('email')} disabled={!isEditing.contact} placeholder="doctor@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input {...contactForm.register('address')} disabled={!isEditing.contact} placeholder="Street address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input {...contactForm.register('city')} disabled={!isEditing.contact} placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input {...contactForm.register('country')} disabled={!isEditing.contact} placeholder="Country" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    {isEditing.contact ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => { setIsEditing({ ...isEditing, contact: false }); contactForm.reset(); }}>Cancel</Button>
                        <Button type="submit" icon={<Save className="w-4 h-4" />} loading={loading}>Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditing({ ...isEditing, contact: true })}>Edit Contact Info</Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;