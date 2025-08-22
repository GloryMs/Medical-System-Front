import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cases: [],
  currentCase: null,
  filteredCases: [],
  statistics: {
    total: 0,
    pending: 0,
    assigned: 0,
    accepted: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    closed: 0,
  },
  filters: {
    status: 'all',
    priority: 'all',
    specialization: 'all',
    dateRange: null,
    searchTerm: '',
  },
  sortBy: {
    field: 'createdAt',
    order: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    // Fetch cases
    fetchCasesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCasesSuccess: (state, action) => {
      state.isLoading = false;
      state.cases = action.payload.cases;
      state.pagination = action.payload.pagination;
      state.statistics = action.payload.statistics;
      state.error = null;
    },
    fetchCasesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Single case operations
    setCaseDetails: (state, action) => {
      state.currentCase = action.payload;
      state.error = null;
    },
    updateCaseDetails: (state, action) => {
      if (state.currentCase && state.currentCase.id === action.payload.id) {
        state.currentCase = { ...state.currentCase, ...action.payload };
      }
      const index = state.cases.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = { ...state.cases[index], ...action.payload };
      }
    },
    clearCurrentCase: (state) => {
      state.currentCase = null;
    },

    // Submit new case
    submitCaseStart: (state) => {
      state.isSubmitting = true;
      state.error = null;
    },
    submitCaseSuccess: (state, action) => {
      state.isSubmitting = false;
      state.cases.unshift(action.payload);
      state.statistics.total += 1;
      state.statistics.pending += 1;
      state.error = null;
    },
    submitCaseFailure: (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    },

    // Update case status
    updateCaseStatus: (state, action) => {
      const { caseId, newStatus, previousStatus } = action.payload;
      
      // Update case in list
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        state.cases[caseIndex].status = newStatus;
        state.cases[caseIndex].updatedAt = new Date().toISOString();
      }
      
      // Update current case if it matches
      if (state.currentCase && state.currentCase.id === caseId) {
        state.currentCase.status = newStatus;
        state.currentCase.updatedAt = new Date().toISOString();
      }
      
      // Update statistics
      if (previousStatus && state.statistics[previousStatus] > 0) {
        state.statistics[previousStatus] -= 1;
      }
      state.statistics[newStatus] = (state.statistics[newStatus] || 0) + 1;
    },

    // Accept case (Doctor)
    acceptCase: (state, action) => {
      const { caseId, doctorId } = action.payload;
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        state.cases[caseIndex].status = 'accepted';
        state.cases[caseIndex].assignedDoctorId = doctorId;
        state.cases[caseIndex].acceptedAt = new Date().toISOString();
      }
      if (state.currentCase && state.currentCase.id === caseId) {
        state.currentCase.status = 'accepted';
        state.currentCase.assignedDoctorId = doctorId;
        state.currentCase.acceptedAt = new Date().toISOString();
      }
    },

    // Reject case (Doctor)
    rejectCase: (state, action) => {
      const { caseId, reason } = action.payload;
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        state.cases[caseIndex].status = 'rejected';
        state.cases[caseIndex].rejectionReason = reason;
        state.cases[caseIndex].rejectedAt = new Date().toISOString();
      }
      if (state.currentCase && state.currentCase.id === caseId) {
        state.currentCase.status = 'rejected';
        state.currentCase.rejectionReason = reason;
        state.currentCase.rejectedAt = new Date().toISOString();
      }
    },

    // Add case document
    addCaseDocument: (state, action) => {
      const { caseId, document } = action.payload;
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        if (!state.cases[caseIndex].documents) {
          state.cases[caseIndex].documents = [];
        }
        state.cases[caseIndex].documents.push(document);
      }
      if (state.currentCase && state.currentCase.id === caseId) {
        if (!state.currentCase.documents) {
          state.currentCase.documents = [];
        }
        state.currentCase.documents.push(document);
      }
    },

    // Remove case document
    removeCaseDocument: (state, action) => {
      const { caseId, documentId } = action.payload;
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1 && state.cases[caseIndex].documents) {
        state.cases[caseIndex].documents = state.cases[caseIndex].documents
          .filter(doc => doc.id !== documentId);
      }
      if (state.currentCase && state.currentCase.id === caseId && state.currentCase.documents) {
        state.currentCase.documents = state.currentCase.documents
          .filter(doc => doc.id !== documentId);
      }
    },

    // Add case note
    addCaseNote: (state, action) => {
      const { caseId, note } = action.payload;
      const caseIndex = state.cases.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        if (!state.cases[caseIndex].notes) {
          state.cases[caseIndex].notes = [];
        }
        state.cases[caseIndex].notes.push(note);
      }
      if (state.currentCase && state.currentCase.id === caseId) {
        if (!state.currentCase.notes) {
          state.currentCase.notes = [];
        }
        state.currentCase.notes.push(note);
      }
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1;
    },

    // Sorting
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },

    // Bulk operations
    bulkUpdateCases: (state, action) => {
      const updates = action.payload;
      updates.forEach(update => {
        const index = state.cases.findIndex(c => c.id === update.id);
        if (index !== -1) {
          state.cases[index] = { ...state.cases[index], ...update };
        }
      });
    },

    // Clear state
    clearCases: (state) => {
      state.cases = [];
      state.currentCase = null;
      state.filteredCases = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCasesStart,
  fetchCasesSuccess,
  fetchCasesFailure,
  setCaseDetails,
  updateCaseDetails,
  clearCurrentCase,
  submitCaseStart,
  submitCaseSuccess,
  submitCaseFailure,
  updateCaseStatus,
  acceptCase,
  rejectCase,
  addCaseDocument,
  removeCaseDocument,
  addCaseNote,
  setFilters,
  clearFilters,
  setSearchTerm,
  setSortBy,
  setCurrentPage,
  setItemsPerPage,
  bulkUpdateCases,
  clearCases,
  clearError,
} = caseSlice.actions;

// Selectors
export const selectAllCases = (state) => state.cases.cases;
export const selectCurrentCase = (state) => state.cases.currentCase;
export const selectCaseStatistics = (state) => state.cases.statistics;
export const selectCaseFilters = (state) => state.cases.filters;
export const selectCasePagination = (state) => state.cases.pagination;
export const selectCasesLoading = (state) => state.cases.isLoading;
export const selectCasesError = (state) => state.cases.error;

export default caseSlice.reducer;