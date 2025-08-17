import { useState, useEffect, useCallback, useMemo } from 'react';
import { ABGSearchFilters } from '../../../types/abg';

interface UseAdvancedSearchProps {
  initialFilters: ABGSearchFilters;
  onSearch: (filters: ABGSearchFilters) => void;
  onReset: () => void;
  onClose: () => void;
}

interface UseAdvancedSearchReturn {
  filters: ABGSearchFilters;
  activeSection: string;
  searchQuery: string;
  isSearching: boolean;
  hasChanges: boolean;
  activeFiltersCount: number;
  setActiveSection: (section: string) => void;
  setSearchQuery: (query: string) => void;
  updateFilter: (key: keyof ABGSearchFilters, value: any) => void;
  removeFilter: (key: keyof ABGSearchFilters) => void;
  handleSearch: () => void;
  handleReset: () => void;
}

export const useAdvancedSearch = ({
  initialFilters,
  onSearch,
  onReset,
  onClose
}: UseAdvancedSearchProps): UseAdvancedSearchReturn => {
  const [filters, setFilters] = useState<ABGSearchFilters>(initialFilters);
  const [activeSection, setActiveSection] = useState<string>('clinical');
  const [searchQuery, setSearchQuery] = useState(initialFilters.keyword || '');
  const [isSearching, setIsSearching] = useState(false);

  // Memoized computed values
  const hasChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters) || searchQuery.length > 0;
  }, [filters, initialFilters, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    const filtersCount = Object.keys(filters).filter(key => {
      const value = filters[key as keyof ABGSearchFilters];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    return filtersCount + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  // Update filters when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
    setSearchQuery(initialFilters.keyword || '');
  }, [initialFilters]);

  const updateFilter = useCallback((key: keyof ABGSearchFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === '' || value === undefined || value === null ? undefined : value 
    }));
  }, []);

  const removeFilter = useCallback((key: keyof ABGSearchFilters) => {
    setFilters(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    
    const searchFilters = { ...filters, keyword: searchQuery || undefined };
    
    // Simulate search delay for smooth UX
    setTimeout(() => {
      onSearch(searchFilters);
      setIsSearching(false);
      onClose();
    }, 1200);
  }, [filters, searchQuery, onSearch, onClose]);

  const handleReset = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    onReset();
  }, [onReset]);

  return {
    filters,
    activeSection,
    searchQuery,
    isSearching,
    hasChanges,
    activeFiltersCount,
    setActiveSection,
    setSearchQuery,
    updateFilter,
    removeFilter,
    handleSearch,
    handleReset
  };
};