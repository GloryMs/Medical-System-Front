import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Eye,
  Video,
  Phone,
  Star,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const PatientDashboard = () => {

  console.log('Dashboard rendering');

  const { user } = useAuth();
  const { execute, loading } = useApi();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCases: 3,
      activeCases: 2,
      completedCases: 1,
      upcomingAppointments: 0
    },
    recentCases: [],
    upcomingAppointments: [],
    recentNotifications: []
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadSubscriptionStatus();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await execute(() => patientService.getDashboardData());
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const status = await execute(() => patientService.getSubscriptionStatus());
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && !dashboardData.stats.totalCases) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getWelcomeMessage()}, {user?.firstName}!
            </h1>
            <p className="text-primary-100 mt-1">
              Here's an overview of your medical consultations
            </p>
          </div>
          <div className="hidden md:block">
            <Heart className="w-16 h-16 text-primary-200" />
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link to="/app/patient/cases">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Case
            </Button>
          </Link>
          <Link to="/app/patient/appointments">
            <Button variant="ghost" className="text-white hover:bg-primary-400">
              <Calendar className="w-4 h-4 mr-2" />
              View Appointments
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Status Alert */}
      {subscriptionStatus && subscriptionStatus.status !== 'ACTIVE' && (
        <AlertCard
          type="warning"
          title="Subscription Required"
          message="Your subscription is inactive. Please renew to continue accessing medical consultations."
        >
          <div className="mt-4">
            <Link to="/app/patient/subscription">
              <Button variant="warning">
                Manage Subscription
              </Button>
            </Link>
          </div>
        </AlertCard>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Cases"
          value={dashboardData.stats.totalCases}
          icon={<FileText className="w-6 h-6" />}
        />
        
        <StatsCard
          title="Active Cases"
          value={dashboardData.stats.activeCases}
          icon={<Activity className="w-6 h-6" />}
        />
        
        <StatsCard
          title="Completed Cases"
          value={dashboardData.stats.completedCases}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        
        <StatsCard
          title="Upcoming Appointments"
          value={dashboardData.stats.upcomingAppointments}
          icon={<Calendar className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card 
          title="Recent Cases" 
          action={
            <Link to="/app/patient/cases">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {dashboardData.recentCases.length > 0 ? (
              dashboardData.recentCases.slice(0, 3).map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{case_.caseTitle}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{case_.requiredSpecialization}</span>
                      <PriorityBadge priority={case_.urgencyLevel} size="sm" />
                      <span>•</span>
                      <span>{formatDate(case_.createdAt)}</span>
                    </div>
                    {case_.assignedDoctor && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <span>Dr. {case_.assignedDoctor.name}</span>
                        <div className="flex items-center ml-2">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="ml-1">{case_.assignedDoctor.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={case_.status} size="sm" />
                    <Link to={`/app/patient/cases/${case_.id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No cases submitted yet</p>
                <Link to="/app/patient/cases">
                  <Button icon={<Plus className="w-4 h-4" />}>
                    Submit Your First Case
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card 
          title="Upcoming Appointments" 
          action={
            <Link to="/app/patient/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {dashboardData.upcomingAppointments.length > 0 ? (
              dashboardData.upcomingAppointments.slice(0, 2).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {appointment.consultationType === 'VIDEO' ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Phone className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.doctor.fullName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(appointment.scheduledTime)}</span>
                        <span>at {formatTime(appointment.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span>{appointment.duration} minutes</span>
                        <span className="mx-2">•</span>
                        <StatusBadge status={appointment.status} size="xs" />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {appointment.status === 'CONFIRMED' && (
                      <>
                        <Button size="sm">Join</Button>
                      </>
                    )}
                    { (appointment.status === 'PENDING' || appointment.status === 'SCHEDULED')  && (
                      <>
                        <Button variant="outline" size="sm">Decline</Button>
                        <Button size="sm">Accept</Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming appointments</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Health Insights & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <Card 
          title="Recent Notifications" 
          action={
            <Link to="/app/patient/notifications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {dashboardData.recentNotifications.length > 0 ? (
              dashboardData.recentNotifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-gray-50'}`}>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                    {notification.title}
                  </h5>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 text-sm">No recent notifications</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/app/patient/cases" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <Plus className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Submit New Case</h5>
                  <p className="text-xs text-gray-600">Get medical consultation</p>
                </div>
              </div>
            </Link>

            <Link to="/app/patient/profile" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Update Profile</h5>
                  <p className="text-xs text-gray-600">Manage medical history</p>
                </div>
              </div>
            </Link>

            <Link to="/app/patient/payments" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Billing & Payments</h5>
                  <p className="text-xs text-gray-600">View payment history</p>
                </div>
              </div>
            </Link>

            <Link to="/app/patient/complaints" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Support & Help</h5>
                  <p className="text-xs text-gray-600">Submit complaints</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        {/* Subscription Info */}
        <Card title="Subscription Status">
          {subscriptionStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <Badge variant="success">{subscriptionStatus.plan}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <StatusBadge status={subscriptionStatus.status} size="sm" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(subscriptionStatus.expiry)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <Link to="/app/patient/subscription" className="block">
                  <Button variant="outline" size="sm" fullWidth>
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 text-sm mb-4">No active subscription</p>
              <Link to="/app/patient/subscription">
                <Button size="sm">Choose Plan</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Health Tips */}
      <Card title="Health Tips & Reminders">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Stay Hydrated</h4>
            <p className="text-sm text-blue-800">Drink at least 8 glasses of water daily for optimal health.</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Regular Exercise</h4>
            <p className="text-sm text-green-800">Aim for 30 minutes of moderate exercise most days of the week.</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Quality Sleep</h4>
            <p className="text-sm text-purple-800">Get 7-9 hours of quality sleep each night for better health.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;