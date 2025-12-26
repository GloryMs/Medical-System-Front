import React, { useState } from 'react';
import { TrendingUp, Calendar, Clock, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const TrendsTab = ({ data }) => {
  const [selectedTrendType, setSelectedTrendType] = useState('daily');

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trend data...</p>
        </div>
      </div>
    );
  }

  // Format daily trend data
  const dailyTrendData = (data.dailyTrend || []).map(point => ({
    date: point.label,
    cases: point.count || 0
  }));

  // Format weekly trend data
  const weeklyTrendData = (data.weeklyTrend || []).map(point => ({
    week: point.label,
    cases: point.count || 0
  }));

  // Format monthly trend data
  const monthlyTrendData = (data.monthlyTrend || []).map(point => ({
    month: point.label,
    cases: point.count || 0
  }));

  // Get selected trend data
  const getTrendData = () => {
    switch (selectedTrendType) {
      case 'daily':
        return dailyTrendData;
      case 'weekly':
        return weeklyTrendData;
      case 'monthly':
        return monthlyTrendData;
      default:
        return dailyTrendData;
    }
  };

  // Format hourly distribution for heatmap
  const hourlyHeatmapData = Object.entries(data.hourlyDistribution || {}).map(([hour, count]) => ({
    hour: parseInt(hour),
    count: count,
    intensity: count
  }));

  // Format day of week distribution
  const dayOfWeekData = Object.entries(data.dayOfWeekDistribution || {}).map(([day, count]) => ({
    day: day,
    cases: count
  }));

  // Get heatmap color based on intensity
  const getHeatmapColor = (count) => {
    if (!hourlyHeatmapData.length) return '#10B981';
    
    const max = Math.max(...hourlyHeatmapData.map(d => d.count));
    const intensity = count / max;
    
    if (intensity > 0.7) return '#EF4444'; // Red - Very high
    if (intensity > 0.4) return '#F59E0B'; // Orange - High
    if (intensity > 0.2) return '#FBBF24'; // Yellow - Medium
    return '#10B981'; // Green - Low
  };

  return (
    <div className="space-y-6">
      {/* Growth Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Week-over-Week</h3>
          </div>
          <p className={`text-2xl font-bold ${
            (data.weekOverWeekGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(data.weekOverWeekGrowth || 0) >= 0 ? '+' : ''}{(data.weekOverWeekGrowth || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Case growth</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Month-over-Month</h3>
          </div>
          <p className={`text-2xl font-bold ${
            (data.monthOverMonthGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(data.monthOverMonthGrowth || 0) >= 0 ? '+' : ''}{(data.monthOverMonthGrowth || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Case growth</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Year-over-Year</h3>
          </div>
          <p className={`text-2xl font-bold ${
            (data.yearOverYearGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(data.yearOverYearGrowth || 0) >= 0 ? '+' : ''}{(data.yearOverYearGrowth || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Case growth</p>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Case Volume Trend</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTrendType('daily')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedTrendType === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedTrendType('weekly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedTrendType === 'weekly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedTrendType('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedTrendType === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        {getTrendData().length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={getTrendData()}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={selectedTrendType === 'daily' ? 'date' : selectedTrendType === 'weekly' ? 'week' : 'month'} 
                angle={-45} 
                textAnchor="end" 
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cases"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorCases)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-400">
            No trend data available
          </div>
        )}
      </div>

      {/* Hourly Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-orange-600" />
          Hourly Submission Pattern (24-Hour Heatmap)
        </h3>
        {hourlyHeatmapData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hourlyHeatmapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow">
                          <p className="font-medium">{data.hour}:00 - {data.hour + 1}:00</p>
                          <p className="text-sm text-gray-600">{data.count} cases</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count">
                  {hourlyHeatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getHeatmapColor(entry.count)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
                <span className="text-gray-600">Low Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
                <span className="text-gray-600">Medium Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
                <span className="text-gray-600">High Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
                <span className="text-gray-600">Very High Activity</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Peak Hour:</strong> {data.peakHour}:00 - {(data.peakHour || 0) + 1}:00 
                {' '}({hourlyHeatmapData.find(h => h.hour === data.peakHour)?.count || 0} cases)
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[150px] text-gray-400">
            No hourly data available
          </div>
        )}
      </div>

      {/* Day of Week Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-600" />
          Day of Week Distribution
        </h3>
        {dayOfWeekData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Busiest Day:</strong> {data.peakDay} 
                {' '}({dayOfWeekData.find(d => d.day === data.peakDay)?.cases || 0} cases)
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No day of week data available
          </div>
        )}
      </div>

      {/* Peak Activity Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-900">Peak Hour</h3>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {data.peakHour}:00
          </p>
          <p className="text-xs text-orange-700 mt-1">Most submissions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Peak Day</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {data.peakDay || 'N/A'}
          </p>
          <p className="text-xs text-purple-700 mt-1">Busiest weekday</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Peak Month</h3>
          </div>
          <p className="text-xl font-bold text-blue-900">
            {data.peakMonth || 'N/A'}
          </p>
          <p className="text-xs text-blue-700 mt-1">Highest volume</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-2">📊 Trend Insights</h4>
        <ul className="space-y-1 text-sm text-green-800">
          {(data.weekOverWeekGrowth || 0) > 10 && (
            <li>📈 Strong week-over-week growth of {(data.weekOverWeekGrowth || 0).toFixed(1)}%. Consider increasing capacity.</li>
          )}
          {(data.weekOverWeekGrowth || 0) < -10 && (
            <li>📉 Declining week-over-week trend ({(data.weekOverWeekGrowth || 0).toFixed(1)}%). Investigate potential issues.</li>
          )}
          {data.peakHour && (
            <li>⏰ Peak activity at {data.peakHour}:00. Ensure adequate staffing during this time.</li>
          )}
          {data.peakDay && (
            <li>📅 {data.peakDay} is the busiest day. Plan resources accordingly.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TrendsTab;