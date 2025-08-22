import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:8080', {
        auth: {
          token: localStorage.getItem('accessToken'),
          userId: user.id,
          userRole: user.role,
        },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socket = null;
          setIsConnected(false);
        }
      };
    }
  }, [isAuthenticated, user]);

  return socket;
};