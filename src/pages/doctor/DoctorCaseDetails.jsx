import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  File,
  Image as ImageIcon,
  FileType,
  DollarSign,
  Info,
  Users,
  Droplet,
  Home,
  MessageSquare,
  CalendarIcon,
  Edit,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

import Modal from '../../components/common/Modal';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';
import patientService from '../../services/api/patientService';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const DoctorCaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // Main state
  const [caseDetails, setCaseDetails] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isDependent, setIsDependent] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  // Document viewer state
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Load case data on mount
  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  // Cleanup blob URL on unmount or when document changes
  useEffect(() => {
    return () => {
      if (documentPreviewUrl) {
        URL.revokeObjectURL(documentPreviewUrl);
      }
    };
  }, [documentPreviewUrl]);

  const loadCaseData = async () => {
    try {
      setRefreshing(true);
      
      // Get all cases and find the specific case
      const activeCases = await execute(() => doctorService.getAllCasses());
      
      // Find the case by ID
      const foundCase = activeCases?.find(c => c.id === parseInt(caseId));
      
      if (!foundCase) {
        console.error('Case not found in active cases');
        setCaseDetails(null);
        setRefreshing(false);
        return;
      }
      
      setCaseDetails(foundCase);
      
      // Load patient information using getCustomPatientInfo from doctorService
      try {
        const patientData = await execute(() => doctorService.getCustomPatientInfo(caseId));
        
        // DETECT IF CASE IS FOR DEPENDENT
        const isDependentCase = foundCase.dependentId != null && foundCase.dependentId > 0;
        
        setIsDependent(isDependentCase);
        setPatientInfo(patientData);
        
        console.log('Is dependent case:', isDependentCase);
      } catch (error) {
        console.error('Failed to load patient info:', error);
      }

      // Load case attachments
      try {
        const attachmentsData = await execute(() => patientService.getCaseAttachments(caseId));
        // Handle different response structures
        if (attachmentsData && attachmentsData.documents) {
          setAttachments(attachmentsData.documents || []);
        } else if (Array.isArray(attachmentsData)) {
          setAttachments(attachmentsData);
        } else {
          setAttachments([]);
        }
      } catch (error) {
        console.error('Failed to load attachments:', error);
        setAttachments([]);
      }
      
    } catch (error) {
      console.error('Failed to load case data:', error);
      setCaseDetails(null);
    } finally {
      setRefreshing(false);
    }
  };

  //Helper function to calculate the age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // View document in modal with embedded viewer
  const handleViewDocument = async (document, index) => {
    setCurrentDocIndex(index);
    setCurrentDocument(document);
    setShowDocumentViewer(true);
    setLoadingDocument(true);
    
    // Clean up previous URL
    if (documentPreviewUrl) {
      URL.revokeObjectURL(documentPreviewUrl);
      setDocumentPreviewUrl(null);
    }
    
    try {
      console.log('Fetching document:', document.id);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('accessToken');
      
      if (!user.id || !token) {
        alert('Authentication required');
        setLoadingDocument(false);
        setShowDocumentViewer(false);
        return;
      }
      
      // Fetch the document blob
      const response = await fetch(`http://172.16.1.122:8080/patient-service/api/files/${caseId}/${document.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id,
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        console.error('Received empty blob');
        alert('Received empty file from server');
        setLoadingDocument(false);
        return;
      }
      
      // Create blob URL for viewing
      const url = window.URL.createObjectURL(blob);
      setDocumentPreviewUrl(url);
      setLoadingDocument(false);
      
    } catch (error) {
      console.error('Failed to load document:', error);
      alert('Failed to load document preview');
      setLoadingDocument(false);
      setShowDocumentViewer(false);
    }
  };

  const handleViewPdf = (caseDetails) => {
    if (caseDetails.medicalReportFileLink) {
      // Open PDF in new tab for viewing
      const pdfLin = caseDetails.medicalReportFileLink.replace('/api/files/reports/', '/api/files/reports/serve/');
      window.open(pdfLin, '_blank');
    }
  };

  // Download document
  const handleDownloadDocument = async (document) => {
    try {
      console.log('Downloading document:', document.id);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('accessToken');
      
      if (!user.id || !token) {
        alert('Authentication required');
        return;
      }
      
      const response = await fetch(`http://172.16.1.122:8080/patient-service/api/files/${caseId}/${document.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id,
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        alert('Received empty file from server');
        return;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.fileName || `document_${document.id}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  // Navigate to next document
  const handleNextDocument = () => {
    if (currentDocIndex < attachments.length - 1) {
      const nextIndex = currentDocIndex + 1;
      handleViewDocument(attachments[nextIndex], nextIndex);
    }
  };

  // Navigate to previous document
  const handlePrevDocument = () => {
    if (currentDocIndex > 0) {
      const prevIndex = currentDocIndex - 1;
      handleViewDocument(attachments[prevIndex], prevIndex);
    }
  };

  // Close document viewer
  const handleCloseViewer = () => {
    setShowDocumentViewer(false);
    if (documentPreviewUrl) {
      URL.revokeObjectURL(documentPreviewUrl);
    }
    setDocumentPreviewUrl(null);
    setCurrentDocument(null);
  };

  // Get file icon based on MIME type
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="w-5 h-5 text-gray-500" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileType className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Get specialization icon
  const getSpecializationIcon = (specialization) => {
    if (!specialization) return <Stethoscope className="w-5 h-5 text-blue-500" />;
    switch (specialization.toUpperCase()) {
      case 'CARDIOLOGY': return <Heart className="w-5 h-5 text-red-500" />;
      case 'NEUROLOGY': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'ONCOLOGY': return <Activity className="w-5 h-5 text-orange-500" />;
      default: return <Stethoscope className="w-5 h-5 text-blue-500" />;
    }
  };

  // Check if doctor can schedule appointment (fees must be set first)
  const canScheduleAppointment = () => {
    return caseDetails && caseDetails.consultationFee && caseDetails.consultationFee > 0;
  };

  // Loading state
  if (loading && !caseDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!caseDetails && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Case not found</p>
          <Button variant="outline" onClick={() => navigate('/app/doctor/cases')}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/app/doctor/cases')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseDetails.caseTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">Case ID: #{caseDetails.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={loadCaseData}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <StatusBadge status={caseDetails.status} />
          <PriorityBadge priority={caseDetails.urgencyLevel} />
          {caseDetails.consultationFee && (
            <Badge variant="success">
              {formatCurrency(caseDetails.consultationFee)}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'medical', 'patient', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Case Information */}
                <Card title="Case Information">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {caseDetails.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                        <StatusBadge status={caseDetails.status} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Urgency</h3>
                        <PriorityBadge priority={caseDetails.urgencyLevel} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                        <p className="text-gray-900">{formatDate(caseDetails.submittedAt)}</p>
                      </div>
                      {caseDetails.firstAssignedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned</h3>
                          <p className="text-gray-900">{formatDate(caseDetails.firstAssignedAt)}</p>
                        </div>
                      )}
                      {caseDetails.consultationFee && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Consultation Fee</h3>
                          <p className="text-green-600 font-semibold">{formatCurrency(caseDetails.consultationFee)}</p>
                        </div>
                      )}
                      {caseDetails.feeSetAt && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Fee Set At</h3>
                          <p className="text-gray-900">{formatDate(caseDetails.feeSetAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Medical Summary */}
                <Card title="Medical Summary">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getSpecializationIcon(caseDetails.requiredSpecialization)}
                        <h3 className="text-sm font-semibold text-gray-900">Required Specialization</h3>
                      </div>
                      <p className="text-gray-700 ml-7">
                        {caseDetails.requiredSpecialization?.replace('_', ' ')}
                      </p>
                    </div>

                    {caseDetails.primaryDiseaseCode && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Condition</h3>
                        <Badge variant="info" size="lg">{caseDetails.primaryDiseaseCode}</Badge>
                      </div>
                    )}

                    {caseDetails.symptomCodes && caseDetails.symptomCodes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Symptoms</h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(caseDetails.symptomCodes).map((symptom, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              <Activity className="w-3 h-3 mr-1" />
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {caseDetails.currentMedicationCodes && caseDetails.currentMedicationCodes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Current Medications</h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(caseDetails.currentMedicationCodes).map((medication, index) => (
                            <Badge key={index} variant="warning" size="sm">
                              <Pill className="w-3 h-3 mr-1" />
                              {medication}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Patient Quick Info */}
                {patientInfo && (
                  <Card title={isDependent ? "Family Member Profile" : "Patient Profile"}>
                    {isDependent && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            This case is for a family member
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {isDependent ? (
                          <Users className="w-8 h-8 text-blue-600" />
                        ) : (
                          <User className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{patientInfo.fullName}</h3>
                        <p className="text-sm text-gray-600">
                          {patientInfo.gender} • {calculateAge(patientInfo.dateOfBirth)} years
                        </p>
                        {patientInfo.bloodGroup && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Droplet className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-gray-600">{patientInfo.bloodGroup}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                      {patientInfo.phoneNumber && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{patientInfo.phoneNumber}</span>
                        </div>
                      )}
                      {patientInfo.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{patientInfo.email}</span>
                        </div>
                      )}
                      {patientInfo.city && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{patientInfo.city}, {patientInfo.country}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => setActiveTab('patient')}
                    >
                      View Full Profile
                    </Button>
                  </Card>
                )}

                {/* Attachments Preview */}
                <Card title={`Attachments (${attachments.length})`}>
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.slice(0, 3).map((doc, index) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleViewDocument(doc, index)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              {getFileIcon(doc.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.fileSizeKB)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(doc, index);
                            }}
                          />
                        </div>
                      ))}
                      {attachments.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setActiveTab('documents')}
                        >
                          View All ({attachments.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No attachments</p>
                  )}
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions">
                  <div className="space-y-2">
                    {/* ACCEPTED Status Actions */}
                    {caseDetails.status === 'ACCEPTED' && (
                      <>
                        {/* Update Case Fees - Only show if fees NOT set */}
                        {(!caseDetails.consultationFee || caseDetails.consultationFee === 0) && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            icon={<DollarSign className="w-4 h-4" />}
                            onClick={() => navigate(`/app/doctor/cases/${caseId}/update-fees`)}
                          >
                            Update Case Fees
                          </Button>
                        )}
                        
                        {/* Schedule Appointment - Only enabled if fees are set */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          icon={<CalendarIcon className="w-4 h-4" />}
                          onClick={() => navigate('/app/doctor/schedule', {
                            state: { caseId: caseDetails.id }
                          })}
                          disabled={!canScheduleAppointment()}
                          title={!canScheduleAppointment() ? "Set case fees first to schedule appointment" : ""}
                        >
                          Schedule Appointment
                        </Button>
                        
                        {/* Warning message if fees not set */}
                        {!canScheduleAppointment() && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-800">
                                Set consultation fees before scheduling an appointment
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* SCHEDULED Status Actions */}
                    {caseDetails.status === 'SCHEDULED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        icon={<CalendarIcon className="w-4 h-4" />}
                        onClick={() => navigate('/app/doctor/schedule', {
                          state: { caseId: caseDetails.id, reschedule: true }
                        })}
                      >
                        Re-Schedule
                      </Button>
                    )}

                    {/* PAYMENT_PENDING Status - No Actions (View Details only in main content) */}
                    {caseDetails.status === 'PAYMENT_PENDING' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">
                            Waiting for payment confirmation from patient
                          </p>
                        </div>
                      </div>
                    )}

                    {/* IN_PROGRESS Status Actions */}
                    {caseDetails.status === 'IN_PROGRESS' && (
                      <>
                        {/* <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => navigate(`/app/doctor/reports/create`, {
                            state: { caseId: caseDetails.id }
                          })}
                        >
                          Update Case Report
                        </Button> */}
                        
                        {patientInfo && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            icon={<MessageSquare className="w-4 h-4" />}
                            onClick={() => navigate('/app/doctor/communication', {
                              state: { patientId: patientInfo.userId,
                                 patientName: patientInfo.fullName,
                                caseId: caseDetails.id }
                            })}
                          >
                            Send Message to Patient
                          </Button>
                        )}
                      </>
                    )}

                    {/* CONSULTATION_COMPLETE & CLOSED Status Actions */}
                    {(caseDetails.status === 'CONSULTATION_COMPLETE') && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => navigate('/app/doctor/reports')}
                      >
                        Prepare Report
                      </Button>
                    )}

                      {(caseDetails.status === 'CLOSED') && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => handleViewPdf(caseDetails)}
                      >
                        View Case Report
                      </Button>
                    )}

                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Primary Diagnosis">
                <div className="space-y-4">
                  {caseDetails.primaryDiseaseCode ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Badge variant="info" size="lg">{caseDetails.primaryDiseaseCode}</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No primary diagnosis recorded</p>
                  )}
                  
                  {caseDetails.secondaryDiseaseCodes && caseDetails.secondaryDiseaseCodes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Secondary Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(caseDetails.secondaryDiseaseCodes).map((disease, index) => (
                          <Badge key={index} variant="outline">{disease}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Symptoms">
                <div className="space-y-3">
                  {caseDetails.symptomCodes && caseDetails.symptomCodes.length > 0 ? (
                    Array.from(caseDetails.symptomCodes).map((symptom, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900">{symptom}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No symptoms recorded</p>
                  )}
                </div>
              </Card>

              <Card title="Current Medications">
                <div className="space-y-3">
                  {caseDetails.currentMedicationCodes && caseDetails.currentMedicationCodes.length > 0 ? (
                    Array.from(caseDetails.currentMedicationCodes).map((medication, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Pill className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-900">{medication}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No current medications</p>
                  )}
                </div>
              </Card>

              <Card title="Required Specializations">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    {getSpecializationIcon(caseDetails.requiredSpecialization)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Primary</p>
                      <p className="text-sm text-gray-600">
                        {caseDetails.requiredSpecialization?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  {caseDetails.secondarySpecializations && caseDetails.secondarySpecializations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Secondary</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(caseDetails.secondarySpecializations).map((spec, index) => (
                          <Badge key={index} variant="outline">{spec.replace('_', ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Patient Tab */}
        {activeTab === 'patient' && patientInfo && (
          <div className="p-6">
            {isDependent && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Family Member Information
                    </h3>
                    <p className="text-sm text-blue-700">
                      This case was submitted for a family member. The information below belongs to the family member, not the account holder.
                    </p>
                  </div>
                </div>
              </div>
            )}
    
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card title={isDependent ? "Family Member Information" : "Patient Information"}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-gray-900">{patientInfo.fullName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                      <p className="text-gray-900">{formatDate(patientInfo.dateOfBirth)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Age</h3>
                      <p className="text-gray-900">{calculateAge(patientInfo.dateOfBirth)} years</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                      <p className="text-gray-900">{patientInfo.gender}</p>
                    </div>
                    {patientInfo.bloodGroup && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Blood Group</h3>
                        <div className="flex items-center space-x-2">
                          <Droplet className="w-4 h-4 text-red-500" />
                          <span className="text-gray-900 font-medium">{patientInfo.bloodGroup}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card title="Contact Information">
                  <div className="space-y-4">
                    {patientInfo.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-gray-900">{patientInfo.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {patientInfo.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900">{patientInfo.email}</p>
                        </div>
                      </div>
                    )}
                    {patientInfo.address && (
                      <div className="flex items-start space-x-3">
                        <Home className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="text-gray-900">
                            {patientInfo.address}<br />
                            {patientInfo.city}, {patientInfo.postalCode}<br />
                            {patientInfo.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {patientInfo.medicalHistory && (
                  <Card title="Medical History">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {patientInfo.medicalHistory}
                    </p>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {patientInfo.allergies && (
                  <Card>
                    <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Allergies
                    </h3>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                      {patientInfo.allergies}
                    </p>
                  </Card>
                )}

                {patientInfo.chronicConditions && (
                  <Card>
                    <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Chronic Conditions
                    </h3>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
                      {patientInfo.chronicConditions}
                    </p>
                  </Card>
                )}

                {(patientInfo.emergencyContactName || patientInfo.emergencyContactPhone) && (
                  <Card>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-2 text-sm">
                      {patientInfo.emergencyContactName && (
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="text-gray-900 font-medium">{patientInfo.emergencyContactName}</p>
                        </div>
                      )}
                      {patientInfo.emergencyContactPhone && (
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="text-gray-900 font-medium">{patientInfo.emergencyContactPhone}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <Card title={`Case Attachments (${attachments.length})`}>
              {attachments.length > 0 ? (
                <div>
                  {/* Document Navigation Info */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Document Viewer</p>
                        <p className="mt-1">Click on any document to view it. Use the Previous and Next buttons to navigate between documents.</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attachments.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                        onClick={() => handleViewDocument(doc, index)}
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                            {getFileIcon(doc.mimeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(doc.fileSizeKB)}
                            </p>
                            {doc.uploadedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(doc.uploadedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(doc, index);
                            }}
                            className="flex-1"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Download className="w-4 h-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadDocument(doc);
                            }}
                            className="flex-1"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Document Navigation Controls */}
                  {attachments.length > 1 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Navigation Tip</p>
                          <p className="mt-1">Use Previous/Next buttons in the viewer to browse through documents</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="info">{attachments.length} Documents</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No documents attached</p>
                  <p className="text-gray-400 text-sm">This case doesn't have any attached documents yet.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Document Viewer Modal - Full Screen with DocumentViewerModal */}
      <DocumentViewerModal
        isOpen={showDocumentViewer}
        onClose={handleCloseViewer}
        title="Document Viewer"
      >
        <div className="h-full flex flex-col p-3">
          {loadingDocument ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : currentDocument && documentPreviewUrl ? (
            <>
              {/* Document Info - Compact */}
              <div className="bg-white rounded shadow-sm p-2 mb-2" style={{ flexShrink: 0 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-50 rounded">
                      {getFileIcon(currentDocument.mimeType)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{currentDocument.fileName}</h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(currentDocument.fileSizeKB)} • {currentDocument.mimeType}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3 h-3" />}
                    onClick={() => handleDownloadDocument(currentDocument)}
                  >
                    Download
                  </Button>
                </div>
              </div>

              {/* Document Preview Area - Takes maximum space */}
              <div style={{ 
                flex: 1,
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}>
                {currentDocument.mimeType.startsWith('image/') ? (
                  <img
                    src={documentPreviewUrl}
                    alt={currentDocument.fileName}
                    style={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : currentDocument.mimeType === 'application/pdf' ? (
                  <iframe
                    src={documentPreviewUrl}
                    className="w-full h-full"
                    title={currentDocument.fileName}
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      File type: {currentDocument.mimeType}
                    </p>
                    <Button
                      variant="primary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => handleDownloadDocument(currentDocument)}
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation Controls - Compact */}
              {attachments.length > 1 && (
                <div className="bg-white rounded shadow-sm p-2 mt-2" style={{ flexShrink: 0 }}>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ChevronLeft className="w-4 h-4" />}
                      onClick={handlePrevDocument}
                      disabled={currentDocIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700">
                        Document {currentDocIndex + 1} of {attachments.length}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ChevronRight className="w-4 h-4" />}
                      onClick={handleNextDocument}
                      disabled={currentDocIndex === attachments.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </DocumentViewerModal>
    </div>
  );
};

export default DoctorCaseDetails;