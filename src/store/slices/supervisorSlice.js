import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supervisorService from '../../services/api/supervisorService';

/**
 * Supervisor Slice - Redux State Management
 * Manages state for Medical Supervisor role
 */

// ==================== Async Thunks ====================

/**
 * Fetch supervisor profile
 */
export const fetchSupervisorProfile = createAsyncThunk(
  'supervisor/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

/**
 * Fetch dashboard statistics
 */
export const fetchDashboardStatistics = createAsyncThunk(
  'supervisor/fetchDashboardStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getDashboardStatistics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

/**
 * Fetch assigned patients
 */
export const fetchPatients = createAsyncThunk(
  'supervisor/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getPatients();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

/**
 * Fetch cases
 */
export const fetchCases = createAsyncThunk(
  'supervisor/fetchCases',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getCases(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
    }
  }
);

/**
 * Fetch coupons summary
 */
export const fetchCouponSummary = createAsyncThunk(
  'supervisor/fetchCouponSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getCouponSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupon summary');
    }
  }
);

/**
 * Fetch patient coupons
 */
export const fetchPatientCoupons = createAsyncThunk(
  'supervisor/fetchPatientCoupons',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await supervisorService.getPatientCoupons(patientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient coupons');
    }
  }
);

/**
 * Submit case for patient
 */
export const submitCase = createAsyncThunk(
  'supervisor/submitCase',
  async ({ patientId, caseData }, { rejectWithValue }) => {
    try {
      const response = await supervisorService.submitCase(patientId, caseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit case');
    }
  }
);

/**
 * Redeem coupon
 */
export const redeemCoupon = createAsyncThunk(
  'supervisor/redeemCoupon',
  async ({ caseId, patientId, couponCode }, { rejectWithValue }) => {
    try {
      const response = await supervisorService.redeemCoupon(caseId, patientId, couponCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to redeem coupon');
    }
  }
);

// ==================== Initial State ====================

const initialState = {
  // Profile
  profile: null,
  profileLoading: false,
  profileError: null,

  // Dashboard Statistics
  statistics: {
    supervisorId: null,
    supervisorName: '',
    verificationStatus: null,
    activePatientCount: 0,
    maxPatientsLimit: 0,
    totalCasesSubmitted: 0,
    activeCases: 0,
    completedCases: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalCouponsIssued: 0,
    availableCoupons: 0,
    usedCoupons: 0,
    totalCouponValue: 0,
    totalPaymentsProcessed: 0,
    lastActivityAt: null,
  },
  statisticsLoading: false,
  statisticsError: null,

  // Patients
  patients: [],
  currentPatient: null,
  patientsLoading: false,
  patientsError: null,

  // Cases
  cases: [],
  currentCase: null,
  casesLoading: false,
  casesError: null,

  // Coupons
  couponSummary: {
    totalCoupons: 0,
    availableCoupons: 0,
    usedCoupons: 0,
    expiredCoupons: 0,
    totalAvailableValue: 0,
  },
  patientCoupons: [],
  couponsLoading: false,
  couponsError: null,

  // Appointments
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,

  // Filters
  filters: {
    patientStatus: 'all',
    caseStatus: 'all',
    searchTerm: '',
    selectedPatientId: null,
  },

  // UI State
  isLoading: false,
  error: null,
  successMessage: null,
};

// ==================== Slice ====================

const supervisorSlice = createSlice({
  name: 'supervisor',
  initialState,
  reducers: {
    // Profile Actions
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Patient Actions
    setPatients: (state, action) => {
      state.patients = action.payload;
    },
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    addPatient: (state, action) => {
      state.patients.push(action.payload);
    },
    updatePatient: (state, action) => {
      const index = state.patients.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...action.payload };
      }
    },
    removePatient: (state, action) => {
      state.patients = state.patients.filter(p => p.id !== action.payload);
    },

    // Case Actions
    setCases: (state, action) => {
      state.cases = action.payload;
    },
    setCurrentCase: (state, action) => {
      state.currentCase = action.payload;
    },
    addCase: (state, action) => {
      state.cases.unshift(action.payload);
    },
    updateCase: (state, action) => {
      const index = state.cases.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = { ...state.cases[index], ...action.payload };
      }
    },

    // Coupon Actions
    setCouponSummary: (state, action) => {
      state.couponSummary = action.payload;
    },
    setPatientCoupons: (state, action) => {
      state.patientCoupons = action.payload;
    },

    // Appointment Actions
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },

    // Statistics Actions
    setStatistics: (state, action) => {
      state.statistics = action.payload;
    },

    // Filter Actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPatientFilter: (state, action) => {
      state.filters.selectedPatientId = action.payload;
    },
    setCaseStatusFilter: (state, action) => {
      state.filters.caseStatus = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Loading & Error Actions
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
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    // Reset State
    resetSupervisorState: () => initialState,
  },

  // ==================== Extra Reducers (Async Thunks) ====================
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchSupervisorProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchSupervisorProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchSupervisorProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });

    // Fetch Dashboard Statistics
    builder
      .addCase(fetchDashboardStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchDashboardStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload;
      });

    // Fetch Patients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload;
      });

    // Fetch Cases
    builder
      .addCase(fetchCases.pending, (state) => {
        state.casesLoading = true;
        state.casesError = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.casesLoading = false;
        state.cases = action.payload;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.casesLoading = false;
        state.casesError = action.payload;
      });

    // Fetch Coupon Summary
    builder
      .addCase(fetchCouponSummary.pending, (state) => {
        state.couponsLoading = true;
        state.couponsError = null;
      })
      .addCase(fetchCouponSummary.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.couponSummary = action.payload;
      })
      .addCase(fetchCouponSummary.rejected, (state, action) => {
        state.couponsLoading = false;
        state.couponsError = action.payload;
      });

    // Fetch Patient Coupons
    builder
      .addCase(fetchPatientCoupons.pending, (state) => {
        state.couponsLoading = true;
        state.couponsError = null;
      })
      .addCase(fetchPatientCoupons.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.patientCoupons = action.payload;
      })
      .addCase(fetchPatientCoupons.rejected, (state, action) => {
        state.couponsLoading = false;
        state.couponsError = action.payload;
      });

    // Submit Case
    builder
      .addCase(submitCase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitCase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cases.unshift(action.payload);
        state.successMessage = 'Case submitted successfully';
      })
      .addCase(submitCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Redeem Coupon
    builder
      .addCase(redeemCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(redeemCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Coupon redeemed successfully';
      })
      .addCase(redeemCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ==================== Export Actions ====================
export const {
  setProfile,
  clearProfile,
  setPatients,
  setCurrentPatient,
  addPatient,
  updatePatient,
  removePatient,
  setCases,
  setCurrentCase,
  addCase,
  updateCase,
  setCouponSummary,
  setPatientCoupons,
  setAppointments,
  setStatistics,
  setFilters,
  setPatientFilter,
  setCaseStatusFilter,
  setSearchTerm,
  clearFilters,
  setLoading,
  setError,
  clearError,
  setSuccessMessage,
  clearSuccessMessage,
  resetSupervisorState,
} = supervisorSlice.actions;

// ==================== Selectors ====================
export const selectSupervisorProfile = (state) => state.supervisor.profile;
export const selectSupervisorStatistics = (state) => state.supervisor.statistics;
export const selectSupervisorPatients = (state) => state.supervisor.patients;
export const selectSupervisorCases = (state) => state.supervisor.cases;
export const selectSupervisorCoupons = (state) => state.supervisor.couponSummary;
export const selectSupervisorFilters = (state) => state.supervisor.filters;
export const selectSupervisorLoading = (state) => state.supervisor.isLoading;
export const selectSupervisorError = (state) => state.supervisor.error;

// ==================== Export Reducer ====================
export default supervisorSlice.reducer;
