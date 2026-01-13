import { api } from './apiClient';

/**
 * Supervisor Coupon Service
 * Enhanced API client for supervisor coupon operations
 * Integrates with the refactored coupon management system
 */
const supervisorCouponService = {
  // ==================== Coupon Retrieval ====================

  /**
   * Get all coupons for supervisor
   * @returns {Promise} List of all coupon allocations
   */
  getAllCoupons: async () => {
    return api.get('/supervisor-service/api/supervisors/coupons');
  },

  /**
   * Get unassigned coupons (available to assign to patients)
   * @returns {Promise} List of unassigned coupons
   */
  getUnassignedCoupons: async () => {
    return api.get('/supervisor-service/api/supervisors/coupons/unassigned');
  },

  /**
   * Get available coupons for a specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of available coupons for patient
   */
  getAvailableCouponsForPatient: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/coupons/patient/${patientId}/available`);
  },

  /**
   * Get all coupons for a patient (any status)
   * @param {number} patientId - Patient ID
   * @returns {Promise} List of all coupons for patient
   */
  getAllCouponsForPatient: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/coupons/patient/${patientId}`);
  },

  /**
   * Get expiring coupons
   * @param {number} days - Days until expiry (default: 30)
   * @returns {Promise} List of expiring coupons
   */
  getExpiringCoupons: async (days = 30) => {
    return api.get(`/supervisor-service/api/supervisors/coupons/expiring?days=${days}`);
  },

  /**
   * Get coupon by code
   * @param {string} couponCode - Coupon code
   * @returns {Promise} Coupon details
   */
  getCouponByCode: async (couponCode) => {
    return api.get(`/supervisor-service/api/supervisors/coupons/code/${couponCode}`);
  },

  // ==================== Coupon Summary ====================

  /**
   * Get coupon summary for supervisor
   * @returns {Promise} Coupon statistics
   */
  getCouponSummary: async () => {
    return api.get('/supervisor-service/api/supervisors/coupons/summary');
  },

  /**
   * Get coupon summary for a specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient coupon statistics
   */
  getPatientCouponSummary: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/coupons/summary/patient/${patientId}`);
  },

  // ==================== Coupon Assignment ====================

  /**
   * Assign a coupon to a patient
   * @param {number} allocationId - Coupon allocation ID
   * @param {number} patientId - Patient ID to assign to
   * @param {string} notes - Optional assignment notes
   * @returns {Promise} Updated allocation
   */
  assignCouponToPatient: async (allocationId, patientId, notes = '') => {
    return api.post(`/supervisor-service/api/supervisors/coupons/${allocationId}/assign`, {
      patientId,
      notes
    });
  },

  /**
   * Unassign a coupon from a patient
   * @param {number} allocationId - Coupon allocation ID
   * @returns {Promise} Updated allocation
   */
  unassignCouponFromPatient: async (allocationId) => {
    return api.post(`/supervisor-service/api/supervisors/coupons/${allocationId}/unassign`);
  },

  // ==================== Coupon Validation ====================

  /**
   * Validate a coupon for payment
   * @param {string} couponCode - Coupon code
   * @param {number} patientId - Patient ID
   * @param {number} caseId - Case ID
   * @param {number} amount - Optional amount to calculate discount
   * @returns {Promise} Validation result with discount details
   */
  validateCoupon: async (couponCode, patientId, caseId, amount = null) => {
    const params = new URLSearchParams();
    params.append('couponCode', couponCode);
    params.append('patientId', patientId);
    params.append('caseId', caseId);
    if (amount) params.append('amount', amount);
    return api.post(`/supervisor-service/api/supervisors/coupons/validate?${params}`);
  },

  // ==================== Payment Operations ====================

  /**
   * Pay consultation fee (unified endpoint)
   * Supports STRIPE, PAYPAL, and COUPON payment methods
   * @param {Object} paymentData - Payment information
   * @returns {Promise} Payment result
   */
  payConsultationFee: async (paymentData) => {
    return api.post('/supervisor-service/api/supervisors/payments/pay', paymentData);
  },

  /**
   * Create Stripe payment intent
   * @param {number} caseId - Case ID
   * @param {number} patientId - Patient ID
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Payment intent with client secret
   */
  createPaymentIntent: async (caseId, patientId, doctorId) => {
    return api.post(`/supervisor-service/api/supervisors/payments/create-payment-intent?caseId=${caseId}&patientId=${patientId}&doctorId=${doctorId}`);
  },

  /**
   * Validate coupon for payment (payment endpoint)
   * @param {string} couponCode - Coupon code
   * @param {number} patientId - Patient ID
   * @param {number} caseId - Case ID
   * @returns {Promise} Validation result
   */
  validateCouponForPayment: async (couponCode, patientId, caseId) => {
    return api.post(`/supervisor-service/api/supervisors/payments/validate-coupon?couponCode=${couponCode}&patientId=${patientId}&caseId=${caseId}`);
  },

  /**
   * Redeem coupon for case payment (legacy endpoint)
   * @param {number} caseId - Case ID
   * @param {number} patientId - Patient ID
   * @param {string} couponCode - Coupon code
   * @returns {Promise} Redemption result
   */
  redeemCoupon: async (caseId, patientId, couponCode) => {
    return api.post(
      `/supervisor-service/api/supervisors/payments/coupon/${caseId}?patientId=${patientId}`,
      { couponCode }
    );
  },

  // ==================== Sync Operations ====================

  /**
   * Sync coupons with admin service
   * @returns {Promise} Sync result
   */
  syncWithAdminService: async () => {
    return api.post('/supervisor-service/api/supervisors/coupons/sync');
  },

  // ==================== Legacy Endpoints (backward compatibility) ====================

  /**
   * Get coupon summary (legacy)
   * @returns {Promise} Coupon summary
   */
  getLegacyCouponSummary: async () => {
    return api.get('/supervisor-service/api/supervisors/payments/coupons');
  },

  /**
   * Get patient coupons (legacy)
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient coupons
   */
  getLegacyPatientCoupons: async (patientId) => {
    return api.get(`/supervisor-service/api/supervisors/payments/coupons/patient/${patientId}`);
  },

  /**
   * Get all available coupons (legacy)
   * @returns {Promise} Available coupons
   */
  getLegacyAvailableCoupons: async () => {
    return api.get('/supervisor-service/api/supervisors/payments/available-coupons');
  },

  /**
   * Get expiring coupons (legacy)
   * @param {number} days - Days until expiry
   * @returns {Promise} Expiring coupons
   */
  getLegacyExpiringCoupons: async (days = 7) => {
    return api.get(`/supervisor-service/api/supervisors/payments/coupons/expiring?days=${days}`);
  }
};

export default supervisorCouponService;