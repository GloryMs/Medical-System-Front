import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AlertTriangle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Info,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Paperclip,
  Image,
  X
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

// Validation schema
const complaintSchema = yup.object({
  type: yup.string().required('Complaint type is required'),
  subject: yup.string().required('Subject is required').min(10, 'Subject must be at least 10 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  priority: yup.string().required('Priority is required'),
  relatedCaseId: yup.string().nullable(),
  relatedDoctorId: yup.string().nullable()
});

const PatientComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [attachments, setAttachments] = useState([]);

  // Form setup
  const complaintForm = useForm({
    resolver: yupResolver(complaintSchema),
    defaultValues: {
      type: '',
      subject: '',
      description: '',
      priority: 'medium',
      relatedCaseId: null,
      relatedDoctorId: null
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadComplaints();
    loadComplaintStats();
  }, []);

  // Filter complaints when filters change
  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, typeFilter, priorityFilter, sortBy]);

  const loadComplaints = async () => {
    try {
      const data = await execute(() => patientService.getComplaints());
      setComplaints(data || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    }
  };

  const loadComplaintStats = async () => {
    try {
      const data = await execute(() => patientService.getComplaintStats());
      setStats(data || {});
    } catch (error) {
      console.error('Failed to load complaint stats:', error);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'updated_desc':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'priority_high':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredComplaints(filtered);
  };

  const handleCreateComplaint = async (data) => {
    try {
      const complaintData = {
        ...data,
        attachments: attachments
      };
      
      const newComplaint = await execute(() => patientService.createComplaint(complaintData));
      setComplaints([newComplaint, ...complaints]);
      setShowCreateModal(false);
      complaintForm.reset();
      setAttachments([]);
      
      // Show success message
      alert('Complaint submitted successfully! You will receive updates via email.');
    } catch (error) {
      console.error('Failed to create complaint:', error);
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'technical':
        return <AlertCircle className="w-4 h-4" />;
      case 'billing':
        return <FileText className="w-4 h-4" />;
      case 'service':
        return <User className="w-4 h-4" />;
      case 'quality':
        return <Star className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const complaintTypes = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing Problem' },
    { value: 'service', label: 'Service Quality' },
    { value: 'quality', label: 'Medical Care Quality' },
    { value: 'appointment', label: 'Appointment Issue' },
    { value: 'communication', label: 'Communication Problem' },
    { value: 'other', label: 'Other' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Newest First' },
    { value: 'created_asc', label: 'Oldest First' },
    { value: 'updated_desc', label: 'Recently Updated' },
    { value: 'priority_high', label: 'Priority (High to Low)' },
    { value: 'status', label: 'Status' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Support & Complaints</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Submit and track your complaints and support requests
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={loadComplaints}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  New Complaint
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Complaints"
            value={stats.total || 0}
            icon={<MessageCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          
          <StatsCard
            title="Open"
            value={stats.open || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            className="bg-gradient-to-br from-orange-50 to-orange-100"
          />
          
          <StatsCard
            title="In Progress"
            value={stats.inProgress || 0}
            icon={<Clock className="w-6 h-6" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          
          <StatsCard
            title="Resolved"
            value={stats.resolved || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-green-50 to-green-100"
          />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  {complaintTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Priorities</option>
                  {priorityLevels.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Complaints List */}
        <Card>
          <div className="p-6">
            {filteredComplaints.length > 0 ? (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(complaint.status)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {complaint.subject}
                          </h3>
                          <Badge
                            variant={complaint.status === 'resolved' ? 'success' : 
                                   complaint.status === 'in_progress' ? 'primary' :
                                   complaint.status === 'open' ? 'warning' : 'secondary'}
                          >
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority} Priority
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(complaint.type)}
                            <span>{complaintTypes.find(t => t.value === complaint.type)?.label}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(complaint.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>#{complaint.complaintId}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {complaint.description}
                        </p>

                        {complaint.assignedTo && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Assigned to: {complaint.assignedTo.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Eye className="w-4 h-4" />}
                          // onClick={() => handleViewComplaint(complaint)}
                          onClick={() => navigate(`/patient/complaints/${complaint.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {complaints.length === 0 
                    ? "You haven't submitted any complaints yet"
                    : "No complaints match your current filters"
                  }
                </p>
                {complaints.length === 0 && (
                  <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Submit Your First Complaint
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Complaint Modal */}
      <FormModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          complaintForm.reset();
          setAttachments([]);
        }}
        title="Submit New Complaint"
        onSubmit={complaintForm.handleSubmit(handleCreateComplaint)}
        loading={loading}
        size="lg"
      >
        <div className="space-y-6">
          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Type *
            </label>
            <select
              {...complaintForm.register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select complaint type</option>
              {complaintTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {complaintForm.formState.errors.type && (
              <p className="text-red-500 text-sm mt-1">
                {complaintForm.formState.errors.type.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              {...complaintForm.register('subject')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Brief summary of your complaint"
            />
            {complaintForm.formState.errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {complaintForm.formState.errors.subject.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              {...complaintForm.register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {priorityLevels.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            {complaintForm.formState.errors.priority && (
              <p className="text-red-500 text-sm mt-1">
                {complaintForm.formState.errors.priority.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...complaintForm.register('description')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Please provide detailed information about your complaint..."
            />
            {complaintForm.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {complaintForm.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, JPG, PNG up to 10MB each
                </p>
              </label>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormModal>

      {/* Complaint Details Modal */}
      <Modal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedComplaint.subject}
                </h3>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={selectedComplaint.status === 'RESOLVED' ? 'success' : 
                           selectedComplaint.status === 'IN_PROGRESS' ? 'primary' :
                           selectedComplaint.status === 'OPEN' ? 'warning' : 'secondary'}
                  >
                    {selectedComplaint.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority} Priority
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>#{selectedComplaint.complaintId}</div>
                <div>{formatDate(selectedComplaint.createdAt)}</div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Complaint Type</h4>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedComplaint.complaintType)}
                  <span>{complaintTypes.find(t => t.value === selectedComplaint.type)?.label}</span>
                </div>
              </div>

              {selectedComplaint.assignedTo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assigned To</h4>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{selectedComplaint.assignedTo}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Updates Timeline */}
            {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Updates</h4>
                <div className="space-y-4">
                  {selectedComplaint.updates.map((update, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{update.author}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(update.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                <div className="space-y-2">
                  {selectedComplaint.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => patientService.downloadAttachment(attachment.id, attachment.name)}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {selectedComplaint.status === 'RESOLVED' && selectedComplaint.adminResponse && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Resolution</h4>
                    <p className="text-sm text-green-800">{selectedComplaint.adminResponse}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-green-700">
                      <Calendar className="w-3 h-3" />
                      <span>Resolved on {formatDate(selectedComplaint.resolvedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Need Additional Help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Phone className="w-4 h-4" />
                  <span>Call: +1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-800">
                  <Mail className="w-4 h-4" />
                  <span>Email: support@medcare.com</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-800">
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat: Available 24/7</span>
                </div>
              </div>
            </div>

            {/* Feedback Section - Only show for resolved complaints */}
            {selectedComplaint.status === 'RESOLVED' && !selectedComplaint.feedback && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">How was our support?</h4>
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ThumbsUp className="w-4 h-4" />}
                    onClick={() => {
                      // Handle positive feedback
                      alert('Thank you for your feedback!');
                    }}
                  >
                    Helpful
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ThumbsDown className="w-4 h-4" />}
                    onClick={() => {
                      // Handle negative feedback
                      alert('We appreciate your feedback. We\'ll work to improve.');
                    }}
                  >
                    Not Helpful
                  </Button>
                </div>
              </div>
            )}

            {/* Show feedback if already provided */}
            {selectedComplaint.feedback && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-2">Your Feedback</h4>
                <div className="flex items-center space-x-2">
                  {selectedComplaint.feedback.rating === 'positive' ? (
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    You rated this support as {selectedComplaint.feedback.rating}
                  </span>
                </div>
                {selectedComplaint.feedback.comment && (
                  <p className="text-sm text-gray-700 mt-2 italic">
                    "{selectedComplaint.feedback.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-3">
                {selectedComplaint.status !== 'closed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => {
                      // Navigate to complaint details page for messaging
                      navigate(`/patient/complaints/${selectedComplaint.id}`);
                    }}
                  >
                    Add Comment
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    // Download complaint summary
                    patientService.downloadComplaintSummary(selectedComplaint.id, `complaint-${selectedComplaint.id}.pdf`);
                  }}
                >
                  Download Summary
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientComplaints;