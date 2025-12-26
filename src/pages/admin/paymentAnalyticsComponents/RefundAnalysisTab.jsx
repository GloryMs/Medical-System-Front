import React from 'react';
import { RotateCcw, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RefundAnalysisTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading refund data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Refund Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <RotateCcw className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-semibold text-gray-900">Total Refunds</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalRefunds || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <h4 className="text-sm font-semibold text-gray-900">Refund Amount</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRefundAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">Total refunded</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="text-sm font-semibold text-gray-900">Refund Rate</h4>
          </div>
          <p className={`text-2xl font-bold ${(data.refundRate || 0) > 5 ? 'text-red-600' : (data.refundRate || 0) > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
            {(data.refundRate || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Of total payments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-semibold text-gray-900">Avg Refund Amount</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.avgRefundAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">Per refund</p>
        </div>
      </div>

      {/* Refund Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Trend Over Time</h3>
        {data.refundTrend && data.refundTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.refundTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} name="Refund Count" />
              <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2} name="Refund Amount ($)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No refund trend data available
          </div>
        )}
      </div>

      {/* Refund Reasons & Payment Types */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Reasons</h3>
          {data.refundReasons && data.refundReasons.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.refundReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.refundReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No refund reason data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Refunds by Payment Type</h3>
          {data.refundsByType && data.refundsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.refundsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" name="Refund Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No refund by type data available
            </div>
          )}
        </div>
      </div>

      {/* Top Refund Reasons Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Refund Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.detailedRefundReasons && data.detailedRefundReasons.map((reason, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reason.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reason.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reason.percentage?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(reason.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(reason.avgAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Impact Analysis */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Impact Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Revenue Lost to Refunds</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(data.revenueLostToRefunds)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {data.revenueImpactPercentage?.toFixed(1)}% of total revenue
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Refund Processing Time</p>
            <p className="text-xl font-bold text-orange-600">{(data.avgRefundProcessingTime || 0).toFixed(1)} days</p>
            <p className="text-xs text-gray-500 mt-1">From request to completion</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Refund Trend</p>
            <p className={`text-xl font-bold ${(data.refundTrendPercentage || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(data.refundTrendPercentage || 0) > 0 ? '+' : ''}{(data.refundTrendPercentage || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundAnalysisTab;
