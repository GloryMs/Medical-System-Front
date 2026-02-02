import { api } from './apiClient';

/**
 * Admin Coupon Service
 * API client for admin coupon management operations
 * Base URL: /api/admin/coupons
 */
const adminCouponService = {
  // ==================== Coupon Creation ====================

  /**
   * Create a single coupon
   * POST /api/admin/coupons
   * @param {Object} couponData - Coupon creation data
   * @param {string} couponData.couponCode - Custom code (optional, auto-generated if not provided)
   * @param {string} couponData.discountType - PERCENTAGE | FIXED_AMOUNT | FULL_COVERAGE
   * @param {number} couponData.discountValue - Discount value (1-100 for percentage)
   * @param {number} couponData.maxDiscountAmount - Cap for percentage discounts (optional)
   * @param {string} couponData.currency - Currency code (default: USD)
   * @param {string} couponData.beneficiaryType - MEDICAL_SUPERVISOR | PATIENT
   * @param {number} couponData.beneficiaryId - Beneficiary ID (optional, can distribute later)
   * @param {string} couponData.expiresAt - Expiration datetime (ISO format)
   * @param {boolean} couponData.isTransferable - Can be transferred (default: true)
   * @param {string} couponData.notes - Notes (optional)
   * @param {boolean} couponData.autoDistribute - Auto-distribute after creation (default: false)
   */
  createCoupon: async (couponData) => {
    return api.post('/admin-service/api/admin/coupons', couponData);
  },

  /**
   * Create batch of coupons
   * POST /api/admin/coupons/batch
   * @param {Object} batchData - Batch creation data
   * @param {string} batchData.batchCodePrefix - Prefix for batch code (optional, auto-generated)
   * @param {number} batchData.totalCoupons - Number of coupons (1-1000)
   * @param {string} batchData.discountType - PERCENTAGE | FIXED_AMOUNT | FULL_COVERAGE
   * @param {number} batchData.discountValue - Discount value
   * @param {number} batchData.maxDiscountAmount - Cap for percentage discounts (optional)
   * @param {string} batchData.currency - Currency code (default: USD)
   * @param {string} batchData.beneficiaryType - MEDICAL_SUPERVISOR | PATIENT
   * @param {number} batchData.beneficiaryId - Beneficiary ID (optional)
   * @param {number} batchData.expiryDays - Days until expiration (1-730)
   * @param {boolean} batchData.isTransferable - Default: true
   * @param {string} batchData.notes - Notes (optional)
   * @param {boolean} batchData.autoDistribute - Default: false
   */
  createCouponBatch: async (batchData) => {
    return api.post('/admin-service/api/admin/coupons/batch', batchData);
  },

  // ==================== Coupon Distribution ====================

  /**
   * Distribute a single coupon to a beneficiary
   * POST /api/admin/coupons/{couponId}/distribute
   * @param {number} couponId - Coupon ID
   * @param {Object} distributionData - Distribution data
   * @param {string} distributionData.beneficiaryType - MEDICAL_SUPERVISOR | PATIENT
   * @param {number} distributionData.beneficiaryId - Beneficiary ID
   * @param {string} distributionData.notes - Distribution notes (optional)
   * @param {boolean} distributionData.sendNotification - Send notification (default: true)
   */
  distributeCoupon: async (couponId, distributionData) => {
    return api.post(`/admin-service/api/admin/coupons/${couponId}/distribute`, distributionData);
  },

  /**
   * Distribute entire batch to a beneficiary
   * POST /api/admin/coupons/batch/{batchId}/distribute
   * @param {number} batchId - Batch ID
   * @param {Object} distributionData - Distribution data
   * @param {string} distributionData.beneficiaryType - MEDICAL_SUPERVISOR | PATIENT
   * @param {number} distributionData.beneficiaryId - Beneficiary ID
   * @param {string} distributionData.notes - Distribution notes (optional)
   * @param {boolean} distributionData.sendNotification - Send notification (default: true)
   */
  distributeBatch: async (batchId, distributionData) => {
    return api.post(`/admin-service/api/admin/coupons/batch/${batchId}/distribute`, distributionData);
  },

  // ==================== Coupon Cancellation ====================

  /**
   * Cancel a single coupon
   * POST /api/admin/coupons/{couponId}/cancel
   * @param {number} couponId - Coupon ID
   * @param {Object} cancelData - Cancellation data
   * @param {string} cancelData.reason - Cancellation reason (required)
   * @param {boolean} cancelData.sendNotification - Send notification (default: true)
   */
  cancelCoupon: async (couponId, cancelData) => {
    return api.post(`/admin-service/api/admin/coupons/${couponId}/cancel`, cancelData);
  },

  /**
   * Cancel entire batch
   * POST /api/admin/coupons/batch/{batchId}/cancel
   * @param {number} batchId - Batch ID
   * @param {Object} cancelData - Cancellation data
   * @param {string} cancelData.reason - Cancellation reason (required)
   * @param {boolean} cancelData.sendNotification - Send notification (default: true)
   */
  cancelBatch: async (batchId, cancelData) => {
    return api.post(`/admin-service/api/admin/coupons/batch/${batchId}/cancel`, cancelData);
  },

  // ==================== Coupon Retrieval ====================

  /**
   * Get coupon by ID
   * GET /api/admin/coupons/{couponId}
   */
  getCouponById: async (couponId) => {
    return api.get(`/admin-service/api/admin/coupons/${couponId}`);
  },

  /**
   * Get coupon by code
   * GET /api/admin/coupons/code/{couponCode}
   */
  getCouponByCode: async (couponCode) => {
    return api.get(`/admin-service/api/admin/coupons/code/${couponCode}`);
  },

  /**
   * Get all coupons with filters and pagination
   * GET /api/admin/coupons
   * @param {Object} filters - Filter parameters
   * @param {string} filters.status - Filter by AdminCouponStatus
   * @param {string} filters.beneficiaryType - Filter by BeneficiaryType
   * @param {number} filters.beneficiaryId - Filter by beneficiary ID
   * @param {number} filters.batchId - Filter by batch ID
   * @param {string} filters.couponCode - Filter by coupon code (partial match)
   * @param {number} filters.page - Page number (default: 0)
   * @param {number} filters.size - Page size (default: 20)
   * @param {string} filters.sortBy - Sort field (default: createdAt)
   * @param {string} filters.sortDir - Sort direction: asc/desc (default: desc)
   */
  getAllCoupons: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.beneficiaryType) params.append('beneficiaryType', filters.beneficiaryType);
    if (filters.beneficiaryId) params.append('beneficiaryId', filters.beneficiaryId);
    if (filters.batchId) params.append('batchId', filters.batchId);
    if (filters.couponCode) params.append('couponCode', filters.couponCode);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size) params.append('size', filters.size);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    const queryString = params.toString();
    return api.get(`/admin-service/api/admin/coupons${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get coupons for a specific beneficiary
   * GET /api/admin/coupons/beneficiary/{type}/{beneficiaryId}
   */
  getCouponsForBeneficiary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/beneficiary/${beneficiaryType}/${beneficiaryId}`);
  },

  /**
   * Get available coupons for a beneficiary (not used, not expired)
   * GET /api/admin/coupons/beneficiary/{type}/{beneficiaryId}/available
   */
  getAvailableCouponsForBeneficiary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/beneficiary/${beneficiaryType}/${beneficiaryId}/available`);
  },

  /**
   * Get expiring coupons
   * GET /api/admin/coupons/expiring
   * @param {number} days - Days until expiration (default: 30)
   */
  getExpiringCoupons: async (days = 30) => {
    return api.get(`/admin-service/api/admin/coupons/expiring?days=${days}`);
  },

  // ==================== Batch Retrieval ====================

  /**
   * Get batch by ID
   * GET /api/admin/coupons/batch/{batchId}
   */
  getBatchById: async (batchId) => {
    return api.get(`/admin-service/api/admin/coupons/batch/${batchId}`);
  },

  /**
   * Get all batches with filters and pagination
   * GET /api/admin/coupons/batches
   * @param {Object} filters - Filter parameters
   * @param {string} filters.status - Filter by CouponBatchStatus
   * @param {string} filters.beneficiaryType - Filter by BeneficiaryType
   * @param {number} filters.beneficiaryId - Filter by beneficiary ID
   * @param {string} filters.batchCode - Filter by batch code (partial match)
   * @param {number} filters.page - Page number (default: 0)
   * @param {number} filters.size - Page size (default: 20)
   * @param {string} filters.sortBy - Sort field (default: createdAt)
   * @param {string} filters.sortDir - Sort direction: asc/desc (default: desc)
   */
  getCouponBatches: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.beneficiaryType) params.append('beneficiaryType', filters.beneficiaryType);
    if (filters.beneficiaryId) params.append('beneficiaryId', filters.beneficiaryId);
    if (filters.batchCode) params.append('batchCode', filters.batchCode);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size) params.append('size', filters.size);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    const queryString = params.toString();
    return api.get(`/admin-service/api/admin/coupons/batches${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get coupons in a batch
   * GET /api/admin/coupons/batch/{batchId}/coupons
   * @param {number} batchId - Batch ID
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 20)
   */
  getBatchCoupons: async (batchId, page = 0, size = 20) => {
    return api.get(`/admin-service/api/admin/coupons/batch/${batchId}/coupons?page=${page}&size=${size}`);
  },

  // ==================== Statistics & Analytics ====================

  /**
   * Get overall coupon summary/statistics
   * GET /api/admin/coupons/summary
   */
  getCouponSummary: async () => {
    return api.get('/admin-service/api/admin/coupons/summary');
  },

  /**
   * Get coupon summary for a specific beneficiary
   * GET /api/admin/coupons/summary/beneficiary/{type}/{beneficiaryId}
   */
  getBeneficiaryCouponSummary: async (beneficiaryType, beneficiaryId) => {
    return api.get(`/admin-service/api/admin/coupons/summary/beneficiary/${beneficiaryType}/${beneficiaryId}`);
  },

  // ==================== Validation (Internal API) ====================

  /**
   * Validate a coupon for redemption
   * POST /api/admin/coupons/validate
   * @param {Object} validationData - Validation data
   * @param {string} validationData.couponCode - Coupon code
   * @param {string} validationData.beneficiaryType - MEDICAL_SUPERVISOR | PATIENT
   * @param {number} validationData.beneficiaryId - Beneficiary ID
   * @param {number} validationData.patientId - Patient ID
   * @param {number} validationData.caseId - Case ID
   * @param {number} validationData.requestedAmount - Consultation fee amount
   */
  validateCoupon: async (validationData) => {
    return api.post('/admin-service/api/admin/coupons/validate', validationData);
  },

  // ==================== Supervisor Operations ====================

  /**
   * Get all medical supervisors for coupon distribution
   * GET /admin-service/api/admin/supervisors
   */
  getMedicalSupervisors: async () => {
    return api.get('/admin-service/api/admin/supervisors');
  },

  /**
   * Get supervisor details
   * GET /admin-service/api/admin/supervisors/{supervisorId}
   */
  getSupervisorById: async (supervisorId) => {
    return api.get(`/admin-service/api/admin/supervisors/${supervisorId}`);
  },

  // ==================== Export ====================

  /**
   * Export coupons to CSV
   * GET /api/admin/coupons/export
   */
  exportCoupons: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    return api.get(`/admin-service/api/admin/coupons/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    });
  },

  /**
   * Export batch coupons to CSV
   * GET /api/admin/coupons/batch/{batchId}/export
   */
  exportBatchCoupons: async (batchId) => {
    return api.get(`/admin-service/api/admin/coupons/batch/${batchId}/export`, {
      responseType: 'blob'
    });
  }
};

export default adminCouponService;