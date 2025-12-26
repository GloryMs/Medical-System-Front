import { api } from './apiClient';

const adminService = {
  // Dashboard and Analytics
  getDashboardStats: async () => {
    return await api.get('/admin-service/api/admin/stats');
  },

  getSystemMetrics: async (period = 'month') => {
    return await api.get(`/admin-service/api/admin/metrics?period=${period}`);
  },

  getRevenueAnalytics: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/analytics/revenue?${params}`);
  },

  getUserGrowthAnalytics: async (period = 'year') => {
    return await api.get(`/admin-service/api/admin/analytics/user-growth?period=${period}`);
  },

  // User Management
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/users?${params}`);
  },

  getUserById: async (userId) => {
    return await api.get(`/admin-service/api/admin/users/${userId}`);
  },

  createUser: async (userData) => {
    return await api.post('/admin-service/api/admin/users', userData);
  },

  updateUser: async (userId, userData) => {
    return await api.put(`/admin-service/api/admin/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    return await api.delete(`/admin-service/api/admin/users/${userId}`);
  },

  suspendUser: async (userId, reason) => {
    return await api.post(`/admin-service/api/admin/users/${userId}/suspend`, { reason });
  },

  unsuspendUser: async (userId) => {
    return await api.post(`/admin-service/api/admin/users/${userId}/unsuspend`);
  },

  resetUserPassword: async (userId) => {
    return await api.post(`/admin-service/api/admin/users/${userId}/reset-password`);
  },

  // Doctor Management and Verification
  getPendingDoctors: async () => {
    return await api.get('/admin-service/api/admin/doctors/pending-verification');
  },

  getDoctorVerificationDetails: async (doctorId) => {
    return await api.get(`/admin-service/api/admin/doctors/${doctorId}/verification`);
  },

  verifyDoctor: async (doctorId, verificationData) => {
    return await api.post(`/admin-service/api/admin/doctors/${doctorId}/verify`, verificationData);
  },

  rejectDoctorVerification: async (doctorId, reason) => {
    return await api.post(`/admin-service/api/admin/doctors/${doctorId}/reject`, { reason });
  },

  getAllDoctors: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/doctors?${params}`);
  },

  updateDoctorStatus: async (doctorId, status) => {
    return await api.put(`/admin-service/api/admin/doctors/${doctorId}/status`, { status });
  },

  // Case Management
  getAllCases: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/cases?${params}`);
  },

  getCaseById: async (caseId) => {
    return await api.get(`/admin-service/api/admin/cases/${caseId}`);
  },

  assignCaseToDoctor: async (caseId, doctorId) => {
    return await api.post(`/admin-service/api/admin/cases/${caseId}/assign`, { doctorId });
  },

  reassignCase: async (caseId, newDoctorId, reason) => {
    return await api.post(`/admin-service/api/admin/cases/${caseId}/reassign`, { 
      newDoctorId, 
      reason 
    });
  },

  getCaseMetrics: async () => {
    return await api.get('/admin-service/api/admin/cases/metrics');
  },

  // Payment Management
  getAllPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/payments?${params}`);
  },

  getSubscriptionPayments: async () => {
    return await api.get('/admin-service/api/admin/payments/subscriptions');
  },

  getConsultationPayments: async () => {
    return await api.get('/admin-service/api/admin/payments/consultations');
  },

  processRefund: async (refundData) => {
    return await api.post('/admin-service/api/admin/payments/refund', refundData);
  },

  getCaseAnalytics: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await api.get(`/admin-service/api/admin/cases/analytics?${params}`);
  },

  getPaymentAnalytics: async (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await api.get(`/admin-service/api/admin/payments/analytics?${params}`);
  },

  // Complaint Management
  getAllComplaints: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/complaints?${params}`);
  },

  getComplaintById: async (complaintId) => {
    return await api.get(`/admin-service/api/admin/complaints/${complaintId}`);
  },

  updateComplaintStatus: async (complaintId, status, resolution) => {
    return await api.put(`/admin-service/api/admin/complaints/${complaintId}`, { 
      status, 
      resolution 
    });
  },

  assignComplaintToAgent: async (complaintId, agentId) => {
    return await api.post(`/admin-service/api/admin/complaints/${complaintId}/assign`, { 
      agentId 
    });
  },

  addComplaintNote: async (complaintId, note) => {
    return await api.post(`/admin-service/api/admin/complaints/${complaintId}/notes`, { 
      note 
    });
  },

  //Notifications:
  getNotifications: async (userId) => {
    return await api.get(`/admin-service/api/admin/notifications/${userId}`);
  },

  markNotificationAsRead: async (notificationId, userId) => {
    return await api.put(
      `/admin-service/api/admin/notifications/${notificationId}/${userId}/read`
    );
  },

  markAllNotificationsAsRead: async (userId) => {
    return await api.put(
      `/admin-service/api/admin/notifications/${userId}/read-all`
    );
  },

  deleteNotification: async (notificationId) => {
    return await api.delete(
      `/admin-service/api/admin/notifications/${notificationId}`
    );
  },

  getNotificationSettings: async () => {
    return await api.get(
      '/admin-service/api/admin/notifications/settings'
    );
  },

  updateNotificationSettings: async (settings) => {
    return await api.put(
      '/admin-service/api/admin/notifications/settings',
      settings
    );
  },

  // System Configuration
  getSystemConfiguration: async () => {
    return await api.get('/admin-service/api/admin/config/system');
  },

  updateSystemConfiguration: async (configData) => {
    return await api.put('/admin-service/api/admin/config/system', configData);
  },

  // Medical Configuration
  getAllDiseases: async () => {
    return await api.get('/admin-service/api/admin/config/diseases');
  },

  getDiseasesByCategory: async (category) => {
    return await api.get(`/admin-service/api/admin/config/diseases/category/${category}`);
  },

  createDisease: async (diseaseData) => {
    return await api.post('/admin-service/api/admin/config/diseases', diseaseData);
  },

  updateDisease: async (diseaseId, diseaseData) => {
    return await api.put(`/admin-service/api/admin/config/diseases/${diseaseId}`, diseaseData);
  },

  deleteDisease: async (diseaseId) => {
    return await api.delete(`/admin-service/api/admin/config/diseases/${diseaseId}`);
  },

  getAllMedications: async () => {
    return await api.get('/admin-service/api/admin/config/medications');
  },

  createMedication: async (medicationData) => {
    return await api.post('/admin-service/api/admin/config/medications', medicationData);
  },

  updateMedication: async (medicationId, medicationData) => {
    return await api.put(`/admin-service/api/admin/config/medications/${medicationId}`, medicationData);
  },

  deleteMedication: async (medicationId) => {
    return await api.delete(`/admin-service/api/admin/config/medications/${medicationId}`);
  },

  getAllSymptoms: async () => {
    return await api.get('/admin-service/api/admin/config/symptoms');
  },

  getSymptomsByBodySystem: async (bodySystem) => {
    return await api.get(`/admin-service/api/admin/config/symptoms/system/${bodySystem}`);
  },

  createSymptom: async (symptomData) => {
    return await api.post('/admin-service/api/admin/config/symptoms', symptomData);
  },

  updateSymptom: async (symptomId, symptomData) => {
    return await api.put(`/admin-service/api/admin/config/symptoms/${symptomId}`, symptomData);
  },

  deleteSymptom: async (symptomId) => {
    return await api.delete(`/admin-service/api/admin/config/symptoms/${symptomId}`);
  },

  getConfigurationsByType: async (configType) => {
    return await api.get(`/admin-service/api/admin/config/${configType}`);
  },

  // System Reports
  generateSystemReport: async (reportType, filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/reports/${reportType}?${params}`);
  },

  exportSystemReport: async (reportType, format = 'pdf', filters = {}) => {
    const params = new URLSearchParams({ ...filters, format });
    return await api.download(`/admin-service/api/admin/reports/${reportType}/export?${params}`, 
      `${reportType}_report.${format}`);
  },

  getUserReport: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/reports/users?${params}`);
  },

  getRevenueReport: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/reports/revenue?${params}`);
  },

  getCaseReport: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/reports/cases?${params}`);
  },

  getDoctorPerformanceReport: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/reports/doctor-performance?${params}`);
  },

  // System Health and Monitoring
  getSystemHealth: async () => {
    return await api.get('/admin-service/api/admin/health');
  },

  getSystemLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/logs?${params}`);
  },

  clearSystemLogs: async () => {
    return await api.post('/admin-service/api/admin/logs/clear');
  },

  // Cache Management
  clearCache: async () => {
    return await api.post('/admin-service/api/admin/config/cache/clear');
  },

  getCacheStats: async () => {
    return await api.get('/admin-service/api/admin/cache/stats');
  },

  // Backup and Maintenance
  createBackup: async () => {
    return await api.post('/admin-service/api/admin/backup/create');
  },

  getBackupHistory: async () => {
    return await api.get('/admin-service/api/admin/backup/history');
  },

  restoreBackup: async (backupId) => {
    return await api.post(`/admin-service/api/admin/backup/${backupId}/restore`);
  },

  deleteBackup: async (backupId) => {
    return await api.delete(`/admin-service/api/admin/backup/${backupId}`);
  },

  // Email Templates
  getEmailTemplates: async () => {
    return await api.get('/admin-service/api/admin/email-templates');
  },

  getEmailTemplate: async (templateId) => {
    return await api.get(`/admin-service/api/admin/email-templates/${templateId}`);
  },

  updateEmailTemplate: async (templateId, templateData) => {
    return await api.put(`/admin-service/api/admin/email-templates/${templateId}`, templateData);
  },

  testEmailTemplate: async (templateId, testData) => {
    return await api.post(`/admin-service/api/admin/email-templates/${templateId}/test`, testData);
  },

  // Notification Management
  sendSystemNotification: async (notificationData) => {
    return await api.post('/admin-service/api/admin/notifications/system', notificationData);
  },

  sendBulkNotification: async (notificationData) => {
    return await api.post('/admin-service/api/admin/notifications/bulk', notificationData);
  },

  getNotificationHistory: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/notifications/history?${params}`);
  },

  // Security and Audit
  getAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/audit-logs?${params}`);
  },

  getSecurityEvents: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/security/events?${params}`);
  },

  getFailedLoginAttempts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/admin-service/api/admin/security/failed-logins?${params}`);
  },

  blockIpAddress: async (ipAddress, reason) => {
    return await api.post('/admin-service/api/admin/security/block-ip', { ipAddress, reason });
  },

  unblockIpAddress: async (ipAddress) => {
    return await api.post('/admin-service/api/admin/security/unblock-ip', { ipAddress });
  },

  // Feature Flags
  getFeatureFlags: async () => {
    return await api.get('/admin-service/api/admin/feature-flags');
  },

  updateFeatureFlag: async (flagId, enabled) => {
    return await api.put(`/admin-service/api/admin/feature-flags/${flagId}`, { enabled });
  },

  // API Rate Limiting
  getRateLimitSettings: async () => {
    return await api.get('/admin-service/api/admin/rate-limits');
  },

  updateRateLimitSettings: async (settings) => {
    return await api.put('/admin-service/api/admin/rate-limits', settings);
  },

  // System Announcements
  getAnnouncements: async () => {
    return await api.get('/admin-service/api/admin/announcements');
  },

  createAnnouncement: async (announcementData) => {
    return await api.post('/admin-service/api/admin/announcements', announcementData);
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    return await api.put(`/admin-service/api/admin/announcements/${announcementId}`, announcementData);
  },

  deleteAnnouncement: async (announcementId) => {
    return await api.delete(`/admin-service/api/admin/announcements/${announcementId}`);
  },

  publishAnnouncement: async (announcementId) => {
    return await api.post(`/admin-service/api/admin/announcements/${announcementId}/publish`);
  },

  // Language and Localization
  getSupportedLanguages: async () => {
    return await api.get('/admin-service/api/admin/languages');
  },

  addLanguage: async (languageData) => {
    return await api.post('/admin-service/api/admin/languages', languageData);
  },

  updateLanguage: async (languageId, languageData) => {
    return await api.put(`/admin-service/api/admin/languages/${languageId}`, languageData);
  },

  getTranslations: async (languageCode) => {
    return await api.get(`/admin-service/api/admin/translations/${languageCode}`);
  },

  updateTranslations: async (languageCode, translations) => {
    return await api.put(`/admin-service/api/admin/translations/${languageCode}`, translations);
  },

  // Integration Management
  getIntegrations: async () => {
    return await api.get('/admin-service/api/admin/integrations');
  },

  updateIntegration: async (integrationId, settings) => {
    return await api.put(`/admin-service/api/admin/integrations/${integrationId}`, settings);
  },

  testIntegration: async (integrationId) => {
    return await api.post(`/admin-service/api/admin/integrations/${integrationId}/test`);
  },

  // Database Management
  getDatabaseStats: async () => {
    return await api.get('/admin-service/api/admin/database/stats');
  },

  optimizeDatabase: async () => {
    return await api.post('/admin-service/api/admin/database/optimize');
  },

  // Performance Monitoring
  getPerformanceMetrics: async (timeRange = '24h') => {
    return await api.get(`/admin-service/api/admin/performance?timeRange=${timeRange}`);
  },

  getApiMetrics: async (timeRange = '24h') => {
    return await api.get(`/admin-service/api/admin/admin-service/api-metrics?timeRange=${timeRange}`);
  },

  // Content Management
  getContentPages: async () => {
    return await api.get('/admin-service/api/admin/content/pages');
  },

  updateContentPage: async (pageId, content) => {
    return await api.put(`/admin-service/api/admin/content/pages/${pageId}`, content);
  },

  getFAQs: async () => {
    return await api.get('/admin-service/api/admin/content/faqs');
  },

  createFAQ: async (faqData) => {
    return await api.post('/admin-service/api/admin/content/faqs', faqData);
  },

  updateFAQ: async (faqId, faqData) => {
    return await api.put(`/admin-service/api/admin/content/faqs/${faqId}`, faqData);
  },

  deleteFAQ: async (faqId) => {
    return await api.delete(`/admin-service/api/admin/content/faqs/${faqId}`);
  },

  // API Key Management
  getApiKeys: async () => {
    return await api.get('/admin-service/api/admin/admin-service/api-keys');
  },

  createApiKey: async (keyData) => {
    return await api.post('/admin-service/api/admin/admin-service/api-keys', keyData);
  },

  revokeApiKey: async (keyId) => {
    return await api.delete(`/admin-service/api/admin/admin-service/api-keys/${keyId}`);
  },

  // Webhook Management
  getWebhooks: async () => {
    return await api.get('/admin-service/api/admin/webhooks');
  },

  createWebhook: async (webhookData) => {
    return await api.post('/admin-service/api/admin/webhooks', webhookData);
  },

  updateWebhook: async (webhookId, webhookData) => {
    return await api.put(`/admin-service/api/admin/webhooks/${webhookId}`, webhookData);
  },

  deleteWebhook: async (webhookId) => {
    return await api.delete(`/admin-service/api/admin/webhooks/${webhookId}`);
  },

  testWebhook: async (webhookId) => {
    return await api.post(`/admin-service/api/admin/webhooks/${webhookId}/test`);
  },
};

export default adminService;