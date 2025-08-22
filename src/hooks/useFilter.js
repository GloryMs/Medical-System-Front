import { useState, useMemo } from 'react';

export const useFilter = (data, initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '' || value === 'all') return true;
        
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(item[key]);
        }
        
        return item[key] === value;
      });
    });
  }, [data, filters]);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all' && (!Array.isArray(value) || value.length > 0)
  );

  return {
    filters,
    filteredData,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  };
};