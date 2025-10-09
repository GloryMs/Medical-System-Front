// src/pages/communication/components/TypingIndicator.jsx
import React from 'react';

const TypingIndicator = ({ userName }) => {
  return (
    <div className="flex items-end space-x-2">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-white">
          {userName?.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;