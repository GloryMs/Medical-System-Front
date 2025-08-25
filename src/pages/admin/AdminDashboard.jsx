import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
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
  Search
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import adminService from '../../services/api/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Load all dashboard data in parallel
      const [stats, metrics, revenue, growth, health] = await Promise.all([
        execute(() => adminService.getDashboardStats()),
        execute(() => adminService.getSystemMetrics(selectedPeriod)),
        execute(() => adminService.getRevenueAnalytics({ period: selectedPeriod })),
        execute(() => adminService.getUserGrowthAnalytics(selectedPeriod)),
        execute(() => adminService.getSystemHealth())
      ]);

      setDashboardStats(stats);
      setSystemMetrics(metrics);
      setRevenueAnalytics(revenue);
      setUserGrowthData(growth);
      setSystemHealth(health);

      // Load additional data
      loadPendingTasks();
      loadRecentActivities();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPendingTasks = async () => {
    try {
      const [pendingDoctors, pendingComplaints] = await Promise.all([
        execute(() => adminService.getPendingDoctors()),
        execute(() => adminService.getPendingComplaints())
      ]);

      const tasks = [
        ...pendingDoctors?.map(doctor => ({
          id: `doctor-${doctor.id}`,
          type: 'doctor_verification',
          title: `Verify Dr. ${doctor.fullName}`,
          priority: 'high',
          createdAt: doctor.submittedAt,
          action: () => navigate(`/admin/doctors/verification/${doctor.id}`)
        })) || [],
        ...pendingComplaints?.slice(0, 5).map(complaint => ({
          id: `complaint-${complaint.id}`,
          type: 'complaint',
          title: `Resolve complaint #${complaint.id}`,
          priority: complaint.severity === 'HIGH' ? 'high' : 'medium',
          createdAt: complaint.createdAt,
          action: () => navigate(`/admin/complaints/${complaint.id}`)
        })) || []
      ];

      setPendingTasks(tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to load pending tasks:', error);
    }
  };

  const loadRecentActivities = async () => {
    // Mock recent activities - replace with actual API call
    const activities = [
      { id: 1, type: 'user_registered', description: 'New patient registered: John Doe', timestamp: new Date(Date.now() - 30000) },
      { id: 2, type: 'doctor_verified', description: 'Dr. Sarah Wilson verification approved', timestamp: new Date(Date.now() - 120000) },
      { id: 3, type: 'case_submitted', description: 'New case submitted for cardiology', timestamp: new Date(Date.now() - 300000) },
      { id: 4, type: 'payment_processed', description: 'Payment of $89.99 processed successfully', timestamp: new Date(Date.now() - 600000) },
      { id: 5, type: 'complaint_resolved', description: 'Complaint #1234 resolved', timestamp: new Date(Date.now() - 900000) }
    ];
    setRecentActivities(activities);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return <Users className="w-4 h-4" />;
      case 'doctor_verified': return <UserCheck className="w-4 h-4" />;
      case 'case_submitted': return <FileText className="w-4 h-4" />;
      case 'payment_processed': return <CreditCard className="w-4 h-4" />;
      case 'complaint_resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            System overview and management console
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <AlertCard
          type="warning"
          title="System Health Warning"
          description={`System status: ${systemHealth.status}. Some services may be experiencing issues.`}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/health')}>
              View Details
            </Button>
          }
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={dashboardStats?.totalUsers || 0}
          change={dashboardStats?.userGrowthRate}
          changeType={dashboardStats?.userGrowthRate >= 0 ? 'positive' : 'negative'}
          icon={<Users className="w-8 h-8 text-blue-600" />}
          onClick={() => navigate('/admin/users')}
        />
        <StatsCard
          title="Active Cases"
          value={dashboardStats?.activeCases || 0}
          change={dashboardStats?.caseGrowthRate}
          changeType={dashboardStats?.caseGrowthRate >= 0 ? 'positive' : 'negative'}
          icon={<FileText className="w-8 h-8 text-green-600" />}
          onClick={() => navigate('/admin/cases')}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardStats?.monthlyRevenue)}
          change={dashboardStats?.revenueGrowthRate}
          changeType={dashboardStats?.revenueGrowthRate >= 0 ? 'positive' : 'negative'}
          icon={<DollarSign className="w-8 h-8 text-purple-600" />}
          onClick={() => navigate('/admin/payments')}
        />
        <StatsCard
          title="System Uptime"
          value={formatPercentage(systemMetrics?.uptime)}
          change={systemMetrics?.uptimeChange}
          changeType="positive"
          icon={<Server className="w-8 h-8 text-indigo-600" />}
          onClick={() => navigate('/admin/system')}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Verifications"
          value={dashboardStats?.pendingVerifications || 0}
          icon={<UserCheck className="w-8 h-8 text-orange-600" />}
          onClick={() => navigate('/admin/doctors/verification')}
        />
        <StatsCard
          title="Open Complaints"
          value={dashboardStats?.openComplaints || 0}
          icon={<AlertTriangle className="w-8 h-8 text-red-600" />}
          onClick={() => navigate('/admin/complaints')}
        />
        <StatsCard
          title="Success Rate"
          value={formatPercentage(dashboardStats?.successRate)}
          icon={<CheckCircle className="w-8 h-8 text-green-600" />}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${systemMetrics?.avgResponseTime || 0}ms`}
          icon={<Clock className="w-8 h-8 text-blue-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions" className="lg:col-span-1">
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/admin/doctors/verification')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Doctor Verifications ({dashboardStats?.pendingVerifications || 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/admin/reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/admin/configuration')}
            >
              <Settings className="w-4 h-4 mr-2" />
              System Configuration
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate('/admin/medical-config')}
            >
              <Database className="w-4 h-4 mr-2" />
              Medical Configuration
            </Button>
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card 
          title="Pending Tasks" 
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tasks')}>
              View All
            </Button>
          }
        >
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={task.action}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.type === 'doctor_verification' ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" className="w-full">
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* System Status */}
      {systemHealth && (
        <Card title="System Status" className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex p-2 rounded-full ${
                systemHealth.database === 'healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Database className={`w-6 h-6 ${
                  systemHealth.database === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium">Database</p>
              <p className={`text-xs ${
                systemHealth.database === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemHealth.database}
              </p>
            </div>
            <div className="text-center">
              <div className={`inline-flex p-2 rounded-full ${
                systemHealth.api === 'healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Activity className={`w-6 h-6 ${
                  systemHealth.api === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium">API Services</p>
              <p className={`text-xs ${
                systemHealth.api === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemHealth.api}
              </p>
            </div>
            <div className="text-center">
              <div className={`inline-flex p-2 rounded-full ${
                systemHealth.cache === 'healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Server className={`w-6 h-6 ${
                  systemHealth.cache === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium">Cache</p>
              <p className={`text-xs ${
                systemHealth.cache === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemHealth.cache}
              </p>
            </div>
            <div className="text-center">
              <div className={`inline-flex p-2 rounded-full ${
                systemHealth.storage === 'healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-6 h-6 ${
                  systemHealth.storage === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium">Storage</p>
              <p className={`text-xs ${
                systemHealth.storage === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemHealth.storage}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;