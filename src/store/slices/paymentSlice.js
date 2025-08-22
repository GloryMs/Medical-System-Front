import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  currentPayment: null,
  paymentMethods: [],
  selectedPaymentMethod: null,
  transactions: [],
  invoices: [],
  statistics: {
    totalPaid: 0,
    totalPending: 0,
    totalRefunded: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  },
  subscription: {
    status: null,
    plan: null,
    startDate: null,
    endDate: null,
    autoRenew: false,
    paymentMethod: null,
  },
  filters: {
    status: 'all',
    type: 'all',
    dateRange: null,
    minAmount: null,
    maxAmount: null,
  },
  sortBy: {
    field: 'createdAt',
    order: 'desc',
  },
  isLoading: false,
  isProcessing: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Fetch payments
    fetchPaymentsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPaymentsSuccess: (state, action) => {
      state.isLoading = false;
      state.payments = action.payload.payments;
      state.statistics = action.payload.statistics || state.statistics;
      state.error = null;
    },
    fetchPaymentsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Single payment operations
    setPaymentDetails: (state, action) => {
      state.currentPayment = action.payload;
      state.error = null;
    },
    updatePaymentDetails: (state, action) => {
      if (state.currentPayment && state.currentPayment.id === action.payload.id) {
        state.currentPayment = { ...state.currentPayment, ...action.payload };
      }
      const index = state.payments.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...action.payload };
      }
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },

    // Process payment
    processPaymentStart: (state) => {
      state.isProcessing = true;
      state.error = null;
    },
    processPaymentSuccess: (state, action) => {
      state.isProcessing = false;
      state.payments.unshift(action.payload);
      state.transactions.unshift(action.payload);
      state.statistics.totalPaid += action.payload.amount;
      state.error = null;
    },
    processPaymentFailure: (state, action) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Update payment status
    updatePaymentStatus: (state, action) => {
      const { paymentId, newStatus, previousStatus } = action.payload;
      const index = state.payments.findIndex(p => p.id === paymentId);
      if (index !== -1) {
        state.payments[index].status = newStatus;
        state.payments[index].updatedAt = new Date().toISOString();
        
        // Update statistics
        if (previousStatus === 'pending' && newStatus === 'completed') {
          state.statistics.totalPending -= state.payments[index].amount;
          state.statistics.totalPaid += state.payments[index].amount;
        } else if (previousStatus === 'completed' && newStatus === 'refunded') {
          state.statistics.totalPaid -= state.payments[index].amount;
          state.statistics.totalRefunded += state.payments[index].amount;
        }
      }
      
      if (state.currentPayment && state.currentPayment.id === paymentId) {
        state.currentPayment.status = newStatus;
        state.currentPayment.updatedAt = new Date().toISOString();
      }
    },

    // Refund payment
    refundPayment: (state, action) => {
      const { paymentId, amount, reason } = action.payload;
      const index = state.payments.findIndex(p => p.id === paymentId);
      if (index !== -1) {
        state.payments[index].status = 'refunded';
        state.payments[index].refundedAmount = amount;
        state.payments[index].refundReason = reason;
        state.payments[index].refundedAt = new Date().toISOString();
        state.statistics.totalPaid -= amount;
        state.statistics.totalRefunded += amount;
      }
      if (state.currentPayment && state.currentPayment.id === paymentId) {
        state.currentPayment.status = 'refunded';
        state.currentPayment.refundedAmount = amount;
        state.currentPayment.refundReason = reason;
        state.currentPayment.refundedAt = new Date().toISOString();
      }
    },

    // Payment methods management
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
    addPaymentMethod: (state, action) => {
      state.paymentMethods.push(action.payload);
    },
    updatePaymentMethod: (state, action) => {
      const index = state.paymentMethods.findIndex(pm => pm.id === action.payload.id);
      if (index !== -1) {
        state.paymentMethods[index] = { ...state.paymentMethods[index], ...action.payload };
      }
    },
    removePaymentMethod: (state, action) => {
      state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== action.payload);
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    setDefaultPaymentMethod: (state, action) => {
      state.paymentMethods.forEach(pm => {
        pm.isDefault = pm.id === action.payload;
      });
    },

    // Transactions
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },

    // Invoices
    setInvoices: (state, action) => {
      state.invoices = action.payload;
    },
    addInvoice: (state, action) => {
      state.invoices.unshift(action.payload);
    },
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...action.payload };
      }
    },

    // Subscription management
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    updateSubscription: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    cancelSubscription: (state) => {
      state.subscription.status = 'cancelled';
      state.subscription.endDate = new Date().toISOString();
      state.subscription.autoRenew = false;
    },
    renewSubscription: (state, action) => {
      state.subscription = {
        ...state.subscription,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: action.payload.endDate,
        plan: action.payload.plan,
      };
    },

    // Statistics
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },

    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Sorting
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },

    // Clear state
    clearPayments: (state) => {
      state.payments = [];
      state.currentPayment = null;
      state.transactions = [];
      state.invoices = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPaymentsStart,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  setPaymentDetails,
  updatePaymentDetails,
  clearCurrentPayment,
  processPaymentStart,
  processPaymentSuccess,
  processPaymentFailure,
  updatePaymentStatus,
  refundPayment,
  setPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  setSelectedPaymentMethod,
  setDefaultPaymentMethod,
  setTransactions,
  addTransaction,
  setInvoices,
  addInvoice,
  updateInvoice,
  setSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  updateStatistics,
  setFilters,
  clearFilters,
  setSortBy,
  clearPayments,
  clearError,
} = paymentSlice.actions;

// Selectors
export const selectAllPayments = (state) => state.payments.payments;
export const selectCurrentPayment = (state) => state.payments.currentPayment;
export const selectPaymentMethods = (state) => state.payments.paymentMethods;
export const selectSelectedPaymentMethod = (state) => state.payments.selectedPaymentMethod;
export const selectTransactions = (state) => state.payments.transactions;
export const selectInvoices = (state) => state.payments.invoices;
export const selectPaymentStatistics = (state) => state.payments.statistics;
export const selectSubscription = (state) => state.payments.subscription;
export const selectPaymentsLoading = (state) => state.payments.isLoading;
export const selectPaymentProcessing = (state) => state.payments.isProcessing;
export const selectPaymentsError = (state) => state.payments.error;

export default paymentSlice.reducer;