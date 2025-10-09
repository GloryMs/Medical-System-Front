// src/hooks/useMessageSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useMessageSocket = (conversationId) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    if (!conversationId || !user || !token) return;

    const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:8087', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socket.emit('join_conversation', { conversationId, userId: user.id });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.emit('leave_conversation', { conversationId, userId: user.id });
        socket.disconnect();
      }
    };
  }, [conversationId, user, token]);

  const onNewMessage = useCallback((callback) => {
    if (!socketRef.current) return;
    socketRef.current.on('new_message', callback);
    
    return () => {
      socketRef.current?.off('new_message', callback);
    };
  }, []);

  const onMessageRead = useCallback((callback) => {
    if (!socketRef.current) return;
    socketRef.current.on('message_read', callback);
    
    return () => {
      socketRef.current?.off('message_read', callback);
    };
  }, []);

  const onMessageDeleted = useCallback((callback) => {
    if (!socketRef.current) return;
    socketRef.current.on('message_deleted', callback);
    
    return () => {
      socketRef.current?.off('message_deleted', callback);
    };
  }, []);

  const sendTypingStart = useCallback(() => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit('typing_start', {
      conversationId,
      userId: user?.id,
      userName: user?.name
    });
  }, [conversationId, user, isConnected]);

  const sendTypingStop = useCallback(() => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit('typing_stop', {
      conversationId,
      userId: user?.id
    });
  }, [conversationId, user, isConnected]);

  const onTyping = useCallback((callback) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('user_typing_start', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
        callback({ ...data, isTyping: true });
      }
    });

    socketRef.current.on('user_typing_stop', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
        callback({ ...data, isTyping: false });
      }
    });

    return () => {
      socketRef.current?.off('user_typing_start');
      socketRef.current?.off('user_typing_stop');
    };
  }, [user]);

  const onOnlineStatus = useCallback((callback) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
      callback({ ...data, isOnline: true });
    });

    socketRef.current.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
      callback({ ...data, isOnline: false });
    });

    return () => {
      socketRef.current?.off('user_online');
      socketRef.current?.off('user_offline');
    };
  }, []);

  const updateOnlineStatus = useCallback((isOnline) => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit('update_online_status', {
      userId: user?.id,
      isOnline
    });
  }, [user, isConnected]);

  return {
    isConnected,
    socket: socketRef.current,
    onNewMessage,
    onMessageRead,
    onMessageDeleted,
    sendTypingStart,
    sendTypingStop,
    onTyping,
    onOnlineStatus,
    updateOnlineStatus,
    onlineUsers: Array.from(onlineUsers),
    typingUsers: Array.from(typingUsers)
  };
};