import { api } from './apiClient';

const patientService = {
  // Profile Management
  getProfile: async () => {
    return await api.get('/patient-service/api/patients/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/patient-service/api/patients/profile', profileData);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.upload('/patient-service/api/patients/profile/avatar', formData);
  },

  // Case Management
  getCases: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/cases?${params}`);
  },

  getCaseById: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}`);
  },

  createCase: async (caseData) => {
    return await api.post('/patient-service/api/patients/cases', caseData);
  },

  updateCase: async (caseId, caseData) => {
    return await api.put(`/patient-service/api/patients/cases/${caseId}`, caseData);
  },

  deleteCase: async (caseId) => {
    return await api.delete(`/patient-service/api/patients/cases/${caseId}`);
  },

  // Case Documents
  uploadCaseDocuments: async (caseId, files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    
    return await api.upload(
      `/patient-service/api/patients/cases/${caseId}/documents`, 
      formData,
      onUploadProgress
    );
  },

  getCaseDocuments: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}/documents`);
  },

  downloadCaseDocument: async (caseId, documentId, filename) => {
    return await api.download(
      `/patient-service/api/patients/cases/${caseId}/documents/${documentId}/download`, 
      filename
    );
  },

  deleteCaseDocument: async (caseId, documentId) => {
    return await api.delete(`/patient-service/api/patients/cases/${caseId}/documents/${documentId}`);
  },

  // Appointments
  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/appointments?${params}`);
  },

  getAppointmentById: async (appointmentId) => {
    return await api.get(`/patient-service/api/patients/appointments/${appointmentId}`);
  },

  acceptAppointment: async (caseId) => {
    return await api.post(`/patient-service/api/patients/cases/${caseId}/accept-appointment`);
  },

  declineAppointment: async (appointmentId, reason) => {
    return await api.post(`/patient-service/api/patients/appointments/${appointmentId}/decline`, { reason });
  },

  requestReschedule: async (caseId, rescheduleData) => {
    return await api.post(`/patient-service/api/patients/cases/${caseId}/reschedule-request`, rescheduleData);
  },

  // Subscription Management
  getSubscriptionStatus: async () => {
    return await api.get('/patient-service/api/patients/subscription');
  },

  createSubscription: async (subscriptionData) => {
    return await api.post('/patient-service/api/patients/subscription', subscriptionData);
  },

  updateSubscription: async (subscriptionData) => {
    return await api.put('/patient-service/api/patients/subscription', subscriptionData);
  },

  cancelSubscription: async (reason) => {
    return await api.post('/patient-service/api/patients/subscription/cancel', { reason });
  },

  getSubscriptionPlans: async () => {
    return await api.get('/patient-service/api/patients/subscription/plans');
  },

  // Payment Management
  getPaymentHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/payments/history?${params}`);
  },

  getPaymentMethods: async () => {
    return await api.get('/patient-service/api/patients/payments/methods');
  },

  addPaymentMethod: async (paymentMethodData) => {
    return await api.post('/patient-service/api/patients/payments/methods', paymentMethodData);
  },

  updatePaymentMethod: async (methodId, paymentMethodData) => {
    return await api.put(`/patient-service/api/patients/payments/methods/${methodId}`, paymentMethodData);
  },

  deletePaymentMethod: async (methodId) => {
    return await api.delete(`/patient-service/api/patients/payments/methods/${methodId}`);
  },

  setDefaultPaymentMethod: async (methodId) => {
    return await api.post(`/patient-service/api/patients/payments/methods/${methodId}/set-default`);
  },

  // Consultation Fee Payment
  payConsultationFee: async (caseId, paymentData) => {
    return await api.post(`/patient-service/api/patients/cases/${caseId}/pay`, paymentData);
  },

  getConsultationFeeStatus: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}/payment-status`);
  },

  // Invoices
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/invoices?${params}`);
  },

  downloadInvoice: async (invoiceId, filename) => {
    return await api.download(`/patient-service/api/patients/invoices/${invoiceId}/download`, filename);
  },

  // Complaints Management
  getComplaints: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/complaints?${params}`);
  },

  getComplaintById: async (complaintId) => {
    return await api.get(`/patient-service/api/patients/complaints/${complaintId}`);
  },

  createComplaint: async (complaintData) => {
    return await api.post('/patient-service/api/patients/complaints', complaintData);
  },

  updateComplaint: async (complaintId, complaintData) => {
    return await api.put(`/patient-service/api/patients/complaints/${complaintId}`, complaintData);
  },

  addComplaintResponse: async (complaintId, responseData) => {
    return await api.post(`/patient-service/api/patients/complaints/${complaintId}/responses`, responseData);
  },

  closeComplaint: async (complaintId) => {
    return await api.post(`/patient-service/api/patients/complaints/${complaintId}/close`);
  },

  // Notifications
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/notifications?${params}`);
  },

  markNotificationAsRead: async (notificationId) => {
    return await api.post(`/patient-service/api/patients/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async () => {
    return await api.post('/patient-service/api/patients/notifications/read-all');
  },

  deleteNotification: async (notificationId) => {
    return await api.delete(`/patient-service/api/patients/notifications/${notificationId}`);
  },

  updateNotificationSettings: async (settings) => {
    return await api.put('/patient-service/api/patients/notifications/settings', settings);
  },

  // Communication/Messages
  getMessages: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/messages?${params}`);
  },

  getMessagesByCaseId: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}/messages`);
  },

  sendMessage: async (caseId, messageData) => {
    return await api.post(`/patient-service/api/patients/cases/${caseId}/messages`, messageData);
  },

  markMessageAsRead: async (messageId) => {
    return await api.post(`/patient-service/api/patients/messages/${messageId}/read`);
  },

  // Dashboard Data
  getDashboardData: async () => {
    return await api.get('/patient-service/api/patients/dashboard');
  },

  getDashboardStats: async () => {
    return await api.get('/patient-service/api/patients/dashboard/stats');
  },

  // Medical History
  getMedicalHistory: async () => {
    return await api.get('/patient-service/api/patients/medical-history');
  },

  updateMedicalHistory: async (medicalHistoryData) => {
    return await api.put('/patient-service/api/patients/medical-history', medicalHistoryData);
  },

  addMedicalRecord: async (recordData) => {
    return await api.post('/patient-service/api/patients/medical-history/records', recordData);
  },

  updateMedicalRecord: async (recordId, recordData) => {
    return await api.put(`/patient-service/api/patients/medical-history/records/${recordId}`, recordData);
  },

  deleteMedicalRecord: async (recordId) => {
    return await api.delete(`/patient-service/api/patients/medical-history/records/${recordId}`);
  },

  // Emergency Contacts
  getEmergencyContacts: async () => {
    return await api.get('/patient-service/api/patients/emergency-contacts');
  },

  addEmergencyContact: async (contactData) => {
    return await api.post('/patient-service/api/patients/emergency-contacts', contactData);
  },

  updateEmergencyContact: async (contactId, contactData) => {
    return await api.put(`/patient-service/api/patients/emergency-contacts/${contactId}`, contactData);
  },

  deleteEmergencyContact: async (contactId) => {
    return await api.delete(`/patient-service/api/patients/emergency-contacts/${contactId}`);
  },

  // Insurance Information
  getInsuranceInfo: async () => {
    return await api.get('/patient-service/api/patients/insurance');
  },

  updateInsuranceInfo: async (insuranceData) => {
    return await api.put('/patient-service/api/patients/insurance', insuranceData);
  },

  uploadInsuranceCard: async (file) => {
    const formData = new FormData();
    formData.append('insuranceCard', file);
    return await api.upload('/patient-service/api/patients/insurance/card', formData);
  },

  // Consultation Reports (Patient view)
  getConsultationReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/consultation-reports?${params}`);
  },

  getConsultationReportById: async (reportId) => {
    return await api.get(`/patient-service/api/patients/consultation-reports/${reportId}`);
  },

  downloadConsultationReport: async (reportId, filename) => {
    return await api.download(`/patient-service/api/patients/consultation-reports/${reportId}/download`, filename);
  },

  // Prescriptions
  getPrescriptions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/prescriptions?${params}`);
  },

  getPrescriptionById: async (prescriptionId) => {
    return await api.get(`/patient-service/api/patients/prescriptions/${prescriptionId}`);
  },

  downloadPrescription: async (prescriptionId, filename) => {
    return await api.download(`/patient-service/api/patients/prescriptions/${prescriptionId}/download`, filename);
  },

  // Referrals
  getReferrals: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/referrals?${params}`);
  },

  getReferralById: async (referralId) => {
    return await api.get(`/patient-service/api/patients/referrals/${referralId}`);
  },

  // Account Settings
  getAccountSettings: async () => {
    return await api.get('/patient-service/api/patients/settings');
  },

  updateAccountSettings: async (settings) => {
    return await api.put('/patient-service/api/patients/settings', settings);
  },

  // Privacy Settings
  getPrivacySettings: async () => {
    return await api.get('/patient-service/api/patients/privacy');
  },

  updatePrivacySettings: async (privacySettings) => {
    return await api.put('/patient-service/api/patients/privacy', privacySettings);
  },

  // Data Export
  requestDataExport: async () => {
    return await api.post('/patient-service/api/patients/data-export');
  },

  getDataExportStatus: async (exportId) => {
    return await api.get(`/patient-service/api/patients/data-export/${exportId}/status`);
  },

  downloadDataExport: async (exportId, filename) => {
    return await api.download(`/patient-service/api/patients/data-export/${exportId}/download`, filename);
  },

  // Account Deletion
  requestAccountDeletion: async (reason) => {
    return await api.post('/patient-service/api/patients/delete-account', { reason });
  },

  cancelAccountDeletion: async () => {
    return await api.post('/patient-service/api/patients/cancel-deletion');
  },
};

export default patientService;