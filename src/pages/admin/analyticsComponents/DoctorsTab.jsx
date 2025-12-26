import React from 'react';
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CHART_COLORS } from './config/chartcolors'

const DoctorsTab = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor metrics...</p>
        </div>
      </div>
    );
  }

  // Workload distribution data
  const workloadData = Object.entries(data.casesByDoctor || {})
    .map(([doctor, count]) => ({
      doctor: doctor.length > 20 ? doctor.substring(0, 20) + '...' : doctor,
      cases: count
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10); // Top 10

  // Utilization pie chart
  const utilizationData = [
    { name: 'Under-utilized', value: data.utilization?.underutilizedCount || 0, color: '#EF4444' },
    { name: 'Optimal', value: data.utilization?.optimalCount || 0, color: '#10B981' },
    { name: 'Over-utilized', value: data.utilization?.overutilizedCount || 0, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Active Doctors</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalActiveDoctors || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Handling cases</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Award className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Acceptance</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgAcceptanceRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Cases accepted</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Rejection</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgRejectionRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Cases rejected</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Avg Cases/Doctor</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(data.avgCasesPerDoctor || 0).toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">Current average</p>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Top 5 Performers
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acceptance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Resolution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.topPerformers || []).map((doctor, index) => (
                <tr key={doctor.doctorId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.doctorName}</div>
                    <div className="text-xs text-gray-500">ID: {doctor.doctorId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.totalAssignments}</div>
                    <div className="text-xs text-gray-500">{doctor.completedCases} completed</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.acceptanceRate?.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${doctor.acceptanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.avgResolutionTime?.toFixed(1)} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      doctor.performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
                      doctor.performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
                      doctor.performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.performanceLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Performers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Bottom 5 Performers (Needs Attention)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acceptance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejection Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(data.bottomPerformers || []).map((doctor) => (
                <tr key={doctor.doctorId} className="hover:bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.doctorName}</div>
                    <div className="text-xs text-gray-500">ID: {doctor.doctorId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.totalAssignments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      doctor.acceptanceRate >= 75 ? 'bg-green-100 text-green-800' :
                      doctor.acceptanceRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.acceptanceRate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      doctor.rejectionRate < 10 ? 'bg-green-100 text-green-800' :
                      doctor.rejectionRate < 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doctor.rejectionRate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-1">
                      {doctor.acceptanceRate < 60 && (
                        <span className="inline-flex px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                          Low acceptance
                        </span>
                      )}
                      {doctor.reassignmentCount > 5 && (
                        <span className="inline-flex px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                          High reassignment
                        </span>
                      )}
                      {doctor.avgResolutionTime > 7 && (
                        <span className="inline-flex px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                          Slow resolution
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Workload Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload Distribution (Top 10)</h3>
          {workloadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="doctor" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="cases" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No workload data available
            </div>
          )}
        </div>

        {/* Utilization Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Utilization</h3>
          {utilizationData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    Under-utilized (&lt;5 cases)
                  </span>
                  <span className="font-medium">{data.utilization?.underutilizedCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    Optimal (5-15 cases)
                  </span>
                  <span className="font-medium">{data.utilization?.optimalCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    Over-utilized (&gt;15 cases)
                  </span>
                  <span className="font-medium">{data.utilization?.overutilizedCount || 0}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No utilization data available
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">💡 Recommendations</h4>
        <ul className="space-y-1 text-sm text-yellow-800">
          {data.utilization?.overutilizedCount > 0 && (
            <li>⚠️ {data.utilization.overutilizedCount} doctor(s) are over-utilized. Consider redistributing workload.</li>
          )}
          {data.utilization?.underutilizedCount > 0 && (
            <li>📊 {data.utilization.underutilizedCount} doctor(s) are under-utilized. Increase case assignments.</li>
          )}
          {data.avgRejectionRate > 20 && (
            <li>🔍 High rejection rate ({data.avgRejectionRate.toFixed(1)}%). Review case assignment matching logic.</li>
          )}
          {data.bottomPerformers && data.bottomPerformers.length > 0 && (
            <li>👥 Provide additional training or support to bottom performers.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DoctorsTab;