import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Star,
  AlertTriangle,
  Info,
  Shield,
  Award,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Activity,
  ExternalLink,
  Upload,
  X,
  Check
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import DocumentReviewSection from '../../components/admin/DocumentReviewSection';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useUI } from '../../hooks/useUI';
import adminService from '../../services/api/adminService';

// Validation schemas
const verificationSchema = yup.object({
  approved: yup.boolean().required('Decision is required'),
  reason: yup.string().when('approved', {
    is: false,
    then: (schema) => schema.required('Reason is required for rejection'),
    otherwise: (schema) => schema.optional()
  })
});

const DoctorVerification = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const { showToast } = useUI();

  // State management
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    thisWeek: 0,
    avgProcessingTime: 0
  });

  // Form setup
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(verificationSchema),
    defaultValues: {
      approved: null,
      reason: ''
    }
  });

  const watchedApproved = watch('approved');

  // Load pending verifications
  const loadPendingVerifications = async () => {
    try {
      const response = await execute(() => adminService.getPendingDoctors());
      if (response) {
        setPendingDoctors(response);
        setFilteredDoctors(response);
        
        // Calculate stats
        const total = response.length;
        const thisWeekCount = response.filter(doctor => {
          const submittedDate = new Date(doctor.submittedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return submittedDate >= weekAgo;
        }).length;

        setStats({
          total,
          pending: total,
          thisWeek: thisWeekCount,
          avgProcessingTime: 2.5 // Mock data - you can calculate this from your database
        });
      }
    } catch (error) {
      showToast('Failed to load pending verifications', 'error');
    }
  };

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = [...pendingDoctors];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submittedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDoctors(filtered);
  }, [pendingDoctors, searchTerm, filterStatus, sortBy, sortOrder]);

  // Handle verification decision
  const handleVerification = async (data) => {
    try {
      await execute(() => adminService.verifyDoctor(selectedDoctor.doctorId, {
        doctorId: selectedDoctor.doctorId,
        approved: data.approved,
        reason: data.reason
      }));

      showToast(
        `Doctor ${data.approved ? 'approved' : 'rejected'} successfully`,
        data.approved ? 'success' : 'warning'
      );

      // Remove from pending list
      setPendingDoctors(prev => prev.filter(d => d.doctorId !== selectedDoctor.doctorId));
      
      setShowVerificationModal(false);
      setSelectedDoctor(null);
      reset();
    } catch (error) {
      showToast('Failed to process verification', 'error');
    }
  };

  // Handle document view
  const handleViewDocument = (documentUrl, documentType) => {
    setSelectedDocument({ url: documentUrl, type: documentType });
    setShowDocumentViewer(true);
  };

  // Get verification details (enhanced with documents)
  const handleGetDetails = async (doctorId) => {
    try {
      // Try enhanced endpoint first, fall back to basic endpoint
      let response;
      try {
        response = await execute(() => adminService.getDoctorVerificationDetailsWithDocuments(doctorId));
      } catch {
        response = await execute(() => adminService.getDoctorVerificationDetails(doctorId));
      }
      if (response) {
        setSelectedDoctor(response);
        setShowVerificationModal(true);
      }
    } catch (error) {
      showToast('Failed to load doctor details', 'error');
    }
  };

  // Update local state after document verification (avoids calling non-existent API endpoint)
  const handleDocumentVerified = (verificationInfo) => {
    if (!selectedDoctor || !verificationInfo) return;

    // Update the documents in local state
    setSelectedDoctor(prev => {
      if (!prev || !prev.documents) return prev;

      let updatedDocuments;
      if (verificationInfo.bulk) {
        // Bulk update: update all pending documents
        updatedDocuments = prev.documents.map(doc => ({
          ...doc,
          verificationStatus: verificationInfo.newStatus,
          verificationNotes: verificationInfo.verificationNotes
        }));
      } else {
        // Single document update
        updatedDocuments = prev.documents.map(doc =>
          doc.id === verificationInfo.documentId
            ? {
                ...doc,
                verificationStatus: verificationInfo.newStatus,
                verificationNotes: verificationInfo.verificationNotes
              }
            : doc
        );
      }

      return { ...prev, documents: updatedDocuments };
    });

    // Refresh the pending doctors list
    loadPendingVerifications();
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Doctor',
      accessorKey: 'fullName',
      render: (doctor) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{doctor.fullName}</div>
            <div className="text-sm text-gray-500">{doctor.licenseNumber}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Specialization',
      key: 'specialization',
      render: (doctor) => (
        <Badge variant="info" size="sm">
          {doctor.specialization}
        </Badge>
      )
    },
    {
      title: 'Submitted',
      key: 'submittedAt',
      render: (doctor) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(doctor.submittedAt).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(doctor.submittedAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (doctor) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<FileText className="w-4 h-4" />}
          onClick={() => handleGetDetails(doctor.doctorId)}
        >
          View Documents
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (doctor) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleGetDetails(doctor.doctorId)}
          >
            Review
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Verification</h1>
          <p className="text-gray-600 mt-1">Review and verify pending doctor applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={loadPendingVerifications}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Verifications"
          value={stats.pending}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          trend={{ value: 8, isPositive: false }}
          className="border-l-4 border-l-yellow-500"
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeek}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          trend={{ value: 12, isPositive: true }}
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard
          title="Avg Processing Time"
          value={`${stats.avgProcessingTime} days`}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          trend={{ value: 0.5, isPositive: false }}
          className="border-l-4 border-l-green-500"
        />
        <StatsCard
          title="Total Doctors"
          value="20"
          icon={<Users className="w-6 h-6 text-purple-600" />}
          trend={{ value: 5, isPositive: true }}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, license, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="submittedAt">Sort by Date</option>
                <option value="fullName">Sort by Name</option>
                <option value="specialization">Sort by Specialization</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={filteredDoctors}
          columns={columns}
          loading={loading}
          emptyMessage="No pending verifications found"
          className="border-0"
        />
      </Card>

      {/* Verification Modal */}
      <FormModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setSelectedDoctor(null);
          reset();
        }}
        title="Doctor Verification Review"
        description="Review the doctor's credentials and make a verification decision"
        size="2xl"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Doctor Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.fullName}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500">License Number:</span>
                      <span className="ml-2 font-medium">{selectedDoctor.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Specialization:</span>
                      <span className="ml-2 font-medium">{selectedDoctor.specialization}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2 font-medium">{selectedDoctor.yearsOfExperience || 'N/A'} years</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedDoctor.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents Section */}
            {selectedDoctor.documents && selectedDoctor.documents.length > 0 ? (
              <DocumentReviewSection
                doctorId={selectedDoctor.doctorId}
                documents={selectedDoctor.documents}
                onDocumentVerified={handleDocumentVerified}
                loading={loading}
              />
            ) : (
              /* Legacy Credentials Section - shown when no documents array */
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                  Submitted Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medical License */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Medical License</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDocument(selectedDoctor.documentsUrl, 'license')}
                      >
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">License #{selectedDoctor.licenseNumber}</p>
                  </div>

                  {/* Medical Degree */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Medical Degree</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDocument(selectedDoctor.documentsUrl, 'degree')}
                      >
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Medical degree certificate</p>
                  </div>

                  {/* Certifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Certifications</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDocument(selectedDoctor.documentsUrl, 'certifications')}
                      >
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Professional certifications</p>
                  </div>

                  {/* Identity Document */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Identity Document</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDocument(selectedDoctor.documentsUrl, 'identity')}
                      >
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Government-issued ID</p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Decision Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Verification Decision
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="true"
                      {...register('approved')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-gray-900">Approve</span>
                      </div>
                      <p className="text-sm text-gray-600">All credentials are valid and verified</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="false"
                      {...register('approved')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="font-medium text-gray-900">Reject</span>
                      </div>
                      <p className="text-sm text-gray-600">Credentials require clarification or are invalid</p>
                    </div>
                  </label>
                </div>
                {errors.approved && (
                  <p className="mt-1 text-sm text-red-600">{errors.approved.message}</p>
                )}
              </div>

              {/* Reason field (conditional) */}
              {watchedApproved === 'false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    {...register('reason')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Please provide a detailed reason for rejection..."
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedDoctor(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={watchedApproved === 'false' ? 'danger' : 'primary'}
                  loading={loading}
                  icon={watchedApproved === 'false' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  onClick={handleSubmit(handleVerification)}
                >
                  {watchedApproved === 'false' ? 'Reject Doctor' : 'Approve Doctor'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={showDocumentViewer}
        onClose={() => {
          setShowDocumentViewer(false);
          setSelectedDocument(null);
        }}
        title="Document Viewer"
        size="4xl"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedDocument.type} Document
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => window.open(selectedDocument.url, '_blank')}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink className="w-4 h-4" />}
                  onClick={() => window.open(selectedDocument.url, '_blank')}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-gray-100 rounded-lg min-h-96">
              {selectedDocument.url ? (
                selectedDocument.url.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-[70vh] border-0 rounded-lg"
                    title={`${selectedDocument.type} Document`}
                  />
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <img
                      src={selectedDocument.url}
                      alt={`${selectedDocument.type} Document`}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Unable to preview document</p>
                      <Button
                        variant="primary"
                        icon={<ExternalLink className="w-4 h-4" />}
                        onClick={() => window.open(selectedDocument.url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No document URL available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Alert for empty state */}
      {filteredDoctors.length === 0 && !loading && (
        <AlertCard
          type="info"
          icon={<Info className="w-5 h-5" />}
          title="No pending verifications"
          description="All doctor applications have been processed. New applications will appear here for review."
        />
      )}
    </div>
  );
};

export default DoctorVerification;