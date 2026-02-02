import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  Settings,
  RefreshCw,
  AlertOctagon,
  Info,
  ChevronDown,
  Users,
  FileText,
  Shield,
  Building2,
  Ticket,
  Send
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal, { FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useUI } from '../../hooks/useUI';
import adminService from '../../services/api/adminService';

const ITEMS_PER_PAGE = 10;

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const { showToast } = useUI();

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
    userVerifications: true,
    complaintAlerts: true,
    paymentNotifications: true,
    systemNotifications: true,
    caseUpdates: true
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
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showImportant, setShowImportant] = useState(false);

  // Send notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    targetType: 'all', // all, patients, doctors, supervisors
    priority: 'medium'
  });

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  // Filter notifications when search or filters change
  useEffect(() => {
    filterNotifications();
    setDisplayCount(ITEMS_PER_PAGE);
  }, [notifications, searchQuery, filterType, filterStatus, filterPriority, showImportant]);

  const loadNotifications = async () => {
    try {
      const data = await execute(() => adminService.getNotifications(user.id));
      setNotifications(data || []);

      const notificationsData = data || [];
      const stats = {
        total: notificationsData.length,
        unread: notificationsData.filter(notification => notification.isRead === false).length,
      };

      setNotificationStats(stats);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showToast('Failed to load notifications', 'error');
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await execute(() => adminService.getNotificationSettings());
      if (settings) {
        setNotificationSettings(prev => ({ ...prev, ...settings }));
      }
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

    // Filter important only
    if (showImportant) {
      filtered = filtered.filter(notification =>
        notification.priority?.toLowerCase() === 'critical' ||
        notification.priority?.toLowerCase() === 'high'
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationIds, receiverIds) => {
    try {
      await execute(() => adminService.markNotificationAsRead(notificationIds, receiverIds));
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n.id) ? { ...n, isRead: true } : n)
      );
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await execute(() => adminService.markAllNotificationsAsRead(user.id));
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      loadNotifications();
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      await execute(() => adminService.updateNotificationSettings(newSettings));
      setNotificationSettings(newSettings);
      setShowSettingsModal(false);
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      await execute(() => adminService.sendSystemNotification({
        title: newNotification.title,
        message: newNotification.message,
        targetType: newNotification.targetType,
        priority: newNotification.priority,
        type: 'SYSTEM'
      }));

      showToast('Notification sent successfully', 'success');
      setShowSendNotificationModal(false);
      setNewNotification({
        title: '',
        message: '',
        targetType: 'all',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      showToast('Failed to send notification', 'error');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id], [notification.receiverId]);
    }

    // Navigate based on notification type
    switch (notification.type?.toLowerCase()) {
      case 'verification':
      case 'doctor':
        navigate('/app/admin/doctors/verification');
        break;
      case 'supervisor':
        navigate('/app/admin/supervisors');
        break;
      case 'complaint':
        if (notification.relatedId) {
          navigate(`/app/admin/complaints/${notification.relatedId}`);
        } else {
          navigate('/app/admin/complaints');
        }
        break;
      case 'case':
        if (notification.relatedId) {
          navigate(`/app/admin/cases/${notification.relatedId}`);
        } else {
          navigate('/app/admin/cases');
        }
        break;
      case 'payment':
        navigate('/app/admin/payments');
        break;
      case 'user':
        navigate('/app/admin/users');
        break;
      case 'coupon':
        navigate('/app/admin/coupons');
        break;
      case 'system':
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'verification':
      case 'doctor':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'supervisor':
        return <Building2 className="w-5 h-5 text-indigo-500" />;
      case 'complaint':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'case':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'user':
        return <Users className="w-5 h-5 text-teal-500" />;
      case 'coupon':
        return <Ticket className="w-5 h-5 text-pink-500" />;
      case 'system':
        return <Shield className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'verification':
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'supervisor':
        return 'bg-indigo-100 text-indigo-800';
      case 'complaint':
        return 'bg-red-100 text-red-800';
      case 'case':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-teal-100 text-teal-800';
      case 'coupon':
        return 'bg-pink-100 text-pink-800';
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

  const importantCount = notifications.filter(n =>
    n.priority?.toLowerCase() === 'critical' || n.priority?.toLowerCase() === 'high'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Manage system notifications and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setShowSendNotificationModal(true)}
          >
            Send Notification
          </Button>
          <Button
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettingsModal(true)}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Notifications"
          value={notificationStats.total}
          icon={<Bell className="w-6 h-6" />}
        />
        <StatsCard
          title="Unread"
          value={notificationStats.unread}
          change={notificationStats.unread > 0 ? `${notificationStats.unread} pending` : 'All caught up'}
          icon={<Mail className="w-6 h-6" />}
        />
        <StatsCard
          title="Important"
          value={importantCount}
          change={importantCount > 0 ? 'Requires attention' : 'No urgent items'}
          icon={<AlertTriangle className="w-6 h-6" />}
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-64">
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
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchQuery('');
                }
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Important ({importantCount})
            </Button>

            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            <Button
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadNotifications}
              disabled={loading}
            >
              Refresh
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
                  <option value="verification">Verification</option>
                  <option value="complaint">Complaint</option>
                  <option value="case">Case</option>
                  <option value="payment">Payment</option>
                  <option value="user">User</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="coupon">Coupon</option>
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
          {loading && notifications.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : displayedNotifications.length > 0 ? (
            <>
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    notification.isRead
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
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

                          {/* Message */}
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
            Customize how you receive notifications about system events and alerts.
          </p>

          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in your browser' },
              { key: 'userVerifications', label: 'User Verifications', description: 'Get notified about pending doctor/supervisor verifications' },
              { key: 'complaintAlerts', label: 'Complaint Alerts', description: 'Receive alerts about new complaints' },
              { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Get notified about payment events' },
              { key: 'caseUpdates', label: 'Case Updates', description: 'Receive updates on case status changes' },
              { key: 'systemNotifications', label: 'System Notifications', description: 'Receive system health and maintenance alerts' },
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

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendNotificationModal}
        onClose={() => setShowSendNotificationModal(false)}
        title="Send System Notification"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Send a notification to users across the system.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              placeholder="Notification title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              placeholder="Notification message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select
                value={newNotification.targetType}
                onChange={(e) => setNewNotification({ ...newNotification, targetType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="patients">Patients Only</option>
                <option value="doctors">Doctors Only</option>
                <option value="supervisors">Supervisors Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={newNotification.priority}
                onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSendNotificationModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              loading={loading}
              icon={<Send className="w-4 h-4" />}
            >
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
