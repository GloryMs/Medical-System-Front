import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import {handleStripeError} from '../../utils/stripeUtils';

/**
 * Stripe Payment Form Component
 * Handles card input and payment processing with Stripe Elements
 */
const StripePaymentForm = ({ 
  amount, 
  currency = 'USD',
  onSuccess, 
  onError,
  buttonText = 'Pay Now',
  showAmount = true,
  description = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#e5424d',
        iconColor: '#e5424d',
      },
    },
    hidePostalCode: true,
  };

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Call success callback with payment method
      await onSuccess(paymentMethod);

    } catch (err) {
      const errorMessage = handleStripeError(err);
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      {showAmount && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Amount to pay:</span>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(amount)}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
        </div>
      )}

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Card Information</span>
          </div>
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-50 transition-all">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-xs text-blue-700 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!stripe || processing || !cardComplete}
        loading={processing}
      >
        {processing ? 'Processing...' : buttonText}
      </Button>

      {/* Powered by Stripe */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-medium">Stripe</span>
        </p>
      </div>
    </form>
  );
};

export default StripePaymentForm;