import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import doctorService from '../../services/api/doctorService';

const ReportsListPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    finalized: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, searchTerm]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorService.getConsultationReports();
        const reportsData = response;
        setReports(reportsData);
        
        // Calculate statistics
        const draftCount = reportsData.filter(r => r.status === 'DRAFT').length;
        const finalizedCount = reportsData.filter(r => r.status === 'FINALIZED').length;
        
        setStats({
          total: reportsData.length,
          draft: draftCount,
          finalized: finalizedCount
        });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.id.toString().includes(search) ||
        report.caseId.toString().includes(search) ||
        report.diagnosis?.toLowerCase().includes(search) ||
        report.doctor?.fullName?.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  };

  const handleExportPdf = async (reportId) => {
    try {
      const response = await doctorService.exportReportToPdf(reportId);
      if (response.data?.success) {
        alert('Report exported to PDF successfully!');
        fetchReports(); // Refresh to show updated status
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleDownloadPdf = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
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

  if (loading) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Reports</h1>
        <p className="text-gray-600">Manage and view your medical consultation reports</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
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

          {/* Status Filter */}
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
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
          {filteredReports.map((report) => (
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
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600'
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
        {/* Header */}
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

        {/* Content Preview */}
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

        {/* Doctor Info */}
        {report.doctor && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
            <User className="w-4 h-4" />
            <span>{report.doctor.fullName}</span>
            {report.doctor.primarySpecialization && (
              <span className="text-gray-400">• {report.doctor.primarySpecialization}</span>
            )}
          </div>
        )}

        {/* Actions */}
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Export to PDF
              </button>
            </>
          )}

          {isFinalized && report.pdfFileLink && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>

        {/* Export Info */}
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

export default ReportsListPage;