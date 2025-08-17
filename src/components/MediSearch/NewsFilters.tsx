/**
 * NewsFilters Component
 * Advanced filtering interface for medical news with category, date, and specialty filtering
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  BeakerIcon,
  AcademicCapIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { NewsFilters } from '../../types/medicalNews';
import { useSpecialty } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

interface NewsFiltersProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  onApplyFilters?: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

const CATEGORY_OPTIONS = [
  { 
    value: 'research', 
    label: 'Research', 
    icon: BeakerIcon,
    description: 'Latest medical research and studies',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    value: 'drug_approvals', 
    label: 'Drug Approvals', 
    icon: SparklesIcon,
    description: 'FDA approvals and drug news',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    value: 'clinical_trials', 
    label: 'Clinical Trials', 
    icon: TrophyIcon,
    description: 'New and recruiting clinical trials',
    color: 'from-orange-500 to-red-500'
  },
  { 
    value: 'guidelines', 
    label: 'Guidelines', 
    icon: ClipboardDocumentCheckIcon,
    description: 'Clinical guidelines and protocols',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    value: 'breaking_news', 
    label: 'Breaking News', 
    icon: FireIcon,
    description: 'Urgent medical news and alerts',
    color: 'from-red-500 to-orange-500'
  },
  { 
    value: 'policy_updates', 
    label: 'Policy Updates', 
    icon: AcademicCapIcon,
    description: 'Healthcare policy changes',
    color: 'from-indigo-500 to-purple-500'
  }
];

const RECENCY_OPTIONS = [
  { value: 'today', label: 'Today', description: 'Last 24 hours' },
  { value: 'week', label: 'This Week', description: 'Last 7 days' },
  { value: 'month', label: 'This Month', description: 'Last 30 days' },
  { value: '3months', label: 'Last 3 Months', description: 'Last 90 days' },
  { value: 'year', label: 'This Year', description: 'Last 12 months' },
  { value: 'all', label: 'All Time', description: 'No date restriction' }
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'article', label: 'Articles', icon: AcademicCapIcon },
  { value: 'study', label: 'Studies', icon: BeakerIcon },
  { value: 'guideline', label: 'Guidelines', icon: ClipboardDocumentCheckIcon },
  { value: 'press_release', label: 'Press Releases', icon: SparklesIcon },
  { value: 'editorial', label: 'Editorials', icon: AcademicCapIcon },
  { value: 'review', label: 'Reviews', icon: TrophyIcon }
];

const EVIDENCE_LEVEL_OPTIONS = [
  { value: 'systematic_review', label: 'Systematic Reviews', priority: 1 },
  { value: 'rct', label: 'Randomized Controlled Trials', priority: 2 },
  { value: 'cohort_study', label: 'Cohort Studies', priority: 3 },
  { value: 'case_control', label: 'Case-Control Studies', priority: 4 },
  { value: 'case_series', label: 'Case Series', priority: 5 },
  { value: 'expert_opinion', label: 'Expert Opinion', priority: 6 },
  { value: 'guideline', label: 'Clinical Guidelines', priority: 1 }
];

export const NewsFilters: React.FC<NewsFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  className = '',
  isOpen = false,
  onToggle,
  disabled = false
}) => {
  const { t } = useTranslation();
  const { specialty } = useSpecialty();
  const [localFilters, setLocalFilters] = useState<NewsFilters>(filters);

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = useCallback((key: keyof NewsFilters, value: unknown) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [localFilters, onFiltersChange]);

  const toggleCategory = useCallback((category: string) => {
    const currentCategories = localFilters.category || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateFilter('category', updatedCategories);
  }, [localFilters.category, updateFilter]);

  const toggleContentType = useCallback((contentType: string) => {
    const currentTypes = localFilters.contentType || [];
    const updatedTypes = currentTypes.includes(contentType)
      ? currentTypes.filter(t => t !== contentType)
      : [...currentTypes, contentType];
    
    updateFilter('contentType', updatedTypes);
  }, [localFilters.contentType, updateFilter]);

  const toggleEvidenceLevel = useCallback((evidenceLevel: string) => {
    const currentLevels = localFilters.evidenceLevel || [];
    const updatedLevels = currentLevels.includes(evidenceLevel)
      ? currentLevels.filter(l => l !== evidenceLevel)
      : [...currentLevels, evidenceLevel];
    
    updateFilter('evidenceLevel', updatedLevels);
  }, [localFilters.evidenceLevel, updateFilter]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: NewsFilters = {
      specialty: specialty?.toLowerCase() // Keep user's specialty
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [specialty, onFiltersChange]);

  const hasActiveFilters = !!(
    localFilters.category?.length || 
    localFilters.contentType?.length || 
    localFilters.evidenceLevel?.length ||
    localFilters.recency ||
    localFilters.search
  );

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
          <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          disabled={disabled}
          className="gap-2"
        >
          <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('news.filtersLabel', 'Filters')}</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {(localFilters.category?.length || 0) + (localFilters.contentType?.length || 0) + (localFilters.evidenceLevel?.length || 0)}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
            <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.clear', 'Clear')}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("bg-white/95 backdrop-blur-xl border border-gray-200/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FunnelIcon className="w-5 h-5 text-indigo-600" />
            {t('news.filters.title', 'Filter Medical News')}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                {t('news.filters.clearAll', 'Clear All')}
              </Button>
            )}
            
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BeakerIcon className="w-4 h-4 text-indigo-600" />
            {t('news.filters.categories', 'Categories')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = localFilters.category?.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => toggleCategory(option.value)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 text-left",
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  )}
                  title={option.description}
                >
                  <IconComponent className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isSelected ? "text-indigo-600" : "text-gray-500"
                  )} />
                  <span className="text-sm font-medium truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            {t('news.filters.dateRange', 'Date Range')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RECENCY_OPTIONS.map((option) => {
              const isSelected = localFilters.recency === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('recency', option.value)}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 text-left",
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  )}
                  title={option.description}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Types */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
            {t('news.filters.contentTypes', 'Content Types')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPE_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = localFilters.contentType?.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => toggleContentType(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <IconComponent className={cn(
                    "w-4 h-4",
                    isSelected ? "text-indigo-600" : "text-gray-500"
                  )} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence Levels */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-indigo-600" />
            {t('news.filters.evidenceLevels', 'Evidence Levels')}
          </h4>
          <div className="space-y-2">
            {EVIDENCE_LEVEL_OPTIONS
              .sort((a, b) => a.priority - b.priority)
              .map((option) => {
                const isSelected = localFilters.evidenceLevel?.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleEvidenceLevel(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left",
                      isSelected
                        ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <Badge 
                      variant={isSelected ? "default" : "secondary"}
                      className="text-xs"
                    >
                      Level {option.priority}
                    </Badge>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Search within news */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('news.filters.search', 'Search in News')}
          </h4>
          <div className="relative">
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder={t('news.filters.searchPlaceholder', 'Search news titles and summaries...')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            {localFilters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quality Thresholds */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('news.filters.quality', 'Quality Thresholds')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                Min Relevance Score
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localFilters.minRelevanceScore || 0}
                onChange={(e) => updateFilter('minRelevanceScore', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((localFilters.minRelevanceScore || 0) * 100)}%
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-2">
                Min Credibility Score
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localFilters.minCredibilityScore || 0}
                onChange={(e) => updateFilter('minCredibilityScore', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((localFilters.minCredibilityScore || 0) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Apply button */}
        {onApplyFilters && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={onApplyFilters}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all duration-200"
              disabled={disabled}
            >
              {t('news.filters.apply', 'Apply Filters')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFilters;