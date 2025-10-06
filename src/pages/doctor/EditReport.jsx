import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Lock,
  Edit
} from 'lucide-react';
import doctorService from '../../services/api/doctorService';

const EditReport = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [report, setReport] = useState(null);

  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendations: '',
    prescriptions: '',
    followUpInstructions: '',
    requiresFollowUp: false,
    nextAppointmentSuggested: '',
    doctorNotes: ''
  });

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

        const reportData = response;
        setReport(reportData);

        // Check if report is finalized
        if (reportData.status === 'FINALIZED') {
          setError('This report has been finalized and cannot be edited. You can view it in read-only mode.');
          setTimeout(() => {
            navigate(`/app/doctor/reports/${reportId}`);
          }, 3000);
          return;
        }

        // Populate form
        setFormData({
          diagnosis: reportData.diagnosis || '',
          recommendations: reportData.recommendations || '',
          prescriptions: reportData.prescriptions || '',
          followUpInstructions: reportData.followUpInstructions || '',
          requiresFollowUp: reportData.requiresFollowUp || false,
          nextAppointmentSuggested: reportData.nextAppointmentSuggested 
            ? new Date(reportData.nextAppointmentSuggested).toISOString().slice(0, 16)
            : '',
          doctorNotes: reportData.doctorNotes || ''
        });
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.diagnosis && formData.diagnosis.length > 5000) {
      errors.diagnosis = 'Diagnosis cannot exceed 5000 characters';
    }
    if (formData.recommendations && formData.recommendations.length > 5000) {
      errors.recommendations = 'Recommendations cannot exceed 5000 characters';
    }
    if (formData.prescriptions && formData.prescriptions.length > 5000) {
      errors.prescriptions = 'Prescriptions cannot exceed 5000 characters';
    }
    if (formData.followUpInstructions && formData.followUpInstructions.length > 3000) {
      errors.followUpInstructions = 'Follow-up instructions cannot exceed 3000 characters';
    }
    if (formData.doctorNotes && formData.doctorNotes.length > 10000) {
      errors.doctorNotes = 'Doctor notes cannot exceed 10000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations,
        prescriptions: formData.prescriptions,
        followUpInstructions: formData.followUpInstructions,
        requiresFollowUp: formData.requiresFollowUp,
        nextAppointmentSuggested: formData.nextAppointmentSuggested 
          ? new Date(formData.nextAppointmentSuggested).toISOString()
          : null,
        doctorNotes: formData.doctorNotes
      };

      const response = await doctorService.updateConsultationReport(reportId, updateData);

      if (response.data?.success) {
        setSuccess('Report updated successfully!');
        setTimeout(() => {
          navigate('/app/doctor/reports');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating report:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update report. The report may have been finalized.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/app/doctor/reports');
    }
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

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">Report not found or you don't have permission to edit it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/doctor/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>
        <div className="flex items-center gap-3">
          <Edit className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Consultation Report</h1>
            <p className="text-gray-600">Report ID: #{reportId} • Case ID: #{report.caseId}</p>
          </div>
        </div>
      </div>

      {/* Status Warning */}
      {report.status === 'FINALIZED' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <Lock className="text-yellow-500 w-5 h-5 mr-3" />
            <div>
              <p className="font-semibold text-yellow-800">Report Finalized</p>
              <p className="text-yellow-700 text-sm">
                This report has been exported to PDF and is now locked for editing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={5}
              placeholder="Enter the primary diagnosis and any secondary conditions..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.diagnosis ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.diagnosis && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.diagnosis}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.diagnosis.length} / 5000 characters
            </p>
          </div>

          {/* Prescriptions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prescriptions
            </label>
            <textarea
              name="prescriptions"
              value={formData.prescriptions}
              onChange={handleChange}
              rows={5}
              placeholder="List medications, dosages, and instructions..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.prescriptions ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.prescriptions && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.prescriptions}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.prescriptions.length} / 5000 characters
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medical Recommendations
            </label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={5}
              placeholder="Enter treatment recommendations and care instructions..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.recommendations ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.recommendations && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.recommendations}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.recommendations.length} / 5000 characters
            </p>
          </div>

          {/* Follow-up Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Follow-up Instructions
            </label>
            <textarea
              name="followUpInstructions"
              value={formData.followUpInstructions}
              onChange={handleChange}
              rows={4}
              placeholder="Enter specific instructions for follow-up care..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.followUpInstructions ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.followUpInstructions && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.followUpInstructions}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.followUpInstructions.length} / 3000 characters
            </p>
          </div>

          {/* Follow-up Required */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="requiresFollowUp"
              checked={formData.requiresFollowUp}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Follow-up Appointment Required
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Check this if the patient needs a follow-up consultation
              </p>
            </div>
          </div>

          {/* Next Appointment Date (conditional) */}
          {formData.requiresFollowUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suggested Next Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                name="nextAppointmentSuggested"
                value={formData.nextAppointmentSuggested}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Doctor Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Doctor's Notes (Private)
            </label>
            <textarea
              name="doctorNotes"
              value={formData.doctorNotes}
              onChange={handleChange}
              rows={6}
              placeholder="Add any additional notes or updates..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.doctorNotes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.doctorNotes && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.doctorNotes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.doctorNotes.length} / 10000 characters
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Note: New notes will be appended with a timestamp to existing notes
            </p>
          </div>

        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {report.updatedAt ? new Date(report.updatedAt).toLocaleString() : 'N/A'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || report.status === 'FINALIZED'}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditReport;