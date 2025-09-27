import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Trash2,
  Edit,
  Upload,
  Plus,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Save,
  X
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  const [caseData, setCaseData] = useState(null);
  const [showAddDocumentsModal, setShowAddDocumentsModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Medication editing states
  const [isEditingMedications, setIsEditingMedications] = useState(false);
  const [medicationCategories, setMedicationCategories] = useState([]);
  const [medicationsInCategory, setMedicationsInCategory] = useState([]);
  const [selectedMedicationCategory, setSelectedMedicationCategory] = useState('');
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [isSavingMedications, setIsSavingMedications] = useState(false);

  // File upload configuration
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
    'image/webp': ['.webp']
  };

  useEffect(() => {
    if (caseId) {
      loadCaseDetails();
      loadMedicationCategories();
    }
  }, [caseId]);

  const loadCaseDetails = async () => {
    try {
      const data = await execute(() => patientService.getCaseById(caseId));
      setCaseData(data);
      setSelectedMedications(data.currentMedicationCodes || []);
    } catch (error) {
      console.error('Failed to load case details:', error);
    }
  };

  const loadMedicationCategories = async () => {
    try {
      const medications = await execute(() => commonService.getMedicalConfigurations('medications'));
      const uniqueCategories = [...new Set(
        (medications || []).map(medication => medication.category).filter(Boolean)
      )].sort();
      setMedicationCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load medication categories:', error);
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

  const handleMedicationCategoryChange = (category) => {
    setSelectedMedicationCategory(category);
    if (category) {
      loadMedicationsInCategory(category);
    } else {
      setMedicationsInCategory([]);
    }
  };

  const handleStartEditingMedications = () => {
    setIsEditingMedications(true);
    setSelectedMedications(caseData.currentMedicationCodes || []);
  };

  const handleCancelEditingMedications = () => {
    setIsEditingMedications(false);
    setSelectedMedications(caseData.currentMedicationCodes || []);
    setSelectedMedicationCategory('');
    setMedicationsInCategory([]);
  };

  const handleSaveMedications = async () => {
    setIsSavingMedications(true);
    try {
      const updateData = {
        caseTitle: caseData.caseTitle,
        description: caseData.description,
        primaryDiseaseCode: caseData.primaryDiseaseCode,
        secondaryDiseaseCodes: caseData.secondaryDiseaseCodes || [],
        symptomCodes: caseData.symptomCodes || [],
        currentMedicationCodes: selectedMedications,
        requiredSpecialization: caseData.requiredSpecialization,
        secondarySpecializations: caseData.secondarySpecializations || [],
        urgencyLevel: caseData.urgencyLevel,
        complexity: caseData.complexity
      };

      await execute(() => patientService.updateCase(caseId, updateData));
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        currentMedicationCodes: selectedMedications
      }));
      
      setIsEditingMedications(false);
      setSelectedMedicationCategory('');
      setMedicationsInCategory([]);
      alert('Medications updated successfully!');
      
    } catch (error) {
      console.error('Failed to update medications:', error);
      alert('Failed to update medications. Please try again.');
    } finally {
      setIsSavingMedications(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    
    files.forEach(file => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds 10MB limit`);
        return;
      }
      
      // Validate file type
      const isValidType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
      if (!isValidType) {
        alert(`File ${file.name} has invalid type. Only PDF and images are allowed.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    setSelectedFiles(validFiles);
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await execute(() => 
        patientService.updateCaseAttachments(caseId, selectedFiles, (progress) => {
          setUploadProgress(Math.round((progress.loaded * 100) / progress.total));
        })
      );
      
      // Reload case details to show new documents
      await loadCaseDetails();
      
      // Reset upload state
      setSelectedFiles([]);
      setShowAddDocumentsModal(false);
      alert('Documents uploaded successfully!');
      
    } catch (error) {
      console.error('Failed to upload documents:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      await patientService.viewCaseDocument(caseId, doc.id);
    } catch (error) {
      console.error('Failed to view document:', error);
      alert('Failed to view document. Please try again.');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      await patientService.downloadCaseDocument(caseId, doc.id, doc.fileName);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  // Show loading state
  if (loading && !caseData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!caseData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Case Not Found</h3>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
          <Button 
            onClick={() => navigate(-1)} 
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Case #{caseData.id}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Created on {formatDate(caseData.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <StatusBadge status={caseData.status} />
            <PriorityBadge priority={caseData.urgencyLevel} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'medical', name: 'Medical Details', icon: Stethoscope },
              { id: 'documents', name: 'Documents', icon: FileText },
              { id: 'timeline', name: 'Timeline', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Case Overview */}
                <Card title="Case Overview">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {caseData.caseTitle}
                      </h3>
                      <p className="text-gray-700">
                        {caseData.description}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Medical Summary */}
                <Card title="Medical Summary">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Primary Disease
                      </h4>
                      <Badge variant="error">
                        {caseData.primaryDiseaseCode || 'Not specified'}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Specialization Required
                      </h4>
                      <Badge variant="primary">
                        {caseData.requiredSpecialization || 'Not specified'}
                      </Badge>
                    </div>
                  </div>

                  {/* Secondary Diseases */}
                  {caseData.secondaryDiseaseCodes && caseData.secondaryDiseaseCodes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Secondary Diseases</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.secondaryDiseaseCodes.map((code, index) => (
                          <Badge key={index} variant="warning">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary Specializations */}
                  {caseData.secondarySpecializations && caseData.secondarySpecializations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.secondarySpecializations.map((spec, index) => (
                          <Badge key={index} variant="info">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Case Information */}
                <Card title="Case Information">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Case ID</span>
                      <span className="text-sm font-medium">#{caseData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <StatusBadge status={caseData.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Urgency</span>
                      <PriorityBadge priority={caseData.urgencyLevel} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">{formatDate(caseData.createdAt)}</span>
                    </div>
                    {caseData.acceptedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accepted</span>
                        <span className="text-sm font-medium">{formatDate(caseData.acceptedAt)}</span>
                      </div>
                    )}
                    {caseData.scheduledAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Scheduled</span>
                        <span className="text-sm font-medium">{formatDate(caseData.scheduledAt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <Badge variant={caseData.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>
                        {caseData.paymentStatus}
                      </Badge>
                    </div>
                    {caseData.consultationFee && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fee</span>
                        <span className="text-sm font-medium">${caseData.consultationFee}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Actions">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      icon={<Edit className="w-4 h-4" />}
                      fullWidth
                      disabled={!['SUBMITTED', 'PENDING'].includes(caseData.status)}
                      onClick={() => navigate(`/app/patient/cases/${caseId}/edit`)}
                    >
                      Edit Case
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={<Upload className="w-4 h-4" />}
                      fullWidth
                      onClick={() => setShowAddDocumentsModal(true)}
                    >
                      Add Documents
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={<FileText className="w-4 h-4" />}
                      fullWidth
                      onClick={() => setActiveTab('documents')}
                    >
                      View Documents ({caseData.documents?.length || 0})
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Medical Details Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              {/* Diseases */}
              <Card title="Diseases & Conditions">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Primary Disease</h4>
                    <Badge variant="error" size="lg">
                      {caseData.primaryDiseaseCode}
                    </Badge>
                  </div>

                  {caseData.secondaryDiseaseCodes && caseData.secondaryDiseaseCodes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Secondary Diseases</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.secondaryDiseaseCodes.map((code, index) => (
                          <Badge key={index} variant="warning">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Symptoms */}
              <Card title="Symptoms">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {caseData.symptomCodes && caseData.symptomCodes.length > 0 ? (
                    caseData.symptomCodes.map((symptom, index) => (
                      <Badge key={index} variant="info">
                        {symptom}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full">No symptoms recorded</p>
                  )}
                </div>
              </Card>

              {/* Current Medications - Editable Section */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
                  {!isEditingMedications ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={handleStartEditingMedications}
                      disabled={!['SUBMITTED', 'PENDING'].includes(caseData.status)}
                    >
                      Edit Medications
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<X className="w-4 h-4" />}
                        onClick={handleCancelEditingMedications}
                        disabled={isSavingMedications}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSaveMedications}
                        loading={isSavingMedications}
                        disabled={isSavingMedications}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditingMedications ? (
                  // Display Mode
                  <div className="space-y-2">
                    {caseData.currentMedicationCodes && caseData.currentMedicationCodes.length > 0 ? (
                      caseData.currentMedicationCodes.map((medication, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Pill className="w-4 h-4 text-blue-600" />
                          <Badge variant="success">{medication}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No current medications recorded</p>
                        <Button
                          variant="outline"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={handleStartEditingMedications}
                          disabled={!['SUBMITTED', 'PENDING'].includes(caseData.status)}
                        >
                          Add Medications
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Medication Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medication Category
                        </label>
                        <select
                          value={selectedMedicationCategory}
                          onChange={(e) => handleMedicationCategoryChange(e.target.value)}
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

                      {/* Medication Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Medications (max 15)
                        </label>
                        <select
                          multiple
                          value={selectedMedications}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            if (values.length <= 15) {
                              setSelectedMedications(values);
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

                    {/* Selected Medications Preview */}
                    {selectedMedications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Selected Medications ({selectedMedications.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedications.map((medication, index) => (
                            <Badge key={index} variant="success">
                              {medication}
                              <button
                                onClick={() => {
                                  setSelectedMedications(prev => prev.filter(med => med !== medication));
                                }}
                                className="ml-2 text-green-700 hover:text-green-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Specializations */}
              <Card title="Required Specializations">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Primary Specialization</h4>
                    <Badge variant="primary" size="lg">
                      {caseData.requiredSpecialization}
                    </Badge>
                  </div>

                  {caseData.secondarySpecializations && caseData.secondarySpecializations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.secondarySpecializations.map((spec, index) => (
                          <Badge key={index} variant="info">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Documents Tab - Keep existing implementation */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Case Documents ({caseData.documents?.length || 0})
                </h3>
                <Button 
                  variant="primary" 
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddDocumentsModal(true)}
                >
                  Add Documents
                </Button>
              </div>

              {caseData.documents && caseData.documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {caseData.documents.map((doc) => (
                    <Card key={doc.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <FileText className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Type: {doc.documentType}</p>
                              <p>Size: {formatFileSize(doc.originalFileSize)}</p>
                              <p>Uploaded: {formatDate(doc.createdAt)}</p>
                              <p>Format: {doc.mimeType}</p>
                              <div className="flex items-center space-x-2">
                                {doc.isEncrypted && (
                                  <Badge variant="success" size="sm">Encrypted</Badge>
                                )}
                                {doc.isCompressed && (
                                  <Badge variant="info" size="sm">Compressed</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleViewDocument(doc)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download className="w-4 h-4" />}
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
                  <p className="text-gray-600 mb-4">No documents have been uploaded for this case yet.</p>
                  <Button 
                    variant="primary" 
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowAddDocumentsModal(true)}
                  >
                    Add First Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <Card title="Case Timeline">
                <div className="space-y-4">
                  {/* Timeline items based on case data */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Case Created</p>
                      <p className="text-sm text-gray-600">{formatDate(caseData.createdAt)}</p>
                    </div>
                  </div>

                  {caseData.acceptedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Case Accepted</p>
                        <p className="text-sm text-gray-600">{formatDate(caseData.acceptedAt)}</p>
                      </div>
                    </div>
                  )}

                  {caseData.scheduledAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Consultation Scheduled</p>
                        <p className="text-sm text-gray-600">{formatDate(caseData.scheduledAt)}</p>
                      </div>
                    </div>
                  )}

                  {caseData.paymentCompletedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Payment Completed</p>
                        <p className="text-sm text-gray-600">{formatDate(caseData.paymentCompletedAt)}</p>
                      </div>
                    </div>
                  )}

                  {caseData.closedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Case Closed</p>
                        <p className="text-sm text-gray-600">{formatDate(caseData.closedAt)}</p>
                      </div>
                    </div>
                  )}

                  {caseData.rejectionReason && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-red-600">Case Rejected</p>
                        <p className="text-sm text-gray-600">Reason: {caseData.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Add Documents Modal */}
      <Modal
        isOpen={showAddDocumentsModal}
        onClose={() => {
          setShowAddDocumentsModal(false);
          setSelectedFiles([]);
        }}
        title="Add Documents"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 10MB per file. Supported formats: PDF, JPG, PNG, GIF, BMP, WebP
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDocumentsModal(false);
                setSelectedFiles([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadDocuments}
              disabled={selectedFiles.length === 0 || isUploading}
              loading={isUploading}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Documents
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaseDetails;