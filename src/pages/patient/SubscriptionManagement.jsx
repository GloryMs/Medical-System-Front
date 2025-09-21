import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Crown,
  Star,
  Zap,
  Shield,
  Users,
  Clock,
  DollarSign,
  Download,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gift,
  Percent,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  History,
  Bell,
  X,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';
import commonService from '../../services/api/commonService';

// Validation schemas - updated to match backend requirements
const subscriptionSchema = yup.object({
  planType: yup.string().required('Plan selection is required'),
  amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  paymentMethod: yup.string().required('Payment method is required'),
  autoRenew: yup.boolean()
});

const paymentMethodSchema = yup.object({
  type: yup.string().required('Payment method type is required'),
  cardNumber: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('Card number is required').min(16, 'Invalid card number'),
    otherwise: yup.string().notRequired()
  }),
  expiryMonth: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('Expiry month is required'),
    otherwise: yup.string().notRequired()
  }),
  expiryYear: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('Expiry year is required'),
    otherwise: yup.string().notRequired()
  }),
  cvv: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('CVV is required').min(3, 'Invalid CVV'),
    otherwise: yup.string().notRequired()
  }),
  nameOnCard: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('Name on card is required'),
    otherwise: yup.string().notRequired()
  })
});

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { execute, loading } = useApi();

  // State
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Tab state

  // Forms
  const subscriptionForm = useForm({
    resolver: yupResolver(subscriptionSchema),
    defaultValues: {
      planType: '',
      amount: 0,
      paymentMethod: '',
      autoRenew: true
    }
  });

  const paymentForm = useForm({
    resolver: yupResolver(paymentMethodSchema),
    defaultValues: {
      type: 'credit_card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      nameOnCard: ''
    }
  });

  useEffect(() => {
    loadSubscriptionData();
    loadAvailablePlans();
    loadPaymentMethods();
    loadSubscriptionHistory();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const data = await execute(() => patientService.getSubscriptionStatus());
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const plans = await execute(() => commonService.getMedicalConfigurations('PLAN'));
      setAvailablePlans(plans || []);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await execute(() => commonService.getMedicalConfigurations('PAYMENTMETHOD'));
      console.log('Loaded payment methods:', methods);
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadSubscriptionHistory = async () => {
    try {
      const history = await execute(() => patientService.getSubscriptionHistory());
      setSubscriptionHistory(history || []);
    } catch (error) {
      console.error('Failed to load subscription history:', error);
    }
  };

  // Helper function to parse plan attributes safely
  const parsePlanAttributes = (plan) => {
    let planAttributes = {};
    try {
      planAttributes = typeof plan.attributes === 'string' 
        ? JSON.parse(plan.attributes) 
        : plan.attributes || {};
    } catch (error) {
      console.error('Error parsing plan attributes:', error);
    }
    return planAttributes;
  };

  // Helper function to get plan with parsed attributes
  const getPlanWithAttributes = (plan) => {
    const attributes = parsePlanAttributes(plan);
    return {
      ...plan,
      ...attributes, // Merge attributes directly into plan object
      parsedAttributes: attributes // Keep original attributes for reference
    };
  };

  const handleSubscriptionUpgrade = async (data) => {
    try {
      // Prepare data in the exact format expected by backend
      const subscriptionData = {
        planType: selectedPlan.code, // Use plan code as planType
        amount: getFinalPrice(selectedPlan), // Calculate final price including discounts
        paymentMethod: data.paymentMethod, // Payment method code (e.g., "PAYPAL", "CREDIT_CARD")
        autoRenew: data.autoRenew || false
      };
      
      console.log('Submitting subscription data:', subscriptionData);
      
      const result = await execute(() => patientService.updateSubscription(subscriptionData));
      setCurrentSubscription(result);
      setShowUpgradeModal(false);
      subscriptionForm.reset();
      
      // Refresh user data
      updateUser({ subscription: result });
      
      // Show success message
      alert('Subscription updated successfully!');
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleSubscriptionCancel = async (reason) => {
    try {
      await execute(() => patientService.cancelSubscription(reason));
      await loadSubscriptionData();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const handleAddPaymentMethod = async (data) => {
    try {
      const newMethod = await execute(() => patientService.addPaymentMethod(data));
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowPaymentModal(false);
      paymentForm.reset();
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    try {
      await execute(() => patientService.deletePaymentMethod(methodId));
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  const handleApplyPromoCode = async () => {
    try {
      const result = await execute(() => patientService.validatePromoCode(promoCode));
      setDiscount(result);
    } catch (error) {
      console.error('Invalid promo code:', error);
      setDiscount(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to calculate final price including discounts
  const getFinalPrice = (plan) => {
    const planWithAttributes = getPlanWithAttributes(plan);
    const basePrice = billingCycle === 'yearly' 
      ? (planWithAttributes.yearlyPrice || 0)
      : (planWithAttributes.monthlyPrice || 0);
    
    if (discount && discount.percentage) {
      return basePrice * (1 - discount.percentage / 100);
    }
    
    return basePrice;
  };

  // Helper function to safely get price for display
  const getDisplayPrice = (planAttributes) => {
    const price = billingCycle === 'yearly' 
      ? (planAttributes.yearlyPrice || 0)
      : (planAttributes.monthlyPrice || 0);
    
    return Number(price).toFixed(0);
  };

  // Helper function to calculate savings for yearly plans
  const calculateYearlySavings = (planAttributes) => {
    if (!planAttributes.monthlyPrice || !planAttributes.yearlyPrice) {
      return 0;
    }
    return ((planAttributes.monthlyPrice * 12) - planAttributes.yearlyPrice);
  };

  const getDaysUntilExpiry = () => {
    if (!currentSubscription?.expiryDate) return 0;
    const expiry = new Date(currentSubscription.expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getPlanIcon = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'basic':
        return <Shield className="w-6 h-6" />;
      case 'premium':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType?.toLowerCase()) {
      case 'basic':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'premium':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'pro':
        return 'from-gold-50 to-gold-100 border-gold-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your subscription plan and billing</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Subscription Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Current Plan"
              value={currentSubscription?.planType || 'No Plan'}
              icon={<Crown className="w-6 h-6" />}
              color="primary"
            />
            <StatsCard
              title="Status"
              value={currentSubscription?.status || 'Inactive'}
              icon={currentSubscription?.status === 'active' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              color={currentSubscription?.status === 'active' ? 'success' : 'warning'}
            />
            <StatsCard
              title="Days Until Renewal"
              value={getDaysUntilExpiry()}
              icon={<Calendar className="w-6 h-6" />}
              color="info"
            />
          </div>

          {/* Current Subscription Details */}
          {currentSubscription && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Subscription Details">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Type</span>
                    <span className="font-semibold">{currentSubscription.planType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={currentSubscription.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Start Date</span>
                    <span>{formatDate(currentSubscription.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expiry Date</span>
                    <span>{formatDate(currentSubscription.expiryDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Auto Renewal</span>
                    <div className="flex items-center space-x-2">
                      {currentSubscription.autoRenew ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                      <span className="font-medium">
                        {currentSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Plan Features */}
              <Card title="Plan Features">
                <div className="p-6">
                  {currentSubscription && (
                    <div className="space-y-3">
                      {(() => {
                        // Find the current plan from availablePlans based on currentSubscription.plan
                        const currentPlan = availablePlans.find(plan => 
                          plan.code?.toLowerCase() === currentSubscription.planType?.toLowerCase() ||
                          plan.type?.toLowerCase() === currentSubscription.planType?.toLowerCase()
                        );
                        
                        // Parse attributes JSON and extract features
                        let features = null;
                        if (currentPlan?.attributes) {
                          try {
                            const attributes = typeof currentPlan.attributes === 'string' 
                              ? JSON.parse(currentPlan.attributes) 
                              : currentPlan.attributes;
                            features = attributes.features;
                          } catch (error) {
                            console.error('Error parsing plan attributes:', error);
                          }
                        }
                        
                        // Fallback to currentSubscription.features if attributes parsing fails
                        if (!features) {
                          features = currentSubscription.features;
                        }
                        
                        if (features && features.length > 0) {
                          return features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ));
                        }
                        
                        // Final fallback if no features found
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-gray-700">Standard features included</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge variant="success" size="xs" className="ml-2">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Promo Code */}
          <div className="max-w-md mx-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="outline"
                onClick={handleApplyPromoCode}
                disabled={!promoCode}
              >
                Apply
              </Button>
            </div>
            {discount && (
              <div className="mt-2 flex items-center space-x-2 text-green-600">
                <Gift className="w-4 h-4" />
                <span className="text-sm">
                  {discount.percentage}% discount applied!
                </span>
              </div>
            )}
          </div>

          {/* Simplified Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              // Parse the attributes JSON string safely
              const planAttributes = parsePlanAttributes(plan);
              const isCurrentPlan = currentSubscription?.plan?.toLowerCase() === plan.code?.toLowerCase();
              
              return (
                <div
                  key={plan.code}
                  className={`relative bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                    planAttributes.popular
                      ? 'border-primary-500 shadow-md'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {planAttributes.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge variant="primary" className="px-2 py-1 text-xs">
                        Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${getPlanColor(plan.code)} flex items-center justify-center`}>
                      {getPlanIcon(plan.code)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-gray-900">
                          ${getDisplayPrice(planAttributes)}
                        </span>
                        <span className="text-gray-600 ml-1 text-sm">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && planAttributes.yearlyDiscount && (
                        <div className="mt-1 text-green-600 text-xs">
                          Save ${calculateYearlySavings(planAttributes).toFixed(0)} annually
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-6 text-left">
                      {planAttributes.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      )) || (
                        <div className="text-gray-500 text-sm">Standard features</div>
                      )}
                      {planAttributes.features?.length > 3 && (
                        <div className="text-gray-500 text-xs">
                          +{planAttributes.features.length - 3} more features
                        </div>
                      )}
                    </div>

                    <Button
                      variant={planAttributes.popular ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => {
                        console.log('Button clicked for plan:', plan.name);
                        console.log('Plan data:', plan);
                        console.log('Current subscription:', currentSubscription);
                        
                        // Store the plan with parsed attributes for the modal
                        const planWithAttributes = getPlanWithAttributes(plan);
                        console.log('Plan with attributes:', planWithAttributes);
                        
                        setSelectedPlan(planWithAttributes);
                        
                        // Set form values for the selected plan
                        subscriptionForm.setValue('planType', plan.code);
                        subscriptionForm.setValue('amount', getFinalPrice(planWithAttributes));
                        
                        if (currentSubscription?.status.toLowerCase() === 'active') {
                          console.log('Setting showUpgradeModal to true (upgrade)');
                          setShowUpgradeModal(true);
                        } else {
                          console.log('Setting showUpgradeModal to true (subscribe)');
                          setShowUpgradeModal(true);
                        }
                      }}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan
                        ? 'Current Plan'
                        : currentSubscription?.status === 'active'
                        ? 'Upgrade Plan'
                        : 'Choose Plan'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Subscription History */}
          <Card title="Subscription History">
            <div className="p-6">
              {subscriptionHistory && subscriptionHistory.length > 0 ? (
                <div className="space-y-4">
                  {subscriptionHistory.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{record.planType}</div>
                          <div className="text-sm text-gray-600">{formatDate(record.date)}</div>
                          <div className="text-xs text-gray-500">{record.status}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${record.amount}</div>
                        {record.invoiceId && (
                          <Button
                            size="xs"
                            variant="outline"
                            icon={<Download className="w-3 h-3" />}
                            className="mt-1"
                            onClick={() => patientService.downloadInvoice(record.invoiceId, `invoice-${record.invoiceId}.pdf`)}
                          >
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No subscription history yet</p>
                </div>
              )}
            </div>
          </Card>

          {/* Usage Statistics */}
          <Card title="Usage Statistics">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Cases Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">Documents Uploaded</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      <FormModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={currentSubscription?.status === 'active' ? 'Upgrade Subscription' : 'Subscribe to Plan'}
        onSubmit={subscriptionForm.handleSubmit(handleSubscriptionUpgrade)}
        isLoading={loading}
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getPlanIcon(selectedPlan.type || selectedPlan.code)}
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  ${getFinalPrice(selectedPlan).toFixed(2)}
                </span>
                <span className="text-gray-600 ml-1">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {discount && (
                <div className="mt-2 text-green-600 text-sm">
                  Discount applied: {discount.percentage}% off
                </div>
              )}
            </div>

            {/* Hidden fields for form data */}
            <input type="hidden" {...subscriptionForm.register('planType')} />
            <input type="hidden" {...subscriptionForm.register('amount')} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                {...subscriptionForm.register('paymentMethod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select payment method</option>
                {paymentMethods
                  .filter(method => method.isActive)
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((method) => (
                    <option key={method.code} value={method.code}>
                      {method.name}
                    </option>
                  ))}
              </select>
              {subscriptionForm.formState.errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">
                  {subscriptionForm.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...subscriptionForm.register('autoRenew')}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Enable auto-renewal
              </label>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Plan:</span>
                  <span className="text-blue-900 font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Billing:</span>
                  <span className="text-blue-900">{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="text-blue-900 font-bold">${getFinalPrice(selectedPlan).toFixed(2)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{discount.percentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your current billing period."
        confirmText="Cancel Subscription"
        onConfirm={() => handleSubscriptionCancel('user_request')}
        confirmVariant="danger"
      />
    </div>
  );
};

export default SubscriptionManagement;