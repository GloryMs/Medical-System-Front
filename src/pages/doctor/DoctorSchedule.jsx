import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  FileText,
  User,
  AlertCircle,
  Video,
  Phone,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

import Card, { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import doctorService from '../../services/api/doctorService';

// Utility functions
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

// Validation schema
const scheduleSchema = yup.object({
  scheduledTime: yup.date()
    .required('Date and time are required')
    .min(new Date(), 'Cannot schedule in the past'),
  duration: yup.number()
    .required('Duration is required')
    .min(15, 'Minimum 15 minutes')
    .max(180, 'Maximum 180 minutes'),
  consultationType: yup.string().required('Consultation type is required')
});

const CONSULTATION_TYPES = [
  { value: 'VIDEO_CONSULTATION', label: 'Video Call', icon: Video },
  { value: 'PHONE_CALL', label: 'Phone Call', icon: Phone },
  { value: 'ZOOM', label: 'Zoom', icon: Video },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare }
];

const DoctorSchedule = () => {
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCase, setSelectedCase] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [expandedCase, setExpandedCase] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalCases: 0,
    scheduledAppointments: 0,
    todayAppointments: 0,
    pendingSchedule: 0
  });

  // Form
  const scheduleForm = useForm({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {
      duration: 30,
      consultationType: 'VIDEO_CONSULTATION'
    }
  });

  // Load data on mount
  useEffect(() => {
    loadCases();
    loadAppointments();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    updateStats();
  }, [cases, appointments]);

  const loadCases = async () => {
    try {
      const data = await execute(() => doctorService.getActiveCases());
      // Filter cases that need scheduling (ACCEPTED status without scheduled appointment)
      const needsScheduling = (data || []).filter(c => {
        const caseStatus = c.status?.toLowerCase();
        return caseStatus === 'accepted' || caseStatus === 'assigned';
      });
      setCases(needsScheduling);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      // Load appointments excluding cancelled ones
      const data = await execute(() => doctorService.getAppointments());
      const activeAppointments = (data || []).filter(apt => 
        apt.status?.toLowerCase() !== 'cancelled' && 
        apt.status?.toLowerCase() !== 'no_show'
      );
      setAppointments(activeAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const updateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setStats({
      totalCases: cases.length,
      scheduledAppointments: appointments.filter(apt => 
        ['scheduled', 'rescheduled', 'confirmed'].includes(apt.status?.toLowerCase())
      ).length,
      todayAppointments: appointments.filter(apt => {
        const aptDate = new Date(apt.scheduledTime);
        return aptDate >= today && aptDate < tomorrow;
      }).length,
      pendingSchedule: cases.filter(c => 
        !appointments.some(apt => apt.caseId === c.id)
      ).length
    });
  };

  const handleScheduleAppointment = (caseItem) => {
    setSelectedCase(caseItem);
    setShowScheduleModal(true);
    // Reset form with case data
    scheduleForm.reset({
      duration: 30,
      consultationType: 'VIDEO_CONSULTATION'
    });
  };

  const handleSubmitSchedule = async (data) => {
    if (!selectedCase) return;

    try {
      const appointmentData = {
        caseId: selectedCase.id,
        patientId: selectedCase.patientId,
        scheduledTime: data.scheduledTime,
        duration: data.duration,
        consultationType: data.consultationType
      };

      await execute(() => doctorService.scheduleAppointment(appointmentData));
      
      // Reload data
      await loadCases();
      await loadAppointments();
      
      // Close modal and reset
      setShowScheduleModal(false);
      setSelectedCase(null);
      scheduleForm.reset();
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      // Error is handled by useApi hook
    }
  };

  // Calendar functions
  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = Math.ceil((startingDayOfWeek + lastDay.getDate()) / 7) * 7;
    
    const dates = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startingDayOfWeek);
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }
    
    return dates;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toDateString();
    return appointments.filter(apt => 
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

  const renderCasesList = () => (
    <div className="space-y-4">
      {cases.length > 0 ? (
        cases.map(caseItem => {
          const isExpanded = expandedCase === caseItem.id;
          const canSchedule = caseItem.consultationFee !== null && caseItem.consultationFee !== undefined;
          const isAccepted = caseItem.status?.toLowerCase() === 'accepted';

          return (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Title - Full width */}
                <h3 className="font-semibold text-gray-900 mb-3">
                  {caseItem.caseTitle || `Case #${caseItem.id}`}
                </h3>

                {/* Status and Button Row */}
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={caseItem.status} size="sm" />
                  <div className="flex flex-col items-end">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Calendar className="w-4 h-4" />}
                      onClick={() => handleScheduleAppointment(caseItem)}
                      disabled={isAccepted && !canSchedule}
                      className={`${
                        isAccepted && !canSchedule 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Schedule
                    </Button>
                    {isAccepted && !canSchedule && (
                      <span className="text-xs text-red-600 mt-1">
                        Set consultation fee first
                      </span>
                    )}
                  </div>
                </div>

                {/* Fee Display - Always Visible if set */}
                {caseItem.consultationFee && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-green-600 font-medium">
                      Fee: ${caseItem.consultationFee}
                    </span>
                  </div>
                )}

                {/* Urgency - Always Visible */}
                {caseItem.urgencyLevel && (
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">
                      Urgency: {caseItem.urgencyLevel}
                    </span>
                  </div>
                )}

                {/* Fee Warning Banner - Only for ACCEPTED cases without fee */}
                {isAccepted && !canSchedule && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-800 font-medium mb-1">
                          Consultation Fee Required
                        </p>
                        <p className="text-yellow-700">
                          Please set the consultation fee before scheduling this appointment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="space-y-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Patient: {caseItem.patientName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Specialization: {caseItem.requiredSpecialization || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Submitted: {formatDate(caseItem.submittedAt)}</span>
                    </div>
                    {caseItem.caseDescription && (
                      <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                        {caseItem.caseDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Show More/Less Button */}
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                  <ChevronRight 
                    className={`w-4 h-4 ml-1 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
              </div>
            </Card>
          );
        })
      ) : (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All Cases Scheduled
            </h3>
            <p className="text-gray-600">
              You have no pending cases to schedule at the moment.
            </p>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCalendar = () => {
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
                          apt.status?.toLowerCase() === 'scheduled' ? '#e0e7ff' :
                          apt.status?.toLowerCase() === 'rescheduled' ? '#fef3c7' :
                          '#f3f4f6'
                      }}
                    >
                      <div className="font-medium truncate">
                        {formatTime(apt.scheduledTime)}
                      </div>
                      <div className="truncate text-gray-600">
                        Case #{apt.caseId}
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

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend:</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e0e7ff' }}></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
              <span>Rescheduled</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7' }}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600">Manage your appointments and schedule new consultations</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          onClick={() => {
            loadCases();
            loadAppointments();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Cases Pending Schedule"
          value={stats.pendingSchedule}
          icon={<AlertCircle className="w-6 h-6" />}
          variant="warning"
        />
        <StatsCard
          title="Scheduled Appointments"
          value={stats.scheduledAppointments}
          icon={<Calendar className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<Clock className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Total Active Cases"
          value={stats.totalCases}
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List - Left Side */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cases Needing Schedule</h2>
            <p className="text-sm text-gray-600">Click "Schedule" to book an appointment</p>
          </div>
          {renderCasesList()}
        </div>

        {/* Calendar - Right Side */}
        <div className="lg:col-span-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      <FormModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedCase(null);
          scheduleForm.reset();
        }}
        title="Schedule Appointment"
        onSubmit={scheduleForm.handleSubmit(handleSubmitSchedule)}
        loading={loading}
      >
        {selectedCase && (
          <div className="space-y-4">
            {/* Case Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Case Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Case ID:</strong> #{selectedCase.id}</p>
                <p><strong>Patient:</strong> {selectedCase.patientName || 'N/A'}</p>
                <p><strong>Title:</strong> {selectedCase.caseTitle || 'N/A'}</p>
                <p><strong>Specialization:</strong> {selectedCase.requiredSpecialization || 'N/A'}</p>
                {selectedCase.urgencyLevel && (
                  <p className="text-orange-600">
                    <strong>Urgency:</strong> {selectedCase.urgencyLevel}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date & Time *
              </label>
              <input
                type="datetime-local"
                {...scheduleForm.register('scheduledTime')}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {scheduleForm.formState.errors.scheduledTime && (
                <p className="text-red-500 text-sm mt-1">
                  {scheduleForm.formState.errors.scheduledTime.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <select
                {...scheduleForm.register('duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
              {scheduleForm.formState.errors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {scheduleForm.formState.errors.duration.message}
                </p>
              )}
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONSULTATION_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      scheduleForm.watch('consultationType') === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      {...scheduleForm.register('consultationType')}
                      value={type.value}
                      className="text-blue-600"
                    />
                    <type.icon className="w-4 h-4" />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
              {scheduleForm.formState.errors.consultationType && (
                <p className="text-red-500 text-sm mt-1">
                  {scheduleForm.formState.errors.consultationType.message}
                </p>
              )}
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    The system will automatically check for conflicts and validate 
                    the selected time slot. A meeting link will be generated after scheduling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default DoctorSchedule;