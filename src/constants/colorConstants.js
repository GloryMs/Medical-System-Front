export const colors = {
  // Primary Colors (Green)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Secondary Colors (Orange)
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background Colors
  background: '#FEFEFE',
  surface: '#FFFFFF',
  
  // Text Colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Semantic Colors for Medical Context
  medical: {
    emergency: '#DC2626',
    urgent: '#EA580C',
    normal: '#10B981',
    low: '#3B82F6',
  },
  
  // Status-specific colors
  status: {
    pending: '#F59E0B',
    active: '#10B981',
    inactive: '#6B7280',
    completed: '#059669',
    cancelled: '#EF4444',
    approved: '#10B981',
    rejected: '#EF4444',
    verified: '#3B82F6',
  },
  
  // Role-based colors
  roles: {
    patient: '#3B82F6',
    doctor: '#10B981',
    admin: '#8B5CF6',
  },
};

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  '--color-primary': colors.primary[500],
  '--color-secondary': colors.secondary[500],
  '--color-success': colors.success,
  '--color-warning': colors.warning,
  '--color-error': colors.error,
  '--color-info': colors.info,
  '--color-background': colors.background,
  '--color-surface': colors.surface,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-border': colors.border.light,
};

// Utility functions for color manipulation
export const getStatusColor = (status) => {
  const statusColors = {
    PENDING: colors.warning,
    ASSIGNED: colors.info,
    ACCEPTED: colors.primary[500],
    SCHEDULED: colors.info,
    PAYMENT_PENDING: colors.warning,
    IN_PROGRESS: colors.primary[500],
    CONSULTATION_COMPLETE: colors.success,
    CLOSED: colors.gray[500],
    REJECTED: colors.error,
    COMPLETED: colors.success,
    ACTIVE: colors.success,
    INACTIVE: colors.gray[500],
    CANCELLED: colors.error,
  };
  
  return statusColors[status] || colors.gray[500];
};

export const getPriorityColor = (priority) => {
  const priorityColors = {
    LOW: colors.primary[500],
    MEDIUM: colors.warning,
    HIGH: colors.error,
    URGENT: colors.medical.emergency,
  };
  
  return priorityColors[priority] || colors.gray[500];
};

export const getRoleColor = (role) => {
  const roleColors = {
    PATIENT: colors.roles.patient,
    DOCTOR: colors.roles.doctor,
    ADMIN: colors.roles.admin,
  };
  
  return roleColors[role] || colors.gray[500];
};

// Theme variants
export const themes = {
  light: {
    background: colors.background,
    surface: colors.surface,
    text: colors.text.primary,
    border: colors.border.light,
  },
  dark: {
    background: colors.gray[900],
    surface: colors.gray[800],
    text: colors.gray[100],
    border: colors.gray[700],
  },
};

export default colors;