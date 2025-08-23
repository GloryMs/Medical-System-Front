import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CreditCard,
  Plus,
  Download,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Receipt,
  Search,
  Settings,
  AlertTriangle
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal, { FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

// Simple validation schema
const paymentMethodSchema = yup.object({
  cardholderName: yup.string().required('Cardholder name is required'),
  cardNumber: yup.string().required('Card number is required').min(16, 'Invalid card number'),
  expiryMonth: yup.string().required('Expiry month is required'),
  expiryYear: yup.string().required('Expiry year is required'),
  cvv: yup.string().required('CVV is required').min(3, 'Invalid CVV'),
  isDefault: yup.boolean()
});

const PatientPayments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // Basic state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  // Form setup
  const paymentForm = useForm({
    resolver: yupResolver(paymentMethodSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    }
  });

  // Load data
  useEffect(() => {
    loadPaymentMethods();
    loadRecentTransactions();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await execute(() => patientService.getPaymentMethods());
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const data = await execute(() => patientService.getPaymentHistory());
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleAddPaymentMethod = async (data) => {
    try {
      const newMethod = await execute(() => patientService.addPaymentMethod(data));
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddCardModal(false);
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

  const handleSetDefaultPaymentMethod = async (methodId) => {
    try {
      await execute(() => patientService.setDefaultPaymentMethod(methodId));
      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === methodId
      })));
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    return 'Card';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'methods', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'history', label: 'Transaction History', icon: <Receipt className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your payment methods and view transaction history
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    loadPaymentMethods();
                    loadRecentTransactions();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAddCardModal(true)}
                >
                  Add Payment Method
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Payment Methods"
                    value={paymentMethods.length}
                    icon={<CreditCard className="w-6 h-6" />}
                    className="bg-gradient-to-br from-blue-50 to-blue-100"
                  />
                  
                  <StatsCard
                    title="Total Transactions"
                    value={recentTransactions.length}
                    icon={<Receipt className="w-6 h-6" />}
                    className="bg-gradient-to-br from-green-50 to-green-100"
                  />
                  
                  <StatsCard
                    title="This Month"
                    value={formatCurrency(
                      recentTransactions
                        .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                    icon={<Calendar className="w-6 h-6" />}
                    className="bg-gradient-to-br from-purple-50 to-purple-100"
                  />
                </div>

                {/* Recent Transactions */}
                <Card title="Recent Transactions" 
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/patient/payment-history')}
                    >
                      View All
                    </Button>
                  }
                >
                  <div className="p-6">
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {recentTransactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                                <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                              <Badge 
                                variant={transaction.status === 'completed' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No transactions yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'methods' && (
              <div className="space-y-6">
                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className="relative">
                        {method.isDefault && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="success" size="sm">Default</Badge>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {getCardBrand(method.cardNumber)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                •••• •••• •••• {method.lastFour || method.cardNumber.slice(-4)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cardholder</span>
                              <span className="text-sm font-medium text-gray-900">
                                {method.cardholderName}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Expires</span>
                              <span className="text-sm font-medium text-gray-900">
                                {method.expiryMonth}/{method.expiryYear}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">CVV</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {showCardDetails[method.id] ? method.cvv : '•••'}
                                </span>
                                <button
                                  onClick={() => setShowCardDetails({
                                    ...showCardDetails,
                                    [method.id]: !showCardDetails[method.id]
                                  })}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showCardDetails[method.id] ? 
                                    <EyeOff className="w-4 h-4" /> : 
                                    <Eye className="w-4 h-4" />
                                  }
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              {!method.isDefault && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                >
                                  Set as Default
                                </Button>
                              )}
                              
                              <div className="flex space-x-2 ml-auto">
                                <button
                                  onClick={() => handleDeletePaymentMethod(method.id)}
                                  className="p-2 text-gray-400 hover:text-red-600"
                                  disabled={method.isDefault}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Payment Methods
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add a payment method to make payments for consultations.
                    </p>
                    <Button
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setShowAddCardModal(true)}
                    >
                      Add Your First Payment Method
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card>
                  <div className="p-6">
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{formatDate(transaction.date)}</span>
                                  <span>•</span>
                                  <span>ID: {transaction.id}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <Badge 
                                variant={transaction.status === 'completed' ? 'success' : 'warning'}
                              >
                                {transaction.status}
                              </Badge>
                              
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {transaction.paymentMethod || 'Credit Card'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No transactions found</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Payment Method Modal */}
      <FormModal
        show={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          paymentForm.reset();
        }}
        title="Add Payment Method"
        onSubmit={paymentForm.handleSubmit(handleAddPaymentMethod)}
        loading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name *
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
              Card Number *
            </label>
            <input
              type="text"
              {...paymentForm.register('cardNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
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
                Month *
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
              {paymentForm.formState.errors.expiryMonth && (
                <p className="text-red-500 text-sm mt-1">
                  {paymentForm.formState.errors.expiryMonth.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
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
              {paymentForm.formState.errors.expiryYear && (
                <p className="text-red-500 text-sm mt-1">
                  {paymentForm.formState.errors.expiryYear.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                type="text"
                {...paymentForm.register('cvv')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="123"
                maxLength="4"
              />
              {paymentForm.formState.errors.cvv && (
                <p className="text-red-500 text-sm mt-1">
                  {paymentForm.formState.errors.cvv.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...paymentForm.register('isDefault')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Set as default payment method
            </label>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PatientPayments;