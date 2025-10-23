import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  RefreshCw,
  Activity,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  Grid,
  List,
  Settings,
  SortAsc,
  SortDesc,
  CheckCircle
} from 'lucide-react';
import { MagneticButton, MorphingIcon } from '../../PremiumAnimations';
import { AdvancedSearch } from '../../AdvancedSearch';
import { ViewMode, SortBy, SortOrder, DisplayDensity, SearchFilters, SpecialtyTheme } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';

interface LibraryControlsProps {
  // Data
  searchFilters: SearchFilters;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  displayDensity: DisplayDensity;
  showMetadata: boolean;
  selectedDocumentsCount: number;
  totalDocuments: number;
  filteredDocuments: number;
  theme: SpecialtyTheme;

  // States
  isLoading: boolean;
  isMonitoring: boolean;
  showAdvancedSearch: boolean;
  showSortOptions: boolean;
  showViewOptions: boolean;

  // Available options
  availableTags: string[];
  availableCategories: string[];
  availableFileTypes: string[];

  // Callbacks
  onUploadClick: () => void;
  onRefresh: () => void;
  onMonitorStatus: () => void;
  onSearchChange: (filters: SearchFilters) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  onDisplayDensityChange: (density: DisplayDensity) => void;
  onShowMetadataToggle: () => void;
  onToggleAdvancedSearch: () => void;
  onToggleSortOptions: () => void;
  onToggleViewOptions: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const LibraryControls: React.FC<LibraryControlsProps> = ({
  searchFilters,
  viewMode,
  sortBy,
  sortOrder,
  displayDensity,
  showMetadata,
  selectedDocumentsCount,
  totalDocuments,
  filteredDocuments,
  theme,
  isLoading,
  isMonitoring,
  showAdvancedSearch,
  showSortOptions,
  showViewOptions,
  availableTags,
  availableCategories,
  availableFileTypes,
  onUploadClick,
  onRefresh,
  onMonitorStatus,
  onSearchChange,
  onViewModeChange,
  onSortChange,
  onDisplayDensityChange,
  onShowMetadataToggle,
  onToggleAdvancedSearch,
  onToggleSortOptions,
  onToggleViewOptions,
  onSelectAll,
  onClearSelection
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Enhanced Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6"
      >
        {/* Controls Container */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Primary Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onUploadClick}
              className={`
                group relative px-6 py-3 rounded-xl font-semibold text-white shadow-lg
                bg-gradient-to-r ${theme.primaryGradient}
                hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 overflow-hidden
                flex items-center space-x-2 min-h-[48px]
              `}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Upload className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t('knowledge-base.uploadDocuments')}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`
                px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center space-x-2 min-h-[48px] shadow-sm hover:shadow-md
                text-gray-700 dark:text-gray-200
              `}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">{t('knowledge-base.refresh')}</span>
            </button>

