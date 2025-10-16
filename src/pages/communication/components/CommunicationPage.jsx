// src/pages/communication/CommunicationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Loader } from 'lucide-react';
import ConversationView from './ConversationView';
import ConversationList from './ConversationList';
import { useAuth } from '../../../hooks/useAuth';
import { useApi } from '../../../hooks/useApi';
import messageService from '../../../services/api/messageService';

// // src/pages/communication/components/CommunicationPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { MessageSquare, Loader } from 'lucide-react';
// import ConversationView from './ConversationView';
// import ConversationList from './ConversationList'; // FIXED: Was importing ConversationView instead
// import { useAuth } from '../../../hooks/useAuth';
// import { useApi } from '../../../hooks/useApi';
// import messageService from '../../../services/api/messageService';

const CommunicationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.caseId) {
      loadConversationByCase(location.state.caseId);
    }
  }, [location.state]);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [filterStatus]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus.toUpperCase();
      }

      const data = await messageService.getConversations(filters);
      
      console.log('Conversations loaded:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Length:', data?.length);
      
      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        console.error('Data is not an array:', data);
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationByCase = async (caseId) => {
    try {
      const conversation = await messageService.getConversationByCase(caseId);
      
      console.log('Conversation by case loaded:', conversation);
      
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Conversation not found for case:', caseId, error);
      
      // Create a temporary conversation object for UI
      const tempConversation = {
        id: null,
        caseId: caseId,
        title: `Case #${caseId}`,
        patientName: location.state?.patientName || 'Patient',
        doctorName: user?.fullName ||'Doctor',
        //otherUserName: location.state?.patientName || location.state?.doctorName || 'User',
        otherUserId: location.state?.patientId || location.state?.doctorId,
        isNew: true,
        unreadCount: 0,
        totalMessagesCount: 0
      };

      console.log( 'patientName:' +  location.state?.patientName || 'Not found');
      console.log( 'patientId:' +  location.state?.patientId || 'Not found');

      setSelectedConversation(tempConversation);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await messageService.getUnreadCount();
      
      console.log('Unread count loaded:', data);
      
      setUnreadCount(data?.totalUnread || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log('Conversation selected:', conversation);
    setSelectedConversation(conversation);
    
    if (conversation.unreadCount > 0 && conversation.id) {
      messageService.markConversationAsRead(conversation.id)
        .then(() => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === conversation.id
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
          loadUnreadCount();
        })
        .catch(console.error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadConversations();
      return;
    }

    try {
      const data = await messageService.searchConversations(query);
      
      console.log('Search results:', data);
      
      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setConversations([]);
    }
  };

  const handleNewMessage = (message) => {
    console.log('New message received:', message);
    
    // Reload conversations to get the newly created one
    loadConversations();
    
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessagePreview: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: conv.id === selectedConversation?.id ? 0 : conv.unreadCount + 1
          };
        }
        return conv;
      });

      return updated.sort((a, b) => 
        new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
    });

    loadUnreadCount();
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('Conversations state updated:', conversations);
  }, [conversations]);

  useEffect(() => {
    console.log('Selected conversation updated:', selectedConversation);
  }, [selectedConversation]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Debug Info - Remove this after fixing */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded z-50">
          Conversations: {conversations.length} | Unread: {unreadCount}
        </div>
      )}
       */}
      <div className="w-80 border-r bg-white flex flex-col shadow-sm">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          unreadCount={unreadCount}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            onNewMessage={handleNewMessage}
            onConversationUpdate={loadConversations}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-500">Select a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationPage;