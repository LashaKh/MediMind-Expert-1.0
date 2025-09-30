// useDiagnosisSelection Hook
// Enhanced diagnosis selection with search, filtering, and validation
// Evidence-based ICD-10 code management with medical literature references

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UseDiagnosisSelectionReturn, DiagnosisCode, DiagnosisCategory } from '../../../types/form100';
import { 
  DIAGNOSIS_CODES, 
  DIAGNOSIS_CATEGORIES,
  getDiagnosisByCategory,
  searchDiagnoses,
  getActiveCategories,
  getDiagnosesBySeverity,
  getDiagnosisByCode,
  validateDiagnosisCode
} from '../config/diagnosisConfig';

// Search history for improved UX
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

// Diagnosis selection filters
interface DiagnosisFilters {
  severity?: DiagnosisCode['severity'][];
  categories?: string[];
  hasReferences?: boolean;
  recentlyUsed?: boolean;
}

export const useDiagnosisSelection = (
  initialCategory?: string,
  initialDiagnosis?: DiagnosisCode
): UseDiagnosisSelectionReturn => {
  // Core state
  const [categories] = useState<DiagnosisCategory[]>(getActiveCategories());
  const [diagnoses, setDiagnoses] = useState<DiagnosisCode[]>(DIAGNOSIS_CODES.filter(d => d.isActive));
  const [selectedCategory, setSelectedCategory] = useState<DiagnosisCategory | null>(
    initialCategory ? categories.find(c => c.id === initialCategory) || null : null
  );
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisCode | null>(initialDiagnosis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DiagnosisFilters>({});
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisCode[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    try {
      // Load search history
      const savedHistory = localStorage.getItem('medimind-diagnosis-search-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history.slice(0, 10)); // Keep last 10 searches
      }

      // Load recent diagnoses
      const savedRecent = localStorage.getItem('medimind-recent-diagnoses');
      if (savedRecent) {
        const recent = JSON.parse(savedRecent);
        setRecentDiagnoses(recent.slice(0, 5)); // Keep last 5 diagnoses
      }
    } catch (error) {
    }
  }, []);

  // Filter diagnoses based on current state
  const filteredDiagnoses = useMemo(() => {
    let result = [...diagnoses];

    // Apply search query
    if (searchQuery.trim()) {
      result = searchDiagnoses(searchQuery.trim());
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(d => d.category === selectedCategory.id);
    }

    // Apply additional filters
    if (filters.severity?.length) {
      result = result.filter(d => d.severity && filters.severity!.includes(d.severity));
    }

    if (filters.categories?.length) {
      result = result.filter(d => filters.categories!.includes(d.category));
    }

    if (filters.hasReferences) {
      result = result.filter(d => d.references && d.references.length > 0);
    }

    if (filters.recentlyUsed) {
      const recentIds = recentDiagnoses.map(d => d.id);
      result = result.filter(d => recentIds.includes(d.id));
    }

    // Sort by relevance and severity
    result.sort((a, b) => {
      // Prioritize exact code matches
      if (searchQuery && validateDiagnosisCode(searchQuery)) {
        if (a.code.toLowerCase() === searchQuery.toLowerCase()) return -1;
        if (b.code.toLowerCase() === searchQuery.toLowerCase()) return 1;
      }

      // Then by severity (critical first)
      const severityOrder = { critical: 0, severe: 1, moderate: 2, mild: 3 };
      const aSeverity = severityOrder[a.severity || 'mild'];
      const bSeverity = severityOrder[b.severity || 'mild'];
      
      if (aSeverity !== bSeverity) {
        return aSeverity - bSeverity;
      }

      // Finally alphabetically
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [diagnoses, searchQuery, selectedCategory, filters, recentDiagnoses]);

  // Set category with filtering
  const setCategory = useCallback((category: DiagnosisCategory) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when selecting category
    setError(null);
    
    // Update filtered diagnoses
    const categoryDiagnoses = getDiagnosisByCategory(category.id);
    setDiagnoses(categoryDiagnoses);
  }, []);

  // Set diagnosis with persistence
  const setDiagnosis = useCallback((diagnosis: DiagnosisCode) => {
    setSelectedDiagnosis(diagnosis);
    setError(null);
    
    // Add to recent diagnoses
    setRecentDiagnoses(prev => {
      const filtered = prev.filter(d => d.id !== diagnosis.id);
      const updated = [diagnosis, ...filtered].slice(0, 5);
      
      // Persist to localStorage
      try {
        localStorage.setItem('medimind-recent-diagnoses', JSON.stringify(updated));
      } catch (error) {
      }
      
      return updated;
    });
  }, []);

  // Search diagnoses with history tracking
  const searchDiagnosesCallback = useCallback(async (query: string): Promise<DiagnosisCode[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = searchDiagnoses(query);
      
      // Update search history
      if (query.trim()) {
        const historyItem: SearchHistoryItem = {
          query: query.trim(),
          timestamp: Date.now(),
          resultCount: results.length
        };
        
        setSearchHistory(prev => {
          const filtered = prev.filter(h => h.query !== query.trim());
          const updated = [historyItem, ...filtered].slice(0, 10);
          
          // Persist to localStorage
          try {
            localStorage.setItem('medimind-diagnosis-search-history', JSON.stringify(updated));
          } catch (error) {
          }
          
          return updated;
        });
      }
      
      setSearchQuery(query);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data from configuration
  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay for consistency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reset to fresh data
      setDiagnoses(DIAGNOSIS_CODES.filter(d => d.isActive));
      
      // Clear filters and search
      setSearchQuery('');
      setFilters({});
      setSelectedCategory(null);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get diagnoses by severity
  const getDiagnosesBySeverityCallback = useCallback((severity: DiagnosisCode['severity']) => {
    return getDiagnosesBySeverity(severity);
  }, []);

  // Get diagnosis by code
  const getDiagnosisByCodeCallback = useCallback((code: string) => {
    return getDiagnosisByCode(code);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<DiagnosisFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setSelectedCategory(null);
    setDiagnoses(DIAGNOSIS_CODES.filter(d => d.isActive));
  }, []);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const activeFilters: string[] = [];
    
    if (selectedCategory) {
      activeFilters.push(`Category: ${selectedCategory.name}`);
    }
    
    if (filters.severity?.length) {
      activeFilters.push(`Severity: ${filters.severity.join(', ')}`);
    }
    
    if (filters.hasReferences) {
      activeFilters.push('Has References');
    }
    
    if (filters.recentlyUsed) {
      activeFilters.push('Recently Used');
    }
    
    if (searchQuery) {
      activeFilters.push(`Search: "${searchQuery}"`);
    }
    
    return activeFilters;
  }, [selectedCategory, filters, searchQuery]);

  // Validate current selection
  const isValidSelection = useMemo(() => {
    return selectedDiagnosis !== null && 
           selectedDiagnosis.isActive && 
           validateDiagnosisCode(selectedDiagnosis.code);
  }, [selectedDiagnosis]);

  return {
    // Core state
    categories,
    diagnoses: filteredDiagnoses,
    selectedCategory,
    selectedDiagnosis,
    isLoading,
    error,
    
    // Actions
    setCategory,
    setDiagnosis,
    searchDiagnoses: searchDiagnosesCallback,
    refreshData,
    
    // Filtering
    filters,
    updateFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    
    // Utilities
    getDiagnosesBySeverity: getDiagnosesBySeverityCallback,
    getDiagnosisByCode: getDiagnosisByCodeCallback,
    recentDiagnoses,
    searchHistory,
    filterSummary: getFilterSummary(),
    isValidSelection,
    
    // Statistics
    totalDiagnoses: DIAGNOSIS_CODES.filter(d => d.isActive).length,
    filteredCount: filteredDiagnoses.length
  };
};