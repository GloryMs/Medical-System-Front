import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const EarningsLineChart = ({ data, height = 300 }) => {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Earnings:</span> {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">Consultations:</span> {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="earnings" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          name="Earnings"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EarningsLineChart;