import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  Filter,
  Search,
  BarChart3,
  Receipt,
  FileDown,
  FileText,
  ChevronDown
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

// Import chart components
import {
  EarningsLineChart,
  EarningsBarChart,
  PaymentMethodPieChart,
  EarningsAreaChart
} from '../../components/charts';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  return `$${parseFloat(amount).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const DoctorEarnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    pendingPayouts: 0,
    completedConsultations: 0,
    averageConsultationFee: 0
  });
  
  // Chart data
  const [chartData, setChartData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [chartGroupBy, setChartGroupBy] = useState('daily');
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadPaymentData();
    loadChartData();
  }, [selectedPeriod]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [paymentHistory, searchTerm, statusFilter]);

  // Load payment history and earnings summary
  const loadPaymentData = async () => {
    try {
      setRefreshing(true);
      
      const historyResponse = await execute(() => 
        doctorService.getPaymentHistory({ period: selectedPeriod })
      );
      
      setPaymentHistory(historyResponse || []);
      calculateEarningsSummary(historyResponse || []);
      
    } catch (error) {
      console.error('Failed to load payment data:', error);
      setPaymentHistory([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Load chart data
  const loadChartData = async () => {
    try {
      const earningsData = await execute(() => 
        doctorService.getEarningsChartData(selectedPeriod, chartGroupBy)
      );
      
      const transformedData = (earningsData || []).map(item => ({
        label: item.label,
        date: item.date,
        earnings: parseFloat(item.earnings),
        count: item.count
      }));
      
      setChartData(transformedData);
      
      const methodData = await execute(() => 
        doctorService.getPaymentMethodDistribution(selectedPeriod)
      );
      
      const transformedMethodData = (methodData || []).map(item => ({
        name: item.name,
        value: parseFloat(item.value),
        count: item.count
      }));
      
      setPaymentMethodData(transformedMethodData);
      
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setChartData([]);
      setPaymentMethodData([]);
    }
  };

  // Calculate earnings summary
  const calculateEarningsSummary = (payments) => {
    const completedPayments = payments.filter(p => 
      p.status?.toLowerCase() === 'completed'
    );

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const weeklyPayments = completedPayments.filter(p => 
      new Date(p.processedAt) >= oneWeekAgo
    );

    const monthlyPayments = completedPayments.filter(p => 
      new Date(p.processedAt) >= oneMonthAgo
    );

    const totalEarnings = completedPayments.reduce((sum, p) => 
      sum + (parseFloat(p.amount) || 0), 0
    );

    const weeklyEarnings = weeklyPayments.reduce((sum, p) => 
      sum + (parseFloat(p.amount) || 0), 0
    );

    const monthlyEarnings = monthlyPayments.reduce((sum, p) => 
      sum + (parseFloat(p.amount) || 0), 0
    );

    const pendingPayouts = payments
      .filter(p => p.status?.toLowerCase() === 'pending')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const avgFee = completedPayments.length > 0 
      ? totalEarnings / completedPayments.length 
      : 0;

    setEarningsSummary({
      totalEarnings,
      monthlyEarnings,
      weeklyEarnings,
      pendingPayouts,
      completedConsultations: completedPayments.length,
      averageConsultationFee: avgFee
    });
  };

  // Apply search and filters
  const applyFilters = () => {
    let filtered = [...paymentHistory];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id?.toString().includes(searchTerm) ||
        payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Handle chart grouping change
  const handleChartGroupByChange = (groupBy) => {
    setChartGroupBy(groupBy);
    loadChartData();
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Export earnings report
  const handleExport = async (format) => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      if (format === 'pdf') {
        await doctorService.exportEarningsPdf(selectedPeriod);
      } else if (format === 'csv') {
        await doctorService.exportEarningsCsv(selectedPeriod);
      }
      
      alert(`${format.toUpperCase()} report downloaded successfully!`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-screen overflow-y-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Earnings</h1>
          <p className="text-sm text-gray-600">Track your consultation payments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => {
              loadPaymentData();
              loadChartData();
            }}
            disabled={refreshing}
          />
          
          {/* Export Button with Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              icon={exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
            >
              Export
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
          </div>
          
          <div className="flex space-x-1">
            {['week', 'month', 'year', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'all' ? 'All' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Stats Cards - 6 columns */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.totalEarnings)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">This Month</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.monthlyEarnings)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">This Week</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.weeklyEarnings)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.pendingPayouts)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Consultations</p>
          <p className="text-lg font-bold text-gray-900">{earningsSummary.completedConsultations}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Avg. Fee</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.averageConsultationFee)}</p>
        </div>
      </div>

      {/* Charts Section - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Earnings Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Earnings Trend</h3>
            <div className="flex space-x-1">
              {['daily', 'weekly', 'monthly'].map((groupBy) => (
                <button
                  key={groupBy}
                  onClick={() => handleChartGroupByChange(groupBy)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    chartGroupBy === groupBy
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {groupBy.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <EarningsLineChart data={chartData} height={200} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
              No data
            </div>
          )}
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Methods</h3>
          {paymentMethodData.length > 0 ? (
            <PaymentMethodPieChart data={paymentMethodData} height={200} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
              No data
            </div>
          )}
        </div>

        {/* Monthly Comparison Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Monthly Comparison</h3>
          {chartData.length > 0 && chartGroupBy === 'monthly' ? (
            <EarningsBarChart data={chartData} height={200} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
              Switch to monthly
            </div>
          )}
        </div>

        {/* Cumulative Earnings Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Cumulative Earnings</h3>
          {chartData.length > 0 ? (
            <EarningsAreaChart data={chartData} height={200} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-xs">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Compact Filters and Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        {/* Filters */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b">
          <h3 className="text-sm font-semibold text-gray-900">Payment History ({filteredPayments.length})</h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payment Table - Compact */}
        {loading && !refreshing ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900">#{payment.id}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Badge variant="info" size="sm">{payment.paymentType}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-900 truncate max-w-xs">{payment.description}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                      {formatDate(payment.processedAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusBadge status={payment.status} size="sm" />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => viewPaymentDetails(payment)}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* {filteredPayments.length > 5 && (
              <div className="text-center py-2 text-xs text-gray-500 border-t">
                Showing 5 of {filteredPayments.length} payments
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Payment Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment #{selectedPayment.id}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPayment.description}
                </p>
              </div>
              <StatusBadge status={selectedPayment.status} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.paymentType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <p className="text-sm text-gray-900">{selectedPayment.paymentMethod}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processed Date
                </label>
                <p className="text-sm text-gray-900">
                  {formatDateTime(selectedPayment.processedAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Download className="w-4 h-4" />}
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorEarnings;