import { useState, useEffect, useCallback } from 'react';
import doctorService from '../services/api/doctorService';

/**
 * Custom hook for managing medical reports and pending cases
 * Provides centralized state management and data fetching
 * 
 * @returns {Object} Reports state and methods
 */
const useReports = () => {
  // Reports State
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  // Pending Cases State
  const [pendingCases, setPendingCases] = useState([]);
  const [filteredPendingCases, setFilteredPendingCases] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState(null);

  // Filters State
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [caseSearchTerm, setCaseSearchTerm] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    finalized: 0,
    pendingCases: 0
  });

  /**
   * Fetch all consultation reports
   */
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    
    try {
      const response = await doctorService.getConsultationReports();
      const reportsData = response;
      
      setReports(reportsData);
      
      // Calculate statistics
      const draftCount = reportsData.filter(r => r.status === 'DRAFT').length;
      const finalizedCount = reportsData.filter(r => r.status === 'FINALIZED').length;
      
      setStats(prev => ({
        ...prev,
        total: reportsData.length,
        draft: draftCount,
        finalized: finalizedCount
      }));
      
      return { success: true, data: reportsData };
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReportsError('Failed to load reports. Please try again.');
      return { success: false, error };
    } finally {
      setReportsLoading(false);
    }
  }, []);

  /**
   * Fetch pending cases (CONSULTATION_COMPLETE status)
   */
  const fetchPendingCases = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    
    try {
      const response = await doctorService.getAllCasses();
      const allCases = response;
      
      // Filter cases with CONSULTATION_COMPLETE status
      const consultationCompleteCases = allCases.filter(
        caseItem => caseItem.status === 'CONSULTATION_COMPLETE'
      );
      
      setPendingCases(consultationCompleteCases);
      setStats(prev => ({
        ...prev,
        pendingCases: consultationCompleteCases.length
      }));
      
      return { success: true, data: consultationCompleteCases };
    } catch (error) {
      console.error('Error fetching pending cases:', error);
      setPendingError('Failed to load pending cases. Please try again.');
      return { success: false, error };
    } finally {
      setPendingLoading(false);
    }
  }, []);

  /**
   * Filter reports based on search term and status
   */
  const filterReports = useCallback(() => {
    let filtered = [...reports];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by search term
    if (reportSearchTerm.trim()) {
      const search = reportSearchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.id.toString().includes(search) ||
        report.caseId.toString().includes(search) ||
        report.diagnosis?.toLowerCase().includes(search) ||
        report.doctor?.fullName?.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, reportSearchTerm]);

  /**
   * Filter pending cases based on search term
   */
  const filterPendingCases = useCallback(() => {
    let filtered = [...pendingCases];

    // Filter by search term
    if (caseSearchTerm.trim()) {
      const search = caseSearchTerm.toLowerCase();
      filtered = filtered.filter(caseItem => 
        caseItem.id.toString().includes(search) ||
        caseItem.description?.toLowerCase().includes(search) ||
        caseItem.diagnosis?.toLowerCase().includes(search) ||
        caseItem.patientName?.toLowerCase().includes(search)
      );
    }

    setFilteredPendingCases(filtered);
  }, [pendingCases, caseSearchTerm]);

  /**
   * Export report to PDF
   */
  const exportReportToPdf = useCallback(async (reportId) => {
    try {
      const response = await doctorService.exportReportToPdf(reportId);
      if (response.data?.success) {
        // Refresh reports to show updated status
        await fetchReports();
        return { success: true, message: 'Report exported to PDF successfully!' };
      }
      return { success: false, message: 'Export failed' };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { 
        success: false, 
        message: 'Failed to export report. Please try again.',
        error 
      };
    }
  }, [fetchReports]);

  /**
   * Delete a report (if supported by API)
   */
  const deleteReport = useCallback(async (reportId) => {
    try {
      await doctorService.deleteConsultationReport(reportId);
      await fetchReports();
      return { success: true, message: 'Report deleted successfully' };
    } catch (error) {
      console.error('Error deleting report:', error);
      return { 
        success: false, 
        message: 'Failed to delete report',
        error 
      };
    }
  }, [fetchReports]);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchReports(),
      fetchPendingCases()
    ]);
  }, [fetchReports, fetchPendingCases]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setReportSearchTerm('');
    setStatusFilter('ALL');
    setCaseSearchTerm('');
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    filterReports();
  }, [filterReports]);

  useEffect(() => {
    filterPendingCases();
  }, [filterPendingCases]);

  // Initial data fetch
  useEffect(() => {
    fetchReports();
    fetchPendingCases();
  }, [fetchReports, fetchPendingCases]);

  return {
    // Reports Data
    reports,
    filteredReports,
    reportsLoading,
    reportsError,
    
    // Pending Cases Data
    pendingCases,
    filteredPendingCases,
    pendingLoading,
    pendingError,
    
    // Statistics
    stats,
    
    // Filters
    reportSearchTerm,
    setReportSearchTerm,
    statusFilter,
    setStatusFilter,
    caseSearchTerm,
    setCaseSearchTerm,
    
    // Methods
    fetchReports,
    fetchPendingCases,
    refreshAll,
    exportReportToPdf,
    deleteReport,
    clearFilters,
    
    // Computed values
    hasReports: reports.length > 0,
    hasPendingCases: pendingCases.length > 0,
    isLoading: reportsLoading || pendingLoading,
    hasError: reportsError || pendingError
  };
};

export default useReports;