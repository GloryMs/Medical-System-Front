import React from 'react';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CHART_COLORS } from '../analyticsComponents/config/chartcolors';

const PaymentOverviewTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading overview data...</p>
        </div>
      </div>
    );
  }

  // Format status distribution for charts
  const statusData = Object.entries(data.statusDistribution || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: CHART_COLORS.status[status] || '#6B7280'
  }));

  // Format payment type distribution for charts
  const typeData = Object.entries(data.typeDistribution || {}).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const PAYMENT_TYPE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Metric Card Component
  const MetricCard = ({ title, value, trend, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend.period}</p>
        )}
      </div>
    </div>
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-6 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          trend={data.revenueTrend}
          icon={DollarSign}
          color="bg-green-500"
        />

        <MetricCard
          title="Total Payments"
          value={data.totalPayments || 0}
          trend={data.paymentTrend}
          icon={Receipt}
          color="bg-blue-500"
        />

        <MetricCard
          title="Completed"
          value={data.completedPayments || 0}
          icon={CheckCircle}
          color="bg-purple-500"
        />

        <MetricCard
          title="Failed"
          value={data.failedPayments || 0}
          icon={AlertTriangle}
          color="bg-red-500"
        />

        <MetricCard
          title="Refunds"
          value={data.totalRefunds || 0}
          icon={RotateCcw}
          color="bg-orange-500"
        />

        <MetricCard
          title="Success Rate"
          value={`${(data.successRate || 0).toFixed(1)}%`}
          icon={CheckCircle}
          color="bg-teal-500"
        />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Transaction Value</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.avgTransactionValue)}</p>
          {data.avgTransactionTrend && (
            <div className={`flex items-center space-x-1 text-sm mt-2 ${data.avgTransactionTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.avgTransactionTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.avgTransactionTrend.value}% {data.avgTransactionTrend.period}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <RotateCcw className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-gray-900">Total Refunded</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRefundedAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">{data.refundRate?.toFixed(1)}% of total revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Net Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency((data.totalRevenue || 0) - (data.totalRefundedAmount || 0))}
          </p>
          <p className="text-xs text-gray-500 mt-2">After refunds</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No status data available
            </div>
          )}
        </div>

        {/* Payment Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Type Distribution</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_TYPE_COLORS[index % PAYMENT_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No payment type data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-xl font-bold text-green-600">{(data.successRate || 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Payments</p>
            <p className="text-xl font-bold text-yellow-600">{data.pendingPayments || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Growth</p>
            <p className={`text-xl font-bold ${(data.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(data.monthlyGrowth || 0) >= 0 ? '+' : ''}{(data.monthlyGrowth || 0).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Refund Rate</p>
            <p className={`text-xl font-bold ${
              (data.refundRate || 0) > 5 ? 'text-red-600' :
              (data.refundRate || 0) > 2 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {(data.refundRate || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOverviewTab;
