import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EarningsAreaChart = ({ data, height = 300 }) => {
  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Calculate cumulative earnings
  const cumulativeData = data.reduce((acc, item, index) => {
    const cumulative = index === 0 
      ? parseFloat(item.earnings)
      : acc[index - 1].cumulative + parseFloat(item.earnings);
    
    return [...acc, {
      ...item,
      cumulative: cumulative
    }];
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Cumulative:</span> {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">This Period:</span> {formatCurrency(payload[0].payload.earnings)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={cumulativeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
        <Area 
          type="monotone" 
          dataKey="cumulative" 
          stroke="#10b981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorEarnings)"
          name="Cumulative Earnings"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EarningsAreaChart;