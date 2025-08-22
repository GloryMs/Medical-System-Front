import { useState, useCallback } from 'react';
import * as yup from 'yup';

export const useValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback(async (data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      setIsValid(false);
      return false;
    }
  }, [schema]);

  const validateField = useCallback(async (field, value) => {
    try {
      await schema.validateAt(field, { [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message
      }));
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
};