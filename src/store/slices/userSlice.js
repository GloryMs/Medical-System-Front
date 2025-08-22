import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    },
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
  },
  medicalHistory: null,
  emergencyContacts: [],
  insuranceInfo: null,
  subscription: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Profile Management
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Preferences Management
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.error = null;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.error = null;
    },
    updateNotificationPreferences: (state, action) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload
      };
      state.error = null;
    },
    setLanguage: (state, action) => {
      state.preferences.language = action.payload;
    },
    setTimezone: (state, action) => {
      state.preferences.timezone = action.payload;
    },
    setTheme: (state, action) => {
      state.preferences.theme = action.payload;
    },

    // Medical History Management
    setMedicalHistory: (state, action) => {
      state.medicalHistory = action.payload;
      state.error = null;
    },
    updateMedicalHistory: (state, action) => {
      if (state.medicalHistory) {
        state.medicalHistory = { ...state.medicalHistory, ...action.payload };
      } else {
        state.medicalHistory = action.payload;
      }
      state.error = null;
    },
    addMedicalRecord: (state, action) => {
      if (state.medicalHistory) {
        if (!state.medicalHistory.records) {
          state.medicalHistory.records = [];
        }
        state.medicalHistory.records.push(action.payload);
      }
    },
    updateMedicalRecord: (state, action) => {
      const { recordId, data } = action.payload;
      if (state.medicalHistory && state.medicalHistory.records) {
        const index = state.medicalHistory.records.findIndex(
          record => record.id === recordId
        );
        if (index !== -1) {
          state.medicalHistory.records[index] = {
            ...state.medicalHistory.records[index],
            ...data
          };
        }
      }
    },
    deleteMedicalRecord: (state, action) => {
      const recordId = action.payload;
      if (state.medicalHistory && state.medicalHistory.records) {
        state.medicalHistory.records = state.medicalHistory.records.filter(
          record => record.id !== recordId
        );
      }
    },

    // Emergency Contacts Management
    setEmergencyContacts: (state, action) => {
      state.emergencyContacts = action.payload;
      state.error = null;
    },
    addEmergencyContact: (state, action) => {
      state.emergencyContacts.push(action.payload);
      state.error = null;
    },
    updateEmergencyContact: (state, action) => {
      const { contactId, data } = action.payload;
      const index = state.emergencyContacts.findIndex(
        contact => contact.id === contactId
      );
      if (index !== -1) {
        state.emergencyContacts[index] = {
          ...state.emergencyContacts[index],
          ...data
        };
      }
    },
    deleteEmergencyContact: (state, action) => {
      const contactId = action.payload;
      state.emergencyContacts = state.emergencyContacts.filter(
        contact => contact.id !== contactId
      );
    },

    // Insurance Information Management
    setInsuranceInfo: (state, action) => {
      state.insuranceInfo = action.payload;
      state.error = null;
    },
    updateInsuranceInfo: (state, action) => {
      if (state.insuranceInfo) {
        state.insuranceInfo = { ...state.insuranceInfo, ...action.payload };
      } else {
        state.insuranceInfo = action.payload;
      }
      state.error = null;
    },
    clearInsuranceInfo: (state) => {
      state.insuranceInfo = null;
    },

    // Subscription Management
    setSubscription: (state, action) => {
      state.subscription = action.payload;
      state.error = null;
    },
    updateSubscription: (state, action) => {
      if (state.subscription) {
        state.subscription = { ...state.subscription, ...action.payload };
      } else {
        state.subscription = action.payload;
      }
      state.error = null;
    },
    clearSubscription: (state) => {
      state.subscription = null;
    },

    // Loading and Error Management
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset User Data
    resetUserData: (state) => {
      return initialState;
    },

    // Bulk Data Update
    setUserData: (state, action) => {
      const { profile, medicalHistory, emergencyContacts, insuranceInfo, subscription, preferences } = action.payload;
      
      if (profile) state.profile = profile;
      if (medicalHistory) state.medicalHistory = medicalHistory;
      if (emergencyContacts) state.emergencyContacts = emergencyContacts;
      if (insuranceInfo) state.insuranceInfo = insuranceInfo;
      if (subscription) state.subscription = subscription;
      if (preferences) state.preferences = { ...state.preferences, ...preferences };
      
      state.error = null;
    },

    // Avatar Management
    updateAvatar: (state, action) => {
      if (state.profile) {
        state.profile.avatar = action.payload;
      }
    },
    removeAvatar: (state) => {
      if (state.profile) {
        state.profile.avatar = null;
      }
    },

    // Account Status
    updateAccountStatus: (state, action) => {
      if (state.profile) {
        state.profile.accountStatus = action.payload;
      }
    },
    updateVerificationStatus: (state, action) => {
      if (state.profile) {
        state.profile.isVerified = action.payload;
      }
    },

    // Privacy Settings
    updatePrivacySettings: (state, action) => {
      state.preferences.privacy = {
        ...state.preferences.privacy,
        ...action.payload
      };
    },

    // Accessibility Settings
    updateAccessibilitySettings: (state, action) => {
      state.preferences.accessibility = {
        ...state.preferences.accessibility,
        ...action.payload
      };
    },

    // Communication Preferences
    updateCommunicationPreferences: (state, action) => {
      state.preferences.communication = {
        ...state.preferences.communication,
        ...action.payload
      };
    },

    // Security Settings
    updateSecuritySettings: (state, action) => {
      state.preferences.security = {
        ...state.preferences.security,
        ...action.payload
      };
    },

    // Activity Status
    updateLastActivity: (state, action) => {
      if (state.profile) {
        state.profile.lastActivity = action.payload;
      }
    },
    updateOnlineStatus: (state, action) => {
      if (state.profile) {
        state.profile.isOnline = action.payload;
      }
    },
  },
});

