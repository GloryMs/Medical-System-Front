import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  CreditCard,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Database,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Filter,
  Search,
  Stethoscope,
  Ticket,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Bell,
  ChevronRight,
  Zap,
  Globe,
  MessageSquare,
  PieChart as PieChartIcon,
  Target,
  Award,
  Heart,
  Briefcase,
  ExternalLink
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
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';
import adminCouponService from '../../services/api/adminCouponService';
import { toast } from 'react-toastify';

// ==================== Sub-Components ====================

const MetricCard = ({ title, value, icon: Icon, iconBg, trend, trendValue, subtitle, onClick, loading }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        )}
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend && (
      <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
        {trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendValue}
        </span>
        <span className="text-xs text-gray-400 ml-1">vs last period</span>
      </div>
    )}
  </div>
);

const QuickActionButton = ({ icon: Icon, label, count, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-50 hover:bg-gray-100 text-gray-700',
    primary: 'bg-primary-50 hover:bg-primary-100 text-primary-700',
    warning: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700',
    success: 'bg-green-50 hover:bg-green-100 text-green-700'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${variants[variant]}`}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          variant === 'danger' ? 'bg-red-200 text-red-800' :
          variant === 'warning' ? 'bg-yellow-200 text-yellow-800' :
          'bg-gray-200 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

const ActivityItem = ({ icon: Icon, iconBg, title, description, time, onClick }) => (
  <div
    className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className={`p-2 rounded-lg ${iconBg}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
      <p className="text-xs text-gray-500 truncate">{description}</p>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

const TaskItem = ({ priority, title, description, time, onClick }) => {
  const priorityStyles = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  };

  return (
    <div
      className={`border-l-4 ${priorityStyles[priority]} p-3 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'success'} size="sm">
          {priority}
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mt-2">{time}</p>
    </div>
  );
};

const SystemHealthIndicator = ({ name, status, icon: Icon, details }) => {
  const isHealthy = status === 'healthy' || status === 'operational';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isHealthy ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`w-4 h-4 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          {details && <p className="text-xs text-gray-500">{details}</p>}
        </div>
      </div>
      <div className={`flex items-center ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${isHealthy ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <span className="text-xs font-medium capitalize">{status}</span>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const NewAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [caseAnalytics, setCaseAnalytics] = useState(null);
  const [couponSummary, setCouponSummary] = useState(null);
  const [supervisorStats, setSupervisorStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingSupervisors, setPendingSupervisors] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fixed date range: 1-Apr-2025 to now
  const getAnalyticsDateRange = () => {
    const startDate = new Date('2025-04-01T00:00:00').toISOString();
    const endDate = new Date().toISOString();
    return { startDate, endDate };
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Get date range for analytics (1-Apr-2025 to now)
      const { startDate, endDate } = getAnalyticsDateRange();

      // Load all dashboard data in parallel
      const results = await Promise.allSettled([
        execute(() => adminService.getDashboardStats()),
        execute(() => adminService.getSystemMetrics(selectedPeriod)),
        execute(() => adminService.getPaymentAnalytics(startDate, endDate)),
        execute(() => adminService.getUserGrowthAnalytics(selectedPeriod)),
        execute(() => adminService.getCaseAnalytics(startDate, endDate)),
        execute(() => adminCouponService.getCouponSummary()),
        execute(() => adminService.getSupervisorStatistics()),
        execute(() => adminService.getPendingDoctors()),
        execute(() => adminService.getPendingSupervisors()),
        execute(() => adminService.getAllComplaints({ status: 'OPEN', size: 5 })),
        execute(() => adminService.getSystemHealth())
      ]);

      // Process results
      const [
        statsResult,
        metricsResult,
        paymentResult,
        growthResult,
        caseResult,
        couponResult,
        supervisorResult,
        pendingDoctorsResult,
        pendingSupervisorsResult,
        complaintsResult,
        healthResult
      ] = results;

      if (statsResult.status === 'fulfilled') setDashboardStats(statsResult.value);
      if (metricsResult.status === 'fulfilled') setSystemMetrics(metricsResult.value);
      if (paymentResult.status === 'fulfilled') setPaymentAnalytics(paymentResult.value);
      if (growthResult.status === 'fulfilled') setUserGrowthData(growthResult.value);
      if (caseResult.status === 'fulfilled') setCaseAnalytics(caseResult.value);
      if (couponResult.status === 'fulfilled') setCouponSummary(couponResult.value);
      if (supervisorResult.status === 'fulfilled') setSupervisorStats(supervisorResult.value);
      if (pendingDoctorsResult.status === 'fulfilled') {
        const doctors = pendingDoctorsResult.value?.content || pendingDoctorsResult.value || [];
        setPendingDoctors(Array.isArray(doctors) ? doctors : []);
      }
      if (pendingSupervisorsResult.status === 'fulfilled') {
        const supervisors = pendingSupervisorsResult.value?.content || pendingSupervisorsResult.value || [];
        setPendingSupervisors(Array.isArray(supervisors) ? supervisors : []);
      }
      if (complaintsResult.status === 'fulfilled') {
        const complaints = complaintsResult.value?.content || complaintsResult.value || [];
        setRecentComplaints(Array.isArray(complaints) ? complaints : []);
      }
      if (healthResult.status === 'fulfilled') setSystemHealth(healthResult.value);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  // Format helpers
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Chart data
  const userDistributionData = [
    { name: 'Patients', value: dashboardStats?.patients || 0, color: '#3B82F6' },
    { name: 'Doctors', value: dashboardStats?.doctors || 0, color: '#10B981' },
    { name: 'Supervisors', value: dashboardStats?.supervisors || supervisorStats?.totalSupervisors || 0, color: '#8B5CF6' },
    { name: 'Admins', value: dashboardStats?.admins || 0, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  // Case status data from caseAnalytics.overview
  const caseOverview = caseAnalytics?.overview || {};
  const caseStatusData = [
    { name: 'Active', value: caseOverview?.activeCases || caseAnalytics?.activeCases || dashboardStats?.activeCases || 0, color: '#3B82F6' },
    { name: 'Pending', value:  (caseOverview?.totalCases) - (caseOverview?.activeCases) ||
                               (caseAnalytics?.totalCases) - (caseAnalytics?.activeCases) || 0, color: '#F59E0B' },
    { name: 'Completed', value: caseOverview?.closedCases || caseAnalytics?.closedCases || 0, color: '#10B981' },
    { name: 'At Risk', value: caseOverview?.casesAtRisk || caseAnalytics?.casesAtRisk || 0, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Calculate verified doctors: totalDoctors - pendingDoctorUsers
  const verifiedDoctorsCount = (dashboardStats?.doctors || 0) - (dashboardStats?.pendingDoctorUsers || 0);

  // Revenue data from paymentAnalytics
  const revenueOverview = paymentAnalytics?.overview || paymentAnalytics?.revenue || {};
  const totalRevenue = revenueOverview?.totalRevenue || paymentAnalytics?.totalRevenue || 0;
  const totalTransactions = revenueOverview?.totalTransactions || paymentAnalytics?.totalPaymentsAnalyzed || 0;

  // Generate revenue chart data from paymentAnalytics trends
  const { cumulativeRevenueData, monthlyRevenueData } = (() => {
    const rawData = paymentAnalytics?.revenue?.revenueTrend || [];

    // Helper function to format date string to readable format (e.g., "Aug 27")
    const formatDateLabel = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Helper function to get month-year key (e.g., "Aug 2025")
    const getMonthYearKey = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (rawData.length > 0) {
      // Create cumulative revenue data - each payment adds to the previous total
      let cumulativeRevenue = 0;
      const cumulative = rawData.map((item) => {
        cumulativeRevenue += (item.revenue || item.amount || 0);
        return {
          date: formatDateLabel(item.date),
          revenue: cumulativeRevenue
        };
      });

      // Create monthly aggregated data - sum payments by month
      const monthlyAggregated = {};
      rawData.forEach((item) => {
        const monthKey = getMonthYearKey(item.date);
        if (monthKey) {
          if (!monthlyAggregated[monthKey]) {
            monthlyAggregated[monthKey] = { month: monthKey, revenue: 0 };
          }
          monthlyAggregated[monthKey].revenue += (item.revenue || item.amount || 0);
        }
      });

      // Convert to array and sort by date
      const monthly = Object.values(monthlyAggregated).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });

      return { cumulativeRevenueData: cumulative, monthlyRevenueData: monthly };
    }

    // Fallback: generate empty data if no data available
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: i === 0 ? totalRevenue : 0
      });
    }
    return { cumulativeRevenueData: months, monthlyRevenueData: months };
  })();

  // Case analytics metrics
  const casePerformance = caseAnalytics?.overview || {};
  const successRate = casePerformance.totalCases ?
           ((casePerformance.closedCases / casePerformance.totalCases) * 100).toFixed(1) : 0 ;
  const avgResponseTime = casePerformance?.avgResponseTime || caseAnalytics?.avgResponseTime || 0;
  const totalCasesAnalyzed = caseAnalytics?.totalCasesAnalyzed || caseOverview?.totalCases || 0;

  // Top doctors from case analytics
  const topDoctors = caseAnalytics?.doctorMetrics?.topDoctors || caseAnalytics?.doctorMetrics || [];

  // Top supervisors from supervisor statistics
  const topSupervisors = supervisorStats?.topSupervisors || [];

  // Calculate totals
  const totalPendingActions = (pendingDoctors?.length || 0) +
                             (pendingSupervisors?.length || 0) +
                             (recentComplaints?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.fullName || 'Admin'}! Here's your system overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/admin/reports')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <AlertCard
          type="warning"
          title="System Health Alert"
          description={`System status: ${systemHealth.status}. Some services may require attention.`}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/app/admin/system')}>
              View Details
            </Button>
          }
        />
      )}

      {/* Pending Actions Alert */}
      {totalPendingActions > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">
                  {totalPendingActions} pending action{totalPendingActions > 1 ? 's' : ''} require your attention
                </p>
                <p className="text-sm text-amber-700">
                  {pendingDoctors?.length > 0 && `${pendingDoctors.length} doctor verification${pendingDoctors.length > 1 ? 's' : ''}`}
                  {pendingDoctors?.length > 0 && pendingSupervisors?.length > 0 && ', '}
                  {pendingSupervisors?.length > 0 && `${pendingSupervisors.length} supervisor verification${pendingSupervisors.length > 1 ? 's' : ''}`}
                  {(pendingDoctors?.length > 0 || pendingSupervisors?.length > 0) && recentComplaints?.length > 0 && ', '}
                  {recentComplaints?.length > 0 && `${recentComplaints.length} open complaint${recentComplaints.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/admin/doctors/verification')}>
              Review Now
            </Button>
          </div>
        </div>
      )}

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={formatNumber(dashboardStats?.totalUsers || 0)}
          icon={Users}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={dashboardStats?.userGrowthRate >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(dashboardStats?.userGrowthRate)}
          subtitle={`${formatNumber(dashboardStats?.newUsersThisPeriod || 0)} new this ${selectedPeriod}`}
          onClick={() => navigate('/app/admin/users')}
          loading={loading && !dashboardStats}
        />
        <MetricCard
          title="Active Cases"
          value={formatNumber(caseOverview?.activeCases || caseAnalytics?.activeCases || dashboardStats?.activeCases || 0)}
          icon={FileText}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
          trend={casePerformance?.caseGrowthRate >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(casePerformance?.caseGrowthRate)}
          subtitle={`${formatNumber(totalCasesAnalyzed)} total cases analyzed`}
          onClick={() => navigate('/app/admin/cases')}
          loading={loading && !caseAnalytics}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={revenueOverview?.revenueGrowthRate >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(revenueOverview?.revenueGrowthRate)}
          subtitle={`${formatNumber(totalTransactions)} payments analyzed`}
          onClick={() => navigate('/app/admin/payments')}
          loading={loading && !paymentAnalytics}
        />
        <MetricCard
          title="Completion Rate"
          value={`${successRate.toFixed ? successRate.toFixed(1) : successRate}%`}
          icon={Target}
          iconBg="bg-gradient-to-br from-teal-500 to-teal-600"
          trend={casePerformance?.successRateChange >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(casePerformance?.successRateChange)}
          subtitle="Case completion rate"
          loading={loading && !caseAnalytics}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Verified Doctors"
          value={verifiedDoctorsCount > 0 ? verifiedDoctorsCount : (dashboardStats?.totalDoctors || 0)}
          icon={Stethoscope}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          onClick={() => navigate('/app/admin/doctors/verification')}
          loading={loading && !dashboardStats}
        />
        <MetricCard
          title="Pending Verifications"
          value={(pendingDoctors?.length || 0) + (pendingSupervisors?.length || 0)}
          icon={UserCheck}
          iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
          onClick={() => navigate('/app/admin/doctors/verification')}
          loading={loading && !dashboardStats}
        />
        <MetricCard
          title="Active Supervisors"
          value={supervisorStats?.activeSupervisors || supervisorStats?.verifiedSupervisors || dashboardStats?.totalSupervisors || 0}
          icon={Building2}
          iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
          onClick={() => navigate('/app/admin/supervisors')}
          loading={loading && !supervisorStats}
        />
        <MetricCard
          title="Open Complaints"
          value={dashboardStats?.openComplaints || recentComplaints?.length || 0}
          icon={AlertTriangle}
          iconBg="bg-gradient-to-br from-red-500 to-red-600"
          onClick={() => navigate('/app/admin/complaints')}
          loading={loading && !dashboardStats}
        />
        <MetricCard
          title="Active Coupons"
          value={couponSummary?.distributedCoupons || 0}
          icon={Ticket}
          iconBg="bg-gradient-to-br from-pink-500 to-pink-600"
          onClick={() => navigate('/app/admin/coupons')}
          loading={loading && !couponSummary}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${avgResponseTime ? (typeof avgResponseTime === 'number' ? avgResponseTime.toFixed(1) : avgResponseTime) : 0}h`}
          icon={Zap}
          iconBg="bg-gradient-to-br from-cyan-500 to-cyan-600"
          subtitle="Case response time"
          loading={loading && !caseAnalytics}
        />
      </div>

      {/* Revenue Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Revenue Growth Chart */}
        <Card title="Cumulative Revenue Growth">
          <div className="h-64">
            {cumulativeRevenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulativeRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Cumulative Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Cumulative Revenue"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCumulativeRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Payments Bar Chart */}
        <Card title="Monthly Payments">
          <div className="h-64">
            {monthlyRevenueData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Monthly Revenue']}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Monthly Revenue"
                    fill="url(#colorMonthlyRevenue)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No payment data available</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Content Grid - HIDDEN (Quick Actions moved to replace System Health)
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-2">
            <QuickActionButton
              icon={UserCheck}
              label="Doctor Verifications"
              count={pendingDoctors?.length || 0}
              onClick={() => navigate('/app/admin/doctors/verification')}
              variant={pendingDoctors?.length > 0 ? 'warning' : 'default'}
            />
            <QuickActionButton
              icon={Building2}
              label="Supervisor Verifications"
              count={pendingSupervisors?.length || 0}
              onClick={() => navigate('/app/admin/supervisors')}
              variant={pendingSupervisors?.length > 0 ? 'warning' : 'default'}
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="Open Complaints"
              count={recentComplaints?.length || dashboardStats?.openComplaints || 0}
              onClick={() => navigate('/app/admin/complaints')}
              variant={recentComplaints?.length > 0 ? 'danger' : 'default'}
            />
            <QuickActionButton
              icon={Users}
              label="Manage Users"
              onClick={() => navigate('/app/admin/users')}
            />
            <QuickActionButton
              icon={Ticket}
              label="Coupon Management"
              count={couponSummary?.totalCoupons || 0}
              onClick={() => navigate('/app/admin/coupons')}
              variant="primary"
            />
            <QuickActionButton
              icon={BarChart3}
              label="System Reports"
              onClick={() => navigate('/app/admin/reports')}
            />
            <QuickActionButton
              icon={Settings}
              label="System Configuration"
              onClick={() => navigate('/app/admin/configuration')}
            />
          </div>
        </Card>
      </div>
      */}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card title="User Distribution">
          <div className="h-64">
            {userDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} users`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p>No user data available</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">{formatNumber(dashboardStats?.patients || 0)}</p>
              <p className="text-xs text-gray-500">Patients</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatNumber(dashboardStats?.doctors || 0)}</p>
              <p className="text-xs text-gray-500">Doctors</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">{formatNumber(supervisorStats?.supervisors || 0)}</p>
              <p className="text-xs text-gray-500">Supervisors</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{formatNumber(dashboardStats?.sdmins || 0)}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </Card>

        {/* Case Status Distribution */}
        <Card title="Case Status Distribution">
          <div className="h-64">
            {caseStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseStatusData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6B7280' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value} cases`]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {caseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p>No case data available</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600">Active</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-gray-600">Pending</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-600">Completed</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/cases')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Pending Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card
          title="Pending Tasks"
          action={
            <Badge variant="warning">{totalPendingActions} pending</Badge>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pendingDoctors.length === 0 && pendingSupervisors.length === 0 && recentComplaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-3" />
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              <>
                {pendingDoctors.slice(0, 3).map((doctor) => (
                  <TaskItem
                    key={`doctor-${doctor.id}`}
                    priority="high"
                    title={`Verify Dr. ${doctor.fullName || doctor.name || 'Unknown'}`}
                    description={`${doctor.specialization || 'Specialization pending'} - License: ${doctor.licenseNumber || 'N/A'}`}
                    time={formatTimeAgo(doctor.submittedAt || doctor.createdAt)}
                    onClick={() => navigate(`/app/admin/doctors/verification/${doctor.id}`)}
                  />
                ))}
                {pendingSupervisors.slice(0, 2).map((supervisor) => (
                  <TaskItem
                    key={`supervisor-${supervisor.id}`}
                    priority="high"
                    title={`Verify ${supervisor.fullName || supervisor.name || 'Supervisor'}`}
                    description={`${supervisor.organizationName || 'Organization pending'}`}
                    time={formatTimeAgo(supervisor.submittedAt || supervisor.createdAt)}
                    onClick={() => navigate(`/app/admin/supervisors/${supervisor.id}`)}
                  />
                ))}
                {recentComplaints.slice(0, 3).map((complaint) => (
                  <TaskItem
                    key={`complaint-${complaint.id}`}
                    priority={complaint.severity === 'HIGH' ? 'high' : complaint.severity === 'MEDIUM' ? 'medium' : 'low'}
                    title={`Resolve complaint #${complaint.id}`}
                    description={complaint.subject || complaint.description?.substring(0, 50) || 'No description'}
                    time={formatTimeAgo(complaint.createdAt)}
                    onClick={() => navigate(`/app/admin/complaints/${complaint.id}`)}
                  />
                ))}
              </>
            )}
          </div>
          {totalPendingActions > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/app/admin/tasks')}>
                View All Tasks <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-1 max-h-80 overflow-y-auto">
            <ActivityItem
              icon={Users}
              iconBg="bg-blue-100 text-blue-600"
              title="New user registration"
              description="Patient joined the platform"
              time="Just now"
            />
            <ActivityItem
              icon={UserCheck}
              iconBg="bg-green-100 text-green-600"
              title="Doctor verified"
              description="Dr. verification approved"
              time="5m ago"
            />
            <ActivityItem
              icon={FileText}
              iconBg="bg-purple-100 text-purple-600"
              title="New case submitted"
              description="Cardiology consultation request"
              time="15m ago"
            />
            <ActivityItem
              icon={CreditCard}
              iconBg="bg-emerald-100 text-emerald-600"
              title="Payment processed"
              description={`${formatCurrency(89.99)} consultation fee`}
              time="30m ago"
            />
            <ActivityItem
              icon={MessageSquare}
              iconBg="bg-orange-100 text-orange-600"
              title="Complaint resolved"
              description="Support ticket #1234 closed"
              time="1h ago"
            />
            <ActivityItem
              icon={Ticket}
              iconBg="bg-pink-100 text-pink-600"
              title="Coupon distributed"
              description="Batch distributed to supervisor"
              time="2h ago"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/app/admin/audit-logs')}>
              View Activity Log <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Coupon Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions (replaced System Health) */}
        <Card title="Quick Actions">
          <div className="space-y-2">
            <QuickActionButton
              icon={UserCheck}
              label="Doctor Verifications"
              count={pendingDoctors?.length || 0}
              onClick={() => navigate('/app/admin/doctors/verification')}
              variant={pendingDoctors?.length > 0 ? 'warning' : 'default'}
            />
            <QuickActionButton
              icon={Building2}
              label="Supervisor Verifications"
              count={pendingSupervisors?.length || 0}
              onClick={() => navigate('/app/admin/supervisors')}
              variant={pendingSupervisors?.length > 0 ? 'warning' : 'default'}
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="Open Complaints"
              count={recentComplaints?.length || dashboardStats?.openComplaints || 0}
              onClick={() => navigate('/app/admin/complaints')}
              variant={recentComplaints?.length > 0 ? 'danger' : 'default'}
            />
            <QuickActionButton
              icon={Users}
              label="Manage Users"
              onClick={() => navigate('/app/admin/users')}
            />
            <QuickActionButton
              icon={Ticket}
              label="Coupon Management"
              count={couponSummary?.totalCoupons || 0}
              onClick={() => navigate('/app/admin/coupons')}
              variant="primary"
            />
            <QuickActionButton
              icon={BarChart3}
              label="System Reports"
              onClick={() => navigate('/app/admin/reports')}
            />
            <QuickActionButton
              icon={Settings}
              label="System Configuration"
              onClick={() => navigate('/app/admin/configuration')}
            />
          </div>
        </Card>

        {/* System Health - HIDDEN (kept in code)
        <Card title="System Health">
          <div className="space-y-3">
            <SystemHealthIndicator
              name="Database"
              status={systemHealth?.database || 'operational'}
              icon={Database}
              details={`${systemMetrics?.dbResponseTime || 0}ms avg response`}
            />
            <SystemHealthIndicator
              name="API Services"
              status={systemHealth?.api || 'operational'}
              icon={Activity}
              details={`${systemMetrics?.avgResponseTime || 0}ms avg response`}
            />
            <SystemHealthIndicator
              name="Cache Server"
              status={systemHealth?.cache || 'operational'}
              icon={Server}
              details={`${systemMetrics?.cacheHitRate || 0}% hit rate`}
            />
            <SystemHealthIndicator
              name="Storage"
              status={systemHealth?.storage || 'operational'}
              icon={Shield}
              details={`${systemMetrics?.storageUsed || 0}% used`}
            />
            <SystemHealthIndicator
              name="External APIs"
              status={systemHealth?.externalApis || 'operational'}
              icon={Globe}
              details="Payment & notification services"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">System Uptime:</span>
              <span className="ml-2 font-semibold text-green-600">{systemMetrics?.uptime || 99.9}%</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/system')}>
              System Details <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
        */}

        {/* Coupon Summary */}
        <Card title="Coupon Overview">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-700">{couponSummary?.totalCoupons || 0}</p>
                  <p className="text-sm text-purple-600">Total Coupons</p>
                </div>
                <Ticket className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700">{couponSummary?.distributedCoupons || 0}</p>
                  <p className="text-sm text-green-600">Distributed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-700">{couponSummary?.usedCoupons || 0}</p>
                  <p className="text-sm text-gray-600">Used</p>
                </div>
                <Award className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-700">{couponSummary?.expiringSoonCoupons || 0}</p>
                  <p className="text-sm text-amber-600">Expiring Soon</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">Total Available Value:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {formatCurrency(couponSummary?.totalAvailableValue || 0)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/coupons')}>
                Manage <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <Card title="Top Performing Doctors">
          <div className="space-y-3">
            {topDoctors.length > 0 ? (
              topDoctors.slice(0, 5).map((doctor, index) => (
                <div key={doctor.doctorId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doctor.doctorName || doctor.fullName || `Dr. ${doctor.firstName || 'Unknown'}`}
                      </p>
                      <p className="text-xs text-gray-500">{doctor.specialization || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {doctor.totalCases || doctor.casesHandled || 0} cases
                    </p>
                    <p className="text-xs text-green-600">
                      {doctor.successRate ? `${doctor.successRate.toFixed(1)}%` : doctor.rating ? `${doctor.rating}%` : 'N/A'} rating
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback placeholder when no data
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 1 ? 'bg-yellow-100 text-yellow-700' :
                      i === 2 ? 'bg-gray-200 text-gray-700' :
                      i === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {i}
                    </div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-1"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse mt-1"></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/app/admin/reports/doctors')}>
              View Full Report <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Top Supervisors */}
        <Card title="Top Supervisors by Patient Count">
          <div className="space-y-3">
            {topSupervisors.length > 0 ? (
              topSupervisors.slice(0, 5).map((supervisor, index) => (
                <div key={supervisor.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-purple-100 text-purple-700' :
                      index === 1 ? 'bg-indigo-100 text-indigo-700' :
                      index === 2 ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {supervisor.organizationName || supervisor.organization || 'Organization'}
                      </p>
                      <p className="text-xs text-gray-500">{supervisor.fullName || supervisor.name || 'Supervisor'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {supervisor.activePatientCount || supervisor.patientCount || supervisor.totalPatients || 0} patients
                    </p>
                    <p className="text-xs text-purple-600">
                      {supervisor.activeCaseCount || supervisor.activeCases || 0} active cases
                    </p>
                  </div>
                </div>
              ))
            ) : supervisorStats ? (
              // Show aggregated stats if no top supervisors list but have stats
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Supervisors</p>
                      <p className="text-xl font-bold text-purple-700">{supervisorStats.totalSupervisors || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-xl font-bold text-green-700">{supervisorStats.activeSupervisors || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patients Managed</p>
                      <p className="text-xl font-bold text-blue-700">{supervisorStats.totalUniquePatientsManaged || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Patients/Supervisor</p>
                      <p className="text-xl font-bold text-indigo-700">
                        {supervisorStats.averagePatientsPerSupervisor?.toFixed(1) || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity Utilization</span>
                    <span className="font-semibold text-gray-900">
                      {supervisorStats.averageCapacityUtilization?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(supervisorStats.averageCapacityUtilization || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback placeholder when no data
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 1 ? 'bg-purple-100 text-purple-700' :
                      i === 2 ? 'bg-indigo-100 text-indigo-700' :
                      i === 3 ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {i}
                    </div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-1"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse mt-1"></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/app/admin/supervisors')}>
              View All Supervisors <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">System Summary</h3>
            <p className="text-primary-100 text-sm mt-1">
              Your medical consultation platform is running smoothly
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(dashboardStats?.totalUsers || 0)}</p>
              <p className="text-primary-100 text-xs">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(totalCasesAnalyzed || caseOverview?.totalCases || 0)}</p>
              <p className="text-primary-100 text-xs">Total Cases</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-primary-100 text-xs">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{systemMetrics?.uptime || 99.9}%</p>
              <p className="text-primary-100 text-xs">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdminDashboard;
