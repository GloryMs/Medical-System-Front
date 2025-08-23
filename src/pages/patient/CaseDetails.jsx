import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Heart,
  Pill,
  Activity,
  Star,
  MessageSquare,
  Download,
  Upload,
  Edit,
  Phone,
  Video,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

import Card, { StatsCard, AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import patientService from '../../services/api/patientService';

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();

  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState({});

  useEffect(() => {
    console.log('Strt Loading Data ...');
    if (caseId) {
      loadCaseDetails();
    }
  }, [caseId]);

  const loadCaseDetails = async () => {
    try {
      console.log('Loading case details');
      const data = await execute(() => patientService.getCaseById(caseId));
      setCaseData(data);
      setEditedCase(data);
    } catch (error) {
      console.error('Failed to load case details:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await execute(() => patientService.updateCaseStatus(caseId, newStatus));
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await execute(() => patientService.addCaseNote(caseId, {
        content: newNote,
        isPrivate: false
      }));
      setNewNote('');
      setShowAddNote(false);
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await execute(() => patientService.updateCase(caseId, editedCase));
      setIsEditing(false);
      await loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleScheduleAppointment = () => {
    navigate(`/appointments/schedule/${caseId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical Details', icon: <Heart className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> }
  ];

  const getStatusActions = (status) => {
    const actions = [];
    
    switch (status?.toLowerCase()) {
      case 'submitted':
      case 'pending':
        if (user.role === 'ADMIN') {
          actions.push(
            <Button 
              key="assign" 
              variant="primary" 
              size="sm"
              onClick={() => handleStatusUpdate('ASSIGNED')}
            >
              Assign Doctor
            </Button>
          );
        }
        break;
      
      case 'assigned':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="accept" 
              variant="success" 
              size="sm"
              onClick={() => handleStatusUpdate('ACCEPTED')}
            >
              Accept Case
            </Button>,
            <Button 
              key="reject" 
              variant="error" 
              size="sm"
              onClick={() => handleStatusUpdate('REJECTED')}
            >
              Reject Case
            </Button>
          );
        }
        break;
      
      case 'accepted':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="schedule" 
              variant="primary" 
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={handleScheduleAppointment}
            >
              Schedule Appointment
            </Button>
          );
        }
        break;
      
      case 'scheduled':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="start" 
              variant="success" 
              size="sm"
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
            >
              Start Consultation
            </Button>
          );
        }
        break;
      
      case 'in_progress':
        if (user.role === 'DOCTOR') {
          actions.push(
            <Button 
              key="complete" 
              variant="primary" 
              size="sm"
              onClick={() => handleStatusUpdate('COMPLETED')}
            >
              Complete Case
            </Button>
          );
        }
        break;
    }
    
    return actions;
  };

  if (loading && !caseData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Case Not Found</h3>
          <p className="text-gray-600 mb-4">The requested case could not be found.</p>
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
                    Case #{caseData.caseNumber || caseData.id}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {formatDate(caseData.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StatusBadge status={caseData.status} />
                <PriorityBadge priority={caseData.urgencyLevel} />
                
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedCase(caseData);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSaveChanges}
                    >
                      Save
                    </Button>
                  </div>
                )}
                
                {getStatusActions(caseData.status)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Case Title</h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCase.caseTitle || ''}
                          onChange={(e) => setEditedCase({...editedCase, caseTitle: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{caseData.caseTitle}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                      {isEditing ? (
                        <textarea
                          value={editedCase.description || ''}
                          onChange={(e) => setEditedCase({...editedCase, description: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Required Specialization</h4>
                        <Badge variant="primary">{caseData.requiredSpecialization}</Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Case Complexity</h4>
                        <Badge variant="info">{caseData.complexity}</Badge>
                      </div>
                    </div>

                    {caseData.secondarySpecializations?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Secondary Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {caseData.secondarySpecializations.map((spec, index) => (
                            <Badge key={index} variant="outline">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Details Tab */}
                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Disease</h3>
                      <Badge variant="error" size="lg">{caseData.primaryDiseaseCode}</Badge>
                    </div>

                    {caseData.secondaryDiseaseCodes?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary Diseases</h3>
                        <div className="flex flex-wrap gap-2">
                          {caseData.secondaryDiseaseCodes.map((code, index) => (
                            <Badge key={index} variant="warning">{code}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Symptoms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {caseData.symptomCodes?.map((symptom, index) => (
                          <Badge key={index} variant="info">{symptom}</Badge>
                        ))}
                      </div>
                    </div>

                    {caseData.currentMedicationCodes?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {caseData.currentMedicationCodes.map((medication, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                              <Pill className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">{medication}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Upload className="w-4 h-4" />}
                      >
                        Upload Document
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {caseData.documents?.length > 0 ? (
                        caseData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-600">
                                  Uploaded on {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Download className="w-4 h-4" />}
                              >
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No documents uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Case Notes</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddNote(true)}
                      >
                        Add Note
                      </Button>
                    </div>

                    {showAddNote && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add your note here..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex justify-end space-x-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNote('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleAddNote}
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {caseData.notes?.length > 0 ? (
                        caseData.notes.map((note, index) => (
                          <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{note.author}</p>
                                  <p className="text-sm text-gray-600">{formatDateTime(note.createdAt)}</p>
                                </div>
                              </div>
                              {note.isPrivate && (
                                <Badge variant="warning" size="xs">Private</Badge>
                              )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No notes added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Case Timeline</h3>
                    <div className="space-y-4">
                      {caseData.timeline?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              {event.type === 'status_change' && <Activity className="w-4 h-4 text-primary-600" />}
                              {event.type === 'note_added' && <MessageSquare className="w-4 h-4 text-primary-600" />}
                              {event.type === 'document_uploaded' && <FileText className="w-4 h-4 text-primary-600" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Case Information */}
            <Card title="Case Information">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Case ID</span>
                  <span className="text-sm font-medium">#{caseData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">{formatDate(caseData.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="text-sm font-medium">{formatDate(caseData.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Second Opinion</span>
                  <span className="text-sm font-medium">
                    {caseData.requiresSecondOpinion ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Patient Information */}
            {caseData.patient && (
              <Card title="Patient Information">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseData.patient.name}</p>
                      <p className="text-sm text-gray-600">{caseData.patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Age</span>
                      <span className="text-sm font-medium">{caseData.patient.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gender</span>
                      <span className="text-sm font-medium">{caseData.patient.gender}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />} fullWidth>
                        Call
                      </Button>
                      <Button variant="outline" size="sm" icon={<Mail className="w-4 h-4" />} fullWidth>
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Assigned Doctor */}
            {caseData.assignedDoctor && (
              <Card title="Assigned Doctor">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseData.assignedDoctor.name}</p>
                      <p className="text-sm text-gray-600">{caseData.assignedDoctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{caseData.assignedDoctor.rating}</span>
                    <span className="text-sm text-gray-600">({caseData.assignedDoctor.reviewCount} reviews)</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" icon={<Video className="w-4 h-4" />} fullWidth>
                        Video Call
                      </Button>
                      <Button variant="outline" size="sm" icon={<MessageSquare className="w-4 h-4" />} fullWidth>
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Appointment Information */}
            {caseData.appointment && (
              <Card title="Scheduled Appointment">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(caseData.appointment.scheduledTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(caseData.appointment.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{caseData.appointment.duration} minutes</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="info" size="sm">{caseData.appointment.consultationType}</Badge>
                  </div>

                  {caseData.appointment.meetingLink && (
                    <div className="pt-3 border-t border-gray-200">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={<Video className="w-4 h-4" />} 
                        fullWidth
                        onClick={() => window.open(caseData.appointment.meetingLink, '_blank')}
                      >
                        Join Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Payment Information */}
            {caseData.payment && (
              <Card title="Payment Information">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consultation Fee</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${caseData.payment.amount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={caseData.payment.status} size="sm" />
                  </div>
                  
                  {caseData.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paid On</span>
                      <span className="text-sm font-medium">
                        {formatDate(caseData.payment.paidAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="text-sm font-medium">{caseData.payment.method}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<Download className="w-4 h-4" />} 
                  fullWidth
                >
                  Export Case Report
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<MessageSquare className="w-4 h-4" />} 
                  fullWidth
                >
                  Send Message
                </Button>
                
                {user.role === 'ADMIN' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      icon={<Edit className="w-4 h-4" />} 
                      fullWidth
                    >
                      Reassign Doctor
                    </Button>
                    
                    <Button 
                      variant="error" 
                      size="sm" 
                      icon={<XCircle className="w-4 h-4" />} 
                      fullWidth
                    >
                      Cancel Case
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Case Stats */}
            <Card title="Case Statistics">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Notes</span>
                  <span className="text-sm font-medium">{caseData.notes?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="text-sm font-medium">{caseData.documents?.length || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status Changes</span>
                  <span className="text-sm font-medium">
                    {caseData.timeline?.filter(event => event.type === 'status_change').length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date() - new Date(caseData.createdAt)) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-6 h-6" />}
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowAddNote(true)}
        >
          <span className="sr-only">Add Note</span>
        </Button>
      </div>

      {/* Emergency Contact Modal - if patient has emergency contact */}
      {caseData.patient?.emergencyContact && (
        <div className="fixed bottom-4 left-4 lg:hidden">
          <Button
            variant="error"
            size="sm"
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => {
              // Handle emergency contact
              window.location.href = `tel:${caseData.patient.emergencyContact.phone}`;
            }}
          >
            Emergency
          </Button>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;