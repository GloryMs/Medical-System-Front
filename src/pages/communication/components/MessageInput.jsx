// src/pages/communication/components/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader } from 'lucide-react';
import Button from '../../../components/common/Button';

const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      if (onTypingStart) {
        onTypingStart();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingStop) {
          onTypingStop();
        }
      }, 2000);
    } else {
      if (onTypingStop) {
        onTypingStop();
      }
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        file
      }));

      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && attachments.length === 0) return;
    if (isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedMessage, attachments);
      
      setMessage('');
      setAttachments([]);
      
      if (onTypingStop) {
        onTypingStop();
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 max-w-xs"
              >
                <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '150px' }}
            />
          </div>

          <Button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
            className="px-4 py-3"
          >
            {isSending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {disabled && (
          <p className="text-sm text-red-500 mt-2">
            Connection lost. Trying to reconnect...
          </p>
        )}
      </form>
    </div>
  );
};

export default MessageInput;