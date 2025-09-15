import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  User,
  Calendar,
  Star,
  FileText,
  AlertCircle,
  Info,
  Send,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
  Shield,
  Mail,
  Phone,
  ChevronRight,
  MoreVertical,
  Settings,
  Target,
  PieChart,
  BarChart3
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';

// Validation schema for complaint response
const responseSchema = yup.object({
  response: yup.string()
    .required('Response is required')
    .min(20, 'Response must be at least 20 characters'),
  status: yup.string()
    .required('Status is required')
    .oneOf(['IN_PROGRESS', 'RESOLVED', 'CLOSED'], 'Invalid status'),
  notifyPatient: yup.boolean()
});

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
    avgResponseTime: 0
  });

  // Form setup for responses
  const responseForm = useForm({
    resolver: yupResolver(responseSchema),
    defaultValues: {
      response: '',
      status: 'IN_PROGRESS',
      notifyPatient: true
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadComplaints();
  }, []);

  // Filter complaints when filters change
  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter, priorityFilter, typeFilter, sortBy]);

  const loadComplaints = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      
      const data = await execute(() => adminService.getAllComplaints(filters));
      setComplaints(data || []);
      
      // Calculate stats
      calculateStats(data || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      setComplaints([]);
    }
  };

  const calculateStats = (complaintsData) => {
    const total = complaintsData.length;
    const open = complaintsData.filter(c => c.status === 'OPEN').length;
    const inProgress = complaintsData.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaintsData.filter(c => c.status === 'RESOLVED').length;
    const closed = complaintsData.filter(c => c.status === 'CLOSED').length;
    const critical = complaintsData.filter(c => c.priority === 'CRITICAL').length;
    
    // Calculate average response time (mock calculation)
    const avgResponseTime = complaintsData.length > 0 ? '2.4 hours' : '0 hours';

    setStats({
      total,
      open,
      inProgress,
      resolved,
      closed,
      critical,
      avgResponseTime
    });
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint => 
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(complaint => complaint.complaintType === typeFilter);
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

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handleRespondToComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    responseForm.reset({
      response: '',
      status: complaint.status === 'OPEN' ? 'IN_PROGRESS' : complaint.status,
      notifyPatient: true
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (data) => {
    try {
      await execute(() => 
        adminService.updateComplaintStatus(selectedComplaint.id, data.status, data.response)
      );
      
      // Update the complaint in local state
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === selectedComplaint.id 
            ? { ...complaint, status: data.status, adminResponse: data.response, resolvedAt: new Date() }
            : complaint
        )
      );
      
      setShowResponseModal(false);
      setSelectedComplaint(null);
      responseForm.reset();
      
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleExportComplaints = () => {
    const csvContent = [
      ['ID', 'Patient', 'Type', 'Priority', 'Status', 'Created At', 'Description'].join(','),
      ...filteredComplaints.map(complaint => [
        complaint.id,
        complaint.patientName || 'N/A',
        complaint.complaintType,
        complaint.priority,
        complaint.status,
        formatDate(complaint.createdAt),
        `"${complaint.description?.substring(0, 100)}..."`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'orange';
      case 'IN_PROGRESS':
        return 'blue';
      case 'RESOLVED':
        return 'green';
      case 'CLOSED':
        return 'gray';
      default:
        return 'gray';
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

  const complaintTypes = [
    { value: 'DOCTOR', label: 'Doctor Related' },
    { value: 'SYSTEM', label: 'System/Technical Issue' },
    { value: 'PAYMENT', label: 'Payment Issue' },
    { value: 'SERVICE', label: 'Service Quality' },
    { value: 'OTHER', label: 'Other' }
  ];

  const priorities = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];

  const statuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-gray-600 mt-1">Monitor and respond to customer complaints</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />}
            onClick={loadComplaints}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportComplaints}
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={() => navigate('/admin/reports')}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Complaints"
          value={stats.total}
          icon={<MessageSquare className="w-8 h-8" />}
          color="blue"
        />
        <StatsCard
          title="Open & In Progress"
          value={stats.open + stats.inProgress}
          icon={<Clock className="w-8 h-8" />}
          color="orange"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="w-8 h-8" />}
          color="green"
        />
        <StatsCard
          title="Critical Priority"
          value={stats.critical}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="red"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Action</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search complaints by ID, patient name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {complaintTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_desc">Latest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="priority_high">Priority High to Low</option>
              <option value="status">Status</option>
              <option value="updated_desc">Recently Updated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500">Loading complaints...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No complaints found</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {getTypeIcon(complaint.complaintType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{complaint.id}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {complaint.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {complaint.patientName || `Patient #${complaint.patientId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="flex items-center">
                        {getTypeIcon(complaint.complaintType)}
                        <span className="ml-1">
                          {complaintTypes.find(t => t.value === complaint.complaintType)?.label || complaint.complaintType}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={complaint.status} 
                        variant={getStatusColor(complaint.status)}
                        icon={getStatusIcon(complaint.status)}
                      >
                        {statuses.find(s => s.value === complaint.status)?.label || complaint.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(complaint.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => handleViewComplaint(complaint)}
                        >
                          View
                        </Button>
                        {complaint.status !== 'CLOSED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Send className="w-4 h-4" />}
                            onClick={() => handleRespondToComplaint(complaint)}
                          >
                            Respond
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Complaint Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedComplaint(null);
        }}
        title="Complaint Details"
        size="4xl"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Complaint #{selectedComplaint.id}
                </h3>
                <div className="flex items-center space-x-3 mt-2">
                  <StatusBadge 
                    status={selectedComplaint.status}
                    variant={getStatusColor(selectedComplaint.status)}
                  >
                    {statuses.find(s => s.value === selectedComplaint.status)?.label}
                  </StatusBadge>
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority}
                  </Badge>
                  <Badge variant="outline">
                    {complaintTypes.find(t => t.value === selectedComplaint.complaintType)?.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Created: {formatDate(selectedComplaint.createdAt)}</p>
                {selectedComplaint.updatedAt && (
                  <p>Updated: {formatDate(selectedComplaint.updatedAt)}</p>
                )}
              </div>
            </div>

            {/* Patient Information */}
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Patient Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Patient ID:</label>
                  <p className="font-medium">#{selectedComplaint.patientId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Patient Name:</label>
                  <p className="font-medium">{selectedComplaint.patientName || 'N/A'}</p>
                </div>
                {selectedComplaint.doctorId && (
                  <div>
                    <label className="text-sm text-gray-600">Related Doctor:</label>
                    <p className="font-medium">Dr. #{selectedComplaint.doctorId}</p>
                  </div>
                )}
                {selectedComplaint.caseId && (
                  <div>
                    <label className="text-sm text-gray-600">Related Case:</label>
                    <p className="font-medium">Case #{selectedComplaint.caseId}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Complaint Details */}
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Complaint Description
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>
            </Card>

            {/* Admin Response */}
            {selectedComplaint.adminResponse && (
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Response
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedComplaint.adminResponse}
                  </p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      Responded on: {formatDate(selectedComplaint.resolvedAt)}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              {selectedComplaint.status !== 'CLOSED' && (
                <Button
                  variant="primary"
                  icon={<Send className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRespondToComplaint(selectedComplaint);
                  }}
                >
                  Respond to Complaint
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <FormModal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedComplaint(null);
          responseForm.reset();
        }}
        title="Respond to Complaint"
        loading={loading}
      >
        {selectedComplaint && (
          <form onSubmit={responseForm.handleSubmit(handleSubmitResponse)} className="space-y-4">
            {/* Complaint Summary */}
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">
                Complaint #{selectedComplaint.id}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {selectedComplaint.description}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <Badge className={getPriorityColor(selectedComplaint.priority)}>
                  {selectedComplaint.priority}
                </Badge>
                <Badge variant="outline">
                  {complaintTypes.find(t => t.value === selectedComplaint.complaintType)?.label}
                </Badge>
              </div>
            </Card>

            {/* Response Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response <span className="text-red-500">*</span>
              </label>
              <textarea
                {...responseForm.register('response')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your response to the complaint..."
              />
              {responseForm.formState.errors.response && (
                <p className="mt-1 text-sm text-red-600">
                  {responseForm.formState.errors.response.message}
                </p>
              )}
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status <span className="text-red-500">*</span>
              </label>
              <select
                {...responseForm.register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              {responseForm.formState.errors.status && (
                <p className="mt-1 text-sm text-red-600">
                  {responseForm.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* Notification Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...responseForm.register('notifyPatient')}
                id="notifyPatient"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifyPatient" className="ml-2 block text-sm text-gray-700">
                Send notification to patient via email
              </label>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResponseModal(false);
                  responseForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<Send className="w-4 h-4" />}
              >
                Send Response
              </Button>
            </div>
          </form>
        )}
      </FormModal>

      {/* Alert for Critical Complaints */}
      {stats.critical > 0 && (
        <AlertCard
          type="warning"
          title="Critical Complaints Alert"
          message={`You have ${stats.critical} critical priority complaint${stats.critical > 1 ? 's' : ''} that require immediate attention.`}
          action={
            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                setPriorityFilter('CRITICAL');
                setStatusFilter('OPEN');
              }}
            >
              View Critical
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ComplaintManagement;