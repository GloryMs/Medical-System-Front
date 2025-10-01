import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Archive,
  Star,
  StarOff,
  MoreVertical,
  Smartphone,
  Globe,
  AlertOctagon,
  Info
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

const DoctorNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    appointmentReminders: true,
    caseUpdates: true,
    paymentNotifications: true,
    systemNotifications: true
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  // Filter notifications when search or filters change
  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, filterType, filterStatus, filterPriority, activeTab]);

  const loadNotifications = async () => {
    try {
      const data = await execute(() => doctorService.getNotifications(user.id));
      setNotifications(data || []);

      // Calculate stats from the notifications data
      const notificationsData = data || [];
      const stats = {
        total: notificationsData.length,
        unread: notificationsData.filter(notification => notification.isRead === false).length,
      };
    
      setNotificationStats(stats || {});
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await execute(() => doctorService.getNotificationSettings());
      setNotificationSettings(settings || notificationSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'unread':
          filtered = filtered.filter(n => !n.isRead);
          break;
        case 'important':
          // Filter by HIGH and CRITICAL priorities for Important tab
          filtered = filtered.filter(n => n.priority === 'HIGH' || n.priority === 'CRITICAL');
          break;
        default:
          break;
      }
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type?.toLowerCase() === filterType.toLowerCase());
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'read') {
        filtered = filtered.filter(n => n.isRead);
      } else if (filterStatus === 'unread') {
        filtered = filtered.filter(n => !n.isRead);
      }
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority?.toLowerCase() === filterPriority.toLowerCase());
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId, receiverId) => {
    try {

      await execute(() => doctorService.markNotificationAsRead(notificationId, receiverId));
      setNotifications(prev =>
        prev.map(n =>
          notificationId.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      loadNotifications(); // Reload to update stats
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await execute(() => doctorService.markAllNotificationsAsRead(user.id));
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      loadNotifications(); // Reload to update stats
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      await execute(() => doctorService.updateNotificationSettings(newSettings));
      setNotificationSettings(newSettings);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id],[notification.receiverId]);
    }

    // Navigate based on notification type
    switch (notification.type?.toLowerCase()) {
      case 'appointment':
        navigate('/app/patient/appointments');
        break;
      case 'case':
        if (notification.relatedId) {
          navigate(`/app/patient/cases/${notification.relatedId}`);
        } else {
          navigate('/app/patient/cases');
        }
        break;
      case 'payment':
        navigate('/app/patient/payments');
        break;
      case 'system':
        // Stay on notifications page
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'case':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'doctor':
        return <UserCheck className="w-5 h-5 text-indigo-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      case 'case':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-indigo-100 text-indigo-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const tabs = [
    { id: 'all', label: 'All', count: notificationStats.total },
    { id: 'unread', label: 'Unread', count: notificationStats.unread },
    { id: 'important', label: 'Important', count: notifications.filter(n => n.priority === 'HIGH' || n.priority === 'CRITICAL').length }
  ];

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your medical consultations and appointments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={loadNotifications}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettingsModal(true)}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards with Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Stats Cards - Much Narrower */}
        <div className="md:col-span-1">
          <StatsCard
            title="Total"
            value={notificationStats.total}
            icon={<Bell className="w-4 h-4 text-blue-500" />}
            compact
          />
        </div>
        <div className="md:col-span-1">
          <StatsCard
            title="Unread"
            value={notificationStats.unread}
            icon={<BellOff className="w-4 h-4 text-red-500" />}
            valueColor="text-red-600"
            compact
          />
        </div>
        
        {/* Search - More Space */}
        <div className="md:col-span-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Search Notifications</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Filters - More Space */}
        <div className="md:col-span-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Filter Options</label>
            <div className="relative">
              <Button
                variant="outline"
                icon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
                fullWidth
                size="sm"
              >
                Apply Filters
              </Button>
              
              {showFilters && (
                <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4 min-w-80">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="appointment">Appointments</option>
                      <option value="case">Cases</option>
                      <option value="payment">Payments</option>
                      <option value="doctor">Doctor Updates</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="read">Read</option>
                      <option value="unread">Unread</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <div className="divide-y divide-gray-200">
          {/* Tab Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 pb-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" size="sm">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Mark All as Read button - Always show for debugging */}
              <div className="flex items-center space-x-2">
                {notificationStats.unread > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={markAllAsRead}
                    loading={loading}
                  >
                    Mark All as Read ({notificationStats.unread})
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">All notifications read</span>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            {notification.type && (
                              <Badge
                                size="sm"
                                className={getNotificationTypeColor(notification.type)}
                              >
                                {notification.type}
                              </Badge>
                            )}

                            {notification.priority && (
                              <Badge
                                size="sm"
                                className={`flex items-center space-x-1 ${getPriorityColor(notification.priority)}`}
                              >
                                {getPriorityIcon(notification.priority)}
                                <span>{notification.priority}</span>
                              </Badge>
                            )}
                          </div>

                          <p className={`text-sm ${
                            !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                          } line-clamp-2 mb-2`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            {!notification.isRead && (
                              <span className="flex items-center space-x-1 text-blue-600">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span>Unread</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Single action button */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead([notification.id],[notification.receiverId]);
                              }}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'You don\'t have any notifications yet'}
                </p>
              </div>
            )}
        </div>
      </Card>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Notification Settings"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Customize how you receive notifications about your medical consultations and appointments.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: e.target.checked
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  smsNotifications: e.target.checked
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  pushNotifications: e.target.checked
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateNotificationSettings(notificationSettings)}
              loading={loading}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export default DoctorNotifications;