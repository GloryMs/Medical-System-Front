import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and states
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  // Variant styles
  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white 
      focus:ring-4 focus:ring-blue-200
      disabled:bg-blue-300 disabled:hover:bg-blue-300
    `,
    secondary: `
      bg-gray-600 hover:bg-gray-700 text-white
      focus:ring-4 focus:ring-gray-200
      disabled:bg-gray-300 disabled:hover:bg-gray-300
    `,
    outline: `
      bg-white border-2 border-gray-300 text-gray-700
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-4 focus:ring-gray-200
      disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-4 focus:ring-red-200
      disabled:bg-red-300 disabled:hover:bg-red-300
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white
      focus:ring-4 focus:ring-green-200
      disabled:bg-green-300 disabled:hover:bg-green-300
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100
      focus:ring-4 focus:ring-gray-200
      disabled:bg-transparent disabled:text-gray-400
    `,
    link: `
      bg-transparent text-blue-600 hover:text-blue-700 hover:underline
      focus:ring-0
      disabled:text-blue-300
    `
  };

  // Size styles
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none
    disabled:cursor-not-allowed disabled:opacity-60
    ${fullWidth ? 'w-full' : ''}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  // Handle click
  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      )}

      {/* Left Icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center">
          {icon}
        </span>
      )}

      {/* Button Text */}
      <span>{children}</span>

      {/* Right Icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;