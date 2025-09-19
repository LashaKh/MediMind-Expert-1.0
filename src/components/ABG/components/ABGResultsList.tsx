import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Calendar,
  User,
  FileText,
  Eye,
  Download,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Settings,
  Trash2,
  CheckSquare,
  Square,
  
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { useLazyLoading } from '../../../hooks/useLazyLoading';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { 
  ABGResult, 
  ABGFilters, 
  ABGSortOption,
  ABGType,
  ABGSearchFilters,
  PatientInfo
} from '../../../types/abg';
import { getUserABGResults, getUserPatients } from '../../../services/abgService';

interface ABGResultsListProps {
  /** Callback when a result is selected */
  onResultSelect?: (result: ABGResult) => void;
  /** Callback when export is requested */
  onExportRequest?: (results: ABGResult[]) => void;
  /** Callback when result selection is toggled */
  onResultToggle?: (resultId: string) => void;
  /** Callback when single result delete is requested */
  onSingleDelete?: (resultId: string) => void;
  /** Initial filters to apply */
  initialFilters?: ABGFilters;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Whether to show search */
  showSearch?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Page size for lazy loading */
  pageSize?: number;
  /** Whether selection mode is active */
  selectionMode?: boolean;
  /** Set of selected result IDs */
  selectedResults?: Set<string>;
}

const SORT_OPTIONS: ABGSortOption[] = [
  { field: 'created_at', direction: 'desc', label: 'Newest First' },
  { field: 'created_at', direction: 'asc', label: 'Oldest First' },
  { field: 'type', direction: 'asc', label: 'Type A-Z' },
  { field: 'gemini_confidence', direction: 'desc', label: 'Highest Confidence' }
];

