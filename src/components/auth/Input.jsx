import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Reusable Input Component
 * Supports text, email, password, number, textarea, and more
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  error,
  helperText,
  icon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  rows = 4,
  showPasswordToggle = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if this is a password field
  const isPasswordField = type === 'password';
  
  // Determine actual input type (toggle password visibility)
  const inputType = isPasswordField && showPassword ? 'text' : type;

  // Base input classes
  const baseInputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    ${icon ? 'pl-11' : ''}
    ${(rightIcon || isPasswordField) ? 'pr-11' : ''}
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : isFocused
        ? 'border-blue-500 ring-2 ring-blue-200'
        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-200'
    }
    ${className}
  `;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input or Textarea */}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`${baseInputClasses} resize-none`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={baseInputClasses}
            {...props}
          />
        )}

        {/* Right Icon or Password Toggle */}
        {isPasswordField && showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;