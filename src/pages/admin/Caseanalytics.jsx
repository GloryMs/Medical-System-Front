import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Activity,
  Users,
  Stethoscope,
  BarChart3,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useUI } from '../../hooks/useUI';
import adminService from '../../services/api/adminService';

// Tab Components
import OverviewTab from './analyticsComponents/OverviewTab';
import PerformanceTab from './analyticsComponents/PerformanceTab';
import DoctorsTab from './analyticsComponents/DoctorsTab';
import SpecializationsTab from './analyticsComponents/SpecializationsTab';
import TrendsTab from './analyticsComponents/TrendsTab';
import QualityTab from './analyticsComponents/QualityTab';

const CaseAnalytics = () => {
  const navigate = useNavigate();
  const { execute, loading } = useApi();
  const { showToast } = useUI();

  // State
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'specializations', label: 'Specializations', icon: Stethoscope },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'quality', label: 'Quality', icon: Award }
  ];

  // Date range presets
  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Load analytics on mount and when date range changes
  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let start, end = now.toISOString();

    switch (dateRange) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last3months':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last6months':
        start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'lastyear':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'custom':
        start = customStartDate ? new Date(customStartDate).toISOString() : null;
        end = customEndDate ? new Date(customEndDate).toISOString() : end;
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { start, end };
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const { start, end } = getDateRange();

      const response = await execute(() => 
        adminService.getCaseAnalytics(start, end)
      );

      if (response) {
        setAnalytics(response);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Export analytics
  const handleExport = async (format) => {
    try {
      showToast(`Exporting analytics as ${format.toUpperCase()}...`, 'info');
      // TODO: Implement export functionality
    } catch (error) {
      showToast('Failed to export analytics', 'error');
    }
  };

  // Go back to case management
  const handleBack = () => {
    navigate('/admin/cases');
  };

  // Render active tab content
  const renderTabContent = () => {
    if (!analytics) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={analytics.overview} />;
      case 'performance':
        return <PerformanceTab data={analytics.performance} />;
      case 'doctors':
        return <DoctorsTab data={analytics.doctorMetrics} />;
      case 'specializations':
        return <SpecializationsTab data={analytics.specializationMetrics} />;
      case 'trends':
        return <TrendsTab data={analytics.trends} />;
      case 'quality':
        return <QualityTab data={analytics.qualityMetrics} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Title and Back Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBack}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Case Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive analytics and insights for case management
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
                onClick={loadAnalytics}
                disabled={refreshing}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleExport('pdf')}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Cases Analyzed */}
            {analytics && (
              <div className="text-sm text-gray-600 ml-auto">
                <span className="font-medium">{analytics.totalCasesAnalyzed}</span> cases analyzed
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-t border-gray-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CaseAnalytics;