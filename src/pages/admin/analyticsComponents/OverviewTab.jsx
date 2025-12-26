import React from 'react';
import {
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const OverviewTab = ({ data }) => {
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

  // Format urgency distribution for charts
  const urgencyData = Object.entries(data.urgencyDistribution || {}).map(([urgency, count]) => ({
    name: urgency,
    value: count,
    color: CHART_COLORS.urgency[urgency] || '#6B7280'
  }));

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

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-6 gap-4">
        <MetricCard
          title="Total Cases"
          value={data.totalCases || 0}
          trend={data.caseTrend}
          icon={FileText}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Active Cases"
          value={data.activeCases || 0}
          icon={Activity}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Closed Cases"
          value={data.closedCases || 0}
          icon={CheckCircle}
          color="bg-purple-500"
        />
        
        <MetricCard
          title="At Risk"
          value={data.casesAtRisk || 0}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        
        <MetricCard
          title="Active Doctors"
          value={data.activeDoctorsCount || 0}
          icon={Users}
          color="bg-indigo-500"
        />
        
        <MetricCard
          title="Assignment Rate"
          value={`${(data.assignmentSuccessRate || 0).toFixed(1)}%`}
          icon={CheckCircle}
          color="bg-teal-500"
        />
      </div>

      {/* Time Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Assignment Time</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgAssignmentTime || 0).toFixed(1)}h</p>
          {data.assignmentTimeTrend && (
            <div className={`flex items-center space-x-1 text-sm mt-2 ${data.assignmentTimeTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.assignmentTimeTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.assignmentTimeTrend.value}% {data.assignmentTimeTrend.period}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Resolution Time</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgResolutionTime || 0).toFixed(1)} days</p>
          {data.resolutionTimeTrend && (
            <div className={`flex items-center space-x-1 text-sm mt-2 ${data.resolutionTimeTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.resolutionTimeTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.resolutionTimeTrend.value}% {data.resolutionTimeTrend.period}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Response Time</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgResponseTime || 0).toFixed(1)}h</p>
          <p className="text-xs text-gray-500 mt-2">Doctor response time</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
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

        {/* Urgency Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgency Distribution</h3>
          {urgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No urgency data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-xl font-bold text-blue-600">{(data.assignmentSuccessRate || 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cases per Doctor</p>
            <p className="text-xl font-bold text-purple-600">
              {data.totalCases && data.activeDoctorsCount 
                ? (data.totalCases / data.activeDoctorsCount).toFixed(1) 
                : 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold text-green-600">
              {data.totalCases ? ((data.closedCases / data.totalCases) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Risk Level</p>
            <p className={`text-xl font-bold ${
              (data.casesAtRisk || 0) > 10 ? 'text-red-600' : 
              (data.casesAtRisk || 0) > 5 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {(data.casesAtRisk || 0) > 10 ? 'High' : 
               (data.casesAtRisk || 0) > 5 ? 'Medium' : 
               'Low'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;