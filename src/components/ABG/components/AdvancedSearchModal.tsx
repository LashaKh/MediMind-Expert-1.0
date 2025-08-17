import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Card } from '../../ui/card';
import { ABGSearchFilters, PatientInfo } from '../../../types/abg';
import { searchSections } from './config/searchConfig';
import { SearchHeader } from './sections/SearchHeader';
import { SearchSidebar } from './sections/SearchSidebar';
import { ClinicalSection } from './sections/ClinicalSection';
import { PatientSection } from './sections/PatientSection';
import { AnalysisSection } from './sections/AnalysisSection';
import { TemporalSection } from './sections/TemporalSection';
import { SearchFooter } from './sections/SearchFooter';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: ABGSearchFilters) => void;
  onReset: () => void;
  initialFilters?: ABGSearchFilters;
  patients?: PatientInfo[];
  className?: string;
}

const SEARCH_CONFIG = {
  ANIMATION_DELAYS: {
    FOCUS: 300,
    SEARCH: 1200
  },
  SPRING_CONFIG: {
    stiffness: 300,
    damping: 30
  },
  MODAL_CONSTRAINTS: {
    maxWidth: '3xl',
    maxHeight: '80vh',
    contentHeight: 400
  }
} as const;

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onReset,
  initialFilters = {},
  patients = [],
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom hook for search logic
  const {
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
    handleSearch: performSearch,
    handleReset: performReset
  } = useAdvancedSearch({
    initialFilters,
    onSearch,
    onReset,
    onClose
  });

  // Spring animations for smooth interactions
  const searchProgress = useSpring(0, SEARCH_CONFIG.SPRING_CONFIG);
  const searchScale = useTransform(searchProgress, [0, 100], [1, 1.02]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    searchProgress.set(100);
    performSearch();
    setTimeout(() => searchProgress.set(0), SEARCH_CONFIG.ANIMATION_DELAYS.SEARCH);
  }, [performSearch, searchProgress]);

  const handleReset = useCallback(() => {
    performReset();
  }, [performReset]);

  // Keyboard and modal management
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const focusTimeout = setTimeout(
      () => searchInputRef.current?.focus(), 
      SEARCH_CONFIG.ANIMATION_DELAYS.FOCUS
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSearch();
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [isOpen, onClose, handleSearch]);

  // Memoized current section
  const currentSection = useMemo(
    () => searchSections.find(s => s.id === activeSection)!,
    [activeSection]
  );

  // Render section content based on active section
  const renderSectionContent = useCallback(() => {
    const sectionProps = {
      filters,
      updateFilter,
      patients
    };

    switch (activeSection) {
      case 'clinical':
        return <ClinicalSection {...sectionProps} />;
      case 'patient':
        return <PatientSection {...sectionProps} />;
      case 'analysis':
        return <AnalysisSection {...sectionProps} />;
      case 'temporal':
        return <TemporalSection {...sectionProps} />;
      default:
        return <ClinicalSection {...sectionProps} />;
    }
  }, [activeSection, filters, updateFilter, patients]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-8">
        {/* Invisible backdrop for click-to-close */}
        <div
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.1 }}
          className={cn(
            "relative z-10 w-full overflow-hidden",
            `max-w-${SEARCH_CONFIG.MODAL_CONSTRAINTS.maxWidth}`,
            `max-h-[${SEARCH_CONFIG.MODAL_CONSTRAINTS.maxHeight}]`,
            className
          )}
          style={{ scale: searchScale }}
        >
          <Card className="bg-white border-2 border-slate-300 shadow-2xl rounded-xl">
            <SearchHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFiltersCount={activeFiltersCount}
              onClose={onClose}
              searchInputRef={searchInputRef}
            />

            {/* Content */}
            <div className={`flex h-[${SEARCH_CONFIG.MODAL_CONSTRAINTS.contentHeight}px]`}>
              <SearchSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                activeFiltersCount={activeFiltersCount}
                searchQuery={searchQuery}
                filters={filters}
                onReset={handleReset}
                onRemoveFilter={removeFilter}
              />

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    {renderSectionContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <SearchFooter
              hasChanges={hasChanges}
              activeFiltersCount={activeFiltersCount}
              isSearching={isSearching}
              onReset={handleReset}
              onClose={onClose}
              onSearch={handleSearch}
            />
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Export as default for easy importing
export default AdvancedSearchModal;