import React, { useState } from 'react';
import { X, UserCircle, Stethoscope, Shield } from 'lucide-react';
import Button from '../common/Button';

/**
 * Modal for selecting user role during Google Sign-In
 * Since Google doesn't provide role information, users must select it
 */
const RoleSelectionModal = ({ isOpen, onClose, onRoleSelect, loading = false }) => {
  const [selectedRole, setSelectedRole] = useState('PATIENT');

  const roles = [
    {
      value: 'PATIENT',
      label: 'Patient',
      icon: <UserCircle className="w-12 h-12" />,
      description: 'I want to consult with doctors',
      color: 'blue'
    },
    {
      value: 'DOCTOR',
      label: 'Doctor',
      icon: <Stethoscope className="w-12 h-12" />,
      description: 'I want to provide medical consultations',
      color: 'green'
    },
    {
      value: 'ADMIN',
      label: 'Administrator',
      icon: <Shield className="w-12 h-12" />,
      description: 'I want to manage the system',
      color: 'purple'
    }
  ];

  const handleContinue = () => {
    if (onRoleSelect) {
      onRoleSelect(selectedRole);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Your Role
            </h2>
            <p className="text-gray-600">
              Choose how you want to use the Medical Consultation System
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200
                  ${selectedRole === role.value
                    ? `border-${role.color}-500 bg-${role.color}-50 shadow-md`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className={`
                  flex flex-col items-center text-center space-y-3
                  ${selectedRole === role.value ? `text-${role.color}-600` : 'text-gray-600'}
                `}>
                  {role.icon}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {role.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedRole === role.value && (
                  <div className="mt-3 flex justify-center">
                    <div className={`w-2 h-2 rounded-full bg-${role.color}-500`} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your role determines your access and features in the system. 
              {selectedRole === 'DOCTOR' && ' Doctors require admin verification before accessing all features.'}
              {selectedRole === 'ADMIN' && ' Admin access requires special permissions.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              loading={loading}
              disabled={loading || !selectedRole}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;