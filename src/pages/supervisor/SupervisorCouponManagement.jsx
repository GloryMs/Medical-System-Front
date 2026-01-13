import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  Filter,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Send,
  XCircle,
  Eye,
  Copy,
  Calendar,
  User,
  ChevronRight,
  Percent,
  Tag,
  ArrowRight
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import supervisorCouponService from '../../services/api/supervisorCouponService';
import supervisorService from '../../services/api/supervisorService';
import { toast } from 'react-toastify';

// ==================== Sub-Components ====================

const CouponStatusBadge = ({ status }) => {
  const statusConfig = {
    AVAILABLE: { color: 'bg-blue-100 text-blue-800', label: 'Available' },
    ASSIGNED: { color: 'bg-green-100 text-green-800', label: 'Assigned' },
    USED: { color: 'bg-gray-100 text-gray-800', label: 'Used' },
    EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired' },
    CANCELLED: { color: 'bg-orange-100 text-orange-800', label: 'Cancelled' }
  };
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const DiscountBadge = ({ type, value, maxAmount }) => {
  const getDisplay = () => {
    switch (type) {
      case 'PERCENTAGE': return `${value}%${maxAmount ? ` (max $${maxAmount})` : ''}`;
      case 'FIXED_AMOUNT': return `$${value}`;
      case 'FULL_COVERAGE': return '100% Coverage';
      default: return type;
    }
  };
  return (
    <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium">
      <Percent className="w-3 h-3 mr-1" />
      {getDisplay()}
    </span>
  );
};

// ==================== Main Component ====================

const SupervisorCouponManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expiringCoupons, setExpiringCoupons] = useState([]);

  // UI State
  const [activeTab, setActiveTab] = useState('all'); // all, unassigned, assigned, byPatient
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPatientFilter, setSelectedPatientFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [assignForm, setAssignForm] = useState({ patientId: '', notes: '' });

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchTerm, statusFilter, selectedPatientFilter, activeTab]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCoupons(),
        loadSummary(),
        loadPatients(),
        loadExpiringCoupons()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load coupon data');
    } finally {
      setRefreshing(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await execute(() => supervisorCouponService.getAllCoupons());
      setCoupons(response?.data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await execute(() => supervisorCouponService.getCouponSummary());
      setSummary(response?.data || {});
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await execute(() => supervisorService.getPatients());
      setPatients(response?.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadExpiringCoupons = async () => {
    try {
      const response = await execute(() => supervisorCouponService.getExpiringCoupons(30));
      setExpiringCoupons(response?.data || []);
    } catch (error) {
      console.error('Error loading expiring coupons:', error);
    }
  };

  const filterCoupons = useCallback(() => {
    let filtered = [...coupons];

    // Tab filter
    if (activeTab === 'unassigned') {
      filtered = filtered.filter(c => c.status === 'AVAILABLE' && !c.assignedPatientId);
    } else if (activeTab === 'assigned') {
      filtered = filtered.filter(c => c.status === 'ASSIGNED' && c.assignedPatientId);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.couponCode?.toLowerCase().includes(term) ||
        c.patientName?.toLowerCase().includes(term) ||
        c.assignmentNotes?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Patient filter
    if (selectedPatientFilter) {
      filtered = filtered.filter(c => c.assignedPatientId?.toString() === selectedPatientFilter);
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, statusFilter, selectedPatientFilter, activeTab]);

  // Actions
  const handleAssignCoupon = async () => {
    try {
      if (!assignForm.patientId) {
        toast.error('Please select a patient');
        return;
      }

      await execute(() => supervisorCouponService.assignCouponToPatient(
        selectedCoupon.id,
        assignForm.patientId,
        assignForm.notes
      ));

      toast.success('Coupon assigned successfully');
      setShowAssignModal(false);
      setSelectedCoupon(null);
      setAssignForm({ patientId: '', notes: '' });
      await loadAllData();
    } catch (error) {
      console.error('Error assigning coupon:', error);
      toast.error('Failed to assign coupon');
    }
  };

  const handleUnassignCoupon = async () => {
    try {
      await execute(() => supervisorCouponService.unassignCouponFromPatient(selectedCoupon.id));
      toast.success('Coupon unassigned successfully');
      setShowUnassignModal(false);
      setSelectedCoupon(null);
      await loadAllData();
    } catch (error) {
      console.error('Error unassigning coupon:', error);
      toast.error('Failed to unassign coupon');
    }
  };

  const handleSync = async () => {
    try {
      await execute(() => supervisorCouponService.syncWithAdminService());
      toast.success('Coupons synced with admin service');
      await loadAllData();
    } catch (error) {
      toast.error('Failed to sync coupons');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Patient summaries from summary data
  const patientSummaries = summary?.patientSummaries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and assign coupons to your patients for consultation payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={loadAllData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Coupons"
          value={summary?.totalCoupons || 0}
          icon={<Ticket className="w-5 h-5" />}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Available"
          value={summary?.availableCoupons || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Assigned"
          value={summary?.assignedCoupons || 0}
          icon={<Users className="w-5 h-5" />}
          iconColor="bg-indigo-100 text-indigo-600"
        />
        <StatsCard
          title="Used"
          value={summary?.usedCoupons || 0}
          icon={<Tag className="w-5 h-5" />}
          iconColor="bg-gray-100 text-gray-600"
        />
        <StatsCard
          title="Total Value"
          value={formatCurrency(summary?.totalAvailableValue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Expiring Soon Alert */}
      {expiringCoupons.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                {expiringCoupons.length} coupon{expiringCoupons.length > 1 ? 's' : ''} expiring within 30 days
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Assign these coupons to patients soon to avoid expiration.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setActiveTab('unassigned');
              }}
              className="ml-4"
            >
              View
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Coupons', count: coupons.length },
            { id: 'unassigned', label: 'Unassigned', count: coupons.filter(c => c.status === 'AVAILABLE' && !c.assignedPatientId).length },
            { id: 'assigned', label: 'Assigned', count: coupons.filter(c => c.status === 'ASSIGNED').length },
            { id: 'byPatient', label: 'By Patient', count: patientSummaries.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* By Patient View */}
      {activeTab === 'byPatient' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patientSummaries.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No patient coupon data available</p>
                </div>
              </Card>
            </div>
          ) : (
            patientSummaries.map((patient) => (
              <Card key={patient.patientId} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{patient.patientName}</h3>
                      <p className="text-xs text-gray-500">Patient ID: {patient.patientId}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatientFilter(patient.patientId.toString());
                      setActiveTab('all');
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600">Available</p>
                    <p className="text-lg font-bold text-green-700">{patient.availableCoupons || 0}</p>
                    <p className="text-xs text-green-600">{formatCurrency(patient.availableValue)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Used</p>
                    <p className="text-lg font-bold text-gray-700">{patient.usedCoupons || 0}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by code or patient name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="USED">Used</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <select
                value={selectedPatientFilter}
                onChange={(e) => setSelectedPatientFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Patients</option>
                {patients.map(p => (
                  <option key={p.id} value={p.patientId}>{p.fullName || p.patientName}</option>
                ))}
              </select>
              {selectedPatientFilter && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatientFilter('')}>
                  Clear
                </Button>
              )}
            </div>
          </Card>

          {/* Coupons Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                            Loading coupons...
                          </div>
                        ) : (
                          <div>
                            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>No coupons found</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                              <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <span className="text-sm font-mono font-medium text-gray-900">
                                  {coupon.couponCode}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(coupon.couponCode)}
                                  className="ml-2 text-gray-400 hover:text-gray-600"
                                  title="Copy code"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DiscountBadge
                            type={coupon.discountType}
                            value={coupon.discountValue}
                            maxAmount={coupon.maxDiscountAmount}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {coupon.patientName ? (
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{coupon.patientName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CouponStatusBadge status={coupon.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(coupon.expiresAt)}</div>
                          {coupon.isExpiringSoon && (
                            <span className="text-xs text-yellow-600">
                              {coupon.daysUntilExpiry} days left
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedCoupon(coupon); setShowDetailsModal(true); }}
                              className="text-gray-400 hover:text-gray-600"
                              title="View details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {coupon.status === 'AVAILABLE' && !coupon.assignedPatientId && (
                              <button
                                onClick={() => { setSelectedCoupon(coupon); setShowAssignModal(true); }}
                                className="text-blue-400 hover:text-blue-600"
                                title="Assign to patient"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            )}
                            {coupon.status === 'ASSIGNED' && coupon.assignedPatientId && (
                              <button
                                onClick={() => { setSelectedCoupon(coupon); setShowUnassignModal(true); }}
                                className="text-orange-400 hover:text-orange-600"
                                title="Unassign from patient"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
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
        </>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setSelectedCoupon(null); setAssignForm({ patientId: '', notes: '' }); }}
        title="Assign Coupon to Patient"
      >
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <Ticket className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-mono font-medium text-purple-900">{selectedCoupon?.couponCode}</span>
            </div>
            <div className="mt-2">
              <DiscountBadge
                type={selectedCoupon?.discountType}
                value={selectedCoupon?.discountValue}
                maxAmount={selectedCoupon?.maxDiscountAmount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient *
            </label>
            <select
              value={assignForm.patientId}
              onChange={(e) => setAssignForm({ ...assignForm, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.patientId}>{p.fullName || p.patientName} ({p.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
              rows={3}
              placeholder="Add notes about this assignment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setShowAssignModal(false); setSelectedCoupon(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignCoupon} disabled={loading || !assignForm.patientId}>
              <Send className="w-4 h-4 mr-2" />
              Assign Coupon
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unassign Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnassignModal}
        onClose={() => { setShowUnassignModal(false); setSelectedCoupon(null); }}
        onConfirm={handleUnassignCoupon}
        title="Unassign Coupon"
        message={`Are you sure you want to unassign coupon ${selectedCoupon?.couponCode} from ${selectedCoupon?.patientName}? The coupon will become available for assignment to another patient.`}
        confirmText="Unassign"
        confirmVariant="warning"
      />

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedCoupon(null); }}
        title="Coupon Details"
        size="lg"
      >
        {selectedCoupon && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-mono font-bold text-gray-900">{selectedCoupon.couponCode}</p>
                  <CouponStatusBadge status={selectedCoupon.status} />
                </div>
              </div>
              <button onClick={() => copyToClipboard(selectedCoupon.couponCode)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg">
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Discount</p>
                <div className="mt-1">
                  <DiscountBadge
                    type={selectedCoupon.discountType}
                    value={selectedCoupon.discountValue}
                    maxAmount={selectedCoupon.maxDiscountAmount}
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned To</p>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedCoupon.patientName || <span className="text-gray-400 italic">Unassigned</span>}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned At</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCoupon.assignedAt)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Expires</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCoupon.expiresAt)}</p>
              </div>
            </div>

            {selectedCoupon.usedAt && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Usage Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">Used At:</span>
                    <span className="ml-2 text-green-800">{formatDate(selectedCoupon.usedAt)}</span>
                  </div>
                  {selectedCoupon.usedForCaseId && (
                    <div>
                      <span className="text-green-600">Case ID:</span>
                      <span className="ml-2 text-green-800">{selectedCoupon.usedForCaseId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedCoupon.assignmentNotes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assignment Notes</p>
                <p className="text-sm text-gray-700">{selectedCoupon.assignmentNotes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedCoupon(null); }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupervisorCouponManagement;