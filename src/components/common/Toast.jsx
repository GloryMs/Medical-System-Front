import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { removeToast } from '../../store/slices/uiSlice';

const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration = 5000 } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto 
        ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all 
        duration-300 ease-in-out animate-slide-up
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${iconStyles[type]}`}>
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            <p className={`text-sm ${title ? 'mt-1' : ''} text-gray-500`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => onRemove(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full transition-all ease-linear ${
              type === 'success' ? 'bg-green-400' :
              type === 'error' ? 'bg-red-400' :
              type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(state => state.ui.toasts);

  const handleRemove = (toastId) => {
    dispatch(removeToast(toastId));
  };

  return (
    <div 
      aria-live="assertive" 
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onRemove={handleRemove} 
          />
        ))}
      </div>
    </div>
  );
};

// Hook for using toasts
export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (toast) => {
    dispatch(addToast(toast));
  };

  const showSuccess = (message, title = 'Success') => {
    showToast({ type: 'success', title, message });
  };

  const showError = (message, title = 'Error') => {
    showToast({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Warning') => {
    showToast({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Info') => {
    showToast({ type: 'info', title, message });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default ToastContainer;