// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   setNotifications,
//   addNotification,
//   markAsRead,
//   markAllAsRead,
//   removeNotification,
// } from '../store/slices/notificationSlice';
// import { useSocket } from './useSocket';

// export const useNotifications = () => {
//   const dispatch = useDispatch();
//   const { notifications, unreadCount, settings, isLoading, error } = useSelector(
//     state => state.notifications
//   );
//   const socket = useSocket();

//   useEffect(() => {
//     if (socket) {
//       // Listen for new notifications
//       socket.on('notification', (notification) => {
//         dispatch(addNotification(notification));
//       });

//       // Listen for notification updates
//       socket.on('notification_updated', (notification) => {
//         dispatch(markAsRead(notification.id));
//       });

//       return () => {
//         socket.off('notification');
//         socket.off('notification_updated');
//       };
//     }
//   }, [socket, dispatch]);

//   const markNotificationAsRead = (notificationId) => {
//     dispatch(markAsRead(notificationId));
//   };

//   const markAllNotificationsAsRead = () => {
//     dispatch(markAllAsRead());
//   };

//   const removeNotificationById = (notificationId) => {
//     dispatch(removeNotification(notificationId));
//   };

//   return {
//     notifications,
//     unreadCount,
//     settings,
//     isLoading,
//     error,
//     markAsRead: markNotificationAsRead,
//     markAllAsRead: markAllNotificationsAsRead,
//     removeNotification: removeNotificationById,
//   };
// };
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../store/slices/notificationSlice';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import patientService from '../services/api/patientService';
import doctorService from '../services/api/doctorService';
import adminService from '../services/api/adminService';

// Constants
const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds
const MAX_NOTIFICATIONS_IN_MEMORY = 50;

export const useNotifications = (autoRefresh = true, refreshInterval = AUTO_REFRESH_INTERVAL) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const socket = useSocket();
  
  const { 
    notifications, 
    unreadCount, 
    settings, 
    isLoading, 
    error 
  } = useSelector(state => state.notifications);

  // Track new notifications counter
  const previousUnreadCountRef = useRef(unreadCount);
  const newNotificationsCounterRef = useRef(0);
  
  // Track refresh intervals
  const refreshIntervalRef = useRef(null);
  const lastFetchTimeRef = useRef(null);

  /**
   * Get the appropriate service based on user role
   */
  const getServiceForRole = useCallback(() => {
    switch (user?.role) {
      case 'PATIENT':
        return patientService;
      case 'DOCTOR':
        return doctorService;
      case 'ADMIN':
        return adminService;
      default:
        return null;
    }
  }, [user?.role]);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const service = getServiceForRole();
      if (!service) {
        console.warn('No service found for user role:', user?.role);
        return;
      }

      const data = await service.getNotifications(user.id);
      
      if (data && Array.isArray(data)) {
        // Limit notifications in memory
        const limitedData = data.slice(0, MAX_NOTIFICATIONS_IN_MEMORY);
        dispatch(setNotifications(limitedData));
        lastFetchTimeRef.current = new Date();
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user?.id, user?.role, dispatch, getServiceForRole]);

  /**
   * Mark single notification as read and call API
   */
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const service = getServiceForRole();
      if (!service) return;

      // Optimistic update - update UI immediately
      dispatch(markAsRead(notificationId));

      // Call API to persist
      await service.markNotificationAsRead(notificationId, user.id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Consider reverting the optimistic update on error
    }
  }, [user?.id, dispatch, getServiceForRole]);

  /**
   * Mark all notifications as read and call API
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const service = getServiceForRole();
      if (!service) return;

      // Optimistic update
      dispatch(markAllAsRead());

      // Call API to persist
      await service.markAllNotificationsAsRead(user.id);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.id, dispatch, getServiceForRole]);

  /**
   * Remove notification
   */
  const removeNotificationById = useCallback((notificationId) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  /**
   * Calculate new notifications counter
   */
  const getNewNotificationsCount = useCallback(() => {
    const diff = unreadCount - previousUnreadCountRef.current;
    return diff > 0 ? diff : 0;
  }, [unreadCount]);

  /**
   * Reset new notifications counter
   */
  const resetNewNotificationsCounter = useCallback(() => {
    previousUnreadCountRef.current = unreadCount;
    newNotificationsCounterRef.current = 0;
  }, [unreadCount]);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !user?.id) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      return;
    }

    // Set up interval for auto-refresh
    refreshIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, user?.id, refreshInterval, fetchNotifications]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
      // Update new notifications counter
      newNotificationsCounterRef.current += 1;
    };

    const handleNotificationUpdated = (notification) => {
      dispatch(markAsRead(notification.id));
    };

    socket.on('notification', handleNewNotification);
    socket.on('notification_updated', handleNotificationUpdated);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('notification_updated', handleNotificationUpdated);
    };
  }, [socket, dispatch]);

  // Update counter ref when unread count changes
  useEffect(() => {
    if (unreadCount !== previousUnreadCountRef.current) {
      newNotificationsCounterRef.current += unreadCount - previousUnreadCountRef.current;
      previousUnreadCountRef.current = unreadCount;
    }
  }, [unreadCount]);

  return {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    lastFetchTime: lastFetchTimeRef.current,
    newNotificationsCount: getNewNotificationsCount(),
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    removeNotification: removeNotificationById,
    resetNewNotificationsCounter,
    refetch: fetchNotifications,
  };
};