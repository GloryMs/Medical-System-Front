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

// Validation schemas
const subscriptionSchema = yup.object({
  planType: yup.string().required('Plan selection is required'),
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
  cardholderName: yup.string().when('type', {
    is: 'credit_card',
    then: yup.string().required('Cardholder name is required'),
    otherwise: yup.string().notRequired()
  })
});

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCardDetails, setShowCardDetails] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);

  // Form setup
  const subscriptionForm = useForm({
    resolver: yupResolver(subscriptionSchema)
  });

  const paymentForm = useForm({
    resolver: yupResolver(paymentMethodSchema)
  });

  // Load data on component mount
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

  const handleSubscriptionUpgrade = async (data) => {
    try {
      const subscriptionData = {
        ...data,
        planId: selectedPlan.id,
        billingCycle: billingCycle,
        promoCode: promoCode || null
      };
      
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

  const calculatePrice = (plan) => {
    const basePrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    if (discount) {
      return basePrice * (1 - discount.percentage / 100);
    }
    return basePrice;
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
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'plans', label: 'Plans', icon: <Star className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your subscription plan and billing preferences
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={loadSubscriptionData}
                >
                  Refresh
                </Button>
                {currentSubscription?.status !== 'active' && (
                  <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setActiveTab('plans')}
                  >
                    Choose Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status Alert */}
        {currentSubscription && (
          <div className="mb-8">
            {currentSubscription.status.toLowerCase() === 'active' ? (
              getDaysUntilExpiry() <= 7 ? (
                <AlertCard
                  type="warning"
                  title="Subscription Expiring Soon"
                  message={`Your subscription expires in ${getDaysUntilExpiry()} days on ${formatDate(currentSubscription.expiryDate)}.`}
                >
                  <div className="mt-4">
                    <Button size="sm" onClick={() => setActiveTab('plans')}>
                      Renew Now
                    </Button>
                  </div>
                </AlertCard>
              ) : (
                <AlertCard
                  type="success"
                  title="Subscription Active"
                  message={`Your ${currentSubscription.planType} plan is active until ${formatDate(currentSubscription.expiryDate)}.`}
                />
              )
            ) : currentSubscription.status === 'expired' ? (
              <AlertCard
                type="error"
                title="Subscription Expired"
                message="Your subscription has expired. Please renew to continue accessing all features."
              >
                <div className="mt-4">
                  <Button size="sm" onClick={() => setActiveTab('plans')}>
                    Renew Subscription
                  </Button>
                </div>
              </AlertCard>
            ) : (
              <AlertCard
                type="info"
                title="No Active Subscription"
                message="Subscribe to access all premium features and submit consultation cases."
              >
                <div className="mt-4">
                  <Button size="sm" onClick={() => setActiveTab('plans')}>
                    View Plans
                  </Button>
                </div>
              </AlertCard>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <Card className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Current Plan"
                    value={currentSubscription?.planType || 'None'}
                    icon={getPlanIcon(currentSubscription?.planType)}
                    className={`bg-gradient-to-br ${getPlanColor(currentSubscription?.planType)}`}
                  />
                  
                  <StatsCard
                    title="Days Remaining"
                    value={getDaysUntilExpiry()}
                    icon={<Calendar className="w-6 h-6" />}
                    className="bg-gradient-to-br from-green-50 to-green-100"
                  />
                  
                  <StatsCard
                    title="Auto-Renewal"
                    value={currentSubscription?.autoRenew ? 'On' : 'Off'}
                    icon={<RefreshCw className="w-6 h-6" />}
                    className="bg-gradient-to-br from-indigo-50 to-indigo-100"
                  />
                </div>

                {currentSubscription && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Subscription Details */}
                    <Card title="Subscription Details">
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Plan</span>
                          <div className="flex items-center space-x-2">
                            {getPlanIcon(currentSubscription.planType)}
                            <span className="font-medium">{currentSubscription.planType}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <StatusBadge status={currentSubscription.status} />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Started</span>
                          <span className="font-medium">{formatDate(currentSubscription.createdAt)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Expires</span>
                          <span className="font-medium">{formatDate(currentSubscription.expiryDate)}</span>
                        </div>

                        {/* <div className="flex justify-between items-center">
                          <span className="text-gray-600">Billing Cycle</span>
                          <span className="font-medium capitalize">{currentSubscription.billingCycle}</span>
                        </div> */}

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount</span>
                          <span className="font-bold text-lg">${currentSubscription.amount}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Auto-Renewal</span>
                          <div className="flex items-center space-x-1">
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
                                    <span className="text-gray-700">Submit medical cases</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">Video consultations</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">Document uploads</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">Consultation reports</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">24/7 support</span>
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

                {/* Quick Actions */}
                <Card title="Quick Actions">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentSubscription?.status === 'active' && (
                        <>
                          <Button
                            variant="primary"
                            icon={<TrendingUp className="w-4 h-4" />}
                            onClick={() => {
                              setActiveTab('plans');
                              setShowUpgradeModal(true);
                            }}
                            className="w-full"
                          >
                            Upgrade Plan
                          </Button>
                          
                          <Button
                            variant="outline"
                            icon={<Download className="w-4 h-4" />}
                            onClick={() => patientService.downloadInvoice(currentSubscription.invoiceId, 'subscription-invoice.pdf')}
                            className="w-full"
                          >
                            Download Invoice
                          </Button>
                          
                          <Button
                            variant="outline"
                            icon={<Settings className="w-4 h-4" />}
                            onClick={() => setActiveTab('billing')}
                            className="w-full"
                          >
                            Billing Settings
                          </Button>
                        </>
                      )}

                      {(!currentSubscription || currentSubscription.status !== 'active') && (
                        <Button
                          variant="primary"
                          icon={<Star className="w-4 h-4" />}
                          onClick={() => setActiveTab('plans')}
                          className="w-full"
                        >
                          Choose a Plan
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Plans Tab */}
              {activeTab === 'plans' && (
                <div className="space-y-8">
                  {/* Billing Cycle Toggle */}
                  <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
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

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {availablePlans.map((plan) => {
                      // Parse the attributes JSON string
                      let planAttributes = {};
                      try {
                        planAttributes = typeof plan.attributes === 'string' 
                          ? JSON.parse(plan.attributes) 
                          : plan.attributes || {};
                      } catch (error) {
                        console.error('Error parsing plan attributes:', error);
                      }

                      const isCurrentPlan = currentSubscription?.plan?.toLowerCase() === plan.code?.toLowerCase();
                      
                      return (
                        <div
                          key={plan.code}
                          className={`relative bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-xl ${
                            planAttributes.popular
                              ? 'border-primary-500 shadow-lg'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {planAttributes.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge variant="primary" className="px-3 py-1">
                                Most Popular
                              </Badge>
                            </div>
                          )}

                          <div className="p-8">
                            <div className="text-center mb-8">
                              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getPlanColor(plan.code)} flex items-center justify-center`}>
                                {getPlanIcon(plan.code)}
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                              <p className="text-gray-600 mt-2">{plan.description}</p>
                            </div>

                            <div className="text-center mb-8">
                              <div className="flex items-baseline justify-center">
                                <span className="text-4xl font-bold text-gray-900">
                                  ${(billingCycle === 'yearly' ? planAttributes.yearlyPrice : planAttributes.monthlyPrice)?.toFixed(0) || '0'}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                                </span>
                              </div>
                              {billingCycle === 'yearly' && planAttributes.yearlyDiscount && (
                                <div className="mt-2 flex items-center justify-center space-x-2 text-green-600">
                                  <Percent className="w-4 h-4" />
                                  <span className="text-sm">
                                    Save ${((planAttributes.monthlyPrice * 12) - planAttributes.yearlyPrice).toFixed(0)} annually
                                  </span>
                                </div>
                              )}
                              {discount && (
                                <div className="mt-2 text-green-600 text-sm">
                                  Original: ${billingCycle === 'yearly' ? planAttributes.yearlyPrice : planAttributes.monthlyPrice}
                                </div>
                              )}
                            </div>

                            <div className="space-y-4 mb-8">
                              {planAttributes.features?.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  <span className="text-gray-700">{feature}</span>
                                </div>
                              )) || (
                                <div className="text-gray-500 text-sm">No features available</div>
                              )}
                            </div>

                            <Button
                              variant={planAttributes.popular ? 'primary' : 'outline'}
                              className="w-full"
                              onClick={() => {
                                setSelectedPlan(plan);
                                if (currentSubscription?.status === 'active') {
                                  setShowUpgradeModal(true);
                                } else {
                                  subscriptionForm.setValue('planType', plan.code);
                                  setShowUpgradeModal(true);
                                }
                              }}
                              disabled={isCurrentPlan}
                            >
                              {isCurrentPlan
                                ? 'Current Plan'
                                : currentSubscription?.status === 'active'
                                ? 'Upgrade to This Plan'
                                : 'Choose This Plan'
                              }
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* FAQ Section */}
                  <Card title="Frequently Asked Questions">
                    <div className="p-6 space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Can I change my plan anytime?</h4>
                        <p className="text-gray-600 text-sm">
                          Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">What happens if I cancel?</h4>
                        <p className="text-gray-600 text-sm">
                          You'll continue to have access to your subscription benefits until the end of your current billing period.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Are there any setup fees?</h4>
                        <p className="text-gray-600 text-sm">
                          No, there are no setup fees or hidden charges. You only pay for your selected subscription plan.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Payment Methods */}
                <Card 
                  title="Payment Methods"
                  action={
                    <Button
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Add Method
                    </Button>
                  }
                >
                  <div className="p-6">
                    {paymentMethods.length > 0 ? (
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CreditCard className="w-8 h-8 text-gray-400" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    **** **** **** {method.lastFour}
                                  </span>
                                  {method.isDefault && (
                                    <Badge variant="success" size="xs">Default</Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>{method.brand?.toUpperCase()}</span>
                                  <span>•</span>
                                  <span>Expires {method.expiryMonth}/{method.expiryYear}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setShowCardDetails({
                                  ...showCardDetails,
                                  [method.id]: !showCardDetails[method.id]
                                })}
                                className="p-2 text-gray-400 hover:text-gray-600"
                              >
                                {showCardDetails[method.id] ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </button>
                              
                              <button
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                className="p-2 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No payment methods added yet</p>
                        <Button
                          variant="primary"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={() => setShowPaymentModal(true)}
                        >
                          Add Payment Method
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Billing Information */}
                <Card title="Billing Information">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Billing Address</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>{user?.profile?.firstName} {user?.profile?.lastName}</p>
                          <p>{user?.profile?.address?.street}</p>
                          <p>{user?.profile?.address?.city}, {user?.profile?.address?.state} {user?.profile?.address?.zipCode}</p>
                          <p>{user?.profile?.address?.country}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Edit className="w-4 h-4" />}
                          className="mt-4"
                          onClick={() => navigate('/patient/profile')}
                        >
                          Edit Address
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Billing Settings</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Auto-renewal</span>
                            <div className="flex items-center space-x-2">
                              {currentSubscription?.autoRenew ? (
                                <Unlock className="w-4 h-4 text-green-500" />
                              ) : (
                                <Lock className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-sm">
                                {currentSubscription?.autoRenew ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Email receipts</span>
                            <span className="text-sm">Enabled</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Next billing date</span>
                            <span className="text-sm">
                              {currentSubscription?.nextBillingDate 
                                ? formatDate(currentSubscription.nextBillingDate)
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Invoice Settings */}
                <Card title="Invoice & Receipt Settings">
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">
                            Receive invoices and payment confirmations via email
                          </p>
                        </div>
                        <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600">
                          <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 translate-x-5"></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">
                            Get payment reminders and confirmations via SMS
                          </p>
                        </div>
                        <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-gray-200">
                          <span className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 translate-x-0"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Cancellation */}
                {currentSubscription?.status === 'active' && (
                  <Card title="Subscription Management">
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-900">Cancel Subscription</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Once cancelled, you'll lose access to all premium features at the end of your current billing period.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => setShowCancelModal(true)}
                            >
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card title="Subscription History">
                  <div className="p-6">
                    {subscriptionHistory.length > 0 ? (
                      <div className="space-y-4">
                        {subscriptionHistory.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                record.type === 'subscription' ? 'bg-blue-100' :
                                record.type === 'payment' ? 'bg-green-100' :
                                record.type === 'refund' ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                {record.type === 'subscription' && <Star className="w-5 h-5 text-blue-600" />}
                                {record.type === 'payment' && <DollarSign className="w-5 h-5 text-green-600" />}
                                {record.type === 'refund' && <RefreshCw className="w-5 h-5 text-yellow-600" />}
                                {record.type === 'cancellation' && <X className="w-5 h-5 text-red-600" />}
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900">{record.title}</h4>
                                <p className="text-sm text-gray-600">{record.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-gray-900">${record.amount}</div>
                              <div className="text-xs text-gray-500">{record.status}</div>
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
          </div>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <FormModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={currentSubscription?.status === 'active' ? 'Upgrade Subscription' : 'Subscribe to Plan'}
        onSubmit={subscriptionForm.handleSubmit(handleSubscriptionUpgrade)}
        loading={loading}
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getPlanIcon(selectedPlan.type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  ${calculatePrice(selectedPlan).toFixed(0)}
                </span>
                <span className="text-gray-600 ml-1">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                {...subscriptionForm.register('paymentMethod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.brand?.toUpperCase()} ending in {method.lastFour}
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
          </div>
        )}
      </FormModal>

      {/* Cancel Modal */}
      <ConfirmModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your current billing period."
        confirmText="Cancel Subscription"
        confirmVariant="danger"
        onConfirm={() => handleSubscriptionCancel('user_requested')}
        loading={loading}
      />

      {/* Payment Method Modal */}
      <FormModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment Method"
        onSubmit={paymentForm.handleSubmit(handleAddPaymentMethod)}
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method Type
            </label>
            <select
              {...paymentForm.register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select type</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
            </select>
            {paymentForm.formState.errors.type && (
              <p className="text-red-500 text-sm mt-1">
                {paymentForm.formState.errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              {...paymentForm.register('cardholderName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="John Doe"
            />
            {paymentForm.formState.errors.cardholderName && (
              <p className="text-red-500 text-sm mt-1">
                {paymentForm.formState.errors.cardholderName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              {...paymentForm.register('cardNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="1234 5678 9012 3456"
            />
            {paymentForm.formState.errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">
                {paymentForm.formState.errors.cardNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                {...paymentForm.register('expiryMonth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                {...paymentForm.register('expiryYear')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                {...paymentForm.register('cvv')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="123"
                maxLength="4"
              />
            </div>
          </div>

          {(paymentForm.formState.errors.expiryMonth || paymentForm.formState.errors.expiryYear || paymentForm.formState.errors.cvv) && (
            <div className="text-red-500 text-sm">
              {paymentForm.formState.errors.expiryMonth?.message ||
               paymentForm.formState.errors.expiryYear?.message ||
               paymentForm.formState.errors.cvv?.message}
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
};

export default SubscriptionManagement;