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
  Globe
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const PatientNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
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
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  // Filter notifications when search or filters change
  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, filterType, filterStatus, activeTab]);

  const loadNotifications = async () => {
    try {
      const data = await execute(() => patientService.getNotifications());
      setNotifications(data || []);

      // Calculate stats from the complaints data
      const notificationsData = data || [];
      const stats = {
        total: notificationsData.length,
        unread: notificationsData.filter(notification => notification.isRead === false).length,
        //inProgress: notificationsData.filter(notification => notification.priority === 'HIGH').length,
        //resolved: notificationsData.filter(notification => notification.status === 'RESOLVED').length
      };
    
      setNotificationStats(stats || {});
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await execute(() => patientService.getNotificationSettings());
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
          filtered = filtered.filter(n => n.isImportant);
          break;
        case 'archived':
          filtered = filtered.filter(n => n.isArchived);
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationIds) => {
    try {
      await execute(() => patientService.markNotificationsAsRead(notificationIds));
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      loadNotificationStats();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAsUnread = async (notificationIds) => {
    try {
      await execute(() => patientService.markNotificationsAsUnread(notificationIds));
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: false } : n
        )
      );
      loadNotificationStats();
    } catch (error) {
      console.error('Failed to mark notifications as unread:', error);
    }
  };

  const toggleImportant = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      await execute(() => patientService.toggleNotificationImportant(notificationId));
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isImportant: !n.isImportant } : n
        )
      );
    } catch (error) {
      console.error('Failed to toggle important status:', error);
    }
  };

  const archiveNotifications = async (notificationIds) => {
    try {
      await execute(() => patientService.archiveNotifications(notificationIds));
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, isArchived: true } : n
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to archive notifications:', error);
    }
  };

  const deleteNotifications = async (notificationIds) => {
    try {
      await execute(() => patientService.deleteNotifications(notificationIds));
      setNotifications(prev =>
        prev.filter(n => !notificationIds.includes(n.id))
      );
      setSelectedNotifications([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      await execute(() => patientService.updateNotificationSettings(newSettings));
      setNotificationSettings(newSettings);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await execute(() => patientService.getNotificationStats());
      setNotificationStats(stats || {});
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }

    // Navigate based on notification type
    switch (notification.type?.toLowerCase()) {
      case 'appointment':
        navigate('/patient/appointments');
        break;
      case 'case':
        if (notification.relatedId) {
          navigate(`/patient/cases/${notification.relatedId}`);
        } else {
          navigate('/patient/cases');
        }
        break;
      case 'payment':
        navigate('/patient/payments');
        break;
      case 'system':
        // Stay on notifications page
        break;
      default:
        break;
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
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
    { id: 'important', label: 'Important', count: notifications.filter(n => n.isImportant).length },
    { id: 'archived', label: 'Archived', count: notifications.filter(n => n.isArchived).length }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Notifications"
          value={notificationStats.total}
          icon={<Bell className="w-6 h-6 text-blue-500" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Unread"
          value={notificationStats.unread}
          icon={<BellOff className="w-6 h-6 text-red-500" />}
          valueColor="text-red-600"
        />
        <StatsCard
          title="Today"
          value={notificationStats.today}
          icon={<Clock className="w-6 h-6 text-green-500" />}
        />
        <StatsCard
          title="This Week"
          value={notificationStats.thisWeek}
          icon={<Calendar className="w-6 h-6 text-purple-500" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card title="Filters">
            <div className="p-6 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

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

              {/* Quick Actions */}
              {selectedNotifications.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {selectedNotifications.length} selected
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => markAsRead(selectedNotifications)}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<EyeOff className="w-4 h-4" />}
                      onClick={() => markAsUnread(selectedNotifications)}
                    >
                      Mark as Unread
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Archive className="w-4 h-4" />}
                      onClick={() => archiveNotifications(selectedNotifications)}
                    >
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3">
          <Card>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
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
            </div>

            {/* Bulk Actions */}
            {filteredNotifications.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedNotifications.length > 0
                        ? `${selectedNotifications.length} selected`
                        : 'Select all'
                      }
                    </span>
                  </div>

                  {selectedNotifications.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => markAsRead(selectedNotifications)}
                      >
                        Mark Read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Archive className="w-4 h-4" />}
                        onClick={() => archiveNotifications(selectedNotifications)}
                      >
                        Archive
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectNotification(notification.id);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                      />

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

                              {notification.isImportant && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>

                            <p className={`text-sm ${
                              !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                            } line-clamp-2`}>
                              {notification.message}
                            </p>

                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.createdAt)}
                              </span>

                              {notification.category && (
                                <span className="text-xs text-gray-500">
                                  {notification.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleImportant(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                              {notification.isImportant ? (
                                <Star className="w-4 h-4 fill-current text-yellow-500" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification.isRead) {
                                  markAsUnread([notification.id]);
                                } else {
                                  markAsRead([notification.id]);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              {notification.isRead ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters or search query'
                      : 'You\'re all caught up! New notifications will appear here.'
                    }
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Notification Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Notification Settings"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Delivery Preferences
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <h5 className="font-medium text-gray-900">Email Notifications</h5>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
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
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <h5 className="font-medium text-gray-900">SMS Notifications</h5>
                    <p className="text-sm text-gray-600">Receive important updates via text</p>
                  </div>
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
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <h5 className="font-medium text-gray-900">Push Notifications</h5>
                    <p className="text-sm text-gray-600">Receive in-app notifications</p>
                  </div>
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
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Notification Types
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Appointment Reminders</h5>
                  <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    appointmentReminders: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Case Updates</h5>
                  <p className="text-sm text-gray-600">Get notified about case status changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.caseUpdates}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    caseUpdates: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Payment Notifications</h5>
                  <p className="text-sm text-gray-600">Get notified about payment status and receipts</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.paymentNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    paymentNotifications: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">System Notifications</h5>
                  <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.systemNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    systemNotifications: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Marketing Communications</h5>
                  <p className="text-sm text-gray-600">Receive product updates and promotional offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.marketingEmails}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    marketingEmails: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Quiet Hours
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              You won't receive notifications during these hours, except for urgent medical alerts.
            </p>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteNotifications(selectedNotifications)}
        title="Delete Notifications"
        message={`Are you sure you want to delete ${selectedNotifications.length} notification${selectedNotifications.length === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
};

export default PatientNotifications;