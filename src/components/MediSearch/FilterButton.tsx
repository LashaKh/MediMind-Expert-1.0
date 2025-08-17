/**
 * FilterButton - Enhanced filter trigger button with badge counts and visual states
 * Displays active filter count and provides quick access to advanced filtering
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  AdjustmentsHorizontalIcon as AdjustmentsHorizontalSolid,
  FunnelIcon as FunnelSolid
} from '@heroicons/react/24/solid';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface FilterButtonProps {
  activeFilters?: AdvancedMedicalFilters;
  isOpen?: boolean;
  onClick: () => void;
  onClearFilters?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
  showClearButton?: boolean;
}

// Helper function to count active filters
const countActiveFilters = (filters?: AdvancedMedicalFilters): number => {
  if (!filters) return 0;
  
  let count = 0;
  
  // Count content type filters
  if (filters.contentTypes) {
    Object.values(filters.contentTypes).forEach(arr => {
      if (arr && arr.length > 0) count += arr.length;
    });
  }
  
  // Count file formats
  if (filters.fileFormats?.length) count += filters.fileFormats.length;
  
  // Count source authority filters
  if (filters.sourceAuthority) {
    Object.values(filters.sourceAuthority).forEach(arr => {
      if (arr && arr.length > 0) count += arr.length;
    });
  }
  
  // Count other filter categories
  if (filters.peerReviewStatus?.length) count += filters.peerReviewStatus.length;
  if (filters.citationTier?.length) count += filters.citationTier.length;
  
  // Medical specialties
  if (filters.medicalSpecialties) {
    Object.values(filters.medicalSpecialties).forEach(arr => {
      if (arr && arr.length > 0) count += arr.length;
    });
  }
  if (filters.subspecialties?.length) count += filters.subspecialties.length;
  
  // Audience and complexity
  if (filters.targetAudience?.length) count += filters.targetAudience.length;
  if (filters.contentComplexity?.length) count += filters.contentComplexity.length;
  if (filters.readingLevel?.length) count += filters.readingLevel.length;
  
  // Topic filters
  if (filters.diseaseCategories?.length) count += filters.diseaseCategories.length;
  if (filters.symptomsAndSigns?.length) count += filters.symptomsAndSigns.length;
  if (filters.treatmentTypes?.length) count += filters.treatmentTypes.length;
  if (filters.preventionScreening?.length) count += filters.preventionScreening.length;
  
  // Publication filters
  if (filters.recencyPeriod) count += 1;
  if (filters.updateStatus?.length) count += filters.updateStatus.length;
  if (filters.evidenceGrade?.length) count += filters.evidenceGrade.length;
  if (filters.validationStatus?.length) count += filters.validationStatus.length;
  
  // Access filters
  if (filters.accessType?.length) count += filters.accessType.length;
  if (filters.fullTextAvailable !== undefined) count += 1;
  if (filters.downloadFormat?.length) count += filters.downloadFormat.length;
  if (filters.mobileOptimized !== undefined) count += 1;
  
  // Geographic and context
  if (filters.geographicRelevance?.length) count += filters.geographicRelevance.length;
  if (filters.practiceSettings?.length) count += filters.practiceSettings.length;
  if (filters.patientPopulation?.length) count += filters.patientPopulation.length;
  if (filters.careLevel?.length) count += filters.careLevel.length;
  
  // Clinical trial filters
  if (filters.trialFilters) {
    const tf = filters.trialFilters;
    if (tf.recruitmentStatus?.length) count += tf.recruitmentStatus.length;
    if (tf.phase?.length) count += tf.phase.length;
    if (tf.location) count += 1;
    if (tf.ageRange && (tf.ageRange.min !== undefined || tf.ageRange.max !== undefined)) count += 1;
    if (tf.gender && tf.gender !== 'all') count += 1;
  }
  
  return count;
};

// Get filter summary text
const getFilterSummary = (filters?: AdvancedMedicalFilters, count: number = 0, t?: (key: string, def?: string, vars?: any) => string): string => {
  if (!t) {
    if (count === 0) return 'No filters active';
    if (count === 1) return '1 filter active';
    return `${count} filters active`;
  }
  if (count === 0) return t('filters.summary.none', 'No filters active');
  if (count === 1) return t('filters.summary.one', '1 filter active');
  return t('filters.summary.many', '{{count}} filters active', { count });
};

export const FilterButton: React.FC<FilterButtonProps> = ({
  activeFilters,
  isOpen = false,
  onClick,
  onClearFilters,
  className = '',
  variant = 'default',
  showClearButton = true
}) => {
  const { t } = useTranslation();
  const activeCount = countActiveFilters(activeFilters);
  const hasActiveFilters = activeCount > 0;
  const filterSummary = getFilterSummary(activeFilters, activeCount, t);

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={onClick}
          className={`group relative p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            hasActiveFilters
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-white text-gray-600 hover:text-indigo-600'
          } border-2 ${hasActiveFilters ? 'border-transparent' : 'border-gray-200 hover:border-indigo-200'}`}
          title={`${t('search.advancedFilters', 'Advanced Filters')} (${filterSummary})`}
        >
          {/* Glow effect when active */}
          {hasActiveFilters && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-50 -z-10"></div>
          )}
          
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : hasActiveFilters ? (
            <FunnelSolid className="w-6 h-6" />
          ) : (
            <FunnelIcon className="w-6 h-6" />
          )}
          
          {/* Badge */}
          {hasActiveFilters && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {activeCount > 99 ? '99+' : activeCount}
            </div>
          )}
          
          {/* Pulse animation for new filters */}
          {hasActiveFilters && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={onClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasActiveFilters
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-transparent'
          }`}
          title={filterSummary}
        >
          {isOpen ? (
            <XMarkIcon className="w-4 h-4" />
          ) : hasActiveFilters ? (
            <AdjustmentsHorizontalSolid className="w-4 h-4" />
          ) : (
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          )}
          
          <span>{t('filters.button.label', 'Filters')}</span>
          
          {hasActiveFilters && (
            <div className="bg-indigo-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
              {activeCount}
            </div>
          )}
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && showClearButton && onClearFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFilters();
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
            title={t('filters.clearAll', 'Clear All Filters')}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className={`group relative p-3 rounded-xl transition-all duration-300 ${
          isOpen
            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
            : hasActiveFilters
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-2 border-indigo-200 hover:from-indigo-100 hover:to-purple-100'
            : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-100'
        }`}
        title={`${t('search.advancedFilters', 'Advanced Filters')} (${filterSummary})`}
      >
        {/* Background glow effect */}
        {hasActiveFilters && !isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        )}
        
        <div className="relative flex items-center gap-2">
          {isOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : hasActiveFilters ? (
            <AdjustmentsHorizontalSolid className="w-5 h-5" />
          ) : (
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          )}
          
          {/* Smart filters indicator */}
          {hasActiveFilters && (
            <SparklesIcon className="w-4 h-4 text-purple-500 animate-pulse" />
          )}
        </div>
        
        {/* Active filter count badge */}
        {hasActiveFilters && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
            {activeCount > 99 ? '99+' : activeCount}
          </div>
        )}
        
        {/* Filter status indicator */}
        {hasActiveFilters && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </button>

      {/* Quick clear button */}
      {hasActiveFilters && showClearButton && onClearFilters && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClearFilters();
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
          title={t('filters.clearAll', 'Clear All Filters')}
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
      
      {/* Filter summary tooltip */}
      {hasActiveFilters && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {filterSummary}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;