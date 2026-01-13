import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Copy,
  Calendar,
  Percent,
  Tag,
  Gift,
  Info,
  ArrowRight,
  Eye
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientCouponService from '../../services/api/patientCouponService';
import { toast } from 'react-toastify';

// ==================== Sub-Components ====================

const CouponStatusBadge = ({ status, available }) => {
  if (available) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </span>
    );
  }
  
  const statusConfig = {
    USED: { color: 'bg-gray-100 text-gray-800', label: 'Used', icon: Tag },
    EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: Clock },
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  const Icon = config.icon || Tag;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const DiscountDisplay = ({ type, value, maxAmount, currency = 'USD' }) => {
  const getDisplay = () => {
    switch (type) {
      case 'PERCENTAGE':
        return {
          main: `${value}%`,
          sub: maxAmount ? `Max ${currency} ${maxAmount}` : 'No limit',
          color: 'from-purple-500 to-indigo-600'
        };
      case 'FIXED_AMOUNT':
        return {
          main: `${currency} ${value}`,
          sub: 'Fixed discount',
          color: 'from-green-500 to-teal-600'
        };
      case 'FULL_COVERAGE':
        return {
          main: '100%',
          sub: 'Full coverage',
          color: 'from-amber-500 to-orange-600'
        };
      default:
        return { main: value, sub: '', color: 'from-gray-500 to-gray-600' };
    }
  };
  
  const display = getDisplay();
  
  return (
    <div className={`bg-gradient-to-r ${display.color} text-white rounded-lg p-4 text-center`}>
      <p className="text-3xl font-bold">{display.main}</p>
      <p className="text-sm opacity-90">{display.sub}</p>
    </div>
  );
};

// ==================== Coupon Card Component ====================

