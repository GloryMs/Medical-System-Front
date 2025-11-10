import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Crown,
  Star,
  Zap,
  CheckCircle,
  ArrowLeft,
  Shield,
  Clock,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StripePaymentForm from './Stripepaymentform';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Subscription Payment Page
 * Handles subscription plan selection and payment processing with Stripe
 */
const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [plans, setPlans] = useState([]);

  // Get selected plan from navigation state
  useEffect(() => {
    if (location.state?.plan) {
      setSelectedPlan(location.state.plan);
      setBillingCycle(location.state.billingCycle || 'monthly');
    }
  }, [location.state]);

  // Load subscription plans
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await execute(() => patientService.getSubscriptionPlans());
      setPlans(response);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  // Create payment intent when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      createPaymentIntent();
    }
  }, [selectedPlan, billingCycle, discount]);

  const createPaymentIntent = async () => {
    try {
      const response = await execute(() =>
        fetch('/api/payment-service/api/payments/subscriptions/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            patientId: user.id,
            planType: selectedPlan.type || selectedPlan.code,
            billingCycle: billingCycle,
            promoCode: discount?.code
          })
        }).then(res => res.json())
      );

      setClientSecret(response.clientSecret);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await execute(() =>
        patientService.validatePromoCode(promoCode)
      );
      setDiscount(result);
    } catch (error) {
      console.error('Invalid promo code:', error);
      setDiscount(null);
    }
  };

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      // Confirm payment with backend
      const response = await execute(() =>
        fetch('/api/payment-service/api/payments/subscriptions/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            paymentIntentId: clientSecret.split('_secret_')[0],
            patientId: user.id,
            planType: selectedPlan.type || selectedPlan.code,
            billingCycle: billingCycle,
            paymentMethodId: paymentMethod.id,
            promoCode: discount?.code
          })
        }).then(res => res.json())
      );

      setPaymentSuccess(true);

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/app/patient/subscription', {
          state: { subscriptionActivated: true }
        });
      }, 2000);

    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'basic':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'standard':
        return <Star className="w-6 h-6 text-purple-600" />;
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      default:
        return <Zap className="w-6 h-6 text-blue-600" />;
    }
  };

  const getPlanFeatures = (planType) => {
    const features = {
      basic: [
        'Up to 5 cases per month',
        'Standard response time (48 hours)',
        'Email support',
        'Basic medical consultations',
        'Access to general practitioners'
      ],
      standard: [
        'Up to 15 cases per month',
        'Priority response time (24 hours)',
        'Email & phone support',
        'Specialist consultations',
        'Medical records storage',
        'Prescription management',
        'Follow-up consultations'
      ],
      premium: [
        'Unlimited cases',
        'Urgent response time (4 hours)',
        '24/7 priority support',
        'All specialist consultations',
        'Dedicated health advisor',
        'Advanced diagnostics access',
        'Second opinion service',
        'Family member accounts',
        'Annual health checkup discount'
      ]
    };

    return features[planType?.toLowerCase()] || features.basic;
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;

    const basePrice = billingCycle === 'yearly'
      ? (selectedPlan.yearlyPrice || 0)
      : (selectedPlan.monthlyPrice || 0);

    if (discount) {
      return basePrice * (1 - discount.percentage / 100);
    }

    return basePrice;
  };

  const calculateSavings = () => {
    if (!selectedPlan || billingCycle !== 'yearly') return 0;

    const monthlyTotal = (selectedPlan.monthlyPrice || 0) * 12;
    const yearlyPrice = selectedPlan.yearlyPrice || 0;

    return monthlyTotal - yearlyPrice;
  };

  // Success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. Redirecting you to your dashboard...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/app/patient/subscription')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>

          <Card>
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Plan Selected
              </h2>
              <p className="text-gray-600 mb-6">
                Please select a subscription plan to continue with payment.
              </p>
              <Button onClick={() => navigate('/app/patient/subscription')}>
                View Plans
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          onClick={() => navigate('/app/patient/subscription')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Plan Summary */}
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Complete Your Subscription
                </h2>

                {/* Plan Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {getPlanIcon(selectedPlan.type || selectedPlan.code)}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedPlan.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {selectedPlan.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={billingCycle === 'yearly' ? 'success' : 'primary'}
                    >
                      {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {getPlanFeatures(selectedPlan.type || selectedPlan.code).map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Billing Cycle
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                        billingCycle === 'monthly'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Monthly</div>
                        <div className="text-sm text-gray-600 mt-1">
                          ${selectedPlan.monthlyPrice}/month
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
                        billingCycle === 'yearly'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {calculateSavings() > 0 && (
                        <div className="absolute -top-3 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Save ${calculateSavings()}
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Yearly</div>
                        <div className="text-sm text-gray-600 mt-1">
                          ${selectedPlan.yearlyPrice}/year
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromoCode}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {discount && (
                    <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Discount applied: {discount.percentage}% off</span>
                    </div>
                  )}
                </div>

                {/* Payment Form */}
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm
                      amount={calculatePrice()}
                      currency="USD"
                      onSuccess={handlePaymentSuccess}
                      buttonText="Activate Subscription"
                      showAmount={false}
                    />
                  </Elements>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-gray-900">
                      {selectedPlan.name}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium text-gray-900">
                      {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      ${billingCycle === 'yearly' 
                        ? selectedPlan.yearlyPrice 
                        : selectedPlan.monthlyPrice}
                    </span>
                  </div>

                  {discount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discount.percentage}%):</span>
                      <span className="font-medium">
                        -${((billingCycle === 'yearly' 
                          ? selectedPlan.yearlyPrice 
                          : selectedPlan.monthlyPrice) * discount.percentage / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${calculatePrice().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                    </p>
                  </div>
                </div>

                {/* Benefits Reminder */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Secure Payment
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        256-bit SSL encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Instant Activation
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Access immediately after payment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Cancel Anytime
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        No long-term commitments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;