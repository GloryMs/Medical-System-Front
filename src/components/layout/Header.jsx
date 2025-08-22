import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  MessageSquare,
  CreditCard,
  Shield
} from 'lucide-react';
import Button from '../common/Button';
import Badge, { CountBadge } from '../common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const Header = ({ onMenuClick, user }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileLink = () => {
    switch (user?.role) {
      case 'PATIENT':
        return '/patient/profile';
      case 'DOCTOR':
        return '/doctor/profile';
      case 'ADMIN':
        return '/admin/settings';
      default:
        return '/profile';
    }
  };

  const getSettingsLink = () => {
    switch (user?.role) {
      case 'PATIENT':
        return '/patient/subscription';
      case 'DOCTOR':
        return '/doctor/settings';
      case 'ADMIN':
        return '/admin/configuration';
      default:
        return '/settings';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setNotificationDropdownOpen(false);
    // Navigate to relevant page based on notification type
    // This would be implemented based on your routing logic
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
            icon={<Menu className="w-5 h-5" />}
          />

          {/* Search bar */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases, patients, doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions based on role */}
          {user?.role === 'PATIENT' && (
            <Link to="/patient/cases">
              <Button variant="outline" size="sm">
                New Case
              </Button>
            </Link>
          )}
          
          {user?.role === 'DOCTOR' && (
            <Link to="/doctor/cases">
              <Button variant="outline" size="sm">
                View Cases
              </Button>
            </Link>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative"
              icon={<Bell className="w-5 h-5" />}
            />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1">
                <CountBadge count={unreadCount} variant="error" size="xs" />
              </div>
            )}

            {/* Notifications dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          !notification.isRead ? 'bg-primary-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <Link
                    to={`/${user?.role?.toLowerCase()}/notifications`}
                    className="block text-center text-sm text-primary-600 hover:text-primary-500"
                    onClick={() => setNotificationDropdownOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <Button
              variant="ghost"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 text-sm"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  <Badge variant="outline" size="xs">
                    {user?.role}
                  </Badge>
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>

            {/* Profile dropdown menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    to={getProfileLink()}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>

                  <Link
                    to={getSettingsLink()}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>

                  {user?.role === 'PATIENT' && (
                    <Link
                      to="/patient/payments"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Billing
                    </Link>
                  )}

                  {user?.role === 'DOCTOR' && (
                    <Link
                      to="/doctor/earnings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Earnings
                    </Link>
                  )}

                  <Link
                    to={`/${user?.role?.toLowerCase()}/communication`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Messages
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin/configuration"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      Administration
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;