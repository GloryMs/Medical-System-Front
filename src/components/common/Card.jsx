import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  action, 
  header,
  footer,
  padding = true,
  shadow = true,
  hover = false,
  bordered = true,
  ...props 
}) => {
  const cardClasses = `
    bg-white rounded-lg
    ${shadow ? 'shadow-soft' : ''}
    ${bordered ? 'border border-gray-200' : ''}
    ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
    ${className}
  `.trim();

  const hasHeader = title || subtitle || action || header;

  return (
    <div className={cardClasses} {...props}>
      {hasHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header || (
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 leading-6">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && (
                <div className="flex-shrink-0 ml-4">
                  {action}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

// Card variants for specific use cases
export const StatsCard = ({ title, value, icon, change, changeType, ...props }) => (
  <Card hover className="cursor-pointer" {...props}>
    <div className="flex items-center">
      {icon && (
        <div className="flex-shrink-0">
          <div className="p-2 bg-primary-100 rounded-lg">
            <div className="w-6 h-6 text-primary-600">
              {icon}
            </div>
          </div>
        </div>
      )}
      <div className={icon ? 'ml-4' : ''}>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-1">
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600' : 
              changeType === 'decrease' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export const AlertCard = ({ type = 'info', title, message, onClose, ...props }) => {
  const alertStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <Card 
      className={`${alertStyles[type]} border-l-4`}
      bordered={false}
      shadow={false}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          {message && (
            <p className="text-sm">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
};

export const LoadingCard = ({ title = "Loading...", height = "200px" }) => (
  <Card>
    <div className="flex flex-col items-center justify-center" style={{ height }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-gray-600">{title}</p>
    </div>
  </Card>
);

export const EmptyCard = ({ title = "No data", message, icon, action }) => (
  <Card>
    <div className="text-center py-8">
      {icon && (
        <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-500 mb-4">{message}</p>
      )}
      {action}
    </div>
  </Card>
);

export default Card;