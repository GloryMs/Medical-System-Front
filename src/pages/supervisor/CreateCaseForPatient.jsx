import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowLeft,
  User,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import supervisorService from '../../services/api/supervisorService';
import commonService from '../../services/api/commonService';

// Validation schema based on API documentation
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

const CreateCaseForPatient = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Medical configurations
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

  // Selected values for cascading dropdowns
  const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState('');
  const [selectedMedicationCategory, setSelectedMedicationCategory] = useState('');
  const [selectedMainSpecialization, setSelectedMainSpecialization] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
      dependentId: null
    }
  });

  // Watch form values
  const selectedSymptoms = watch('symptomCodes') || [];
  const selectedMedications = watch('currentMedicationCodes') || [];
  const selectedSecondaryDiseases = watch('secondaryDiseaseCodes') || [];
  const selectedSecondarySpecs = watch('secondarySpecializations') || [];

  // Load patient info and medical configurations
  useEffect(() => {
    loadPatientInfo();
    loadMedicalConfigurations();
  }, [patientId]);

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

  const loadPatientInfo = async () => {
    try {
      setLoadingPatient(true);
      const response = await supervisorService.getPatientInfo(patientId);
      setPatientInfo(response);
    } catch (error) {
      console.error('Failed to load patient info:', error);
      toast.error('Failed to load patient information');
      navigate('/app/supervisor/patients');
    } finally {
      setLoadingPatient(false);
    }
  };

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
        commonService.getMedicalConfigurations('diseases'),
        commonService.getMedicalConfigurations('symptoms'),
        commonService.getAllMedications(),
        commonService.getMedicalConfigurations('SPECIALIZATION'),
        commonService.getMedicalConfigurations('SUBSPECIALIZATION')
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
      toast.error('Failed to load medical configurations');
    }
  };

  const loadDiseasesInCategory = async (category) => {
    try {
      const diseases = await commonService.getDiseasesByCategory(category);
      setDiseasesInCategory(diseases || []);
    } catch (error) {
      console.error('Failed to load diseases for category:', category, error);
      setDiseasesInCategory([]);
    }
  };

  const loadMedicationsInCategory = (category) => {
    try {
      const filteredMedications = medicalConfigs.medications.filter(
        medication => medication.category === category && medication.isActive === true
      );
      setMedicationsInCategory(filteredMedications || []);
    } catch (error) {
      console.error('Failed to load medications for category:', category, error);
      setMedicationsInCategory([]);
    }
  };

  const handleDiseaseCategory = (category) => {
    setSelectedDiseaseCategory(category);
    setValue('primaryDiseaseCode', '');
    setValue('secondaryDiseaseCodes', []);
  };

  const handleMedicationCategory = (category) => {
    setSelectedMedicationCategory(category);
    setValue('currentMedicationCodes', []);
  };

  const handleMainSpecialization = (specializationCode) => {
    setSelectedMainSpecialization(specializationCode);
    setValue('requiredSpecialization', specializationCode);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare case data according to API documentation
      const caseData = {
        caseTitle: data.caseTitle,
        description: data.description,
        primaryDiseaseCode: data.primaryDiseaseCode,
        secondaryDiseaseCodes: data.secondaryDiseaseCodes || [],
        symptomCodes: data.symptomCodes || [],
        currentMedicationCodes: data.currentMedicationCodes || [],
        requiredSpecialization: data.requiredSpecialization,
        secondarySpecializations: data.secondarySpecializations || [],
        urgencyLevel: data.urgencyLevel,
        complexity: data.complexity,
        requiresSecondOpinion: data.requiresSecondOpinion,
        minDoctorsRequired: data.minDoctorsRequired,
        maxDoctorsAllowed: data.maxDoctorsAllowed,
        dependentId: null
      };

      // Submit case for patient
      await supervisorService.submitCase(patientId, caseData);

      toast.success('Case submitted successfully!', {
        position: 'top-right',
        autoClose: 3000
      });

      setTimeout(() => {
        navigate('/app/supervisor/cases');
      }, 1000);

    } catch (error) {
      console.error('Failed to submit case:', error);
      toast.error(error.response?.data?.message || 'Failed to submit case. Please try again.', {
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load patient information</p>
          <Button onClick={() => navigate('/app/supervisor/patients')}>
            Back to Patients
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft />}
          onClick={() => navigate('/app/supervisor/patients')}
          className="mb-4"
        >
          Back to Patients
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Case for Patient</h1>
            <p className="text-gray-600">Create a new medical case on behalf of {patientInfo.fullName}</p>
          </div>
        </div>
      </div>

      {/* Patient Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><span className="font-medium text-gray-700">Name:</span> {patientInfo.fullName}</p>
              <p><span className="font-medium text-gray-700">Email:</span> {patientInfo.email}</p>
              {patientInfo.phoneNumber && (
                <p><span className="font-medium text-gray-700">Phone:</span> {patientInfo.phoneNumber}</p>
              )}
              {patientInfo.dateOfBirth && (
                <p><span className="font-medium text-gray-700">DOB:</span> {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
              )}
              {patientInfo.gender && (
                <p><span className="font-medium text-gray-700">Gender:</span> {patientInfo.gender}</p>
              )}
              {patientInfo.bloodGroup && (
                <p><span className="font-medium text-gray-700">Blood Type:</span> {patientInfo.bloodGroup}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Case Information */}
        <Card title="Case Information" className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('caseTitle')}
              placeholder="Brief title describing the medical concern"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Provide a detailed description of symptoms, duration, severity, and any relevant medical history..."
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
        <Card title="Medical Information" icon={<Stethoscope />} className="space-y-6">
          {/* Disease Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disease Category <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Disease/Condition <span className="text-red-500">*</span>
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
            <div className={`w-full border rounded-lg p-4 max-h-[250px] overflow-y-auto ${
              !selectedDiseaseCategory ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
            }`}>
              {!selectedDiseaseCategory ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">
                    Please select a primary disease category first
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {diseasesInCategory
                    .filter(disease => disease.isActive && disease.icdCode !== watch('primaryDiseaseCode'))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((disease) => (
                      <label
                        key={disease.icdCode}
                        className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={disease.icdCode}
                          checked={selectedSecondaryDiseases.includes(disease.icdCode)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            let newValues;

                            if (checked && selectedSecondaryDiseases.length < 5) {
                              newValues = [...selectedSecondaryDiseases, value];
                            } else if (!checked) {
                              newValues = selectedSecondaryDiseases.filter(code => code !== value);
                            } else {
                              return;
                            }

                            setValue('secondaryDiseaseCodes', newValues);
                          }}
                          className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!selectedSecondaryDiseases.includes(disease.icdCode) && selectedSecondaryDiseases.length >= 5}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900">
                            {disease.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({disease.icdCode})
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedSecondaryDiseases.length}/5
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms <span className="text-red-500">*</span> (Select at least 1, max 20)
            </label>
            <div className={`w-full border rounded-lg p-4 max-h-[300px] overflow-y-auto ${
              errors.symptomCodes ? 'border-red-300' : 'border-gray-300'
            }`}>
              <div className="space-y-2">
                {medicalConfigs.symptoms
                  .filter(symptom => symptom.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((symptom) => (
                    <label
                      key={symptom.code}
                      className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={symptom.code}
                        checked={selectedSymptoms.includes(symptom.code)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          let newValues;

                          if (checked && selectedSymptoms.length < 20) {
                            newValues = [...selectedSymptoms, value];
                          } else if (!checked) {
                            newValues = selectedSymptoms.filter(code => code !== value);
                          } else {
                            return;
                          }

                          setValue('symptomCodes', newValues);
                          trigger('symptomCodes');
                        }}
                        className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={!selectedSymptoms.includes(symptom.code) && selectedSymptoms.length >= 20}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">
                          {symptom.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({symptom.bodySystem})
                        </span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
            {errors.symptomCodes && (
              <p className="text-sm text-red-600 mt-1">{errors.symptomCodes.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedSymptoms.length}/20
            </p>
          </div>
        </Card>

        {/* Current Medications */}
        <Card title="Current Medications" icon={<Pill />} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications (Optional, max 15)
              </label>
              <div className={`w-full border rounded-lg p-4 max-h-[300px] overflow-y-auto ${
                !selectedMedicationCategory ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
              }`}>
                {!selectedMedicationCategory ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">
                      Please select a medication category first
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medicationsInCategory
                      .filter(medication => medication.isActive)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((medication) => (
                        <label
                          key={medication.atcCode}
                          className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={medication.atcCode}
                            checked={selectedMedications.includes(medication.atcCode)}
                            onChange={(e) => {
                              const { value, checked } = e.target;
                              let newValues;

                              if (checked && selectedMedications.length < 15) {
                                newValues = [...selectedMedications, value];
                              } else if (!checked) {
                                newValues = selectedMedications.filter(code => code !== value);
                              } else {
                                return;
                              }

                              setValue('currentMedicationCodes', newValues);
                            }}
                            className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            disabled={!selectedMedications.includes(medication.atcCode) && selectedMedications.length >= 15}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {medication.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {medication.genericName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({medication.atcCode})
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedMedicationCategory
                  ? `Selected: ${selectedMedications.length}/15`
                  : 'Select a category first to see medications'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Specialization Requirements */}
        <Card title="Specialization Requirements" icon={<Activity />} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Specialization <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Specializations (Optional, max 3)
              </label>
              <div className="w-full border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  {medicalConfigs.specializations
                    .filter(spec => spec.isActive && spec.level === 1 && spec.code !== selectedMainSpecialization)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((spec) => (
                      <label
                        key={spec.code}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={spec.code}
                          checked={selectedSecondarySpecs.includes(spec.code)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            let newValues;

                            if (checked && selectedSecondarySpecs.length < 3) {
                              newValues = [...selectedSecondarySpecs, value];
                            } else if (!checked) {
                              newValues = selectedSecondarySpecs.filter(code => code !== value);
                            } else {
                              return;
                            }

                            setValue('secondarySpecializations', newValues);
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          disabled={!selectedSecondarySpecs.includes(spec.code) && selectedSecondarySpecs.length >= 3}
                        />
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {spec.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedSecondarySpecs.length}/3
              </p>
            </div>
          </div>
        </Card>

        {/* Case Settings */}
        <Card title="Case Settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level <span className="text-red-500">*</span>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Complexity <span className="text-red-500">*</span>
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
                <option value="VERY_COMPLEX">Very Complex - High complexity case</option>
              </select>
            </div>
          </div>

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

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/supervisor/patients')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            icon={<Plus />}
          >
            {isSubmitting ? 'Submitting Case...' : 'Submit Case'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCaseForPatient;
