import React from 'react';
import { Award, AlertTriangle, CheckCircle, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell
} from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const QualityTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quality metrics...</p>
        </div>
      </div>
    );
  }

  // Quality score gauge data
  const qualityGaugeData = [
    {
      name: 'Documentation',
      value: data.avgDocumentationScore || 0,
      fill: getQualityColor(data.avgDocumentationScore || 0)
    }
  ];

  // Rates comparison data
  const ratesData = [
    { name: 'Completion', value: data.completionRate || 0, color: '#10B981' },
    { name: 'First-Time Success', value: data.firstTimeSuccessRate || 0, color: '#3B82F6' },
    { name: 'Reassignment', value: data.reassignmentRate || 0, color: '#F59E0B' },
    { name: 'Rejection', value: data.rejectionRate || 0, color: '#EF4444' }
  ];

  function getQualityColor(score) {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  }

  function getQualityLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  return (
    <div className="space-y-6">
      {/* Key Quality Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              (data.completionRate || 0) >= 90 ? 'bg-green-100 text-green-700' :
              (data.completionRate || 0) >= 75 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(data.completionRate || 0) >= 90 ? 'Excellent' :
               (data.completionRate || 0) >= 75 ? 'Good' :
               'Poor'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{(data.completionRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.completedCases || 0} completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              (data.reassignmentRate || 0) < 10 ? 'bg-green-100 text-green-700' :
              (data.reassignmentRate || 0) < 20 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(data.reassignmentRate || 0) < 10 ? 'Low' :
               (data.reassignmentRate || 0) < 20 ? 'Medium' :
               'High'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Reassignment Rate</p>
          <p className="text-2xl font-bold text-gray-900">{(data.reassignmentRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.totalReassignments || 0} reassignments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              (data.rejectionRate || 0) < 10 ? 'bg-green-100 text-green-700' :
              (data.rejectionRate || 0) < 20 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(data.rejectionRate || 0) < 10 ? 'Low' :
               (data.rejectionRate || 0) < 20 ? 'Medium' :
               'High'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Rejection Rate</p>
          <p className="text-2xl font-bold text-gray-900">{(data.rejectionRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.totalRejections || 0} rejections</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              (data.firstTimeSuccessRate || 0) >= 80 ? 'bg-green-100 text-green-700' :
              (data.firstTimeSuccessRate || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {(data.firstTimeSuccessRate || 0) >= 80 ? 'Excellent' :
               (data.firstTimeSuccessRate || 0) >= 60 ? 'Fair' :
               'Poor'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">First-Time Success</p>
          <p className="text-2xl font-bold text-gray-900">{(data.firstTimeSuccessRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Accepted first time</p>
        </div>
      </div>

      {/* Documentation Quality Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Documentation Score Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Documentation Quality Score
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  data={qualityGaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                    fill={qualityGaugeData[0].fill}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold" style={{ color: qualityGaugeData[0].fill }}>
                  {(data.avgDocumentationScore || 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">out of 100</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold" style={{ color: qualityGaugeData[0].fill }}>
                {getQualityLevel(data.avgDocumentationScore || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {data.casesWithCompleteInfo || 0} cases with complete info
              </p>
              <p className="text-sm text-gray-600">
                {data.casesWithIncompleteInfo || 0} cases with incomplete info
              </p>
            </div>
          </div>
        </div>

        {/* Quality Rates Comparison - FIXED */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Rates Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {ratesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time & Issues */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Time to Response</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(data.avgTimeToFirstResponse || 0).toFixed(1)}h
          </p>
          <p className="text-xs text-gray-500 mt-1">Doctor response time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-gray-900">Multiple Reassignments</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {data.casesWithMultipleReassignments || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Cases reassigned 2+ times</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-900">Long Response Time</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {data.casesWithLongResponseTime || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Response &gt; 24 hours</p>
        </div>
      </div>

      {/* Quality Trend */}
      {data.qualityTrend && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Quality Trend
          </h3>
          <div className="flex items-center justify-center space-x-12">
            <div className="text-center">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                data.qualityTrend.direction === 'IMPROVING' ? 'bg-green-100' :
                data.qualityTrend.direction === 'DECLINING' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {data.qualityTrend.direction === 'IMPROVING' ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : data.qualityTrend.direction === 'DECLINING' ? (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                ) : (
                  <span className="text-gray-600">→</span>
                )}
                <span className={`text-2xl font-bold ${
                  data.qualityTrend.direction === 'IMPROVING' ? 'text-green-600' :
                  data.qualityTrend.direction === 'DECLINING' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {data.qualityTrend.direction}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {data.qualityTrend.changePercentage > 0 ? '+' : ''}
                {data.qualityTrend.changePercentage?.toFixed(1)}% {data.qualityTrend.period}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Issues Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Issues Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Needed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Incomplete Documentation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.casesWithIncompleteDocumentation || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {((data.casesWithIncompleteDocumentation || 0) / Math.max(1, (data.casesWithCompleteInfo || 0) + (data.casesWithIncompleteInfo || 0)) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Improve intake forms
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Multiple Reassignments
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.casesWithMultipleReassignments || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(data.reassignmentRate || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (data.reassignmentRate || 0) > 20 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {(data.reassignmentRate || 0) > 20 ? 'High' : 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Review matching algorithm
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  High Rejections
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.totalRejections || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(data.rejectionRate || 0).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (data.rejectionRate || 0) > 20 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(data.rejectionRate || 0) > 20 ? 'High' : 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Improve case screening
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Slow Response Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {data.casesWithLongResponseTime || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  N/A
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Monitor doctor availability
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Quality Improvement Recommendations</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          {(data.avgDocumentationScore || 0) < 80 && (
            <li>📝 Documentation quality is below 80%. Implement mandatory field validation on case submission.</li>
          )}
          {(data.reassignmentRate || 0) > 15 && (
            <li>🔄 High reassignment rate ({(data.reassignmentRate || 0).toFixed(1)}%). Review doctor-case matching algorithm.</li>
          )}
          {(data.rejectionRate || 0) > 15 && (
            <li>❌ High rejection rate ({(data.rejectionRate || 0).toFixed(1)}%). Improve initial case screening process.</li>
          )}
          {(data.firstTimeSuccessRate || 0) < 70 && (
            <li>✅ Low first-time success rate. Enhance case assessment before assignment.</li>
          )}
          {(data.avgTimeToFirstResponse || 0) > 12 && (
            <li>⏰ Average response time exceeds 12 hours. Consider doctor availability incentives.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QualityTab;