import React from 'react';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const TransactionAnalysisTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Volume Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume Over Time</h3>
        {data.volumeTrend && data.volumeTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="successful" stroke="#10B981" name="Successful" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#EF4444" name="Failed" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No transaction volume data available
          </div>
        )}
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">Total Transactions</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalTransactions || 0}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">Success Rate</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">{(data.successRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.successfulTransactions || 0} successful</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-semibold text-gray-900">Failed</h4>
          </div>
          <p className="text-2xl font-bold text-red-600">{data.failedTransactions || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{(data.failureRate || 0).toFixed(1)}% failure rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h4 className="text-sm font-semibold text-gray-900">Avg Processing Time</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgProcessingTime || 0).toFixed(1)}s</p>
          <p className="text-xs text-gray-500 mt-1">Per transaction</p>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Distribution by Hour</h3>
        {data.hourlyDistribution && data.hourlyDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No hourly distribution data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionAnalysisTab;
