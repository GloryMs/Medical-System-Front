// src/pages/communication/components/ConversationList.jsx
import React, { useEffect } from 'react';
import { Search, Circle, Clock } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  unreadCount
}) => {
  // Debug log
  React.useEffect(() => {
    console.log('ConversationList received conversations:', conversations);
    console.log('Conversations is array?', Array.isArray(conversations));
    console.log('Conversations length:', conversations?.length);
  }, [conversations]);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          {unreadCount > 0 && (
            <Badge variant="danger" className="px-2 py-1">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <>
            {/* Debug info - remove after fixing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-yellow-50 text-xs">
                Rendering {conversations.length} conversations
              </div>
            )}
            
            {conversations.map((conversation, index) => {
              console.log(`Rendering conversation ${index}:`, conversation);
              return (
                <ConversationItem
                  key={conversation.id || index}
                  conversation={conversation}
                  isSelected={conversation.id === selectedId}
                  onClick={() => onSelect(conversation)}
                />
              );
            })}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {conversations === null || conversations === undefined 
                ? 'Loading...' 
                : 'No conversations found'}
            </p>
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-red-500 mt-2">
                Conversations value: {JSON.stringify(conversations)}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary-50 border-l-4 border-l-primary-500' 
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${
            isSelected ? 'text-primary-900' : 'text-gray-900'
          }`}>
            {conversation.otherUserName || conversation.title || 'Unknown'}
          </h3>
          {conversation.isOnline && (
            <Circle className="w-2 h-2 fill-green-500 text-green-500 flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 ml-2">
          <Clock className="w-3 h-3" />
          {formatTime(conversation.lastMessageAt)}
        </span>
      </div>
      
      <p className={`text-sm truncate mb-2 ${
        conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
      }`}>
        {conversation.lastMessagePreview || 'No messages yet'}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          Case #{conversation.caseId}
        </Badge>
        {conversation.unreadCount > 0 && (
          <Badge variant="danger" className="px-2 py-0.5 text-xs">
            {conversation.unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ConversationList;