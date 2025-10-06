import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  Download,
  FileDown,
  Edit,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import doctorService from '../../services/api/doctorService';

const ViewReport = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await doctorService.getConsultationReportById(reportId);
        setReport(response);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await doctorService.exportReportToPdf(reportId);
      if (response.data?.success) {
        alert('Report exported to PDF successfully!');
        fetchReport(); // Refresh to show PDF link
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please ensure all required fields are filled.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (report.pdfFileLink) {
      window.open(report.pdfFileLink, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'DRAFT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4" />
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4" />
        Finalized
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">{error || 'Report not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isDraft = report.status === 'DRAFT';
  const isFinalized = report.status === 'FINALIZED';

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/doctor/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Consultation Report #{reportId}
              </h1>
              <p className="text-gray-600">Case ID: #{report.caseId}</p>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {isDraft && (
          <>
            <button
              onClick={() => navigate(`/app/doctor/reports/${reportId}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Report
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Export to PDF
                </>
              )}
            </button>
          </>
        )}

        {isFinalized && report.pdfFileLink && (
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Metadata Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem
              icon={<Calendar className="w-5 h-5 text-gray-500" />}
              label="Created On"
              value={formatDate(report.createdAt)}
            />
            <InfoItem
              icon={<Activity className="w-5 h-5 text-gray-500" />}
              label="Last Updated"
              value={formatDate(report.updatedAt)}
            />
            {isFinalized && report.exportedAt && (
              <InfoItem
                icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                label="Exported On"
                value={formatDate(report.exportedAt)}
              />
            )}
          </div>
        </div>

        {/* Doctor Information */}
        {report.doctor && (
          <Section title="Attending Physician" icon={<User className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="Name" value={report.doctor.fullName} />
              <DataField label="License Number" value={report.doctor.licenseNumber} />
              <DataField label="Specialization" value={report.doctor.primarySpecialization} />
              {report.doctor.hospitalAffiliation && (
                <DataField label="Affiliation" value={report.doctor.hospitalAffiliation} />
              )}
            </div>
          </Section>
        )}

        {/* Appointment Information */}
        {report.appointment && (
          <Section title="Consultation Details" icon={<Calendar className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="Appointment ID" value={`#${report.appointment.id}`} />
              <DataField 
                label="Date & Time" 
                value={formatDate(report.appointment.scheduledTime)} 
              />
              <DataField label="Duration" value={`${report.appointment.duration} minutes`} />
              <DataField label="Type" value={report.appointment.consultationType} />
            </div>
          </Section>
        )}

        {/* Medical Findings */}
        <Section title="Medical Findings" icon={<FileText className="w-6 h-6" />}>
          {report.diagnosis && (
            <ContentBlock title="Diagnosis" content={report.diagnosis} />
          )}
          {report.prescriptions && (
            <ContentBlock title="Prescriptions" content={report.prescriptions} />
          )}
        </Section>

        {/* Recommendations */}
        <Section title="Recommendations & Follow-up" icon={<Activity className="w-6 h-6" />}>
          {report.recommendations && (
            <ContentBlock title="Medical Recommendations" content={report.recommendations} />
          )}
          {report.followUpInstructions && (
            <ContentBlock title="Follow-up Instructions" content={report.followUpInstructions} />
          )}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField 
                label="Follow-up Required" 
                value={report.requiresFollowUp ? 'Yes' : 'No'}
                highlight={report.requiresFollowUp}
              />
              {report.requiresFollowUp && report.nextAppointmentSuggested && (
                <DataField 
                  label="Next Appointment" 
                  value={formatDate(report.nextAppointmentSuggested)}
                  highlight
                />
              )}
            </div>
          </div>
        </Section>

        {/* Doctor's Notes */}
        {report.doctorNotes && (
          <Section title="Doctor's Notes (Private)" icon={<FileText className="w-6 h-6" />}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.doctorNotes}</p>
            </div>
          </Section>
        )}

        {/* PDF Link */}
        {isFinalized && report.pdfFileLink && (
          <div className="p-6 border-t border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">PDF Available</p>
                  <p className="text-sm text-gray-600">
                    This report has been finalized and exported to PDF
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Draft Notice */}
      {isDraft && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Draft Report</h3>
          <p className="text-sm text-blue-800">
            This report is in draft status. You can continue editing until you export it to PDF. 
            Once exported, the report becomes finalized and cannot be modified.
          </p>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const Section = ({ title, icon, children }) => (
  <div className="p-6 border-b border-gray-200 last:border-b-0">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-blue-600">{icon}</div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    {icon}
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const DataField = ({ label, value, highlight }) => (
  <div className={`${highlight ? 'p-3 bg-blue-50 rounded-lg' : ''}`}>
    <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
    <p className={`text-sm ${highlight ? 'text-blue-900 font-semibold' : 'text-gray-600'}`}>
      {value || 'N/A'}
    </p>
  </div>
);

const ContentBlock = ({ title, content }) => (
  <div className="mb-4">
    <h3 className="text-sm font-bold text-gray-700 mb-2">{title}</h3>
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

export default ViewReport;