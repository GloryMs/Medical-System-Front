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
  Edit,
  Video,
  FileEdit,
  Calendar as CalendarIcon,
  Activity,
  TrendingUp,
  PlayCircle,
  Plus,
  BookOpen,
  DollarSignIcon
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

// Case fee update validation schema
const caseFeeSchema = yup.object({
  consultationFee: yup
    .number()
    .required('Consultation fee is required')
    .min(100, 'Minimum fee is $100.00')
    .max(500, 'Maximum fee is $500.00')
    .typeError('Consultation fee must be a valid number')
});

// Filter and sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
  { value: 'oldest', label: 'Oldest First', field: 'createdAt', order: 'asc' },
  { value: 'priority', label: 'Priority (High to Low)', field: 'urgencyLevel', order: 'desc' },
  { value: 'status', label: 'Status', field: 'status', order: 'asc' },
  { value: 'patient', label: 'Patient Name', field: 'patientName', order: 'asc' }
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CONSULTATION_COMPLETE', label: 'Consultation Complete' },
  { value: 'CLOSED', label: 'Closed' }
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

const DoctorCasesManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // Main state
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    scheduled: 0,
    inProgress: 0,
    pendingPayment: 0,
    critical: 0,
    totalEarnings: 0
  });

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form for case fee update
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(caseFeeSchema)
  });

  // Load cases on component mount
  useEffect(() => {
    loadActiveCases();
  }, []);

  // Apply filters and search whenever data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [cases, searchTerm, sortBy, statusFilter, urgencyFilter, specializationFilter]);

  // Load active cases from API
  const loadActiveCases = async () => {
    try {
      setRefreshing(true);
      const response = await execute(() => doctorService.getActiveCases());
      
      setCases(response || []);
      calculateStats(response || []);
    } catch (error) {
      console.error('Failed to load active cases:', error);
      setCases([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate statistics from cases
  const calculateStats = (caseList) => {
    const total = caseList.length;
    const accepted = caseList.filter(c => c.status === 'ACCEPTED').length;
    const scheduled = caseList.filter(c => c.status === 'SCHEDULED').length;
    const inProgress = caseList.filter(c => c.status === 'IN_PROGRESS').length;
    const pendingPayment = caseList.filter(c => c.status === 'PAYMENT_PENDING').length;
    const critical = caseList.filter(c => c.urgencyLevel === 'CRITICAL').length;
    const totalEarnings = caseList.reduce((sum, c) => sum + (c.consultationFee || 0), 0);

    setStats({ total, accepted, scheduled, inProgress, pendingPayment, critical, totalEarnings });
  };

  // Apply filters and search logic
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...cases];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.caseTitle?.toLowerCase().includes(search) ||
        case_.patientName?.toLowerCase().includes(search) ||
        case_.description?.toLowerCase().includes(search) ||
        case_.requiredSpecialization?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.urgencyLevel === urgencyFilter);
    }

    // Apply specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.requiredSpecialization === specializationFilter);
    }

    // Apply sorting
    const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
    if (sortOption) {
      filtered.sort((a, b) => {
        const aValue = a[sortOption.field];
        const bValue = b[sortOption.field];
        
        if (sortOption.field === 'createdAt') {
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
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOption.order === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOption.order === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        return 0;
      });
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, sortBy, statusFilter, urgencyFilter, specializationFilter]);

  // Handle case fee update
  const handleUpdateFee = async (data) => {
    try {
      setProcessingAction(selectedCase.id);
      
      // Call backend API to set case fee
      await execute(() => 
        doctorService.setCaseFee(selectedCase.id, data.consultationFee)
      );
      
      // Always close modal and reset form first
      setShowFeeModal(false);
      setSelectedCase(null);
      reset();
      
      // Then reload the cases list to get updated data
      await loadActiveCases();
      
      console.log('Consultation fee updated successfully');
      
    } catch (error) {
      console.error('Failed to update case fee:', error);
      alert('Failed to update consultation fee. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  // Open fee update modal
  const openFeeModal = (case_) => {
    setSelectedCase(case_);
    setValue('consultationFee', case_.consultationFee || '');
    setShowFeeModal(true);
  };

  // Close fee update modal
  const closeFeeModal = () => {
    setShowFeeModal(false);
    setSelectedCase(null);
    reset();
  };

  // Schedule appointment - check if fee is set
  const handleScheduleAppointment = (case_) => {
    if (!case_.consultationFee || case_.consultationFee <= 0) {
      alert('Please set the consultation fee before scheduling an appointment.');
      openFeeModal(case_);
      return;
    }
    
    navigate(`/app/doctor/schedule`, {
      state: { 
        caseId: case_.id, 
        patientId: case_.patientId, 
        caseTitle: case_.caseTitle,
        consultationFee: case_.consultationFee 
      }
    });
  };

  // Reschedule appointment
  const handleRescheduleAppointment = (case_) => {
    // TODO: Backend API needed - Get appointment details for rescheduling
    // const appointment = await doctorService.getAppointmentByCaseId(case_.id);
    
    navigate(`/app/doctor/appointments/reschedule`, {
      state: { 
        caseId: case_.id,
        appointmentId: case_.appointmentId,
        currentDateTime: case_.scheduledTime,
        patientName: case_.patientName
      }
    });
  };

  // Update case report
  const handleUpdateReport = (case_) => {
    // TODO: Backend API needed - Check if report exists for this case
    // If report exists, navigate to edit; otherwise navigate to create
    
    if (case_.reportId) {
      navigate(`/app/doctor/reports/${case_.reportId}/edit`);
    } else {
      navigate(`/app/doctor/reports/create`, {
        state: { 
          caseId: case_.id, 
          patientId: case_.patientId, 
          caseTitle: case_.caseTitle 
        }
      });
    }
  };

  // Send message to patient
  const handleSendMessage = (case_) => {
    navigate(`/app/doctor/communication`, {
      state: { 
        patientId: case_.patientId,
        patientName: case_.patientName,
        caseId: case_.id
      }
    });
  };

  // View case report
  const handleViewReport = (case_) => {
    if (case_.reportId) {
      navigate(`/app/doctor/reports/${case_.reportId}`);
    } else {
      alert('No report available for this case yet.');
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'text-blue-600 bg-blue-100';
      case 'SCHEDULED': return 'text-purple-600 bg-purple-100';
      case 'PAYMENT_PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100';
      case 'CONSULTATION_COMPLETE': return 'text-teal-600 bg-teal-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      case 'ONCOLOGY': return <Activity className="w-4 h-4" />;
      case 'PEDIATRICS': return <Users className="w-4 h-4" />;
      default: return <Stethoscope className="w-4 h-4" />;
    }
  };

  // Get actions based on case status
  const getCaseActions = (case_) => {
    const actions = [
      {
        label: 'View Details',
        icon: Eye,
        variant: 'ghost',
        onClick: () => navigate(`/app/doctor/cases/${case_.id}`)
      }
    ];

    switch (case_.status) {
      case 'ACCEPTED':
        // If fee is set, show Schedule Appointment button
        if (case_.consultationFee && case_.consultationFee > 0) {
          actions.push({
            label: 'Schedule Appointment',
            icon: CalendarIcon,
            variant: 'primary',
            onClick: () => handleScheduleAppointment(case_),
            requiresFee: false // Fee is already set
          });
        } else {
          // If fee is not set, show Update Fees button first
          actions.push(
            {
              label: 'Update Fees',
              icon: DollarSign,
              variant: 'primary',
              onClick: () => openFeeModal(case_)
            },
            {
              label: 'Schedule Appointment',
              icon: CalendarIcon,
              variant: 'outline',
              onClick: () => handleScheduleAppointment(case_),
              requiresFee: true,
              disabled: true // Disabled until fee is set
            }
          );
        }
        break;

      case 'SCHEDULED':
        actions.push({
          label: 'Re-Schedule',
          icon: CalendarIcon,
          variant: 'outline',
          onClick: () => handleRescheduleAppointment(case_)
        });
        break;

      case 'PAYMENT_PENDING':
        // Only view details available
        break;

      case 'IN_PROGRESS':
        actions.push(
          {
            label: 'Update Report',
            icon: FileEdit,
            variant: 'primary',
            onClick: () => handleUpdateReport(case_)
          },
          {
            label: 'Message Patient',
            icon: MessageSquare,
            variant: 'outline',
            onClick: () => handleSendMessage(case_)
          }
        );
        break;

      case 'CONSULTATION_COMPLETE':
      case 'CLOSED':
        actions.push({
          label: 'View Report',
          icon: BookOpen,
          variant: 'outline',
          onClick: () => handleViewReport(case_)
        });
        break;

      default:
        break;
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Cases</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your active patient cases and consultations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={loadActiveCases}
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
          <Link to="/app/doctor/assignments">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              New Assignments
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={<FileText className="w-5 h-5" />}
          changeType="neutral"
        />
        <StatsCard
          title="Accepted"
          value={stats.accepted}
          icon={<CheckCircle className="w-5 h-5" />}
          changeType="increase"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={<Calendar className="w-5 h-5" />}
          changeType="neutral"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="w-5 h-5" />}
          changeType="increase"
        />
        <StatsCard
          title="Payment Pending"
          value={stats.pendingPayment}
          icon={<DollarSign className="w-5 h-5" />}
          changeType="neutral"
        />
        <StatsCard
          title="Critical Cases"
          value={stats.critical}
          icon={<AlertTriangle className="w-5 h-5" />}
          changeType="decrease"
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          icon={<TrendingUp className="w-5 h-5" />}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
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
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUS_FILTERS.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
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

      {/* Cases List */}
      <Card>
        <div className="space-y-4">
          {loading && filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading active cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || specializationFilter !== 'all'
                  ? 'No cases match your filters'
                  : 'No active cases found'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || specializationFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
              {filteredCases.map((case_) => {
                const actions = getCaseActions(case_);
                
                return (
                  <div
                    key={case_.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Case Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {case_.caseTitle}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(case_.status)}>
                            {case_.status?.replace('_', ' ')}
                          </Badge>
                          <PriorityBadge priority={case_.urgencyLevel} />
                          {case_.consultationFee && (
                            <Badge variant="success" size="sm">
                              {formatCurrency(case_.consultationFee)}
                            </Badge>
                          )}
                          {!case_.consultationFee && case_.status === 'ACCEPTED' && (
                            <Badge variant="warning" size="sm">
                              Fee Not Set
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{case_.patientName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getSpecializationIcon(case_.requiredSpecialization)}
                            <span>{case_.requiredSpecialization?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Assigned {calculateTimeSince(case_.firstAssignedAt)} ago</span>
                          </div>
                        </div>

                        {/* Additional Case Info */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Case #{case_.id}</span>
                          {case_.firstAssignedAt && (
                            <>
                              <span>•</span>
                              <span>First Assigned: {formatDate(case_.firstAssignedAt)}</span>
                            </>
                          )}
                          {case_.documentsCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{case_.documentsCount} documents</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Case Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {case_.description}
                      </p>
                    </div>

                    {/* Fee Warning for ACCEPTED cases */}
                    {case_.status === 'ACCEPTED' && (!case_.consultationFee || case_.consultationFee <= 0) && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium">Consultation Fee Required</p>
                            <p>Please set the consultation fee before scheduling an appointment.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Case Actions */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        {actions.map((action, index) => {
                          const ActionIcon = action.icon;
                          return (
                            <Button
                              key={index}
                              variant={action.variant}
                              size="sm"
                              icon={<ActionIcon className="w-4 h-4" />}
                              onClick={action.onClick}
                              disabled={
                                processingAction === case_.id ||
                                action.disabled ||
                                (action.requiresFee && (!case_.consultationFee || case_.consultationFee <= 0))
                              }
                            >
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Update Case Fee Modal */}
      <FormModal
        isOpen={showFeeModal}
        onClose={closeFeeModal}
        title="Update Consultation Fee"
        subtitle={`Set consultation fee for "${selectedCase?.caseTitle}"`}
        onSubmit={handleSubmit(handleUpdateFee)}
        submitText="Update Fee"
        submitVariant="primary"
        loading={processingAction === selectedCase?.id}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Fee (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="100"
                max="500"
                {...register('consultationFee')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter consultation fee (100.00 - 500.00)"
              />
            </div>
            {errors.consultationFee && (
              <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Fee Guidelines:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Minimum consultation fee: $100.00</li>
                  <li>Maximum consultation fee: $500.00</li>
                  <li>Fee is required before scheduling appointments</li>
                  <li>Patient will be notified of the fee amount</li>
                  <li>Fee can be updated if case status is ACCEPTED</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default DoctorCasesManagement;
