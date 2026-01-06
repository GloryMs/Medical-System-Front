import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Search, Eye, Filter, Calendar, AlertCircle, XCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { fetchCases, selectSupervisorCases, fetchPatients, selectSupervisorPatients } from '../../store/slices/supervisorSlice';
import supervisorService from '../../services/api/supervisorService';

const SupervisorCases = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cases = useSelector(selectSupervisorCases) || [];
  const patients = useSelector(selectSupervisorPatients) || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    patientId: '',
    status: ''
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both cases and patients in parallel
      const [casesResult, patientsResult] = await Promise.all([
        dispatch(fetchCases()),
        dispatch(fetchPatients())
      ]);

      if (fetchCases.rejected.match(casesResult)) {
        setError(casesResult.payload || 'Failed to load cases');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dispatch(fetchCases(filters));

      if (fetchCases.rejected.match(result)) {
        setError(result.payload || 'Failed to filter cases');
      }
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ patientId: '', status: '' });
    loadData();
  };

  const handleCancelCase = async () => {
    if (!selectedCase || !cancelReason.trim()) {
      return;
    }

    try {
      setCancelLoading(true);
      await supervisorService.cancelCase(selectedCase.id, cancelReason);

      // Reload cases
      await loadData();

      // Close modal and reset
      setShowCancelModal(false);
      setSelectedCase(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel case:', error);
      setError('Failed to cancel case. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const filteredCases = (cases || []).filter(c => {
    const matchesSearch = c.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group cases by status for stats
  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING' || c.status === 'SUBMITTED').length,
    inProgress: cases.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
    completed: cases.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED').length
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Cases</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and track cases for your patients</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <Button variant="ghost" size="sm" onClick={loadData}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case title or patient name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              icon={<Filter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {(filters.patientId || filters.status) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={filters.patientId}
                  onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
                >
                  <option value="">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.patientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.length > 0 ? (
          filteredCases.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{c.caseTitle}</h3>
                        <StatusBadge status={c.status} size="sm" />
                        {c.urgencyLevel && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(c.urgencyLevel)}`}>
                            {c.urgencyLevel}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Case ID:</span> #{c.id}
                        </p>
                        <p>
                          <span className="font-medium">Patient:</span> {c.patientName}
                        </p>
                        {c.requiredSpecialization && (
                          <p>
                            <span className="font-medium">Specialization:</span> {c.requiredSpecialization}
                          </p>
                        )}
                        {c.consultationFee && (
                          <p>
                            <span className="font-medium">Consultation Fee:</span> ${c.consultationFee.toFixed(2)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Submitted: {new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.submittedAt && c.submittedAt !== c.createdAt && (
                            <span>Updated: {new Date(c.submittedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye />}
                    onClick={() => navigate(`/app/supervisor/cases/${c.id}`)}
                  >
                    View Details
                  </Button>

                  {(c.status === 'PENDING' || c.status === 'SUBMITTED') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<XCircle />}
                      onClick={() => openCancelModal(c)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No cases found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filters.patientId || filters.status
                ? 'Try adjusting your search or filters'
                : 'Cases will appear here once you submit them for your patients'}
            </p>
          </Card>
        )}
      </div>

      {/* Cancel Case Modal */}
      {showCancelModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Cancel Case</h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedCase(null);
                    setCancelReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  You are about to cancel: <span className="font-semibold">{selectedCase.caseTitle}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedCase(null);
                    setCancelReason('');
                  }}
                  disabled={cancelLoading}
                >
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancelCase}
                  disabled={!cancelReason.trim() || cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupervisorCases;
