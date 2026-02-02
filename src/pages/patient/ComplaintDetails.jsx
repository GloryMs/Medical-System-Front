import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Download,
  Calendar,
  Clock,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Image as ImageIcon,
  X,
  Edit,
  Star,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Mail,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  Flag,
  Shield,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';

import Card, { AlertCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ConfirmModal, FormModal } from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
//import { useSocket } from '../../hooks/useSocket';
import patientService from '../../services/api/patientService';

// Validation schemas
const messageSchema = yup.object({
  message: yup.string().required('Message is required').min(1, 'Message cannot be empty')
});

const feedbackSchema = yup.object({
  rating: yup.string().required('Rating is required'),
  comment: yup.string().optional()
});

const ComplaintDetails = () => {
  const { id: complaintId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute, loading } = useApi();
  //const socket = useSocket();
  const messagesEndRef = useRef(null);

  // State management
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [supportAgent, setSupportAgent] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(false);

  // Form setup
  const messageForm = useForm({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  const feedbackForm = useForm({
    resolver: yupResolver(feedbackSchema),
    defaultValues: {
      rating: '',
      comment: ''
    }
  });

  // Load data and setup socket listeners
  // useEffect(() => {
  //   if (complaintId) {
  //     loadComplaintDetails();
  //     loadMessages();
      
  //     // Socket event listeners
  //     // if (socket) {
  //     //   socket.emit('join_complaint_room', complaintId);
        
  //     //   socket.on('new_message', handleNewMessage);
  //     //   socket.on('message_status_update', handleMessageStatusUpdate);
  //     //   socket.on('agent_typing', handleAgentTyping);
  //     //   socket.on('agent_online_status', handleAgentOnlineStatus);
  //     //   socket.on('complaint_status_update', handleComplaintStatusUpdate);

  //     //   return () => {
  //     //     socket.emit('leave_complaint_room', complaintId);
  //     //     socket.off('new_message', handleNewMessage);
  //     //     socket.off('message_status_update', handleMessageStatusUpdate);
  //     //     socket.off('agent_typing', handleAgentTyping);
  //     //     socket.off('agent_online_status', handleAgentOnlineStatus);
  //     //     socket.off('complaint_status_update', handleComplaintStatusUpdate);
  //     //   };
  //     // }
  //   }
  // }, [complaintId, socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadComplaintDetails = async () => {
    try {
      const data = await execute(() => patientService.getComplaintById(complaintId));
      setComplaint(data);
      setSupportAgent(data.assignedTo);
    } catch (error) {
      console.error('Failed to load complaint details:', error);
      navigate('/patient/complaints');
    }
  };

  const loadMessages = async () => {
    try {
      const data = await execute(() => patientService.getComplaintMessages(complaintId));
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (data) => {
    try {
      const messageData = {
        message: data.message,
        attachments: attachments,
        complaintId: complaintId
      };

      const newMessage = await execute(() => patientService.sendComplaintMessage(messageData));
      
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      
      // // Emit socket event
      // if (socket) {
      //   socket.emit('send_message', {
      //     complaintId,
      //     message: newMessage
      //   });
      // }

      // Reset form and attachments
      messageForm.reset();
      setAttachments([]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmitFeedback = async (data) => {
    try {
      await execute(() => patientService.submitComplaintFeedback(complaintId, data));
      setShowFeedbackModal(false);
      await loadComplaintDetails(); // Refresh complaint data
      feedbackForm.reset();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleEscalateComplaint = async (reason) => {
    try {
      await execute(() => patientService.escalateComplaint(complaintId, { reason }));
      setShowEscalateModal(false);
      await loadComplaintDetails();
    } catch (error) {
      console.error('Failed to escalate complaint:', error);
    }
  };

  // Socket event handlers
  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleMessageStatusUpdate = (update) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === update.messageId 
          ? { ...msg, status: update.status, readAt: update.readAt }
          : msg
      )
    );
  };

  const handleAgentTyping = (data) => {
    setIsTyping(data.isTyping);
  };

  const handleAgentOnlineStatus = (data) => {
    setOnlineStatus(data.isOnline);
  };

  const handleComplaintStatusUpdate = (update) => {
    setComplaint(prev => ({ ...prev, ...update }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => navigate('/patient/complaints')}
                >
                  Back to Complaints
                </Button>
                
                <div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(complaint.status)}
                    <h1 className="text-2xl font-bold text-gray-900">
                      {complaint.subject}
                    </h1>
                    <StatusBadge status={complaint.status} />
                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Complaint #{complaint.complaintId} • Created {formatDate(complaint.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {complaint.status === 'RESOLVED' && !complaint.adminResponse && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Star className="w-4 h-4" />}
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    Rate Support
                  </Button>
                )}

                {complaint.status !== 'CLOSED' && complaint.status !== 'RESOLVED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Flag className="w-4 h-4" />}
                    onClick={() => setShowEscalateModal(true)}
                  >
                    Escalate
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => patientService.downloadComplaintSummary(complaintId, `complaint-${complaint.complaintId}.pdf`)}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Complaint Info */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Support Agent Info */}
            {supportAgent && (
              <Card title="Support Agent" className="mb-6">
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      {onlineStatus && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{supportAgent.name}</h4>
                      <p className="text-sm text-gray-600">{supportAgent.role}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-500">
                          {onlineStatus ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Phone className="w-4 h-4" />}
                        className="w-full"
                      >
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Mail className="w-4 h-4" />}
                        className="w-full"
                      >
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Complaint Details */}
            <Card title="Complaint Details" className="mb-6">
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium">{complaint.complaintType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge className={getPriorityColor(complaint.priority)} size="sm">
                    {complaint.priority}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={complaint.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">{formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">{formatDate(complaint.updatedAt)}</span>
                  </div>
                )}
                {complaint.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolved</span>
                    <span className="text-sm font-medium">{formatDate(complaint.resolvedAt)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Original Description */}
            <Card title="Original Description" className="mb-6">
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {complaint.description}
                </p>
              </div>
            </Card>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Card title="Original Attachments" className="mb-6">
                <div className="p-4 space-y-2">
                  {complaint.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {isImage(attachment.name) ? (
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {isImage(attachment.name) && (
                          <button
                            onClick={() => setShowAttachmentPreview(attachment)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => patientService.downloadAttachment(attachment.id, attachment.name)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Resolution */}
            {complaint.status === 'RESOLVED' && complaint.adminResponse && (
              <Card title="Resolution" className="mb-6">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {complaint.adminResponse}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Resolved by {complaint.assignedTo?.id} on {formatDate(complaint.resolvedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Feedback */}
            {complaint.feedback && (
              <Card title="Your Feedback" className="mb-6">
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {complaint.feedback.rating === 'positive' ? (
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {complaint.feedback.rating === 'positive' ? 'Positive' : 'Negative'} Feedback
                    </span>
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-sm text-gray-700 italic">
                      "{complaint.feedback.comment}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted {formatDate(complaint.feedback.createdAt)}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.type === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender.type === 'patient'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium">
                            {message.sender.name}
                          </span>
                          <span className={`text-xs ${
                            message.sender.type === 'patient' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                                message.sender.type === 'patient' ? 'bg-primary-400' : 'bg-gray-50'
                              }`}>
                                <Paperclip className="w-3 h-3" />
                                <span className="text-xs truncate">{attachment.name}</span>
                                <button
                                  onClick={() => patientService.downloadAttachment(attachment.id, attachment.name)}
                                  className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {message.sender.type === 'patient' && (
                          <div className="flex items-center justify-end mt-2">
                            {message.status === 'delivered' && (
                              <CheckCircle className="w-3 h-3 text-primary-200" />
                            )}
                            {message.status === 'read' && (
                              <div className="flex space-x-1">
                                <CheckCircle className="w-3 h-3 text-primary-200" />
                                <CheckCircle className="w-3 h-3 text-primary-200" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">Support is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-500">Start the conversation by sending a message below</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input Area */}
          {complaint.status !== 'closed' && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="space-y-4">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                          {isImage(attachment.name) ? (
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-32">
                            {attachment.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        {...messageForm.register('message')}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            messageForm.handleSubmit(handleSendMessage)();
                          }
                        }}
                      />
                      {messageForm.formState.errors.message && (
                        <p className="text-red-500 text-sm mt-1">
                          {messageForm.formState.errors.message.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      />
                      <label
                        htmlFor="file-upload"
                        className="p-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <Paperclip className="w-5 h-5" />
                      </label>

                      <Button
                        type="submit"
                        variant="primary"
                        icon={<Send className="w-5 h-5" />}
                        loading={loading}
                        disabled={!messageForm.watch('message')?.trim() && attachments.length === 0}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <FormModal
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Rate Our Support"
        onSubmit={feedbackForm.handleSubmit(handleSubmitFeedback)}
        loading={loading}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate our support? *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => feedbackForm.setValue('rating', 'positive')}
                className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                  feedbackForm.watch('rating') === 'positive'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Helpful</span>
              </button>
              
              <button
                type="button"
                onClick={() => feedbackForm.setValue('rating', 'negative')}
                className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                  feedbackForm.watch('rating') === 'negative'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span>Not Helpful</span>
              </button>
            </div>
            {feedbackForm.formState.errors.rating && (
              <p className="text-red-500 text-sm mt-1">
                {feedbackForm.formState.errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              {...feedbackForm.register('comment')}
              rows={4}
              placeholder="Tell us more about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Escalate Modal */}
      <ConfirmModal
        show={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="Escalate Complaint"
        message="Escalating this complaint will bring it to the attention of a supervisor. Are you sure you want to proceed?"
        confirmText="Escalate Complaint"
        confirmVariant="warning"
        onConfirm={() => handleEscalateComplaint('User requested escalation')}
        loading={loading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for escalation (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Please describe why you want to escalate this complaint..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            // onChange={(e) => setEscalationReason(e.target.value)}
          />
        </div>
      </ConfirmModal>

      {/* Attachment Preview Modal */}
      {showAttachmentPreview && (
        <Modal
          show={!!showAttachmentPreview}
          onClose={() => setShowAttachmentPreview(null)}
          title="Attachment Preview"
          size="lg"
        >
          <div className="text-center">
            {isImage(showAttachmentPreview.name) ? (
              <img
                src={showAttachmentPreview.url}
                alt={showAttachmentPreview.name}
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
            ) : (
              <div className="py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Preview not available for this file type
                </p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{showAttachmentPreview.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(showAttachmentPreview.size)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => patientService.downloadAttachment(showAttachmentPreview.id, showAttachmentPreview.name)}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Support Contact Info */}
      {complaint.status === 'closed' && (
        <div className="fixed bottom-4 right-4">
          <Card className="w-80 shadow-lg">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Need More Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your complaint has been closed, but we're still here to help.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Phone className="w-4 h-4" />}
                      onClick={() => window.open('tel:+15551234567')}
                    >
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<MessageSquare className="w-4 h-4" />}
                      onClick={() => navigate('/patient/complaints')}
                    >
                      New Complaint
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => document.querySelector('.fixed.bottom-4').style.display = 'none'}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};


export default ComplaintDetails;