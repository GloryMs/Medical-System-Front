import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

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
import PatientPayments from './pages/patient/PatientPayments';
import PaymentHistory from './pages/patient/PaymentHistory';
import PatientProfile from './pages/patient/PatientProfile';
import PatientComplaints from './pages/patient/PatientComplaints';
import ComplaintDetails from './pages/patient/ComplaintDetails';
import SubscriptionManagement from './pages/patient/SubscriptionManagement';

//Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorCases from './pages/doctor/DoctorCases';
import DoctorCaseDetails from './pages/doctor/DoctorCaseDetails';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import ConsultationReports from './pages/doctor/ConsultationReports';
import CreateReport from './pages/doctor/CreateReport';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import PatientCommunication from './pages/doctor/PatientCommunication';
import DoctorSettings from './pages/doctor/DoctorSettings';

//Admin Pages
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

const AppContent = () => {
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
    if (!isAuthenticated) return '/login';
    
    switch (user?.role) {
      case 'PATIENT':
        return '/patient/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />
        } /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Default Route */}
          <Route index element={<Navigate to={getDefaultRoute()} />} />

          {/* Patient Routes */}
          <Route path="patient/*" element={
            <ProtectedRoute requiredRole="PATIENT">
              <Routes>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="cases" element={<PatientCases />} />
                <Route path="cases/:id" element={<CaseDetails />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="appointments/:id" element={<AppointmentDetails />} />
                <Route path="notifications" element={<PatientNotifications />} />
                <Route path="payments" element={<PatientPayments />} />
                <Route path="payments/history" element={<PaymentHistory />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="complaints" element={<PatientComplaints />} />
                <Route path="complaints/:id" element={<ComplaintDetails />} />
                <Route path="subscription" element={<SubscriptionManagement />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="doctor/*" element={
            <ProtectedRoute requiredRole="DOCTOR">
              <Routes>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="cases" element={<DoctorCases />} />
                <Route path="cases/:id" element={<DoctorCaseDetails />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="reports" element={<ConsultationReports />} />
                <Route path="reports/create/:caseId" element={<CreateReport />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="earnings" element={<DoctorEarnings />} />
                <Route path="communication" element={<PatientCommunication />} />
                <Route path="settings" element={<DoctorSettings />} />
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

        {/* Error Routes */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;