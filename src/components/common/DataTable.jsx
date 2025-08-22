import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  RefreshCw,
  Plus
} from 'lucide-react';
import Button from './Button';

const DataTable = ({ 
  columns = [],
  data = [],
  searchable = true,
  filterable = true,
  sortable = true,
  exportable = false,
  selectable = false,
  pagination = true,
  itemsPerPage = 10,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  onRefresh,
  onAdd,
  onRowClick,
  onSelectionChange,
  className = '',
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filters, setFilters] = useState({});

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm && Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || columns.some(column => {
        const value = item[column.key];
        return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Custom filters
      const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const itemValue = item[key];
        return itemValue && String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
    
    if (onSelectionChange) {
      onSelectionChange(checked ? paginatedData : []);
    }
  };

  const handleSelectRow = (index, checked) => {
    const newSelectedRows = new Set(selectedRows);
    
    if (checked) {
      newSelectedRows.add(index);
    } else {
      newSelectedRows.delete(index);
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selectedData = Array.from(newSelectedRows).map(i => paginatedData[i]);
      onSelectionChange(selectedData);
    }
  };

  const exportData = () => {
    // Simple CSV export
    const headers = columns.map(col => col.title).join(',');
    const rows = sortedData.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-export.csv';
    link.click();
    
    window.URL.revokeObjectURL(url);
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} icon={<RefreshCw className="w-4 h-4" />}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Table Header Controls */}
      {(searchable || filterable || exportable || onAdd || onRefresh) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {searchable && (
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {filterable && (
                <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                  Filter
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {exportable && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportData}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
              )}
              
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefresh}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              )}
              
              {onAdd && (
                <Button 
                  size="sm"
                  onClick={onAdd}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add New
                </Button>
              )}
            </div>
          </div>
          
          {/* Selected rows info */}
          {selectable && selectedRows.size > 0 && (
            <div className="mt-3 flex items-center justify-between bg-primary-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-primary-700">
                {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedRows(new Set());
                  if (onSelectionChange) onSelectionChange([]);
                }}
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && (
                      <span className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-primary-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-primary-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => handleSelectRow(index, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item, index) : (
                        <span className={column.className || ''}>
                          {item[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default DataTable;