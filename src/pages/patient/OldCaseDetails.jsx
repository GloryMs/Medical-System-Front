import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Heart,
  Pill,
  Activity,
  Star,
  MessageSquare,
  Download,
  Upload,
  Edit,
  Phone,
  Video,
  Mail,
  AlertTriangle,
  CheckCircle,
  Image,
  File,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Save,
  DeleteIcon
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState({});

  //Regarding Files:
  // const [uploadedFiles, setUploadedFiles] = useState([]);
  // const [uploadProgress, setUploadProgress] = useState({});
  // const [fileErrors, setFileErrors] = useState([]);
  // const [isUploading, setIsUploading] = useState(false);
  // const [isDragActive, setIsDragActive] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]); // Files selected for preview
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileErrors, setFileErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);


  // File upload configuration (from CreateCase.jsx)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 10; // Updated to 10 files per case
  const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
    'image/webp': ['.webp']
  };

  useEffect(() => {
    console.log('Strt Loading Data ...');
    if (caseId) {
      loadCaseDetails();
    }
  }, [caseId]);

  const loadCaseDetails = async () => {
    try {
      console.log('Loading case details');
      const data = await execute(() => patientService.getCaseById(caseId));
      setCaseData(data);
      setEditedCase(data);
    } catch (error) {
      console.error('Failed to load case details:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await execute(() => patientService.updateCaseStatus(caseId, newStatus));
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await execute(() => patientService.addCaseNote(caseId, {
        content: newNote,
        isPrivate: false
      }));
      setNewNote('');
      setShowAddNote(false);
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await execute(() => patientService.updateCase(caseId, editedCase));
      setIsEditing(false);
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleScheduleAppointment = () => {
    navigate(`/appointments/schedule/${caseId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

    // Add these new state variables for file upload functionality
  // const [selectedFiles, setSelectedFiles] = useState([]); // Files selected for preview
  // const [uploadProgress, setUploadProgress] = useState({});
  // const [fileErrors, setFileErrors] = useState([]);
  // const [isUploading, setIsUploading] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isDragActive, setIsDragActive] = useState(false);

  // File upload configuration (from CreateCase.jsx)
  // const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  // const MAX_FILES = 10; // Updated to 10 files per case
  // const ALLOWED_FILE_TYPES = {
  //   'application/pdf': ['.pdf'],
  //   'image/jpeg': ['.jpg', '.jpeg'],
  //   'image/png': ['.png'],
  //   'image/gif': ['.gif'],
  //   'image/bmp': ['.bmp'],
  //   'image/webp': ['.webp']
  // };

  // ... existing useEffect and other functions (keep as is)

  // // File validation function (from CreateCase.jsx)
  // const validateFile = (file) => {
  //   const errors = [];
    
  //   // Check file size
  //   if (file.size > MAX_FILE_SIZE) {
  //     errors.push(`File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  //   }
    
  //   // Check file type
  //   const isValidType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type) ||
  //     Object.values(ALLOWED_FILE_TYPES).flat().some(ext => 
  //       file.name.toLowerCase().endsWith(ext)
  //     );
    
  //   if (!isValidType) {
  //     errors.push('Only PDF and image files (JPG, PNG, GIF, BMP, WebP) are allowed');
  //   }
    
  //   return errors;
  // };

  // // Handle file selection (Step 1 - Preview)
  // const handleFileSelection = (files) => {
  //   const fileList = Array.from(files);
    
  //   // Check total file count including existing documents
  //   const currentDocCount = caseData.documents?.length || 0;
  //   const totalFiles = currentDocCount + selectedFiles.length + fileList.length;
    
  //   if (totalFiles > MAX_FILES) {
  //     setFileErrors([`Maximum ${MAX_FILES} files allowed per case. Current: ${currentDocCount}, Selected: ${selectedFiles.length}`]);
  //     return;
  //   }

  //   setFileErrors([]);
  //   const validFiles = [];
    
  //   // Validate files
  //   for (const file of fileList) {
  //     const errors = validateFile(file);
      
  //     if (errors.length > 0) {
  //       setFileErrors(prev => [...prev, `${file.name}: ${errors.join(', ')}`]);
  //       continue;
  //     }
      
  //     // Create file object with preview URL
  //     const fileWithPreview = {
  //       id: Date.now() + Math.random(),
  //       file,
  //       name: file.name,
  //       size: file.size,
  //       type: file.type,
  //       previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  //     };
      
  //     validFiles.push(fileWithPreview);
  //   }

  //   if (validFiles.length > 0) {
  //     setSelectedFiles(prev => [...prev, ...validFiles]);
  //   }
  // };

  // // Remove selected file from preview
  // const removeSelectedFile = (fileId) => {
  //   setSelectedFiles(prev => {
  //     const updatedFiles = prev.filter(f => f.id !== fileId);
  //     // Clean up preview URLs
  //     const fileToRemove = prev.find(f => f.id === fileId);
  //     if (fileToRemove?.previewUrl) {
  //       URL.revokeObjectURL(fileToRemove.previewUrl);
  //     }
  //     return updatedFiles;
  //   });
  // };

  // // Submit selected files to backend (Step 2 - Upload)
  // const handleSubmitFiles = async () => {
  //   if (selectedFiles.length === 0) {
  //     setFileErrors(['No files selected to upload']);
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   setFileErrors([]);

  //   try {
  //     // Extract actual File objects
  //     const filesToUpload = selectedFiles.map(f => f.file);
      
  //     // Upload files using existing uploadCaseDocuments method
  //     const uploadResult = await execute(() => 
  //       patientService.uploadCaseDocuments(caseId, filesToUpload, (progressEvent) => {
  //         const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //         setUploadProgress(prev => ({ ...prev, current: progress }));
  //       })
  //     );

  //     // Extract document IDs from upload result
  //     const newDocumentIds = uploadResult.documents?.map(doc => doc.id) || [];
      
  //     if (newDocumentIds.length > 0) {
  //       // Update case attachments using the new endpoint
  //       await execute(() => patientService.updateCaseAttachments(caseId, newDocumentIds));
        
  //       // Reload case details to show updated documents
  //       await loadCaseDetails();
        
  //       // Clean up preview URLs
  //       selectedFiles.forEach(file => {
  //         if (file.previewUrl) {
  //           URL.revokeObjectURL(file.previewUrl);
  //         }
  //       });
        
  //       // Reset state
  //       setSelectedFiles([]);
  //       setUploadProgress({});
  //       alert(`Successfully uploaded ${newDocumentIds.length} file(s) to the case.`);
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to upload documents:', error);
  //     setFileErrors(prev => [...prev, 'Failed to upload files. Please try again.']);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // // Handle file drop
  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   setIsDragActive(false);
  //   handleFileSelection(e.dataTransfer.files);
  // };

  // // Handle drag events
  // const handleDragOver = (e) => {
  //   e.preventDefault();
  //   setIsDragActive(true);
  // };

  // const handleDragLeave = () => {
  //   setIsDragActive(false);
  // };

  // ... existing useEffect and other functions (keep as is)

  // File validation function (from CreateCase.jsx)
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

  // Handle file selection (Step 1 - Preview)
  const handleFileSelection = (files) => {
    const fileList = Array.from(files);
    
    // Check total file count including existing documents
    const currentDocCount = caseData.documents?.length || 0;
    const totalFiles = currentDocCount + selectedFiles.length + fileList.length;
    
    if (totalFiles > MAX_FILES) {
      setFileErrors([`Maximum ${MAX_FILES} files allowed per case. Current: ${currentDocCount}, Selected: ${selectedFiles.length}`]);
      return;
    }

    setFileErrors([]);
    const validFiles = [];
    
    // Validate files
    for (const file of fileList) {
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        setFileErrors(prev => [...prev, `${file.name}: ${errors.join(', ')}`]);
        continue;
      }
      
      // Create file object with preview URL
      const fileWithPreview = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      };
      
      validFiles.push(fileWithPreview);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Remove selected file from preview
  const removeSelectedFile = (fileId) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Clean up preview URLs
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return updatedFiles;
    });
  };

  // Submit selected files to backend (Step 2 - Upload)
  const handleSubmitFiles = async () => {
    if (selectedFiles.length === 0) {
      setFileErrors(['No files selected to upload']);
      return;
    }

    setIsSubmitting(true);
    setFileErrors([]);

    try {
      // Extract actual File objects
      const filesToUpload = selectedFiles.map(f => f.file);
      
      // Upload files using existing uploadCaseDocuments method
      const uploadResult = await execute(() => 
        patientService.uploadCaseDocuments(caseId, filesToUpload, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, current: progress }));
        })
      );

      // Extract document IDs from upload result
      const newDocumentIds = uploadResult.documents?.map(doc => doc.id) || [];
      
      if (newDocumentIds.length > 0) {
        // Update case attachments using the new endpoint
        await execute(() => patientService.updateCaseAttachments(caseId, newDocumentIds));
        
        // Reload case details to show updated documents
        await loadCaseDetails();
        
        // Clean up preview URLs
        selectedFiles.forEach(file => {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
        
        // Reset state
        setSelectedFiles([]);
        setUploadProgress({});
        alert(`Successfully uploaded ${newDocumentIds.length} file(s) to the case.`);
      }
      
    } catch (error) {
      console.error('Failed to upload documents:', error);
      setFileErrors(prev => [...prev, 'Failed to upload files. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileSelection(e.dataTransfer.files);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical Details', icon: <Heart className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> }
  ];

  const getStatusActions = (status) => {
    const actions = [];
    
    switch (status?.toLowerCase()) {
      case 'submitted':
      case 'pending':
        if (user.role === 'ADMIN') {
          actions.push(
            <Button 
              key="assign" 
              variant="primary" 
              size="sm"
              onClick={() => handleStatusUpdate('ASSIGNED')}
            >
              Assign Doctor
            </Button>
          );
        }
        break;
      
      case 'assigned':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="accept" 
              variant="success" 
              size="sm"
              onClick={() => handleStatusUpdate('ACCEPTED')}
            >
              Accept Case
            </Button>,
            <Button 
              key="reject" 
              variant="error" 
              size="sm"
              onClick={() => handleStatusUpdate('REJECTED')}
            >
              Reject Case
            </Button>
          );
        }
        break;
      
      case 'accepted':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="schedule" 
              variant="primary" 
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={handleScheduleAppointment}
            >
              Schedule Appointment
            </Button>
          );
        }
        break;
      
      case 'scheduled':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="start" 
              variant="success" 
              size="sm"
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
            >
              Start Consultation
            </Button>
          );
        }
        break;
      
      case 'in_progress':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="complete" 
              variant="primary" 
              size="sm"
              onClick={() => handleStatusUpdate('COMPLETED')}
            >
              Complete Case
            </Button>
          );
        }
        break;
    }
    
    return actions;
  };

  if (loading && !caseData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Case Not Found</h3>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
          <Button onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
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
                    Case #{caseData.caseNumber || caseData.id}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {formatDate(caseData.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StatusBadge status={caseData.status} />
                <PriorityBadge priority={caseData.urgencyLevel} />
                
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedCase(caseData);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSaveChanges}
                    >
                      Save
                    </Button>
                  </div>
                )}
                
                {getStatusActions(caseData.status)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Case Title</h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCase.caseTitle || ''}
                          onChange={(e) => setEditedCase({...editedCase, caseTitle: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{caseData.caseTitle}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                      {isEditing ? (
                        <textarea
                          value={editedCase.description || ''}
                          onChange={(e) => setEditedCase({...editedCase, description: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Required Specialization</h4>
                        <Badge variant="primary">{caseData.requiredSpecialization}</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Case Complexity</h4>
                        <Badge variant="info">{caseData.complexity}</Badge>
                      </div>
                    </div>

                    {caseData.secondarySpecializations?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Secondary Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {caseData.secondarySpecializations.map((spec, index) => (
                            <Badge key={index} variant="outline">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Details Tab */}
                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Disease</h3>
                      <Badge variant="error" size="lg">{caseData.primaryDiseaseCode}</Badge>
                    </div>

                    {caseData.secondaryDiseaseCodes?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary Diseases</h3>
                        <div className="flex flex-wrap gap-2">
                          {caseData.secondaryDiseaseCodes.map((code, index) => (
                            <Badge key={index} variant="warning">{code}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Symptoms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {caseData.symptomCodes?.map((symptom, index) => (
                          <Badge key={index} variant="info">{symptom}</Badge>
                        ))}
                      </div>
                    </div>

                    {caseData.currentMedicationCodes?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {caseData.currentMedicationCodes.map((medication, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                              <Pill className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">{medication}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                      
                      {/* Select Files Button (Step 1) */}
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                            onChange={(e) => handleFileSelection(e.target.files)}
                            className="hidden"
                            id="case-document-upload"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="case-document-upload"
                            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                              isSubmitting 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Select Files
                          </label>
                        </div>
                        
                        {/* Submit Files Button (Step 2) */}
                        {selectedFiles.length > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                            onClick={handleSubmitFiles}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Drag and Drop Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragActive 
                          ? 'border-primary-400 bg-primary-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      } ${isSubmitting ? 'opacity-50' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop files here or click "Select Files" above
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF and image files only, max 10MB per file, {MAX_FILES} files max per case
                      </p>
                    </div>

                    {/* Selected Files Preview (Step 1 - Before Upload) */}
                    {selectedFiles.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-900">
                            Selected Files ({selectedFiles.length}/{MAX_FILES - (caseData.documents?.length || 0)} available)
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Clean up preview URLs
                              selectedFiles.forEach(file => {
                                if (file.previewUrl) {
                                  URL.revokeObjectURL(file.previewUrl);
                                }
                              });
                              setSelectedFiles([]);
                            }}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {selectedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center space-x-3">
                                {file.previewUrl ? (
                                  <img 
                                    src={file.previewUrl} 
                                    alt={file.name}
                                    className="w-10 h-10 object-cover rounded border"
                                  />
                                ) : (
                                  <FileText className="w-10 h-10 text-gray-400 p-2 bg-gray-100 rounded" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {file.previewUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Eye className="w-4 h-4" />}
                                    onClick={() => window.open(file.previewUrl, '_blank')}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Preview
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<DeleteIcon className="w-4 h-4" />}
                                  onClick={() => removeSelectedFile(file.id)}
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

                    {/* Upload Progress (Step 2 - During Upload) */}
                    {isSubmitting && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-sm font-medium text-green-900">Uploading documents to case...</span>
                        </div>
                        {uploadProgress.current && (
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress.current}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}

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

                    {/* Existing Documents List */}
                    <div className="space-y-3">
                      <h4 className="text-md font-medium text-gray-900">
                        Case Documents ({caseData.documents?.length || 0})
                      </h4>
                      {caseData.documents?.length > 0 ? (
                        caseData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-600">
                                  Uploaded on {formatDate(doc.uploadedAt)}
                                  {doc.fileSize && (
                                    <span className="ml-2">
                                      ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Download className="w-4 h-4" />}
                                onClick={() => {
                                  // Use existing download functionality
                                  patientService.downloadCaseDocument(caseId, doc.id, doc.name);
                                }}
                              >
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this document?')) {
                                    try {
                                      await execute(() => patientService.deleteCaseDocument(caseId, doc.id));
                                      await loadCaseDetails(); // Reload to update the list
                                    } catch (error) {
                                      console.error('Failed to delete document:', error);
                                      alert('Failed to delete document. Please try again.');
                                    }
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No documents uploaded yet</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Upload medical records, test results, or other relevant documents
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Case Notes</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddNote(true)}
                      >
                        Add Note
                      </Button>
                    </div>

                    {showAddNote && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add your note here..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex justify-end space-x-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNote('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddNote}
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {caseData.notes?.length > 0 ? (
                        caseData.notes.map((note, index) => (
                          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{note.author}</p>
                                  <p className="text-sm text-gray-600">{formatDateTime(note.createdAt)}</p>
                                </div>
                              </div>
                              {note.isPrivate && (
                                <Badge variant="warning" size="xs">Private</Badge>
                              )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No notes added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Case Timeline</h3>
                    <div className="space-y-4">
                      {caseData.timeline?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              {event.type === 'status_change' && <Activity className="w-4 h-4 text-primary-600" />}
                              {event.type === 'note_added' && <MessageSquare className="w-4 h-4 text-primary-600" />}
                              {event.type === 'document_uploaded' && <FileText className="w-4 h-4 text-primary-600" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">{formatDate(caseData.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="text-sm font-medium">{formatDate(caseData.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Second Opinion</span>
                  <span className="text-sm font-medium">
                    {caseData.requiresSecondOpinion ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Patient Information */}
            {caseData.patient && (
              <Card title="Patient Information">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseData.patient.name}</p>
                      <p className="text-sm text-gray-600">{caseData.patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Age</span>
                      <span className="text-sm font-medium">{caseData.patient.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gender</span>
                      <span className="text-sm font-medium">{caseData.patient.gender}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />} fullWidth>
                        Call
                      </Button>
                      <Button variant="outline" size="sm" icon={<Mail className="w-4 h-4" />} fullWidth>
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Assigned Doctor */}
            {caseData.assignedDoctor && (
              <Card title="Assigned Doctor">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseData.assignedDoctor.name}</p>
                      <p className="text-sm text-gray-600">{caseData.assignedDoctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{caseData.assignedDoctor.rating}</span>
                    <span className="text-sm text-gray-600">({caseData.assignedDoctor.reviewCount} reviews)</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={<Video className="w-4 h-4" />} fullWidth>
                        Video Call
                      </Button>
                      <Button variant="outline" size="sm" icon={<MessageSquare className="w-4 h-4" />} fullWidth>
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Information */}
            {caseData.appointment && (
              <Card title="Scheduled Appointment">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(caseData.appointment.scheduledTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(caseData.appointment.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{caseData.appointment.duration} minutes</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="info" size="sm">{caseData.appointment.consultationType}</Badge>
                  </div>

                  {caseData.appointment.meetingLink && (
                    <div className="pt-3 border-t border-gray-200">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={<Video className="w-4 h-4" />} 
                        fullWidth
                        onClick={() => window.open(caseData.appointment.meetingLink, '_blank')}
                      >
                        Join Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Payment Information */}
            {caseData.payment && (
              <Card title="Payment Information">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consultation Fee</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${caseData.payment.amount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={caseData.payment.status} size="sm" />
                  </div>
                  
                  {caseData.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paid On</span>
                      <span className="text-sm font-medium">
                        {formatDate(caseData.payment.paidAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="text-sm font-medium">{caseData.payment.method}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<Download className="w-4 h-4" />} 
                  fullWidth
                >
                  Export Case Report
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<MessageSquare className="w-4 h-4" />} 
                  fullWidth
                >
                  Send Message
                </Button>
                
                {user.role === 'ADMIN' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={<Edit className="w-4 h-4" />} 
                      fullWidth
                    >
                      Reassign Doctor
                    </Button>
                    
                    <Button 
                      variant="error" 
                      size="sm" 
                      icon={<XCircle className="w-4 h-4" />} 
                      fullWidth
                    >
                      Cancel Case
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Case Stats */}
            <Card title="Case Statistics">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Notes</span>
                  <span className="text-sm font-medium">{caseData.notes?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="text-sm font-medium">{caseData.documents?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status Changes</span>
                  <span className="text-sm font-medium">
                    {caseData.timeline?.filter(event => event.type === 'status_change').length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date() - new Date(caseData.createdAt)) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-6 h-6" />}
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowAddNote(true)}
        >
          <span className="sr-only">Add Note</span>
        </Button>
      </div>

      {/* Emergency Contact Modal - if patient has emergency contact */}
      {caseData.patient?.emergencyContact && (
        <div className="fixed bottom-4 left-4 lg:hidden">
          <Button
            variant="error"
            size="sm"
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => {
              // Handle emergency contact
              window.location.href = `tel:${caseData.patient.emergencyContact.phone}`;
            }}
          >
            Emergency
          </Button>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;