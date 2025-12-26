import React from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const RevenueAnalysisTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        {data.revenueTrend && data.revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No revenue trend data available
          </div>
        )}
      </div>

      {/* Revenue by Type */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Type</h3>
          {data.revenueByType && data.revenueByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No revenue by type data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
          {data.monthlyComparison && data.monthlyComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="currentYear" stroke="#10B981" name="Current Year" strokeWidth={2} />
                <Line type="monotone" dataKey="previousYear" stroke="#6B7280" name="Previous Year" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No monthly comparison data available
            </div>
          )}
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">Highest Revenue Day</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.highestRevenueDay?.amount)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.highestRevenueDay?.date || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">Avg Daily Revenue</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.avgDailyRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Per day</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-semibold text-gray-900">Growth Rate</h4>
          </div>
          <p className={`text-xl font-bold ${(data.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(data.growthRate || 0) >= 0 ? '+' : ''}{(data.growthRate || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">vs previous period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-semibold text-gray-900">Revenue per Transaction</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.revenuePerTransaction)}</p>
          <p className="text-xs text-gray-500 mt-1">Average</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalysisTab;
