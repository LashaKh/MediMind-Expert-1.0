/**
 * AdvancedFilterModal - Main sliding filter panel for comprehensive medical search filtering
 * Combines all filter categories into a cohesive, user-friendly interface
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import { FilterCategoryTabs, type FilterCategoryId } from './FilterCategoryTabs';
import { QuickFilters } from './QuickFilters';
import { ContentFormatFilters } from './filters/ContentFormatFilters';
import { AuthorityQualityFilters } from './filters/AuthorityQualityFilters';
import { MedicalDomainFilters } from './filters/MedicalDomainFilters';
import { PublicationAccessFilters } from './filters/PublicationAccessFilters';
import { GeographicContextFilters } from './filters/GeographicContextFilters';
import { AdvancedOptionsFilters } from './filters/AdvancedOptionsFilters';

import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  resultCount?: number;
  isLoading?: boolean;
  className?: string;
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  resultCount,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<FilterCategoryId>('quick-filters');
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedFilterSets, setSavedFilterSets] = useState<any[]>([]);

  // Track changes to filters
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [filters]);

  // Count active filters in each category
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategoryId, number> = {
      'quick-filters': 0,
      'content-format': 0,
      'authority-quality': 0,
      'medical-domain': 0,
      'publication-access': 0,
      'geographic-context': 0,
      'advanced-options': 0
    };

    // Content & Format
    if (filters.contentTypes) {
      Object.values(filters.contentTypes).forEach(arr => {
        if (arr?.length) counts['content-format'] += arr.length;
      });
    }
    if (filters.fileFormats?.length) counts['content-format'] += filters.fileFormats.length;

    // Authority & Quality
    if (filters.sourceAuthority) {
      Object.values(filters.sourceAuthority).forEach(arr => {
        if (arr?.length) counts['authority-quality'] += arr.length;
      });
    }
    if (filters.peerReviewStatus?.length) counts['authority-quality'] += filters.peerReviewStatus.length;
    if (filters.citationTier?.length) counts['authority-quality'] += filters.citationTier.length;

    // Medical Domain
    if (filters.medicalSpecialties) {
      Object.values(filters.medicalSpecialties).forEach(arr => {
        if (arr?.length) counts['medical-domain'] += arr.length;
      });
    }
    if (filters.subspecialties?.length) counts['medical-domain'] += filters.subspecialties.length;
    if (filters.diseaseCategories?.length) counts['medical-domain'] += filters.diseaseCategories.length;


    // Publication & Access
    if (filters.recencyPeriod) counts['publication-access'] += 1;
    if (filters.accessType?.length) counts['publication-access'] += filters.accessType.length;
    if (filters.evidenceGrade?.length) counts['publication-access'] += filters.evidenceGrade.length;

    // Geographic & Context
    if (filters.geographicRelevance?.length) counts['geographic-context'] += filters.geographicRelevance.length;
    if (filters.practiceSettings?.length) counts['geographic-context'] += filters.practiceSettings.length;
    if (filters.patientPopulation?.length) counts['geographic-context'] += filters.patientPopulation.length;

    // Advanced Options (Clinical Trials)
    if (filters.trialFilters) {
      const tf = filters.trialFilters;
      if (tf.recruitmentStatus?.length) counts['advanced-options'] += tf.recruitmentStatus.length;
      if (tf.phase?.length) counts['advanced-options'] += tf.phase.length;
      if (tf.location) counts['advanced-options'] += 1;
      if (tf.ageRange?.min || tf.ageRange?.max) counts['advanced-options'] += 1;
      if (tf.gender && tf.gender !== 'all') counts['advanced-options'] += 1;
    }

    return counts;
  }, [filters]);

  const totalActiveFilters = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  const handleQuickFilterSelect = useCallback((quickFilters: AdvancedMedicalFilters, presetName: string) => {
    onFiltersChange(quickFilters);
    setHasUnsavedChanges(true);
  }, [onFiltersChange]);

  const handleSaveCurrentFilters = useCallback((name: string) => {
    const newFilterSet = {
      id: Date.now().toString(),
      name,
      filters,
      created: new Date().toISOString()
    };
    setSavedFilterSets(prev => [...prev, newFilterSet]);
    // You could also save to localStorage or send to backend here
  }, [filters]);

  const handleSaveFilters = useCallback(() => {
    // Just save the filter state, don't trigger search
    setHasUnsavedChanges(false);
    onClose(); // Close the modal after saving
  }, [onClose]);

  const handleClear = useCallback(() => {
    onClearFilters();
    setHasUnsavedChanges(false);
  }, [onClearFilters]);

  const renderFilterContent = () => {
    switch (activeCategory) {
      case 'quick-filters':
        return (
          <QuickFilters
            onFilterSelect={handleQuickFilterSelect}
            activeFilters={filters}
            onSaveCurrentFilters={handleSaveCurrentFilters}
            savedFilters={savedFilterSets}
          />
        );
      case 'content-format':
        return (
          <ContentFormatFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      case 'authority-quality':
        return (
          <AuthorityQualityFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      case 'medical-domain':
        return (
          <MedicalDomainFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      case 'publication-access':
        return (
          <PublicationAccessFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      case 'geographic-context':
        return (
          <GeographicContextFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      case 'advanced-options':
        return (
          <AdvancedOptionsFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal - Mobile responsive */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 ${className}`}>
        <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white shadow-2xl rounded-lg transform transition-transform duration-300 flex flex-col">
        {/* Header - Mobile responsive */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">
                  {t('filters.modal.title', 'Advanced Medical Filters')}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {t('filters.modal.subtitle', 'Refine your search with precision filtering')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Stats bar - Mobile responsive */}
          <div className="bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>{totalActiveFilters} {t('filters.active', 'filters active')}</span>
              </div>
              {resultCount !== undefined && (
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span>{resultCount} {t('search.resultsFound', 'results found')}</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-yellow-200">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{t('common.unsavedChanges', 'Unsaved changes')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors duration-200 text-xs min-h-[36px] touch-manipulation"
              >
                <span className="hidden sm:inline">{previewMode ? t('filters.preview.exit', 'Exit Preview') : t('filters.preview.results', 'Preview Results')}</span>
                <span className="sm:hidden">{previewMode ? t('filters.preview.exitShort', 'Exit') : t('filters.preview.previewShort', 'Preview')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation - Mobile scrollable */}
        <div className="flex-shrink-0 border-b border-gray-200 overflow-x-auto">
          <FilterCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
            layout="horizontal"
            className="p-3 sm:p-4 min-w-max"
          />
        </div>

        {/* Filter Content - Mobile padding */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {renderFilterContent()}
          </div>
        </div>

        {/* Footer Actions - Mobile responsive */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <button
                onClick={handleClear}
                disabled={totalActiveFilters === 0}
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] touch-manipulation"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>{t('filters.clearAll', 'Clear All Filters')}</span>
              </button>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>{t('filters.changesNotApplied', 'Changes not yet applied')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 min-h-[44px] touch-manipulation order-2 sm:order-1"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveFilters}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] touch-manipulation order-1 sm:order-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {t('filters.save', 'Save Filters')}
                {totalActiveFilters > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {totalActiveFilters}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedFilterModal;