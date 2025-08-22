import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

    if (location.pathname === '/') {
    const dashboardRoute = user?.role === 'PATIENT' ? '/patient/dashboard' :
                          user?.role === 'DOCTOR' ? '/doctor/dashboard' :
                          user?.role === 'ADMIN' ? '/admin/dashboard' : 
                          '/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  // if (requiredRole && user?.role !== requiredRole) {
  //   // Redirect to access denied page
  //   return <Navigate to="/access-denied" replace />;
  // }

  // // Check if patient has active subscription
  // if (user?.role === 'PATIENT' && user?.subscription?.status !== 'ACTIVE') {
  //   // Allow access to subscription management and profile pages
  //   const allowedPaths = [
  //     '/patient/profile',
  //     '/patient/subscription',
  //     '/patient/payments'
  //   ];
    
  //   if (!allowedPaths.some(path => location.pathname.startsWith(path))) {
  //     return <Navigate to="/patient/subscription" replace />;
  //   }
  // }

  return children;
};

export default ProtectedRoute;