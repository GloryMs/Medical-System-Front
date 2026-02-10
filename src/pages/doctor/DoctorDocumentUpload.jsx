import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';
import DocumentUploadCard from '../../components/doctor/DocumentUploadCard';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

const DOCUMENT_TYPES = [
  {
    type: 'LICENSE',
    title: 'Medical License',
    description: 'Your valid medical license issued by the relevant medical board',
    required: true,
  },
  {
    type: 'CERTIFICATE',
    title: 'Professional Certificate',
    description: 'Your medical degree certificate or professional qualification',
    required: true,
  },
  {
    type: 'EXPERIENCE',
    title: 'Experience Documents',
    description: 'Experience letters, additional certifications, or recommendation letters (optional)',
    required: false,
  },
];

const DoctorDocumentUpload = ({ onDocumentsChange }) => {
  const { execute, loading } = useApi();

  // State
  const [documentsData, setDocumentsData] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Document viewer state
  const [showViewer, setShowViewer] = useState(false);
  const [viewerDocument, setViewerDocument] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await execute(() => doctorService.getMyDocuments());
      setDocumentsData(data);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    }
  };

  // Get document by type
  const getDocumentByType = (type) => {
    if (!documentsData?.documents) return null;
    //alert(documentsData.documents.find(doc => doc.documentType === type).id);
    return documentsData.documents.find(doc => doc.documentType === type);
  };

  // Handle file upload
  const handleUpload = async (file, documentType) => {
    setUploadingType(documentType);
    setUploadProgress(0);

    try {
      await execute(() =>
        doctorService.uploadDocument(
          file,
          documentType,
          '',
          (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        )
      );

      toast.success('Document uploaded successfully');
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  // Handle document delete
  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await execute(() => doctorService.deleteDocument(documentToDelete.id));
      toast.success('Document deleted successfully');
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  // Handle document view
  const handleView = async (document) => {
    setViewerDocument(document);
    setShowViewer(true);
    setViewerLoading(true);
    setViewerUrl(null);

    try {
      const url = await doctorService.viewDocument(document.id);
      setViewerUrl(url);
    } catch (error) {
      toast.error('Failed to load document');
      setShowViewer(false);
    } finally {
      setViewerLoading(false);
    }
  };

  // Handle document download
  const handleDownload = async (document) => {
    try {
      await doctorService.downloadDocument(document.id, document.fileName);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  // Close viewer and cleanup
  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerDocument(null);
    setViewerUrl(null);
  };

  // Handle submit for review
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await execute(() => doctorService.submitDocumentsForReview(additionalNotes));
      toast.success('Documents submitted for review');
      setShowSubmitModal(false);
      setAdditionalNotes('');
      await loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to submit documents');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress
  const getUploadedRequiredCount = () => {
    let count = 0;
    if (getDocumentByType('LICENSE')) count++;
    if (getDocumentByType('CERTIFICATE')) count++;
    return count;
  };

  const uploadedRequired = getUploadedRequiredCount();
  const totalRequired = 2;

  // allVerified should only be true if:
  // 1. There are actual documents uploaded
  // 2. All required documents are present
  // 3. All required documents are VERIFIED (not rejected or pending)
  const hasDocuments = documentsData?.documents?.length > 0;
  const hasRejectedDocuments = documentsData?.documents?.some(d =>
    d.verificationStatus === 'REJECTED' || (d.verifiedByAdmin === false && d.verifiedAt)
  );
  const allRequiredVerified = hasDocuments &&
    documentsData?.hasAllRequiredDocuments &&
    !hasRejectedDocuments &&
    documentsData?.documents
      ?.filter(d => d.documentType === 'LICENSE' || d.documentType === 'CERTIFICATE')
      ?.every(d => d.verificationStatus === 'VERIFIED' || d.verifiedByAdmin === true);

  const allVerified = allRequiredVerified && documentsData?.allDocumentsVerified;

  // Can submit if all required docs uploaded, no rejections pending re-upload, and not all verified
  const canSubmit = documentsData?.hasAllRequiredDocuments && !allVerified && !hasRejectedDocuments;

  // Get overall status
  const getOverallStatus = () => {
    // Only show verified if actually has documents and all are verified
    if (allVerified) {
      return { color: 'green', text: 'All Documents Verified', icon: CheckCircle };
    }
    // Check for rejected documents (using both verificationStatus and verifiedByAdmin)
    if (hasRejectedDocuments) {
      return { color: 'red', text: 'Action Required - Reupload Rejected Documents', icon: AlertCircle };
    }
    // Check for pending review
    if (documentsData?.documents?.some(d => d.verificationStatus === 'PENDING')) {
      return { color: 'yellow', text: 'Pending Review', icon: AlertCircle };
    }
    // Has some documents but not all required
    if (hasDocuments && !documentsData?.hasAllRequiredDocuments) {
      return { color: 'yellow', text: 'Upload Required Documents', icon: AlertCircle };
    }
    // No documents yet
    return { color: 'gray', text: 'Documents Required', icon: Info };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                <StatusIcon className={`w-6 h-6 text-${status.color}-600`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Verification Documents</h2>
                <p className="text-sm text-gray-600">{status.text}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadDocuments}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Required Documents Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {uploadedRequired} of {totalRequired} uploaded
                {uploadedRequired === totalRequired && ' '}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadedRequired === totalRequired ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${(uploadedRequired / totalRequired) * 100}%` }}
              />
            </div>
          </div>

          {/* Rejection Warning Banner */}
          {hasRejectedDocuments && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Action Required - Documents Rejected</p>
                <p className="mt-1">
                  Some of your documents have been rejected by the admin. Please review the rejection reason
                  on each document, delete the rejected file, and upload a new one that meets the requirements.
                </p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          {!allVerified && !hasRejectedDocuments && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Document Requirements</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Upload your Medical License and Professional Certificate (required)</li>
                  <li>Accepted formats: PDF, JPG, PNG (max 5MB each)</li>
                  <li>Experience documents are optional but recommended</li>
                  <li>Once uploaded, submit documents for admin review</li>
                </ul>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {allVerified && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                All your documents have been verified. Your account is fully approved.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const document = getDocumentByType(docType.type);
          // Only disable if this specific document is verified
          // Allow upload for: not uploaded, rejected, or pending documents
          const isDocumentVerified = document &&
            (document.verificationStatus === 'VERIFIED' || document.verifiedByAdmin === true);
          return (
            <DocumentUploadCard
              key={docType.type}
              documentType={docType.type}
              title={docType.title}
              description={docType.description}
              required={docType.required}
              document={document}
              onUpload={handleUpload}
              onDelete={handleDeleteClick}
              onView={handleView}
              onDownload={handleDownload}
              uploading={uploadingType === docType.type}
              uploadProgress={uploadProgress}
              disabled={isDocumentVerified}
            />
          );
        })}
      </div>

      {/* Submit Button */}
      {!allVerified && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Submit for Review</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {canSubmit
                    ? 'All required documents are uploaded. Submit for admin review.'
                    : 'Upload all required documents to submit for review.'}
                </p>
              </div>
              <Button
                icon={<Send className="w-4 h-4" />}
                onClick={() => setShowSubmitModal(true)}
                disabled={!canSubmit || loading}
              >
                Submit for Review
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Documents for Review"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to submit your documents for admin review. This process may take 1-2 business days.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Documents to be submitted:</h4>
            <ul className="space-y-2">
              {documentsData?.documents?.map((doc) => (
                <li key={doc.id} className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{doc.fileName}</span>
                  <Badge color="blue" size="sm">{doc.documentType}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Any additional information for the reviewer..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button
              icon={<Send className="w-4 h-4" />}
              onClick={handleSubmit}
              loading={submitting}
            >
              Submit Documents
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={loading}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={showViewer}
        onClose={closeViewer}
        title={viewerDocument?.fileName || 'Document Viewer'}
      >
        <div className="p-6">
          {viewerLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : viewerUrl ? (
            <div className="h-full">
              {viewerDocument?.fileName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title={viewerDocument?.fileName}
                />
              ) : (
                <div className="flex items-center justify-center">
                  <img
                    src={viewerUrl}
                    alt={viewerDocument?.fileName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Failed to load document
            </div>
          )}
        </div>
      </DocumentViewerModal>
    </div>
  );
};

export default DoctorDocumentUpload;
