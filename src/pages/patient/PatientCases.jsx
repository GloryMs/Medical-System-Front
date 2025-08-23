import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Clock,
  User,
  Heart,
  Stethoscope,
  Download,
  Upload,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Pill,
  Activity
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schema for creating cases
const createCaseSchema = yup.object({
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

const PatientCases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  
  // Medical configurations
  const [medicalConfigs, setMedicalConfigs] = useState({
    diseases: [],
    symptoms: [],
    specializations: [],
    medications: []
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
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

  // Load data on component mount
  useEffect(() => {
    loadCases();
    loadMedicalConfigurations();
  }, []);

  // Filter cases when search term or filters change
  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter, urgencyFilter]);

  const loadCases = async () => {
    try {
      const data = await execute(() => patientService.getCases());
      setCases(data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadMedicalConfigurations = async () => {
    try {
      const [diseases, symptoms, specializations, medications] = await Promise.all([
        execute(() => commonService.getMedicalConfigurations('DISEASE')),
        execute(() => commonService.getMedicalConfigurations('SYMPTOM')),
        execute(() => commonService.getMedicalConfigurations('SPECIALIZATION')),
        execute(() => commonService.getMedicalConfigurations('MEDICATION'))
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

  const filterCases = () => {
    let filtered = [...cases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.urgencyLevel?.toLowerCase() === urgencyFilter.toLowerCase());
    }

    setFilteredCases(filtered);
  };

  const handleCreateCase = async (data) => {
    try {
      const newCase = await execute(() => patientService.createCase(data));
      setCases(prev => [newCase, ...prev]);
      setShowCreateModal(false);
      reset();
      
      // Navigate to the new case details
      navigate(`/patient/cases/${newCase.id}`);
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  const handleDeleteCase = async () => {
    if (!selectedCase) return;
    
    try {
      await execute(() => patientService.deleteCase(selectedCase.id));
      setCases(prev => prev.filter(c => c.id !== selectedCase.id));
      setShowDeleteModal(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  const handleDocumentUpload = async (caseId, files) => {
    setIsUploadingDocs(true);
    try {
      await execute(() => patientService.uploadCaseDocuments(caseId, files));
      loadCases(); // Refresh to show updated documents
    } catch (error) {
      console.error('Failed to upload documents:', error);
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const handleArrayToggle = (fieldName, value) => {
    const currentValues = getValues(fieldName) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(fieldName, newValues);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      scheduled: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || colors.submitted;
  };

  const getCaseStats = () => {
    const stats = {
      total: cases.length,
      submitted: cases.filter(c => c.status === 'SUBMITTED').length,
      in_progress: cases.filter(c => ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(c.status)).length,
      completed: cases.filter(c => c.status === 'COMPLETED').length,
      rejected: cases.filter(c => c.status === 'REJECTED').length
    };
    return stats;
  };

  const stats = getCaseStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your medical consultation cases
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={loadCases}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  New Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-900">Total Cases</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-900">Submitted</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.submitted}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-900">In Progress</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.in_progress}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-900">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500 rounded-lg">
                  <X className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-900">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Urgency</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setUrgencyFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Cases List */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredCases.length > 0 ? (
              <div className="space-y-6">
                {filteredCases.map((case_) => (
                  <div
                    key={case_.id}
                    className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {case_.caseTitle}
                            </h3>
                            <StatusBadge status={case_.status} />
                            <PriorityBadge priority={case_.urgencyLevel} />
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {case_.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {case_.primaryDiseaseCode}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Stethoscope className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600">
                                {case_.requiredSpecialization}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">
                                {formatDate(case_.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-600">
                                {case_.documents?.length || 0} documents
                              </span>
                            </div>
                          </div>

                          {/* Symptoms */}
                          {case_.symptomCodes && case_.symptomCodes.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                              <div className="flex flex-wrap gap-1">
                                {case_.symptomCodes.slice(0, 5).map((symptom, index) => (
                                  <Badge key={index} variant="info" size="sm">
                                    {symptom}
                                  </Badge>
                                ))}
                                {case_.symptomCodes.length > 5 && (
                                  <Badge variant="outline" size="sm">
                                    +{case_.symptomCodes.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Assigned Doctor */}
                          {case_.assignedDoctor && (
                            <div className="flex items-center space-x-2 mb-4">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Assigned to: Dr. {case_.assignedDoctor.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Link to={`/patient/cases/${case_.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View
                            </Button>
                          </Link>

                          {case_.status === 'SUBMITTED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => navigate(`/patient/cases/${case_.id}/edit`)}
                            >
                              Edit
                            </Button>
                          )}

                          {['SUBMITTED', 'REJECTED'].includes(case_.status) && (
                            <Button
                              variant="error"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={() => {
                                setSelectedCase(case_);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          )}

                          <input
                            type="file"
                            id={`file-upload-${case_.id}`}
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files.length > 0) {
                                handleDocumentUpload(case_.id, Array.from(e.target.files));
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Upload className="w-4 h-4" />}
                            onClick={() => document.getElementById(`file-upload-${case_.id}`).click()}
                            disabled={isUploadingDocs}
                          >
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'No cases found'
                    : 'No cases yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Submit your first medical consultation case'
                  }
                </p>
                {!(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
                  <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create New Case
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Case Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        onSubmit={handleSubmit(handleCreateCase)}
        title="Create New Case"
        submitText="Create Case"
        size="lg"
        isLoading={loading}
      >
        <div className="space-y-6">
          {/* Case Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Title *
            </label>
            <input
              {...register('caseTitle')}
              type="text"
              placeholder="Brief description of your medical concern"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.caseTitle ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.caseTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.caseTitle.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Provide detailed information about your condition, symptoms, and medical history"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Primary Disease */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Disease/Condition *
            </label>
            <select
              {...register('primaryDiseaseCode')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.primaryDiseaseCode ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select primary disease</option>
              {medicalConfigs.diseases.map((disease) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Diseases (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {medicalConfigs.diseases.map((disease) => (
                  <label key={disease.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSecondaryDiseases.includes(disease.code)}
                      onChange={() => handleArrayToggle('secondaryDiseaseCodes', disease.code)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{disease.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms *
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {medicalConfigs.symptoms.map((symptom) => (
                  <label key={symptom.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom.code)}
                      onChange={() => handleArrayToggle('symptomCodes', symptom.code)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{symptom.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors.symptomCodes && (
              <p className="text-sm text-red-600 mt-1">{errors.symptomCodes.message}</p>
            )}
          </div>

          {/* Current Medications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Medications (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {medicalConfigs.medications.map((medication) => (
                  <label key={medication.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMedications.includes(medication.code)}
                      onChange={() => handleArrayToggle('currentMedicationCodes', medication.code)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{medication.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Required Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Specialization *
            </label>
            <select
              {...register('requiredSpecialization')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.requiredSpecialization ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select required specialization</option>
              {medicalConfigs.specializations.map((spec) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Specializations (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {medicalConfigs.specializations.map((spec) => (
                  <label key={spec.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSecondarySpecs.includes(spec.code)}
                      onChange={() => handleArrayToggle('secondarySpecializations', spec.code)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{spec.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Case Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency Level *
              </label>
              <select
                {...register('urgencyLevel')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.urgencyLevel ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.urgencyLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.urgencyLevel.message}</p>
              )}
            </div>

            {/* Case Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Complexity *
              </label>
              <select
                {...register('complexity')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.complexity ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="SIMPLE">Simple</option>
                <option value="MODERATE">Moderate</option>
                <option value="COMPLEX">Complex</option>
                <option value="VERY_COMPLEX">Very Complex</option>
              </select>
              {errors.complexity && (
                <p className="text-sm text-red-600 mt-1">{errors.complexity.message}</p>
              )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            {/* Second Opinion */}
            <div className="flex items-center space-x-2">
              <input
                {...register('requiresSecondOpinion')}
                type="checkbox"
                className="rounded text-primary-600"
              />
              <label className="text-sm text-gray-700">
                Requires second medical opinion
              </label>
            </div>

            {/* Doctor Requirements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Doctors Required
                </label>
                <select
                  {...register('minDoctorsRequired')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="1">1 Doctor</option>
                  <option value="2">2 Doctors</option>
                  <option value="3">3 Doctors</option>
                  <option value="4">4 Doctors</option>
                  <option value="5">5 Doctors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Doctors Allowed
                </label>
                <select
                  {...register('maxDoctorsAllowed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="1">1 Doctor</option>
                  <option value="2">2 Doctors</option>
                  <option value="3">3 Doctors</option>
                  <option value="4">4 Doctors</option>
                  <option value="5">5 Doctors</option>
                </select>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Please provide accurate and detailed information</li>
                  <li>You can upload supporting documents after case creation</li>
                  <li>Cases will be reviewed and assigned to appropriate doctors</li>
                  <li>You will be notified once a doctor is assigned</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCase(null);
        }}
        onConfirm={handleDeleteCase}
        title="Delete Case"
        message={`Are you sure you want to delete "${selectedCase?.caseTitle}"? This action cannot be undone.`}
        confirmText="Delete Case"
        type="error"
        isLoading={loading}
      />
    </div>
  );
};

export default PatientCases;