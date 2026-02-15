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
  Info,
  ChevronDown
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

const ITEMS_PER_PAGE = 10;

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

  // Pagination state
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showImportant, setShowImportant] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  // Filter notifications when search or filters change
  useEffect(() => {
    filterNotifications();
    // Reset display count when filters change
    setDisplayCount(ITEMS_PER_PAGE);
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
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type?.toLowerCase() === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const isRead = filterStatus === 'read';
      filtered = filtered.filter(notification => notification.isRead === isRead);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority?.toLowerCase() === filterPriority);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationIds, receiverIds) => {
    try {
      await execute(() => doctorService.markNotificationAsRead(notificationIds[0], user.id));
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n.id) ? { ...n, isRead: true } : n)
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

  // const deleteNotification = async (notificationId) => {
  //   try {
  //     await execute(() => doctorService.deleteNotification(notificationId));
  //     setNotifications(prev => prev.filter(n => n.id !== notificationId));
  //     loadNotifications(); // Reload to update stats
  //     setDeleteConfirmId(null);
  //   } catch (error) {
  //     console.error('Failed to delete notification:', error);
  //   }
  // };

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
      markAsRead([notification.id], [notification.receiverId]);
    }

    // Navigate based on notification type
    switch (notification.type?.toLowerCase()) {
      case 'appointment':
        navigate('/app/doctor/appointments');
        break;
      case 'case':
        if (notification.relatedId) {
          navigate(`/app/doctor/cases/${notification.relatedId}`);
        } else {
          navigate('/app/doctor/cases');
        }
        break;
      case 'payment':
        navigate('/app/doctor/earnings');
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
        return <AlertOctagon className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const displayedNotifications = filteredNotifications.slice(0, displayCount);
  const hasMore = displayCount < filteredNotifications.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Manage your notifications and preferences</p>
        </div>
        <Button
          icon={<Settings className="w-4 h-4" />}
          onClick={() => setShowSettingsModal(true)}
        >
          Settings
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="Total Notifications" 
          value={notificationStats.total}
          icon={<Bell className="w-6 h-6" />}
        />
        <StatsCard 
          title="Unread" 
          value={notificationStats.unread}
          change={`${notificationStats.unread} unread`}
          icon={<Mail className="w-6 h-6" />}
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Important Notifications Filter */}
            <Button
              className={`${
                showImportant
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
              onClick={() => {
                setShowImportant(!showImportant);
                if (!showImportant) {
                  setFilterPriority('critical');
                  setFilterType('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                } else {
                  setFilterPriority('all');
                }
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Important ({filteredNotifications.filter(n => 
                n.priority?.toLowerCase() === 'critical' || n.priority?.toLowerCase() === 'high'
              ).length})
            </Button>
            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            {notificationStats.unread > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="appointment">Appointment</option>
                  <option value="case">Case</option>
                  <option value="payment">Payment</option>
                  <option value="doctor">Doctor</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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
      </Card>

      {/* Notifications List */}
      <Card title={`Notifications (${displayedNotifications.length}/${filteredNotifications.length})`}>
        <div className="space-y-3">
          {displayedNotifications.length > 0 ? (
            <>
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.isRead
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <Badge className={getNotificationTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                            {notification.priority && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                {getPriorityIcon(notification.priority)}
                                <span>{notification.priority}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Message - with proper text wrapping */}
                          <p className="text-sm text-gray-700 mt-2 break-words whitespace-pre-wrap overflow-hidden">
                            {notification.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            {!notification.isRead && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                Unread
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notification.id], [notification.receiverId]);
                          }}
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    icon={<ChevronDown className="w-4 h-4" />}
                  >
                    Load More ({filteredNotifications.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </>
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
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
              { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Get reminders about upcoming appointments' },
              { key: 'caseUpdates', label: 'Case Updates', description: 'Receive updates on your medical cases' },
              { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Get notified about payment status' },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{setting.label}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key]}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [setting.key]: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            ))}
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