export const ABGResultsList: React.FC<ABGResultsListProps> = ({
  onResultSelect,
  onExportRequest,
  onResultToggle,
  onSingleDelete,
  initialFilters = {},
  showFilters = true,
  showSearch = true,
  compact = false,
  pageSize = 20,
  selectionMode = false,
  selectedResults = new Set()
}) => {
  const { t } = useTranslation();
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ABGFilters>(initialFilters);
  const [sortOption, setSortOption] = useState<ABGSortOption>(SORT_OPTIONS[0]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<ABGSearchFilters>({});

  // Load patients for advanced search
  const loadPatients = useCallback(async () => {
    try {
      const patientData = await getUserPatients();
      setPatients(patientData);
    } catch (error) {

    }
  }, []);

  // Load more function for lazy loading
  const loadMoreResults = useCallback(async (offset: number, limit: number): Promise<ABGResult[]> => {
    try {
      // Build search filters
      const searchFilters: ABGFilters = {
        ...filters,
        limit,
        offset
      };

      // Add search query if provided
      if (searchQuery.trim()) {
        // In a real implementation, you'd add search support to the API
        // For now, we'll just use the filters
      }

      const results = await getUserABGResults(searchFilters);
      
      // Sort results based on selected sort option
      const sortedResults = [...results].sort((a, b) => {
        const aValue = a[sortOption.field] as any;
        const bValue = b[sortOption.field] as any;
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
        
        return sortOption.direction === 'desc' ? -comparison : comparison;
      });

      return sortedResults;
    } catch (error) {

      throw error;
    }
  }, [filters, searchQuery, sortOption]);

  // Lazy loading hook
  const {
    items: results,
    isLoading,
    hasMore,
    error,
    
    reset,
    sentinelRef,
    totalLoaded
  } = useLazyLoading<ABGResult>({
    config: { pageSize },
    loadMore: loadMoreResults,
    enabled: true
  });

  // Load patients on component mount
  useEffect(() => {
    if (showAdvancedSearch && patients.length === 0) {
      loadPatients();
    }
  }, [showAdvancedSearch, patients.length, loadPatients]);

  // Handle advanced search
  const handleAdvancedSearch = useCallback((searchFilters: ABGSearchFilters) => {
    setAdvancedFilters(searchFilters);
    
    // Convert advanced filters to basic filters for backend compatibility
    const basicFilters: ABGFilters = {
      ...filters,
      patientId: searchFilters.patientId,
      type: searchFilters.type,
      startDate: searchFilters.startDate,
      endDate: searchFilters.endDate,
      hasInterpretation: searchFilters.hasInterpretation,
      hasActionPlan: searchFilters.hasActionPlan
    };
    
    setFilters(basicFilters);
    setSearchQuery(searchFilters.keyword || '');
    reset();
  }, [filters, reset]);

  // Handle advanced search reset
  const handleAdvancedSearchReset = useCallback(() => {
    setAdvancedFilters({});
    setFilters(initialFilters);
    setSearchQuery('');
    reset();
  }, [initialFilters, reset]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ABGFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    reset();
  }, [reset]);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Debounce and reset results
    const timeoutId = setTimeout(() => {
      reset();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [reset]);

  // Handle sort change
  const handleSortChange = useCallback((option: ABGSortOption) => {
    setSortOption(option);
    reset();
  }, [reset]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format confidence percentage
  const formatConfidence = (confidence?: number): string => {
    if (!confidence) return t('abg.results.na', 'N/A');
    return `${Math.round(confidence * 100)}%`;
  };

  // Get confidence color
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Memoized filter panel
  const FilterPanel = useMemo(() => (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">{t('abg.results.filters.title', 'Filters')}</h3>
      
      {/* Type Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">{t('abg.results.filters.type', 'Type')}</label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleFilterChange({ 
            type: e.target.value as ABGType || undefined 
          })}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t('abg.results.filters.allTypes', 'All Types')}</option>
          <option value="Arterial Blood Gas">{t('abg.results.filters.types.arterial', 'Arterial Blood Gas')}</option>
          <option value="Venous Blood Gas">{t('abg.results.filters.types.venous', 'Venous Blood Gas')}</option>
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">{t('abg.results.filters.dateRange', 'Date Range')}</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
            className="p-2 border rounded-md"
            placeholder={t('abg.results.filters.startDate', 'Start Date')}
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
            className="p-2 border rounded-md"
            placeholder={t('abg.results.filters.endDate', 'End Date')}
          />
        </div>
      </div>

      {/* Has Interpretation */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasInterpretation || false}
            onChange={(e) => handleFilterChange({ 
              hasInterpretation: e.target.checked || undefined 
            })}
          />
          <span className="text-sm">{t('abg.results.filters.hasInterpretation', 'Has Interpretation')}</span>
        </label>
      </div>

      {/* Has Action Plan */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasActionPlan || false}
            onChange={(e) => handleFilterChange({ 
              hasActionPlan: e.target.checked || undefined 
            })}
          />
          <span className="text-sm">{t('abg.results.filters.hasActionPlan', 'Has Action Plan')}</span>
        </label>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFilters({});
          reset();
        }}
        className="w-full"
      >
        {t('common.clearAll', 'Clear Filters')}
      </Button>
    </Card>
  ), [filters, handleFilterChange, reset]);

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('abg.results.title', 'ABG Results')}</h2>
          <div className="flex items-center gap-2">
            {onExportRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportRequest(results)}
                disabled={results.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('abg.results.export', 'Export')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('abg.results.searchPlaceholder', 'Search results...')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={`${sortOption.field}-${sortOption.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                const option = SORT_OPTIONS.find(opt => 
                  opt.field === field && opt.direction === direction
                );
                if (option) handleSortChange(option);
              }}
              className="px-3 py-2 border rounded-md"
            >
              {SORT_OPTIONS.map((option, index) => (
                <option key={index} value={`${option.field}-${option.direction}`}>
                  {t(`abg.results.sort.${option.label.replace(/\s+/g, '').toLowerCase()}` as any, option.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSearch(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t('abg.results.advancedSearch', 'Advanced Search')}
            {Object.keys(advancedFilters).length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {Object.keys(advancedFilters).filter(key => 
                  advancedFilters[key as keyof ABGSearchFilters] !== undefined
                ).length}
              </Badge>
            )}
          </Button>

          {/* Filter Toggle */}
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('abg.results.filters.button', 'Filters')}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && showFilters && FilterPanel}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {totalLoaded > 0 && (
          <span>
            {hasMore 
              ? t('abg.results.showingMore', 'Showing {{count}} results (scroll for more)', { count: totalLoaded })
              : t('abg.results.showing', 'Showing {{count}} results', { count: totalLoaded })}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-2 text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <div className="font-medium">{t('abg.results.loadFailed', 'Failed to Load Results')}</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className={cn("group p-4 hover:shadow-lg transition-all duration-200", compact && "p-3")}>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{result.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(result.created_at)}
                  </span>
                  {result.gemini_confidence && (
                    <span className={cn("text-sm font-medium", getConfidenceColor(result.gemini_confidence))}>
                      {formatConfidence(result.gemini_confidence)}
                    </span>
                  )}
                </div>

                {/* Patient Info */}
                {result.patient && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>
                      {result.patient.first_name} {result.patient.last_name}
                    </span>
                  </div>
                )}

                {/* Analysis Preview */}
                {!compact && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {result.raw_analysis.substring(0, 150)}...
                  </div>
                )}

                {/* Status Indicators */}
                <div className="flex items-center gap-2">
                  {result.interpretation && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {t('abg.results.badges.interpreted', 'Interpreted')}
                    </Badge>
                  )}
                  {result.action_plan && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('abg.results.badges.actionPlan', 'Action Plan')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Selection Checkbox */}
                {selectionMode && onResultToggle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResultToggle(result.id);
                    }}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-[#90cdf4]/60 transition-all duration-200",
                      selectedResults.has(result.id) && "bg-[#90cdf4]/50 text-[#2b6cb0] hover:bg-[#90cdf4]"
                    )}
                  >
                    {selectedResults.has(result.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {/* View Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResultSelect?.(result)}
                  className="hover:bg-[#90cdf4]/60 text-[#2b6cb0] hover:text-[#1a365d]"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* Delete Button */}
                {!selectionMode && onSingleDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSingleDelete(result.id);
                    }}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-red-100/60 text-red-600 hover:text-red-700",
                      "transition-all duration-200 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>{t('abg.results.loadingMore', 'Loading more results...')}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{t('abg.results.empty.title', 'No Results Found')}</h3>
          <p className="text-muted-foreground">
            {searchQuery || Object.keys(filters).length > 0
              ? t('abg.results.empty.tips', 'Try adjusting your search or filters')
              : t('abg.results.empty.noResults', 'No ABG results have been created yet')
            }
          </p>
        </Card>
      )}

      {/* End of Results */}
      {!hasMore && results.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {t('abg.results.end', 'End of results')}
        </div>
      )}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-4" />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        onReset={handleAdvancedSearchReset}
        initialFilters={advancedFilters}
        patients={patients}
      />
    </div>
  );
};