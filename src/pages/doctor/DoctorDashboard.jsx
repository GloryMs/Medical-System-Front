import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Activity,
  Calendar,
  Clock,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Bell,
  User,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Stethoscope,
  HeartHandshake,
  Zap,
  Settings,
  Video,
  Phone,
  MessageSquare,
  BarChart3,
  Star,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Briefcase
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeCases: 0,
      todayAppointments: 0,
      totalConsultations: 0,
      avgRating: 0,
      workloadPercentage: 0,
      thisWeekEarnings: 0,
      pendingReports: 0,
      unreadNotifications: 0
    },
    recentCases: [],
    upcomingAppointments: [],
    recentNotifications: []
  });

  const [isAvailable, setIsAvailable] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const data = await execute(() => doctorService.getDashboardData());
            setDashboardData(data);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getDisplayName = (fullName) => {
    if (!fullName) {
      return 'New Doctor';
    }
    const lowerCaseFullName = fullName.toLowerCase();
    if (lowerCaseFullName.startsWith('dr. ')) {
      return fullName.substring(4); // Remove 'Dr. ' (4 characters)
    }
    return fullName;
  };


  const handleToggleAvailability = async () => {
    try {
      await execute(() => doctorService.updateAvailability({ isAvailable: !isAvailable }));
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleToggleEmergencyMode = async () => {
    try {
      await execute(() => doctorService.updateSettings({ emergencyMode: !emergencyMode }));
      setEmergencyMode(!emergencyMode);
    } catch (error) {
      console.error('Failed to update emergency mode:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CASE_ASSIGNMENT':
        return <FileText className="w-4 h-4" />;
      case 'APPOINTMENT_REMINDER':
        return <Calendar className="w-4 h-4" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const quickActions = [
    {
      title: "View All Cases",
      description: "Manage your assigned cases",
      icon: <Briefcase className="w-5 h-5" />,
      href: "/app/doctor/cases",
      color: "blue"
    },
    {
      title: "Today's Schedule",
      description: "View today's appointments",
      icon: <Calendar className="w-5 h-5" />,
      href: "/app/doctor/appointments",
      color: "green"
    },
    {
      title: "Create Report",
      description: "Write consultation report",
      icon: <FileText className="w-5 h-5" />,
      href: "/app/doctor/reports/create",
      color: "purple"
    },
    {
      title: "Earnings Overview",
      description: "Track your earnings",
      icon: <DollarSign className="w-5 h-5" />,
      href: "/app/doctor/earnings",
      color: "yellow"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {getDisplayName(user?.fullName)}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's your practice overview for today
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={refreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            onClick={loadDashboardData}
            disabled={refreshing || loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Workload Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Practice Status</h2>
            <p className="text-sm text-gray-600">Manage your availability and workload</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Emergency Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Emergency Mode</span>
              <button
                onClick={handleToggleEmergencyMode}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  emergencyMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emergencyMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {emergencyMode && (
                <Badge variant="error" size="sm" icon={<Zap className="w-3 h-3" />}>
                  Emergency
                </Badge>
              )}
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Available</span>
              <button
                onClick={handleToggleAvailability}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isAvailable ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Workload Indicator */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Workload</span>
            <span className="text-sm font-bold text-gray-900">
              {dashboardData.stats.workloadPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                dashboardData.stats.workloadPercentage > 80 ? 'bg-red-500' :
                dashboardData.stats.workloadPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${dashboardData.stats.workloadPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Active Cases"
          value={dashboardData.stats.activeCases}
          icon={<Briefcase className="w-6 h-6" />}
          changeType="increase"
        />
        
        <StatsCard
          title="Today's Appointments"
          value={dashboardData.stats.todayAppointments}
          icon={<Calendar className="w-6 h-6" />}
          changeType="neutral"
        />
        
        <StatsCard
          title="Total Consultations"
          value={dashboardData.stats.totalConsultations}
          icon={<Users className="w-6 h-6" />}
          changeType="increase"
        />
        
        <StatsCard
          title="Average Rating"
          value={dashboardData.stats.avgRating}
          icon={<Star className="w-6 h-6" />}
          changeType="increase"
        />

        <StatsCard
          title="Total Earnings"
          value={`${dashboardData.stats.totalEarnings?.toLocaleString() || '0'}`}
          icon={<DollarSign className="w-6 h-6" />}
          changeType="increase"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Active Cases */}
        <Card 
          title="Latest Active Cases" 
          action={
            <Link to="/app/doctor/cases">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {dashboardData.recentCases.length > 0 ? (
              dashboardData.recentCases.map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{case_.patientName}</h4>
                      <PriorityBadge priority={case_.urgencyLevel} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{case_.caseTitle}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span>{case_.requiredSpecialization}</span>
                      <span>•</span>
                      <span>{formatDate(case_.submittedAt)}</span>
                      {case_.nextAction && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">{case_.nextAction}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={case_.status} size="sm" />
                    <Link to={`/app/doctor/cases/${case_.id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No active cases</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card 
          title="Upcoming Appointments" 
          action={
            <Link to="/app/doctor/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {dashboardData.upcomingAppointments.length > 0 ? (
              dashboardData.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <div className="flex items-center space-x-1 text-gray-500">
                        {appointment.consultationType === 'VIDEO_CONSULTATION' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                        <span className="text-sm">{appointment.duration}min</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(appointment.scheduledTime)}</span>
                      <span>•</span>
                      <span>Case #{appointment.caseId}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={appointment.status} size="sm" />
                    <Link to={`/app/doctor/appointments/${appointment.id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Notifications */}
        <Card 
          title="Latest Notifications" 
          action={
            <Link to="/app/doctor/notifications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {dashboardData.recentNotifications.length > 0 ? (
              dashboardData.recentNotifications.map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className={`p-2 rounded-full ${
                    notification.isRead ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                  </div>
                  {notification.actionUrl && (
                    <Link to={notification.actionUrl}>
                      <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} />
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className={`inline-flex p-2 rounded-lg mb-3 bg-${action.color}-100 text-${action.color}-600`}>
                    {action.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;