import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FileText,
  Upload,
  X,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Download,
  Clock,
  User,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Brain,
  Microscope
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp']
};

// Enhanced validation schema
const createCaseSchema = yup.object({
  caseTitle: yup
    .string()
    .required('Case title is required')
    .min(10, 'Case title must be at least 10 characters')
    .max(100, 'Case title cannot exceed 100 characters'),
  description: yup
    .string()
    .required('Case description is required')
    .min(50, 'Case description must be at least 50 characters')
    .max(2000, 'Case description cannot exceed 2000 characters'),
  primaryDiseaseCode: yup
    .string()
    .required('Primary disease is required'),
  secondaryDiseaseCodes: yup
    .array()
    .max(5, 'Maximum 5 secondary diseases allowed'),
  symptomCodes: yup
    .array()
    .min(1, 'At least one symptom is required')
    .max(20, 'Maximum 20 symptoms allowed'),
  currentMedicationCodes: yup
    .array()
    .max(15, 'Maximum 15 medications allowed'),
  requiredSpecialization: yup
    .string()
    .required('Required specialization is required'),
  secondarySpecializations: yup
    .array()
    .max(3, 'Maximum 3 secondary specializations allowed'),
  urgencyLevel: yup
    .string()
    .required('Urgency level is required'),
  complexity: yup
    .string()
    .required('Case complexity is required'),
});

const CreateCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // Medical configurations from config-service and separate entities
  const [medicalConfigs, setMedicalConfigs] = useState({
    diseases: [],
    symptoms: [],
    medications: [],
    specializations: [], // Main specializations (level 1)
    subspecializations: [] // Sub-specializations (level 2)
  });

  // Dropdown options for cascading selections
  const [diseaseCategories, setDiseaseCategories] = useState([]);
  const [diseasesInCategory, setDiseasesInCategory] = useState([]);
  const [medicationCategories, setMedicationCategories] = useState([]);
  const [medicationsInCategory, setMedicationsInCategory] = useState([]);
  const [subspecializations, setSubspecializations] = useState([]);

  // Selected values for cascading dropdowns
  const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState('');
  const [selectedMedicationCategory, setSelectedMedicationCategory] = useState('');
  const [selectedMainSpecialization, setSelectedMainSpecialization] = useState('');

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileErrors, setFileErrors] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Form setup with enhanced defaults
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger
  } = useForm({
    resolver: yupResolver(createCaseSchema),
    defaultValues: {
      caseTitle: '',
      description: '',
      primaryDiseaseCode: '',
      secondaryDiseaseCodes: [],
      symptomCodes: [],
      currentMedicationCodes: [],
      requiredSpecialization: '',
      subspecialization: '',
      secondarySpecializations: [],
      urgencyLevel: 'MEDIUM',
      complexity: 'MODERATE',
      requiresSecondOpinion: true,
      minDoctorsRequired: 2,
      maxDoctorsAllowed: 3,
      documentIds: []
    }
  });

  // Watch form values for dynamic updates
  const selectedSymptoms = watch('symptomCodes') || [];
  const selectedMedications = watch('currentMedicationCodes') || [];
  const selectedSecondaryDiseases = watch('secondaryDiseaseCodes') || [];
  const selectedSecondarySpecs = watch('secondarySpecializations') || [];

  // Load medical configurations on mount
  useEffect(() => {
    loadMedicalConfigurations();
  }, []);

  // Load diseases when category changes
  useEffect(() => {
    if (selectedDiseaseCategory) {
      loadDiseasesInCategory(selectedDiseaseCategory);
    }
  }, [selectedDiseaseCategory]);

  // Load medications when category changes
  useEffect(() => {
    if (selectedMedicationCategory) {
      loadMedicationsInCategory(selectedMedicationCategory);
    }
  }, [selectedMedicationCategory]);

  // Load subspecializations when main specialization changes
  useEffect(() => {
    if (selectedMainSpecialization) {
      loadSubspecializations(selectedMainSpecialization);
    }
  }, [selectedMainSpecialization]);

  const loadMedicalConfigurations = async () => {
    try {
      // Load all configurations in parallel
      const [
        diseases,
        symptoms,
        medications,
        specializations,
        subspecializations
      ] = await Promise.all([
        // execute(() => commonService.getAllDiseases()),
        // execute(() => commonService.getAllSymptoms()),
        // execute(() => commonService.getAllMedications()),
        execute(() => commonService.getMedicalConfigurations('diseases')),
        execute(() => commonService.getMedicalConfigurations('symptoms')),
        execute(() => commonService.getMedicalConfigurations('medications')),
        execute(() => commonService.getMedicalConfigurations('SPECIALIZATION')),
        execute(() => commonService.getMedicalConfigurations('SUBSPECIALIZATION'))
      ]);
      // Set medical configurations
      setMedicalConfigs({
        diseases: diseases || [],
        symptoms: symptoms || [],
        medications: medications || [],
        specializations: specializations || [],
        subspecializations: subspecializations || []
      });
      // Extract unique categories for diseases
      const uniqueDiseaseCategories = [...new Set(
        (diseases || []).map(disease => disease.category).filter(Boolean)
      )].sort();
      setDiseaseCategories(uniqueDiseaseCategories);

      // Extract unique categories for medications
      const uniqueMedicationCategories = [...new Set(
        (medications || []).map(medication => medication.category).filter(Boolean)
      )].sort();
      setMedicationCategories(uniqueMedicationCategories);

    } catch (error) {
      console.error('Failed to load medical configurations:', error);
    }
  };

  const loadDiseasesInCategory = async (category) => {
    try {
      const diseases = await execute(() => commonService.getDiseasesByCategory(category));
      setDiseasesInCategory(diseases || []);
    } catch (error) {
      console.error('Failed to load diseases for category:', category, error);
      setDiseasesInCategory([]);
    }
  };

  const loadMedicationsInCategory = async (category) => {
    try {
      const medications = await execute(() => commonService.getMedicationsByCategory(category));
      setMedicationsInCategory(medications || []);
    } catch (error) {
      console.error('Failed to load medications for category:', category, error);
      setMedicationsInCategory([]);
    }
  };

  const loadSubspecializations = async (parentCode) => {
    try {
      // Filter subspecializations by parent code
      const filteredSubspecs = medicalConfigs.subspecializations.filter(
        subspec => subspec.parentCode === parentCode
      );
      setSubspecializations(filteredSubspecs);
    } catch (error) {
      console.error('Failed to load subspecializations:', error);
      setSubspecializations([]);
    }
  };

  const handleDiseaseCategory = (category) => {
    setSelectedDiseaseCategory(category);
    // Clear previously selected disease
    setValue('primaryDiseaseCode', '');
    setValue('secondaryDiseaseCodes', []);
  };

  const handleMedicationCategory = (category) => {
    setSelectedMedicationCategory(category);
    // Clear previously selected medications
    setValue('currentMedicationCodes', []);
  };

  const handleMainSpecialization = (specializationCode) => {
    setSelectedMainSpecialization(specializationCode);
    setValue('requiredSpecialization', specializationCode);
    // Clear subspecialization when main changes
    setValue('subspecialization', '');
  };

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // Check file type
    const isValidType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type) ||
      Object.values(ALLOWED_FILE_TYPES).flat().some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
    
    if (!isValidType) {
      errors.push('Only PDF and image files (JPG, PNG, GIF, BMP, WebP) are allowed');
    }
    
    return errors;
  };

  const handleFileUpload = async (files) => {
    const fileList = Array.from(files);
    
    // Check total file count
    if (uploadedFiles.length + fileList.length > MAX_FILES) {
      setFileErrors([`Maximum ${MAX_FILES} files allowed.`]);
      return;
    }

    setFileErrors([]);
    
    for (const file of fileList) {
      const fileId = Date.now() + Math.random();
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        setFileErrors(prev => [...prev, `${file.name}: ${errors.join(', ')}`]);
        continue;
      }

      // Add file to uploaded files list
      const newFile = {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed' } : f
        ));

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'failed' } : f
        ));
        setFileErrors(prev => [...prev, `Failed to upload ${file.name}`]);
      }
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const onSubmit = async (data) => {
    try {
      const caseData = {
        ...data,
        patientId: user.id,
        documentIds: uploadedFiles
          .filter(f => f.status === 'completed')
          .map(f => f.id)
      };

      const newCase = await execute(() => patientService.createCase(caseData));
      
      // Show success message and redirect
      alert('Case created successfully! You will be redirected to your cases.');
      navigate('/app/patient/cases');
      
    } catch (error) {
      console.error('Failed to create case:', error);
      alert('Failed to create case. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Case</h1>
        <p className="text-gray-600">Describe your medical concern to get matched with the right specialists</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Case Information */}
        <Card title="Case Information" className="space-y-6">
          {/* Case Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title *
            </label>
            <input
              type="text"
              {...register('caseTitle')}
              placeholder="Brief title describing your medical concern"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.caseTitle ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.caseTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.caseTitle.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {watch('caseTitle')?.length || 0}/100 characters
            </p>
          </div>

          {/* Case Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Please provide a detailed description of your symptoms, duration, and any relevant medical history..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {watch('description')?.length || 0}/2000 characters
            </p>
          </div>
        </Card>

        {/* Medical Information */}
        <Card title="Medical Information" className="space-y-6">
          {/* Disease Categories and Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disease Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disease Category *
              </label>
              <select
                value={selectedDiseaseCategory}
                onChange={(e) => handleDiseaseCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select disease category</option>
                {diseaseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Disease */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Disease/Condition *
              </label>
              <select
                {...register('primaryDiseaseCode')}
                disabled={!selectedDiseaseCategory}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.primaryDiseaseCode ? 'border-red-300' : 'border-gray-300'
                } ${!selectedDiseaseCategory ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {selectedDiseaseCategory ? 'Select primary disease' : 'Select category first'}
                </option>
                {diseasesInCategory
                  .filter(disease => disease.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((disease) => (
                    <option key={disease.icdCode} value={disease.icdCode}>
                      {disease.name} ({disease.icdCode})
                    </option>
                  ))}
              </select>
              {errors.primaryDiseaseCode && (
                <p className="text-sm text-red-600 mt-1">{errors.primaryDiseaseCode.message}</p>
              )}
            </div>
          </div>

          {/* Secondary Diseases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Diseases/Conditions (Optional, max 5)
            </label>
            <select
              multiple
              value={selectedSecondaryDiseases}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                if (values.length <= 5) {
                  setValue('secondaryDiseaseCodes', values);
                }
              }}
              disabled={!selectedDiseaseCategory}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px] ${
                !selectedDiseaseCategory ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {diseasesInCategory
                .filter(disease => disease.isActive && disease.icdCode !== watch('primaryDiseaseCode'))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((disease) => (
                  <option key={disease.icdCode} value={disease.icdCode}>
                    {disease.name} ({disease.icdCode})
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple. Selected: {selectedSecondaryDiseases.length}/5
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms * (Select at least 1, max 20)
            </label>
            <select
              multiple
              value={selectedSymptoms}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                if (values.length <= 20) {
                  setValue('symptomCodes', values);
                  trigger('symptomCodes');
                }
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[150px] ${
                errors.symptomCodes ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {medicalConfigs.symptoms
                .filter(symptom => symptom.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((symptom) => (
                  <option key={symptom.code} value={symptom.code}>
                    {symptom.name} ({symptom.bodySystem})
                  </option>
                ))}
            </select>
            {errors.symptomCodes && (
              <p className="text-sm text-red-600 mt-1">{errors.symptomCodes.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple. Selected: {selectedSymptoms.length}/20
            </p>
          </div>
        </Card>

        {/* Current Medications */}
        <Card title="Current Medications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medication Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication Category
              </label>
              <select
                value={selectedMedicationCategory}
                onChange={(e) => handleMedicationCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select medication category</option>
                {medicationCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications (Optional, max 15)
              </label>
              <select
                multiple
                value={selectedMedications}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  if (values.length <= 15) {
                    setValue('currentMedicationCodes', values);
                  }
                }}
                disabled={!selectedMedicationCategory}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px] ${
                  !selectedMedicationCategory ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                {medicationsInCategory
                  .filter(medication => medication.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((medication) => (
                    <option key={medication.atcCode} value={medication.atcCode}>
                      {medication.name} - {medication.genericName} ({medication.atcCode})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedMedicationCategory 
                  ? `Hold Ctrl/Cmd to select multiple. Selected: ${selectedMedications.length}/15`
                  : 'Select a category first to see medications'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Specialization Requirements */}
        <Card title="Specialization Requirements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Specialization *
              </label>
              <select
                value={selectedMainSpecialization}
                onChange={(e) => handleMainSpecialization(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.requiredSpecialization ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select required specialization</option>
                {medicalConfigs.specializations
                  .filter(spec => spec.isActive && spec.level === 1)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((spec) => (
                    <option key={spec.code} value={spec.code}>
                      {spec.name}
                    </option>
                  ))}
              </select>
              {errors.requiredSpecialization && (
                <p className="text-sm text-red-600 mt-1">{errors.requiredSpecialization.message}</p>
              )}
            </div>

            {/* Sub-specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-specialization (Optional)
              </label>
              <select
                {...register('subspecialization')}
                disabled={!selectedMainSpecialization}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  !selectedMainSpecialization ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {selectedMainSpecialization ? 'Select sub-specialization' : 'Select main specialization first'}
                </option>
                {subspecializations
                  .filter(subspec => subspec.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((subspec) => (
                    <option key={subspec.code} value={subspec.code}>
                      {subspec.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Additional Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Specializations (Optional, max 3)
            </label>
            <select
              multiple
              value={selectedSecondarySpecs}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                if (values.length <= 3) {
                  setValue('secondarySpecializations', values);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            >
              {medicalConfigs.specializations
                .filter(spec => spec.isActive && spec.level === 1 && spec.code !== selectedMainSpecialization)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((spec) => (
                  <option key={spec.code} value={spec.code}>
                    {spec.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple. Selected: {selectedSecondarySpecs.length}/3
            </p>
          </div>
        </Card>

        {/* Case Settings */}
        <Card title="Case Settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <select
                {...register('urgencyLevel')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.urgencyLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="LOW">Low - Not urgent, routine consultation</option>
                <option value="MEDIUM">Medium - Standard priority</option>
                <option value="HIGH">High - Requires prompt attention</option>
                <option value="CRITICAL">Critical - Immediate attention needed</option>
              </select>
              {errors.urgencyLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.urgencyLevel.message}</p>
              )}
            </div>

            {/* Case Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Complexity *
              </label>
              <select
                {...register('complexity')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.complexity ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="SIMPLE">Simple - Straightforward diagnosis</option>
                <option value="MODERATE">Moderate - Standard complexity</option>
                <option value="COMPLEX">Complex - Multiple factors involved</option>
                <option value="CRITICAL">Critical - High complexity case</option>
              </select>
              {errors.complexity && (
                <p className="text-sm text-red-600 mt-1">{errors.complexity.message}</p>
              )}
            </div>
          </div>

          {/* Doctor Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Opinion Required
              </label>
              <select
                {...register('requiresSecondOpinion')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value={true}>Yes - Require second opinion</option>
                <option value={false}>No - Single doctor consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Doctors Required
              </label>
              <select
                {...register('minDoctorsRequired')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>1 Doctor</option>
                <option value={2}>2 Doctors</option>
                <option value={3}>3 Doctors</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Doctors Allowed
              </label>
              <select
                {...register('maxDoctorsAllowed')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value={2}>2 Doctors</option>
                <option value={3}>3 Doctors</option>
                <option value={4}>4 Doctors</option>
                <option value={5}>5 Doctors</option>
              </select>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card title="Supporting Documents" className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Upload relevant medical documents, test results, or images (PDF, JPG, PNG, GIF, BMP, WebP - Max 10MB each, 5 files total)
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your files or click the button below
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff,.tif"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>

          {/* File Upload Errors */}
          {fileErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Upload Errors:</h4>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {fileErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length}/{MAX_FILES})</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[file.id] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'failed' && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          // Create object URL for preview
                          const url = URL.createObjectURL(file.file);
                          window.open(url, '_blank');
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Case Summary */}
        <Card title="Case Summary" className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Case Details</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Title: {watch('caseTitle') || 'Not specified'}</li>
                  <li>• Primary Disease: {
                    watch('primaryDiseaseCode') 
                      ? diseasesInCategory.find(d => d.icdCode === watch('primaryDiseaseCode'))?.name || 'Selected'
                      : 'Not selected'
                  }</li>
                  <li>• Symptoms: {selectedSymptoms.length} selected</li>
                  <li>• Current Medications: {selectedMedications.length} selected</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Specialization: {
                    watch('requiredSpecialization')
                      ? medicalConfigs.specializations.find(s => s.code === watch('requiredSpecialization'))?.name || 'Selected'
                      : 'Not selected'
                  }</li>
                  <li>• Sub-specialization: {
                    watch('subspecialization')
                      ? subspecializations.find(s => s.code === watch('subspecialization'))?.name || 'Selected'
                      : 'None'
                  }</li>
                  <li>• Urgency: {watch('urgencyLevel')}</li>
                  <li>• Complexity: {watch('complexity')}</li>
                  <li>• Second Opinion: {watch('requiresSecondOpinion') ? 'Yes' : 'No'}</li>
                  <li>• Min/Max Doctors: {watch('minDoctorsRequired')}-{watch('maxDoctorsAllowed')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Validation Summary */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Form Validation Status</h4>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className={`flex items-center ${errors.caseTitle ? 'text-red-600' : 'text-green-600'}`}>
                {errors.caseTitle ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Case Title
              </div>
              <div className={`flex items-center ${errors.description ? 'text-red-600' : 'text-green-600'}`}>
                {errors.description ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Description
              </div>
              <div className={`flex items-center ${errors.primaryDiseaseCode ? 'text-red-600' : 'text-green-600'}`}>
                {errors.primaryDiseaseCode ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Primary Disease
              </div>
              <div className={`flex items-center ${errors.symptomCodes ? 'text-red-600' : 'text-green-600'}`}>
                {errors.symptomCodes ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Symptoms
              </div>
              <div className={`flex items-center ${errors.requiredSpecialization ? 'text-red-600' : 'text-green-600'}`}>
                {errors.requiredSpecialization ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Specialization
              </div>
              <div className={`flex items-center ${errors.urgencyLevel ? 'text-red-600' : 'text-green-600'}`}>
                {errors.urgencyLevel ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Urgency Level
              </div>
              <div className={`flex items-center ${errors.complexity ? 'text-red-600' : 'text-green-600'}`}>
                {errors.complexity ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                Complexity
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/patient/cases')}
            className="px-8 py-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={Object.keys(errors).length > 0}
            className="px-8 py-3"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Case
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCase;