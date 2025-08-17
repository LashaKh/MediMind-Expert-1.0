import React, { useState } from 'react';
import { Search, Filter, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { DOCUMENT_CATEGORIES, DocumentCategory, ProcessingStatus } from '../../lib/api/knowledgeBase';

export interface SearchFilters {
  searchTerm: string;
  status: 'all' | ProcessingStatus;
  category: 'all' | DocumentCategory;
  tags: string[];
  dateRange: {
    from: string;
    to: string;
  };
}

interface DocumentSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags?: string[];
  totalDocuments: number;
  filteredDocuments: number;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  totalDocuments,
  filteredDocuments
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: 'all',
      category: 'all',
      tags: [],
      dateRange: { from: '', to: '' }
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = filters.searchTerm || 
                          filters.status !== 'all' || 
                          filters.category !== 'all' || 
                          filters.tags.length > 0 ||
                          filters.dateRange.from ||
                          filters.dateRange.to;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 transition-all duration-200">
      {/* Main Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        {/* Enhanced Search Input */}
        <div className="flex-1">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search documents by title, filename, or tags..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
            {filters.searchTerm && (
              <button
                onClick={() => updateFilters({ searchTerm: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Quick Status Filter */}
        <div className="flex items-center space-x-2 min-w-0 sm:min-w-fit">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value as any })}
            className="px-3 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 min-w-0"
          >
            <option value="all">All Status</option>
            <option value="completed">Ready</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Error</option>
          </select>
        </div>

        {/* Enhanced Advanced Filters Toggle - Mobile Optimized */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`inline-flex items-center justify-center space-x-2 px-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            showAdvancedFilters 
              ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <span className="whitespace-nowrap font-medium">Advanced</span>
          {showAdvancedFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Enhanced Advanced Filters with smooth animation */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Category and Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enhanced Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="inline w-4 h-4 mr-1" />
                Document Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value as any })}
                className="w-full px-3 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="all">All Categories</option>
                {DOCUMENT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Date Range Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="inline w-4 h-4 mr-1" />
                Upload Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, from: e.target.value }
                  })}
                  className="px-3 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, to: e.target.value }
                  })}
                  className="px-3 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Tag Filters */}
          {availableTags.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    className={`inline-flex items-center px-4 py-3 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      filters.tags.includes(tag)
                        ? 'bg-primary text-white shadow-md transform scale-105 focus:ring-primary'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 hover:scale-105 focus:ring-gray-400'
                    }`}
                  >
                    {tag}
                    {filters.tags.includes(tag) && (
                      <X className="ml-1.5 w-3 h-3 animate-in spin-in-180 duration-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Selected Tags Display */}
          {filters.tags.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Tags ({filters.tags.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-white shadow-md animate-in slide-in-from-left-1 duration-200"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:bg-primary-dark rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-primary"
                      aria-label={`Remove ${tag} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Results Summary and Clear Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 sm:space-y-0">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {hasActiveFilters ? (
            <span>
              Showing <span className="font-semibold text-primary">{filteredDocuments}</span> of{' '}
              <span className="font-semibold text-primary">{totalDocuments}</span> documents
              {filteredDocuments !== totalDocuments && (
                <span className="text-xs ml-1 text-gray-400">(filtered)</span>
              )}
            </span>
          ) : (
            <span>
              Showing all <span className="font-semibold text-primary">{totalDocuments}</span> documents
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center justify-center space-x-1 text-sm text-primary hover:text-primary-dark underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-3 py-2 min-h-[44px]"
          >
            <X className="w-4 h-4" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>
    </div>
  );
}; 