import React from 'react';
import { Stethoscope, TrendingUp, Clock, DollarSign } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const SpecializationsTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading specialization data...</p>
        </div>
      </div>
    );
  }

  // Format cases by specialization for pie chart
  const specializationVolumeData = Object.entries(data.casesBySpecialization || {}).map(([spec, count], index) => ({
    name: spec,
    value: count,
    color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
  }));

  // Format resolution time data
  const resolutionTimeData = Object.entries(data.avgResolutionBySpecialization || {})
    .map(([spec, days]) => ({
      specialization: spec,
      days: parseFloat(days)
    }))
    .sort((a, b) => a.days - b.days);

  // Format fee data
  const feeData = Object.entries(data.avgFeeBySpecialization || {})
    .map(([spec, fee]) => ({
      specialization: spec,
      fee: parseFloat(fee)
    }))
    .sort((a, b) => b.fee - a.fee);

  // Format trend data for line chart
  const trendData = (data.specializationTrends || [])
    .filter(t => t.monthlyGrowthRate !== null)
    .map(trend => ({
      specialization: trend.specialization,
      growth: trend.monthlyGrowthRate,
      currentMonth: trend.currentMonthCases,
      previousMonth: trend.previousMonthCases
    }));

  return (
    <div className="space-y-6">
      {/* Top Insights Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Total Specializations</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalSpecializations || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Active specialties</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Most In-Demand</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{data.mostInDemand || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">Highest volume</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Fastest Resolution</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{data.fastestResolution || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">Quickest turnaround</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-semibold text-gray-900">Highest Fee</h3>
          </div>
          <p className="text-lg font-bold text-gray-900">{data.highestFee || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">Average consultation fee</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Volume by Specialization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Volume by Specialization</h3>
          {specializationVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={specializationVolumeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specializationVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400">
              No specialization data available
            </div>
          )}
        </div>

        {/* Resolution Time Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Resolution Time by Specialization</h3>
          {resolutionTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialization" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="days" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400">
              No resolution time data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Average Fee by Specialization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Consultation Fee by Specialization</h3>
          {feeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="specialization" type="category" width={120} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="fee" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No fee data available
            </div>
          )}
        </div>

        {/* Growth Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth Rate by Specialization</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialization" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="growth" fill="#10B981">
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Trends Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialization Trends (Month-over-Month)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.specializationTrends || []).map((trend, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{trend.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.currentMonthCases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.previousMonthCases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      trend.monthlyChange > 0 ? 'text-green-600' :
                      trend.monthlyChange < 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {trend.monthlyChange > 0 ? '+' : ''}{trend.monthlyChange}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trend.monthlyGrowthRate > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : trend.monthlyGrowthRate < 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-600 mr-1 transform rotate-180" />
                      ) : null}
                      <span className={`text-sm font-medium ${
                        trend.monthlyGrowthRate > 0 ? 'text-green-600' :
                        trend.monthlyGrowthRate < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {trend.monthlyGrowthRate?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      trend.trendDirection === 'UP' ? 'bg-green-100 text-green-800' :
                      trend.trendDirection === 'DOWN' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trend.trendDirection}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(data.distributionPercentage || {})
            .sort((a, b) => b[1] - a[1])
            .map(([spec, percentage], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{spec}</p>
                  <p className="text-xs text-gray-500">{data.casesBySpecialization[spec]} cases</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-900 mb-2">💡 Specialization Insights</h4>
        <ul className="space-y-1 text-sm text-purple-800">
          {data.mostInDemand && (
            <li>📊 {data.mostInDemand} is the most in-demand specialization with {data.casesBySpecialization[data.mostInDemand]} cases.</li>
          )}
          {data.fastestResolution && data.avgResolutionBySpecialization[data.fastestResolution] && (
            <li>⚡ {data.fastestResolution} has the fastest resolution time at {data.avgResolutionBySpecialization[data.fastestResolution].toFixed(1)} days.</li>
          )}
          {data.fastestGrowth && data.fastestGrowth !== 'N/A' && (
            <li>🚀 {data.fastestGrowth} is growing fastest. Consider allocating more doctors to this specialty.</li>
          )}
          {data.highestFee && (
            <li>💰 {data.highestFee} commands the highest consultation fees. High-value specialty.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SpecializationsTab;