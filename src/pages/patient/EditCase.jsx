import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  Save,
  X,
  Check,
  AlertTriangle,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Brain,
  Microscope,
  FileText,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Enhanced validation schema
const editCaseSchema = yup.object({
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

const EditCase = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State for case data and configurations
  const [caseData, setCaseData] = useState(null);
  const [medicalConfigs, setMedicalConfigs] = useState({
    diseases: [],
    symptoms: [],
    medications: [],
    specializations: [],
    subspecializations: []
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

  // Loading and saving states
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger
  } = useForm({
    resolver: yupResolver(editCaseSchema),
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
      maxDoctorsAllowed: 3
    }
  });

  // Watch form values for dynamic updates and change detection
  const formValues = watch();
  const selectedSymptoms = watch('symptomCodes') || [];
  const selectedMedications = watch('currentMedicationCodes') || [];
  const selectedSecondaryDiseases = watch('secondaryDiseaseCodes') || [];
  const selectedSecondarySpecs = watch('secondarySpecializations') || [];

  // Load data on component mount
  useEffect(() => {
    if (caseId) {
      loadCaseData();
      loadMedicalConfigurations();
    }
  }, [caseId]);

  // Load diseases when category changes OR when medical configs load
  useEffect(() => {
    if (selectedDiseaseCategory) {
      loadDiseasesInCategory(selectedDiseaseCategory);
    }
  }, [selectedDiseaseCategory]);

  // Auto-detect disease category when medical configs and case data are both loaded
  useEffect(() => {
    if (caseData?.primaryDiseaseCode && medicalConfigs.diseases.length > 0 && !selectedDiseaseCategory) {
      const disease = medicalConfigs.diseases.find(d => d.icdCode === caseData.primaryDiseaseCode);
      if (disease?.category) {
        setSelectedDiseaseCategory(disease.category);
        loadDiseasesInCategory(disease.category);
      }
    }
  }, [caseData, medicalConfigs.diseases, selectedDiseaseCategory]);

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

  // Detect form changes
  useEffect(() => {
    if (caseData && formValues) {
      const hasFormChanges = 
        formValues.caseTitle !== caseData.caseTitle ||
        formValues.description !== caseData.description ||
        formValues.primaryDiseaseCode !== caseData.primaryDiseaseCode ||
        JSON.stringify(formValues.secondaryDiseaseCodes?.sort()) !== JSON.stringify(caseData.secondaryDiseaseCodes?.sort()) ||
        JSON.stringify(formValues.symptomCodes?.sort()) !== JSON.stringify(caseData.symptomCodes?.sort()) ||
        JSON.stringify(formValues.currentMedicationCodes?.sort()) !== JSON.stringify(caseData.currentMedicationCodes?.sort()) ||
        formValues.requiredSpecialization !== caseData.requiredSpecialization ||
        JSON.stringify(formValues.secondarySpecializations?.sort()) !== JSON.stringify(caseData.secondarySpecializations?.sort()) ||
        formValues.urgencyLevel !== caseData.urgencyLevel ||
        formValues.complexity !== caseData.complexity;
      
      setHasChanges(hasFormChanges);
    }
  }, [formValues, caseData]);

  const loadCaseData = async () => {
    try {
      const data = await execute(() => patientService.getCaseById(caseId));
      
      // Check if case can be edited
      if (!['SUBMITTED', 'PENDING'].includes(data.status)) {
        alert('This case cannot be edited in its current status.');
        navigate(`/app/patient/cases/${caseId}`);
        return;
      }
      
      setCaseData(data);
      
      // Reset form with case data - handle empty arrays properly
      reset({
        caseTitle: data.caseTitle || '',
        description: data.description || '',
        primaryDiseaseCode: data.primaryDiseaseCode || '',
        secondaryDiseaseCodes: data.secondaryDiseaseCodes || [], // Always array, even if empty
        symptomCodes: data.symptomCodes || [], // Always array, even if empty
        currentMedicationCodes: data.currentMedicationCodes || [], // Always array, even if empty
        requiredSpecialization: data.requiredSpecialization || '',
        secondarySpecializations: data.secondarySpecializations || [], // Always array, even if empty
        urgencyLevel: data.urgencyLevel || 'MEDIUM',
        complexity: data.complexity || 'MODERATE'
      });
      
      // Set selected values for dropdowns - handle empty values
      setSelectedMainSpecialization(data.requiredSpecialization || '');
      
      // If there's a primary disease, try to determine its category
      if (data.primaryDiseaseCode && medicalConfigs.diseases.length > 0) {
        const disease = medicalConfigs.diseases.find(d => d.icdCode === data.primaryDiseaseCode);
        if (disease && disease.category) {
          setSelectedDiseaseCategory(disease.category);
          // Don't call loadDiseasesInCategory here - let the useEffect handle it
        }
      }
      
    } catch (error) {
      console.error('Failed to load case data:', error);
      alert('Failed to load case data. Please try again.');
      navigate('/app/patient/cases');
    }
  };

  const loadMedicalConfigurations = async () => {
    try {
      const [diseases, symptoms, medications, specializations, subspecializations] = await Promise.all([
        execute(() => commonService.getMedicalConfigurations('diseases')),
        execute(() => commonService.getMedicalConfigurations('symptoms')),
        execute(() => commonService.getMedicalConfigurations('medications')),
        execute(() => commonService.getMedicalConfigurations('SPECIALIZATION')),
        execute(() => commonService.getMedicalConfigurations('SUBSPECIALIZATION'))
      ]);
      
      setMedicalConfigs({
        diseases: diseases || [],
        symptoms: symptoms || [],
        medications: medications || [],
        specializations: specializations || [],
        subspecializations: subspecializations || []
      });
      
      // Extract unique categories
      const uniqueDiseaseCategories = [...new Set(
        (diseases || []).map(disease => disease.category).filter(Boolean)
      )].sort();
      setDiseaseCategories(uniqueDiseaseCategories);

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
    if (category !== selectedDiseaseCategory) {
      setValue('primaryDiseaseCode', '');
      setValue('secondaryDiseaseCodes', []);
    }
  };

  const handleMedicationCategory = (category) => {
    setSelectedMedicationCategory(category);
    if (category !== selectedMedicationCategory) {
      setValue('currentMedicationCodes', []);
    }
  };

  const handleMainSpecialization = (specializationCode) => {
    setSelectedMainSpecialization(specializationCode);
    setValue('requiredSpecialization', specializationCode);
    setValue('subspecialization', '');
  };

  const onSubmit = async (data) => {
    if (!hasChanges) {
      alert('No changes have been made.');
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        caseTitle: data.caseTitle,
        description: data.description,
        primaryDiseaseCode: data.primaryDiseaseCode,
        secondaryDiseaseCodes: data.secondaryDiseaseCodes || [],
        symptomCodes: data.symptomCodes || [],
        currentMedicationCodes: data.currentMedicationCodes || [],
        requiredSpecialization: data.requiredSpecialization,
        secondarySpecializations: data.secondarySpecializations || [],
        urgencyLevel: data.urgencyLevel,
        complexity: data.complexity
      };

      await execute(() => patientService.updateCase(caseId, updateData));
      
      alert('Case updated successfully!');
      navigate(`/app/patient/cases/${caseId}`);
      
    } catch (error) {
      console.error('Failed to update case:', error);
      alert('Failed to update case. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(`/app/patient/cases/${caseId}`);
      }
    } else {
      navigate(`/app/patient/cases/${caseId}`);
    }
  };

  // Show loading state
  if (loading || !caseData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading case data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleCancel}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Case</h1>
            <p className="text-gray-600">Case #{caseData.id} - {caseData.caseTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <StatusBadge status={caseData.status} />
          {hasChanges && (
            <Badge variant="warning" size="sm">Unsaved Changes</Badge>
          )}
        </div>
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
                Disease Category * {!selectedDiseaseCategory && caseData?.primaryDiseaseCode && (
                  <span className="text-xs text-blue-600">(Please select category to edit diseases)</span>
                )}
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
              <p className="text-xs text-gray-500 mt-1">
                {!selectedDiseaseCategory && caseData?.primaryDiseaseCode 
                  ? 'Current disease: ' + caseData.primaryDiseaseCode + ' (select category to modify)'
                  : selectedDiseaseCategory ? 'Category selected - now choose diseases below' : 'Select a category first'
                }
              </p>
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

          {/* Secondary Diseases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Diseases/Conditions (Optional, max 5)
              {!caseData?.secondaryDiseaseCodes?.length && (
                <span className="text-xs text-green-600 ml-2">(Add additional diseases if applicable)</span>
              )}
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
              {selectedSecondaryDiseases.length === 0 && (
                <span className="text-green-600 ml-2">- No secondary diseases currently selected</span>
              )}
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms * (Select at least 1, max 20)
              {(!caseData?.symptomCodes?.length || caseData.symptomCodes.length === 0) && (
                <span className="text-xs text-red-600 ml-2">(Required - please select symptoms)</span>
              )}
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
                    {symptom.name}
                  </option>
                ))}
            </select>
            {errors.symptomCodes && (
              <p className="text-sm text-red-600 mt-1">{errors.symptomCodes.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple. Selected: {selectedSymptoms.length}/20
              {selectedSymptoms.length === 0 && (
                <span className="text-red-600 ml-2">- At least one symptom is required</span>
              )}
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
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-8 py-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={Object.keys(errors).length > 0 || !hasChanges || isSaving}
            className="px-8 py-3"
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCase;