import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      loadingState = true,
    } = options;

    try {
      if (loadingState) setLoading(true);
      setError(null);

      const result = await apiCall();

      if (showSuccessToast) {
        dispatch(addToast({
          type: 'success',
          title: 'Success',
          message: successMessage,
          duration: 3000,
        }));
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);

      if (showErrorToast) {
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
          duration: 5000,
        }));
      }

      throw err;
    } finally {
      if (loadingState) setLoading(false);
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};