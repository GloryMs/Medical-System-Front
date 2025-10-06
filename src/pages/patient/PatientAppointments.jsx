import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  User,
  FileText,
  CreditCard,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  Edit,
  ExternalLink,
  MapPin,
  DollarSign,
  History,
  Bell,
  CheckCircle,
  XCircle,
  PlayCircle,
  Pause,
  Calendar as CalendarIcon,
  Eye,
  List,
  Grid
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schemas
const rescheduleSchema = yup.object({
  reason: yup.string().required('Reason is required'),
  preferredDates: yup.array().min(1, 'At least one preferred date is required'),
  additionalNotes: yup.string()
});

const PatientAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  
  // NEW: View mode state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Form setup
  const rescheduleForm = useForm({
    resolver: yupResolver(rescheduleSchema),
    defaultValues: {
      reason: '',
      preferredDates: [],
      additionalNotes: ''
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadAppointments();
    loadPaymentMethods();
  }, []);

  // Filter appointments when search term or filters change
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateRange]);

  const loadAppointments = async () => {
    try {
      const data = await execute(() => patientService.getAppointments());
      setAppointments(data || []);
      
      // Separate upcoming appointments
      const now = new Date();
      const upcoming = data?.filter(app => 
        new Date(app.scheduledTime) > now && 
        ['scheduled', 'confirmed', 'payment_pending'].includes(app.status?.toLowerCase())
      ).slice(0, 3) || [];
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await execute(() => commonService.getMedicalConfigurations('PAYMENTMETHOD'));
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.doctor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.caseId?.toString().includes(searchTerm) ||
        appointment.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status?.toLowerCase() === statusFilter
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledTime);
        const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
        
        switch (dateRange) {
          case 'today':
            return appointmentDateOnly.getTime() === today.getTime();
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return appointmentDateOnly.getTime() === tomorrow.getTime();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return appointmentDateOnly >= today && appointmentDateOnly <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setDate(monthFromNow.getDate() + 30);
            return appointmentDateOnly >= today && appointmentDateOnly <= monthFromNow;
          case 'past':
            return appointmentDateOnly < today;
          default:
            return true;
        }
      });
    }

    // Sort by scheduled time
    filtered.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
    
    setFilteredAppointments(filtered);
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const canJoinConsultation = (appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledTime);
    const timeDiff = appointmentTime - now;
    
    return appointment.status?.toLowerCase() === 'confirmed' && 
           timeDiff <= 900000 && // 15 minutes before
           timeDiff >= -1800000; // 30 minutes after
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const upcoming = appointments.filter(a => 
      new Date(a.scheduledTime) > new Date() && 
      !['cancelled', 'completed'].includes(a.status?.toLowerCase())
    ).length;
    const completed = appointments.filter(a => a.status?.toLowerCase() === 'completed').length;
    const cancelled = appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length;

    return { total, upcoming, completed, cancelled };
  };

  // Calendar utility functions
  const getWeekDates = (date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    
    startDate.setDate(startDate.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      week.push(currentDate);
    }
    
    return week;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toDateString();
    return filteredAppointments.filter(appointment => 
      new Date(appointment.scheduledTime).toDateString() === dateStr
    );
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };



  // Event handlers


  const handleAcceptAppointment = async (appointment) => {
    // Instead of directly accepting, show payment modal first
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handleReschedule = async (data) => {
    try {
      await execute(() => patientService.rescheduleAppointment(selectedAppointment.id, data));
      await loadAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      rescheduleForm.reset();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
    }
  };

  const handleDeclineAppointment = async () => {
    try {
      await execute(() => patientService.declineAppointment(selectedAppointment.id));
      await loadAppointments();
      setShowDeclineModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to decline appointment:', error);
    }
  };

//   const handlePayment = async () => {
//     if (!selectedPaymentMethod) return;
    
//     try {
//       await execute(() => patientService.processPayment(selectedAppointment.id, {
//         paymentMethod: selectedPaymentMethod,
//         amount: selectedAppointment.consultationFee
//       }));
//       await loadAppointments();
//       setShowPaymentModal(false);
//       setSelectedAppointment(null);
//       setSelectedPaymentMethod('');
//     } catch (error) {
//       console.error('Failed to process payment:', error);
//     }
//   };

        // New function to handle payment and then accept appointment
    const handlePaymentAndAccept = async () => {
      if (!selectedAppointment || !selectedPaymentMethod) return;
    
      try {
        // First process the payment with correct ProcessPaymentDto structure
        await execute(() => patientService.payConsultationFee(
          {
            patientId: user.id, // Current logged-in patient ID
            doctorId: selectedAppointment.doctor?.id || selectedAppointment.doctor.userId, // Doctor's ID
            caseId: selectedAppointment.caseId,
            paymentType: 'CONSULTATION', // PaymentType enum value
            amount: selectedAppointment.consultationFee || selectedAppointment.doctor?.caseRate ,
            paymentMethod: selectedPaymentMethod // This should be the payment method code (e.g., 'CREDIT_CARD', 'PAYPAL', etc.)
          }
        ));
      
        // Reload appointments to reflect changes
        await loadAppointments();
      
        // Close modal and reset state
        setShowPaymentModal(false);
        setSelectedAppointment(null);
        setSelectedPaymentMethod('');
      
        // Show success message
        alert('Payment processed successfully! Appointment confirmed.');
      } catch (error) {
        console.error('Failed to process payment and accept appointment:', error);
        // Show error message
        alert('Payment failed. Please try again.');
      }
    };

  const stats = getAppointmentStats();

  // Compact Calendar component
  const CompactCalendarView = () => {
    const weekDates = getWeekDates(currentDate);
    const today = new Date().toDateString();
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek(-1)}
            icon={<ChevronLeft className="w-4 h-4" />}
          />
          <h3 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek(1)}
            icon={<ChevronRight className="w-4 h-4" />}
          />
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === today;
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            return (
              <div 
                key={index} 
                className={`text-center p-2 rounded-lg border transition-colors ${
                  isToday 
                    ? 'bg-blue-50 border-blue-200' 
                    : dayAppointments.length > 0 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* Appointment indicators */}
                <div className="flex justify-center space-x-1">
                  {dayAppointments.slice(0, 3).map((appointment, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        appointment.status?.toLowerCase() === 'completed' 
                          ? 'bg-green-500' 
                          : appointment.status?.toLowerCase() === 'cancelled' 
                            ? 'bg-red-500' 
                            : 'bg-primary-500'
                      }`}
                      title={`${appointment.doctor?.fullName} - ${formatTime(appointment.scheduledTime)}`}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* This week's appointments */}
        {filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.scheduledTime);
          return weekDates.some(date => date.toDateString() === aptDate.toDateString());
        }).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">This Week's Appointments</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filteredAppointments
                .filter(apt => {
                  const aptDate = new Date(apt.scheduledTime);
                  return weekDates.some(date => date.toDateString() === aptDate.toDateString());
                })
                .map(appointment => (
                  <div
                    key={appointment.id}
                    onClick={() => navigate(`/app/patient/appointments/${appointment.id}`)}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        {getConsultationTypeIcon(appointment.consultationType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dr. {appointment.doctor?.fullName}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(appointment.scheduledTime)}</p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} size="xs" />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="mt-1 text-sm text-gray-600">
                  View and manage your scheduled consultations
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={loadAppointments}
                >
                  Refresh
                </Button>
                <Link to="/app/patient/cases">
                  <Button
                    variant="primary"
                    icon={<Calendar className="w-4 h-4" />}
                  >
                    Schedule New
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Appointments"
            value={stats.total}
            icon={<Calendar className="w-6 h-6" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          
          <StatsCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Clock className="w-6 h-6" />}
            className="bg-gradient-to-br from-green-50 to-green-100"
          />
          
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100"
          />
          
          <StatsCard
            title="Cancelled"
            value={stats.cancelled}
            icon={<XCircle className="w-6 h-6" />}
            className="bg-gradient-to-br from-red-50 to-red-100"
          />
        </div>

        {/* Upcoming Appointments Alert */}
        {upcomingAppointments.length > 0 && (
          <AlertCard
            type="info"
            title="Upcoming Appointments"
            message={`You have ${upcomingAppointments.length} upcoming appointments in the next few days.`}
            className="mb-6"
          >
            <div className="mt-4 space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getConsultationTypeIcon(appointment.consultationType)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Doctor: {appointment.doctor?.fullName}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(appointment.scheduledTime)}</p>
                    </div>
                  </div>
                  <StatusBadge status={appointment.status} size="sm" />
                </div>
              ))}
            </div>
          </AlertCard>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters and View Toggle */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">Next 7 Days</option>
                  <option value="month">Next 30 Days</option>
                  <option value="past">Past Appointments</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    icon={<List className="w-4 h-4" />}
                    className="text-xs"
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    icon={<CalendarIcon className="w-4 h-4" />}
                    className="text-xs"
                  >
                    Week
                  </Button>
                </div>

                {(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateRange('all');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Appointments Display */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredAppointments.length > 0 ? (
              viewMode === 'calendar' ? (
                <CompactCalendarView />
              ) : (
                // ORIGINAL APPOINTMENT LIST - UNCHANGED
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Main Appointment Info */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                              {getConsultationTypeIcon(appointment.consultationType)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Doctor: {appointment.doctor?.fullName}
                                </h3>
                                <StatusBadge status={appointment.status} />
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(appointment.scheduledTime)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(appointment.scheduledTime)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span>{appointment.doctor?.rating || 'N/A'}</span>
                                </span>
                              </div>
                            </div>
                          </div>


                          {/* Case Information - Updated with Case Rate */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Case Rate and Case ID */}
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-primary-500" />
                              <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                ${appointment.consultationFee || appointment.doctor?.caseRate || 'N/A'}
                              </span>
                              <FileText className="w-4 h-4 text-primary-500 ml-2" />
                              <span className="text-sm text-gray-600">
                                Case #{appointment.caseId}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">
                                {appointment.duration || 30} minutes
                              </span>
                            </div>
                            
                            {/* {appointment.consultationFee && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-600">
                                  ${appointment.consultationFee}
                                </span>
                              </div>
                            )} */}
                          </div>

                          {/* Additional Details (Expandable) - Updated Doctor Information */}
                          {expandedCard === appointment.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p>
                                      <span className="font-medium">Specialization:</span> {
                                        appointment.doctor?.primarySpecialization || 
                                        appointment.doctor?.specialization || 
                                        'N/A'
                                      }
                                    </p>
                                    <p>
                                      <span className="font-medium">Experience:</span> {
                                        appointment.doctor?.yearsOfExperience || 
                                        appointment.doctor?.experience || 
                                        'N/A'
                                      } years
                                    </p>
                                    {appointment.doctor?.languages && appointment.doctor.languages.length > 0 && (
                                      <p>
                                        <span className="font-medium">Languages:</span> {
                                          Array.isArray(appointment.doctor.languages) 
                                            ? appointment.doctor.languages.map(lang => {
                                                // Convert language codes to readable names
                                                const languageNames = {
                                                  'EN': 'English',
                                                  'ES': 'Spanish', 
                                                  'FR': 'French',
                                                  'DE': 'German',
                                                  'AR': 'Arabic',
                                                  'ZH': 'Chinese'
                                                };
                                                return languageNames[lang] || lang;
                                              }).join(', ')
                                            : appointment.doctor.languages
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p>Type: {appointment.consultationType}</p>
                                    <p>Created: {formatDateTime(appointment.createdAt)}</p>
                                    {appointment.rescheduleCount > 0 && (
                                      <p>Rescheduled: {appointment.rescheduleCount} times</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {appointment.notes && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                  <p className="text-sm text-gray-600">{appointment.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          {/* Join Consultation Button */}
                          {canJoinConsultation(appointment) && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<PlayCircle className="w-4 h-4" />}
                              onClick={() => window.open(appointment.meetingLink, '_blank')}
                              className="animate-pulse"
                            >
                              Join Now
                            </Button>
                          )}

                          {/* Status-specific Actions */}
                          {appointment.status?.toLowerCase() === 'scheduled' && (
                            <div className="flex space-x-2">
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<CreditCard className="w-4 h-4" />}
                                onClick={() => handleAcceptAppointment(appointment)}
                              >
                                Pay & Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowDeclineModal(true);
                                }}
                              >
                                Decline
                              </Button>
                            </div>
                          )}

                          {appointment.status?.toLowerCase() === 'payment_pending' && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CreditCard className="w-4 h-4" />}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowPaymentModal(true);
                              }}
                            >
                              Pay Now
                            </Button>
                          )}

                          {/* Common Actions */}
                          <div className="flex space-x-2">
                            {['scheduled'].includes(appointment.status?.toLowerCase()) && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Edit className="w-4 h-4" />}
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowRescheduleModal(true);
                                }}
                              >
                                Reschedule
                              </Button>
                            )}

                            <Link to={`/app/patient/cases/${appointment.caseId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Eye className="w-4 h-4" />}
                              >
                                View Case
                              </Button>
                            </Link>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={expandedCard === appointment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              onClick={() => setExpandedCard(expandedCard === appointment.id ? null : appointment.id)}
                            >
                              {expandedCard === appointment.id ? 'Less' : 'More'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                    ? 'No appointments found'
                    : 'No appointments yet'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Schedule your first consultation by submitting a case'
                  }
                </p>
                {!(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
                  <Link to="/app/patient/cases">
                    <Button
                      variant="primary"
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Schedule Your First Appointment
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      {showRescheduleModal && (
        <FormModal
          title="Reschedule Appointment"
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
            rescheduleForm.reset();
          }}
          onSubmit={rescheduleForm.handleSubmit(handleReschedule)}
          loading={loading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rescheduling *
              </label>
              <textarea
                {...rescheduleForm.register('reason')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Please explain why you need to reschedule..."
              />
              {rescheduleForm.formState.errors.reason && (
                <p className="text-sm text-red-600 mt-1">
                  {rescheduleForm.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...rescheduleForm.register('additionalNotes')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Any additional information..."
              />
            </div>
          </div>
        </FormModal>
      )}

      {showDeclineModal && (
        <ConfirmModal
          title="Decline Appointment"
          message="Are you sure you want to decline this appointment? This action cannot be undone."
          isOpen={showDeclineModal}
          onClose={() => {
            setShowDeclineModal(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleDeclineAppointment}
          confirmText="Yes, Decline"
          cancelText="Cancel"
          loading={loading}
          type="danger"
        />
      )}

      {showPaymentModal && selectedAppointment && (
        <FormModal
          title="Complete Payment"
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedAppointment(null);
            setSelectedPaymentMethod('');
          }}
          onSubmit={handlePaymentAndAccept}
          loading={loading}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultation Fee:</span>
                <span className="font-medium text-gray-900">
                  ${selectedAppointment.consultationFee}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.code} value={method.name}>
                    {method.name}
                  </option>
                ))}
              </select>
              {!selectedPaymentMethod && (
                <p className="text-sm text-red-600 mt-1">Please select a payment method</p>
              )}
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default PatientAppointments;