import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  X,
  Upload,
  FileText,
  Stethoscope,
  Search,
  Check,
  File,
  Image,
  Trash2,
  Download
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_FILES = 10;
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp']
};

// Enhanced validation schema with file validation
const createCaseSchema = yup.object().shape({
  caseTitle: yup
    .string()
    .required('Case title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  primaryDiseaseCode: yup
    .string()
    .required('Primary disease is required'),
  symptomCodes: yup
    .array()
    .min(1, 'At least one symptom is required')
    .max(20, 'Maximum 20 symptoms allowed'),
  requiredSpecialization: yup
    .string()
    .required('Required specialization is required'),
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

  // Medical configurations from config-service
  const [medicalConfigs, setMedicalConfigs] = useState({
    diseases: [],
    symptoms: [],
    specializations: [],
    medications: []
  });

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

  const loadMedicalConfigurations = async () => {
    try {
      const [diseases, symptoms, specializations, medications] = await Promise.all([
        execute(() => commonService.getMedicalConfigurations('diseases')),
        execute(() => commonService.getMedicalConfigurations('symptoms')),
        execute(() => commonService.getMedicalConfigurations('specializations')),
        execute(() => commonService.getMedicalConfigurations('medications')) 
      ]);

      setMedicalConfigs({
        diseases: diseases || [],
        symptoms: symptoms || [],
        specializations: specializations || [],
        medications: medications || []
      });
    } catch (error) {
      console.error('Failed to load medical configurations:', error);
    }
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
      setFileErrors([`Maximum ${MAX_FILES} files allowed. You can upload ${MAX_FILES - uploadedFiles.length} more files.`]);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    const errors = [];
    
    fileList.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });
    
    setFileErrors(errors);
    
    if (validFiles.length === 0) return;
    
    // Upload valid files
    try {
      for (const file of validFiles) {
        const fileId = Date.now() + Math.random();
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min(prev[fileId] + 10, 90)
          }));
        }, 200);
        
        // Upload file (replace with actual upload logic)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'CASE_DOCUMENT');
        
        // Simulate API call - replace with actual service call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // Add to uploaded files
        const uploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // For preview
          documentId: fileId // This would be returned from the API
        };
        
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        // Update form with document ID
        const currentDocIds = getValues('documentIds');
        setValue('documentIds', [...currentDocIds, uploadedFile.documentId]);
        
        // Clean up progress
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setFileErrors(prev => [...prev, 'Upload failed. Please try again.']);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    const currentDocIds = getValues('documentIds');
    setValue('documentIds', currentDocIds.filter(id => id !== fileId));
    setFileErrors([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const handleCreateCase = async (data) => {
    try {
      // Convert arrays to Sets for backend compatibility
      const caseData = {
        ...data,
        secondaryDiseaseCodes: new Set(data.secondaryDiseaseCodes),
        symptomCodes: new Set(data.symptomCodes),
        currentMedicationCodes: new Set(data.currentMedicationCodes),
        secondarySpecializations: new Set(data.secondarySpecializations),
      };
      
      const newCase = await execute(() => patientService.createCase(caseData));
      
      // Navigate to the new case details
      navigate(`/app/patient/cases/${newCase.id}`);
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  const handleArrayToggle = (fieldName, value) => {
    const currentValues = getValues(fieldName) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues);
    trigger(fieldName);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/app/patient/cases">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Cases
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Medical Case</h1>
          <p className="mt-1 text-sm text-gray-600">
            Provide detailed information about your medical condition for consultation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleCreateCase)} className="space-y-8">
        {/* Basic Information */}
        <Card title="Basic Information" className="space-y-6">
          {/* Case Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title *
            </label>
            <input
              {...register('caseTitle')}
              type="text"
              placeholder="Brief description of your medical concern"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.caseTitle ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.caseTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.caseTitle.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Provide detailed information about your condition, symptoms, medical history, and any relevant details"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
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
          {/* Primary Disease */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Disease/Condition *
            </label>
            <select
              {...register('primaryDiseaseCode')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.primaryDiseaseCode ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select primary disease/condition</option>
              {medicalConfigs.diseases
                .filter(disease => disease.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((disease) => (
                  <option key={disease.code} value={disease.code}>
                    {disease.name} ({disease.code})
                  </option>
                ))}
            </select>
            {errors.primaryDiseaseCode && (
              <p className="text-sm text-red-600 mt-1">{errors.primaryDiseaseCode.message}</p>
            )}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px]"
            >
              {medicalConfigs.diseases
                .filter(disease => disease.isActive && disease.code !== watch('primaryDiseaseCode'))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((disease) => (
                  <option key={disease.code} value={disease.code}>
                    {disease.name} ({disease.code})
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
                    {symptom.name} ({symptom.code})
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px]"
            >
              {medicalConfigs.medications
                .filter(medication => medication.isActive)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((medication) => (
                  <option key={medication.code} value={medication.code}>
                    {medication.name} ({medication.code})
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple. Selected: {selectedMedications.length}/15
            </p>
          </div>
        </Card>

        {/* Specialization Requirements */}
        <Card title="Specialization Requirements" className="space-y-6">
          {/* Required Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Specialization *
            </label>
            <select
              {...register('requiredSpecialization')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.requiredSpecialization ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select required specialization</option>
              {medicalConfigs.specializations
                .filter(spec => spec.isActive)
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

          {/* Secondary Specializations */}
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
                .filter(spec => spec.isActive && spec.code !== watch('requiredSpecialization'))
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

        {/* Document Upload */}
        <Card title="Supporting Documents" className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Medical Documents (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Upload medical reports, test results, prescriptions, or images. Maximum 10 files, 10MB each. PDF and images only.
            </p>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  PDF, JPG, PNG, GIF, BMP, WebP up to 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </div>
            </div>

            {/* File Errors */}
            {fileErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">File Upload Errors</h4>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {fileErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Files ({uploadedFiles.length}/{MAX_FILES})
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Preview
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Uploading...</span>
                      <span className="text-sm text-blue-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Case Properties */}
        <Card title="Case Properties">
          <div className="space-y-8">
            {/* Primary Case Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Case Classification
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Urgency Level *
                  </label>
                  <select
                    {...register('urgencyLevel')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${
                      errors.urgencyLevel ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="LOW">🟢 Low - Non-urgent consultation</option>
                    <option value="MEDIUM">🟡 Medium - Standard consultation</option>
                    <option value="HIGH">🟠 High - Priority consultation</option>
                    <option value="CRITICAL">🔴 Critical - Emergency consultation</option>
                  </select>
                  {errors.urgencyLevel && (
                    <p className="text-sm text-red-600 mt-2">{errors.urgencyLevel.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Critical cases will be prioritized for immediate assignment
                  </p>
                </div>

                {/* Case Complexity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Case Complexity *
                  </label>
                  <select
                    {...register('complexity')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm ${
                      errors.complexity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="SIMPLE">⚡ Simple - Straightforward case</option>
                    <option value="MODERATE">⚖️ Moderate - Standard complexity</option>
                    <option value="COMPLEX">🧩 Complex - Multiple factors involved</option>
                    <option value="HIGHLY_COMPLEX">🔬 Highly Complex - Rare/complex case</option>
                  </select>
                  {errors.complexity && (
                    <p className="text-sm text-red-600 mt-2">{errors.complexity.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Complex cases may require additional consultation time
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Assignment Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Doctor Assignment Preferences
              </h4>
              <div className="space-y-6">
                {/* Second Opinion Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Second Opinion Requirement
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        {...register('requiresSecondOpinion')}
                        type="radio"
                        value={true}
                        className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">Yes, I want a second opinion</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        {...register('requiresSecondOpinion')}
                        type="radio"
                        value={false}
                        className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">No, single opinion is sufficient</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Second opinions provide additional validation but may increase consultation cost
                  </p>
                </div>

                {/* Doctor Count Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Min Doctors */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Minimum Doctors Required
                    </label>
                    <select
                      {...register('minDoctorsRequired')}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    >
                      <option value={1}>1 Doctor</option>
                      <option value={2}>2 Doctors (Recommended)</option>
                      <option value={3}>3 Doctors</option>
                      <option value={4}>4 Doctors</option>
                      <option value={5}>5 Doctors</option>
                    </select>
                    <p className="text-xs text-blue-600 mt-2">
                      Minimum number of doctors to consult on your case
                    </p>
                  </div>

                  {/* Max Doctors */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Maximum Doctors Allowed
                    </label>
                    <select
                      {...register('maxDoctorsAllowed')}
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-sm"
                    >
                      <option value={1}>1 Doctor</option>
                      <option value={2}>2 Doctors</option>
                      <option value={3}>3 Doctors (Recommended)</option>
                      <option value={4}>4 Doctors</option>
                      <option value={5}>5 Doctors (Premium)</option>
                    </select>
                    <p className="text-xs text-green-600 mt-2">
                      Maximum number of doctors that can be assigned
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Configuration Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Urgency:</span>
                  <br />
                  <span className="text-gray-900">{watch('urgencyLevel')}</span>
                </div>
                <div>
                  <span className="font-medium">Complexity:</span>
                  <br />
                  <span className="text-gray-900">{watch('complexity')}</span>
                </div>
                <div>
                  <span className="font-medium">Second Opinion:</span>
                  <br />
                  <span className="text-gray-900">{watch('requiresSecondOpinion') ? 'Required' : 'Not Required'}</span>
                </div>
                <div>
                  <span className="font-medium">Doctors:</span>
                  <br />
                  <span className="text-gray-900">{watch('minDoctorsRequired')} - {watch('maxDoctorsAllowed')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions and Guidelines */}
        <Card>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-3">Important Guidelines:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Please provide accurate and detailed information for better diagnosis</li>
                  <li>Upload clear, high-quality medical documents and images</li>
                  <li>Cases will be reviewed and assigned to appropriate doctors based on your selections</li>
                  <li>You will be notified once doctors are assigned to your case</li>
                  <li>Critical urgency cases will be prioritized for immediate attention</li>
                  <li>Complex cases may require additional consultation time and fees</li>
                  <li>All information provided will be kept confidential and secure</li>
                  <li>Make sure to select the most relevant symptoms and conditions</li>
                  <li>Documents should be in PDF or image format only (max 10MB each)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex items-center justify-between">
            <Link to="/app/patient/cases">
              <Button variant="ghost" icon={<X className="w-4 h-4" />}>
                Cancel
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Save as Draft - Future feature */}
              <Button 
                variant="outline" 
                type="button"
                disabled={true}
                className="opacity-50"
              >
                Save as Draft
              </Button>
              
              <Button
                variant="primary"
                type="submit"
                icon={<Plus className="w-4 h-4" />}
                isLoading={loading}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress Summary - Shows selected items */}
        <Card title="Case Summary" className="bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Medical Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  {watch('primaryDiseaseCode') ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  Primary Disease
                </li>
                <li>• Secondary Diseases: {selectedSecondaryDiseases.length} selected</li>
                <li className="flex items-center">
                  {selectedSymptoms.length > 0 ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  Symptoms: {selectedSymptoms.length} selected
                </li>
                <li>• Current Medications: {selectedMedications.length} selected</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Specialization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  {watch('requiredSpecialization') ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  Required Specialization
                </li>
                <li>• Additional Specializations: {selectedSecondarySpecs.length} selected</li>
                <li>• Urgency Level: {watch('urgencyLevel')}</li>
                <li>• Complexity: {watch('complexity')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Documents & Settings</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  Documents: {uploadedFiles.length}/{MAX_FILES}
                </li>
                <li>• Second Opinion: {watch('requiresSecondOpinion') ? 'Yes' : 'No'}</li>
                <li>• Min Doctors: {watch('minDoctorsRequired')}</li>
                <li>• Max Doctors: {watch('maxDoctorsAllowed')}</li>
              </ul>
            </div>
          </div>

          {/* Validation Summary */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Form Validation Status</h4>
            <div className="flex items-center space-x-4 text-sm">
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
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateCase;