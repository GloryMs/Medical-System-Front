import React from 'react';
import { TrendingUp, Calendar, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

const PaymentTrendsTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trends data...</p>
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
      {/* Revenue and Volume Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Transaction Volume Trend</h3>
        {data.combinedTrend && data.combinedTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data.combinedTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
              <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#10B981" stroke="#10B981" fillOpacity={0.3} name="Revenue" />
              <Bar yAxisId="right" dataKey="transactions" fill="#3B82F6" name="Transactions" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No trend data available
          </div>
        )}
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Day of Week Analysis</h3>
          {data.dayOfWeekTrend && data.dayOfWeekTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dayOfWeekTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={2} name="Transactions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No day of week data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth Rate</h3>
          {data.monthlyGrowth && data.monthlyGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Line type="monotone" dataKey="growth" stroke="#8B5CF6" strokeWidth={2} name="Growth %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No growth data available
            </div>
          )}
        </div>
      </div>

      {/* Trend Insights */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-900">Peak Day</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{data.peakDay?.day || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(data.peakDay?.revenue)} avg</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">Best Month</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{data.bestMonth?.month || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(data.bestMonth?.revenue)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-semibold text-gray-900">Trend Direction</h4>
          </div>
          <p className={`text-xl font-bold ${data.trendDirection === 'up' ? 'text-green-600' : data.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {data.trendDirection === 'up' ? '↑ Growing' : data.trendDirection === 'down' ? '↓ Declining' : '→ Stable'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Overall trend</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-semibold text-gray-900">Forecast Next Month</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.forecastNextMonth)}</p>
          <p className="text-xs text-gray-500 mt-1">Estimated</p>
        </div>
      </div>

      {/* Seasonal Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Pattern Analysis</h3>
        <div className="grid grid-cols-4 gap-4">
          {data.seasonalAnalysis && data.seasonalAnalysis.map((season, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{season.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Revenue:</span>
                  <span className="font-medium">{formatCurrency(season.avgRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{season.avgTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs Average:</span>
                  <span className={`font-medium ${season.vsAverage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {season.vsAverage >= 0 ? '+' : ''}{season.vsAverage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentTrendsTab;
