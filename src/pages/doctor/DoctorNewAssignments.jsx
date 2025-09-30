import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FileText,
  Clock,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Users,
  Stethoscope,
  Heart,
  Brain,
  DollarSign,
  Info,
  MessageSquare,
  ChevronRight,
  SortAsc,
  SortDesc,
  Download,
  Archive
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';
// Utility functions (inline since utils don't exist)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

const calculateTimeSince = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  } else {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${Math.max(1, diffInMinutes)} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Rejection reason validation schema
const rejectionSchema = yup.object({
  reason: yup
    .string()
    .required('Rejection reason is required')
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters')
});

// Sort and filter options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', field: 'submittedAt', order: 'desc' },
  { value: 'oldest', label: 'Oldest First', field: 'submittedAt', order: 'asc' },
  { value: 'priority', label: 'Priority (High to Low)', field: 'urgencyLevel', order: 'desc' },
  { value: 'fee', label: 'Fee (High to Low)', field: 'consultationFee', order: 'desc' }
];

const URGENCY_FILTERS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' }
];

const SPECIALIZATION_FILTERS = [
  { value: 'all', label: 'All Specializations' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'ONCOLOGY', label: 'Oncology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'PSYCHIATRY', label: 'Psychiatry' },
  { value: 'GENERAL_MEDICINE', label: 'General Medicine' }
];

const DoctorNewAssignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // Main state
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    critical: 0,
    averageFee: 0
  });

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form for rejection reason
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(rejectionSchema)
  });

  // Load assignments on component mount
  useEffect(() => {
    loadAssignments();
  }, []);

  // Apply filters and search whenever data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [assignments, searchTerm, sortBy, urgencyFilter, specializationFilter]);

  // Load assigned cases from API
  const loadAssignments = async () => {
    try {
      setRefreshing(true);
      const response = await execute(() => doctorService.getAssignedCases());
      
      setAssignments(response || []);
      calculateStats(response || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate statistics from assignments
  const calculateStats = (assignmentList) => {
    const total = assignmentList.length;
    const pending = assignmentList.filter(a => a.status === 'ASSIGNED').length;
    const critical = assignmentList.filter(a => a.urgencyLevel === 'CRITICAL' || a.urgencyLevel === 'HIGH').length;
    const totalFees = assignmentList.reduce((sum, a) => sum + (a.consultationFee || 0), 0);
    const averageFee = total > 0 ? totalFees / total : 0;

    setStats({ total, pending, critical, averageFee });
  };

  // Apply filters and search logic
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...assignments];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.caseTitle?.toLowerCase().includes(search) ||
        assignment.patientName?.toLowerCase().includes(search) ||
        assignment.description?.toLowerCase().includes(search) ||
        assignment.requiredSpecialization?.toLowerCase().includes(search)
      );
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.urgencyLevel === urgencyFilter);
    }

    // Apply specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.requiredSpecialization === specializationFilter);
    }

    // Apply sorting
    const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
    if (sortOption) {
      filtered.sort((a, b) => {
        const aValue = a[sortOption.field];
        const bValue = b[sortOption.field];
        
        if (sortOption.field === 'submittedAt') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortOption.order === 'desc' ? bDate - aDate : aDate - bDate;
        }
        
        if (sortOption.field === 'urgencyLevel') {
          const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return sortOption.order === 'desc' 
            ? urgencyOrder[bValue] - urgencyOrder[aValue]
            : urgencyOrder[aValue] - urgencyOrder[bValue];
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOption.order === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        return 0;
      });
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, sortBy, urgencyFilter, specializationFilter]);

  // Handle case acceptance
  const handleAcceptAssignment = async (assignment) => {
    try {
      setProcessingAction(assignment.id);
      await execute(() => doctorService.acceptCase(assignment.id));
      
      // Update local state
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
      
      // Show success and redirect to case details
      navigate(`/app/doctor/cases/${assignment.id}`, {
        state: { message: 'Case accepted successfully!' }
      });
    } catch (error) {
      console.error('Failed to accept assignment:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle case rejection
  const handleRejectAssignment = async (data) => {
    try {
      setProcessingAction(selectedAssignment.id);
      await execute(() => doctorService.rejectCase(selectedAssignment.id, data.reason));
      
      // Update local state
      setAssignments(prev => prev.filter(a => a.id !== selectedAssignment.id));
      
      setShowRejectModal(false);
      setSelectedAssignment(null);
      reset();
    } catch (error) {
      console.error('Failed to reject assignment:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  // Open rejection modal
  const openRejectModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowRejectModal(true);
  };

  // Close rejection modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedAssignment(null);
    reset();
  };

  // Get urgency color class
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get specialization icon
  const getSpecializationIcon = (specialization) => {
    switch (specialization) {
      case 'CARDIOLOGY': return <Heart className="w-4 h-4" />;
      case 'NEUROLOGY': return <Brain className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Case Assignments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and respond to new case assignments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={loadAssignments}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assignments"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          changeType="neutral"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          changeType="neutral"
        />
        <StatsCard
          title="Critical Cases"
          value={stats.critical}
          icon={<AlertTriangle className="w-6 h-6" />}
          changeType="decrease"
        />
        <StatsCard
          title="Average Fee"
          value={formatCurrency(stats.averageFee)}
          icon={<DollarSign className="w-6 h-6" />}
          changeType="increase"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by case title, patient name, or specialization..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  {URGENCY_FILTERS.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  {SPECIALIZATION_FILTERS.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Assignment List */}
      <Card>
        <div className="space-y-4">
          {loading && filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                {searchTerm || urgencyFilter !== 'all' || specializationFilter !== 'all'
                  ? 'No assignments match your filters'
                  : 'No new assignments available'
                }
              </p>
              {(searchTerm || urgencyFilter !== 'all' || specializationFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setUrgencyFilter('all');
                    setSpecializationFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Assignment Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.caseTitle}
                        </h3>
                        <PriorityBadge priority={assignment.urgencyLevel} />
                        {assignment.consultationFee && (
                          <Badge variant="success" size="sm">
                            {formatCurrency(assignment.consultationFee)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{assignment.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getSpecializationIcon(assignment.requiredSpecialization)}
                          <span>{assignment.requiredSpecialization?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateTime(assignment.submittedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Assignment Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Assigned {calculateTimeSince(assignment.submittedAt)} ago</span>
                      {assignment.documentsCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{assignment.documentsCount} documents</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link to={`/app/doctor/cases/${assignment.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View Details
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<XCircle className="w-4 h-4" />}
                        onClick={() => openRejectModal(assignment)}
                        disabled={processingAction === assignment.id}
                      >
                        Reject
                      </Button>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handleAcceptAssignment(assignment)}
                        loading={processingAction === assignment.id}
                        disabled={processingAction !== null}
                      >
                        Accept Case
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Reject Assignment Modal */}
      <FormModal
        isOpen={showRejectModal}
        onClose={closeRejectModal}
        title="Reject Case Assignment"
        subtitle={`Provide a reason for rejecting "${selectedAssignment?.caseTitle}"`}
        onSubmit={handleSubmit(handleRejectAssignment)}
        submitText="Reject Assignment"
        submitVariant="danger"
        loading={processingAction === selectedAssignment?.id}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Please provide a detailed reason for rejecting this case assignment..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>Once rejected, this case will be reassigned to another doctor. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default DoctorNewAssignments;