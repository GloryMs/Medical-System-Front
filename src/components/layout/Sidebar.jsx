import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  Bell, 
  CreditCard, 
  User, 
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  Shield,
  Stethoscope,
  Heart,
  DollarSign,
  Archive,
  UserCheck,
  Database,
  X,
  Activity,
  Clock,
  Star,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ open, onClose, userRole }) => {
  const location = useLocation();

  const getNavigationItems = () => {
    switch (userRole) {
      case 'PATIENT':
        return [
          { name: 'Dashboard', href: '/patient/dashboard', icon: Home },
          { name: 'My Cases', href: '/patient/cases', icon: FileText },
          { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
          { name: 'Notifications', href: '/patient/notifications', icon: Bell },
          { name: 'Payments & Billing', href: '/patient/payments', icon: CreditCard },
          { name: 'Payment History', href: '/patient/payments/history', icon: Archive },
          { name: 'Profile', href: '/patient/profile', icon: User },
          { name: 'Support & Complaints', href: '/patient/complaints', icon: MessageSquare },
          { name: 'Subscription', href: '/patient/subscription', icon: Settings },
        ];
      
      case 'DOCTOR':
        return [
          { name: 'Dashboard', href: '/doctor/dashboard', icon: Home },
          { name: 'Case Queue', href: '/doctor/cases', icon: FileText },
          { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
          { name: 'Schedule', href: '/doctor/schedule', icon: Clock },
          { name: 'Consultation Reports', href: '/doctor/reports', icon: Stethoscope },
          { name: 'Patient Communication', href: '/doctor/communication', icon: MessageSquare },
          { name: 'Earnings', href: '/doctor/earnings', icon: DollarSign },
          { name: 'Profile', href: '/doctor/profile', icon: User },
          { name: 'Settings', href: '/doctor/settings', icon: Settings },
        ];
      
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Doctor Verification', href: '/admin/doctors/verification', icon: UserCheck },
          { name: 'Case Management', href: '/admin/cases', icon: FileText },
          { name: 'Payment Management', href: '/admin/payments', icon: CreditCard },
          { name: 'Complaint Management', href: '/admin/complaints', icon: AlertTriangle },
          { name: 'System Reports', href: '/admin/reports', icon: BarChart3 },
          { name: 'Medical Configuration', href: '/admin/medical-config', icon: Database },
          { name: 'System Configuration', href: '/admin/configuration', icon: Settings },
          { name: 'Admin Settings', href: '/admin/settings', icon: Shield },
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'PATIENT':
        return 'text-blue-600';
      case 'DOCTOR':
        return 'text-green-600';
      case 'ADMIN':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'PATIENT':
        return <Heart className="w-5 h-5" />;
      case 'DOCTOR':
        return <Stethoscope className="w-5 h-5" />;
      case 'ADMIN':
        return <Shield className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo and brand */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MedConsult</h1>
                  <p className="text-xs text-gray-500">Medical Consultation System</p>
                </div>
              </div>
            </div>

            {/* User role indicator */}
            <div className="mt-5 px-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className={`${getRoleColor()}`}>
                  {getRoleIcon()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {userRole?.toLowerCase()} Portal
                  </p>
                  <p className="text-xs text-gray-500">Access Level</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section with quick stats */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
              {userRole === 'PATIENT' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Subscription Status</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Cases This Month</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              )}

              {userRole === 'DOCTOR' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Rating</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Cases Today</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              )}

              {userRole === 'ADMIN' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>System Status</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      <span className="font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Active Users</span>
                    <span className="font-medium">1,247</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              {/* Mobile logo */}
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">MedConsult</h1>
                    <p className="text-xs text-gray-500">Medical Consultation</p>
                  </div>
                </div>
              </div>

              {/* Mobile user role indicator */}
              <div className="mt-5 px-4">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`${getRoleColor()}`}>
                    {getRoleIcon()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {userRole?.toLowerCase()} Portal
                    </p>
                    <p className="text-xs text-gray-500">Access Level</p>
                  </div>
                </div>
              </div>

              {/* Mobile navigation */}
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-4 flex-shrink-0 h-6 w-6 ${
                          isActive ? 'text-primary-500' : 'text-gray-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile bottom section */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
              {userRole === 'PATIENT' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Subscription</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              )}

              {userRole === 'DOCTOR' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              )}

              {userRole === 'ADMIN' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>System</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="font-medium">Online</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;