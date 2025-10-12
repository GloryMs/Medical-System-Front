import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';


// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientCases from './pages/patient/PatientCases';
import CaseDetails from './pages/patient/CaseDetails';
import PatientAppointments from './pages/patient/PatientAppointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import PatientNotifications from './pages/patient/PatientNotifications';
import DoctorCommunication from './pages/patient/DoctorCommunication';
import PatientPayments from './pages/patient/PatientPayments';
import PaymentHistory from './pages/patient/PaymentHistory';
import PatientProfile from './pages/patient/PatientProfile';
import PatientComplaints from './pages/patient/PatientComplaints';
import ComplaintDetails from './pages/patient/ComplaintDetails';
import SubscriptionManagement from './pages/patient/SubscriptionManagement';
import PatientSettings from './pages/patient/PatientSettings';
import EditCase from './pages/patient/EditCase';
import CreateCase from './pages/patient/CreateCase';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorNewAssignments from './pages/doctor/DoctorNewAssignments';
import DoctorCasesManagement from './pages/doctor/DoctorCasesManagement';
import DoctorCaseDetails from './pages/doctor/DoctorCaseDetails';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorNotifications from './pages/doctor/DoctorNotifications';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import PatientCommunication from './pages/doctor/PatientCommunication';
import DoctorSettings from './pages/doctor/DoctorSettings';
import ReportsListPage from './pages/doctor/ReportsListPage';
import CreateReport from './pages/doctor/CreateReport';
import ViewReport from './pages/doctor/ViewReport';
import EditReport from './pages/doctor/EditReport';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DoctorVerification from './pages/admin/DoctorVerification';
import CaseManagement from './pages/admin/CaseManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import SystemReports from './pages/admin/SystemReports';
import SystemConfiguration from './pages/admin/SystemConfiguration';
import MedicalConfiguration from './pages/admin/MedicalConfiguration';
import AdminSettings from './pages/admin/AdminSettings';

// Common Pages
import NotFound from './pages/common/NotFound';
import AccessDenied from './pages/common/AccessDenied';
import ServerError from './pages/common/ServerError';

// Styles
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  useSocket(); // Initialize WebSocket connection

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role) {
      case 'PATIENT':
        return '/app/patient/dashboard';
      case 'DOCTOR':
        return '/app/doctor/dashboard';
      case 'ADMIN':
        return '/app/admin/dashboard';
      default:
        return '/';
    }
  };

  return (

    <>
      {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes with Layout */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Default Route for authenticated users */}
          <Route index element={<Navigate to={getDefaultRoute().replace('/app/', '')} replace />} />

          {/* Patient Routes */}
          <Route path="patient/*" element={
            <ProtectedRoute requiredRole="PATIENT">
              <Routes>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="cases" element={<PatientCases />} />
                <Route path="cases/:caseId" element={<CaseDetails />} />
                <Route path="cases/:caseId/edit" element={<EditCase />} />
                <Route path="cases/create" element={<CreateCase />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="notifications" element={<PatientNotifications />} />
                <Route path="payments" element={<PatientPayments />} />
                <Route path="payments/history" element={<PaymentHistory />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="complaints" element={<PatientComplaints />} />
                <Route path="complaints/:id" element={<ComplaintDetails />} />
                <Route path="subscription" element={<SubscriptionManagement />} />
                <Route path="settings" element={<PatientSettings />} /> 
                <Route path="communication" element={<DoctorCommunication />} />           
              </Routes>
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="doctor/*" element={
            <ProtectedRoute requiredRole="DOCTOR">
              <Routes>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="assignments" element={<DoctorNewAssignments/>}/>
                <Route path="cases" element={<DoctorCasesManagement />} />
                <Route path="cases/:caseId" element={<DoctorCaseDetails />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="notifications" element={<DoctorNotifications />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="earnings" element={<DoctorEarnings />} />
                <Route path="communication" element={<PatientCommunication />} />
                <Route path="settings" element={<DoctorSettings />} />
                <Route path="reports" element={<ReportsListPage />} />
                <Route path="reports/create" element={<CreateReport />} />
                <Route path="reports/:reportId" element={<ViewReport />} />
                <Route path="reports/:reportId/edit" element={<EditReport />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin/*" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="doctors/verification" element={<DoctorVerification />} />
                <Route path="cases" element={<CaseManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="complaints" element={<ComplaintManagement />} />
                <Route path="reports" element={<SystemReports />} />
                <Route path="configuration" element={<SystemConfiguration />} />
                <Route path="medical-config" element={<MedicalConfiguration />} />
                <Route path="settings" element={<AdminSettings />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Route>

        {/* Legacy Routes for Direct Access (Redirect to /app) */}
        <Route path="/patient/*" element={<Navigate to="/app/patient" replace />} />
        <Route path="/doctor/*" element={<Navigate to="/app/doctor" replace />} />
        <Route path="/admin/*" element={<Navigate to="/app/admin" replace />} />

        {/* Error Pages */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;