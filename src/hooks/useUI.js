import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

export const useUI = () => {
  const dispatch = useDispatch();
  const ui = useSelector(state => state.ui);

  // Modal management
  const openModal = useCallback((modalName, props = {}) => {
    dispatch({ 
      type: 'ui/openModal', 
      payload: { name: modalName, props } 
    });
  }, [dispatch]);

  const closeModal = useCallback((modalName) => {
    dispatch({ 
      type: 'ui/closeModal', 
      payload: modalName 
    });
  }, [dispatch]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'ui/closeAllModals' });
  }, [dispatch]);

  // Toast/Notification management
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    dispatch({
      type: 'ui/addToast',
      payload: { id, message, type, duration }
    });

    // Auto-dismiss after duration
    setTimeout(() => {
      dispatch({ type: 'ui/removeToast', payload: id });
    }, duration);

    return id;
  }, [dispatch]);

  const dismissToast = useCallback((toastId) => {
    dispatch({ type: 'ui/removeToast', payload: toastId });
  }, [dispatch]);

  // Loading state management
  const setLoading = useCallback((isLoading, loadingText = '') => {
    dispatch({
      type: 'ui/setLoading',
      payload: { isLoading, loadingText }
    });
  }, [dispatch]);

  // Sidebar management
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'ui/toggleSidebar' });
  }, [dispatch]);

  const setSidebarOpen = useCallback((isOpen) => {
    dispatch({ 
      type: 'ui/setSidebar', 
      payload: isOpen 
    });
  }, [dispatch]);

  // Theme management
  const setTheme = useCallback((theme) => {
    dispatch({ 
      type: 'ui/setTheme', 
      payload: theme 
    });
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'ui/toggleTheme' });
  }, [dispatch]);

  // Drawer management
  const openDrawer = useCallback((drawerName, props = {}) => {
    dispatch({
      type: 'ui/openDrawer',
      payload: { name: drawerName, props }
    });
  }, [dispatch]);

  const closeDrawer = useCallback((drawerName) => {
    dispatch({
      type: 'ui/closeDrawer',
      payload: drawerName
    });
  }, [dispatch]);

  return {
    // State
    modals: ui?.modals || {},
    toasts: ui?.toasts || [],
    isLoading: ui?.isLoading || false,
    loadingText: ui?.loadingText || '',
    sidebarOpen: ui?.sidebarOpen !== false,
    theme: ui?.theme || 'light',
    drawers: ui?.drawers || {},
    
    // Actions
    openModal,
    closeModal,
    closeAllModals,
    showToast,
    dismissToast,
    setLoading,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleTheme,
    openDrawer,
    closeDrawer,
  };
};