
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FileText,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  UserCheck,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Zap,
  Shield,
  AlertCircle,
  Info,
  Plus,
  Users,
  BarChart3,
  PieChart,
  Target,
  Briefcase,
  Heart,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Filter as FilterIcon
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useUI } from '../../hooks/useUI';
import adminService from '../../services/api/adminService';
import commonService from '../../services/api/commonService';
import CaseAnalyticsModal from './Caseanalyticsmodal';


// Validation schemas
const assignmentSchema = yup.object({
  doctorId: yup.string().required('Doctor selection is required'),
  priority: yup.string().required('Priority is required'),
  notes: yup.string().optional()
});

const reassignmentSchema = yup.object({
  doctorId: yup.string().required('Doctor selection is required'),
  notes: yup.string().required('Reason for reassignment is required').min(10, 'Please provide a detailed reason')
});

const CaseManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const { showToast } = useUI();

  // State management
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Pagination state (server-side)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    avgResolutionTime: 0
  });

  // Handle bulk operations (for future enhancement)
  const [selectedCases, setSelectedCases] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Toggle case selection
  const toggleCaseSelection = (caseId) => {
    setSelectedCases(prev =>
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  // Select all cases
  const toggleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases.map(c => c.id));
    }
  };

  // Export cases data
  const handleExportCases = async () => {
    try {
      const dataToExport = cases.map(caseItem => ({
        'Case ID': caseItem.id,
        'Patient ID': caseItem.patientId,
        'Case Title': caseItem.caseTitle,
        'Status': caseItem.status,
        'Urgency': caseItem.urgencyLevel,
        'Created Date': new Date(caseItem.createdAt).toLocaleDateString(),
        'Assigned Doctor': caseItem.doctorName || 'Unassigned'
      }));

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]).join(',');
      const csvContent = dataToExport.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      const csv = `${headers}\n${csvContent}`;
      
      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cases_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Cases exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export cases', 'error');
    }
  };

  // Constants
  const CASE_STATUSES = [
    { value: 'SUBMITTED', label: 'Submitted', color: 'blue' },
    { value: 'PENDING', label: 'Pending', color: 'yellow' },
    { value: 'ASSIGNED', label: 'Assigned', color: 'orange' },
    { value: 'ACCEPTED', label: 'Accepted', color: 'purple' },
    { value: 'SCHEDULED', label: 'Scheduled', color: 'indigo' },
    { value: 'PAYMENT_PENDING', label: 'Payment Pending', color: 'pink' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
    { value: 'CONSULTATION_COMPLETE', label: 'Consultation Complete', color: 'green' },
    { value: 'CLOSED', label: 'Closed', color: 'gray' },
    { value: 'REJECTED', label: 'Rejected', color: 'red' }
  ];

  const URGENCY_LEVELS = [
    { value: 'LOW', label: 'Low', color: 'green' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
    { value: 'HIGH', label: 'High', color: 'orange' },
    { value: 'CRITICAL', label: 'Critical', color: 'red' }
  ];

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(assignmentSchema)
  });

  const { register: registerReassign, handleSubmit: handleSubmitReassign, reset: resetReassign, formState: { errors: errorsReassign } } = useForm({
    resolver: yupResolver(reassignmentSchema)
  });

  // Load data with server-side pagination
  const loadCases = async () => {
    try {
      // Build filter parameters for API
      const filters = {
        page: currentPage,
        size: pageSize,
        sort: `${sortBy},${sortOrder}`
      };

      // Add search term if present
      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }

      // Add status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      // Add urgency filter
      if (urgencyFilter !== 'all') {
        filters.urgencyLevel = urgencyFilter;
      }

      // Add specialization filter
      if (specializationFilter !== 'all') {
        filters.specialization = specializationFilter;
      }

      // Add date range filter
      if (dateRangeFilter !== 'all') {
        const now = new Date();
        let startDate;

        switch (dateRangeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          filters.startDate = startDate.toISOString();
        }
      }

      console.log('Loading cases with filters:', filters);

      const response = await execute(() => adminService.getAllCases(filters));

      console.log('Full response:', response);

      if (response) {
        // Check if response is paginated (Spring Page object)
        if (response.content && Array.isArray(response.content)) {
          console.log('Handling paginated response');
          setCases(response.content);
          setTotalElements(response.totalElements || 0);
          setTotalPages(response.totalPages || 0);
          // Calculate stats from the full count, not just current page
          calculateStats(response.content, response.totalElements);
        }
        // Check if response is a simple array (fallback)
        else if (Array.isArray(response)) {
          console.log('Handling array response');
          setCases(response);
          setTotalElements(response.length);
          setTotalPages(Math.ceil(response.length / pageSize));
          calculateStats(response, response.length);
        }
        // Handle empty response
        else {
          console.warn('Unexpected response format:', response);
          setCases([]);
          setTotalElements(0);
          setTotalPages(0);
          calculateStats([], 0);
        }
      } else {
        console.warn('No data in response');
        setCases([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      showToast('Failed to load cases', 'error');
      setCases([]);
      setTotalElements(0);
      setTotalPages(0);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await execute(() => adminService.getAllDoctors({ status: 'VERIFIED' }));
      if (response?.data) {
        setAvailableDoctors(response.data);
      }
    } catch (error) {
      showToast('Failed to load doctors', 'error');
    }
  };

  const loadCaseMetrics = async () => {
    try {
      const response = await execute(() => adminService.getCaseMetrics());
      if (response?.data) {
        setStats(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to load case metrics:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDoctors();
    loadCaseMetrics();
  }, []);

  // Load cases when pagination or filters change
  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch, statusFilter, urgencyFilter, specializationFilter, dateRangeFilter, sortBy, sortOrder]);

  // Calculate statistics
  const calculateStats = (casesData, total = null) => {
    const statusCounts = casesData.reduce((acc, caseItem) => {
      acc[caseItem.status] = (acc[caseItem.status] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: total !== null ? total : casesData.length,
      pending: statusCounts.PENDING || 0,
      assigned: statusCounts.ASSIGNED || 0,
      inProgress: statusCounts.IN_PROGRESS || 0,
      completed: statusCounts.CLOSED || 0,
      avgResolutionTime: 3.2 // Mock data - calculate from actual data
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  // Handle case assignment
  const handleAssignCase = async (data) => {
    try {
      await execute(() => adminService.assignCaseToDoctor(selectedCase.id, data.doctorId));
      
      showToast('Case assigned successfully', 'success');
      
      // Update case in list
      setCases(prev => prev.map(c => 
        c.id === selectedCase.id 
          ? { ...c, status: 'ASSIGNED', assignedDoctorId: data.doctorId }
          : c
      ));
      
      setShowAssignModal(false);
      setSelectedCase(null);
      reset();
    } catch (error) {
      showToast('Failed to assign case', 'error');
    }
  };

  // Handle case reassignment
  const handleReassignCase = async (data) => {
    try {
      await execute(() => adminService.reassignCase(
        selectedCase.id, 
        data.doctorId, 
        data.notes || 'Reassigned by admin'
      ));
      
      showToast('Case reassigned successfully', 'success');
      
      // Update case in list
      setCases(prev => prev.map(c => 
        c.id === selectedCase.id 
          ? { ...c, assignedDoctorId: data.doctorId }
          : c
      ));
      
      setShowReassignModal(false);
      setSelectedCase(null);
      reset();
    } catch (error) {
      showToast('Failed to reassign case', 'error');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusInfo = CASE_STATUSES.find(s => s.value === status);
    return statusInfo?.color || 'gray';
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    const urgencyInfo = URGENCY_LEVELS.find(u => u.value === urgency);
    return urgencyInfo?.color || 'gray';
  };

  // Handle case details view
  const handleViewCaseDetails = async (caseItem) => {
    try {
      const response = await execute(() => adminService.getCaseById(caseItem.id));
      if (response) {
        setSelectedCase(response);
        setShowDetailsModal(true);
      }
    } catch (error) {
      showToast('Failed to load case details', 'error');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Case ID',
      key: 'id',
      render: (caseItem) => (
        <div className="font-mono text-sm">
          #{caseItem.id}
        </div>
      )
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (caseItem) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {caseItem.patientName || 'Patient'}
            </div>
            <div className="text-sm text-gray-500">
              ID: {caseItem.patientId}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Case Title',
      key: 'caseTitle',
      render: (caseItem) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">
            {caseItem.caseTitle || 'Untitled Case'}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {caseItem.description}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (caseItem) => (
        <StatusBadge 
          status={caseItem.status} 
          variant={getStatusColor(caseItem.status)}
        >
          {CASE_STATUSES.find(s => s.value === caseItem.status)?.label || caseItem.status}
        </StatusBadge>
      )
    },
    {
      title: 'Urgency',
      key: 'urgencyLevel',
      render: (caseItem) => (
        <Badge 
          variant={getUrgencyColor(caseItem.urgencyLevel)}
          size="sm"
          icon={caseItem.urgencyLevel === 'CRITICAL' ? <AlertTriangle className="w-3 h-3" /> : undefined}
        >
          {URGENCY_LEVELS.find(u => u.value === caseItem.urgencyLevel)?.label || caseItem.urgencyLevel}
        </Badge>
      )
    },
    {
      title: 'Assigned Doctor',
      key: 'assignedDoctor',
      render: (caseItem) => (
        <div>
          {caseItem.assignedDoctorId ? (
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                Dr. {caseItem.doctorName || 'Assigned'}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Unassigned</span>
          )}
        </div>
      )
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (caseItem) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {new Date(caseItem.createdAt).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(caseItem.createdAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      kye: 'actions',
      render: (caseItem) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewCaseDetails(caseItem)}
          >
            View
          </Button>
          {!caseItem.assignedDoctorId && (
            <Button
              variant="primary"
              size="sm"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => {
                setSelectedCase(caseItem);
                setShowAssignModal(true);
              }}
            >
              Assign
            </Button>
          )}
          {caseItem.assignedDoctorId && (
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => {
                setSelectedCase(caseItem);
                setShowReassignModal(true);
              }}
            >
              Reassign
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all medical cases in the system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={loadCases}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCases}
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={<BarChart3 className="w-4 h-4" />}
            // onClick={() => setShowAnalyticsModal(true)}
            onClick={() => navigate('/app/admin/cases/analytics')}
          >
            Analytics
          </Button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          trend={{ value: 12, isPositive: true }}
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard
          title="Pending Assignment"
          value={stats.pending}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          trend={{ value: 5, isPositive: false }}
          className="border-l-4 border-l-yellow-500"
        />
        <StatsCard
          title="Assigned"
          value={stats.assigned}
          icon={<UserCheck className="w-6 h-6 text-orange-600" />}
          trend={{ value: 8, isPositive: true }}
          className="border-l-4 border-l-orange-500"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          trend={{ value: 3, isPositive: true }}
          className="border-l-4 border-l-purple-500"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          trend={{ value: 15, isPositive: true }}
          className="border-l-4 border-l-green-500"
        />
        <StatsCard
          title="Avg Resolution"
          value={`${stats.avgResolutionTime} days`}
          icon={<Target className="w-6 h-6 text-indigo-600" />}
          trend={{ value: 0.3, isPositive: false }}
          className="border-l-4 border-l-indigo-500"
        />
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {CASE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Urgency</option>
                {URGENCY_LEVELS.map(urgency => (
                  <option key={urgency.value} value={urgency.value}>{urgency.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={showAdvancedFilters ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="urgencyLevel">Urgency</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cases Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No cases found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(caseItem) : caseItem[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalElements > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Pagination info and page size selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{currentPage * pageSize + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalElements}</span>
                  {' '}results
                </span>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Per page:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(0, endPage - maxVisiblePages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            currentPage === i
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>



      Anylytics Modal
      <CaseAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Case Assignment Modal */}
      <FormModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedCase(null);
          reset();
        }}
        title="Assign Case to Doctor"
        description="Select a doctor to assign this case"
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-4">
            {/* Current Assignment Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Assignment</h4>
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">
                  Currently assigned to: Dr. {selectedCase.doctorName || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Reassignment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Doctor *
                </label>
                <select
                  {...registerReassign('doctorId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a new doctor...</option>
                  {availableDoctors.filter(doc => doc.id !== selectedCase.assignedDoctorId).map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.fullName} - {doctor.specialization}
                      ({doctor.currentCaseLoad || 0}/{doctor.maxConcurrentCases || 10} cases)
                    </option>
                  ))}
                </select>
                {errorsReassign.doctorId && (
                  <p className="mt-1 text-sm text-red-600">{errorsReassign.doctorId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reassignment *
                </label>
                <textarea
                  {...registerReassign('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Please provide a reason for the reassignment..."
                />
                {errorsReassign.notes && (
                  <p className="mt-1 text-sm text-red-600">{errorsReassign.notes.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedCase(null);
                  resetReassign();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                loading={loading}
                icon={<Edit className="w-4 h-4" />}
                onClick={handleSubmitReassign(handleReassignCase)}
              >
                Reassign Case
              </Button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Case Details Modal */}
      <FormModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCase(null);
        }}
        title="Case Details"
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-6">
            {/* Case Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Case #{selectedCase.id}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedCase.caseTitle || 'Medical Case'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge 
                  status={selectedCase.status}
                  variant={getStatusColor(selectedCase.status)}
                >
                  {CASE_STATUSES.find(s => s.value === selectedCase.status)?.label}
                </StatusBadge>
                <Badge 
                  variant={getUrgencyColor(selectedCase.urgencyLevel)}
                  icon={selectedCase.urgencyLevel === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> : undefined}
                >
                  {selectedCase.urgencyLevel}
                </Badge>
              </div>
            </div>

            {/* Case Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <Card>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary-600" />
                    Patient Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-medium">{selectedCase.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedCase.patientName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{selectedCase.patientAge || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{selectedCase.patientGender || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Doctor Information */}
              <Card>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-primary-600" />
                    Assigned Doctor
                  </h4>
                  {selectedCase.assignedDoctorId ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-medium">Dr. {selectedCase.doctorName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialization:</span>
                        <span className="font-medium">{selectedCase.doctorSpecialization || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned At:</span>
                        <span className="font-medium">
                          {selectedCase.assignedAt 
                            ? new Date(selectedCase.assignedAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-gray-600">No doctor assigned</p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setShowDetailsModal(false);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign Doctor
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Case Description */}
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Case Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedCase.description || 'No description provided.'}
                </p>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-600" />
                  Case Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Case Submitted</span>
                        <span className="text-xs text-gray-500">
                          {new Date(selectedCase.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCase.assignedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Doctor Assigned</span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedCase.assignedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCase.acceptedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Case Accepted</span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedCase.acceptedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCase.scheduledAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Appointment Scheduled</span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedCase.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCase.status === 'CLOSED' && selectedCase.closedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Case Closed</span>
                          <span className="text-xs text-gray-500">
                            {new Date(selectedCase.closedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Documents */}
            {selectedCase.documents && selectedCase.documents.length > 0 && (
              <Card>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Attached Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCase.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium truncate">{doc.name || `Document ${index + 1}`}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ExternalLink className="w-3 h-3" />}
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Information */}
            {selectedCase.paymentStatus && (
              <Card>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <StatusBadge status={selectedCase.paymentStatus}>
                        {selectedCase.paymentStatus}
                      </StatusBadge>
                    </div>
                    {selectedCase.consultationFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultation Fee:</span>
                        <span className="font-medium">${selectedCase.consultationFee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCase(null);
                }}
              >
                Close
              </Button>
              {!selectedCase.assignedDoctorId && (
                <Button
                  variant="primary"
                  icon={<UserCheck className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowAssignModal(true);
                  }}
                >
                  Assign Doctor
                </Button>
              )}
              {selectedCase.assignedDoctorId && (
                <Button
                  variant="outline"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowReassignModal(true);
                  }}
                >
                  Reassign
                </Button>
              )}
            </div>
          </div>
        )}
      </FormModal>

      {/* Empty State */}
      {cases.length === 0 && !loading && totalElements === 0 && (
        <AlertCard
          type="info"
          icon={<Info className="w-5 h-5" />}
          title="No cases found"
          description="There are no cases matching your current filters. Try adjusting your search criteria."
          actions={
            <Button
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setUrgencyFilter('all');
                setSpecializationFilter('all');
                setDateRangeFilter('all');
                setCurrentPage(0);
              }}
            >
              Clear Filters
            </Button>
          }
        />
      )}
    </div>
  );
};

export default CaseManagement;