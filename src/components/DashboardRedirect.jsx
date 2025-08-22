import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch(user.role) {
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <div>Unknown user role</div>;
  }
};

export default DashboardRedirect;