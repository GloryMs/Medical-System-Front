/**
 * Stripe Integration Utilities
 * Provides helper functions for Stripe payment processing
 */

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Get Stripe instance
 */
export const getStripe = async () => {
  return await stripePromise;
};

/**
 * Create payment intent for subscription
 */
export const createSubscriptionPaymentIntent = async (planType, billingCycle) => {
  try {
    const response = await fetch('/api/payment-service/api/payments/create-subscription-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        planType,
        billingCycle
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription payment intent:', error);
    throw error;
  }
};

/**
 * Create payment intent for consultation
 */
export const createConsultationPaymentIntent = async (caseId, doctorId) => {
  try {
    const response = await fetch('/api/payment-service/api/payments/create-consultation-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        caseId,
        doctorId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating consultation payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment with Stripe
 */
export const confirmStripePayment = async (stripe, clientSecret, paymentMethod) => {
  try {
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Setup payment method for future use
 */
export const setupPaymentMethod = async (stripe, clientSecret) => {
  try {
    const result = await stripe.confirmCardSetup(clientSecret);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.setupIntent;
  } catch (error) {
    console.error('Error setting up payment method:', error);
    throw error;
  }
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

/**
 * Validate card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(number)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Get card brand from card number
 */
export const getCardBrand = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');

  // Visa
  if (/^4/.test(number)) {
    return 'Visa';
  }

  // Mastercard
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
    return 'Mastercard';
  }

  // American Express
  if (/^3[47]/.test(number)) {
    return 'American Express';
  }

  // Discover
  if (/^6(?:011|5)/.test(number)) {
    return 'Discover';
  }

  // JCB
  if (/^35/.test(number)) {
    return 'JCB';
  }

  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(number)) {
    return 'Diners Club';
  }

  return 'Unknown';
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);

  if (expiryYear < currentYear) {
    return false;
  }

  if (expiryYear === currentYear && expiryMonth < currentMonth) {
    return false;
  }

  return true;
};

/**
 * Validate CVV
 */
export const validateCVV = (cvv, cardBrand) => {
  if (cardBrand === 'American Express') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Handle Stripe errors
 */
export const handleStripeError = (error) => {
  const errorMessages = {
    card_declined: 'Your card was declined. Please try another payment method.',
    expired_card: 'Your card has expired. Please use a different card.',
    incorrect_cvc: 'The security code is incorrect. Please check and try again.',
    processing_error: 'An error occurred while processing your card. Please try again.',
    incorrect_number: 'The card number is incorrect. Please check and try again.',
    invalid_expiry_year: 'The expiration year is invalid. Please check and try again.',
    invalid_expiry_month: 'The expiration month is invalid. Please check and try again.',
    insufficient_funds: 'Your card has insufficient funds. Please use a different payment method.'
  };

  return errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.';
};

export default {
  getStripe,
  createSubscriptionPaymentIntent,
  createConsultationPaymentIntent,
  confirmStripePayment,
  setupPaymentMethod,
  formatCardNumber,
  validateCardNumber,
  getCardBrand,
  validateExpiryDate,
  validateCVV,
  formatCurrency,
  handleStripeError
};