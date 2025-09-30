import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const DocumentViewerModal = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Modal - Full screen */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-[95vw] bg-white rounded-lg shadow-xl transform transition-all"
             style={{ height: '90vh' }}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon={<X className="w-4 h-4" />}
                  className="text-gray-400 hover:text-gray-600"
                />
              )}
            </div>
          )}

          {/* Content - Full height without max-h restriction */}
          <div className="overflow-y-auto" style={{ height: 'calc(90vh - 80px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;