export const {
  // Profile actions
  setProfile,
  updateProfile,
  clearProfile,
  
  // Preferences actions
  setPreferences,
  updatePreferences,
  updateNotificationPreferences,
  setLanguage,
  setTimezone,
  setTheme,
  
  // Medical history actions
  setMedicalHistory,
  updateMedicalHistory,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  
  // Emergency contacts actions
  setEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  
  // Insurance actions
  setInsuranceInfo,
  updateInsuranceInfo,
  clearInsuranceInfo,
  
  // Subscription actions
  setSubscription,
  updateSubscription,
  clearSubscription,
  
  // Loading and error actions
  setLoading,
  setError,
  clearError,
  
  // Utility actions
  resetUserData,
  setUserData,
  updateAvatar,
  removeAvatar,
  updateAccountStatus,
  updateVerificationStatus,
  updatePrivacySettings,
  updateAccessibilitySettings,
  updateCommunicationPreferences,
  updateSecuritySettings,
  updateLastActivity,
  updateOnlineStatus,
} = userSlice.actions;

// Selectors
export const selectProfile = (state) => state.user.profile;
export const selectPreferences = (state) => state.user.preferences;
export const selectMedicalHistory = (state) => state.user.medicalHistory;
export const selectEmergencyContacts = (state) => state.user.emergencyContacts;
export const selectInsuranceInfo = (state) => state.user.insuranceInfo;
export const selectSubscription = (state) => state.user.subscription;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;

// Complex selectors
export const selectIsProfileComplete = (state) => {
  const profile = state.user.profile;
  if (!profile) return false;
  
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  return requiredFields.every(field => profile[field]);
};

export const selectNotificationSettings = (state) => state.user.preferences.notifications;
export const selectTheme = (state) => state.user.preferences.theme;
export const selectLanguage = (state) => state.user.preferences.language;
export const selectTimezone = (state) => state.user.preferences.timezone;

export default userSlice.reducer;