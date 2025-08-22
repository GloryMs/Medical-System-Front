import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  currentAppointment: null,
  upcomingAppointments: [],
  pastAppointments: [],
  statistics: {
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  },
  availability: {
    slots: [],
    blockedDates: [],
    workingHours: {},
  },
  filters: {
    status: 'all',
    dateRange: null,
    doctorId: null,
    patientId: null,
    consultationType: 'all',
  },
  sortBy: {
    field: 'scheduledAt',
    order: 'asc',
  },
  isLoading: false,
  isScheduling: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Fetch appointments
    fetchAppointmentsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.isLoading = false;
      state.appointments = action.payload.appointments;
      state.statistics = action.payload.statistics || state.statistics;
      state.error = null;
      
      // Separate upcoming and past appointments
      const now = new Date();
      state.upcomingAppointments = state.appointments.filter(
        apt => new Date(apt.scheduledAt) > now && apt.status !== 'cancelled'
      );
      state.pastAppointments = state.appointments.filter(
        apt => new Date(apt.scheduledAt) <= now || apt.status === 'cancelled'
      );
    },
    fetchAppointmentsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Single appointment operations
    setAppointmentDetails: (state, action) => {
      state.currentAppointment = action.payload;
      state.error = null;
    },
    updateAppointmentDetails: (state, action) => {
      if (state.currentAppointment && state.currentAppointment.id === action.payload.id) {
        state.currentAppointment = { ...state.currentAppointment, ...action.payload };
      }
      const index = state.appointments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], ...action.payload };
      }
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },

    // Schedule appointment
    scheduleAppointmentStart: (state) => {
      state.isScheduling = true;
      state.error = null;
    },
    scheduleAppointmentSuccess: (state, action) => {
      state.isScheduling = false;
      state.appointments.push(action.payload);
      state.upcomingAppointments.push(action.payload);
      state.statistics.total += 1;
      state.statistics.upcoming += 1;
      state.error = null;
    },
    scheduleAppointmentFailure: (state, action) => {
      state.isScheduling = false;
      state.error = action.payload;
    },

    // Update appointment status
    updateAppointmentStatus: (state, action) => {
      const { appointmentId, newStatus, previousStatus } = action.payload;
      
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].status = newStatus;
        state.appointments[index].updatedAt = new Date().toISOString();
        
        // Update statistics
        if (previousStatus && state.statistics[previousStatus] > 0) {
          state.statistics[previousStatus] -= 1;
        }
        state.statistics[newStatus] = (state.statistics[newStatus] || 0) + 1;
      }
      
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.status = newStatus;
        state.currentAppointment.updatedAt = new Date().toISOString();
      }
    },

    // Reschedule appointment
    rescheduleAppointment: (state, action) => {
      const { appointmentId, newDate, newTime, reason } = action.payload;
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].scheduledAt = `${newDate}T${newTime}`;
        state.appointments[index].rescheduledAt = new Date().toISOString();
        state.appointments[index].rescheduleReason = reason;
        state.appointments[index].status = 'rescheduled';
      }
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.scheduledAt = `${newDate}T${newTime}`;
        state.currentAppointment.rescheduledAt = new Date().toISOString();
        state.currentAppointment.rescheduleReason = reason;
        state.currentAppointment.status = 'rescheduled';
      }
    },

    // Cancel appointment
    cancelAppointment: (state, action) => {
      const { appointmentId, reason, cancelledBy } = action.payload;
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].status = 'cancelled';
        state.appointments[index].cancelledAt = new Date().toISOString();
        state.appointments[index].cancellationReason = reason;
        state.appointments[index].cancelledBy = cancelledBy;
        
        // Move from upcoming to past
        const upcomingIndex = state.upcomingAppointments.findIndex(a => a.id === appointmentId);
        if (upcomingIndex !== -1) {
          const appointment = state.upcomingAppointments.splice(upcomingIndex, 1)[0];
          state.pastAppointments.push(appointment);
          state.statistics.upcoming -= 1;
          state.statistics.cancelled += 1;
        }
      }
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.status = 'cancelled';
        state.currentAppointment.cancelledAt = new Date().toISOString();
        state.currentAppointment.cancellationReason = reason;
        state.currentAppointment.cancelledBy = cancelledBy;
      }
    },

    // Complete appointment
    completeAppointment: (state, action) => {
      const { appointmentId, notes, followUpRequired } = action.payload;
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].status = 'completed';
        state.appointments[index].completedAt = new Date().toISOString();
        state.appointments[index].consultationNotes = notes;
        state.appointments[index].followUpRequired = followUpRequired;
      }
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.status = 'completed';
        state.currentAppointment.completedAt = new Date().toISOString();
        state.currentAppointment.consultationNotes = notes;
        state.currentAppointment.followUpRequired = followUpRequired;
      }
    },

    // Mark as no-show
    markAsNoShow: (state, action) => {
      const appointmentId = action.payload;
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].status = 'noShow';
        state.appointments[index].noShowAt = new Date().toISOString();
      }
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.status = 'noShow';
        state.currentAppointment.noShowAt = new Date().toISOString();
      }
    },

    // Availability management
    setAvailability: (state, action) => {
      state.availability = action.payload;
    },
    updateAvailabilitySlots: (state, action) => {
      state.availability.slots = action.payload;
    },
    addBlockedDate: (state, action) => {
      state.availability.blockedDates.push(action.payload);
    },
    removeBlockedDate: (state, action) => {
      state.availability.blockedDates = state.availability.blockedDates
        .filter(date => date !== action.payload);
    },
    updateWorkingHours: (state, action) => {
      state.availability.workingHours = action.payload;
    },

    // Add meeting details
    setMeetingDetails: (state, action) => {
      const { appointmentId, meetingLink, meetingId, meetingPassword } = action.payload;
      const index = state.appointments.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        state.appointments[index].meetingLink = meetingLink;
        state.appointments[index].meetingId = meetingId;
        state.appointments[index].meetingPassword = meetingPassword;
      }
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment.meetingLink = meetingLink;
        state.currentAppointment.meetingId = meetingId;
        state.currentAppointment.meetingPassword = meetingPassword;
      }
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Sorting
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // Clear state
    clearAppointments: (state) => {
      state.appointments = [];
      state.currentAppointment = null;
      state.upcomingAppointments = [];
      state.pastAppointments = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  setAppointmentDetails,
  updateAppointmentDetails,
  clearCurrentAppointment,
  scheduleAppointmentStart,
  scheduleAppointmentSuccess,
  scheduleAppointmentFailure,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  markAsNoShow,
  setAvailability,
  updateAvailabilitySlots,
  addBlockedDate,
  removeBlockedDate,
  updateWorkingHours,
  setMeetingDetails,
  setFilters,
  clearFilters,
  setSortBy,
  clearAppointments,
  clearError,
} = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.appointments.appointments;
export const selectCurrentAppointment = (state) => state.appointments.currentAppointment;
export const selectUpcomingAppointments = (state) => state.appointments.upcomingAppointments;
export const selectPastAppointments = (state) => state.appointments.pastAppointments;
export const selectAppointmentStatistics = (state) => state.appointments.statistics;
export const selectAvailability = (state) => state.appointments.availability;
export const selectAppointmentsLoading = (state) => state.appointments.isLoading;
export const selectAppointmentsError = (state) => state.appointments.error;

export default appointmentSlice.reducer;