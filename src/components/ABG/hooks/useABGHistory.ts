import { useState, useEffect, useCallback } from 'react';
import { ABGResult, ABGFilters, PatientInfo } from '../../../types/abg';
import { getUserABGResults, deleteABGResult, getUserPatients } from '../../../services/abgService';

interface ABGHistoryStats {
  totalResults: number;
  thisWeek: number;
  thisMonth: number;
  avgProcessingTime: number;
  successRate: number;
  avgConfidence: number;
}

interface UseABGHistoryProps {
  patientId?: string;
}

export const useABGHistory = ({ patientId }: UseABGHistoryProps = {}) => {
  // State
  const [results, setResults] = useState<ABGResult[]>([]);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ABGFilters>({
    ...(patientId ? { patientId } : {})
  });
  const [stats, setStats] = useState<ABGHistoryStats>({
    totalResults: 0,
    thisWeek: 0,
    thisMonth: 0,
    avgProcessingTime: 0,
    successRate: 100,
    avgConfidence: 0
  });

  // Load patients
  const loadPatients = useCallback(async () => {
    try {
      const patientData = await getUserPatients();
      setPatients(patientData);
    } catch (error) {

    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((data: ABGResult[]): ABGHistoryStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekCount = data.filter(r => 
      new Date(r.created_at) > weekAgo
    ).length;
    
    const thisMonthCount = data.filter(r => 
      new Date(r.created_at) > monthAgo
    ).length;
    
    const avgProcessingTime = data
      .filter(r => r.processing_time_ms)
      .reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / 
      Math.max(1, data.filter(r => r.processing_time_ms).length);

    const avgConfidence = data
      .filter(r => r.gemini_confidence)
      .reduce((sum, r) => sum + (r.gemini_confidence || 0), 0) / 
      Math.max(1, data.filter(r => r.gemini_confidence).length);
    
    return {
      totalResults: data.length,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      avgProcessingTime: Math.round(avgProcessingTime),
      successRate: 100, // Assuming all loaded results are successful
      avgConfidence: Math.round(avgConfidence * 100)
    };
  }, []);

  // Load results
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserABGResults(filters);
      setResults(data);
      setStats(calculateStats(data));
    } catch (err) {

      setError('Failed to load results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, calculateStats]);

  // Load initial data
  useEffect(() => {
    loadResults();
    loadPatients();
  }, [loadResults, loadPatients]);

  // Handle bulk selection
  const handleBulkSelect = useCallback((resultId: string, selected: boolean) => {
    setSelectedResults(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(resultId);
      } else {
        newSet.delete(resultId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allSelected = selectedResults.size === results.length;
    if (allSelected) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(results.map(r => r.id)));
    }
  }, [results, selectedResults]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedResults.size === 0 || !window.confirm('Are you sure you want to delete the selected results?')) {
      return;
    }

    try {
      setIsLoading(true);
      // Delete selected results
      await Promise.all(
        Array.from(selectedResults).map(id => deleteABGResult(id))
      );
      
      // Clear selection and reload
      setSelectedResults(new Set());
      await loadResults();
    } catch (error) {

      setError('Failed to delete results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedResults, loadResults]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedResults(new Set());
  }, []);

  // Get selected results data
  const getSelectedResults = useCallback((): ABGResult[] => {
    if (selectedResults.size === 0) return results;
    return results.filter(r => selectedResults.has(r.id));
  }, [results, selectedResults]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<ABGFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Data
    results,
    patients,
    selectedResults,
    stats,
    filters,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    loadResults,
    handleBulkSelect,
    handleSelectAll,
    handleBulkDelete,
    clearSelection,
    getSelectedResults,
    handleFiltersChange,
    
    // Computed values
    hasSelection: selectedResults.size > 0,
    selectedCount: selectedResults.size,
    canCompare: selectedResults.size >= 2
  };
};