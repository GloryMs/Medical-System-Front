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
import Modal, { ConfirmationModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

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
      const plans = await execute(() => patientService.getSubscriptionPlans());
      setAvailablePlans(plans || []);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await execute(() => patientService.getPaymentMethods());
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
    if (!currentSubscription?.expiry) return 0;
    const expiry = new Date(currentSubscription.expiry);
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
            {currentSubscription.status === 'active' ? (
              getDaysUntilExpiry() <= 7 ? (
                <AlertCard
                  type="warning"
                  title="Subscription Expiring Soon"
                  message={`Your subscription expires in ${getDaysUntilExpiry()} days on ${formatDate(currentSubscription.expiry)}.`}
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
                  message={`Your ${currentSubscription.plan} plan is active until ${formatDate(currentSubscription.expiry)}.`}
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
                    value={currentSubscription?.plan || 'None'}
                    icon={getPlanIcon(currentSubscription?.plan)}
                    className={`bg-gradient-to-br ${getPlanColor(currentSubscription?.plan)}`}
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
                            {getPlanIcon(currentSubscription.plan)}
                            <span className="font-medium">{currentSubscription.plan}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <StatusBadge status={currentSubscription.status} />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Started</span>
                          <span className="font-medium">{formatDate(currentSubscription.startDate)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Expires</span>
                          <span className="font-medium">{formatDate(currentSubscription.expiry)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Billing Cycle</span>
                          <span className="font-medium capitalize">{currentSubscription.billingCycle}</span>
                        </div>

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
                            {currentSubscription.features?.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            )) || (
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
                            )}
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

                      {!currentSubscription || currentSubscription.status !== 'active' && (
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
              <div className="space-y-6">
                {/* Billing Cycle Toggle */}
                <div className="text-center">
                  <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
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
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-xl ${
                        plan.popular
                          ? 'border-primary-500 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge variant="primary" className="px-3 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <div className="p-8">
                        <div className="text-center mb-8">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getPlanColor(plan.type)} flex items-center justify-center`}>
                            {getPlanIcon(plan.type)}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-gray-600 mt-2">{plan.description}</p>
                        </div>

                        <div className="text-center mb-8">
                          <div className="flex items-baseline justify-center">
                            <span className="text-4xl font-bold text-gray-900">
                              ${calculatePrice(plan).toFixed(0)}
                            </span>
                            <span className="text-gray-600 ml-2">
                              /{billingCycle === 'yearly' ? 'year' : 'month'}
                            </span>
                          </div>
                          {billingCycle === 'yearly' && plan.yearlyDiscount && (
                            <div className="mt-2 flex items-center justify-center space-x-2 text-green-600">
                              <Percent className="w-4 h-4" />
                              <span className="text-sm">
                                Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)} annually
                              </span>
                            </div>
                          )}
                          {discount && (
                            <div className="mt-2 text-green-600 text-sm">
                              Original: ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 mb-8">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant={plan.popular ? 'primary' : 'outline'}
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(plan);
                            if (currentSubscription?.status === 'active') {
                              setShowUpgradeModal(true);
                            } else {
                              subscriptionForm.setValue('planType', plan.id);
                              setShowUpgradeModal(true);
                            }
                          }}
                          disabled={currentSubscription?.plan === plan.type}
                        >
                          {currentSubscription?.plan === plan.type
                            ? 'Current Plan'
                            : currentSubscription?.status === 'active'
                            ? 'Upgrade to This Plan'
                            : 'Choose This Plan'
                          }
                        </Button>
                      </div>
                    </div>
                  ))}
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
                        No, there are no setup fees or hidden charges. You only pay the subscription amount.
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
                      <div className

export default SubscriptionManagement;