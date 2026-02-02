import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
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
  X,
  Users
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import supervisorService from '../../services/api/supervisorService';

// Validation schema to match backend requirements
const complaintSchema = yup.object({
  complaintType: yup.string().required('Complaint type is required'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  priority: yup.string().required('Priority is required'),
  patientId: yup.string().required('Please select a patient'),
  doctorId: yup.string().nullable(),
  caseId: yup.string().nullable()
});

const SupervisorComplaints = () => {
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
  const [patientFilter, setPatientFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Form setup with correct field names
  const complaintForm = useForm({
    resolver: yupResolver(complaintSchema),
    defaultValues: {
      patientId: '',
      complaintType: '',
      description: '',
      priority: 'MEDIUM',
      doctorId: '',
      caseId: ''
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadComplaints();
    loadPatients();
    loadCases();
    loadDoctors();
  }, []);

  // Filter complaints when filters change
  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, typeFilter, priorityFilter, patientFilter, sortBy]);

  // Filter cases when selected patient changes
  useEffect(() => {
    if (selectedPatientId) {
      const patientCases = cases.filter(c => c.patientId === parseInt(selectedPatientId));
      setFilteredCases(patientCases);
    } else {
      setFilteredCases([]);
    }
  }, [selectedPatientId, cases]);

  const loadComplaints = async () => {
    try {
      const data = await execute(() => supervisorService.getComplaints());
      setComplaints(data || []);

      // Calculate stats from the complaints data
      const complaintsData = data || [];
      const stats = {
        total: complaintsData.length,
        open: complaintsData.filter(complaint => complaint.status === 'OPEN').length,
        inProgress: complaintsData.filter(complaint => complaint.status === 'IN_PROGRESS').length,
        resolved: complaintsData.filter(complaint => complaint.status === 'RESOLVED').length
      };

      setStats(stats);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await execute(() => supervisorService.getPatients());
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const loadCases = async () => {
    try {
      const data = await execute(() => supervisorService.getCases());
      setCases(data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await execute(() => supervisorService.getDoctors());
      setDoctors(data || []);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter.toUpperCase());
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.complaintType === typeFilter.toUpperCase());
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter.toUpperCase());
    }

    // Patient filter
    if (patientFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.patientId === parseInt(patientFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'updated_desc':
          return new Date(b.updatedAt) - new Date(a.resolvedAt);
        case 'priority_high':
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
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
      // Map form data to backend expected format
      const complaintData = {
        patientId: user.id, // Use supervisor's user ID
        complaintType: data.complaintType,
        description: data.description,
        priority: data.priority,
        doctorId: data.doctorId ? parseInt(data.doctorId) : null,
        caseId: data.caseId ? parseInt(data.caseId) : null
      };

      await execute(() => supervisorService.createComplaint(complaintData));

      // Reload complaints from server to ensure complete data
      await loadComplaints();

      setShowCreateModal(false);
      complaintForm.reset();
      setSelectedPatientId('');

      // Show success message
      toast.success('Complaint submitted successfully on behalf of the patient!');
    } catch (error) {
      console.error('Failed to create complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint. Please try again.');
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    complaintForm.setValue('patientId', patientId);
    // Reset case selection when patient changes
    complaintForm.setValue('caseId', '');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CLOSED':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-600';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SYSTEM':
        return <AlertCircle className="w-4 h-4" />;
      case 'PAYMENT':
        return <FileText className="w-4 h-4" />;
      case 'SERVICE':
        return <User className="w-4 h-4" />;
      case 'DOCTOR':
        return <Star className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Backend complaint types
  const complaintTypes = [
    { value: 'DOCTOR', label: 'Doctor Related' },
    { value: 'SYSTEM', label: 'System/Technical Issue' },
    { value: 'PAYMENT', label: 'Payment Issue' },
    { value: 'SERVICE', label: 'Service Quality' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Backend priority levels
  const priorityLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
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
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patient Complaints</h1>
                  <p className="text-gray-600">Manage complaints submitted by your assigned patients</p>
                </div>
              </div>

              {/* Create New Complaint Button */}
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Complaint
              </Button>
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
            icon={<MessageCircle className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatsCard
            title="Open"
            value={stats.open || 0}
            icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
            color="orange"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress || 0}
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved || 0}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            color="green"
          />
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
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

              <select
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                {complaintTypes.map((type) => (
                  <option key={type.value} value={type.value.toLowerCase()}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Priorities</option>
                {priorityLevels.map((priority) => (
                  <option key={priority.value} value={priority.value.toLowerCase()}>
                    {priority.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Complaints List */}
        <Card>
          <div className="p-6">
            {filteredComplaints.length > 0 ? (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(complaint.complaintType)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {complaintTypes.find(t => t.value === complaint.complaintType)?.label || complaint.complaintType}
                          </h3>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {complaint.patientName || `Patient #${complaint.patientId}`}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {complaint.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(complaint.createdAt)}</span>
                          </span>
                          {complaint.caseId && (
                            <span>Case #{complaint.caseId}</span>
                          )}
                          {complaint.doctorId && (
                            <span>Doctor #{complaint.doctorId}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(complaint.status)}
                          <StatusBadge status={complaint.status.toLowerCase()}>
                            {complaint.status.replace('_', ' ')}
                          </StatusBadge>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
                <p className="text-gray-600 mb-6">
                  {complaints.length === 0
                    ? "No complaints have been submitted yet"
                    : "No complaints match your current filters"
                  }
                </p>
                {complaints.length === 0 && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit First Complaint
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Submit Complaint on Behalf of Patient</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  complaintForm.reset();
                  setSelectedPatientId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={complaintForm.handleSubmit(handleCreateComplaint)} className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  {...complaintForm.register('patientId')}
                  onChange={handlePatientChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.patientName} - {patient.patientEmail}
                    </option>
                  ))}
                </select>
                {complaintForm.formState.errors.patientId && (
                  <p className="text-red-500 text-sm mt-1">
                    {complaintForm.formState.errors.patientId.message}
                  </p>
                )}
              </div>

              {/* Complaint Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint Type *
                </label>
                <select
                  {...complaintForm.register('complaintType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select complaint type</option>
                  {complaintTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {complaintForm.formState.errors.complaintType && (
                  <p className="text-red-500 text-sm mt-1">
                    {complaintForm.formState.errors.complaintType.message}
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

              {/* Related Case */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Case (Optional)
                </label>
                <select
                  {...complaintForm.register('caseId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={!selectedPatientId}
                >
                  <option value="">
                    {!selectedPatientId
                      ? 'Please select a patient first'
                      : filteredCases.length === 0
                      ? 'No cases found for this patient'
                      : 'Select a case (if applicable)'}
                  </option>
                  {filteredCases.map((case_) => (
                    <option key={case_.id} value={case_.id}>
                      Case #{case_.id} - {case_.caseTitle || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Doctor (Optional)
                </label>
                <select
                  {...complaintForm.register('doctorId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a doctor (if applicable)</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...complaintForm.register('description')}
                  rows={6}
                  placeholder="Please provide detailed information about the complaint..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {complaintForm.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {complaintForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    complaintForm.reset();
                    setSelectedPatientId('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <StatusBadge status={selectedComplaint.status.toLowerCase()}>
                  {selectedComplaint.status.replace('_', ' ')}
                </StatusBadge>
                <Badge className={getPriorityColor(selectedComplaint.priority)}>
                  {selectedComplaint.priority}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedComplaint.patientName || `Patient #${selectedComplaint.patientId}`}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Type</h4>
                <p className="text-gray-700">
                  {complaintTypes.find(t => t.value === selectedComplaint.complaintType)?.label || selectedComplaint.complaintType}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submitted</h4>
                  <p className="text-gray-700">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                  <p className="text-gray-700">{formatDate(selectedComplaint.resolvedAt)}</p>
                </div>
              </div>

              {selectedComplaint.adminResponse && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Response</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.adminResponse}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorComplaints;
