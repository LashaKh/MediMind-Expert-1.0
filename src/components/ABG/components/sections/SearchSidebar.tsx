import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { searchSections } from '../config/searchConfig';
import { ABGSearchFilters } from '../../../../types/abg';

interface SearchSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeFiltersCount: number;
  searchQuery: string;
  filters: ABGSearchFilters;
  onReset: () => void;
  onRemoveFilter: (key: keyof ABGSearchFilters) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  activeSection,
  setActiveSection,
  activeFiltersCount,
  searchQuery,
  filters,
  onReset,
  onRemoveFilter
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-64 border-r border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white/60 backdrop-blur-xl">
      <div className="p-4 space-y-2">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 mb-1">{t('abg.search.categories', 'Search Categories')}</h3>
          <p className="text-xs text-slate-600">{t('abg.search.categoriesDesc', 'Explore different aspects of your ABG data')}</p>
        </div>
        
        {searchSections.map((section, index) => (
          <motion.button
            key={section.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "w-full text-left p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
              activeSection === section.id
                ? "bg-white shadow-lg border border-slate-200/60 scale-[1.02]"
                : "hover:bg-white/70 hover:shadow-md hover:scale-[1.01]"
            )}
          >
            {/* Background gradient when active */}
            {activeSection === section.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("absolute inset-0 bg-gradient-to-r opacity-10 rounded-xl", section.gradient)}
              />
            )}
            
            <div className="relative flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300 shadow-sm",
                activeSection === section.id
                  ? `${section.accent} text-white shadow-md`
                  : `bg-${section.color}-50 text-${section.color}-600 group-hover:shadow-md`
              )}>
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 mb-1 text-sm">{section.label}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{section.description}</div>
              </div>
              {activeSection === section.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mx-4 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/60"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('abg.filtersAdvanced.title', 'Advanced Filters')}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                {t('common.clear', 'Clear')}
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {searchQuery && (
                <div className="flex items-center justify-between text-xs p-2 bg-white/70 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('abg.search.query', 'Search Query')}</span>
                  <Badge variant="outline" className="text-xs max-w-32 truncate">
                    "{searchQuery}"
                  </Badge>
                </div>
              )}
              {Object.entries(filters).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs p-2 bg-white/70 rounded-lg">
                  <span className="text-slate-600 font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFilter(key as keyof ABGSearchFilters)}
                    className="h-5 w-5 p-0 hover:bg-red-100 text-red-500 rounded-full"
                    aria-label={`Remove ${key} filter`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};