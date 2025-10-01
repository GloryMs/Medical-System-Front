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
    return await api.get(`/patient-service/api/patients/cases`);//?${params}
  },

  getCaseById: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}`);
  },

    /**
   * Updated createCase method to support file uploads with multipart/form-data
   */
  // Updated createCase method to handle multipart form data with files
  createCase: async (caseData, onUploadProgress) => {
    const formData = new FormData();
    
    // Add basic case information
    formData.append('caseTitle', caseData.caseTitle || '');
    formData.append('description', caseData.description || '');
    
    // Add disease and medical information
    if (caseData.primaryDiseaseCode) {
      formData.append('primaryDiseaseCode', caseData.primaryDiseaseCode);
    }
    
    // Handle arrays - backend expects List<String>
    if (caseData.secondaryDiseaseCodes && Array.isArray(caseData.secondaryDiseaseCodes)) {
      caseData.secondaryDiseaseCodes.forEach(code => {
        formData.append('secondaryDiseaseCodes', code);
      });
    }
    
    if (caseData.symptomCodes && Array.isArray(caseData.symptomCodes)) {
      caseData.symptomCodes.forEach(code => {
        formData.append('symptomCodes', code);
      });
    }
    
    if (caseData.currentMedicationCodes && Array.isArray(caseData.currentMedicationCodes)) {
      caseData.currentMedicationCodes.forEach(code => {
        formData.append('currentMedicationCodes', code);
      });
    }
    
    // Add specialization information
    if (caseData.requiredSpecialization) {
      formData.append('requiredSpecialization', caseData.requiredSpecialization);
    }
    
    if (caseData.secondarySpecializations && Array.isArray(caseData.secondarySpecializations)) {
      caseData.secondarySpecializations.forEach(code => {
        formData.append('secondarySpecializations', code);
      });
    }
    
    // Add case settings
    formData.append('urgencyLevel', caseData.urgencyLevel || 'MEDIUM');
    formData.append('complexity', caseData.complexity || 'MODERATE');
    formData.append('requiresSecondOpinion', caseData.requiresSecondOpinion || false);
    formData.append('minDoctorsRequired', caseData.minDoctorsRequired || 1);
    formData.append('maxDoctorsAllowed', caseData.maxDoctorsAllowed || 2);
    
    // Add files if any
    if (caseData.files && Array.isArray(caseData.files)) {
      caseData.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    return await api.upload('/patient-service/api/patients/cases', formData, onUploadProgress);
  },


  // Replace the viewCaseDocument method in your patientService.js with this more robust version:

// Replace your document methods in patientService.js with these corrected versions:

  viewCaseDocument: async (caseId, documentId) => {
    try {
      console.log('Making request to view document:', documentId);
      
      // Make request with proper headers for raw binary data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('accessToken');
      
      if (!user.id || !token) {
        alert('Authentication required');
        return;
      }
      
      const response = await fetch(`http://172.16.1.122:8080/patient-service/api/files/${caseId}/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id,
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob directly from the fetch response
      const blob = await response.blob();
      console.log('Received blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      if (blob.size === 0) {
        console.error('Received empty blob');
        alert('Received empty file from server');
        return;
      }
      
      // Create URL and open
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        // Fallback for popup blockers
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Clean up after delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 15000);
      
    } catch (error) {
      console.error('Failed to view document:', error);
      alert('Failed to view document. Please try again.');
      throw error;
    }
  },

  downloadCaseDocument: async (caseId, documentId, filename) => {
    try {
      console.log('Making request to download document:', documentId);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('accessToken');
      
      if (!user.id || !token) {
        alert('Authentication required');
        return;
      }
      
      const response = await fetch(`http://172.16.1.122:8080/patient-service/api/files/${caseId}/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id,
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the blob directly
      const blob = await response.blob();
      
      if (blob.size === 0) {
        alert('Received empty file from server');
        return;
      }
      
      // Get filename from Content-Disposition header or use provided filename
      let downloadFilename = filename || `document_${documentId}`;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
      throw error;
    }
  },


  // downloadCaseDocument: async (caseId, documentId, filename) => {
  //   try {
  //     const response = await api.get(`/patient-service/api/files/${documentId}`, {
  //       responseType: 'blob' // Important for file download
  //     });
      
  //     // Create blob and download link
  //     const blob = new Blob([response.data]);
  //     const url = window.URL.createObjectURL(blob);
      
  //     // Create temporary download link and click it
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = filename || `document_${documentId}`;
  //     document.body.appendChild(link);
  //     link.click();
      
  //     // Clean up
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
      
  //     return response;
  //   } catch (error) {
  //     console.error('Failed to download document:', error);
  //     throw error;
  //   }
  // },

  updateCase: async (caseId, caseData) => {
    return await api.put(`/patient-service/api/patients/cases/${caseId}`, caseData);
  },

  updateCaseAttachments: async (caseId, documentIds) => {
    return await api.put(`/patient-service/api/patients/cases/${caseId}/attachments`, {documentIds });
  },

  deleteCase: async (caseId) => {
    return await api.put(`/patient-service/api/patients/cases/${caseId}/delete`);
  },

    /**
   * NEW: Update case attachments - Upload additional files to existing case
   */
  updateCaseAttachments: async (caseId, files, onUploadProgress) => {
    const formData = new FormData();
    
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return await api.upload(
      `/patient-service/api/patients/cases/${caseId}/attachments`,
      formData,
      onUploadProgress
    );
  },

  /**
   * NEW: Get case attachments summary
   */
  getCaseAttachments: async (caseId) => {
    return await api.get(`/patient-service/api/patients/cases/${caseId}/attachments`);
  },

  // Document Management (Enhanced)
  uploadCaseDocuments: async (caseId, files, onUploadProgress) => {
    // This method is now deprecated in favor of updateCaseAttachments
    // Keeping for backward compatibility
    return await patientService.updateCaseAttachments(caseId, files, onUploadProgress);
  },

  getCaseDocuments: async (caseId) => {
    // This method is now deprecated in favor of getCaseAttachments
    // Keeping for backward compatibility
    return await patientService.getCaseAttachments(caseId);
  },

  /**
   * Get document content for viewing
   */
  getDocumentContent: async (documentId) => {
    return await api.get(`/patient-service/api/patients/documents/${documentId}/content`, {
      responseType: 'blob'
    });
  },

  /**
   * Download document
   */
  downloadDocument: async (documentId, filename) => {
    return await api.download(
      `/patient-service/api/patients/documents/${documentId}/download`,
      filename
    );
  },

  /**
   * Delete document
   */
  deleteDocument: async (documentId) => {
    return await api.delete(`/patient-service/api/patients/documents/${documentId}`);
  },

  /**
   * Get document metadata
   */
  getDocumentMetadata: async (documentId) => {
    return await api.get(`/api/files/${documentId}/metadata`);
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
    return await api.get(`/patient-service/api/patients/cases/appointments`);//?${params}
  },

  getAppointmentById: async (appointmentId) => {
    return await api.get(`/patient-service/api/patients/cases/appointments/${appointmentId}`);
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
    return await api.get(`/patient-service/api/patients/complaints`); //?${params}
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
  getNotifications: async (userId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/patient-service/api/patients/notifications/${userId}`);
  },

  markNotificationAsRead: async (notificationId, userId) => {
  return await api.put(`/patient-service/api/patients/notifications/${notificationId}/${userId}/read?`);
  },

  markAllNotificationsAsRead: async (userId) => {
    return await api.put(`/patient-service/api/patients/notifications/${userId}/read-all`);
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
  getDashboardData: async (patientId) => {
    return await api.get(`/patient-service/api/patients/${patientId}/dashboard`);
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