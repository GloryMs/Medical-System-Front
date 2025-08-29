// Color constants for HealthBridge Germany Medical Consultation System

export const colors = {
  // Primary brand colors - GREEN (Medical/Health theme)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main primary color - GREEN
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Secondary colors for medical theme - BLUE
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Medical status colors
  medical: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    urgent: '#dc2626',
    pending: '#f59e0b',
    completed: '#059669',
  },
  
  // User role colors
  roles: {
    patient: {
      primary: '#3b82f6', // Blue for patients
      secondary: '#dbeafe',
      text: '#1e40af',
    },
    doctor: {
      primary: '#22c55e', // Green for doctors
      secondary: '#dcfce7',
      text: '#15803d',
    },
    admin: {
      primary: '#7c3aed', // Purple for admin
      secondary: '#e9d5ff',
      text: '#5b21b6',
    },
  },
};

// Status color mappings
export const getStatusColor = (status) => {
  const statusColors = {
    // Case statuses
    'SUBMITTED': 'bg-blue-100 text-blue-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'ASSIGNED': 'bg-indigo-100 text-indigo-800',
    'ACCEPTED': 'bg-purple-100 text-purple-800',
    'SCHEDULED': 'bg-cyan-100 text-cyan-800',
    'PAYMENT_PENDING': 'bg-orange-100 text-orange-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'CLOSED': 'bg-gray-100 text-gray-800',
    
    // Appointment statuses
    'UPCOMING': 'bg-blue-100 text-blue-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'MISSED': 'bg-red-100 text-red-800',
    'RESCHEDULED': 'bg-yellow-100 text-yellow-800',
    
    // Payment statuses
    'PAID': 'bg-green-100 text-green-800',
    'UNPAID': 'bg-red-100 text-red-800',
    'PROCESSING': 'bg-yellow-100 text-yellow-800',
    'REFUNDED': 'bg-gray-100 text-gray-800',
    
    // User statuses
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-red-100 text-red-800',
    'VERIFIED': 'bg-green-100 text-green-800',
    'UNVERIFIED': 'bg-yellow-100 text-yellow-800',
    'SUSPENDED': 'bg-red-100 text-red-800',
  };
  
  return statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

// Priority color mappings
export const getPriorityColor = (priority) => {
  const priorityColors = {
    'LOW': 'bg-green-100 text-green-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'URGENT': 'bg-red-100 text-red-800',
    'CRITICAL': 'bg-red-100 text-red-800',
  };
  
  return priorityColors[priority?.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

// Role color mappings
export const getRoleColor = (role) => {
  const roleColors = {
    'PATIENT': 'text-blue-600',
    'DOCTOR': 'text-green-600',
    'ADMIN': 'text-purple-600',
  };
  
  return roleColors[role?.toUpperCase()] || 'text-gray-600';
};

// Specialization colors for medical fields
export const getSpecializationColor = (specialization) => {
  const specializationColors = {
    'CARDIOLOGY': 'bg-red-100 text-red-800',
    'ONCOLOGY': 'bg-purple-100 text-purple-800',
    'NEUROLOGY': 'bg-indigo-100 text-indigo-800',
    'ORTHOPEDICS': 'bg-blue-100 text-blue-800',
    'DERMATOLOGY': 'bg-yellow-100 text-yellow-800',
    'GASTROENTEROLOGY': 'bg-green-100 text-green-800',
    'PSYCHIATRY': 'bg-pink-100 text-pink-800',
    'PEDIATRICS': 'bg-cyan-100 text-cyan-800',
    'GYNECOLOGY': 'bg-rose-100 text-rose-800',
    'ENDOCRINOLOGY': 'bg-teal-100 text-teal-800',
    'PULMONOLOGY': 'bg-sky-100 text-sky-800',
    'RHEUMATOLOGY': 'bg-amber-100 text-amber-800',
  };
  
  return specializationColors[specialization?.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

export default colors;