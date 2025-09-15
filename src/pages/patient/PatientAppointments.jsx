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
  Eye
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

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
      const methods = await execute(() => patientService.getPaymentMethods());
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
        appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduledTime);
        switch (dateRange) {
          case 'today':
            return appointmentDate.toDateString() === now.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return appointmentDate.toDateString() === tomorrow.toDateString();
          case 'week':
            const weekFromNow = new Date(now);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return appointmentDate >= now && appointmentDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(now);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return appointmentDate >= now && appointmentDate <= monthFromNow;
          case 'past':
            return appointmentDate < now;
          default:
            return true;
        }
      });
    }

    // Sort by date (upcoming first, then past in reverse order)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledTime);
      const dateB = new Date(b.scheduledTime);
      const now = new Date();

      if (dateA >= now && dateB >= now) {
        return dateA - dateB; // Upcoming: earliest first
      } else if (dateA < now && dateB < now) {
        return dateB - dateA; // Past: latest first
      } else {
        return dateA >= now ? -1 : 1; // Upcoming before past
      }
    });

    setFilteredAppointments(filtered);
  };

  const handleAcceptAppointment = async (caseId) => {
    try {
      await execute(() => patientService.acceptAppointment(caseId));
      await loadAppointments();
    } catch (error) {
      console.error('Failed to accept appointment:', error);
    }
  };

  const handleDeclineAppointment = async (reason) => {
    if (!selectedAppointment) return;
    
    try {
      await execute(() => patientService.declineAppointment(selectedAppointment.id, reason));
      await loadAppointments();
      setShowDeclineModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to decline appointment:', error);
    }
  };

  const handleRescheduleRequest = async (data) => {
    if (!selectedAppointment) return;
    
    try {
      await execute(() => patientService.requestReschedule(selectedAppointment.caseId, {
        ...data,
        appointmentId: selectedAppointment.id
      }));
      await loadAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      rescheduleForm.reset();
    } catch (error) {
      console.error('Failed to request reschedule:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedAppointment || !selectedPaymentMethod) return;
    
    try {
      await execute(() => patientService.payConsultationFee(selectedAppointment.caseId, {
        paymentMethodId: selectedPaymentMethod,
        amount: selectedAppointment.consultationFee
      }));
      await loadAppointments();
      setShowPaymentModal(false);
      setSelectedAppointment(null);
      setSelectedPaymentMethod('');
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      payment_pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-purple-100 text-purple-800',
      no_show: 'bg-orange-100 text-orange-800'
    };
    return colors[status?.toLowerCase()] || colors.scheduled;
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

  const stats = getAppointmentStats();

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
                <Link to="/patient/cases">
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

              {/* Filters */}
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

        {/* Appointments List */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredAppointments.length > 0 ? (
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

                          {/* Case Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-500" />
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
                            
                            {appointment.consultationFee && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-600">
                                  ${appointment.consultationFee}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Additional Details (Expandable) */}
                          {expandedCard === appointment.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p>Specialization: {appointment.doctor?.specialization}</p>
                                    <p>Experience: {appointment.doctor?.experience} years</p>
                                    <p>Hospital: {appointment.doctor?.hospital}</p>
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
                                variant="success"
                                size="sm"
                                icon={<Check className="w-4 h-4" />}
                                onClick={() => handleAcceptAppointment(appointment.caseId)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="error"
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
                            {['scheduled', 'confirmed'].includes(appointment.status?.toLowerCase()) && (
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
                  <Link to="/patient/cases">
                    <Button
                      variant="primary"
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Submit a Case
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Reschedule Request Modal */}
      <FormModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
          rescheduleForm.reset();
        }}
        onSubmit={rescheduleForm.handleSubmit(handleRescheduleRequest)}
        title="Request Reschedule"
        submitText="Send Request"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Reschedule *
            </label>
            <select
              {...rescheduleForm.register('reason')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a reason</option>
              <option value="personal_emergency">Personal Emergency</option>
              <option value="medical_emergency">Medical Emergency</option>
              <option value="work_conflict">Work Conflict</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
            {rescheduleForm.formState.errors.reason && (
              <p className="text-sm text-red-600 mt-1">
                {rescheduleForm.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred New Dates *
            </label>
            <div className="space-y-2">
              <input
                type="datetime-local"
                {...rescheduleForm.register('preferredDates.0')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <input
                type="datetime-local"
                {...rescheduleForm.register('preferredDates.1')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <input
                type="datetime-local"
                {...rescheduleForm.register('preferredDates.2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Please provide up to 3 preferred time slots
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              {...rescheduleForm.register('additionalNotes')}
              rows={3}
              placeholder="Any additional information for the doctor..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>Reschedule requests are subject to doctor availability. You will be notified of the doctor's response.</p>
              </div>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Decline Appointment Modal */}
      <ConfirmModal
        isOpen={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={(reason) => handleDeclineAppointment(reason || 'No reason provided')}
        title="Decline Appointment"
        message="Are you sure you want to decline this appointment? This action cannot be undone."
        confirmText="Decline Appointment"
        type="error"
        isLoading={loading}
        showReasonInput={true}
        reasonPlaceholder="Please provide a reason for declining..."
      />

      {/* Payment Modal */}
      <FormModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAppointment(null);
          setSelectedPaymentMethod('');
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handlePayment();
        }}
        title="Pay Consultation Fee"
        submitText="Process Payment"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Payment Details</h4>
                <p className="text-sm text-blue-800">
                  Doctor: {selectedAppointment?.doctor?.fullName} - {formatDateTime(selectedAppointment?.scheduledTime)}
                </p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  ${selectedAppointment?.consultationFee}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.type.toUpperCase()} •••• {method.lastFour}
                  {method.isDefault && ' (Default)'}
                </option>
              ))}
            </select>
            
            {paymentMethods.length === 0 && (
              <div className="mt-2">
                <Link to="/patient/payments">
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Payment Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="font-medium">${selectedAppointment?.consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">$5.00</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  ${(parseFloat(selectedAppointment?.consultationFee || 0) + 5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. You will receive a confirmation email after payment.</p>
              </div>
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PatientAppointments;