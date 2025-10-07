import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  User,
  Calendar,
  Stethoscope,
  Clock
} from 'lucide-react';
import doctorService from '../../services/api/doctorService';

const CreateReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get caseId from either URL query params or navigation state
  const searchParams = new URLSearchParams(location.search);
  const caseIdFromUrl = searchParams.get('caseId');
  const navigationState = location.state;
  
  // Determine caseId from either source
  const initialCaseId = caseIdFromUrl || navigationState?.caseId || '';
  
  const [caseId, setCaseId] = useState(initialCaseId);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loadingCase, setLoadingCase] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendations: '',
    prescriptions: '',
    followUpInstructions: '',
    requiresFollowUp: false,
    nextAppointmentSuggested: '',
    doctorNotes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load case details when component mounts or caseId changes
  useEffect(() => {
    if (caseId) {
      loadCaseDetailsForReport(caseId);
    }
  }, [caseId]);

  /**
   * Load case details using the new unified API endpoint
   */
  const loadCaseDetailsForReport = async (id) => {
    setLoadingCase(true);
    setError('');
    try {
      const response = await doctorService.getCaseDetailsForMedicalReport(id);
      
      // Check if response indicates success
      if (response?.success === false) {
        setError(response.message || 'Failed to load case details');
        setCaseDetails(null);
        return;
      }
      
      // Extract data from response
      const caseData = response?.data || response;
      
      if (!caseData) {
        setError('No case data found');
        setCaseDetails(null);
        return;
      }
      
      setCaseDetails(caseData);
      
      // Pre-populate case description if available
      if (caseData.caseDescription) {
        setFormData(prev => ({ 
          ...prev, 
          doctorNotes: `Case Description: ${caseData.caseDescription}`
        }));
      }
      
    } catch (err) {
      console.error('Error loading case details:', err);
      setError(
        err.response?.data?.message || 
        'Failed to load case details. Please check the case ID and try again.'
      );
      setCaseDetails(null);
    } finally {
      setLoadingCase(false);
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

  const handleCaseIdChange = (e) => {
    setCaseId(e.target.value);
  };

  const handleLoadCase = () => {
    if (caseId.trim()) {
      loadCaseDetailsForReport(caseId);
    } else {
      setError('Please enter a case ID');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!caseId || caseId.trim() === '') {
      errors.caseId = 'Case ID is required';
    }
    
    if (!formData.diagnosis || formData.diagnosis.trim().length < 10) {
      errors.diagnosis = 'Diagnosis must be at least 10 characters';
    }
    
    if (!formData.recommendations || formData.recommendations.trim().length < 10) {
      errors.recommendations = 'Recommendations must be at least 10 characters';
    }

    if (formData.requiresFollowUp && !formData.followUpInstructions?.trim()) {
      errors.followUpInstructions = 'Follow-up instructions required when follow-up is needed';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    if (!caseDetails) {
      setError('Please load a valid case before creating the report');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare report data using caseDetails structure
      const reportData = {
        appointmentId: caseDetails.appointmentId,
        doctorId: caseDetails.doctorId,
        caseId: caseDetails.caseId,
        doctorName: caseDetails.doctorName,
        patientName: caseDetails.patientName,
        patientId: caseDetails.patientId,
        diagnosis: formData.diagnosis.trim(),
        recommendations: formData.recommendations.trim(),
        prescriptions: formData.prescriptions.trim() || null,
        followUpInstructions: formData.followUpInstructions.trim() || null,
        requiresFollowUp: formData.requiresFollowUp,
        nextAppointmentSuggested: formData.nextAppointmentSuggested || null,
        doctorNotes: formData.doctorNotes.trim() || null,
        status: 'DRAFT' // Always create as DRAFT
      };

      await doctorService.createConsultationReport(reportData);
      
      setSuccess('Consultation report created successfully as DRAFT!');
      
      // Navigate back to reports list after a short delay
      setTimeout(() => {
        navigate('/app/doctor/reports');
      }, 1000);
      
    } catch (err) {
      console.error('Error creating report:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/app/doctor/reports');
    }
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/doctor/reports')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Consultation Report</h1>
        <p className="text-gray-600">Fill in the consultation details to create a new medical report</p>
      </div>

      {/* Case Selection/Loading Section - Only show if no caseId provided */}
      {!initialCaseId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Case</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={caseId}
                onChange={handleCaseIdChange}
                placeholder="Enter Case ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleLoadCase}
              disabled={loadingCase}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loadingCase ? 'Loading...' : 'Load Case'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingCase && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading case details...</p>
          </div>
        </div>
      )}

      {/* Case Information Card - Always at the top when case is loaded */}
      {caseDetails && !loadingCase && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                Case Information
                <span className="text-sm font-normal text-gray-600">
                  (ID: #{caseDetails.caseId})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Information */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Patient</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {caseDetails.patientName || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Doctor</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {caseDetails.doctorName || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Appointment ID */}
                {caseDetails.appointmentId && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Appointment ID</span>
                      <span className="text-sm font-semibold text-gray-900">
                        #{caseDetails.appointmentId}
                      </span>
                    </div>
                  </div>
                )}

                {/* Specialization */}
                {caseDetails.caseRequiredSpecialization && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Specialization</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {caseDetails.caseRequiredSpecialization}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submitted Date */}
                {caseDetails.caseSubmittedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Submitted</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatDate(caseDetails.caseSubmittedAt)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Case Title */}
                {caseDetails.caseTitle && (
                  <div className="col-span-2 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Case Title</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {caseDetails.caseTitle}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Case Description */}
              {caseDetails.caseDescription && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-500 mb-2">Case Description:</p>
                  <p className="text-sm text-gray-800 bg-white rounded p-3 border border-blue-100">
                    {caseDetails.caseDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Form - Only show if case details are loaded */}
      {caseDetails && !loadingCase && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={4}
                placeholder="Enter the primary diagnosis and any secondary conditions..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.diagnosis ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.diagnosis && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.diagnosis}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.diagnosis.length} / 500 characters (minimum 10)
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommendations <span className="text-red-500">*</span>
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                rows={4}
                placeholder="General recommendations for the patient..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.recommendations ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.recommendations && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.recommendations}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.recommendations.length} / 2000 characters (minimum 10)
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
                rows={4}
                placeholder="List prescribed medications with dosage and duration..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.prescriptions.length} / 2000 characters
              </p>
            </div>

            {/* Follow-up Required Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="requiresFollowUp"
                checked={formData.requiresFollowUp}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-3 block text-sm font-medium text-gray-700">
                This case requires follow-up
              </label>
            </div>

            {/* Follow-up Instructions - Show only if follow-up is required */}
            {formData.requiresFollowUp && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Follow-up Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="followUpInstructions"
                    value={formData.followUpInstructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="When and how the patient should follow up..."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.followUpInstructions ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.followUpInstructions && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.followUpInstructions}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.followUpInstructions.length} / 1000 characters
                  </p>
                </div>

                {/* Next Appointment Suggested */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Suggested Next Appointment Date
                  </label>
                  <input
                    type="datetime-local"
                    name="nextAppointmentSuggested"
                    value={formData.nextAppointmentSuggested}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Suggest a date/time for the next appointment
                  </p>
                </div>
              </>
            )}

            {/* Doctor Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor's Private Notes
              </label>
              <textarea
                name="doctorNotes"
                value={formData.doctorNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Private notes for your reference (not visible to patient)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.doctorNotes.length} / 10000 characters
              </p>
            </div>

          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Report (Draft)
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Important Information
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>The report will be saved as a DRAFT and can be edited later</li>
          <li>You can export the report to PDF once all required fields are complete</li>
          <li>After exporting to PDF, the report becomes FINALIZED and cannot be edited</li>
          <li>All fields marked with <span className="text-red-500">*</span> are mandatory</li>
          <li>If follow-up is required, follow-up instructions become mandatory</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateReport;