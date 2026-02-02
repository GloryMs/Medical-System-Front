import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  RefreshCw,
  Eye,
  Receipt,
  DollarSign,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Users
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import supervisorService from '../../services/api/supervisorService';
import { toast } from 'react-toastify';

const SupervisorPayments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('all');

  // Load data
  useEffect(() => {
    loadRecentTransactions();
    loadPatients();
  }, []);

  // Reload transactions when patient filter changes
  useEffect(() => {
    loadRecentTransactions();
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      const data = await execute(() => supervisorService.getPatients());
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const patientId = selectedPatient === 'all' ? null : selectedPatient;
      const data = await execute(() => supervisorService.getPaymentHistory(patientId));
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    if (recentTransactions.length === 0) {
      toast.warning('No transactions to export');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date',
      'Description',
      'Patient',
      'Amount',
      'Status',
      'Payment Method',
      'Transaction Type',
      'Reference ID',
      'Platform Fee',
      'Doctor ID',
      'Case ID',
      'Currency',
      'Processing Fee',
      'Net Amount'
    ];

    const csvContent = [
      headers.join(','),
      ...recentTransactions.map(transaction => [
        transaction.id || '',
        transaction.date ? formatDate(transaction.date) : '',
        `"${transaction.description || ''}"`,
        `"${transaction.patientName || transaction.patientId || ''}"`,
        transaction.amount || 0,
        transaction.status || '',
        transaction.paymentMethod || '',
        transaction.type || transaction.paymentType || '',
        transaction.referenceId || transaction.transactionId || '',
        transaction.platformFee || 0,
        transaction.doctorId || '',
        transaction.caseId || '',
        transaction.currency || 'USD',
        transaction.processingFee || 0,
        transaction.netAmount || (transaction.amount - (transaction.platformFee || 0) - (transaction.processingFee || 0))
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patient-payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payment history exported successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate total payments
  const getTotalPayments = () => {
    const totalAmount = recentTransactions
      .filter(t => t.status && t.status.toLowerCase() === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return totalAmount;
  };

  // Calculate pending payments
  const getPendingPayments = () => {
    const pendingAmount = recentTransactions
      .filter(t => t.status && t.status.toLowerCase() === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return pendingAmount;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
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
                <h1 className="text-3xl font-bold text-gray-900">Patient Payments</h1>
                <p className="mt-1 text-sm text-gray-600">
                  View payment transactions for your assigned patients
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Patients</option>
                  {patients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {patient.patientName}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    loadRecentTransactions();
                    loadPatients();
                  }}
                >
                  Refresh
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
                    title="Total Transactions"
                    value={recentTransactions.length}
                    icon={<Receipt className="w-6 h-6" />}
                    className="bg-gradient-to-br from-green-50 to-green-100"
                  />

                  <StatsCard
                    title="Total Payments"
                    value={formatCurrency(getTotalPayments())}
                    icon={<DollarSign className="w-6 h-6" />}
                    className="bg-gradient-to-br from-purple-50 to-purple-100"
                  />

                  <StatsCard
                    title="Pending Payments"
                    value={formatCurrency(getPendingPayments())}
                    icon={<Clock className="w-6 h-6" />}
                    className="bg-gradient-to-br from-orange-50 to-orange-100"
                  />
                </div>

                {/* Recent Transactions */}
                <Card
                  title="Recent Transactions"
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('history')}
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
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(transaction.processedAt)}</span>
                                  {transaction.paymentType && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {transaction.paymentType}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </div>
                              <Badge
                                variant={
                                  transaction.status === 'completed' ? 'success' :
                                  transaction.status === 'pending' ? 'warning' :
                                  transaction.status === 'failed' ? 'error' : 'default'
                                }
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

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card
                  title="All Transactions"
                  action={
                    <Button
                      variant="primary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={exportToCSV}
                      disabled={recentTransactions.length === 0}
                    >
                      Export CSV
                    </Button>
                  }
                >
                  <div className="p-6">
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                                  {transaction.patientName && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {transaction.patientName}
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                                  <div className="space-y-1">
                                    <p><span className="font-medium">Date:</span> {formatDate(transaction.processedAt)}</p>
                                    <p><span className="font-medium">ID:</span> {transaction.id}</p>
                                    <p><span className="font-medium">Reference:</span> {transaction.referenceId || transaction.transactionId || 'N/A'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p><span className="font-medium">Type:</span> {transaction.type || transaction.paymentType || 'N/A'}</p>
                                    <p><span className="font-medium">Payment Method:</span> {transaction.paymentMethod || 'Credit Card'}</p>
                                    <p><span className="font-medium">Currency:</span> {transaction.currency || 'USD'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    {transaction.doctorId && <p><span className="font-medium">Doctor ID:</span> {transaction.doctorId}</p>}
                                    {transaction.caseId && <p><span className="font-medium">Case ID:</span> {transaction.caseId}</p>}
                                    {transaction.platformFee && <p><span className="font-medium">Platform Fee:</span> {formatCurrency(transaction.platformFee)}</p>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <Badge
                                variant={
                                  transaction.status === 'completed' ? 'success' :
                                  transaction.status === 'pending' ? 'warning' :
                                  transaction.status === 'failed' ? 'error' : 'default'
                                }
                              >
                                {transaction.status}
                              </Badge>

                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                {transaction.netAmount && transaction.netAmount !== transaction.amount && (
                                  <div className="text-sm text-gray-600">
                                    Net: {formatCurrency(transaction.netAmount)}
                                  </div>
                                )}
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
    </div>
  );
};

export default SupervisorPayments;