            <button
              onClick={onMonitorStatus}
              disabled={isMonitoring}
              className={`
                px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-600
                bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm
                hover:bg-blue-100/80 dark:hover:bg-blue-800/30 hover:border-blue-300 dark:hover:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                text-blue-700 dark:text-blue-200 transition-all duration-200
                flex items-center space-x-2 min-h-[48px] shadow-sm hover:shadow-md
              `}
              title="Check OpenAI processing status for uploaded files"
            >
              <Activity className={`w-5 h-5 ${isMonitoring ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{isMonitoring ? 'Checking...' : t('knowledge-base.monitor')}</span>
            </button>
          </div>

          {/* Search Bar with Enhanced Styling */}
          <div className="flex-1 w-full lg:w-auto relative">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder={t('knowledge-base.searchYourKnowledgeBase')}
                value={searchFilters.searchTerm}
                onChange={(e) => onSearchChange({ ...searchFilters, searchTerm: e.target.value })}
                className={`
                  w-full pl-12 pr-4 py-3 rounded-xl
                  border border-gray-200 dark:border-gray-600
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                  hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
                  focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  transition-all duration-200 shadow-sm focus:shadow-md min-h-[48px]
                  text-gray-900 dark:text-gray-100
                `}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          {/* Enhanced View Controls */}
          <div className="flex items-center gap-2">
            {/* Advanced Search Toggle */}
            <div className="relative">
              <MagneticButton
                onClick={onToggleAdvancedSearch}
                className={`
                  p-3 rounded-xl border transition-all duration-200 min-h-[48px] min-w-[48px] shadow-sm hover:shadow-md
                  ${showAdvancedSearch
                    ? `${theme.primaryBg} text-white border-transparent shadow-lg`
                    : 'border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'
                  }
                `}
              >
                <MorphingIcon
                  icon1={<Filter className="w-5 h-5" />}
                  icon2={<Sparkles className="w-5 h-5" />}
                  isToggled={showAdvancedSearch}
                  className="w-5 h-5"
                />
              </MagneticButton>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <button
                onClick={onToggleSortOptions}
                className={`
                  p-3 rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                  hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
                  transition-all duration-200 min-h-[48px] min-w-[48px] shadow-sm hover:shadow-md
                  text-gray-600 dark:text-gray-300
                `}
                title="Sort Options"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('knowledgeBase.sortBy')}</p>
                      {['name', 'date', 'size', 'type', 'category'].map((sortOption) => (
                        <button
                          key={sortOption}
                          onClick={() => {
                            const newSortOrder = sortBy === sortOption && sortOrder === 'asc' ? 'desc' : 'asc';
                            onSortChange(sortOption as SortBy, newSortOrder);
                            onToggleSortOptions();
                          }}
                          className={`
                            w-full px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                            flex items-center justify-between
                            ${sortBy === sortOption ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
                          `}
                        >
                          <span className="capitalize">{t(`knowledgeBase.${sortOption}`)}</span>
                          {sortBy === sortOption && (
                            <div className="flex items-center">
                              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced View Mode Toggle */}
            <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`
                  p-2.5 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px]
                  ${viewMode === 'grid'
                    ? `${theme.primaryBg} text-white shadow-md`
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`
                  p-2.5 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px]
                  ${viewMode === 'list'
                    ? `${theme.primaryBg} text-white shadow-md`
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Enhanced Display Options */}
            <div className="relative">
              <button
                onClick={onToggleViewOptions}
                className={`
                  p-3 rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                  hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
                  transition-all duration-200 min-h-[48px] min-w-[48px] shadow-sm hover:shadow-md
                  text-gray-600 dark:text-gray-300
                `}
                title="Display Options"
              >
                <Settings className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showViewOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-4 space-y-4">
                      {/* Display Density */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Density</p>
                        <div className="space-y-1">
                          {(['compact', 'comfortable', 'spacious'] as DisplayDensity[]).map((density) => (
                            <button
                              key={density}
                              onClick={() => onDisplayDensityChange(density)}
                              className={`
                                w-full px-3 py-2 rounded-lg text-left text-sm transition-colors
                                ${displayDensity === density
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              <span className="capitalize">{density}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggle Options */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Show Metadata</span>
                          <button
                            onClick={onShowMetadataToggle}
                            className={`
                              w-10 h-6 rounded-full transition-colors relative
                              ${showMetadata ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                            `}
                          >
                            <div className={`
                              w-4 h-4 rounded-full bg-white transition-transform absolute top-1
                              ${showMetadata ? 'translate-x-5' : 'translate-x-1'}
                            `} />
                          </button>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selection Controls */}
      <AnimatePresence>
        {selectedDocumentsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedDocumentsCount} {t('knowledgeBase.documentsSelected')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSelectAll}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  {selectedDocumentsCount === filteredDocuments ? t('knowledgeBase.deselectAll') : t('knowledgeBase.selectAll')}
                </button>
                <button
                  onClick={onClearSelection}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  {t('knowledgeBase.clearSelection')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search */}
      <AdvancedSearch
        filters={searchFilters}
        onFiltersChange={onSearchChange}
        availableTags={availableTags}
        availableCategories={availableCategories}
        availableFileTypes={availableFileTypes}
        totalDocuments={totalDocuments}
        filteredDocuments={filteredDocuments}
        isOpen={showAdvancedSearch}
        onToggle={onToggleAdvancedSearch}
      />
    </>
  );
};
