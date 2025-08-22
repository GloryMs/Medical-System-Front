import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: true,
    push: true,
    sms: false,
    inApp: true,
    appointmentReminders: true,
    caseUpdates: true,
    paymentAlerts: true,
    systemAnnouncements: true,
  },
  filters: {
    type: 'all',
    isRead: 'all',
    dateRange: null,
  },
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.error = null;
    },
    fetchNotificationsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add new notification
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Mark as read
    markAsRead: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1 && !state.notifications[index].isRead) {
        state.notifications[index].isRead = true;
        state.notifications[index].readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read
    markAllAsRead: (state) => {
      const now = new Date().toISOString();
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = now;
        }
      });
      state.unreadCount = 0;
    },

    // Mark as unread
    markAsUnread: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1 && state.notifications[index].isRead) {
        state.notifications[index].isRead = false;
        state.notifications[index].readAt = null;
        state.unreadCount += 1;
      }
    },

    // Remove notification
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Clear read notifications
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.isRead);
    },

    // Update notification settings
    updateNotificationSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    toggleNotificationSetting: (state, action) => {
      const setting = action.payload;
      if (state.settings.hasOwnProperty(setting)) {
        state.settings[setting] = !state.settings[setting];
      }
    },

    // Filter management
    setNotificationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearNotificationFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Batch update
    batchUpdateNotifications: (state, action) => {
      const { notificationIds, updates } = action.payload;
      notificationIds.forEach(id => {
        const index = state.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          state.notifications[index] = { ...state.notifications[index], ...updates };
        }
      });
      // Recalculate unread count
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },

    // Set notifications (replace all)
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  removeNotification,
  clearAllNotifications,
  clearReadNotifications,
  updateNotificationSettings,
  toggleNotificationSetting,
  setNotificationFilters,
  clearNotificationFilters,
  batchUpdateNotifications,
  setNotifications,
  clearError,
} = notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectUnreadNotifications = (state) => 
  state.notifications.notifications.filter(n => !n.isRead);
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationSettings = (state) => state.notifications.settings;
export const selectNotificationFilters = (state) => state.notifications.filters;
export const selectNotificationsLoading = (state) => state.notifications.isLoading;
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationSlice.reducer;