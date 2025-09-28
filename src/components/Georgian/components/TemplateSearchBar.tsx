/**
 * Template Search Bar Component
 * 
 * Search and filter interface for custom templates.
 * Mobile-optimized with keyboard handling and responsive design.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  SortAsc,
  SortDesc,
  Calendar,
  TrendingUp,
  Type,
} from 'lucide-react';
import { TEMPLATE_SORT_OPTIONS, TEMPLATE_SORT_DIRECTIONS } from '../../../types/templates';
import type { TemplateSearchBarProps } from '../../../types/templates';

export const TemplateSearchBar: React.FC<TemplateSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  isLoading = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile keyboard detection and handling
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.screen.height;
        const heightDifference = windowHeight - viewportHeight;
        
        // Detect keyboard if viewport height decreased significantly (>150px)
        const isKeyboardVisible = heightDifference > 150;
        setKeyboardVisible(isKeyboardVisible);
        
        // Adjust scroll behavior when keyboard appears
        if (isKeyboardVisible && searchFocused) {
          setTimeout(() => {
            searchInputRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 100);
        }
      }
    };

    // Listen for viewport changes (mobile keyboard)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    } else {
      // Fallback for browsers without visualViewport
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [searchFocused]);

  // Handle search input with mobile optimization
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  // Handle search focus with mobile keyboard optimization
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
    // Automatically hide filters when keyboard appears to save space
    if (showFilters) {
      setShowFilters(false);
    }
  }, [showFilters]);

  // Handle search blur
  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  // Clear search with focus management
  const clearSearch = useCallback(() => {
    onSearchChange('');
    // Keep focus on input after clearing for better UX
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, [onSearchChange]);

  // Handle Enter key for mobile keyboard "Go" button
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Blur input to hide mobile keyboard if needed
      searchInputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      clearSearch();
      searchInputRef.current?.blur();
    }
  }, [clearSearch]);

  // Handle filter changes
  const handleOrderByChange = useCallback((orderBy: typeof filters.order_by) => {
    onFiltersChange({
      ...filters,
      order_by: orderBy,
    });
  }, [filters, onFiltersChange]);

  const handleOrderDirectionChange = useCallback((direction: typeof filters.order_direction) => {
    onFiltersChange({
      ...filters,
      order_direction: direction,
    });
  }, [filters, onFiltersChange]);

  // Toggle filters
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Get sort option details
  const currentSortOption = useMemo(() => {
    return TEMPLATE_SORT_OPTIONS.find(option => option.value === filters.order_by);
  }, [filters.order_by]);

  const currentSortDirection = useMemo(() => {
    return TEMPLATE_SORT_DIRECTIONS.find(direction => direction.value === filters.order_direction);
  }, [filters.order_direction]);

  // Get sort icon
  const getSortIcon = useCallback((orderBy: string) => {
    switch (orderBy) {
      case 'created_at':
        return Calendar;
      case 'usage_count':
        return TrendingUp;
      case 'name':
        return Type;
      default:
        return Calendar;
    }
  }, []);

  const SortIcon = getSortIcon(filters.order_by);

  return (
    <div 
      ref={containerRef}
      className={`space-y-3 transition-all duration-300 ${keyboardVisible ? 'pb-2' : ''}`}
    >
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input - Mobile optimized */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search templates by name or content..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="search"
            disabled={isLoading}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-all duration-200 ${
              searchFocused 
                ? 'border-[#2b6cb0] shadow-md ring-2 ring-[#2b6cb0]/20' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              keyboardVisible ? 'text-base' : 'text-sm'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              minHeight: '48px',
              fontSize: keyboardVisible ? '16px' : undefined // Prevents zoom on iOS
            }}
          />
          
          {/* Clear Search Button - Mobile optimized */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-label="Clear search"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button - Hidden when keyboard is visible for better mobile UX */}
        {!keyboardVisible && (
          <button
            onClick={toggleFilters}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              showFilters 
                ? 'bg-[#2b6cb0] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '48px' }}
            aria-label="Toggle sort options"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Sort</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter Panel - Hidden when keyboard is visible on mobile */}
      {showFilters && !keyboardVisible && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Sort By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEMPLATE_SORT_OPTIONS.map((option) => {
                const OptionIcon = getSortIcon(option.value);
                const isSelected = filters.order_by === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOrderByChange(option.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#2b6cb0] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <OptionIcon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Direction */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Order
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_SORT_DIRECTIONS.map((direction) => {
                const isSelected = filters.order_direction === direction.value;
                const DirectionIcon = direction.value === 'asc' ? SortAsc : SortDesc;
                
                return (
                  <button
                    key={direction.value}
                    onClick={() => handleOrderDirectionChange(direction.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#2b6cb0] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <DirectionIcon className="w-4 h-4" />
                    <span>{direction.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Filters Summary */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <SortIcon className="w-4 h-4" />
                <span>
                  Sorted by {currentSortOption?.label} ({currentSortDirection?.label})
                </span>
              </div>
              <button
                onClick={() => {
                  onFiltersChange({
                    search: '',
                    order_by: 'created_at',
                    order_direction: 'desc',
                  });
                  onSearchChange('');
                }}
                className="text-sm text-[#2b6cb0] hover:underline"
              >
                Reset all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {searchQuery && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Searching for "{searchQuery}"</span>
          <button
            onClick={clearSearch}
            className="text-[#2b6cb0] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};