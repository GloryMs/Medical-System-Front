import { api } from './apiClient';

/**
 * Supervisor Service - API Client
 * Handles all API calls for Medical Supervisor role
 * Base URL: /supervisor-service/api/supervisors
 */

const supervisorService = {
  // ==================== Profile Management ====================

  /**
   * Get supervisor profile
   * @returns {Promise} Supervisor profile data
   */
  getProfile: async () => {
    return api.get('/supervisor-service/api/supervisors/profile');
  },

  /**
   * Create supervisor profile
   * @param {Object} profileData - Profile information
   * @returns {Promise} Created profile
   */
  createProfile: async (profileData) => {
    return api.post('/supervisor-service/api/supervisors/profile', profileData);
  },

  /**
   * Update supervisor profile
   * @param {Object} profileData - Updated profile information
   * @returns {Promise} Updated profile
   */
  updateProfile: async (profileData) => {
    return api.put('/supervisor-service/api/supervisors/profile', profileData);
  },

  /**
   * Upload license document
   * @param {File} file - License document file (PDF/Image)
   * @returns {Promise} Upload result with file path
   */
  uploadLicenseDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/supervisor-service/api/supervisors/profile/license-document', formData);
  },

  /**
   * Delete supervisor profile
   * @returns {Promise} Deletion confirmation
   */
  deleteProfile: async () => {
    return api.delete('/supervisor-service/api/supervisors/profile');
  },

  // ==================== Patient Management ====================

  /**
   * Get all assigned patients
   * @returns {Promise} List of assigned patients
   */
  getPatients: async () => {
    return api.get('/supervisor-service/api/supervisors/patients');
  },

  /**
   * Assign existing patient by ID
   * @param {number} patientId - Patient ID to assign
   * @param {string} notes - Optional assignment notes
   * @returns {Promise} Assignment result
   */
  assignPatientById: async (patientId, notes = '') => {
    const params = new URLSearchParams();
    params.append('patientId', patientId);
    if (notes) params.append('notes', notes);
    return api.post(`/supervisor-service/api/supervisors/patients?${params.toString()}`);
  },

  /**
   * Create new patient and assign to supervisor
   * @param {Object} patientData - Patient profile data
   * @returns {Promise} Created patient and assignment result
   */
  createAndAssignPatient: async (patientData) => {
    return api.post('/supervisor-service/api/supervisors/patients/create-and-assign', patientData);
  },

  /**
   * Assign existing patient by email
   * @param {string} email - Patient email
   * @param {string} notes - Optional assignment notes
   * @returns {Promise} Assignment result
   */
  assignPatientByEmail: async (email, notes = '') => {
    return api.post('/supervisor-service/api/supervisors/patients/assign-by-email', {
      email,
      notes
    });
  },

  /**
   * Get patient assignment details
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient assignment details
   */
  getPatientDetails: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/patients/${patientId}`);
  },

  /**
   * Remove patient assignment
   * @param {number} patientId - Patient ID
   * @param {string} reason - Optional removal reason
   * @returns {Promise} Removal confirmation
   */
  removePatient: async (patientId, reason = '') => {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    return api.delete(`/supervisor-service/api/supervisors/patients/${patientId}?${params.toString()}`);
  },

  /**
   * Get list of patient IDs
   * @returns {Promise} Array of patient IDs
   */
  getPatientIds: async () => {
    return api.get('/supervisor-service/api/supervisors/patients/ids');
  },

  // ==================== Case Management ====================

  /**
   * Submit case for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} caseData - Case information
   * @returns {Promise} Created case
   */
  submitCase: async (patientId, caseData) => {
    return api.post(`/supervisor-service/api/supervisors/cases/patient/${patientId}`, caseData);
  },

  /**
   * Get all cases (optionally filtered)
   * @param {Object} filters - Optional filters (patientId, status)
   * @returns {Promise} List of cases
   */
  getCases: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    return api.get(`/supervisor-service/api/supervisors/cases${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get cases for specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of patient's cases
   */
  getCasesByPatient: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/cases/patient/${patientId}`);
  },

  /**
   * Get case details
   * @param {number} caseId - Case ID
   * @returns {Promise} Case details
   */
  getCaseDetails: async (caseId) => {
    return api.get(`/supervisor-service/api/supervisors/cases/${caseId}`);
  },

  /**
   * Update case
   * @param {number} caseId - Case ID
   * @param {Object} updateData - Updated case data
   * @returns {Promise} Updated case
   */
  updateCase: async (caseId, updateData) => {
    return api.put(`/supervisor-service/api/supervisors/cases/${caseId}`, updateData);
  },

  /**
   * Cancel case
   * @param {number} caseId - Case ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Cancellation confirmation
   */
  cancelCase: async (caseId, reason) => {
    const params = new URLSearchParams();
    params.append('reason', reason);
    return api.put(`/supervisor-service/api/supervisors/cases/${caseId}/cancel?${params.toString()}`);
  },

  /**
   * Get patient info (for case submission)
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient information
   */
  getPatientInfo: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/cases/patient/${patientId}/info`);
  },

  /**
   * Get custom patient info for a case
   * @param {number} caseId - Case ID
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient information related to the case
   */
  getCustomPatientInfo: async (caseId, patientId) => {
    return api.get(`/supervisor-service/api/supervisors/patients/${caseId}/patient?patientId=${patientId}`);
  },

  // ==================== Dashboard & Analytics ====================

  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard statistics
   */
  getDashboardStatistics: async () => {
    return api.get('/supervisor-service/api/supervisors/dashboard/statistics');
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to retrieve (default: 20)
   * @returns {Promise} Recent activities
   */
  getRecentActivity: async (limit = 20) => {
    return api.get(`/supervisor-service/api/supervisors/dashboard/activity?limit=${limit}`);
  },

  /**
   * Get performance metrics
   * @returns {Promise} Performance metrics
   */
  getPerformanceMetrics: async () => {
    return api.get('/supervisor-service/api/supervisors/dashboard/metrics');
  },

  // ==================== Payment & Coupons ====================

  /**
   * Pay consultation fee
   * @param {Object} paymentData - Payment information
   * @returns {Promise} Payment result
   */
  payConsultationFee: async (paymentData) => {
    return api.post('/supervisor-service/api/supervisors/payments/pay', paymentData);
  },

  /**
   * Create payment intent
   * @param {number} caseId - Case ID
   * @param {number} patientId - Patient ID
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Payment intent details
   */
  createPaymentIntent: async (caseId, patientId, doctorId) => {
    return api.post(`/supervisor-service/api/supervisors/payments/create-payment-intent?caseId=${caseId}&patientId=${patientId}&doctorId=${doctorId}`);
  },

  /**
   * Validate coupon
   * @param {string} couponCode - Coupon code
   * @param {number} patientId - Patient ID
   * @param {number} caseId - Case ID
   * @returns {Promise} Coupon validation result
   */
  validateCoupon: async (couponCode, patientId, caseId) => {
    return api.post(`/supervisor-service/api/supervisors/payments/validate-coupon?couponCode=${couponCode}&patientId=${patientId}&caseId=${caseId}`);
  },

  /**
   * Redeem coupon for case payment (Legacy)
   * @param {number} caseId - Case ID
   * @param {number} patientId - Patient ID
   * @param {string} couponCode - Coupon code
   * @returns {Promise} Redemption result
   */
  redeemCoupon: async (caseId, patientId, couponCode) => {
    return api.post(
      `/supervisor-service/api/supervisors/payments/coupon/${caseId}?patientId=${patientId}`,
      { couponCode }
    );
  },

  /**
   * Get coupon summary
   * @returns {Promise} Coupon summary (total, available, used, expired)
   */
  getCouponSummary: async () => {
    return api.get('/supervisor-service/api/supervisors/payments/coupons');
  },

  /**
   * Get available coupons for patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of available coupons
   */
  getPatientCoupons: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/payments/coupons/patient/${patientId}`);
  },

  /**
   * Get all available coupons
   * @returns {Promise} List of all available coupons
   */
  getAllAvailableCoupons: async () => {
    return api.get('/supervisor-service/api/supervisors/payments/available-coupons');
  },

  /**
   * Get expiring coupons
   * @param {number} days - Days until expiry (default: 7)
   * @returns {Promise} List of expiring coupons
   */
  getExpiringCoupons: async (days = 7) => {
    return api.get(`/supervisor-service/api/supervisors/payments/coupons/expiring?days=${days}`);
  },

  /**
   * Get payment history
   * @param {number} patientId - Optional patient ID filter
   * @returns {Promise} Payment history
   */
  getPaymentHistory: async (patientId = null) => {
    const params = patientId ? `?patientId=${patientId}` : '';
    return api.get(`/supervisor-service/api/supervisors/payments/history${params}`);
  },

  //Notifications:
  getNotifications: async (userId) => {
    return await api.get(`/supervisor-service/api/supervisors/notifications/${userId}`);
  },

  markNotificationAsRead: async (notificationId, userId) => {
    return await api.put(
      `/supervisor-service/api/supervisors/notifications/${notificationId}/${userId}/read`
    );
  },

  markAllNotificationsAsRead: async (userId) => {
    return await api.put(
      `/supervisor-service/api/supervisors/notifications/${userId}/read-all`
    );
  },

  deleteNotification: async (notificationId) => {
    return await api.delete(
      `/supervisor-service/api/supervisors/notifications/${notificationId}`
    );
  },

  getNotificationSettings: async () => {
    return await api.get(
      '/supervisor-service/api/supervisors/notifications/settings'
    );
  },

  updateNotificationSettings: async (settings) => {
    return await api.put(
      '/supervisor-service/api/supervisors/notifications/settings',
      settings
    );
  },

  // ==================== Settings ====================

  /**
   * Get supervisor settings
   * @returns {Promise} Supervisor settings
   */
  getSettings: async () => {
    return api.get('/supervisor-service/api/supervisors/settings');
  },

  /**
   * Update supervisor settings
   * @param {Object} settings - Updated settings
   * @returns {Promise} Updated settings
   */
  updateSettings: async (settings) => {
    return api.put('/supervisor-service/api/supervisors/settings', settings);
  },

  // ==================== Appointments ====================

  /**
   * Get appointments for supervisor's patients
   * @param {Object} filters - Optional filters (patientId, caseId, status, date, startDate, endDate, upcomingOnly, sortBy, sortOrder)
   * @returns {Promise} List of appointments
   */
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.caseId) params.append('caseId', filters.caseId);
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.upcomingOnly !== undefined) params.append('upcomingOnly', filters.upcomingOnly);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    return api.get(`/supervisor-service/api/supervisors/appointments${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Get upcoming appointments
   * @returns {Promise} List of upcoming appointments
   */
  getUpcomingAppointments: async () => {
    return api.get('/supervisor-service/api/supervisors/appointments/upcoming');
  },

  /**
   * Get appointment details
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Appointment details
   */
  getAppointmentDetails: async (appointmentId) => {
    return api.get(`/supervisor-service/api/supervisors/appointments/${appointmentId}`);
  },

  /**
   * Get patient appointments
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of patient appointments
   */
  getPatientAppointments: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/appointments/patient/${patientId}`);
  },

  /**
   * Get case appointments
   * @param {number} caseId - Case ID
   * @returns {Promise} List of case appointments
   */
  getCaseAppointments: async (caseId) => {
    return api.get(`/supervisor-service/api/supervisors/appointments/case/${caseId}`);
  },

  /**
   * Accept appointment
   * @param {Object} acceptData - { caseId, patientId, notes? }
   * @returns {Promise} Accept confirmation
   */
  acceptAppointment: async (acceptData) => {
    return api.post('/supervisor-service/api/supervisors/appointments/accept', acceptData);
  },

  /**
   * Create reschedule request
   * @param {Object} rescheduleData - { appointmentId, caseId, patientId, preferredTimes[], reason, additionalNotes? }
   * @returns {Promise} Created reschedule request
   */
  createRescheduleRequest: async (rescheduleData) => {
    return api.post('/supervisor-service/api/supervisors/appointments/reschedule-request', rescheduleData);
  },

  /**
   * Get reschedule requests
   * @param {number} patientId - Optional patient ID filter
   * @returns {Promise} List of reschedule requests
   */
  getRescheduleRequests: async (patientId = null) => {
    const params = patientId ? `?patientId=${patientId}` : '';
    return api.get(`/supervisor-service/api/supervisors/appointments/reschedule-requests${params}`);
  },

  /**
   * Get case reschedule requests
   * @param {number} caseId - Case ID
   * @returns {Promise} List of reschedule requests for the case
   */
  getCaseRescheduleRequests: async (caseId) => {
    return api.get(`/supervisor-service/api/supervisors/appointments/case/${caseId}/reschedule-requests`);
  },

  /**
   * Get appointment summary
   * @returns {Promise} Appointment statistics
   */
  getAppointmentSummary: async () => {
    return api.get('/supervisor-service/api/supervisors/appointments/summary');
  },

  /**
   * Get today's appointments
   * @returns {Promise} List of today's appointments
   */
  getTodayAppointments: async () => {
    return api.get('/supervisor-service/api/supervisors/appointments/today');
  },

  /**
   * Get appointments by status
   * @param {string} status - Appointment status
   * @returns {Promise} List of appointments with the specified status
   */
  getAppointmentsByStatus: async (status) => {
    return api.get(`/supervisor-service/api/supervisors/appointments/status/${status}`);
  },

  // ==================== Communication ====================

  /**
   * Get messages for supervisor's cases
   * @param {number} caseId - Optional case ID filter
   * @returns {Promise} List of messages
   */
  getMessages: async (caseId = null) => {
    const params = caseId ? `?caseId=${caseId}` : '';
    return api.get(`/supervisor-service/api/supervisors/communication${params}`);
  },

  /**
   * Send message in case
   * @param {number} caseId - Case ID
   * @param {string} message - Message content
   * @param {Array} attachments - Optional attachments
   * @returns {Promise} Sent message
   */
  sendMessage: async (caseId, message, attachments = []) => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('caseId', caseId);

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.upload('/supervisor-service/api/supervisors/communication/send', formData);
  },

  // ==================== Complaints Management ====================

  /**
   * Get all complaints for supervisor's patients
   * Supervisors can view and manage complaints submitted by their assigned patients
   * @returns {Promise} List of complaints
   */
  getComplaints: async () => {
    return api.get('/supervisor-service/api/admin/supervisors/complaints');
  },

  /**
   * Get complaint by ID
   * @param {number} complaintId - Complaint ID
   * @returns {Promise} Complaint details
   */
  getComplaintById: async (complaintId) => {
    return api.get(`/supervisor-service/api/admin/supervisors/complaints/${complaintId}`);
  },

  /**
   * Create a complaint on behalf of a patient
   * @param {Object} complaintData - Complaint data
   * @param {number} complaintData.patientId - Patient ID (must be assigned to supervisor)
   * @param {string} complaintData.complaintType - DOCTOR | SYSTEM | PAYMENT | SERVICE | OTHER
   * @param {string} complaintData.description - Detailed description (min 20 chars)
   * @param {string} complaintData.priority - LOW | MEDIUM | HIGH | CRITICAL
   * @param {number} complaintData.doctorId - Optional related doctor ID
   * @param {number} complaintData.caseId - Optional related case ID
   * @returns {Promise} Created complaint
   */
  createComplaint: async (complaintData) => {
    return api.post('/supervisor-service/api/admin/supervisors/complaints', complaintData);
  },

  /**
   * Get complaints for a specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of patient's complaints
   */
  getComplaintsByPatient: async (patientId) => {
    return api.get(`/supervisor-service/api/admin/supervisors/complaints/patient/${patientId}`);
  },
};

export default supervisorService;
