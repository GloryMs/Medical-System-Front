import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Eye,
  Download,
  Stethoscope,
  Pill,
  Heart,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Home,
  Users,
  Activity
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import supervisorService from '../../services/api/supervisorService';
import CaseStatusLifecyclePopup from '../../components/common/CaseStatusLifecyclePopup';
import { toast } from 'react-toastify';

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

const SupervisorCaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isDependent, setIsDependent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientInfoLoading, setPatientInfoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLifecyclePopup, setShowLifecyclePopup] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadCaseDetails();
    }
  }, [caseId]);

  // Load patient info after case data is available
  useEffect(() => {
    if (caseData && caseData.patientId) {
      loadPatientInfo();
    }
  }, [caseData]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await supervisorService.getCaseDetails(caseId);
      setCaseData(response);

      // Detect if case is for dependent
      const isDependentCase = response.dependentId != null && response.dependentId > 0;
      setIsDependent(isDependentCase);
    } catch (error) {
      console.error('Failed to load case details:', error);
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientInfo = async () => {
    try {
      setPatientInfoLoading(true);
      // Wait for case data to be loaded first to get patientId
      if (caseData && caseData.patientId) {
        const patientData = await supervisorService.getCustomPatientInfo(caseId, caseData.patientId);
        setPatientInfo(patientData);
      }
    } catch (error) {
      console.error('Failed to load patient info:', error);
      // Don't show error toast here, as patient info might not always be available
    } finally {
      setPatientInfoLoading(false);
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      await supervisorService.viewCaseDocument(caseId, doc.id);
    } catch (error) {
      console.error('Failed to view document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      await supervisorService.downloadCaseDocument(caseId, doc.id, doc.fileName);
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleViewMedicalReport = (medicalReportFileLink) => {
    window.open(medicalReportFileLink, '_blank');
  };

  // Show loading state
  if (loading && !caseData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading case details...</p>
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
            onClick={() => navigate('/app/supervisor/cases')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Cases
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
              onClick={() => navigate('/app/supervisor/cases')}
            >
              Back to Cases
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

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Current Status:</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                {caseData.status}
              </span>
            </div>
            <button
              onClick={() => setShowLifecyclePopup(true)}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Case Status Lifecycle</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
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
              { id: 'patient', name: 'Patient Profile', icon: User },
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

                {/* Patient Information */}
                <Card title="Patient Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient Name</p>
                      <p className="font-medium text-gray-900">{caseData.patientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patient ID</p>
                      <p className="font-medium text-gray-900">#{caseData.patientId || 'N/A'}</p>
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
                      <span className="text-sm text-gray-600">Complexity</span>
                      <Badge variant="info">{caseData.complexity}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">{formatDate(caseData.createdAt)}</span>
                    </div>
                    {caseData.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Submitted</span>
                        <span className="text-sm font-medium">{formatDate(caseData.submittedAt)}</span>
                      </div>
                    )}
                    {caseData.acceptedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accepted</span>
                        <span className="text-sm font-medium">{formatDate(caseData.acceptedAt)}</span>
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
                        <span className="text-sm text-gray-600">Consultation Fee</span>
                        <span className="text-sm font-medium">${caseData.consultationFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Actions">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      icon={<FileText className="w-4 h-4" />}
                      fullWidth
                      onClick={() => setActiveTab('documents')}
                    >
                      View Documents ({caseData.documents?.length || 0})
                    </Button>
                    <Button
                      variant="outline"
                      icon={<Download className="w-4 h-4" />}
                      fullWidth
                      disabled={!caseData.medicalReportFileLink || caseData.status !== 'CLOSED'}
                      onClick={() => handleViewMedicalReport(caseData.medicalReportFileLink)}
                    >
                      View Medical Report
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Patient Profile Tab */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              {patientInfoLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading patient information...</p>
                </div>
              ) : patientInfo ? (
                <>
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
                      {/* Patient Information */}
                      <Card title={isDependent ? "Family Member Information" : "Patient Information"}>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                            <p className="text-gray-900">{patientInfo.fullName || 'N/A'}</p>
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
                            <p className="text-gray-900">{patientInfo.gender || 'N/A'}</p>
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

                      {/* Contact Information */}
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
                                  {patientInfo.address}
                                  {patientInfo.city && <><br />{patientInfo.city}</>}
                                  {patientInfo.postalCode && `, ${patientInfo.postalCode}`}
                                  {patientInfo.country && <><br />{patientInfo.country}</>}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Medical History */}
                      {patientInfo.medicalHistory && (
                        <Card title="Medical History">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {patientInfo.medicalHistory}
                          </p>
                        </Card>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Allergies */}
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

                      {/* Chronic Conditions */}
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

                      {/* Emergency Contact */}
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
                            {patientInfo.emergencyContactRelationship && (
                              <div>
                                <p className="text-gray-500">Relationship</p>
                                <p className="text-gray-900 font-medium">{patientInfo.emergencyContactRelationship}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Information Not Available</h3>
                  <p className="text-gray-600">Unable to load patient information for this case.</p>
                </div>
              )}
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

              {/* Current Medications */}
              <Card title="Current Medications">
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
                      <p className="text-gray-500">No current medications recorded</p>
                    </div>
                  )}
                </div>
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

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Case Documents ({caseData.documents?.length || 0})
                </h3>
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
                  <p className="text-gray-600">No documents have been uploaded for this case yet.</p>
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

                  {caseData.submittedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Case Submitted</p>
                        <p className="text-sm text-gray-600">{formatDate(caseData.submittedAt)}</p>
                      </div>
                    </div>
                  )}

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

      {/* Lifecycle Popup */}
      <CaseStatusLifecyclePopup
        isOpen={showLifecyclePopup}
        onClose={() => setShowLifecyclePopup(false)}
        currentStatus={caseData.status}
      />
    </div>
  );
};

export default SupervisorCaseDetails;
