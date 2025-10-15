import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Calendar,
  Stethoscope,
  Lock, 
  AlertCircle,
  Activity,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Download,
  User
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/Modal';
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
  const [viewMode, setViewMode] = useState('cards');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadCases();
  }, []);

  // Filter cases when dependencies change
  useEffect(() => {
    loadSubscriptionStatus();
    filterCases();
  }, [cases, searchTerm, statusFilter, urgencyFilter, sortField, sortDirection]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.action-menu')) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filterCases = () => {
    let filtered = [...cases];

    if (searchTerm) {
      filtered = filtered.filter(case_ =>
        case_.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.id?.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => 
        case_.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(case_ => 
        case_.urgencyLevel?.toLowerCase() === urgencyFilter.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      let compareResult = 0;

      switch (sortField) {
        case 'createdAt':
          compareResult = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'caseTitle':
          compareResult = (a.caseTitle || '').localeCompare(b.caseTitle || '');
          break;
        case 'status':
          compareResult = (a.status || '').localeCompare(b.status || '');
          break;
        case 'urgencyLevel':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          compareResult = (urgencyOrder[a.urgencyLevel?.toLowerCase()] || 0) - 
                         (urgencyOrder[b.urgencyLevel?.toLowerCase()] || 0);
          break;
        case 'requiredSpecialization':
          compareResult = (a.requiredSpecialization || '').localeCompare(
            b.requiredSpecialization || ''
          );
          break;
        default:
          compareResult = new Date(a.createdAt) - new Date(b.createdAt);
      }

      return sortDirection === 'asc' ? compareResult : -compareResult;
    });

    setFilteredCases(filtered);
  };

  const handleDownloadPdf = (medicalReportFileLink) => {
    window.open(medicalReportFileLink, '_blank');
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

  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => 
      ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(c.status)
    ).length,
    completedCases: cases.filter(c => 
      ['COMPLETED', 'CLOSED'].includes(c.status)
    ).length,
    upcomingAppointments: 0
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };

  const renderCardActions = (caseItem) => {
    return (
      <div className="flex items-center gap-2">
        <Link to={`/app/patient/cases/${caseItem.id}`}>
          <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>
            View
          </Button>
        </Link>

        {caseItem.status === 'SUBMITTED' && (
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/patient/cases/${caseItem.id}/edit`)}
          >
            Edit
          </Button>
        )}

        {caseItem.status === 'CLOSED' && (
          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => handleDownloadPdf(caseItem.medicalReportFileLink)}
          >
            View Report
          </Button>
        )}

        {['SUBMITTED', 'REJECTED', 'PENDING'].includes(caseItem.status) && (
          <Button
            variant="error"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              setSelectedCase(caseItem);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </Button>
        )}
      </div>
    );
  };

  const renderTableActions = (caseItem) => {
    const isOpen = openActionMenu === caseItem.id;
    
    return (
      <div className="relative action-menu">
        <button
          onClick={() => setOpenActionMenu(isOpen ? null : caseItem.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <Link 
              to={`/app/patient/cases/${caseItem.id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpenActionMenu(null)}
            >
              <Eye className="w-4 h-4 mr-3" />
              View Details
            </Link>

            {caseItem.status === 'SUBMITTED' && (
              <button
                onClick={() => {
                  navigate(`/patient/cases/${caseItem.id}/edit`);
                  setOpenActionMenu(null);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Case
              </button>
            )}

            {caseItem.status === 'CLOSED' && (
              <button
                onClick={() => {
                  handleDownloadPdf(caseItem.medicalReportFileLink);
                  setOpenActionMenu(null);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-3" />
                View Report
              </button>
            )}

            {['SUBMITTED', 'REJECTED', 'PENDING'].includes(caseItem.status) && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setShowDeleteModal(true);
                    setOpenActionMenu(null);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Case
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
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
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
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

      {/* Stats Cards */}
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

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                <option value="closed">Closed</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card View */}
      {viewMode === 'cards' && (
        <>
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
                  : "Subscribe to create and manage your medical cases"}
              </p>
              {subscriptionStatus?.isActive ? (
                <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleCreateCase}>
                  Create Your First Case
                </Button>
              ) : (
                <Button variant="warning" onClick={() => navigate('/app/patient/subscription')}>
                  View Subscription Plans
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <div className="space-y-4">
                {filteredCases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredCases.map((caseItem) => (
                    <div key={caseItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {caseItem.caseTitle}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {caseItem.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <StatusBadge status={caseItem.status} />
                              <PriorityBadge priority={caseItem.urgencyLevel} />
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="w-4 h-4" />
                              <span>{caseItem.requiredSpecialization}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(caseItem.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>ID: {caseItem.id}</span>
                            </div>
                          </div>

                          {caseItem.assignedDoctor && (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Assigned to: Dr. {caseItem.assignedDoctor.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {renderCardActions(caseItem)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
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
                  : "Subscribe to create and manage your medical cases"}
              </p>
              {subscriptionStatus?.isActive ? (
                <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleCreateCase}>
                  Create Your First Case
                </Button>
              ) : (
                <Button variant="warning" onClick={() => navigate('/app/patient/subscription')}>
                  View Subscription Plans
                </Button>
              )}
            </Card>
          ) : filteredCases.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('caseTitle')}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                        >
                          <span>Case Title</span>
                          <SortIcon field="caseTitle" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('requiredSpecialization')}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                        >
                          <span>Specialization</span>
                          <SortIcon field="requiredSpecialization" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                        >
                          <span>Status</span>
                          <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('urgencyLevel')}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                        >
                          <span>Urgency</span>
                          <SortIcon field="urgencyLevel" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                        >
                          <span>Created Date</span>
                          <SortIcon field="createdAt" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-center w-20">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {caseItem.caseTitle}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              ID: {caseItem.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                            {caseItem.requiredSpecialization}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={caseItem.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={caseItem.urgencyLevel} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(caseItem.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 w-20">
                          <div className="flex justify-center">
                            {renderTableActions(caseItem)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredCases.length}</span> of{' '}
                  <span className="font-medium">{cases.length}</span> cases
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Delete Modal */}
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