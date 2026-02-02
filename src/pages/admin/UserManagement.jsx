import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Stethoscope,
  Building2,
  Clock
} from 'lucide-react';
import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';
import { toast } from 'react-toastify';

// ==================== Sub-Components ====================

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading
}) => {
  const pageSizeOptions = [10, 20, 50, 100];
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) pages.push('...');
      if (totalPages > 1) pages.push(totalPages - 1);
    }

    return pages;
  };

  if (totalElements === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      {/* Info and Page Size */}
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <span>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalElements}</span> users
        </span>
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            disabled={loading}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || loading}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                } disabled:opacity-50`}
              >
                {page + 1}
              </button>
            )
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Sortable Table Header
const SortableHeader = ({ label, field, currentSort, currentDir, onSort }) => {
  const isActive = currentSort === field;

  const handleClick = () => {
    if (isActive) {
      onSort(field, currentDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUp className="w-4 h-4 text-primary-600" />
          ) : (
            <ArrowDown className="w-4 h-4 text-primary-600" />
          )
        ) : (
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const roleConfig = {
    PATIENT: { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Patient' },
    DOCTOR: { color: 'bg-green-100 text-green-800', icon: Stethoscope, label: 'Doctor' },
    ADMIN: { color: 'bg-red-100 text-red-800', icon: Shield, label: 'Admin' },
    MEDICAL_SUPERVISOR: { color: 'bg-purple-100 text-purple-800', icon: Building2, label: 'Supervisor' }
  };

  const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800', icon: Users, label: role };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// Status Badge Component
const UserStatusBadge = ({ status }) => {
  const statusConfig = {
    ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    SUSPENDED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    PENDING_VERIFICATION: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status?.replace('_', ' ') || 'Unknown'}
    </span>
  );
};

// ==================== Main Component ====================

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { execute, loading } = useApi();

  // Data State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    doctors: 0,
    pendingUsers: 0
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting State
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // UI State
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load users when pagination, sorting, or filters change
  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, sortBy, sortDir]);

  // Debounced search - reload after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadUsers();
      } else {
        setCurrentPage(0); // Reset to first page when search changes
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage === 0) {
      loadUsers();
    } else {
      setCurrentPage(0);
    }
  }, [filterRole, filterStatus]);

  // Initial load of stats
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadUsers = async () => {
    try {
      const filters = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDir: sortDir
      };

      if (filterRole) filters.role = filterRole;
      if (filterStatus) filters.status = filterStatus;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const response = await execute(() => adminService.getAllUsers(filters));

      // Handle paginated response structure
      if (response?.data?.content) {
        setUsers(response.data.content);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
      } else if (response?.content) {
        setUsers(response.content);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        // Fallback for array response
        const usersData = response?.data || response || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTotalElements(usersData.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await execute(() => adminService.getDashboardStats());
      if (response) {
        setStats({
          totalUsers: response.totalUsers || response.data?.totalUsers || 0,
          activeUsers: response.activeUsers || response.data?.activeUsers || 0,
          doctors: response.totalDoctors || response.doctors || response.data?.totalDoctors || 0,
          pendingUsers: response.pendingUsers || response.data?.pendingUsers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUsers(), loadDashboardStats()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      setSelectedUsers([]); // Clear selection on page change
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page
    setSelectedUsers([]);
  };

  // Sorting handler
  const handleSort = (field, direction) => {
    setSortBy(field);
    setSortDir(direction);
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  // User actions
  const handleUserAction = async (action, userId, reason = '') => {
    try {
      switch (action) {
        case 'activate':
          await execute(() => adminService.unsuspendUser(userId));
          toast.success('User activated successfully');
          break;
        case 'suspend':
          await execute(() => adminService.suspendUser(userId, reason || 'Account suspended by admin'));
          toast.success('User suspended successfully');
          break;
        case 'delete':
          await execute(() => adminService.deleteUser(userId));
          toast.success('User deleted successfully');
          break;
        case 'resetPassword':
          await execute(() => adminService.resetUserPassword(userId));
          toast.success('Password reset email sent');
          return; // Don't reload for password reset
      }

      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      const promises = selectedUsers.map(userId => {
        switch (action) {
          case 'activate':
            return adminService.unsuspendUser(userId);
          case 'suspend':
            return adminService.suspendUser(userId, 'Bulk action by admin');
          case 'delete':
            return adminService.deleteUser(userId);
          default:
            return Promise.resolve();
        }
      });

      await execute(() => Promise.all(promises));
      toast.success(`Successfully ${action}d ${selectedUsers.length} user(s)`);

      setSelectedUsers([]);
      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await execute(() => adminService.getUserById(userId));
      setSelectedUser(userData?.data || userData);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const confirmUserAction = (action, userId, reason = '') => {
    if (action === 'delete') {
      setConfirmAction({
        action,
        userId,
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmText: 'Delete',
        confirmStyle: 'danger'
      });
      setShowConfirmModal(true);
    } else {
      handleUserAction(action, userId, reason);
    }
  };

  const confirmBulkAction = (action) => {
    if (selectedUsers.length === 0) return;

    setConfirmAction({
      action: 'bulk',
      bulkAction: action,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Users`,
      message: `Are you sure you want to ${action} ${selectedUsers.length} selected user(s)?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmStyle: action === 'delete' ? 'danger' : 'primary'
    });
    setShowConfirmModal(true);
  };

  const executeConfirmedAction = async () => {
    if (confirmAction.action === 'bulk') {
      await handleBulkAction(confirmAction.bulkAction);
    } else {
      await handleUserAction(confirmAction.action, confirmAction.userId);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
    setCurrentPage(0);
  };

  const hasActiveFilters = searchTerm || filterRole || filterStatus;

  // User Detail Modal
  const UserModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-sm text-gray-900">{user.fullName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-sm text-gray-900">{user.phoneNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <RoleBadge role={user.role} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <UserStatusBadge status={user.status} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
              <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <p className="text-sm text-gray-900">{formatDateTime(user.lastLoginAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-900">{formatDateTime(user.updatedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2FA Enabled</label>
              <Badge variant={user.twoFactorEnabled ? 'success' : 'default'}>
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === 'DOCTOR' && user.doctorProfile && (
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Doctor Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <p className="text-sm text-gray-900">{user.doctorProfile.specialization || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                  <Badge variant={user.doctorProfile.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                    {user.doctorProfile.verificationStatus || 'PENDING'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-sm text-gray-900">{user.doctorProfile.licenseNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-sm text-gray-900">{user.doctorProfile.yearsOfExperience || 'N/A'} years</p>
                </div>
              </div>
            </div>
          )}

          {user.role === 'PATIENT' && user.patientProfile && (
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-sm text-gray-900">{formatDate(user.patientProfile.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <p className="text-sm text-gray-900">{user.patientProfile.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <p className="text-sm text-gray-900">{user.patientProfile.emergencyContactNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              handleUserAction('resetPassword', user.id);
              onClose();
            }}
            disabled={loading}
          >
            Reset Password
          </Button>
          {user.status === 'ACTIVE' ? (
            <Button
              variant="warning"
              onClick={() => {
                confirmUserAction('suspend', user.id);
                onClose();
              }}
              disabled={loading}
            >
              Suspend User
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => {
                handleUserAction('activate', user.id);
                onClose();
              }}
              disabled={loading}
            >
              Activate User
            </Button>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Export functionality coming soon')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck className="w-6 h-6" />}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Doctors"
          value={stats.doctors}
          icon={<Stethoscope className="w-6 h-6" />}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingUsers}
          icon={<AlertCircle className="w-6 h-6" />}
          iconColor="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
            <option value="MEDICAL_SUPERVISOR">Supervisors</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" size="sm">Search: "{searchTerm}"</Badge>
              )}
              {filterRole && (
                <Badge variant="secondary" size="sm">Role: {filterRole}</Badge>
              )}
              {filterStatus && (
                <Badge variant="secondary" size="sm">Status: {filterStatus}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <span className="text-sm font-medium text-primary-700">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => confirmBulkAction('activate')}
                disabled={loading}
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => confirmBulkAction('suspend')}
                disabled={loading}
              >
                <UserX className="w-4 h-4 mr-1" />
                Suspend
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => confirmBulkAction('delete')}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <SortableHeader label="User" field="fullName" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Role" field="role" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Join Date" field="createdAt" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Last Login" field="lastLoginAt" currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mr-3" />
                      <span className="text-gray-500">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No users found</p>
                    {hasActiveFilters && (
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                            {(user.fullName || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phoneNumber && (
                            <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : (
                        <span className="text-gray-400 italic">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.emailVerified ? 'success' : 'warning'} size="sm">
                        {user.emailVerified ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => confirmUserAction('suspend', user.id)}
                            disabled={loading}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction('activate', user.id)}
                            disabled={loading}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleUserAction('resetPassword', user.id)}
                          disabled={loading}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => confirmUserAction('delete', user.id)}
                          disabled={loading}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </Card>

      {/* User Detail Modal */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={executeConfirmedAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        confirmVariant={confirmAction?.confirmStyle}
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;
