// src/pages/communication/components/ConversationView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, MoreVertical, Archive, Info, Loader } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import { useMessageSocket } from '../../../hooks/useMessageSocket';
import messageService from '../../../services/api/messageService';
import Badge from '../../../components/common/Badge';

const ConversationView = ({ conversation, onNewMessage, onConversationUpdate }) => {
  const { user } = useAuth();
  const { execute, loading } = useApi();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [typingUserName, setTypingUserName] = useState(null);

  const {
    isConnected,
    onNewMessage: onSocketNewMessage,
    onMessageRead: onSocketMessageRead,
    sendTypingStart,
    sendTypingStop,
    onTyping
  } = useMessageSocket(conversation?.id);

  useEffect(() => {
    // Only load messages if conversation exists (has an ID)
    if (conversation?.id && !conversation.isNew) {
      loadMessages();
    } else {
      // For new conversations, start with empty messages
      setMessages([]);
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id || conversation.isNew) return;

    const unsubscribeNewMessage = onSocketNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      if (onNewMessage) {
        onNewMessage(message);
      }
    });

    const unsubscribeMessageRead = onSocketMessageRead((data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt } 
            : msg
        )
      );
    });

    const unsubscribeTyping = onTyping((data) => {
      if (data.isTyping) {
        setTypingUserName(data.userName);
        setTimeout(() => setTypingUserName(null), 3000);
      } else {
        setTypingUserName(null);
      }
    });

    return () => {
      if (unsubscribeNewMessage) unsubscribeNewMessage();
      if (unsubscribeMessageRead) unsubscribeMessageRead();
      if (unsubscribeTyping) unsubscribeTyping();
    };
  }, [conversation?.id, onSocketNewMessage, onSocketMessageRead, onTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await execute(() => 
        messageService.getMessages(conversation.id, { page: 0, size: 100 })
      );
      setMessages((data || []).reverse());
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content, attachments) => {
    try {
      const messageData = {
        receiverId: conversation.otherUserId,
        caseId: conversation.caseId,
        content,
        messageType: attachments && attachments.length > 0 ? 'FILE' : 'TEXT',
        attachmentIds: attachments?.map(a => a.id) || []
      };

      const sentMessage = await execute(() => messageService.sendMessage(messageData));
      
      // Add message to local state immediately
      setMessages(prev => [...prev, sentMessage]);
      scrollToBottom();
      
      // If this was a new conversation, reload to get the conversation ID
      if (conversation.isNew) {
        if (onConversationUpdate) {
          onConversationUpdate();
        }
      }
      
      // Notify parent
      if (onNewMessage) {
        onNewMessage(sentMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleArchive = async () => {
    if (conversation.isNew || !conversation.id) {
      alert('Cannot archive a conversation that hasn\'t started yet');
      return;
    }
    
    try {
      await execute(() => messageService.archiveConversation(conversation.id));
      if (onConversationUpdate) {
        onConversationUpdate();
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation.otherUserName}
            </h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Case #{conversation.caseId}
              </Badge>
              {conversation.isNew && (
                <Badge variant="info" className="text-xs">
                  New Conversation
                </Badge>
              )}
              {isConnected && !conversation.isNew && (
                <span className="text-xs text-green-600">● Connected</span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                disabled={conversation.isNew}
              >
                <Archive className="w-4 h-4" />
                <span>Archive Conversation</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Info className="w-4 h-4" />
                <span>Case Details</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 bg-gray-50"
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : messages.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => {
              const showAvatar = 
                index === 0 || 
                messages[index - 1].senderId !== message.senderId;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user.id}
                  showAvatar={showAvatar}
                />
              );
            })}
            
            {typingUserName && <TypingIndicator userName={typingUserName} />}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No messages yet</p>
            <p className="text-sm text-gray-500">
              Start the conversation by sending a message below
            </p>
          </div>
        )}
      </div>

      <MessageInput
        onSend={handleSendMessage}
        onTypingStart={conversation.isNew ? null : sendTypingStart}
        onTypingStop={conversation.isNew ? null : sendTypingStop}
        disabled={false}
      />
    </div>
  );
};

export default ConversationView;