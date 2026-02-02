import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  DollarSign,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  Receipt,
  User,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  FileText,
  MoreVertical,
  Ban,
  RotateCcw,
  ExternalLink,
  Star,
  Shield,
  Activity,
  Mail,
  Phone,
  MapPin,
  BarChart3
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';

// Validation schema for refund
const refundSchema = yup.object({
  amount: yup.number()
    .required('Refund amount is required')
    .positive('Amount must be positive')
    .max(yup.ref('maxAmount'), 'Cannot exceed payment amount'),
  reason: yup.string()
    .required('Refund reason is required')
    .min(10, 'Reason must be at least 10 characters'),
  type: yup.string()
    .required('Refund type is required')
    .oneOf(['full', 'partial'], 'Invalid refund type'),
  notifyUser: yup.boolean()
});

const PaymentManagement = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const navigate = useNavigate();

  // State management
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  const [consultationPayments, setConsultationPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalRefunds: 0,
    monthlyGrowth: 0,
    averageTransactionValue: 0
  });

  // Refund form
  const {
    register: registerRefund,
    handleSubmit: handleRefundSubmit,
    formState: { errors: refundErrors },
    reset: resetRefund,
    watch: watchRefund,
    setValue: setRefundValue
  } = useForm({
    resolver: yupResolver(refundSchema)
  });

  useEffect(() => {
    loadPayments();
    loadSubscriptionPayments();
    loadConsultationPayments();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterType, filterDateRange, payments]);

  const loadPayments = async () => {
    try {
      const filters = {};
      if (filterStatus !== 'ALL') filters.status = filterStatus;
      if (filterType !== 'ALL') filters.type = filterType;
      if (filterDateRange !== 'ALL') filters.dateRange = filterDateRange;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const response = await execute(() => adminService.getAllPayments(filters));
      if (response) {
        const paymentsData = response || [];
        setPayments(paymentsData);
        calculatePaymentStats(paymentsData);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
      setPayments([]);
    }
  };

  const loadSubscriptionPayments = async () => {
    try {
      const response = await execute(() => adminService.getSubscriptionPayments());
      if (response) {
        setSubscriptionPayments(response || []);
      }
    } catch (error) {
      console.error('Failed to load subscription payments:', error);
    }
  };

  const loadConsultationPayments = async () => {
    try {
      const response = await execute(() => adminService.getConsultationPayments());
      if (response) {
        setConsultationPayments(response || []);
      }
    } catch (error) {
      console.error('Failed to load consultation payments:', error);
    }
  };

  const calculatePaymentStats = (paymentsData) => {
    if (!paymentsData || paymentsData.length === 0) {
      setStats({
        totalPayments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        totalRefunds: 0,
        monthlyGrowth: 0,
        averageTransactionValue: 0
      });
      return;
    }

    // Calculate total payments count
    const totalPayments = paymentsData.length;

    // Calculate total revenue (sum of completed payments)
    const totalRevenue = paymentsData
      .filter(p => p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate pending payments count
    const pendingPayments = paymentsData.filter(p => p.status.toLowerCase() === 'pending').length;

    // Calculate total refunds
    const totalRefunds = paymentsData
      .filter(p => p.refundedAmount)
      .reduce((sum, p) => sum + (p.refundedAmount || 0), 0);

    // Calculate average transaction value
    const averageTransactionValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Calculate monthly growth (comparing this month vs last month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRevenue = paymentsData
      .filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= thisMonthStart && (p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'success');
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const lastMonthRevenue = paymentsData
      .filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd && (p.status.toLowerCase() === 'completed' 
        || p.status.toLowerCase() === 'success');
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthlyGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    setStats({
      totalPayments,
      totalRevenue,
      pendingPayments,
      totalRefunds,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10, // Round to 1 decimal
      averageTransactionValue
    });
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.transactionId?.toLowerCase().includes(term) ||
        payment.payerName?.toLowerCase().includes(term) ||
        payment.payerEmail?.toLowerCase().includes(term) ||
        payment.description?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(payment => payment.type === filterType);
    }

    // Date range filter
    if (filterDateRange !== 'ALL') {
      const now = new Date();
      let dateThreshold;
      
      switch (filterDateRange) {
        case 'TODAY':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'WEEK':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'MONTH':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'QUARTER':
          const quarter = Math.floor(now.getMonth() / 3);
          dateThreshold = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          dateThreshold = null;
      }
      
      if (dateThreshold) {
        filtered = filtered.filter(payment => 
          new Date(payment.createdAt) >= dateThreshold
        );
      }
    }

    setFilteredPayments(filtered);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundValue('maxAmount', payment.amount);
    setRefundValue('amount', payment.amount);
    setRefundValue('type', 'full');
    setShowRefundModal(true);
  };

  const processRefund = async (data) => {
    try {
      const refundData = {
        paymentId: selectedPayment.id,
        amount: data.amount,
        reason: data.reason,
        type: data.type,
        notifyUser: data.notifyUser,
        processedBy: user.id
      };

      const response = await execute(() => adminService.processRefund(refundData));
      if (response.success) {
        setShowRefundModal(false);
        resetRefund();
        loadPayments();
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const handleBulkAction = (action) => {
    // Implementation for bulk actions if needed
    console.log(`Bulk ${action} action - to be implemented`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'declined':
        return 'error';
      case 'refunded':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'subscription':
        return <Star className="w-4 h-4" />;
      case 'consultation':
        return <Activity className="w-4 h-4" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PaymentDetailModal = ({ payment, isOpen, onClose }) => {
    if (!isOpen || !payment) return null;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="lg">
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                payment.status === 'completed' ? 'bg-green-100 text-green-600' :
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {payment.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                 payment.status === 'pending' ? <Clock className="w-5 h-5" /> :
                 <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{formatCurrency(payment.amount)}</h3>
                <p className="text-sm text-gray-500">Transaction ID: {payment.transactionId}</p>
              </div>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{payment.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-medium">{payment.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway:</span>
                  <span className="font-medium">{payment.gateway || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{formatDate(payment.processedAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{payment.payerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{payment.payerEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID:</span>
                  <span className="font-medium">{payment.userId || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {payment.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {payment.description}
              </p>
            </div>
          )}

          {/* Refund Information */}
          {payment.refundedAmount && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Refund Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-700">Refunded Amount:</span>
                  <span className="font-medium ml-2">{formatCurrency(payment.refundedAmount)}</span>
                </div>
                <div>
                  <span className="text-red-700">Refund Date:</span>
                  <span className="font-medium ml-2">{formatDate(payment.refundedAt)}</span>
                </div>
              </div>
              {payment.refundReason && (
                <div className="mt-2">
                  <span className="text-red-700 text-sm">Reason:</span>
                  <p className="text-sm text-red-800 mt-1">{payment.refundReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {payment.receiptUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(payment.receiptUrl, '_blank')}
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  View Receipt
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {payment.status === 'completed' && !payment.refundedAmount && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClose();
                    handleRefund(payment);
                  }}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Process Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const RefundModal = ({ payment, isOpen, onClose }) => {
    if (!isOpen || !payment) return null;

    const watchedType = watchRefund('type');
    const watchedAmount = watchRefund('amount');

    return (
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Process Refund"
        onSubmit={handleRefundSubmit(processRefund)}
        submitText="Process Refund"
        submitVariant="danger"
        loading={loading}
      >
        <div className="space-y-4">
          {/* Payment Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{payment.payerName}</p>
                <p className="text-sm text-gray-500">{payment.transactionId}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="full"
                  {...registerRefund('type')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Full Refund</p>
                  <p className="text-sm text-gray-500">{formatCurrency(payment.amount)}</p>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="partial"
                  {...registerRefund('type')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Partial Refund</p>
                  <p className="text-sm text-gray-500">Custom amount</p>
                </div>
              </label>
            </div>
            {refundErrors.type && (
              <p className="mt-1 text-sm text-red-600">{refundErrors.type.message}</p>
            )}
          </div>

          {/* Refund Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                max={payment.amount}
                disabled={watchedType === 'full'}
                {...registerRefund('amount')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="0.00"
              />
            </div>
            {refundErrors.amount && (
              <p className="mt-1 text-sm text-red-600">{refundErrors.amount.message}</p>
            )}
          </div>

          {/* Refund Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason *
            </label>
            <textarea
              rows={3}
              {...registerRefund('reason')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a detailed reason for this refund..."
            />
            {refundErrors.reason && (
              <p className="mt-1 text-sm text-red-600">{refundErrors.reason.message}</p>
            )}
          </div>

          {/* Notify User */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...registerRefund('notifyUser')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Send notification email to customer
            </label>
          </div>

          {/* Warning */}
          <AlertCard type="warning">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  This action cannot be undone. The refund will be processed immediately and 
                  funds will be returned to the customer's original payment method.
                </p>
              </div>
            </div>
          </AlertCard>
        </div>
      </FormModal>
    );
  };

  // Filter and get the current dataset
  const getCurrentPayments = () => {
    switch (activeTab) {
      case 'subscriptions':
        return subscriptionPayments;
      case 'consultations':
        return consultationPayments;
      default:
        return filteredPayments;
    }
  };

  const currentPayments = getCurrentPayments();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/app/admin/payment-analytics')}
            icon={<BarChart3 className="w-4 h-4" />}
            variant="primary"
          >
            Analytics
          </Button>
          <Button
            onClick={() => {
              loadPayments();
              loadSubscriptionPayments();
              loadConsultationPayments();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
          trend={stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(stats.monthlyGrowth)}%`}
        />
        <StatsCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={<Receipt className="w-8 h-8" />}
          color="blue"
        />
        <StatsCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<Clock className="w-8 h-8" />}
          color="yellow"
        />
        <StatsCard
          title="Total Refunds"
          value={formatCurrency(stats.totalRefunds)}
          icon={<RotateCcw className="w-8 h-8" />}
          color="red"
        />
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Payments', count: payments.length },
              { key: 'subscriptions', label: 'Subscriptions', count: subscriptionPayments.length },
              { key: 'consultations', label: 'Consultations', count: consultationPayments.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.label}</span>
                <Badge variant="outline">{tab.count}</Badge>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="consultation">Consultation</option>
            <option value="refund">Refund</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last Week</option>
            <option value="MONTH">Last Month</option>
            <option value="QUARTER">Last Quarter</option>
          </select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-gray-500">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : currentPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Receipt className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL' || filterDateRange !== 'ALL'
                          ? 'Try adjusting your filters to see more results.'
                          : 'No payment records available yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 p-2 rounded-full ${
                          getStatusColor(payment.status) === 'success' ? 'bg-green-100 text-green-600' :
                          getStatusColor(payment.status) === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          getStatusColor(payment.status) === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getTypeIcon(payment.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.transactionId || `#${payment.id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description || payment.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.payerName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.payerEmail || `User ID: ${payment.userId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.refundedAmount && (
                          <div className="text-red-600">
                            -{formatCurrency(payment.refundedAmount)} refunded
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(payment.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {payment.type || 'Payment'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={payment.status} 
                        variant={getStatusColor(payment.status)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{formatDate(payment.processedAt)}</div>
                        {payment.refundedAt && (
                          <div className="text-red-600">
                            Refunded: {formatDate(payment.refundedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {payment.status === 'completed' && !payment.refundedAmount && (
                          <button
                            onClick={() => handleRefund(payment)}
                            className="text-red-600 hover:text-red-900"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        
                        {payment.receiptUrl && (
                          <button
                            onClick={() => window.open(payment.receiptUrl, '_blank')}
                            className="text-green-600 hover:text-green-900"
                            title="View Receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
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

        {/* Pagination could be added here */}
        {currentPayments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {currentPayments.length} payment(s)
              </div>
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(
                  currentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPayment(null);
        }}
      />

      <RefundModal
        payment={selectedPayment}
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedPayment(null);
          resetRefund();
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction?.action) {
            confirmAction.action();
          }
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        confirmStyle={confirmAction?.confirmStyle}
        loading={loading}
      />
    </div>
  );
};

export default PaymentManagement;