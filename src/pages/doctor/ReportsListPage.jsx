import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Download, 
  FileDown,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ClipboardList,
  RefreshCw
} from 'lucide-react';
import useReports from '../../hooks/useReports';

/**
 * ALTERNATIVE IMPLEMENTATION using custom hook
 * This version is cleaner and separates business logic from UI
 */
const ReportsListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  
  // Use custom hook for all data management
  const {
    // Data
    filteredReports,
    filteredPendingCases,
    reportsLoading,
    pendingLoading,
    reportsError,
    pendingError,
    stats,
    
    // Filters
    reportSearchTerm,
    setReportSearchTerm,
    statusFilter,
    setStatusFilter,
    caseSearchTerm,
    setCaseSearchTerm,
    
    // Methods
    refreshAll,
    exportReportToPdf,
  } = useReports();

  const handleExportPdf = async (reportId) => {
    const result = await exportReportToPdf(reportId);
    alert(result.message);
  };

  const handleDownloadPdf = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  // const handleCreateReport = (caseId) => {
  //   navigate(`/app/doctor/reports/create?caseId=${caseId}`);
  // };

  const handleCreateReport = (caseId) => {
    // Navigate with caseId in URL query parameter
    // This matches the unified approach where CreateReport.jsx reads from URL or state
    navigate(`/app/doctor/reports/create?caseId=${caseId}`);
  };

  const handleRefresh = () => {
    refreshAll();
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
        label: 'Draft'
      },
      FINALIZED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Finalized'
      },
      CONSULTATION_COMPLETE: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <ClipboardList className="w-4 h-4" />,
        label: 'Consultation Complete'
      }
    };

    const badge = badges[status] || badges.DRAFT;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      LOW: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' }
    };

    const badge = badges[urgency] || badges.MEDIUM;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (reportsLoading && activeTab === 'reports') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Reports Management</h1>
          <p className="text-gray-600">Manage consultation reports and create reports for completed cases</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reports"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Draft Reports"
          value={stats.draft}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Finalized Reports"
          value={stats.finalized}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending Cases"
          value={stats.pendingCases}
          icon={<ClipboardList className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Reports List</span>
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {stats.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                <span>Pending Cases Reports</span>
                <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingCases}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'reports' ? (
            <ReportsTabContent
              reports={filteredReports}
              loading={reportsLoading}
              error={reportsError}
              searchTerm={reportSearchTerm}
              setSearchTerm={setReportSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              navigate={navigate}
              handleExportPdf={handleExportPdf}
              handleDownloadPdf={handleDownloadPdf}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          ) : (
            <PendingCasesTabContent
              cases={filteredPendingCases}
              loading={pendingLoading}
              error={pendingError}
              searchTerm={caseSearchTerm}
              setSearchTerm={setCaseSearchTerm}
              handleCreateReport={handleCreateReport}
              getStatusBadge={getStatusBadge}
              getUrgencyBadge={getUrgencyBadge}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Reports Tab Content Component (same as before)
const ReportsTabContent = ({
  reports,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  navigate,
  handleExportPdf,
  handleDownloadPdf,
  getStatusBadge,
  formatDate
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by report ID, case ID, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your filters or search terms'
              : 'You haven\'t created any consultation reports yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={() => navigate(`/app/doctor/reports/${report.id}`)}
              onEdit={() => navigate(`/app/doctor/reports/${report.id}/edit`)}
              onExport={() => handleExportPdf(report.id)}
              onDownload={() => handleDownloadPdf(report.pdfFileLink)}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Pending Cases Tab Content Component (same as before)
const PendingCasesTabContent = ({
  cases,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  handleCreateReport,
  getStatusBadge,
  getUrgencyBadge,
  formatDate
}) => {
  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by case ID, patient name, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pending cases...</p>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Cases</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'No cases match your search criteria'
              : 'All consultations are complete with reports created'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cases.map((caseItem) => (
            <PendingCaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onCreateReport={() => handleCreateReport(caseItem.id)}
              getStatusBadge={getStatusBadge}
              getUrgencyBadge={getUrgencyBadge}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ report, onView, onEdit, onExport, onDownload, getStatusBadge, formatDate }) => {
  const isDraft = report.status === 'DRAFT';
  const isFinalized = report.status === 'FINALIZED';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Report #{report.id}
              </h3>
              {getStatusBadge(report.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Case #{report.caseId}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(report.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {report.diagnosis && (
            <div>
              <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{report.diagnosis}</p>
            </div>
          )}
          {report.recommendations && (
            <div>
              <p className="text-sm font-medium text-gray-700">Recommendations:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{report.recommendations}</p>
            </div>
          )}
        </div>

        {report.doctor && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
            <User className="w-4 h-4" />
            <span>{report.doctor.fullName}</span>
            {report.doctor.primarySpecialization && (
              <span className="text-gray-400">• {report.doctor.primarySpecialization}</span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onView}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {isDraft && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export to PDF
              </button>
            </>
          )}

          {isFinalized && report.pdfFileLink && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>

        {isFinalized && report.exportedAt && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Exported on {formatDate(report.exportedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Pending Case Card Component
const PendingCaseCard = ({ caseItem, onCreateReport, getStatusBadge, getUrgencyBadge, formatDate }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Case #{caseItem.id}
              </h3>
              {getStatusBadge(caseItem.status)}
              {getUrgencyBadge(caseItem.urgencyLevel)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {caseItem.patientName || 'Patient'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(caseItem.submittedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {caseItem.description && (
            <div>
              <p className="text-sm font-medium text-gray-700">Description:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{caseItem.description}</p>
            </div>
          )}
          {caseItem.diagnosis && (
            <div>
              <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
              <p className="text-sm text-gray-600 line-clamp-2">{caseItem.diagnosis}</p>
            </div>
          )}
          {caseItem.specialization && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Specialization:</span>
              <span className="text-gray-600">{caseItem.specialization}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={onCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors "
          >
            <Plus className="w-4 h-4" />
            Create Medical Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsListPage;