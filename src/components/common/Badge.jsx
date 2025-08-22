import React from 'react';
import { getStatusColor, getPriorityColor, getRoleColor } from '../../constants/colorConstants';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  removable = false,
  onRemove,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    
    // Outline variants
    outlineDefault: 'border border-gray-300 text-gray-700 bg-white',
    outlinePrimary: 'border border-primary-300 text-primary-700 bg-white',
    outlineSecondary: 'border border-secondary-300 text-secondary-700 bg-white',
    outlineSuccess: 'border border-green-300 text-green-700 bg-white',
    outlineWarning: 'border border-yellow-300 text-yellow-700 bg-white',
    outlineError: 'border border-red-300 text-red-700 bg-white',
    outlineInfo: 'border border-blue-300 text-blue-700 bg-white',

    // Solid variants
    solidPrimary: 'bg-primary-500 text-white',
    solidSecondary: 'bg-secondary-500 text-white',
    solidSuccess: 'bg-green-500 text-white',
    solidWarning: 'bg-yellow-500 text-white',
    solidError: 'bg-red-500 text-white',
    solidInfo: 'bg-blue-500 text-white',
  };
  
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
    xl: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  const badgeClasses = `
    ${baseClasses}
    ${variants[variant] || variants.default}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses} {...props}>
      {icon && (
        <span className={`${iconSizes[size]} mr-1`}>
          {icon}
        </span>
      )}
      
      {children}
      
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
        >
          <span className="sr-only">Remove badge</span>
          <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Specialized badge components
export const StatusBadge = ({ status, size = 'md', ...props }) => {
  const getVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
      case 'verified':
      case 'paid':
        return 'success';
      case 'pending':
      case 'assigned':
      case 'scheduled':
      case 'payment_pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'expired':
        return 'error';
      case 'in_progress':
      case 'accepted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Badge 
      variant={getVariant(status)} 
      size={size} 
      {...props}
    >
      {status?.replace(/_/g, ' ').toUpperCase()}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, size = 'md', ...props }) => {
  const getVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Badge 
      variant={getVariant(priority)} 
      size={size} 
      {...props}
    >
      {priority?.toUpperCase()}
    </Badge>
  );
};

export const RoleBadge = ({ role, size = 'md', ...props }) => {
  const getVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'solidError';
      case 'doctor':
        return 'solidSuccess';
      case 'patient':
        return 'solidInfo';
      default:
        return 'default';
    }
  };

  const getIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        );
      case 'doctor':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'patient':
        return (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Badge 
      variant={getVariant(role)} 
      size={size} 
      icon={getIcon(role)}
      {...props}
    >
      {role?.toUpperCase()}
    </Badge>
  );
};

export const CountBadge = ({ count, maxCount = 99, variant = 'error', size = 'sm', ...props }) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  
  if (count === 0) return null;
  
  return (
    <Badge variant={variant} size={size} {...props}>
      {displayCount}
    </Badge>
  );
};

export const PaymentStatusBadge = ({ status, amount, size = 'md', ...props }) => {
  const getVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'success':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
      case 'declined':
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {amount && (
        <span className="text-lg font-bold text-gray-900">
          ${amount}
        </span>
      )}
      <Badge variant={getVariant(status)} size={size} {...props}>
        {status?.toUpperCase()}
      </Badge>
    </div>
  );
};

export default Badge;