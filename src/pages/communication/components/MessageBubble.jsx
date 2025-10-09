// src/pages/communication/components/MessageBubble.jsx
import React from 'react';
import { Check, CheckCheck, FileText, Image as ImageIcon, Download } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end space-x-2 max-w-lg ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {showAvatar && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOwn ? 'bg-primary-500' : 'bg-gray-300'
          }`}>
            <span className="text-xs font-medium text-white">
              {message.senderName?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {!showAvatar && <div className="w-8" />}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {message.senderName}
            </span>
          )}

          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-primary-500 text-white rounded-br-sm'
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    isOwn={isOwn}
                  />
                ))}
              </div>
            )}

            <div className={`flex items-center space-x-1 mt-1 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}>
              <span className={`text-xs ${
                isOwn ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {formatTime(message.createdAt)}
              </span>
              
              {isOwn && (
                <span>
                  {message.isRead ? (
                    <CheckCheck className={`w-3 h-3 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`} />
                  ) : (
                    <Check className={`w-3 h-3 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`} />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttachmentPreview = ({ attachment, isOwn }) => {
  const isImage = attachment.fileType?.startsWith('image/');

  const handleDownload = () => {
    console.log('Download:', attachment.fileName);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      className={`flex items-center space-x-2 p-2 rounded ${
        isOwn ? 'bg-primary-600' : 'bg-gray-50'
      }`}
    >
      {isImage ? (
        <ImageIcon className={`w-4 h-4 ${isOwn ? 'text-primary-100' : 'text-gray-600'}`} />
      ) : (
        <FileText className={`w-4 h-4 ${isOwn ? 'text-primary-100' : 'text-gray-600'}`} />
      )}
      
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate ${isOwn ? 'text-primary-50' : 'text-gray-700'}`}>
          {attachment.fileName}
        </p>
        <p className={`text-xs ${isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
          {formatFileSize(attachment.fileSize)}
        </p>
      </div>
      
      <button
        onClick={handleDownload}
        className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
          isOwn ? 'hover:bg-primary-700' : 'hover:bg-gray-200'
        }`}
      >
        <Download className={`w-4 h-4 ${isOwn ? 'text-primary-100' : 'text-gray-600'}`} />
      </button>
    </div>
  );
};

export default MessageBubble;