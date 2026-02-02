import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings,
  Eye,
  Shield,
  Ban,
  TrendingUp,
  Activity,
  DollarSign,
  Ticket,
  UserCheck,
  UserX,
  UserCog,
  BarChart3,
  Download
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';
import { toast } from 'react-toastify';

const SupervisorsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedCard, setExpandedCard] = useState(null);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);

  // Form states
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [maxPatientsLimit, setMaxPatientsLimit] = useState(30);
  const [maxActiveCasesPerPatient, setMaxActiveCasesPerPatient] = useState(3);

  useEffect(() => {
    loadSupervisors();
    loadStatistics();
  }, [statusFilter]);

  useEffect(() => {
    filterSupervisors();
  }, [supervisors, searchTerm]);

  const loadSupervisors = async () => {
    try {
      const status = statusFilter === 'ALL' ? null : statusFilter;
      const data = await execute(() => adminService.getAllSupervisors(status));
      setSupervisors(data || []);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
      toast.error('Failed to load supervisors');
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await execute(() => adminService.getSupervisorStatistics());
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filterSupervisors = () => {
    let filtered = [...supervisors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(supervisor =>
        supervisor.fullName?.toLowerCase().includes(term) ||
        supervisor.email?.toLowerCase().includes(term) ||
        supervisor.organizationName?.toLowerCase().includes(term) ||
        supervisor.licenseNumber?.toLowerCase().includes(term)
      );
    }

    setFilteredSupervisors(filtered);
  };

  const handleViewDetails = async (supervisor) => {
    try {
      const details = await execute(() => adminService.getSupervisorById(supervisor.id));
      setSelectedSupervisor(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load supervisor details:', error);
      toast.error('Failed to load supervisor details');
    }
  };

  const handleVerify = async () => {
    if (!selectedSupervisor) return;

    try {
      await execute(() =>
        adminService.verifySupervisor(selectedSupervisor.id, {
          verificationNotes: verificationNotes || undefined
        })
      );
      toast.success('Supervisor verified successfully');
      setShowVerifyModal(false);
      setVerificationNotes('');
      setSelectedSupervisor(null);
      loadSupervisors();
      loadStatistics();
    } catch (error) {
      console.error('Failed to verify supervisor:', error);
      toast.error(error.response?.data?.message || 'Failed to verify supervisor');
    }
  };

  const handleReject = async () => {
    if (!selectedSupervisor || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await execute(() =>
        adminService.rejectSupervisor(selectedSupervisor.id, rejectionReason)
      );
      toast.success('Supervisor application rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedSupervisor(null);
      loadSupervisors();
      loadStatistics();
    } catch (error) {
      console.error('Failed to reject supervisor:', error);
      toast.error(error.response?.data?.message || 'Failed to reject supervisor');
    }
  };

  const handleSuspend = async () => {
    if (!selectedSupervisor || !suspensionReason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }

    try {
      await execute(() =>
        adminService.suspendSupervisor(selectedSupervisor.id, suspensionReason)
      );
      toast.success('Supervisor suspended successfully');
      setShowSuspendModal(false);
      setSuspensionReason('');
      setSelectedSupervisor(null);
      loadSupervisors();
      loadStatistics();
    } catch (error) {
      console.error('Failed to suspend supervisor:', error);
      toast.error(error.response?.data?.message || 'Failed to suspend supervisor');
    }
  };

  const handleUpdateLimits = async () => {
    if (!selectedSupervisor) return;

    if (maxPatientsLimit <= 0 || maxActiveCasesPerPatient <= 0) {
      toast.error('Limits must be greater than 0');
      return;
    }

    try {
      await execute(() =>
        adminService.updateSupervisorLimits(selectedSupervisor.id, {
          maxPatientsLimit: parseInt(maxPatientsLimit),
          maxActiveCasesPerPatient: parseInt(maxActiveCasesPerPatient)
        })
      );
      toast.success('Supervisor limits updated successfully');
      setShowLimitsModal(false);
      setSelectedSupervisor(null);
      loadSupervisors();
    } catch (error) {
      console.error('Failed to update limits:', error);
      toast.error(error.response?.data?.message || 'Failed to update limits');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadSupervisors();
      return;
    }

    try {
      const results = await execute(() => adminService.searchSupervisors(searchTerm));
      setSupervisors(results || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      VERIFIED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      SUSPENDED: { color: 'bg-gray-100 text-gray-800', icon: Ban, label: 'Suspended' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getCapacityColor = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Users className="w-8 h-8 mr-3 text-primary-600" />
                  Supervisor Management
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage medical supervisors, verify applications, and monitor performance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    loadSupervisors();
                    loadStatistics();
                  }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Supervisors"
              value={statistics.totalSupervisors}
              icon={<Users className="w-6 h-6" />}
              className="bg-gradient-to-br from-blue-50 to-blue-100"
            />

            <StatsCard
              title="Pending Verification"
              value={statistics.pendingSupervisors}
              icon={<Clock className="w-6 h-6" />}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100"
              trend={statistics.pendingSupervisors > 0 ? {
                value: statistics.pendingSupervisors,
                label: 'Awaiting review'
              } : null}
            />

            <StatsCard
              title="Active Supervisors"
              value={statistics.activeSupervisors}
              icon={<UserCheck className="w-6 h-6" />}
              className="bg-gradient-to-br from-green-50 to-green-100"
            />

            <StatsCard
              title="Patients Managed"
              value={statistics.totalUniquePatientsManaged}
              icon={<Activity className="w-6 h-6" />}
              className="bg-gradient-to-br from-purple-50 to-purple-100"
            />
          </div>
        )}

        {/* Additional Statistics Row */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.averageCapacityUtilization?.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.availableCoupons}</p>
                </div>
                <Ticket className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${statistics.totalAmountPaid?.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Patients/Supervisor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.averagePatientsPerSupervisor?.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Pending Verification Alert */}
        {statistics && statistics.pendingSupervisors > 0 && (
          <AlertCard
            type="warning"
            title="Pending Verifications"
            message={`There are ${statistics.pendingSupervisors} supervisor applications awaiting verification.`}
            className="mb-6"
          />
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, organization, or license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                {(searchTerm || statusFilter !== 'ALL') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      loadSupervisors();
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Supervisors List */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredSupervisors.length > 0 ? (
              <div className="space-y-4">
                {filteredSupervisors.map((supervisor) => (
                  <div
                    key={supervisor.id}
                    className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {supervisor.fullName}
                                </h3>
                                {getStatusBadge(supervisor.verificationStatus)}
                                {supervisor.isAvailable && supervisor.verificationStatus === 'VERIFIED' && (
                                  <Badge variant="success" size="sm">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{supervisor.organizationName}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{supervisor.licenseNumber}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{supervisor.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{supervisor.phoneNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {supervisor.city}, {supervisor.country}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Joined {formatDate(supervisor.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Capacity and Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Patient Capacity</p>
                              <p className={`text-lg font-bold ${getCapacityColor(supervisor.activePatientCount, supervisor.maxPatientsLimit)}`}>
                                {supervisor.activePatientCount} / {supervisor.maxPatientsLimit}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min((supervisor.activePatientCount / supervisor.maxPatientsLimit) * 100, 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Max Cases per Patient</p>
                              <p className="text-lg font-bold text-gray-900">
                                {supervisor.maxActiveCasesPerPatient}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Available Coupons</p>
                              <p className="text-lg font-bold text-gray-900">
                                {supervisor.availableCouponCount}
                              </p>
                            </div>
                          </div>

                          {/* Verification Info */}
                          {supervisor.verificationStatus === 'VERIFIED' && supervisor.verifiedAt && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                              <p className="text-green-800">
                                <strong>Verified:</strong> {formatDateTime(supervisor.verifiedAt)}
                                {supervisor.verificationNotes && (
                                  <span className="ml-2">- {supervisor.verificationNotes}</span>
                                )}
                              </p>
                            </div>
                          )}

                          {supervisor.verificationStatus === 'REJECTED' && supervisor.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                              <p className="text-red-800">
                                <strong>Rejection Reason:</strong> {supervisor.rejectionReason}
                              </p>
                            </div>
                          )}

                          {supervisor.verificationStatus === 'SUSPENDED' && supervisor.rejectionReason && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                              <p className="text-gray-800">
                                <strong>Suspension Reason:</strong> {supervisor.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleViewDetails(supervisor)}
                          >
                            View Details
                          </Button>

                          {supervisor.verificationStatus === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button
                                variant="success"
                                size="sm"
                                icon={<CheckCircle className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedSupervisor(supervisor);
                                  setShowVerifyModal(true);
                                }}
                              >
                                Verify
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<XCircle className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedSupervisor(supervisor);
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {supervisor.verificationStatus === 'VERIFIED' && (
                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Settings className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedSupervisor(supervisor);
                                  setMaxPatientsLimit(supervisor.maxPatientsLimit);
                                  setMaxActiveCasesPerPatient(supervisor.maxActiveCasesPerPatient);
                                  setShowLimitsModal(true);
                                }}
                              >
                                Update Limits
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Ban className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedSupervisor(supervisor);
                                  setShowSuspendModal(true);
                                }}
                              >
                                Suspend
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'No supervisors found'
                    : 'No supervisors yet'
                  }
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Supervisor applications will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSupervisor && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSupervisor(null);
          }}
          title="Supervisor Details"
          size="xl"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-gray-900">{selectedSupervisor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedSupervisor.verificationStatus)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{selectedSupervisor.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{selectedSupervisor.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-gray-900">{selectedSupervisor.organizationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization Type</p>
                  <p className="text-gray-900">{selectedSupervisor.organizationType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">License Number</p>
                  <p className="text-gray-900">{selectedSupervisor.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-gray-900">{selectedSupervisor.isAvailable ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <p className="text-gray-900">
                {selectedSupervisor.address}<br />
                {selectedSupervisor.city}, {selectedSupervisor.country}
              </p>
            </div>

            {/* Capacity and Limits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Limits</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupervisor.activePatientCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Max Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupervisor.maxPatientsLimit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Max Cases/Patient</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupervisor.maxActiveCasesPerPatient}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-gray-900">{formatDateTime(selectedSupervisor.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-gray-900">{formatDateTime(selectedSupervisor.updatedAt)}</p>
                </div>
                {selectedSupervisor.verifiedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verified At</p>
                    <p className="text-gray-900">{formatDateTime(selectedSupervisor.verifiedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Verify Modal */}
      <FormModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedSupervisor(null);
          setVerificationNotes('');
        }}
        title="Verify Supervisor"
        onSubmit={handleVerify}
        loading={loading}
      >
        <div className="space-y-4">
          <AlertCard
            type="info"
            title="Verify Supervisor Application"
            message={`You are about to verify ${selectedSupervisor?.fullName}. This will grant them access to the supervisor portal.`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter any notes about the verification..."
            />
          </div>
        </div>
      </FormModal>

      {/* Reject Modal */}
      <FormModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedSupervisor(null);
          setRejectionReason('');
        }}
        title="Reject Supervisor Application"
        onSubmit={handleReject}
        loading={loading}
      >
        <div className="space-y-4">
          <AlertCard
            type="warning"
            title="Reject Application"
            message={`You are about to reject ${selectedSupervisor?.fullName}'s application. Please provide a reason.`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter the reason for rejection..."
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Suspend Modal */}
      <FormModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedSupervisor(null);
          setSuspensionReason('');
        }}
        title="Suspend Supervisor"
        onSubmit={handleSuspend}
        loading={loading}
      >
        <div className="space-y-4">
          <AlertCard
            type="error"
            title="Suspend Supervisor Account"
            message={`You are about to suspend ${selectedSupervisor?.fullName}. This will revoke their access to the supervisor portal.`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suspension Reason *
            </label>
            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter the reason for suspension..."
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Update Limits Modal */}
      <FormModal
        isOpen={showLimitsModal}
        onClose={() => {
          setShowLimitsModal(false);
          setSelectedSupervisor(null);
        }}
        title="Update Supervisor Limits"
        onSubmit={handleUpdateLimits}
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Patients Limit *
            </label>
            <input
              type="number"
              value={maxPatientsLimit}
              onChange={(e) => setMaxPatientsLimit(e.target.value)}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 10-100. Current: {selectedSupervisor?.maxPatientsLimit}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Active Cases per Patient *
            </label>
            <input
              type="number"
              value={maxActiveCasesPerPatient}
              onChange={(e) => setMaxActiveCasesPerPatient(e.target.value)}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 1-10. Current: {selectedSupervisor?.maxActiveCasesPerPatient}
            </p>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default SupervisorsManagement;
