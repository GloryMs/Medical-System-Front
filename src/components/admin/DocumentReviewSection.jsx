import React, { useState } from 'react';
import {
  FileText,
  Image,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import DocumentViewerModal from '../common/DocumentViewerModal';
import adminService from '../../services/api/adminService';

const DocumentReviewSection = ({
  doctorId,
  documents = [],
  onDocumentVerified,
  loading = false,
}) => {
  // State for document viewer
  const [showViewer, setShowViewer] = useState(false);
  const [viewerDocument, setViewerDocument] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState(null);

  // State for verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [documentToVerify, setDocumentToVerify] = useState(null);
  const [verifyAction, setVerifyAction] = useState(null); // 'verify' or 'reject'
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  // State for bulk verification
  const [showBulkVerifyModal, setShowBulkVerifyModal] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkNotes, setBulkNotes] = useState('');

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'VERIFIED':
        return { color: 'green', icon: CheckCircle, text: 'Verified' };
      case 'REJECTED':
        return { color: 'red', icon: XCircle, text: 'Rejected' };
      case 'PENDING':
        return { color: 'yellow', icon: Clock, text: 'Pending' };
      default:
        return { color: 'gray', icon: AlertCircle, text: 'Uploaded' };
    }
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const isPdf = fileName?.toLowerCase().endsWith('.pdf');
    return isPdf
      ? <FileText className="w-8 h-8 text-red-500" />
      : <Image className="w-8 h-8 text-blue-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle view document
  const handleView = async (document) => {
    setViewerDocument(document);
    setShowViewer(true);
    setViewerLoading(true);
    setViewerUrl(null);

    try {
      const url = await adminService.viewDoctorDocument(doctorId, document.id);
      setViewerUrl(url);
    } catch (error) {
      toast.error('Failed to load document');
      setShowViewer(false);
    } finally {
      setViewerLoading(false);
    }
  };

  // Close viewer
  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerDocument(null);
    setViewerUrl(null);
  };

  // Handle download
  const handleDownload = async (document) => {
    try {
      await adminService.downloadDoctorDocument(doctorId, document.id, document.fileName);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  // Open verification modal
  const openVerifyModal = (document, action) => {
    setDocumentToVerify(document);
    setVerifyAction(action);
    setVerificationNotes('');
    setShowVerifyModal(true);
  };

  // Handle single document verification
  const handleVerifyDocument = async () => {
    if (!documentToVerify || !verifyAction) return;

    if (verifyAction === 'reject' && !verificationNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setVerifying(true);
    try {
      await adminService.verifyDoctorDocument(documentToVerify.id, {
        verified: verifyAction === 'verify',
        verificationNotes: verificationNotes.trim()
      });

      toast.success(`Document ${verifyAction === 'verify' ? 'verified' : 'rejected'} successfully`);
      setShowVerifyModal(false);
      // Pass document info to callback for local state update
      onDocumentVerified?.({
        documentId: documentToVerify.id,
        newStatus: verifyAction === 'verify' ? 'VERIFIED' : 'REJECTED',
        verificationNotes: verificationNotes.trim()
      });
    } catch (error) {
      toast.error(`Failed to ${verifyAction} document`);
    } finally {
      setVerifying(false);
    }
  };

  // Open bulk verification modal
  const openBulkVerifyModal = (action) => {
    setBulkAction(action);
    setBulkNotes('');
    setShowBulkVerifyModal(true);
  };

  // Handle bulk verification
  const handleBulkVerify = async () => {
    if (bulkAction === 'reject' && !bulkNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setVerifying(true);
    try {
      await adminService.verifyAllDoctorDocuments(doctorId, {
        verified: bulkAction === 'verify',
        verificationNotes: bulkNotes.trim()
      });

      toast.success(`All documents ${bulkAction === 'verify' ? 'verified' : 'rejected'} successfully`);
      setShowBulkVerifyModal(false);
      // Pass bulk update info to callback
      onDocumentVerified?.({
        bulk: true,
        newStatus: bulkAction === 'verify' ? 'VERIFIED' : 'REJECTED',
        verificationNotes: bulkNotes.trim()
      });
    } catch (error) {
      toast.error(`Failed to ${bulkAction} documents`);
    } finally {
      setVerifying(false);
    }
  };

  // Check if all documents can be bulk verified
  const pendingDocuments = documents.filter(d => d.verificationStatus !== 'VERIFIED');
  const hasUnverifiedDocuments = pendingDocuments.length > 0;

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No documents have been submitted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-primary-600" />
          Submitted Documents ({documents.length})
        </h4>
        {hasUnverifiedDocuments && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCircle className="w-4 h-4 text-green-600" />}
              onClick={() => openBulkVerifyModal('verify')}
              disabled={loading}
            >
              Verify All
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<XCircle className="w-4 h-4 text-red-600" />}
              onClick={() => openBulkVerifyModal('reject')}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((document) => {
          const statusInfo = getStatusInfo(document.verificationStatus);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Document Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <Badge color="blue" size="sm">{document.documentType}</Badge>
                <Badge color={statusInfo.color} size="sm">
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.text}
                </Badge>
              </div>

              {/* Document Content */}
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                    {getFileIcon(document.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(document.fileSizeKB ? document.fileSizeKB * 1024 : document.fileSize)}
                      {document.uploadedAt && ` - ${new Date(document.uploadedAt).toLocaleDateString()}`}
                    </p>
                    {document.description && (
                      <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                    )}
                  </div>
                </div>

                {/* Verification Notes */}
                {document.verificationNotes && (
                  <div className={`mt-3 p-2 rounded text-sm ${
                    document.verificationStatus === 'REJECTED'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    <strong>Notes:</strong> {document.verificationNotes}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => handleView(document)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => handleDownload(document)}
                    >
                      Download
                    </Button>
                  </div>

                  {document.verificationStatus !== 'VERIFIED' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Check className="w-4 h-4 text-green-600" />}
                        onClick={() => openVerifyModal(document, 'verify')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<X className="w-4 h-4 text-red-600" />}
                        onClick={() => openVerifyModal(document, 'reject')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Document Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title={`${verifyAction === 'verify' ? 'Verify' : 'Reject'} Document`}
        size="md"
      >
        <div className="space-y-4">
          {documentToVerify && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(documentToVerify.fileName)}
                <div>
                  <p className="font-medium text-gray-900">{documentToVerify.fileName}</p>
                  <Badge color="blue" size="sm">{documentToVerify.documentType}</Badge>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {verifyAction === 'reject' ? 'Reason for Rejection *' : 'Verification Notes (Optional)'}
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={verifyAction === 'reject'
                ? 'Please provide a reason for rejection...'
                : 'Optional notes about the verification...'}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </Button>
            <Button
              variant={verifyAction === 'reject' ? 'danger' : 'primary'}
              icon={verifyAction === 'reject' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              onClick={handleVerifyDocument}
              loading={verifying}
            >
              {verifyAction === 'verify' ? 'Verify Document' : 'Reject Document'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Verification Modal */}
      <Modal
        isOpen={showBulkVerifyModal}
        onClose={() => setShowBulkVerifyModal(false)}
        title={`${bulkAction === 'verify' ? 'Verify' : 'Reject'} All Documents`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action will {bulkAction === 'verify' ? 'verify' : 'reject'} all {pendingDocuments.length} pending document(s).
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Documents to be {bulkAction === 'verify' ? 'verified' : 'rejected'}:</h4>
            <ul className="space-y-1">
              {pendingDocuments.map((doc) => (
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
              {bulkAction === 'reject' ? 'Reason for Rejection *' : 'Verification Notes (Optional)'}
            </label>
            <textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={bulkAction === 'reject'
                ? 'Please provide a reason for rejection...'
                : 'Optional notes about the verification...'}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBulkVerifyModal(false)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'reject' ? 'danger' : 'primary'}
              icon={bulkAction === 'reject' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              onClick={handleBulkVerify}
              loading={verifying}
            >
              {bulkAction === 'verify' ? 'Verify All Documents' : 'Reject All Documents'}
            </Button>
          </div>
        </div>
      </Modal>

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

              {/* Inline verification actions in viewer */}
              {viewerDocument?.verificationStatus !== 'VERIFIED' && (
                <div className="mt-4 flex items-center justify-center space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                    onClick={() => {
                      closeViewer();
                      openVerifyModal(viewerDocument, 'verify');
                    }}
                    className="text-green-600"
                  >
                    Verify This Document
                  </Button>
                  <Button
                    variant="outline"
                    icon={<XCircle className="w-4 h-4 text-red-600" />}
                    onClick={() => {
                      closeViewer();
                      openVerifyModal(viewerDocument, 'reject');
                    }}
                    className="text-red-600"
                  >
                    Reject This Document
                  </Button>
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

export default DocumentReviewSection;
