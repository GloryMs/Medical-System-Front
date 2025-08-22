import { useState, useMemo } from 'react';

export const useSort = (data, initialSort = { key: null, direction: 'asc' }) => {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle different data types
      let comparison = 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        // Fallback to string comparison
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig]);

  const sort = (key) => {
    setSortConfig(prevConfig => {
      // If clicking the same column, toggle direction
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // Otherwise, sort ascending by the new column
      return { key, direction: 'asc' };
    });
  };

  const clearSort = () => {
    setSortConfig({ key: null, direction: 'asc' });
  };

  const setSortDirection = (direction) => {
    setSortConfig(prev => ({ ...prev, direction }));
  };

  const setSortKey = (key) => {
    setSortConfig(prev => ({ ...prev, key }));
  };

  return {
    sortedData,
    sortConfig,
    sort,
    clearSort,
    setSortDirection,
    setSortKey,
    isSorted: sortConfig.key !== null,
  };
};