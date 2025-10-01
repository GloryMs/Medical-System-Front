import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  Filter,
  X,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

// Utility functions
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validation schemas
const rescheduleSchema = yup.object({
  scheduledTime: yup.date().required('New date/time is required').min(new Date(), 'Date must be in the future'),
  reason: yup.string().required('Reason is required').min(10, 'Please provide detailed reason')
});

const cancelSchema = yup.object({
  reason: yup.string().required('Cancellation reason is required').min(10, 'Please provide detailed reason')
});

// Constants
const CONSULTATION_TYPE = {
  VIDEO_CONSULTATION: 'Video Call',
  PHONE_CALL: 'Phone Call',
  ZOOM: 'Zoom',
  WHATSAPP: 'WhatsApp'
};

const VIEW_MODES = {
  LIST: 'list',
  CALENDAR: 'calendar'
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // Forms
  const rescheduleForm = useForm({
    resolver: yupResolver(rescheduleSchema)
  });

  const cancelForm = useForm({
    resolver: yupResolver(cancelSchema)
  });

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
  }, []);

  // Filter appointments when search/filter changes
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter, typeFilter]);

  // Update stats when appointments change
  useEffect(() => {
    updateStats();
  }, [appointments]);

  const loadAppointments = async () => {
    try {
      const data = await execute(() => doctorService.getAppointments());
      setAppointments(data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.doctor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.caseId?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => 
        apt.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.scheduledTime);
        
        switch(dateFilter) {
          case 'today':
            return aptDate >= today && aptDate < tomorrow;
          case 'tomorrow':
            return aptDate >= tomorrow && aptDate < new Date(tomorrow.getTime() + 24*60*60*1000);
          case 'week':
            return aptDate >= today && aptDate < weekFromNow;
          case 'past':
            return aptDate < today;
          default:
            return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => 
        apt.consultationType?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredAppointments(filtered);
  };

  const updateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setStats({
      total: appointments.length,
      today: appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledTime);
        return aptDate >= today && aptDate < tomorrow;
      }).length,
      upcoming: appointments.filter(apt => 
        new Date(apt.scheduledTime) > now && 
        !['cancelled', 'completed', 'no_show'].includes(apt.status?.toLowerCase())
      ).length,
      completed: appointments.filter(apt => 
        apt.status?.toLowerCase() === 'completed'
      ).length,
      cancelled: appointments.filter(apt => 
        apt.status?.toLowerCase() === 'cancelled'
      ).length
    });
  };

  // Event handlers
  const handleReschedule = async (data) => {
    try {
      await execute(() => 
        doctorService.rescheduleAppointment(selectedAppointment.id, {
          scheduledTime: data.scheduledTime,
          reason: data.reason
        })
      );
      await loadAppointments();
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      rescheduleForm.reset();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
    }
  };

  const handleCancel = async (data) => {
    try {
      await execute(() => 
        doctorService.cancelAppointment(selectedAppointment.id, data.reason)
      );
      await loadAppointments();
      setShowCancelModal(false);
      setSelectedAppointment(null);
      cancelForm.reset();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleJoinConsultation = (appointment) => {
    if (appointment.meetingLink) {
      window.open(appointment.meetingLink, '_blank');
    }
  };

  // const handleCompleteAppointment = async (appointment) => {
  //   try {
  //     await execute(() => doctorService.completeAppointment(appointment.id));
  //     await loadAppointments();
  //     // Navigate to create report after completing
  //     navigate(`/app/doctor/reports/create`, {
  //       state: {
  //         appointmentId: appointment.id,
  //         caseId: appointment.caseId,
  //         patientId: appointment.patientId
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Failed to complete appointment:', error);
  //   }
  // };

  const handleCompleteAppointment = async (appointment) => {
    try {
      // Create CompleteAppointmentDto object
      const completeDto = {
        appointmentId: appointment.id,
        caseId: appointment.caseId,
        patientId: appointment.patientId
      };
      
      // Pass the DTO object instead of just ID
      await execute(() => doctorService.completeAppointment(completeDto));
      await loadAppointments();
      setShowCompleteConfirmModal(false);
      setSelectedAppointment(null);
      
      navigate(`/app/doctor/reports/create`, {
        state: {
          appointmentId: appointment.id,
          caseId: appointment.caseId,
          patientId: appointment.patientId
        }
      });
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  const handleViewCase = (caseId) => {
    navigate(`/app/doctor/cases/${caseId}`);
  };

  const handleViewReport = (appointment) => {
    navigate(`/app/doctor/reports`, {
      state: { appointmentId: appointment.id }
    });
  };

  // Calendar view functions - MONTHLY CALENDAR
  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();
    
    // Calculate days to show from previous month
    const daysFromPrevMonth = startingDayOfWeek;
    
    // Calculate total days to show (should be multiple of 7)
    const totalDays = Math.ceil((daysFromPrevMonth + lastDay.getDate()) / 7) * 7;
    
    const dates = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - daysFromPrevMonth);
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }
    
    return dates;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toDateString();
    return filteredAppointments.filter(apt => 
      new Date(apt.scheduledTime).toDateString() === dateStr
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Render functions
  const renderConsultationTypeIcon = (type) => {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('video') || typeStr.includes('zoom')) {
      return <Video className="w-4 h-4" />;
    } else if (typeStr.includes('phone') || typeStr.includes('call')) {
      return <Phone className="w-4 h-4" />;
    } else if (typeStr.includes('whatsapp')) {
      return <MessageSquare className="w-4 h-4" />;
    }
    return <Video className="w-4 h-4" />;
  };

  // Updated permission functions based on requirements
  const canViewDetails = (appointment) => {
    return true; // All appointments can view details
  };

  const canViewCase = (appointment) => {
    return appointment.caseId !== null && appointment.caseId !== undefined;
  };

  const canCancel = (appointment) => {
    const status = appointment.status?.toLowerCase();
    return ['scheduled', 'rescheduled', 'confirmed'].includes(status);
  };

  const canJoin = (appointment) => {
    const status = appointment.status?.toLowerCase();
    const aptTime = new Date(appointment.scheduledTime);
    const now = new Date();
    const timeDiff = (aptTime - now) / (1000 * 60); // minutes
    
    return status === 'confirmed' && 
           timeDiff <= 15 && 
           timeDiff >= -30 &&
           appointment.meetingLink;
  };

  const canComplete = (appointment) => {
    const status = appointment.status?.toLowerCase();
    return status === 'confirmed';
  };

  const canViewReport = (appointment) => {
    const status = appointment.status?.toLowerCase();
    return status === 'completed';
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map(appointment => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              {/* Appointment Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {appointment.doctor?.fullName || 'Patient Name N/A'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={appointment.status} />
                      {appointment.rescheduleCount > 0 && (
                        <Badge variant="warning" size="sm">
                          Rescheduled {appointment.rescheduleCount}x
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(appointment.scheduledTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(appointment.scheduledTime)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      {renderConsultationTypeIcon(appointment.consultationType)}
                      <span>{CONSULTATION_TYPE[appointment.consultationType] || appointment.consultationType}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.duration || 30} minutes</span>
                    </div>
                    
                    {appointment.caseId && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Case ID: #{appointment.caseId}</span>
                      </div>
                    )}

                    {appointment.rescheduleReason && (
                      <div className="flex items-start space-x-2 text-yellow-600">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <span className="text-xs">{appointment.rescheduleReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Based on Status */}
              <div className="flex flex-col space-y-2 ml-4">
                {/* CONFIRMED status actions */}
                {appointment.status?.toLowerCase() === 'confirmed' && (
                  <>
                    {canJoin(appointment) && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Video className="w-4 h-4" />}
                        onClick={() => handleJoinConsultation(appointment)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Join
                      </Button>
                    )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCompleteConfirmModal(true);
                        }}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        Complete
                      </Button>
                  </>
                )}

                {/* COMPLETED status actions */}
                {appointment.status?.toLowerCase() === 'completed' && canViewReport(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="w-4 h-4" />}
                    onClick={() => handleViewReport(appointment)}
                    className="border-primary-400 text-primary-600 hover:bg-primary-50"
                  >
                    View Report
                  </Button>
                )}

                {/* Common actions for all statuses */}
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowDetailsModal(true);
                    }}
                    title="View Details"
                  >
                    Details
                  </Button>

                  {canViewCase(appointment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => handleViewCase(appointment.caseId)}
                      title="View Case"
                    >
                      Case
                    </Button>
                  )}

                  {canCancel(appointment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelModal(true);
                      }}
                      title="Cancel Appointment"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">No appointments match your current filters.</p>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCalendarView = () => {
    const monthDates = getMonthDates(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <Card>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => navigateMonth(-1)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigateMonth(1)}
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar dates */}
          {monthDates.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isOtherMonth = !isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 
                  isOtherMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } hover:shadow-md transition-shadow`}
              >
                {/* Date number */}
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-blue-600' : 
                  isOtherMonth ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: 
                          apt.status?.toLowerCase() === 'completed' ? '#dcfce7' :
                          apt.status?.toLowerCase() === 'confirmed' ? '#dbeafe' :
                          apt.status?.toLowerCase() === 'cancelled' ? '#fee2e2' :
                          '#f3f4f6'
                      }}
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowDetailsModal(true);
                      }}
                    >
                      <div className="font-medium truncate">
                        {formatTime(apt.scheduledTime)}
                      </div>
                      <div className="truncate text-gray-600">
                        {apt.doctor?.fullName || 'Patient'}
                      </div>
                    </div>
                  ))}

                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-center text-gray-500 font-medium">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}

                  {dayAppointments.length === 0 && !isOtherMonth && (
                    <div className="text-center text-gray-300 text-xs py-2">
                      No appointments
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage and track your scheduled consultations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadAppointments}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Appointments"
          value={stats.total}
          icon={<Calendar className="w-6 h-6" />}
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.today}
          icon={<Clock className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcoming}
          icon={<CalendarIcon className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatsCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<XCircle className="w-6 h-6" />}
          variant="danger"
        />
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name or case..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center space-x-3">
            <Button
              variant={showFilters ? 'primary' : 'ghost'}
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode(VIEW_MODES.LIST)}
                className={`px-3 py-1 rounded ${
                  viewMode === VIEW_MODES.LIST
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode(VIEW_MODES.CALENDAR)}
                className={`px-3 py-1 rounded ${
                  viewMode === VIEW_MODES.CALENDAR
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="video_consultation">Video Call</option>
                <option value="zoom">Zoom</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone_call">Phone Call</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Appointments View */}
      {viewMode === VIEW_MODES.LIST ? renderListView() : renderCalendarView()}

      {/* Reschedule Modal */}
      <FormModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
          rescheduleForm.reset();
        }}
        title="Reschedule Appointment"
        onSubmit={rescheduleForm.handleSubmit(handleReschedule)}
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date & Time *
            </label>
            <input
              type="datetime-local"
              {...rescheduleForm.register('scheduledTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {rescheduleForm.formState.errors.scheduledTime && (
              <p className="text-red-500 text-sm mt-1">
                {rescheduleForm.formState.errors.scheduledTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling *
            </label>
            <textarea
              {...rescheduleForm.register('reason')}
              rows="3"
              placeholder="Please provide a detailed reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {rescheduleForm.formState.errors.reason && (
              <p className="text-red-500 text-sm mt-1">
                {rescheduleForm.formState.errors.reason.message}
              </p>
            )}
          </div>

          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Appointment</h4>
              <p className="text-sm text-gray-600">
                {formatDateTime(selectedAppointment.scheduledTime)}
              </p>
              {selectedAppointment.rescheduleCount > 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  This appointment has been rescheduled {selectedAppointment.rescheduleCount} time(s) before.
                </p>
              )}
            </div>
          )}
        </div>
      </FormModal>

      {/* Cancel Modal */}
      <FormModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedAppointment(null);
          cancelForm.reset();
        }}
        title="Cancel Appointment"
        onSubmit={cancelForm.handleSubmit(handleCancel)}
        loading={loading}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">
                  Are you sure you want to cancel this appointment?
                </h4>
                <p className="text-sm text-red-700">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Patient:</strong> {selectedAppointment.doctor?.fullName || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedAppointment.scheduledTime)}</p>
                <p><strong>Type:</strong> {CONSULTATION_TYPE[selectedAppointment.consultationType] || selectedAppointment.consultationType}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <textarea
              {...cancelForm.register('reason')}
              rows="4"
              placeholder="Please provide a detailed reason for cancellation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {cancelForm.formState.errors.reason && (
              <p className="text-red-500 text-sm mt-1">
                {cancelForm.formState.errors.reason.message}
              </p>
            )}
          </div>
        </div>
      </FormModal>

      {/* Complete Confirmation Modal */}
      <Modal
        isOpen={showCompleteConfirmModal}
        onClose={() => {
          setShowCompleteConfirmModal(false);
          setSelectedAppointment(null);
        }}
        title="Complete Appointment Confirmation"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    Confirm Consultation Completion
                  </h4>
                  <p className="text-sm text-blue-800">
                    By clicking "Confirm", you acknowledge that:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>You have met with the patient</li>
                    <li>You have discussed the medical case in detail</li>
                    <li>The consultation session has been completed</li>
                    <li>You are ready to create the consultation report</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Patient:</strong> {selectedAppointment.doctor?.fullName || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedAppointment.scheduledTime)}</p>
                <p><strong>Duration:</strong> {selectedAppointment.duration || 30} minutes</p>
                <p><strong>Type:</strong> {CONSULTATION_TYPE[selectedAppointment.consultationType] || selectedAppointment.consultationType}</p>
                {selectedAppointment.caseId && (
                  <p><strong>Case ID:</strong> #{selectedAppointment.caseId}</p>
                )}
              </div>
            </div>

            {/* Information Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium mb-1">
                    Next Step
                  </p>
                  <p className="text-green-700">
                    After confirmation, you will be redirected to create the consultation report 
                    documenting the diagnosis, treatment plan, and recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowCompleteConfirmModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-green-600 hover:bg-green-700"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => handleCompleteAppointment(selectedAppointment)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Completion'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedAppointment.status} size="lg" />
              {selectedAppointment.rescheduleCount > 0 && (
                <Badge variant="warning">
                  Rescheduled {selectedAppointment.rescheduleCount}x
                </Badge>
              )}
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.doctor?.fullName || 'N/A'}
                  </span>
                </div>
                {selectedAppointment.patientId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium text-gray-900">
                      #{selectedAppointment.patientId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Appointment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(selectedAppointment.scheduledTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.duration || 30} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    {renderConsultationTypeIcon(selectedAppointment.consultationType)}
                    <span className="ml-2">
                      {CONSULTATION_TYPE[selectedAppointment.consultationType] || selectedAppointment.consultationType}
                    </span>
                  </span>
                </div>
                {selectedAppointment.caseId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Case ID:</span>
                    <span className="font-medium text-gray-900">
                      #{selectedAppointment.caseId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reschedule Information */}
            {selectedAppointment.rescheduleReason && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                  Reschedule Information
                </h3>
                <p className="text-sm text-gray-700">
                  {selectedAppointment.rescheduleReason}
                </p>
              </div>
            )}

            {/* Meeting Link */}
            {selectedAppointment.meetingLink && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-green-600" />
                  Meeting Link
                </h3>
                <a
                  href={selectedAppointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  {selectedAppointment.meetingLink}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            )}

            {/* Action Buttons - Based on Status */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {/* CONFIRMED status actions */}
              {selectedAppointment.status?.toLowerCase() === 'confirmed' && (
                <>
                  {canJoin(selectedAppointment) && (
                    <Button
                      variant="primary"
                      icon={<Video className="w-4 h-4" />}
                      onClick={() => {
                        handleJoinConsultation(selectedAppointment);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      Join Consultation
                    </Button>
                  )}
                    <Button
                      variant="outline"
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowCompleteConfirmModal(true);
                      }}
                      className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Complete Appointment
                    </Button>
                </>
              )}

              {/* COMPLETED status actions */}
              {selectedAppointment.status?.toLowerCase() === 'completed' && canViewReport(selectedAppointment) && (
                <Button
                  variant="outline"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => {
                    handleViewReport(selectedAppointment);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  View Report
                </Button>
              )}

              {/* Case button - available for all statuses if case exists */}
              {canViewCase(selectedAppointment) && (
                <Button
                  variant="secondary"
                  icon={<FileText className="w-4 h-4" />}
                  onClick={() => {
                    handleViewCase(selectedAppointment.caseId);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1"
                >
                  View Case
                </Button>
              )}

              {/* Cancel button - available for SCHEDULED, RESCHEDULED, and CONFIRMED only */}
              {canCancel(selectedAppointment) && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowCancelModal(true);
                  }}
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAppointments;