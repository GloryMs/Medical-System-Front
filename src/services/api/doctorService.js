import { api } from './apiClient';

const doctorService = {
  // Profile Management
  getProfile: async () => {
    return await api.get('/doctor-service/api/doctors/profile');
  },

  createProfile: async (profileData) => {
    return await api.post('/doctor-service/api/doctors/profile', profileData);
  },

  updateProfile: async (profileData) => {
    return await api.put('/doctor-service/api/doctors/profile', profileData);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.upload('/doctor-service/api/doctors/profile/avatar', formData);
  },

  // Get current availability status
  getAvailabilityStatus: async () => {
    return await api.get('/doctor-service/api/doctors/availability/status');
  },

  // Update availability with full settings
  updateAvailability: async (availabilityData) => {
    return await api.put('/doctor-service/api/doctors/availability', availabilityData);
  },

  // Quick toggle availability
  toggleAvailability: async (isAvailable, reason = null) => {
    const params = new URLSearchParams({ isAvailable });
    if (reason) params.append('reason', reason);
    return await api.post(`/doctor-service/api/doctors/availability/toggle?${params}`);
  },

  // Credentials and Verification
  uploadCredentials: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('credentials', file);
    });
    return await api.upload('/doctor-service/api/doctors/credentials', formData);
  },

  getCredentials: async () => {
    return await api.get('/doctor-service/api/doctors/credentials');
  },

  deleteCredential: async (credentialId) => {
    return await api.delete(`/doctor-service/api/doctors/credentials/${credentialId}`);
  },

  getVerificationStatus: async () => {
    return await api.get('/doctor-service/api/doctors/verification-status');
  },

  getCustomPatientInfo: async (caseId) => {
    return await api.get(`/doctor-service/api/doctors/cases/${caseId}/patient/custom`);
  },

  // Case Management
  getAssignedCases: async () => {
    return await api.get(`/doctor-service/api/doctors/cases/assigned`);
  },

  getActiveCases: async () => {
    return await api.get(`/doctor-service/api/doctors/cases/active`);
  },

  setCaseFee: async (caseId, consultationFee) => {
    return await api.post(`/doctor-service/api/doctors/cases/${caseId}/set-fee`, {consultationFee});
  },

  getCaseById: async (caseId) => {
    return await api.get(`/doctor-service/api/doctors/cases/${caseId}`);
  },

  acceptCase: async (caseId) => {
    return await api.post(`/doctor-service/api/doctors/cases/${caseId}/accept`);
  },

  rejectCase: async (caseId, reason) => {
    return await api.post(`/doctor-service/api/doctors/cases/${caseId}/reject`, { reason });
  },

  updateCaseStatus: async (caseId, status, notes) => {
    return await api.put(`/doctor-service/api/doctors/cases/${caseId}/status`, { status, notes });
  },

  // Case Assignment Management (from PatientController endpoints)
  getCaseAssignments: async (doctorId, status = 'NA') => {
    const params = new URLSearchParams({ doctorId, status });
    return await api.get(`/doctor-service/api/patients/case-assignments?${params}`);
  },

  acceptAssignment: async (doctorId, assignmentId) => {
    return await api.post(`/doctor-service/api/patients/case-assignment/${doctorId}/assignment/${assignmentId}`);
  },

  rejectAssignment: async (doctorId, assignmentId, reason) => {
    return await api.post(`/doctor-service/api/patients/case-assignment/${doctorId}/assignment/${assignmentId}/reject`, 
      null, { params: { reason } });
  },

  // Appointment Management
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/appointments?${params}`);
  },

  scheduleAppointment: async (appointmentData) => {
    return await api.post('/doctor-service/api/doctors/appointments', appointmentData);
  },

  updateAppointment: async (appointmentId, appointmentData) => {
    return await api.put(`/doctor-service/api/doctors/appointments/${appointmentId}`, appointmentData);
  },

  cancelAppointment: async (appointmentId, reason) => {
    return await api.post(`/doctor-service/api/doctors/appointments/${appointmentId}/cancel`, { reason });
  },

  // completeAppointment: async (appointmentId) => {
  //   return await api.put(`/doctor-service/api/doctors/appointments/${appointmentId}/complete`);
  // },  

  completeAppointment: async (completeDto) => {
  // completeDto: { appointmentId, caseId, patientId }
    return await api.put('/doctor-service/api/doctors/appointments/complete', completeDto);
  },


  rescheduleAppointment: async (appointmentId, rescheduleData) => {
    return await api.put(`/doctor-service/api/doctors/appointments/${appointmentId}/reschedule`, rescheduleData);
  },


  // Available time slots - NEW
  getAvailableTimeSlots: async (date, duration = 30) => {
    const params = new URLSearchParams({ date, duration });
    return await api.get(`/doctor-service/api/doctors/appointments/available-slots?${params}`);
  },

  checkSlotAvailability: async (scheduledTime, duration = 30) => {
    const params = new URLSearchParams({ scheduledTime, duration });
    return await api.get(`/doctor-service/api/doctors/appointments/check-availability?${params}`);
  },



  // Schedule Management
  getSchedule: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return await api.get(`/doctor-service/api/doctors/schedule?${params}`);
  },

  getAvailability: async (date) => {
    return await api.get(`/doctor-service/api/doctors/availability/${date}`);
  },

  updateAvailability: async (availabilityData) => {
    return await api.put('/doctor-service/api/doctors/availability', availabilityData);
  },

  setWorkingHours: async (workingHoursData) => {
    return await api.put('/doctor-service/api/doctors/working-hours', workingHoursData);
  },

  addTimeSlot: async (timeSlotData) => {
    return await api.post('/doctor-service/api/doctors/time-slots', timeSlotData);
  },

  removeTimeSlot: async (slotId) => {
    return await api.delete(`/doctor-service/api/doctors/time-slots/${slotId}`);
  },

  // Consultation Reports
  getConsultationReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/consultation-reports?${params}`);
  },

  getConsultationReportById: async (reportId) => {
    return await api.get(`/doctor-service/api/doctors/consultation-reports/${reportId}`);
  },

  createConsultationReport: async (reportData) => {
    return await api.post('/doctor-service/api/doctors/consultation-reports', reportData);
  },

  updateConsultationReport: async (reportId, reportData) => {
    return await api.put(`/doctor-service/api/doctors/consultation-reports/${reportId}`, reportData);
  },

  deleteConsultationReport: async (reportId) => {
    return await api.delete(`/doctor-service/api/doctors/consultation-reports/${reportId}`);
  },

  submitFinalReport: async (reportId) => {
    return await api.post(`/doctor-service/api/doctors/consultation-reports/${reportId}/submit`);
  },

  // Prescriptions
  createPrescription: async (prescriptionData) => {
    return await api.post('/doctor-service/api/doctors/prescriptions', prescriptionData);
  },

  getPrescriptions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/prescriptions?${params}`);
  },

  updatePrescription: async (prescriptionId, prescriptionData) => {
    return await api.put(`/doctor-service/api/doctors/prescriptions/${prescriptionId}`, prescriptionData);
  },

  // Referrals
  createReferral: async (referralData) => {
    return await api.post('/doctor-service/api/doctors/referrals', referralData);
  },

  getReferrals: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/referrals?${params}`);
  },

  updateReferral: async (referralId, referralData) => {
    return await api.put(`/doctor-service/api/doctors/referrals/${referralId}`, referralData);
  },

  // Communication/Messages
  getMessages: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/messages?${params}`);
  },

  getMessagesByCaseId: async (caseId) => {
    return await api.get(`/doctor-service/api/doctors/cases/${caseId}/messages`);
  },

  sendMessage: async (caseId, messageData) => {
    return await api.post(`/doctor-service/api/doctors/cases/${caseId}/messages`, messageData);
  },

  markMessageAsRead: async (messageId) => {
    return await api.post(`/doctor-service/api/doctors/messages/${messageId}/read`);
  },

  // Earnings and Payments
  getEarnings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/earnings?${params}`);
  },

  getEarningsSummary: async (period = 'month') => {
    return await api.get(`/doctor-service/api/doctors/earnings/summary?period=${period}`);
  },

  getPaymentHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/payments?${params}`);
  },

  requestPayout: async (amount, paymentMethod) => {
    return await api.post('/doctor-service/api/doctors/payouts', { amount, paymentMethod });
  },

  getPayoutHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/payouts?${params}`);
  },

  // Bank Account Management
  getBankAccounts: async () => {
    return await api.get('/doctor-service/api/doctors/bank-accounts');
  },

  addBankAccount: async (bankAccountData) => {
    return await api.post('/doctor-service/api/doctors/bank-accounts', bankAccountData);
  },

  updateBankAccount: async (accountId, bankAccountData) => {
    return await api.put(`/doctor-service/api/doctors/bank-accounts/${accountId}`, bankAccountData);
  },

  deleteBankAccount: async (accountId) => {
    return await api.delete(`/doctor-service/api/doctors/bank-accounts/${accountId}`);
  },

  setDefaultBankAccount: async (accountId) => {
    return await api.post(`/doctor-service/api/doctors/bank-accounts/${accountId}/set-default`);
  },

  // Rates and Pricing
  getRates: async () => {
    return await api.get('/doctor-service/api/doctors/rates');
  },

  updateRates: async (ratesData) => {
    return await api.put('/doctor-service/api/doctors/rates', ratesData);
  },

  // Dashboard Data
  getDashboardData: async () => {
    return await api.get('/doctor-service/api/doctors/dashboard');
  },

  // Reviews and Ratings
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/reviews?${params}`);
  },

  getReviewById: async (reviewId) => {
    return await api.get(`/doctor-service/api/doctors/reviews/${reviewId}`);
  },

  respondToReview: async (reviewId, response) => {
    return await api.post(`/doctor-service/api/doctors/reviews/${reviewId}/respond`, { response });
  },

  // Specializations and Skills
  getSpecializations: async () => {
    return await api.get('/doctor-service/api/doctors/specializations');
  },

  updateSpecializations: async (specializationData) => {
    return await api.put('/doctor-service/api/doctors/specializations', specializationData);
  },

  getSkills: async () => {
    return await api.get('/doctor-service/api/doctors/skills');
  },

  updateSkills: async (skillsData) => {
    return await api.put('/doctor-service/api/doctors/skills', skillsData);
  },

  // Education and Experience
  getEducation: async () => {
    return await api.get('/doctor-service/api/doctors/education');
  },

  addEducation: async (educationData) => {
    return await api.post('/doctor-service/api/doctors/education', educationData);
  },

  updateEducation: async (educationId, educationData) => {
    return await api.put(`/doctor-service/api/doctors/education/${educationId}`, educationData);
  },

  deleteEducation: async (educationId) => {
    return await api.delete(`/doctor-service/api/doctors/education/${educationId}`);
  },

  getExperience: async () => {
    return await api.get('/doctor-service/api/doctors/experience');
  },

  addExperience: async (experienceData) => {
    return await api.post('/doctor-service/api/doctors/experience', experienceData);
  },

  updateExperience: async (experienceId, experienceData) => {
    return await api.put(`/doctor-service/api/doctors/experience/${experienceId}`, experienceData);
  },

  deleteExperience: async (experienceId) => {
    return await api.delete(`/doctor-service/api/doctors/experience/${experienceId}`);
  },

  // Settings
  getSettings: async () => {
    return await api.get('/doctor-service/api/doctors/settings');
  },

  updateSettings: async (settings) => {
    return await api.put('/doctor-service/api/doctors/settings', settings);
  },

  // Notifications

  getNotifications: async (userId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/doctor-service/api/doctors/notifications/${userId}`);
  },

  markNotificationAsRead: async (notificationId, userId) => {
  return await api.put(`/doctor-service/api/doctors/notifications/${notificationId}/${userId}/read?`);
  },

  markAllNotificationsAsRead: async (userId) => {
    return await api.put(`/doctor-service/api/doctors/notifications/${userId}/read-all`);
  },

  // updateNotificationSettings: async (settings) => {
  //   return await api.put('/doctor-service/api/doctors/notifications/settings', settings);
  // },

  // Analytics
  getAnalytics: async (period = 'month') => {
    return await api.get(`/doctor-service/api/doctors/analytics?period=${period}`);
  },

  getCaseAnalytics: async (period = 'month') => {
    return await api.get(`/doctor-service/api/doctors/analytics/cases?period=${period}`);
  },

  getEarningsAnalytics: async (period = 'month') => {
    return await api.get(`/doctor-service/api/doctors/analytics/earnings?period=${period}`);
  },

  // Medical Configuration Data
  getDiseases: async () => {
    return await api.get('/doctor-service/api/admin/config/diseases');
  },

  getMedications: async () => {
    return await api.get('/doctor-service/api/admin/config/medications');
  },

  getSymptoms: async () => {
    return await api.get('/doctor-service/api/admin/config/symptoms');
  },
};

export default doctorService;