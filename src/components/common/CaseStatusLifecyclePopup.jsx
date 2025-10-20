import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  FileText, 
  XCircle, 
  ChevronDown,
  ChevronUp,
  Loader,
  CheckCircle,
  Activity
} from 'lucide-react';

const CaseStatusLifecyclePopup = ({ isOpen, onClose, currentStatus = 'SUBMITTED' }) => {
  const [expandedSteps, setExpandedSteps] = useState({});

  // Toggle expansion for individual steps
  const toggleExpand = (status) => {
    setExpandedSteps(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Define the case lifecycle steps based on backend CaseStatus enum
  const caseSteps = [
    {
      status: 'SUBMITTED',
      label: 'Case Submitted',
      icon: <FileText className="w-5 h-5" />,
      description: 'Your case has been successfully submitted to our system and is awaiting review by our medical team.',
      color: 'blue'
    },
    {
      status: 'PENDING',
      label: 'Pending Review',
      icon: <Clock className="w-5 h-5" />,
      description: 'Your case is in the queue and will be assigned to a qualified doctor based on your requirements.',
      color: 'yellow'
    },
    {
      status: 'ASSIGNED',
      label: 'Doctor Assigned',
      icon: <UserCheck className="w-5 h-5" />,
      description: 'A qualified doctor has been assigned to review your case based on specialization match.',
      color: 'indigo'
    },
    {
      status: 'ACCEPTED',
      label: 'Case Accepted',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'The assigned doctor has reviewed and accepted your case. They will propose consultation times.',
      color: 'purple'
    },
    {
      status: 'SCHEDULED',
      label: 'Appointment Scheduled',
      icon: <Calendar className="w-5 h-5" />,
      description: 'An appointment time has been proposed. Please review and confirm the schedule.',
      color: 'cyan'
    },
    {
      status: 'PAYMENT_PENDING',
      label: 'Awaiting Payment',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Schedule confirmed. Please complete the consultation fee payment to activate your appointment.',
      color: 'orange'
    },
    {
      status: 'IN_PROGRESS',
      label: 'Consultation Active',
      icon: <Activity className="w-5 h-5" />,
      description: 'Your consultation is confirmed and ready. Join at the scheduled time for your appointment.',
      color: 'blue'
    },
    {
      status: 'CONSULTATION_COMPLETE',
      label: 'Consultation Complete',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Your consultation has been successfully completed. You will receive your report soon.',
      color: 'green'
    },
    {
      status: 'CLOSED',
      label: 'Case Closed',
      icon: <Check className="w-5 h-5" />,
      description: 'Your case has been finalized. All reports and documentation are available in your account.',
      color: 'gray'
    }
  ];

  const rejectedStep = {
    status: 'REJECTED',
    label: 'Case Rejected',
    icon: <XCircle className="w-5 h-5" />,
    description: 'The case was not accepted. You may submit a new case or contact support for assistance.',
    color: 'red'
  };

  // Color mappings matching your application theme
  const getStepColors = (step, isCurrent, isPast, isFuture) => {
    if (isPast) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-700',
        iconBg: 'bg-green-500',
        iconText: 'text-white',
        line: 'bg-green-500'
      };
    }

    if (isCurrent) {
      const colorMap = {
        blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', iconBg: 'bg-blue-500' },
        yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', iconBg: 'bg-yellow-500' },
        indigo: { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-700', iconBg: 'bg-indigo-500' },
        purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700', iconBg: 'bg-purple-500' },
        cyan: { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-700', iconBg: 'bg-cyan-500' },
        orange: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700', iconBg: 'bg-orange-500' },
        green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', iconBg: 'bg-green-500' },
        gray: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-700', iconBg: 'bg-gray-500' },
        red: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', iconBg: 'bg-red-500' }
      };
      
      return {
        ...colorMap[step.color],
        iconText: 'text-white',
        line: 'bg-gray-300'
      };
    }

    return {
      bg: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-500',
      iconBg: 'bg-gray-300',
      iconText: 'text-gray-600',
      line: 'bg-gray-300'
    };
  };

  const getStepIndex = (status) => {
    return caseSteps.findIndex(step => step.status === status);
  };

  const currentStepIndex = currentStatus === 'REJECTED' ? -1 : getStepIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  // Use rejected step if status is rejected, otherwise use normal steps
  const displaySteps = isRejected ? [...caseSteps.map(s => ({ ...s, isDisabled: true })), rejectedStep] : caseSteps;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Case Status Timeline</h3>
              <p className="text-xs text-gray-600 mt-0.5">Track your case through each stage</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Vertical Stepper */}
          <div className="relative">
            {displaySteps.map((step, index) => {
              const isPast = !isRejected && index < currentStepIndex;
              const isCurrent = !isRejected && index === currentStepIndex;
              const isFuture = !isRejected && index > currentStepIndex;
              const isRejectedStatus = step.status === 'REJECTED';
              const isDisabled = step.isDisabled;
              
              const colors = isRejectedStatus 
                ? getStepColors(rejectedStep, true, false, false)
                : getStepColors(step, isCurrent, isPast, isFuture);

              const isExpanded = expandedSteps[step.status] || isCurrent || isRejectedStatus;

              return (
                <div key={step.status} className="relative">
                  <div className="flex items-start">
                    {/* Left side - Circle and Line */}
                    <div className="flex flex-col items-center mr-4">
                      {/* Circle with Icon */}
                      <div className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center
                        border-2 transition-all duration-200
                        ${colors.iconBg} ${colors.border} ${colors.iconText}
                        ${isCurrent ? 'ring-4 ring-opacity-20 ring-offset-2 shadow-lg scale-110' : ''}
                        ${isCurrent ? colors.border.replace('border', 'ring') : ''}
                      `}>
                        {isPast && !isDisabled ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>

                      {/* Vertical Line */}
                      {index < displaySteps.length - 1 && (
                        <div className={`w-0.5 h-20 mt-2 ${isPast ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>

                    {/* Right side - Content */}
                    <div className="flex-1 pb-8">
                      {/* Step Header */}
                      <div 
                        className={`
                          flex items-center justify-between p-3 rounded-lg cursor-pointer
                          transition-all duration-200 hover:bg-opacity-50
                          ${isCurrent ? colors.bg + ' ' + colors.border + ' border' : ''}
                          ${!isCurrent && !isDisabled ? 'hover:bg-gray-50' : ''}
                          ${isDisabled && !isRejectedStatus ? 'opacity-50' : ''}
                        `}
                        onClick={() => toggleExpand(step.status)}
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${colors.text}`}>
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium animate-pulse">
                                  You are here
                                </span>
                              )}
                              {isRejectedStatus && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-medium">
                                  Current Status
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expand/Collapse Arrow */}
                        <button className={`p-1 rounded transition-transform duration-200 ${colors.text}`}>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Description */}
                      {isExpanded && (
                        <div className={`
                          mt-2 ml-3 p-3 text-xs rounded-lg transition-all duration-200
                          ${isCurrent || isRejectedStatus ? colors.bg + ' ' + colors.text : 'text-gray-600'}
                        `}>
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="space-y-0.5 text-blue-700">
                  <li>• Each stage is completed automatically as requirements are met</li>
                  <li>• Payment must be completed to proceed with consultation</li>
                  <li>• You will receive notifications at each stage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStatusLifecyclePopup;