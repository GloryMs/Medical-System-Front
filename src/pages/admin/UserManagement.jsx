import React, { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';
import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';

const UserManagement = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    doctors: 0,
    pendingUsers: 0
  });

  useEffect(() => {
    loadUsers();
    loadDashboardStats();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      const filters = {};
      if (filterRole !== 'ALL') filters.role = filterRole;
      if (filterStatus !== 'ALL') filters.status = filterStatus;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const response = await execute(() => adminService.getAllUsers(filters));
      setUsers(response.content || response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await execute(() => adminService.getDashboardStats());
      setStats({
        totalUsers: response.totalUsers || 0,
        activeUsers: response.activeUsers || 0,
        doctors: response.doctors || 0,
        pendingUsers: response.pendingUsers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (action, userId, reason = '') => {
    try {
      let successMessage = '';
      
      switch (action) {
        case 'activate':
          await execute(() => adminService.unsuspendUser(userId), {
            showSuccessToast: true,
            successMessage: 'User activated successfully'
          });
          break;
        case 'suspend':
          await execute(() => adminService.suspendUser(userId, reason || 'Account suspended by admin'), {
            showSuccessToast: true,
            successMessage: 'User suspended successfully'
          });
          break;
        case 'delete':
          await execute(() => adminService.deleteUser(userId), {
            showSuccessToast: true,
            successMessage: 'User deleted successfully'
          });
          break;
        case 'resetPassword':
          await execute(() => adminService.resetUserPassword(userId), {
            showSuccessToast: true,
            successMessage: 'Password reset email sent to user'
          });
          // Don't reload for password reset
          return;
      }
      
      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
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

      await execute(() => Promise.all(promises), {
        showSuccessToast: true,
        successMessage: `Successfully ${action}d ${selectedUsers.length} user(s)`
      });
      
      setSelectedUsers([]);
      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await execute(() => adminService.getUserById(userId));
      setSelectedUser(userData);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'PATIENT': return 'info';
      case 'DOCTOR': return 'success';
      case 'ADMIN': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'error';
      case 'PENDING': return 'warning';
      case 'PENDING_VERIFICATION': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'SUSPENDED': return <XCircle className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'PENDING_VERIFICATION': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <p className="text-sm text-gray-900">{user.lastName || 'N/A'}</p>
            </div> */}
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
              <Badge color={getRoleColor(user.role)}>{user.role}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex items-center">
                {getStatusIcon(user.status)}
                <StatusBadge status={user.status} className="ml-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
              <StatusBadge 
                status={user.emailVerified ? 'verified' : 'pending'}
              />
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
                  <Badge color={user.doctorProfile.verificationStatus === 'VERIFIED' ? 'green' : 'yellow'}>
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
          <Button variant="secondary" onClick={onClose}>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-3">
          <Button
            onClick={() => {
              loadUsers();
              loadDashboardStats();
            }}
            disabled={loading}
            icon={<RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => console.log('Export functionality coming soon')}
            icon={<Download className="w-4 h-4" />}
            variant="outline"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-8 h-8" />}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck className="w-8 h-8" />}
          color="green"
        />
        <StatsCard
          title="Doctors"
          value={stats.doctors}
          icon={<Shield className="w-8 h-8" />}
          color="purple"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingUsers}
          icon={<AlertCircle className="w-8 h-8" />}
          color="yellow"
        />
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="PATIENT">Patients</option>
              <option value="DOCTOR">Doctors</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-600">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => confirmBulkAction('activate')}
                disabled={loading}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="warning"
                onClick={() => confirmBulkAction('suspend')}
                disabled={loading}
              >
                Suspend
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => confirmBulkAction('delete')}
                disabled={loading}
              >
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-3" />
                      <span className="text-gray-500">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName  ? 
                              `${user.fullName}` : 
                              user.email
                            }
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.role === 'DOCTOR' && user.doctorProfile?.specialization && (
                        <div className="text-xs text-gray-500 mt-1">{user.doctorProfile.specialization}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <StatusBadge status={user.status} className="ml-2" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={user.emailVerified ? 'verified' : 'pending'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => confirmUserAction('suspend', user.id)}
                            disabled={loading}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction('activate', user.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleUserAction('resetPassword', user.id)}
                          disabled={loading}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => confirmUserAction('delete', user.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
        confirmStyle={confirmAction?.confirmStyle}
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;