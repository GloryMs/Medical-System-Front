import { api } from './apiClient';

/**
 * Patient Coupon Service
 * API client for patient coupon operations
 */
const patientCouponService = {
  // ==================== Coupon Retrieval ====================

  /**
   * Get all coupons for the patient (any status)
   * @returns {Promise} List of all patient coupons
   */
  getAllCoupons: async () => {
    return api.get('/patient-service/api/patients/coupons');
  },

  /**
   * Get available coupons for use
   * @returns {Promise} List of available coupons
   */
  getAvailableCoupons: async () => {
    return api.get('/patient-service/api/patients/coupons/available');
  },

  /**
   * Get coupon summary/statistics
   * @returns {Promise} Coupon statistics
   */
  getCouponSummary: async () => {
    return api.get('/patient-service/api/patients/coupons/summary');
  },

  /**
   * Get coupon by code
   * @param {string} couponCode - Coupon code
   * @returns {Promise} Coupon details
   */
  getCouponByCode: async (couponCode) => {
    return api.get(`/patient-service/api/patients/coupons/code/${couponCode}`);
  },

  // ==================== Coupon Validation ====================

  /**
   * Validate a coupon for payment
   * @param {string} couponCode - Coupon code
   * @param {number} caseId - Case ID
   * @param {number} amount - Optional amount to calculate discount
   * @returns {Promise} Validation result with discount details
   */
  validateCoupon: async (couponCode, caseId, amount = null) => {
    const params = new URLSearchParams();
    params.append('couponCode', couponCode);
    params.append('caseId', caseId);
    if (amount) params.append('amount', amount);
    return api.post(`/patient-service/api/patients/coupons/validate?${params}`);
  },

  // ==================== Payment Operations ====================

  /**
   * Pay consultation fee with coupon
   * @param {Object} paymentData - Payment information
   * @returns {Promise} Payment result
   */
  payWithCoupon: async (paymentData) => {
    return api.post('/payment-service/api/payments/coupon/process', paymentData);
  },

  /**
   * Get coupon details for payment preview
   * @param {string} couponCode - Coupon code
   * @returns {Promise} Coupon details with discount calculation
   */
  getCouponForPayment: async (couponCode) => {
    return api.get(`/payment-service/api/payments/coupon/${couponCode}`);
  }
};

export default patientCouponService;