const CouponCard = ({ coupon, onView, onCopy }) => {
  const isAvailable = coupon.available && !coupon.used;
  const isExpiringSoon = coupon.expiringSoon || coupon.daysUntilExpiry <= 7;
  
  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isAvailable ? 'border-green-200 hover:border-green-300' : 'border-gray-200 opacity-75'
    }`}>
      {/* Coupon Header */}
      <div className="relative">
        <DiscountDisplay
          type={coupon.discountType}
          value={coupon.discountValue}
          maxAmount={coupon.maxDiscountAmount}
          currency={coupon.currency}
        />
        {isExpiringSoon && isAvailable && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires soon
          </div>
        )}
      </div>
      
      {/* Coupon Body */}
      <div className="p-4">
        {/* Coupon Code */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1 mr-2">
            <Ticket className="w-4 h-4 text-gray-500 mr-2" />
            <span className="font-mono font-medium text-gray-900 text-sm">
              {coupon.couponCode}
            </span>
          </div>
          <button
            onClick={() => onCopy(coupon.couponCode)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy code"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <CouponStatusBadge status={coupon.used ? 'USED' : coupon.status} available={isAvailable} />
          {coupon.daysUntilExpiry > 0 && isAvailable && (
            <span className="text-xs text-gray-500">
              {coupon.daysUntilExpiry} days left
            </span>
          )}
        </div>
        
        {/* Expiry Date */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {coupon.used 
              ? `Used on ${new Date(coupon.usedAt).toLocaleDateString()}`
              : `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`
            }
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(coupon)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          {isAvailable && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => onCopy(coupon.couponCode)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const PatientCoupons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // UI State
  const [activeFilter, setActiveFilter] = useState('available'); // available, used, all
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchTerm, activeFilter]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCoupons(),
        loadSummary()
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
      const response = await execute(() => patientCouponService.getAllCoupons());
      setCoupons(response?.data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await execute(() => patientCouponService.getCouponSummary());
      setSummary(response?.data || {});
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const filterCoupons = () => {
    let filtered = [...coupons];

    // Filter by status
    if (activeFilter === 'available') {
      filtered = filtered.filter(c => c.available && !c.used);
    } else if (activeFilter === 'used') {
      filtered = filtered.filter(c => c.used);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => c.couponCode?.toLowerCase().includes(term));
    }

    setFilteredCoupons(filtered);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard!');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const availableCount = coupons.filter(c => c.available && !c.used).length;
  const usedCount = coupons.filter(c => c.used).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Coupons</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage your consultation discount coupons
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAllData} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Available Coupons"
          value={summary?.distributedCoupons || availableCount}
          icon={<Gift className="w-5 h-5" />}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Used Coupons"
          value={summary?.usedCoupons || usedCount}
          icon={<Tag className="w-5 h-5" />}
          iconColor="bg-gray-100 text-gray-600"
        />
        <StatsCard
          title="Total Savings"
          value={formatCurrency(summary?.totalAvailableValue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatsCard
          title="Expiring Soon"
          value={coupons.filter(c => c.expiringSoon && c.available).length}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Info Banner */}
      {availableCount > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Gift className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">
                You have {availableCount} coupon{availableCount > 1 ? 's' : ''} available!
              </h4>
              <p className="mt-1 text-sm text-green-700">
                Use them when paying for consultations to save on your medical expenses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        {[
          { id: 'available', label: 'Available', count: availableCount },
          { id: 'used', label: 'Used', count: usedCount },
          { id: 'all', label: 'All', count: coupons.length }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeFilter === filter.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      {coupons.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilter === 'available' ? 'No Available Coupons' : 
               activeFilter === 'used' ? 'No Used Coupons' : 'No Coupons Found'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {activeFilter === 'available' 
                ? 'You don\'t have any coupons available right now. Your medical supervisor may assign coupons to you.'
                : activeFilter === 'used'
                ? 'You haven\'t used any coupons yet.'
                : 'No coupons match your search.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onView={(c) => { setSelectedCoupon(c); setShowDetailsModal(true); }}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}

      {/* How to Use Section */}
      <Card title="How to Use Your Coupons">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-gray-900">Copy Coupon Code</h4>
              <p className="text-sm text-gray-500 mt-1">
                Click the copy button to copy your coupon code to clipboard.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-gray-900">Go to Payment</h4>
              <p className="text-sm text-gray-500 mt-1">
                When paying for a consultation, choose "Pay with Coupon" option.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <div className="ml-4">
              <h4 className="font-medium text-gray-900">Apply & Save</h4>
              <p className="text-sm text-gray-500 mt-1">
                Paste your code and the discount will be applied automatically.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedCoupon(null); }}
        title="Coupon Details"
        size="md"
      >
        {selectedCoupon && (
          <div className="space-y-6">
            {/* Discount Display */}
            <DiscountDisplay
              type={selectedCoupon.discountType}
              value={selectedCoupon.discountValue}
              maxAmount={selectedCoupon.maxDiscountAmount}
              currency={selectedCoupon.currency}
            />

            {/* Coupon Code */}
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4">
              <div className="flex items-center">
                <Ticket className="w-5 h-5 text-gray-500 mr-3" />
                <span className="font-mono font-bold text-lg text-gray-900">
                  {selectedCoupon.couponCode}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedCoupon.couponCode)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center">
              <CouponStatusBadge 
                status={selectedCoupon.used ? 'USED' : selectedCoupon.status} 
                available={selectedCoupon.available && !selectedCoupon.used}
              />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Assigned Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {selectedCoupon.assignedAt 
                    ? new Date(selectedCoupon.assignedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(selectedCoupon.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedCoupon.used && selectedCoupon.usedAt && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-800">Usage Information</h4>
                <p className="text-sm text-green-700 mt-1">
                  Used on {new Date(selectedCoupon.usedAt).toLocaleDateString()}
                  {selectedCoupon.usedForCaseId && ` for Case #${selectedCoupon.usedForCaseId}`}
                </p>
              </div>
            )}

            {/* Discount Description */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <Info className="w-4 h-4 inline mr-1" />
                {selectedCoupon.discountType === 'PERCENTAGE' && 
                  `This coupon gives you ${selectedCoupon.discountValue}% off your consultation fee${selectedCoupon.maxDiscountAmount ? `, up to a maximum of $${selectedCoupon.maxDiscountAmount}` : ''}.`}
                {selectedCoupon.discountType === 'FIXED_AMOUNT' && 
                  `This coupon gives you $${selectedCoupon.discountValue} off your consultation fee.`}
                {selectedCoupon.discountType === 'FULL_COVERAGE' && 
                  'This coupon covers 100% of your consultation fee.'}
              </p>
            </div>

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

export default PatientCoupons;