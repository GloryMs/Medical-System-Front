import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export const useSearch = (data, searchFields, options = {}) => {
  const { debounceMs = 300, caseSensitive = false } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return data;

    const searchValue = caseSensitive 
      ? debouncedSearchTerm 
      : debouncedSearchTerm.toLowerCase();

    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;
        
        const stringValue = caseSensitive 
          ? String(fieldValue) 
          : String(fieldValue).toLowerCase();
          
        return stringValue.includes(searchValue);
      });
    });
  }, [data, debouncedSearchTerm, searchFields, caseSensitive]);

  const clearSearch = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
};