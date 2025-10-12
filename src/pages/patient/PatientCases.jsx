import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Stethoscope,
  Lock, 
  AlertCircle,
  ArrowRight,
  Activity,
  TrendingUp
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import toast from '../../utils/toast';

const PatientCases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [cases, setCases] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [filteredCases, setFilteredCases] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Load data on component mount
  useEffect(() => {
    loadCases();
  }, []);

  // Filter cases when search term or filters change
  useEffect(() => {
    loadSubscriptionStatus();
    filterCases();
  }, [cases, searchTerm, statusFilter, urgencyFilter]);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await execute(() => patientService.getSubscriptionStatus());
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const loadCases = async () => {
    try {
      const data = await execute(() => patientService.getCases());
      setCases(data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleCreateCase = () => {
    if (!subscriptionStatus?.isActive) {
      toast.warning('Active subscription required to create cases', {
        position: 'top-center',
        autoClose: 5000,
        onClick: () => navigate('/app/patient/subscription')
      });
      return;
    }
    navigate('/app/patient/cases/create');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterCases = () => {
    let filtered = [...cases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.urgencyLevel?.toLowerCase() === urgencyFilter.toLowerCase());
    }

    setFilteredCases(filtered);
  };

  const handleViewMedicalReport = async (medicalReportFileLink) => {
      try {
        await patientService.viewMedicalReport(medicalReportFileLink);
      } catch (error) {
        console.error('Failed to view medical report:', error);
        alert('Failed to view medical report:. Please try again.');
      }
  };

  const handleDeleteCase = async () => {
    if (!selectedCase) return;
    
    try {
      await execute(() => patientService.deleteCase(selectedCase.id));
      setCases(prev => prev.filter(c => c.id !== selectedCase.id));
      setShowDeleteModal(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  // Calculate stats - using same structure as PatientDashboard
  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(c.status)).length,
    completedCases: cases.filter(c => ['COMPLETED', 'CLOSED'].includes(c.status)).length,
    upcomingAppointments: 0 // This would need to be calculated from appointments data
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Cases</h1>
          <p className="mt-1 text-sm text-gray-600">
            Submit and manage your medical consultation cases
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!subscriptionStatus?.isActive ? (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
              <Lock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800 font-medium">
                Subscription Required
              </span>
              <Button
                size="sm"
                variant="warning"
                onClick={() => navigate('/app/patient/subscription')}
              >
                Subscribe Now
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreateCase}
            >
              Create New Case
            </Button>
          )}
        </div>
      </div>

      {/* Subscription Warning Banner */}
      {!subscriptionStatus?.isActive && (
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Active Subscription Required
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                To submit new medical cases and consult with doctors, you need an active subscription. 
                Subscribe now to unlock all features.
              </p>
              <Button
                size="sm"
                variant="warning"
                onClick={() => navigate('/app/patient/subscription')}
              >
                View Subscription Plans
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards - Exact copy from PatientDashboard.jsx */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Cases"
          value={stats.totalCases}
          icon={<FileText className="w-6 h-6" />}
          change="+2 this month"
          changeType="increase"
        />
        
        <StatsCard
          title="Active Cases"
          value={stats.activeCases}
          icon={<Activity className="w-6 h-6" />}
          change="2 in progress"
          changeType="neutral"
        />
        
        <StatsCard
          title="Completed Cases"
          value={stats.completedCases}
          icon={<CheckCircle className="w-6 h-6" />}
          change="+1 this week"
          changeType="increase"
        />
        
        <StatsCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={<Calendar className="w-6 h-6" />}
          change="Next: Tomorrow"
          changeType="neutral"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Cases List */}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : cases.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases yet</h3>
          <p className="text-gray-600 mb-6">
            {subscriptionStatus?.isActive 
              ? "Start by creating your first medical case"
              : "Subscribe to create and manage your medical cases"
            }
          </p>
          {subscriptionStatus?.isActive ? (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreateCase}
            >
              Create Your First Case
            </Button>
          ) : (
            <Button
              variant="warning"
              onClick={() => navigate('/app/patient/subscription')}
            >
              View Subscription Plans
            </Button>
          )}
        </Card>
      ) : 
      (
      <Card>
        <div className="space-y-4">
          {loading && !cases.length ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                  ? 'No cases found'
                  : 'No cases yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Submit your first medical consultation case'
                }
              </p>
              {!(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/app/patient/cases/create')}
                >
                  Create New Case
                </Button>
              )}
            </div>
          ) : (
            filteredCases.map((case_) => (
              <div key={case_.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {case_.caseTitle}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {case_.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <StatusBadge status={case_.status} />
                        <PriorityBadge priority={case_.urgencyLevel} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Stethoscope className="w-4 h-4" />
                        <span>{case_.requiredSpecialization}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>ID: {case_.id}</span>
                      </div>
                    </div>

                    {/* Assigned Doctor */}
                    {case_.assignedDoctor && (
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Assigned to: Dr. {case_.assignedDoctor.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link to={`/app/patient/cases/${case_.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                      >
                        View
                      </Button>
                    </Link>

                    {case_.status === 'SUBMITTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => navigate(`/patient/cases/${case_.id}/edit`)}
                      >
                        Edit
                      </Button>
                    )}

                    {case_.status === 'CLOSED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => handleViewMedicalReport(case_.medicalReportFileLink)}
                      >
                        View Medical Report
                      </Button>
                    )}

                    {['SUBMITTED', 'REJECTED', 'PENDING'].includes(case_.status) && (
                      <Button
                        variant="error"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedCase(case_);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      )
    }

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCase(null);
        }}
        onConfirm={handleDeleteCase}
        title="Delete Case"
        message={`Are you sure you want to delete "${selectedCase?.caseTitle}"? This action cannot be undone.`}
        confirmText="Delete Case"
        type="error"
        isLoading={loading}
      />
    </div>
  );
};

export default PatientCases;