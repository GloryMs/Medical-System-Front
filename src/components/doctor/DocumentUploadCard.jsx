import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const DocumentUploadCard = ({
  documentType,
  title,
  description,
  required = false,
  document = null,
  onUpload,
  onDelete,
  onView,
  onDownload,
  uploading = false,
  uploadProgress = 0,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    if (!file) return 'No file selected';

    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit';
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF, JPG, and PNG are allowed';
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError(null);
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    onUpload(file, documentType);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || document) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !document) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getStatusBadge = () => {
    if (!document) {
      return <Badge color="gray">Not Uploaded</Badge>;
    }

    switch (document.verificationStatus) {
      case 'VERIFIED':
        return <Badge color="green">Verified</Badge>;
      case 'REJECTED':
        return <Badge color="red">Rejected</Badge>;
      case 'PENDING':
        return <Badge color="yellow">Pending Review</Badge>;
      default:
        return <Badge color="blue">Uploaded</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!document) return null;

    switch (document.verificationStatus) {
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getFileIcon = () => {
    if (!document) return <Upload className="w-8 h-8 text-gray-400" />;

    const isPdf = document.fileName?.toLowerCase().endsWith('.pdf');
    return isPdf
      ? <FileText className="w-8 h-8 text-red-500" />
      : <Image className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-4">
        {!document ? (
          // Upload Area
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled || uploading}
            />

            {uploading ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG up to 5MB
                </p>
              </>
            )}
          </div>
        ) : (
          // Document Display
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.fileName}
                  </p>
                  {getStatusIcon()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(document.fileSizeKB ? document.fileSizeKB * 1024 : document.fileSize)}
                  {document.uploadedAt && ` - Uploaded ${new Date(document.uploadedAt).toLocaleDateString()}`}
                </p>
                {document.description && (
                  <p className="text-xs text-gray-600 mt-1">{document.description}</p>
                )}
              </div>
            </div>

            {/* Rejection Notes */}
            {document.verificationStatus === 'REJECTED' && document.verificationNotes && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Rejection Reason:</strong> {document.verificationNotes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => onView(document)}
                >
                  View
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => onDownload(document)}
                >
                  Download
                </Button>
              )}
              {onDelete && !disabled && document.verificationStatus !== 'VERIFIED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-red-500" />}
                  onClick={() => onDelete(document)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && !document && (
          <p className="text-xs text-gray-500 mt-3">{description}</p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadCard;
