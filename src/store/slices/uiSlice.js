import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modals
  modals: {},
  activeModal: null,
  
  // Toasts/Notifications
  toasts: [],
  
  // Drawers
  drawers: {},
  activeDrawer: null,
  
  // Loading states
  isLoading: false,
  loadingText: '',
  loadingProgress: null,
  
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Layout
  layout: 'default',
  compactMode: false,
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Page metadata
  pageTitle: '',
  pageDescription: '',
  
  // Dialogs
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
  
  // Tables
  tableSettings: {
    density: 'normal', // 'compact', 'normal', 'comfortable'
    showFilters: false,
    showColumns: true,
  },
  
  // Forms
  formSettings: {
    autoSave: false,
    showValidation: true,
  },
  
  // Preferences
  preferences: {
    animations: true,
    sounds: false,
    shortcuts: true,
    tooltips: true,
  },
  
  // Error boundary
  hasError: false,
  errorMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal management
    openModal: (state, action) => {
      const { name, props = {} } = action.payload;
      state.modals[name] = { isOpen: true, props };
      state.activeModal = name;
    },
    closeModal: (state, action) => {
      const name = action.payload;
      if (state.modals[name]) {
        state.modals[name].isOpen = false;
      }
      if (state.activeModal === name) {
        state.activeModal = null;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(name => {
        state.modals[name].isOpen = false;
      });
      state.activeModal = null;
    },
    updateModalProps: (state, action) => {
      const { name, props } = action.payload;
      if (state.modals[name]) {
        state.modals[name].props = { ...state.modals[name].props, ...props };
      }
    },

    // Toast management
    addToast: (state, action) => {
      const toast = {
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: new Date().toISOString(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },

    // Drawer management
    openDrawer: (state, action) => {
      const { name, props = {} } = action.payload;
      state.drawers[name] = { isOpen: true, props };
      state.activeDrawer = name;
    },
    closeDrawer: (state, action) => {
      const name = action.payload;
      if (state.drawers[name]) {
        state.drawers[name].isOpen = false;
      }
      if (state.activeDrawer === name) {
        state.activeDrawer = null;
      }
    },
    closeAllDrawers: (state) => {
      Object.keys(state.drawers).forEach(name => {
        state.drawers[name].isOpen = false;
      });
      state.activeDrawer = null;
    },

    // Loading state management
    setLoading: (state, action) => {
      if (typeof action.payload === 'boolean') {
        state.isLoading = action.payload;
        if (!action.payload) {
          state.loadingText = '';
          state.loadingProgress = null;
        }
      } else {
        state.isLoading = action.payload.isLoading;
        state.loadingText = action.payload.loadingText || '';
        state.loadingProgress = action.payload.progress || null;
      }
    },
    setLoadingProgress: (state, action) => {
      state.loadingProgress = action.payload;
    },

    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapse: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebar: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },

    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // Apply theme to document
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    // Layout management
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
    },
    setCompactMode: (state, action) => {
      state.compactMode = action.payload;
    },

    // Breadcrumbs management
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state, action) => {
      state.breadcrumbs = state.breadcrumbs.filter(
        (_, index) => index !== action.payload
      );
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },

    // Page metadata
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
      document.title = action.payload;
    },
    setPageDescription: (state, action) => {
      state.pageDescription = action.payload;
    },
    setPageMetadata: (state, action) => {
      state.pageTitle = action.payload.title || state.pageTitle;
      state.pageDescription = action.payload.description || state.pageDescription;
      if (action.payload.title) {
        document.title = action.payload.title;
      }
    },

    // Confirm dialog
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog = {
        ...initialState.confirmDialog,
        isOpen: false,
      };
    },

    // Table settings
    updateTableSettings: (state, action) => {
      state.tableSettings = { ...state.tableSettings, ...action.payload };
    },
    setTableDensity: (state, action) => {
      state.tableSettings.density = action.payload;
    },
    toggleTableFilters: (state) => {
      state.tableSettings.showFilters = !state.tableSettings.showFilters;
    },
    toggleTableColumns: (state) => {
      state.tableSettings.showColumns = !state.tableSettings.showColumns;
    },

    // Form settings
    updateFormSettings: (state, action) => {
      state.formSettings = { ...state.formSettings, ...action.payload };
    },
    toggleAutoSave: (state) => {
      state.formSettings.autoSave = !state.formSettings.autoSave;
    },
    toggleShowValidation: (state) => {
      state.formSettings.showValidation = !state.formSettings.showValidation;
    },

    // Preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    togglePreference: (state, action) => {
      const key = action.payload;
      if (state.preferences.hasOwnProperty(key)) {
        state.preferences[key] = !state.preferences[key];
      }
    },

    // Error boundary
    setError: (state, action) => {
      state.hasError = true;
      state.errorMessage = action.payload;
    },
    clearError: (state) => {
      state.hasError = false;
      state.errorMessage = null;
    },

    // Reset UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme };
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  updateModalProps,
  addToast,
  removeToast,
  clearToasts,
  openDrawer,
  closeDrawer,
  closeAllDrawers,
  setLoading,
  setLoadingProgress,
  toggleSidebar,
  setSidebar,
  toggleSidebarCollapse,
  setSidebarCollapse,
  toggleMobileSidebar,
  setMobileSidebar,
  setTheme,
  toggleTheme,
  setLayout,
  toggleCompactMode,
  setCompactMode,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
  setPageTitle,
  setPageDescription,
  setPageMetadata,
  showConfirmDialog,
  hideConfirmDialog,
  updateTableSettings,
  setTableDensity,
  toggleTableFilters,
  toggleTableColumns,
  updateFormSettings,
  toggleAutoSave,
  toggleShowValidation,
  updatePreferences,
  togglePreference,
  setError,
  clearError,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectModals = (state) => state.ui.modals;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectToasts = (state) => state.ui.toasts;
export const selectDrawers = (state) => state.ui.drawers;
export const selectActiveDrawer = (state) => state.ui.activeDrawer;
export const selectIsLoading = (state) => state.ui.isLoading;
export const selectLoadingText = (state) => state.ui.loadingText;
export const selectLoadingProgress = (state) => state.ui.loadingProgress;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectMobileSidebarOpen = (state) => state.ui.mobileSidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectLayout = (state) => state.ui.layout;
export const selectCompactMode = (state) => state.ui.compactMode;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectPageDescription = (state) => state.ui.pageDescription;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectTableSettings = (state) => state.ui.tableSettings;
export const selectFormSettings = (state) => state.ui.formSettings;
export const selectPreferences = (state) => state.ui.preferences;
export const selectHasError = (state) => state.ui.hasError;
export const selectErrorMessage = (state) => state.ui.errorMessage;

export default uiSlice.reducer;