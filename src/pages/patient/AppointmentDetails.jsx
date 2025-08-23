import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MessageSquare,
  FileText,
  Download,
  Star,
  MapPin,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  Pause,
  ExternalLink,
  Edit,
  Share,
  Printer,
  Mail,
  Copy,
  RefreshCw,
  Heart,
  Pill,
  ClipboardList,
  Stethoscope,
  Activity,
  Bell,
  Settings,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  Info,
  X,
  Plus
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

// Validation schemas
const feedbackSchema = yup.object({
  rating: yup.number().required('Rating is required').min(1).max(5),
  feedback: yup.string().required('Feedback is required'),
  recommendation: yup.boolean()
});

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  // State management
  const [appointment, setAppointment] = useState(null);
  const [consultationReport, setConsultationReport] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form setup
  const feedbackForm = useForm({
    resolver: yupResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      feedback: '',
      recommendation: true
    }
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails();
    }
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      const data = await execute(() => patientService.getAppointmentById(appointmentId));
      setAppointment(data);
      
      // Load consultation report if available
      if (data.consultationReportId) {
        const report = await execute(() => patientService.getConsultationReportById(data.consultationReportId));
        setConsultationReport(report);
      }
    } catch (error) {
      console.error('Failed to load appointment details:', error);
    }
  };

  const handleJoinMeeting = async () => {
    setIsJoiningMeeting(true);
    try {
      // Track appointment join
      await execute(() => patientService.joinAppointment(appointmentId));
      
      // Open meeting link
      if (appointment.meetingLink) {
        window.open(appointment.meetingLink, '_blank');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
    } finally {
      setIsJoiningMeeting(false);
    }
  };

  const handleSubmitFeedback = async (data) => {
    try {
      await execute(() => patientService.submitAppointmentFeedback(appointmentId, data));
      setShowFeedbackModal(false);
      await loadAppointmentDetails();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleComplaint = async (complaintData) => {
    try {
      await execute(() => patientService.createComplaint({
        ...complaintData,
        appointmentId: appointmentId,
        doctorId: appointment.doctor.id
      }));
      setShowComplaintModal(false);
    } catch (error) {
      console.error('Failed to submit complaint:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Video className="w-5 h-5" />;
    }
  };

  const canJoinConsultation = () => {
    if (!appointment) return false;
    
    const appointmentTime = new Date(appointment.scheduledTime);
    const timeDiff = appointmentTime - currentTime;
    
    return appointment.status?.toLowerCase() === 'confirmed' && 
           timeDiff <= 900000 && // 15 minutes before
           timeDiff >= -1800000; // 30 minutes after
  };

  const getTimeUntilAppointment = () => {
    if (!appointment) return '';
    
    const appointmentTime = new Date(appointment.scheduledTime);
    const timeDiff = appointmentTime - currentTime;
    
    if (timeDiff <= 0) {
      return 'Started';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'case', label: 'Case Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'doctor', label: 'Doctor Info', icon: <User className="w-4 h-4" /> },
    { id: 'report', label: 'Report', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Activity className="w-4 h-4" /> }
  ];

  if (loading && !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment Not Found</h3>
          <p className="text-gray-600 mb-4">The requested appointment could not be found.</p>
          <Button onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Appointment Details
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(appointment.scheduledTime)} at {formatTime(appointment.scheduledTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StatusBadge status={appointment.status} />
                
                {/* Join Meeting Button */}
                {canJoinConsultation() && (
                  <Button
                    variant="primary"
                    icon={<PlayCircle className="w-4 h-4" />}
                    onClick={handleJoinMeeting}
                    loading={isJoiningMeeting}
                    className="animate-pulse"
                  >
                    Join Now
                  </Button>
                )}

                {/* Actions Menu */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={loadAppointmentDetails}
                  >
                    Refresh
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Share className="w-4 h-4" />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Actions Card */}
            {appointment.status?.toLowerCase() !== 'completed' && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getConsultationTypeIcon(appointment.consultationType)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {canJoinConsultation() ? 'Ready to Join' : `Starts in ${getTimeUntilAppointment()}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.consultationType} consultation with Dr. {appointment.doctor?.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {canJoinConsultation() ? (
                        <Button
                          variant="primary"
                          icon={<PlayCircle className="w-4 h-4" />}
                          onClick={handleJoinMeeting}
                          loading={isJoiningMeeting}
                        >
                          Join Consultation
                        </Button>
                      ) : appointment.status?.toLowerCase() === 'confirmed' ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {getTimeUntilAppointment()}
                          </div>
                          <div className="text-xs text-gray-600">remaining</div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          icon={<Bell className="w-4 h-4" />}
                        >
                          Set Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Tab Navigation */}
            <Card className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Date & Time</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(appointment.scheduledTime)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTime(appointment.scheduledTime)} ({appointment.duration || 30} min)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Consultation Fee</p>
                            <p className="font-medium text-gray-900">
                              ${appointment.consultationFee}
                            </p>
                            <p className="text-sm text-gray-600">
                              Payment {appointment.paymentStatus?.toLowerCase() || 'completed'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          {getConsultationTypeIcon(appointment.consultationType)}
                          <div>
                            <p className="text-sm text-gray-600">Consultation Type</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {appointment.consultationType} Call
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Related Case</p>
                            <Link 
                              to={`/patient/cases/${appointment.caseId}`}
                              className="font-medium text-primary-600 hover:text-primary-700"
                            >
                              Case #{appointment.caseId}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Appointment Notes</h4>
                        <p className="text-gray-700">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.rescheduleCount > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            This appointment has been rescheduled {appointment.rescheduleCount} time(s)
                          </span>
                        </div>
                        {appointment.rescheduleReason && (
                          <p className="text-sm text-yellow-700 mt-2">
                            Reason: {appointment.rescheduleReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Case Details Tab */}
                {activeTab === 'case' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Case Information</h3>
                      <Link to={`/patient/cases/${appointment.caseId}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          icon={<ExternalLink className="w-4 h-4" />}
                        >
                          View Full Case
                        </Button>
                      </Link>
                    </div>

                    {appointment.case && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Case Title</h4>
                          <p className="text-gray-700">{appointment.case.title}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {appointment.case.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Primary Disease</h4>
                            <Badge variant="error">{appointment.case.primaryDiseaseCode}</Badge>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Urgency Level</h4>
                            <PriorityBadge priority={appointment.case.urgencyLevel} />
                          </div>
                        </div>

                        {appointment.case.symptoms?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                            <div className="flex flex-wrap gap-2">
                              {appointment.case.symptoms.map((symptom, index) => (
                                <Badge key={index} variant="info" size="sm">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Doctor Info Tab */}
                {activeTab === 'doctor' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Dr. {appointment.doctor?.name}
                        </h3>
                        <p className="text-gray-600">{appointment.doctor?.specialization}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {appointment.doctor?.rating || 'N/A'} ({appointment.doctor?.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                          <p className="text-gray-700">{appointment.doctor?.experience} years</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">License Number</h4>
                          <p className="text-gray-700">{appointment.doctor?.licenseNumber}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Hospital Affiliation</h4>
                          <p className="text-gray-700">{appointment.doctor?.hospital || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {appointment.doctor?.languages?.map((lang, index) => (
                              <Badge key={index} variant="outline" size="sm">
                                {lang}
                              </Badge>
                            )) || <span className="text-gray-600">Not specified</span>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Consultations Completed</h4>
                          <p className="text-gray-700">{appointment.doctor?.consultationCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {appointment.doctor?.professionalSummary && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Professional Summary</h4>
                        <p className="text-gray-700">{appointment.doctor.professionalSummary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Consultation Report Tab */}
                {activeTab === 'report' && (
                  <div className="space-y-6">
                    {consultationReport ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Consultation Report</h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => patientService.downloadConsultationReport(consultationReport.id, 'consultation-report.pdf')}
                            >
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Printer className="w-4 h-4" />}
                              onClick={() => window.print()}
                            >
                              Print
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 print:shadow-none">
                          <div className="space-y-6">
                            <div className="border-b pb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                              <p className="text-gray-700">{consultationReport.diagnosis}</p>
                            </div>

                            <div className="border-b pb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                              <div className="text-gray-700 whitespace-pre-wrap">
                                {consultationReport.recommendations}
                              </div>
                            </div>

                            {consultationReport.prescriptions && (
                              <div className="border-b pb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Prescriptions</h4>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {consultationReport.prescriptions}
                                </div>
                              </div>
                            )}

                            <div className="border-b pb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Follow-up Instructions</h4>
                              <div className="text-gray-700 whitespace-pre-wrap">
                                {consultationReport.followUpInstructions}
                              </div>
                            </div>

                            {consultationReport.doctorNotes && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Doctor's Notes</h4>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {consultationReport.doctorNotes}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-600">
                              <span>Report generated on {formatDateTime(consultationReport.createdAt)}</span>
                              <span>Dr. {appointment.doctor?.name}</span>
                            </div>
                          </div>
                        </div>

                        {consultationReport.requiresFollowUp && (
                          <AlertCard
                            type="info"
                            title="Follow-up Required"
                            message="Your doctor has recommended a follow-up appointment."
                          >
                            <div className="mt-4">
                              <Button size="sm">
                                Schedule Follow-up
                              </Button>
                            </div>
                          </AlertCard>
                        )}
                      </div>
                    ) : appointment.status?.toLowerCase() === 'completed' ? (
                      <div className="text-center py-12">
                        <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Report Not Available</h3>
                        <p className="text-gray-600">
                          The consultation report has not been generated yet.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Report Pending</h3>
                        <p className="text-gray-600">
                          The consultation report will be available after your appointment is completed.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Appointment Timeline</h3>
                    
                    <div className="space-y-4">
                      {appointment.timeline?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              {event.type === 'created' && <Plus className="w-4 h-4 text-primary-600" />}
                              {event.type === 'scheduled' && <Calendar className="w-4 h-4 text-primary-600" />}
                              {event.type === 'confirmed' && <CheckCircle className="w-4 h-4 text-primary-600" />}
                              {event.type === 'started' && <PlayCircle className="w-4 h-4 text-primary-600" />}
                              {event.type === 'completed' && <CheckCircle className="w-4 h-4 text-primary-600" />}
                              {event.type === 'rescheduled' && <Clock className="w-4 h-4 text-primary-600" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.timestamp)}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No timeline events available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Appointment Status Card */}
            <Card title="Appointment Status">
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getConsultationTypeIcon(appointment.consultationType)}
                  </div>
                  
                  <StatusBadge status={appointment.status} size="lg" className="mb-4" />
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Scheduled: {formatDateTime(appointment.scheduledTime)}</p>
                    {appointment.completedAt && (
                      <p>Completed: {formatDateTime(appointment.completedAt)}</p>
                    )}
                    <p>Duration: {appointment.duration || 30} minutes</p>
                  </div>
                </div>

                {/* Meeting Details */}
                {appointment.meetingLink && canJoinConsultation() && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Meeting Details</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>Meeting ID: {appointment.meetingId}</p>
                      {appointment.meetingPassword && (
                        <p>Password: {appointment.meetingPassword}</p>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={handleJoinMeeting}
                      loading={isJoiningMeeting}
                    >
                      Join Meeting
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Doctor Quick Info */}
            <Card title="Doctor Information">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dr. {appointment.doctor?.name}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="text-gray-900">{appointment.doctor?.experience} years</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-gray-900">{appointment.doctor?.rating || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultations</span>
                    <span className="text-gray-900">{appointment.doctor?.consultationCount || 0}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<MessageCircle className="w-4 h-4" />}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card title="Payment Details">
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Consultation Fee</span>
                    <span className="font-medium text-gray-900">${appointment.consultationFee}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform Fee</span>
                    <span className="font-medium text-gray-900">$5.00</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-medium text-gray-900">Total Paid</span>
                    <span className="font-bold text-gray-900">
                      ${(parseFloat(appointment.consultationFee) + 5).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-800">Payment Confirmed</span>
                  </div>
                  {appointment.paidAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid on {formatDateTime(appointment.paidAt)}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    className="w-full"
                  >
                    Download Receipt
                  </Button>
                </div>
              </div>
            </Card>

            {/* Actions Card */}
            <Card title="Actions">
              <div className="p-6 space-y-3">
                {appointment.status?.toLowerCase() === 'completed' && !appointment.feedback && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ThumbsUp className="w-4 h-4" />}
                    className="w-full"
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    Rate Consultation
                  </Button>
                )}

                {['scheduled', 'confirmed'].includes(appointment.status?.toLowerCase()) && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    className="w-full"
                    onClick={() => setShowRescheduleModal(true)}
                  >
                    Request Reschedule
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Flag className="w-4 h-4" />}
                  className="w-full"
                  onClick={() => setShowComplaintModal(true)}
                >
                  Report Issue
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Copy className="w-4 h-4" />}
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  Copy Link
                </Button>

                {consultationReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    className="w-full"
                    onClick={() => patientService.downloadConsultationReport(consultationReport.id, 'report.pdf')}
                  >
                    Download Report
                  </Button>
                )}
              </div>
            </Card>

            {/* Next Steps */}
            {appointment.status?.toLowerCase() === 'completed' && consultationReport?.requiresFollowUp && (
              <Card title="Next Steps">
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Follow-up Recommended</span>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">
                      Your doctor has recommended a follow-up appointment.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Support */}
            <Card title="Need Help?">
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    Having technical issues or questions about your consultation?
                  </p>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<MessageSquare className="w-4 h-4" />}
                      className="w-full"
                    >
                      Contact Support
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                      className="w-full"
                    >
                      View FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FormModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          feedbackForm.reset();
        }}
        onSubmit={feedbackForm.handleSubmit(handleSubmitFeedback)}
        title="Rate Your Consultation"
        submitText="Submit Feedback"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate this consultation?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => feedbackForm.setValue('rating', rating)}
                  className={`w-8 h-8 ${
                    feedbackForm.watch('rating') >= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                >
                  <Star className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Feedback
            </label>
            <textarea
              {...feedbackForm.register('feedback')}
              rows={4}
              placeholder="Please share your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {feedbackForm.formState.errors.feedback && (
              <p className="text-sm text-red-600 mt-1">
                {feedbackForm.formState.errors.feedback.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...feedbackForm.register('recommendation')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">
              I would recommend this doctor to others
            </label>
          </div>
        </div>
      </FormModal>

      {/* Complaint Modal */}
      <FormModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleComplaint({
            type: formData.get('type'),
            description: formData.get('description'),
            priority: formData.get('priority')
          });
        }}
        title="Report an Issue"
        submitText="Submit Report"
        isLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              name="type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select issue type</option>
              <option value="technical">Technical Issue</option>
              <option value="quality">Service Quality</option>
              <option value="billing">Billing Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              defaultValue="medium"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Please describe the issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default AppointmentDetails;