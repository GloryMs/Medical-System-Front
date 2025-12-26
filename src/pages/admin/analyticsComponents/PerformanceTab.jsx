import React from 'react';
import { Clock, AlertCircle, TrendingUp, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const PerformanceTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // Transform avgTimeByStatus for bar chart
  const timeByStatusData = Object.entries(data.avgTimeByStatus || {}).map(([status, hours]) => ({
    status: status.replace(/_/g, ' '),
    hours: parseFloat(hours)
  }));

  // Transform bottleneck data
  const bottleneckData = Object.entries(data.bottleneckAnalysis || {}).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count: count
  }));

  // SLA Compliance radar chart data
  const slaData = data.slaCompliance ? [
    {
      urgency: 'Critical',
      compliance: data.slaCompliance.criticalCompliance || 0,
      target: 100
    },
    {
      urgency: 'High',
      compliance: data.slaCompliance.highCompliance || 0,
      target: 100
    },
    {
      urgency: 'Medium',
      compliance: data.slaCompliance.mediumCompliance || 0,
      target: 100
    },
    {
      urgency: 'Low',
      compliance: data.slaCompliance.lowCompliance || 0,
      target: 100
    }
  ] : [];

  // Stage funnel data
  const funnelData = (data.stageFunnel || [])
    .sort((a, b) => a.stageOrder - b.stageOrder)
    .map(stage => ({
      stage: stage.stageLabel,
      cases: stage.caseCount,
      reach: stage.reachRate
    }));

  // Performance by urgency
  const urgencyPerformanceData = Object.entries(data.performanceByUrgency || {}).map(([urgency, perf]) => ({
    urgency: urgency,
    assignmentTime: perf.avgAssignmentTime || 0,
    resolutionTime: perf.avgResolutionTime || 0,
    slaCompliance: perf.slaCompliance || 0
  }));

  return (
    <div className="space-y-6">
      {/* SLA Compliance Overview */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              (data.slaCompliance?.overallCompliance || 0) >= 90 ? 'bg-green-100 text-green-700' :
              (data.slaCompliance?.overallCompliance || 0) >= 75 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(data.slaCompliance?.overallCompliance || 0) >= 90 ? 'Excellent' :
               (data.slaCompliance?.overallCompliance || 0) >= 75 ? 'Good' :
               'Needs Work'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Overall SLA</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.slaCompliance?.overallCompliance || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-500">Target: 1h</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Critical</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.slaCompliance?.criticalCompliance || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-500">Target: 4h</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">High</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.slaCompliance?.highCompliance || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-500">Target: 24h</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Medium</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.slaCompliance?.mediumCompliance || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">Target: 48h</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Low</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.slaCompliance?.lowCompliance || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Average Time by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Average Time by Status
          </h3>
          {timeByStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeByStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No time data available
            </div>
          )}
        </div>

        {/* SLA Compliance Radar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            SLA Compliance by Urgency
          </h3>
          {slaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={slaData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="urgency" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Compliance"
                  dataKey="compliance"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.1}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No SLA data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bottleneck Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Bottleneck Analysis
          </h3>
          {bottleneckData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bottleneckData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No bottlenecks detected
            </div>
          )}
        </div>

        {/* Stage Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Case Stage Progression
          </h3>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Reach %', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cases" stroke="#8B5CF6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="reach" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No funnel data available
            </div>
          )}
        </div>
      </div>

      {/* Performance by Urgency Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown by Urgency</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Assignment (hrs)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution (days)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA Compliance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {urgencyPerformanceData.length > 0 ? (
                urgencyPerformanceData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          row.urgency === 'CRITICAL' ? 'bg-red-500' :
                          row.urgency === 'HIGH' ? 'bg-orange-500' :
                          row.urgency === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">{row.urgency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.performanceByUrgency[row.urgency]?.totalCases || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.assignmentTime.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.resolutionTime.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.slaCompliance >= 90 ? 'bg-green-100 text-green-800' :
                        row.slaCompliance >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.slaCompliance.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No performance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Performance Insights</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          {data.slaCompliance?.overallCompliance < 75 && (
            <li>⚠️ Overall SLA compliance is below target. Consider increasing doctor availability.</li>
          )}
          {bottleneckData.length > 0 && (
            <li>🔍 {bottleneckData[0].status} has the most stuck cases ({bottleneckData[0].count}). Review assignment process.</li>
          )}
          {data.slaCompliance?.criticalCompliance < 80 && (
            <li>🚨 Critical cases are not meeting SLA targets. Prioritize urgent case handling.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PerformanceTab;