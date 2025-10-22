
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  FileText, 
  Calendar, 
  CreditCard, 
  User, 
  Settings, 
  Bell,
  Users,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Database,
  Shield,
  Stethoscope,
  Heart,
  DollarSign,
  MessageSquare,
  Plus,
  Settings2
} from 'lucide-react';

import { CountBadge } from '../common/Badge';
import { useNotifications } from '../../hooks/useNotifications';

const Sidebar = ({ open, onClose, userRole, userId }) => {
  const location = useLocation();

  // Use improved hook for notification badge
  const { unreadCount } = useNotifications(true, 10000);

  const getNavigationItems = () => {
    switch (userRole) {
      case 'PATIENT':
        return [
          { name: 'Dashboard', href: '/app/patient/dashboard', icon: Home },
          { name: 'My Cases', href: '/app/patient/cases', icon: FileText },
          { name: 'Family Members', href: '/app/patient/dependents', icon: Users },
          { name: 'Appointments', href: '/app/patient/appointments', icon: Calendar },
          { name: 'Payments', href: '/app/patient/payments', icon: CreditCard },
          { name: 'Notifications', href: '/app/patient/notifications', icon: Bell, badge: unreadCount },
          { name: 'communication', href: '/app/patient/communication', icon: MessageSquare },
          { name: 'Complaints', href: '/app/patient/complaints', icon: AlertTriangle },
          { name: 'Profile', href: '/app/patient/profile', icon: User },
          { name: 'Subscription', href: '/app/patient/subscription', icon: Plus },
          { name: 'Settings', href: '/app/patient/settings', icon: Settings },
        ];
      
      case 'DOCTOR':
        return [
          { name: 'Dashboard', href: '/app/doctor/dashboard', icon: Home },
          { name: 'New Assignments', href: '/app/doctor/assignments', icon: Home },
          { name: 'Case Management', href: '/app/doctor/cases', icon: FileText },
          { name: 'Appointments', href: '/app/doctor/appointments', icon: Calendar },
          { name: 'Schedule', href: '/app/doctor/schedule', icon: Calendar },
          { name: 'Notifications', href: '/app/doctor/notifications', icon: Bell, badge: unreadCount },
          { name: 'Reports', href: '/app/doctor/reports', icon: FileText },
          { name: 'Earnings', href: '/app/doctor/earnings', icon: DollarSign },
          { name: 'Communication', href: '/app/doctor/communication', icon: MessageSquare },
          { name: 'Profile', href: '/app/doctor/profile', icon: User },
          { name: 'Settings', href: '/app/doctor/settings', icon: Settings },
        ];
      
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/app/admin/dashboard', icon: Home },
          { name: 'User Management', href: '/app/admin/users', icon: Users },
          { name: 'Doctor Verification', href: '/app/admin/doctors/verification', icon: UserCheck },
          { name: 'Case Management', href: '/app/admin/cases', icon: FileText },
          { name: 'Payment Management', href: '/app/admin/payments', icon: CreditCard },
          { name: 'Complaint Management', href: '/app/admin/complaints', icon: AlertTriangle },
          { name: 'System Reports', href: '/app/admin/reports', icon: BarChart3 },
          { name: 'Medical Configuration', href: '/app/admin/medical-config', icon: Database },
          { name: 'System Configuration', href: '/app/admin/configuration', icon: Settings },
          { name: 'Admin Settings', href: '/app/admin/settings', icon: Shield },
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href.replace('/app/', '/'));
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
      {/* Desktop sidebar - Fixed positioning with proper z-index */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo and brand */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediLink+</h1>
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
                  {/* <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name} */}


                  <div className="flex items-center space-x-3">
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`} />
                    <span>{item.name}</span>
                  </div>

                  {/* Show badge only for notification items with unread count */}
                  {item.badge && item.badge > 0 && (
                    <CountBadge 
                      count={item.badge} 
                      maxCount={99}
                      variant="error"
                      size="sm"
                    />
                  )}

                </Link>
              );
            })}
          </nav>

          {/* Bottom section - Optional */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">              
                <div className="inline-block h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />              
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {userRole} User - Id: {userId}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          {/* Mobile sidebar backdrop */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            {/* Mobile sidebar close button */}
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
                    <h1 className="text-xl font-bold text-gray-900">HealthBridge</h1>
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

                      {/* Show badge only for notification items with unread count */}
                      {item.badge && item.badge > 0 && (
                        <CountBadge 
                          count={item.badge} 
                          maxCount={99}
                          variant="error"
                          size="sm"
                        />
                      )}

                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { 
//   X, 
//   Home, 
//   FileText, 
//   Calendar, 
//   CreditCard, 
//   User, 
//   Settings, 
//   Bell,
//   Users,
//   UserCheck,
//   AlertTriangle,
//   BarChart3,
//   Database,
//   Shield,
//   Stethoscope,
//   Heart,
//   DollarSign,
//   MessageSquare,
//   Plus,
//   Settings2
// } from 'lucide-react';
// import { CountBadge } from '../common/Badge';
// import { useNotifications } from '../../hooks/useNotifications';

// const Sidebar = ({ open, onClose, userRole, userId }) => {
//   const location = useLocation();
  
//   // Use improved hook for notification badge
//   const { unreadCount } = useNotifications(true, 10000);

//   const getNavigationItems = () => {
//     switch (userRole) {
//       case 'PATIENT':
//         return [
//           { name: 'Dashboard', href: '/app/patient/dashboard', icon: Home },
//           { name: 'My Cases', href: '/app/patient/cases', icon: FileText },
//           { name: 'Family Members', href: '/app/patient/dependents', icon: Users },
//           { name: 'Appointments', href: '/app/patient/appointments', icon: Calendar },
//           { name: 'Payments', href: '/app/patient/payments', icon: CreditCard },
//           { name: 'Notifications', href: '/app/patient/notifications', icon: Bell, badge: unreadCount },
//           { name: 'communication', href: '/app/patient/communication', icon: MessageSquare },
//           { name: 'Complaints', href: '/app/patient/complaints', icon: AlertTriangle },
//           { name: 'Profile', href: '/app/patient/profile', icon: User },
//           { name: 'Subscription', href: '/app/patient/subscription', icon: Plus },
//           { name: 'Settings', href: '/app/patient/settings', icon: Settings },
//         ];
      
//       case 'DOCTOR':
//         return [
//           { name: 'Dashboard', href: '/app/doctor/dashboard', icon: Home },
//           { name: 'New Assignments', href: '/app/doctor/assignments', icon: Home },
//           { name: 'Case Management', href: '/app/doctor/cases', icon: FileText },
//           { name: 'Appointments', href: '/app/doctor/appointments', icon: Calendar },
//           { name: 'Schedule', href: '/app/doctor/schedule', icon: Calendar },
//           { name: 'Notifications', href: '/app/doctor/notifications', icon: Bell, badge: unreadCount },
//           { name: 'Reports', href: '/app/doctor/reports', icon: FileText },
//           { name: 'Earnings', href: '/app/doctor/earnings', icon: DollarSign },
//           { name: 'Communication', href: '/app/doctor/communication', icon: MessageSquare },
//           { name: 'Profile', href: '/app/doctor/profile', icon: User },
//           { name: 'Settings', href: '/app/doctor/settings', icon: Settings },
//         ];
      
//       case 'ADMIN':
//         return [
//           { name: 'Dashboard', href: '/app/admin/dashboard', icon: Home },
//           { name: 'User Management', href: '/app/admin/users', icon: Users },
//           { name: 'Doctor Verification', href: '/app/admin/doctors/verification', icon: UserCheck },
//           { name: 'Case Management', href: '/app/admin/cases', icon: FileText },
//           { name: 'Payment Management', href: '/app/admin/payments', icon: CreditCard },
//           { name: 'Complaint Management', href: '/app/admin/complaints', icon: AlertTriangle },
//           { name: 'System Reports', href: '/app/admin/reports', icon: BarChart3 },
//           { name: 'Medical Configuration', href: '/app/admin/medical-config', icon: Database },
//           { name: 'System Configuration', href: '/app/admin/configuration', icon: Settings },
//           { name: 'Admin Settings', href: '/app/admin/settings', icon: Shield },
//         ];
      
//       default:
//         return [];
//     }
//   };

//   const navigationItems = getNavigationItems();

//   const isActive = (href) => {
//     return location.pathname === href;
//   };

//   return (
//     <>
//       {/* Mobile overlay */}
//       {open && (
//         <div 
//           className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed left-0 top-0 z-50 lg:z-30 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 transform ${
//           open ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0`}
//       >
//         {/* Header with close button */}
//         <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
//           <h1 className="text-xl font-bold text-primary-600">MediConsult</h1>
//           <button
//             onClick={onClose}
//             className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="p-4 space-y-1">
//           {navigationItems.map((item) => (
//             <Link
//               key={item.href}
//               to={item.href}
//               onClick={onClose}
//               className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
//                 isActive(item.href)
//                   ? 'bg-primary-50 text-primary-600'
//                   : 'text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <item.icon className="w-5 h-5" />
//                 <span>{item.name}</span>
//               </div>
              
//               {/* Show badge only for notification items with unread count */}
//               {item.badge && item.badge > 0 && (
//                 <CountBadge 
//                   count={item.badge} 
//                   maxCount={99}
//                   variant="error"
//                   size="sm"
//                 />
//               )}
//             </Link>
//           ))}
//         </nav>

//         {/* Footer info */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
//           <p className="text-xs text-gray-500 text-center">
//             Medical Consultation System
//           </p>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;