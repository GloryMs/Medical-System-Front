import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  FileText,
  Calendar,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import {
  fetchDashboardStatistics,
  fetchSupervisorProfile,
  selectSupervisorStatistics,
  selectSupervisorProfile
} from '../../store/slices/supervisorSlice';
import supervisorService from '../../services/api/supervisorService';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const statistics = useSelector(selectSupervisorStatistics);
  const profile = useSelector(selectSupervisorProfile);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        dispatch(fetchDashboardStatistics()),
        dispatch(fetchSupervisorProfile()),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await supervisorService.getRecentActivity(10);
      setRecentActivity(response || []);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CASE_SUBMITTED':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'PATIENT_ASSIGNED':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'APPOINTMENT_SCHEDULED':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'COUPON_REDEEMED':
        return <Ticket className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.fullName || 'Supervisor'}!
            </h1>
            <p className="mt-2 text-orange-100">
              Here's your medical supervision overview
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <StatusBadge status={profile?.verificationStatus || 'PENDING'} size="sm" />
                <span className="ml-2">{profile?.verificationStatus}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{statistics.activePatientCount}/{statistics.maxPatientsLimit} Patients</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex space-x-3">
            <Button
              variant="light"
              icon={<Plus />}
              onClick={() => navigate('/app/supervisor/patients/create')}
            >
              Add Patient
            </Button>
            <Button
              variant="light"
              icon={<FileText />}
              onClick={() => navigate('/app/supervisor/cases')}
            >
              View Cases
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Patients"
          value={statistics.activePatientCount}
          icon={<Users className="w-6 h-6" />}
          change={`${statistics.maxPatientsLimit - statistics.activePatientCount} slots left`}
          changeType="info"
          iconColor="bg-blue-100 text-blue-600"
          onClick={() => navigate('/app/supervisor/patients')}
        />
        <StatsCard
          title="Active Cases"
          value={statistics.activeCases}
          icon={<FileText className="w-6 h-6" />}
          change={`${statistics.completedCases} completed`}
          changeType="success"
          iconColor="bg-green-100 text-green-600"
          onClick={() => navigate('/app/supervisor/cases')}
        />
        <StatsCard
          title="Upcoming Appointments"
          value={statistics.upcomingAppointments}
          icon={<Calendar className="w-6 h-6" />}
          change={`${statistics.totalAppointments} total`}
          changeType="info"
          iconColor="bg-purple-100 text-purple-600"
          onClick={() => navigate('/app/supervisor/appointments')}
        />
        <StatsCard
          title="Available Coupons"
          value={statistics.availableCoupons}
          icon={<Ticket className="w-6 h-6" />}
          change={`${statistics.usedCoupons} used`}
          changeType="warning"
          iconColor="bg-orange-100 text-orange-600"
          onClick={() => navigate('/app/supervisor/coupons')}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases Submitted</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {statistics.totalCasesSubmitted}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons Issued</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {statistics.totalCouponsIssued}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ${statistics.totalCouponValue?.toFixed(2) || '0.00'} value
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Ticket className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payments Processed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {statistics.totalPaymentsProcessed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2" title="Recent Activity" padding={false}>
          <div className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    {activity.relatedEntityId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => {
                          if (activity.relatedEntityType === 'CASE') {
                            navigate(`/app/supervisor/cases/${activity.relatedEntityId}`);
                          } else if (activity.relatedEntityType === 'PATIENT') {
                            navigate(`/app/supervisor/patients/${activity.relatedEntityId}`);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
          {recentActivity.length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/app/supervisor/cases')}
              >
                View All Activity
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              icon={<Users />}
              onClick={() => navigate('/app/supervisor/patients/create')}
            >
              Assign New Patient
            </Button>
            <Button
              variant="outline"
              fullWidth
              icon={<FileText />}
              onClick={() => navigate('/app/supervisor/patients')}
            >
              Submit Case
            </Button>
            <Button
              variant="outline"
              fullWidth
              icon={<Ticket />}
              onClick={() => navigate('/app/supervisor/coupons')}
            >
              Manage Coupons
            </Button>
            <Button
              variant="outline"
              fullWidth
              icon={<Calendar />}
              onClick={() => navigate('/app/supervisor/appointments')}
            >
              View Appointments
            </Button>
          </div>

          {/* Verification Alert */}
          {profile?.verificationStatus !== 'VERIFIED' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account Verification Pending
                  </h3>
                  <p className="mt-1 text-xs text-yellow-700">
                    Your account is awaiting admin verification. Some features may be limited.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-yellow-800"
                    onClick={() => navigate('/app/supervisor/profile')}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
