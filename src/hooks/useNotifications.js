import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../store/slices/notificationSlice';
import { useSocket } from './useSocket';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, settings, isLoading, error } = useSelector(
    state => state.notifications
  );
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      // Listen for new notifications
      socket.on('notification', (notification) => {
        dispatch(addNotification(notification));
      });

      // Listen for notification updates
      socket.on('notification_updated', (notification) => {
        dispatch(markAsRead(notification.id));
      });

      return () => {
        socket.off('notification');
        socket.off('notification_updated');
      };
    }
  }, [socket, dispatch]);

  const markNotificationAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead());
  };

  const removeNotificationById = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  return {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    removeNotification: removeNotificationById,
  };
};