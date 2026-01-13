import { api } from './apiClient';

/**
 * Admin Coupon Service
 * API client for admin coupon management operations
 */
const adminCouponService = {
  // ==================== Coupon CRUD ====================

  /**
   * Get all coupons with optional filters
   * @param {Object} filters - { status, beneficiaryType, beneficiaryId, search, page, size }
   */
  getAllCoupons: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.beneficiaryType) params.append('beneficiaryType', filters.beneficiaryType);
    if (filters.beneficiaryId) params.append('beneficiaryId', filters.beneficiaryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size) params.append('size', filters.size);
    return api.get(`/admin-service/api/admin/coupons?${params}`);
  },

  /**
   * Get coupon by ID
   */
  getCouponById: async (couponId) => {
    return api.get(`/admin-service/api/admin/coupons/${couponId}`);
  },

  /**
   * Get coupon by code
   */
  getCouponByCode: async (couponCode) => {
    return api.get(`/admin-service/api/admin/coupons/code/${couponCode}`);
  },

  /**
   * Create a single coupon
   * @param {Object} couponData - { beneficiaryType, beneficiaryId, discountType, discountValue, maxDiscountAmount, expiresAt, notes }
   */
  createCoupon: async (couponData) => {
    return api.post('/admin-service/api/admin/coupons', couponData);
  },

  /**
   * Update coupon
   */
  updateCoupon: async (couponId, couponData) => {
    return api.put(`/admin-service/api/admin/coupons/${couponId}`, couponData);
  },

  /**
   * Cancel a coupon
   */
  cancelCoupon: async (couponId, reason) => {
    return api.post(`/admin-service/api/admin/coupons/${couponId}/cancel`, { reason });
  },

  /**
   * Distribute a coupon to a beneficiary
   */
  distributeCoupon: async (couponId, distributionData) => {
    return api.post(`/admin-service/api/admin/coupons/${couponId}/distribute`, distributionData);
  },

  // ==================== Batch Operations ====================

  /**
   * Create batch of coupons
   * @param {Object} batchData - { batchName, quantity, beneficiaryType, discountType, discountValue, expirationMonths, notes }
   */
  createCouponBatch: async (batchData) => {
    return api.post('/admin-service/api/admin/coupons/batch', batchData);
  },

  /**
   * Get all coupon batches
   */
  getCouponBatches: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin-service/api/admin/coupons/batches?${params}`);
  },

  /**
   * Get batch by ID
   */
  getBatchById: async (batchId) => {
    return api.get(`/admin-service/api/admin/coupons/batches/${batchId}`);
  },

  /**
   * Get coupons in a batch
   */
  getBatchCoupons: async (batchId) => {
    return api.get(`/admin-service/api/admin/coupons/batches/${batchId}/coupons`);
  },

  /**
   * Distribute entire batch to a beneficiary
   */
  distributeBatch: async (batchId, beneficiaryType, beneficiaryId) => {
    return api.post(`/admin-service/api/admin/coupons/batches/${batchId}/distribute`, {
      beneficiaryType,
      beneficiaryId
    });
  },

  /**
   * Cancel entire batch
   */
  cancelBatch: async (batchId, reason) => {
    return api.post(`/admin-service/api/admin/coupons/batches/${batchId}/cancel`, { reason });
  },

  // ==================== Beneficiary Operations ====================

  /**
   * Get coupons for a specific beneficiary
   */
  getCouponsForBeneficiary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/beneficiary/${beneficiaryType}/${beneficiaryId}`);
  },

  /**
   * Get available coupons for a beneficiary
   */
  getAvailableCouponsForBeneficiary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/beneficiary/${beneficiaryType}/${beneficiaryId}/available`);
  },

  /**
   * Get coupon summary for a beneficiary
   */
  getBeneficiaryCouponSummary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/summary/beneficiary/${beneficiaryType}/${beneficiaryId}`);
  },

  // ==================== Summary & Analytics ====================

  /**
   * Get overall coupon summary/statistics
   */
  getCouponSummary: async () => {
    return api.get('/admin-service/api/admin/coupons/summary');
  },

  /**
   * Get coupon analytics
   * @param {Object} params - { startDate, endDate, groupBy }
   */
  getCouponAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/admin-service/api/admin/coupons/analytics?${queryParams}`);
  },

  /**
   * Get expiring coupons
   * @param {number} days - Number of days to check
   */
  getExpiringCoupons: async (days = 30) => {
    return api.get(`/admin-service/api/admin/coupons/expiring?days=${days}`);
  },

  /**
   * Get recently used coupons
   */
  getRecentlyUsedCoupons: async (limit = 10) => {
    return api.get(`/admin-service/api/admin/coupons/recently-used?limit=${limit}`);
  },

  // ==================== Supervisor Operations ====================

  /**
   * Get all medical supervisors for coupon distribution
   */
  getMedicalSupervisors: async () => {
    return api.get('/admin-service/api/admin/supervisors');
  },

  /**
   * Get supervisor details
   */
  getSupervisorById: async (supervisorId) => {
    return api.get(`/admin-service/api/admin/supervisors/${supervisorId}`);
  },

  /**
   * Get coupon summary for all supervisors
   */
  getSupervisorCouponSummaries: async () => {
    return api.get('/admin-service/api/admin/coupons/summary/supervisors');
  },

  // ==================== Validation ====================

  /**
   * Validate a coupon code
   */
  validateCoupon: async (couponCode, beneficiaryType, beneficiaryId, patientId, caseId, amount) => {
    return api.post('/admin-service/api/admin/coupons/validate', {
      couponCode,
      beneficiaryType,
      beneficiaryId,
      patientId,
      caseId,
      requestedAmount: amount
    });
  },

  // ==================== Export ====================

  /**
   * Export coupons to CSV
   */
  exportCoupons: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin-service/api/admin/coupons/export?${params}`, {
      responseType: 'blob'
    });
  },

  /**
   * Export batch coupons to CSV
   */
  exportBatchCoupons: async (batchId) => {
    return api.get(`/admin-service/api/admin/coupons/batches/${batchId}/export`, {
      responseType: 'blob'
    });
  }
};

export default adminCouponService;