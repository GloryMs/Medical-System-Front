// src/services/api/messageService.js
import { api } from './apiClient';

const messageService = {
  // ====== CONVERSATIONS ======

  /**
   * Get conversations for the current user
   * The backend determines the perspective based on the user's role from JWT:
   * - DOCTOR: sees patient names as otherUserName
   * - PATIENT: sees doctor names as otherUserName
   * - MEDICAL_SUPERVISOR: should see doctor names as otherUserName (patient perspective)
   */
  getConversations: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/messaging-service/api/messages/conversations?${params}`);
  },

  getConversationById: async (conversationId) => {
    return await api.get(`/messaging-service/api/messages/conversations/${conversationId}`);
  },

  getConversationByCase: async (caseId) => {
    return await api.get(`/messaging-service/api/messages/conversations/case/${caseId}`);
  },

  createConversation: async (conversationData) => {
    return await api.post('/messaging-service/api/messages/conversations', conversationData);
  },

  updateConversationStatus: async (conversationId, status) => {
    return await api.put(
      `/messaging-service/api/messages/conversations/${conversationId}/status?status=${status}`
    );
  },

  archiveConversation: async (conversationId) => {
    return await api.post(`/messaging-service/api/messages/conversations/${conversationId}/archive`);
  },

  searchConversations: async (query) => {
    return await api.get(
      `/messaging-service/api/messages/conversations/search?query=${encodeURIComponent(query)}`
    );
  },

  // ====== MESSAGES ======

  getMessages: async (conversationId, params = {}) => {
    const { page = 0, size = 50 } = params;
    return await api.get(
      `/messaging-service/api/messages/conversation/${conversationId}?page=${page}&size=${size}`
    );
  },

  sendMessage: async (messageData) => {
    return await api.post('/messaging-service/api/messages/send', messageData);
  },

  markMessageAsRead: async (messageId, userId, userRole) => {
    return await api.put(`/messaging-service/api/messages/${messageId}/read?userId=${userId}&userRole=${userRole}`);
  },

  markConversationAsRead: async (conversationId, userId, userRole) => {
    return await api.put(`/messaging-service/api/messages/conversations/${conversationId}/mark-read?userId=${userId}&userRole=${userRole}`);
  },

  deleteMessage: async (messageId, userId, userRole) => {
    return await api.delete(`/messaging-service/api/messages/${messageId}?userId=${userId}&userRole=${userRole}`);
  },

  searchMessages: async (conversationId, query, userId, userRole) => {
    return await api.get(
      `/messaging-service/api/messages/search?conversationId=${conversationId}&query=${encodeURIComponent(query)}&userId=${userId}&userRole=${userRole}`
    );
  },

  // ====== UNREAD COUNT ======

  getUnreadCount: async () => {
    return await api.get('/messaging-service/api/messages/unread-count');
  },

  // ====== ATTACHMENTS ======

  uploadAttachment: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.upload(
      '/messaging-service/api/messages/attachments/upload',
      formData,
      { onUploadProgress }
    );
  },

  downloadAttachment: async (attachmentId, fileName) => {
    return await api.download(
      `/messaging-service/api/messages/attachments/${attachmentId}/download`,
      fileName
    );
  }
};

export default messageService;