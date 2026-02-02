import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MoreVertical,
  Copy,
  Send,
  Layers,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings,
  Percent,
  Tag,
  UserCheck,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminCouponService from '../../services/api/adminCouponService';
import { toast } from 'react-toastify';

// ==================== Sub-Components ====================

const CouponStatusBadge = ({ status }) => {
  const statusConfig = {
    CREATED: { color: 'bg-blue-100 text-blue-800', label: 'Created' },
    DISTRIBUTED: { color: 'bg-green-100 text-green-800', label: 'Distributed' },
    USED: { color: 'bg-gray-100 text-gray-800', label: 'Used' },
    EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired' },
    CANCELLED: { color: 'bg-orange-100 text-orange-800', label: 'Cancelled' },
    SUSPENDED: { color: 'bg-yellow-100 text-yellow-800', label: 'Suspended' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const DiscountTypeBadge = ({ type, value, maxAmount }) => {
  const getDisplay = () => {
    switch (type) {
      case 'PERCENTAGE':
        return `${value}%${maxAmount ? ` (max $${maxAmount})` : ''}`;
      case 'FIXED_AMOUNT':
        return `$${value}`;
      case 'FULL_COVERAGE':
        return '100% Coverage';
      default:
        return type;
    }
  };

  return (
    <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs font-medium">
      <Percent className="w-3 h-3 mr-1" />
      {getDisplay()}
    </span>
  );
};

const BeneficiaryBadge = ({ type }) => {
  const config = {
    MEDICAL_SUPERVISOR: { color: 'bg-indigo-100 text-indigo-800', label: 'Supervisor', icon: UserCheck },
    PATIENT: { color: 'bg-teal-100 text-teal-800', label: 'Patient', icon: Users }
  };

  const { color, label, icon: Icon } = config[type] || { color: 'bg-gray-100 text-gray-800', label: type, icon: Users };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const pageSizeOptions = [10, 20, 50, 100];
  const startItem = currentPage * pageSize + 1;
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
      // Always show first page
      pages.push(0);

      // Calculate start and end of visible pages
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      // Add ellipsis if needed
      if (start > 1) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 2) pages.push('...');

      // Always show last page
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
          <span className="font-medium">{totalElements}</span> results
        </span>
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500"
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
          disabled={currentPage === 0}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
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
                className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {page + 1}
              </button>
            )
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const AdminCouponManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [expiringCoupons, setExpiringCoupons] = useState([]);

  // UI State
  const [activeTab, setActiveTab] = useState('coupons'); // coupons, batches, analytics
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination State
  const [couponPage, setCouponPage] = useState(0);
  const [couponPageSize, setCouponPageSize] = useState(20);
  const [couponTotalElements, setCouponTotalElements] = useState(0);
  const [couponTotalPages, setCouponTotalPages] = useState(0);

  const [batchPage, setBatchPage] = useState(0);
  const [batchPageSize, setBatchPageSize] = useState(20);
  const [batchTotalElements, setBatchTotalElements] = useState(0);
  const [batchTotalPages, setBatchTotalPages] = useState(0);

  // Form State - matches API request format
  const [createForm, setCreateForm] = useState({
    couponCode: '', // Optional - auto-generated if not provided
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    currency: 'USD',
    beneficiaryType: 'MEDICAL_SUPERVISOR',
    beneficiaryId: '',
    expiresAt: '', // ISO datetime format
    isTransferable: true,
    notes: '',
    autoDistribute: false
  });

  const [batchForm, setBatchForm] = useState({
    batchCodePrefix: '', // Optional - auto-generated if not provided
    totalCoupons: 10,
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    currency: 'USD',
    beneficiaryType: 'MEDICAL_SUPERVISOR',
    beneficiaryId: '',
    expiryDays: 180, // Days until expiration (1-730)
    isTransferable: true,
    notes: '',
    autoDistribute: false
  });

  const [distributeForm, setDistributeForm] = useState({
    beneficiaryType: 'MEDICAL_SUPERVISOR',
    beneficiaryId: '',
    notes: '',
    sendNotification: true
  });

  const [cancelForm, setCancelForm] = useState({
    reason: '',
    sendNotification: true
  });

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload coupons when page changes
  useEffect(() => {
    loadCoupons(couponPage, couponPageSize);
  }, [couponPage, couponPageSize]);

  // Reload batches when page changes
  useEffect(() => {
    loadBatches(batchPage, batchPageSize);
  }, [batchPage, batchPageSize]);

  // Reload coupons when filters change (reset to first page)
  useEffect(() => {
    if (couponPage === 0) {
      loadCoupons(0, couponPageSize);
    } else {
      setCouponPage(0); // This will trigger the page change effect
    }
  }, [statusFilter, beneficiaryFilter]);

  // Debounced search - reload after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (couponPage === 0) {
        loadCoupons(0, couponPageSize);
      } else {
        setCouponPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    filterCoupons();
  }, [coupons]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCoupons(),
        loadBatches(),
        loadSummary(),
        loadSupervisors(),
        loadExpiringCoupons()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load coupon data');
    } finally {
      setRefreshing(false);
    }
  };

  const loadCoupons = async (page = couponPage, size = couponPageSize) => {
    try {
      const filters = {
        page,
        size,
        status: statusFilter || undefined,
        beneficiaryType: beneficiaryFilter || undefined,
        couponCode: searchTerm || undefined
      };
      const response = await execute(() => adminCouponService.getAllCoupons(filters));

      // API returns paginated response: { success, data: { content, totalElements, totalPages, ... } }
      if (response?.data?.content) {
        setCoupons(response.data.content);
        setCouponTotalElements(response.data.totalElements || 0);
        setCouponTotalPages(response.data.totalPages || 0);
      } else if (response?.content) {
        // Direct paginated response
        setCoupons(response.content);
        setCouponTotalElements(response.totalElements || 0);
        setCouponTotalPages(response.totalPages || 0);
      } else {
        // Fallback for array response
        const couponsData = response?.data || response || [];
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
        setCouponTotalElements(couponsData.length);
        setCouponTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const loadBatches = async (page = batchPage, size = batchPageSize) => {
    try {
      const filters = { page, size };
      const response = await execute(() => adminCouponService.getCouponBatches(filters));

      // API returns paginated response: { success, data: { content, totalElements, totalPages, ... } }
      if (response?.data?.content) {
        setBatches(response.data.content);
        setBatchTotalElements(response.data.totalElements || 0);
        setBatchTotalPages(response.data.totalPages || 0);
      } else if (response?.content) {
        // Direct paginated response
        setBatches(response.content);
        setBatchTotalElements(response.totalElements || 0);
        setBatchTotalPages(response.totalPages || 0);
      } else {
        // Fallback for array response
        const batchesData = response?.data || response || [];
        setBatches(Array.isArray(batchesData) ? batchesData : []);
        setBatchTotalElements(batchesData.length);
        setBatchTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await execute(() => adminCouponService.getCouponSummary());
      // API returns { success: true, data: { ... } }
      setSummary(response || {});
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadSupervisors = async () => {
    try {
      const response = await execute(() => adminCouponService.getMedicalSupervisors());
      // API returns { success: true, data: [...] }
      const supervisorsData = response || response?.data || [];
      setSupervisors(Array.isArray(supervisorsData) ? supervisorsData : []);
    } catch (error) {
      console.error('Error loading supervisors:', error);
    }
  };

  const loadExpiringCoupons = async () => {
    try {
      const response = await execute(() => adminCouponService.getExpiringCoupons(30));
      // API returns { success: true, data: [...] }
      const expiringData = response || response?.data || [];
      setExpiringCoupons(Array.isArray(expiringData) ? expiringData : []);
    } catch (error) {
      console.error('Error loading expiring coupons:', error);
    }
  };

  const filterCoupons = useCallback(() => {
    let filtered = [...coupons];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.couponCode?.toLowerCase().includes(term) ||
        c.beneficiaryName?.toLowerCase().includes(term) ||
        c.notes?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (beneficiaryFilter) {
      filtered = filtered.filter(c => c.beneficiaryType === beneficiaryFilter);
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, statusFilter, beneficiaryFilter]);

  // Actions
  const handleCreateCoupon = async () => {
    try {
      // Validate discount type
      if (!createForm.discountType) {
        toast.error('Please select a discount type', { autoClose: 10000 });
        return;
      }

      // Validate discount value (not required for FULL_COVERAGE)
      if (createForm.discountType !== 'FULL_COVERAGE' &&
          (createForm.discountValue === '' || createForm.discountValue === null ||
           createForm.discountValue === undefined || isNaN(parseFloat(createForm.discountValue)))) {
        toast.error('Please enter a valid discount value', { autoClose: 10000 });
        return;
      }

      // Validate expiration date
      if (!createForm.expiresAt) {
        toast.error('Please select an expiration date', { autoClose: 10000 });
        return;
      }

      // Validate beneficiary type
      if (!createForm.beneficiaryType) {
        toast.error('Please select a beneficiary type', { autoClose: 10000 });
        return;
      }

      // Build request payload matching API spec
      const requestData = {
        discountType: createForm.discountType,
        discountValue: createForm.discountType === 'FULL_COVERAGE' ? 100 : parseFloat(createForm.discountValue),
        currency: createForm.currency || 'USD',
        beneficiaryType: createForm.beneficiaryType,
        expiresAt: createForm.expiresAt,
        isTransferable: createForm.isTransferable,
        autoDistribute: createForm.autoDistribute
      };

      // Optional fields
      if (createForm.couponCode?.trim()) {
        requestData.couponCode = createForm.couponCode.trim();
      }
      if (createForm.maxDiscountAmount && createForm.discountType === 'PERCENTAGE') {
        requestData.maxDiscountAmount = parseFloat(createForm.maxDiscountAmount);
      }
      if (createForm.beneficiaryId) {
        requestData.beneficiaryId = parseInt(createForm.beneficiaryId);
      }
      if (createForm.notes?.trim()) {
        requestData.notes = createForm.notes.trim();
      }

      await execute(() => adminCouponService.createCoupon(requestData));

      toast.success('Coupon created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      await loadCoupons();
      await loadSummary();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleCreateBatch = async () => {
    try {
      // Validate total coupons
      if (!batchForm.totalCoupons || batchForm.totalCoupons < 1 || batchForm.totalCoupons > 1000) {
        toast.error('Please enter a valid quantity (1-1000)', { autoClose: 10000 });
        return;
      }

      // Validate discount type
      if (!batchForm.discountType) {
        toast.error('Please select a discount type', { autoClose: 10000 });
        return;
      }

      // Validate discount value (not required for FULL_COVERAGE)
      if (batchForm.discountType !== 'FULL_COVERAGE' &&
          (batchForm.discountValue === '' || batchForm.discountValue === null ||
           batchForm.discountValue === undefined || isNaN(parseFloat(batchForm.discountValue)))) {
        toast.error('Please enter a valid discount value', { autoClose: 10000 });
        return;
      }

      // Validate expiry days
      if (!batchForm.expiryDays || batchForm.expiryDays < 1 || batchForm.expiryDays > 730) {
        toast.error('Please enter valid expiry days (1-730)', { autoClose: 10000 });
        return;
      }

      // Validate beneficiary type
      if (!batchForm.beneficiaryType) {
        toast.error('Please select a beneficiary type', { autoClose: 10000 });
        return;
      }

      // Build request payload matching API spec
      const requestData = {
        totalCoupons: parseInt(batchForm.totalCoupons),
        discountType: batchForm.discountType,
        discountValue: batchForm.discountType === 'FULL_COVERAGE' ? 100 : parseFloat(batchForm.discountValue),
        currency: batchForm.currency || 'USD',
        beneficiaryType: batchForm.beneficiaryType,
        expiryDays: parseInt(batchForm.expiryDays),
        isTransferable: batchForm.isTransferable,
        autoDistribute: batchForm.autoDistribute
      };

      // Optional fields
      if (batchForm.batchCodePrefix?.trim()) {
        requestData.batchCodePrefix = batchForm.batchCodePrefix.trim();
      }
      if (batchForm.maxDiscountAmount && batchForm.discountType === 'PERCENTAGE') {
        requestData.maxDiscountAmount = parseFloat(batchForm.maxDiscountAmount);
      }
      if (batchForm.beneficiaryId) {
        requestData.beneficiaryId = parseInt(batchForm.beneficiaryId);
      }
      if (batchForm.notes?.trim()) {
        requestData.notes = batchForm.notes.trim();
      }

      await execute(() => adminCouponService.createCouponBatch(requestData));

      toast.success(`Batch of ${batchForm.totalCoupons} coupons created successfully`);
      setShowBatchModal(false);
      resetBatchForm();
      await loadBatches();
      await loadCoupons();
      await loadSummary();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon batch');
    }
  };

  const handleDistribute = async () => {
    try {
      // Validate beneficiary type
      if (!distributeForm.beneficiaryType) {
        toast.error('Please select a beneficiary type', { autoClose: 10000 });
        return;
      }

      // Validate beneficiary ID
      if (!distributeForm.beneficiaryId) {
        toast.error('Please select a beneficiary', { autoClose: 10000 });
        return;
      }

      // Build distribution request matching API spec
      const distributionData = {
        beneficiaryType: distributeForm.beneficiaryType,
        beneficiaryId: parseInt(distributeForm.beneficiaryId),
        sendNotification: distributeForm.sendNotification
      };

      // Optional notes
      if (distributeForm.notes?.trim()) {
        distributionData.notes = distributeForm.notes.trim();
      }

      if (selectedBatch) {
        await execute(() => adminCouponService.distributeBatch(selectedBatch.id, distributionData));
        toast.success('Batch distributed successfully');
      } else if (selectedCoupon) {
        await execute(() => adminCouponService.distributeCoupon(selectedCoupon.id, distributionData));
        toast.success('Coupon distributed successfully');
      }

      setShowDistributeModal(false);
      setSelectedCoupon(null);
      setSelectedBatch(null);
      resetDistributeForm();
      await loadCoupons();
      await loadBatches();
      await loadSummary();
    } catch (error) {
      console.error('Error distributing:', error);
      toast.error(error.response?.data?.message || 'Failed to distribute');
    }
  };

  const handleCancel = async () => {
    try {
      // Validate cancellation reason
      if (!cancelForm.reason?.trim()) {
        toast.error('Please provide a cancellation reason', { autoClose: 10000 });
        return;
      }

      // Build cancellation request matching API spec
      const cancelData = {
        reason: cancelForm.reason.trim(),
        sendNotification: cancelForm.sendNotification
      };

      if (selectedBatch) {
        await execute(() => adminCouponService.cancelBatch(selectedBatch.id, cancelData));
        toast.success('Batch cancelled successfully');
      } else if (selectedCoupon) {
        await execute(() => adminCouponService.cancelCoupon(selectedCoupon.id, cancelData));
        toast.success('Coupon cancelled successfully');
      }

      setShowCancelModal(false);
      setSelectedCoupon(null);
      setSelectedBatch(null);
      resetCancelForm();
      await loadCoupons();
      await loadBatches();
      await loadSummary();
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminCouponService.exportCoupons({
        status: statusFilter,
        beneficiaryType: beneficiaryFilter
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `coupons_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export coupons');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Reset Forms
  const resetCreateForm = () => {
    setCreateForm({
      couponCode: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      currency: 'USD',
      beneficiaryType: 'MEDICAL_SUPERVISOR',
      beneficiaryId: '',
      expiresAt: '',
      isTransferable: true,
      notes: '',
      autoDistribute: false
    });
  };

  const resetBatchForm = () => {
    setBatchForm({
      batchCodePrefix: '',
      totalCoupons: 10,
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      currency: 'USD',
      beneficiaryType: 'MEDICAL_SUPERVISOR',
      beneficiaryId: '',
      expiryDays: 180,
      isTransferable: true,
      notes: '',
      autoDistribute: false
    });
  };

  const resetDistributeForm = () => {
    setDistributeForm({
      beneficiaryType: 'MEDICAL_SUPERVISOR',
      beneficiaryId: '',
      notes: '',
      sendNotification: true
    });
  };

  const resetCancelForm = () => {
    setCancelForm({
      reason: '',
      sendNotification: true
    });
  };

  // Pagination Handlers
  const handleCouponPageChange = (newPage) => {
    if (newPage >= 0 && newPage < couponTotalPages) {
      setCouponPage(newPage);
    }
  };

  const handleCouponPageSizeChange = (newSize) => {
    setCouponPageSize(newSize);
    setCouponPage(0); // Reset to first page when page size changes
  };

  const handleBatchPageChange = (newPage) => {
    if (newPage >= 0 && newPage < batchTotalPages) {
      setBatchPage(newPage);
    }
  };

  const handleBatchPageSizeChange = (newSize) => {
    setBatchPageSize(newSize);
    setBatchPage(0); // Reset to first page when page size changes
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, distribute, and manage discount coupons for supervisors and patients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBatchModal(true)}
          >
            <Layers className="w-4 h-4 mr-2" />
            Create Batch
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
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
          value={(summary?.createdCoupons || 0) + (summary?.distributedCoupons || 0)}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="bg-green-100 text-green-600"
          trend={summary?.distributedCoupons > 0 ? { value: summary.distributedCoupons, label: 'distributed', positive: true } : null}
        />
        <StatsCard
          title="Used"
          value={summary?.usedCoupons || 0}
          icon={<Tag className="w-5 h-5" />}
          iconColor="bg-gray-100 text-gray-600"
        />
        <StatsCard
          title="Expiring Soon"
          value={summary?.expiringSoonCoupons || expiringCoupons.length || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="bg-yellow-100 text-yellow-600"
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
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {expiringCoupons.length} coupon{expiringCoupons.length > 1 ? 's' : ''} expiring within 30 days
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Consider notifying beneficiaries or extending expiration dates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'batches', label: 'Batches', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
              <tab.icon className={`w-5 h-5 mr-2 ${
                activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <>
          {/* Filters */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by code, beneficiary, or notes..."
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
                <option value="CREATED">Created</option>
                <option value="DISTRIBUTED">Distributed</option>
                <option value="USED">Used</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={beneficiaryFilter}
                onChange={(e) => setBeneficiaryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Beneficiaries</option>
                <option value="MEDICAL_SUPERVISOR">Supervisors</option>
                <option value="PATIENT">Patients</option>
              </select>
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
                      Beneficiary
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
                            <Button
                              variant="primary"
                              size="sm"
                              className="mt-3"
                              onClick={() => setShowCreateModal(true)}
                            >
                              Create First Coupon
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-white" />
                              </div>
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
                              {coupon.batchCode && (
                                <p className="text-xs text-gray-500">
                                  Batch: {coupon.batchCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DiscountTypeBadge
                            type={coupon.discountType}
                            value={coupon.discountValue}
                            maxAmount={coupon.maxDiscountAmount}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {coupon.beneficiaryType ? (
                            <div>
                              <BeneficiaryBadge type={coupon.beneficiaryType} />
                              {coupon.beneficiaryName && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {coupon.beneficiaryName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CouponStatusBadge status={coupon.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(coupon.expiresAt)}
                          </div>
                          {coupon.isExpiringSoon && (
                            <span className="text-xs text-yellow-600">
                              {coupon.daysUntilExpiry} days left
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCoupon(coupon);
                                setShowDetailsModal(true);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="View details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {coupon.status === 'CREATED' && (
                              <button
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowDistributeModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-600"
                                title="Distribute"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            )}
                            {['CREATED', 'DISTRIBUTED'].includes(coupon.status) && (
                              <button
                                onClick={() => {
                                  setSelectedCoupon(coupon);
                                  setShowCancelModal(true);
                                }}
                                className="text-red-400 hover:text-red-600"
                                title="Cancel"
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
            {/* Coupon Pagination */}
            <Pagination
              currentPage={couponPage}
              totalPages={couponTotalPages}
              totalElements={couponTotalElements}
              pageSize={couponPageSize}
              onPageChange={handleCouponPageChange}
              onPageSizeChange={handleCouponPageSizeChange}
            />
          </Card>
        </>
      )}

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No batches created yet</p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowBatchModal(true)}
                      >
                        Create First Batch
                      </Button>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {batch.batchName || batch.batchCode}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {batch.batchCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {batch.distributedCount || 0} / {batch.totalCoupons || batch.quantity}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${((batch.distributedCount || 0) / (batch.totalCoupons || batch.quantity)) * 100}%`
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DiscountTypeBadge
                          type={batch.discountType}
                          value={batch.discountValue}
                          maxAmount={batch.maxDiscountAmount}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CouponStatusBadge status={batch.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(batch.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/app/admin/coupons/batches/${batch.id}`)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View coupons"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {batch.status === 'CREATED' && (
                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowDistributeModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-600"
                              title="Distribute batch"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          )}
                          {['CREATED', 'PARTIALLY_DISTRIBUTED'].includes(batch.status) && (
                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowCancelModal(true);
                              }}
                              className="text-red-400 hover:text-red-600"
                              title="Cancel batch"
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
          {/* Batch Pagination */}
          <Pagination
            currentPage={batchPage}
            totalPages={batchTotalPages}
            totalElements={batchTotalElements}
            pageSize={batchPageSize}
            onPageChange={handleBatchPageChange}
            onPageSizeChange={handleBatchPageSizeChange}
          />
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Coupon Usage Overview">
            <div className="h-72">
              {(() => {
                const pieData = [
                  { name: 'Created', value: summary?.createdCoupons || 0, color: '#3B82F6' },
                  { name: 'Distributed', value: summary?.distributedCoupons || 0, color: '#10B981' },
                  { name: 'Used', value: summary?.usedCoupons || 0, color: '#6B7280' },
                  { name: 'Expired', value: summary?.expiredCoupons || 0, color: '#EF4444' },
                  { name: 'Cancelled', value: summary?.cancelledCoupons || 0, color: '#F59E0B' }
                ].filter(item => item.value > 0);

                const totalCoupons = pieData.reduce((sum, item) => sum + item.value, 0);

                if (totalCoupons === 0) {
                  return (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                        <p>No coupon data available</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} coupons`, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span className="text-sm text-gray-600">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{summary?.createdCoupons || 0}</p>
                  <p className="text-xs text-gray-500">Created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{summary?.distributedCoupons || 0}</p>
                  <p className="text-xs text-gray-500">Distributed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{summary?.usedCoupons || 0}</p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Monthly Trends">
            <div className="h-72">
              {(() => {
                // Generate monthly trend data from summary or create sample structure
                const monthlyData = summary?.monthlyTrends || (() => {
                  // Generate last 6 months data based on available summary
                  const months = [];
                  const now = new Date();
                  for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    months.push({
                      month: monthName,
                      created: i === 0 ? (summary?.createdCoupons || 0) : 0,
                      distributed: i === 0 ? (summary?.distributedCoupons || 0) : 0,
                      used: i === 0 ? (summary?.usedCoupons || 0) : 0
                    });
                  }
                  return months;
                })();

                const hasData = monthlyData.some(m => m.created > 0 || m.distributed > 0 || m.used > 0);

                if (!hasData) {
                  return (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                        <p>No monthly data available</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-gray-600 capitalize">{value}</span>
                        )}
                      />
                      <Bar dataKey="created" name="Created" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="distributed" name="Distributed" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="used" name="Used" fill="#6B7280" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-600">Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-600">Distributed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-500"></div>
                    <span className="text-gray-600">Used</span>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">Last 6 months</span>
              </div>
            </div>
          </Card>

          <Card title="Top Supervisors by Coupon Usage" className="lg:col-span-2">
            <div className="space-y-4">
              {supervisors.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No supervisor data available</p>
                </div>
              ) : (
                supervisors.slice(0, 5).map((supervisor, index) => (
                  <div key={supervisor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{supervisor.fullName}</p>
                        <p className="text-xs text-gray-500">{supervisor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {supervisor.couponCount || 0} coupons
                      </p>
                      <p className="text-xs text-gray-500">
                        {supervisor.usedCount || 0} used
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetCreateForm();
        }}
        title="Create New Coupon"
        size="lg"
      >
        <div className="space-y-4">
          {/* Coupon Code (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code (Optional)
            </label>
            <input
              type="text"
              value={createForm.couponCode}
              onChange={(e) => setCreateForm({ ...createForm, couponCode: e.target.value })}
              placeholder="Auto-generated if not provided"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={createForm.discountType}
                onChange={(e) => setCreateForm({ ...createForm, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FULL_COVERAGE">Full Coverage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                value={createForm.discountValue}
                onChange={(e) => setCreateForm({ ...createForm, discountValue: e.target.value })}
                placeholder={createForm.discountType === 'PERCENTAGE' ? '1-100' : '50.00'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={createForm.discountType === 'FULL_COVERAGE'}
                min={createForm.discountType === 'PERCENTAGE' ? 1 : 0}
                max={createForm.discountType === 'PERCENTAGE' ? 100 : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount Amount
              </label>
              <input
                type="number"
                value={createForm.maxDiscountAmount}
                onChange={(e) => setCreateForm({ ...createForm, maxDiscountAmount: e.target.value })}
                placeholder="Cap for percentage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={createForm.discountType !== 'PERCENTAGE'}
              />
            </div>
          </div>

          {/* Beneficiary Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Type *
              </label>
              <select
                value={createForm.beneficiaryType}
                onChange={(e) => setCreateForm({ ...createForm, beneficiaryType: e.target.value, beneficiaryId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="MEDICAL_SUPERVISOR">Medical Supervisor</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary (Optional)
              </label>
              <select
                value={createForm.beneficiaryId}
                onChange={(e) => setCreateForm({ ...createForm, beneficiaryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Can distribute later</option>
                {createForm.beneficiaryType === 'MEDICAL_SUPERVISOR' && supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiration and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date *
              </label>
              <input
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={createForm.currency}
                onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.isTransferable}
                onChange={(e) => setCreateForm({ ...createForm, isTransferable: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Transferable between patients</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.autoDistribute}
                onChange={(e) => setCreateForm({ ...createForm, autoDistribute: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={!createForm.beneficiaryId}
              />
              <span className="text-sm text-gray-700">Auto-distribute after creation</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes about this coupon..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowCreateModal(false);
              resetCreateForm();
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCoupon} disabled={loading}>
              Create Coupon
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Batch Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          resetBatchForm();
        }}
        title="Create Coupon Batch"
        size="lg"
      >
        <div className="space-y-4">
          {/* Batch Identification */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code Prefix (Optional)
              </label>
              <input
                type="text"
                value={batchForm.batchCodePrefix}
                onChange={(e) => setBatchForm({ ...batchForm, batchCodePrefix: e.target.value })}
                placeholder="Auto-generated if not provided"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Coupons * (1-1000)
              </label>
              <input
                type="number"
                value={batchForm.totalCoupons}
                onChange={(e) => setBatchForm({ ...batchForm, totalCoupons: parseInt(e.target.value) || 1 })}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={batchForm.discountType}
                onChange={(e) => setBatchForm({ ...batchForm, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FULL_COVERAGE">Full Coverage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                value={batchForm.discountValue}
                onChange={(e) => setBatchForm({ ...batchForm, discountValue: e.target.value })}
                placeholder={batchForm.discountType === 'PERCENTAGE' ? '1-100' : '50.00'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={batchForm.discountType === 'FULL_COVERAGE'}
                min={batchForm.discountType === 'PERCENTAGE' ? 1 : 0}
                max={batchForm.discountType === 'PERCENTAGE' ? 100 : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount Amount
              </label>
              <input
                type="number"
                value={batchForm.maxDiscountAmount}
                onChange={(e) => setBatchForm({ ...batchForm, maxDiscountAmount: e.target.value })}
                placeholder="Cap for percentage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={batchForm.discountType !== 'PERCENTAGE'}
              />
            </div>
          </div>

          {/* Beneficiary Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Type *
              </label>
              <select
                value={batchForm.beneficiaryType}
                onChange={(e) => setBatchForm({ ...batchForm, beneficiaryType: e.target.value, beneficiaryId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="MEDICAL_SUPERVISOR">Medical Supervisor</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary (Optional)
              </label>
              <select
                value={batchForm.beneficiaryId}
                onChange={(e) => setBatchForm({ ...batchForm, beneficiaryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Can distribute later</option>
                {batchForm.beneficiaryType === 'MEDICAL_SUPERVISOR' && supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiry and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Days * (1-730)
              </label>
              <input
                type="number"
                value={batchForm.expiryDays}
                onChange={(e) => setBatchForm({ ...batchForm, expiryDays: parseInt(e.target.value) || 1 })}
                min="1"
                max="730"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={batchForm.currency}
                onChange={(e) => setBatchForm({ ...batchForm, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={batchForm.isTransferable}
                onChange={(e) => setBatchForm({ ...batchForm, isTransferable: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Transferable between patients</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={batchForm.autoDistribute}
                onChange={(e) => setBatchForm({ ...batchForm, autoDistribute: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={!batchForm.beneficiaryId}
              />
              <span className="text-sm text-gray-700">Auto-distribute after creation</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={batchForm.notes}
              onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes about this batch..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowBatchModal(false);
              resetBatchForm();
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateBatch} disabled={loading}>
              Create {batchForm.totalCoupons} Coupons
            </Button>
          </div>
        </div>
      </Modal>

      {/* Distribute Modal */}
      <Modal
        isOpen={showDistributeModal}
        onClose={() => {
          setShowDistributeModal(false);
          setSelectedCoupon(null);
          setSelectedBatch(null);
          resetDistributeForm();
        }}
        title={`Distribute ${selectedBatch ? 'Batch' : 'Coupon'}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {selectedBatch
              ? `Distribute all ${selectedBatch.totalCoupons || selectedBatch.availableCoupons} coupons in batch "${selectedBatch.batchCode}" to:`
              : `Distribute coupon ${selectedCoupon?.couponCode} to:`}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beneficiary Type *
            </label>
            <select
              value={distributeForm.beneficiaryType}
              onChange={(e) => setDistributeForm({ ...distributeForm, beneficiaryType: e.target.value, beneficiaryId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="MEDICAL_SUPERVISOR">Medical Supervisor</option>
              <option value="PATIENT">Patient</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select {distributeForm.beneficiaryType === 'MEDICAL_SUPERVISOR' ? 'Supervisor' : 'Patient'} *
            </label>
            <select
              value={distributeForm.beneficiaryId}
              onChange={(e) => setDistributeForm({ ...distributeForm, beneficiaryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select...</option>
              {distributeForm.beneficiaryType === 'MEDICAL_SUPERVISOR' && supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={distributeForm.notes}
              onChange={(e) => setDistributeForm({ ...distributeForm, notes: e.target.value })}
              rows={2}
              placeholder="Distribution notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={distributeForm.sendNotification}
              onChange={(e) => setDistributeForm({ ...distributeForm, sendNotification: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Send notification to beneficiary</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowDistributeModal(false);
              setSelectedCoupon(null);
              setSelectedBatch(null);
              resetDistributeForm();
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDistribute} disabled={loading || !distributeForm.beneficiaryId}>
              <Send className="w-4 h-4 mr-2" />
              Distribute
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedCoupon(null);
          setSelectedBatch(null);
          resetCancelForm();
        }}
        onConfirm={handleCancel}
        title={`Cancel ${selectedBatch ? 'Batch' : 'Coupon'}`}
        message={
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {selectedBatch
                ? `Are you sure you want to cancel all coupons in batch "${selectedBatch.batchCode}"? This action cannot be undone.`
                : `Are you sure you want to cancel coupon ${selectedCoupon?.couponCode}? This action cannot be undone.`}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelForm.reason}
                onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                rows={3}
                placeholder="Provide a reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cancelForm.sendNotification}
                onChange={(e) => setCancelForm({ ...cancelForm, sendNotification: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Send notification to beneficiary</span>
            </label>
          </div>
        }
        confirmText="Cancel Coupon"
        confirmVariant="danger"
        disabled={!cancelForm.reason?.trim()}
      />

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCoupon(null);
        }}
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
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {selectedCoupon.couponCode}
                  </p>
                  <CouponStatusBadge status={selectedCoupon.status} />
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(selectedCoupon.couponCode)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Discount</p>
                <div className="mt-1">
                  <DiscountTypeBadge
                    type={selectedCoupon.discountType}
                    value={selectedCoupon.discountValue}
                    maxAmount={selectedCoupon.maxDiscountAmount}
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Beneficiary</p>
                <div className="mt-1">
                  {selectedCoupon.beneficiaryType ? (
                    <>
                      <BeneficiaryBadge type={selectedCoupon.beneficiaryType} />
                      <p className="text-sm text-gray-700 mt-1">{selectedCoupon.beneficiaryName}</p>
                    </>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCoupon.createdAt)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Expires</p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(selectedCoupon.expiresAt)}
                  {selectedCoupon.isExpiringSoon && (
                    <span className="ml-2 text-yellow-600 text-xs">
                      ({selectedCoupon.daysUntilExpiry} days left)
                    </span>
                  )}
                </p>
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

            {selectedCoupon.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-700">{selectedCoupon.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowDetailsModal(false);
                setSelectedCoupon(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCouponManagement;