import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { RotateCcw, Filter, Target, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../ui/button';

interface SearchFooterProps {
  hasChanges: boolean;
  activeFiltersCount: number;
  isSearching: boolean;
  onReset: () => void;
  onClose: () => void;
  onSearch: () => void;
}

export const SearchFooter: React.FC<SearchFooterProps> = ({
  hasChanges,
  activeFiltersCount,
  isSearching,
  onReset,
  onClose,
  onSearch
}) => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/60 backdrop-blur-xl px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={!hasChanges}
            className="bg-white/70 border-slate-200 hover:bg-slate-50 flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t('abg.search.resetAll', 'Reset All Filters')}
          </Button>
          <div className="text-sm text-slate-600 flex items-center gap-2">
            {activeFiltersCount > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="font-semibold">{activeFiltersCount}</span>
                </div>
                <span>{t('abg.search.filtersActive', 'filter(s) active')}</span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {t('abg.search.noFilters', 'No filters applied')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="hover:bg-slate-100/70"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 py-2 h-auto"
            >
              {isSearching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-3"
                  >
                    <Target className="h-5 w-5" />
                  </motion.div>
                  <span className="font-semibold">{t('abg.search.searching', 'Searching...')}</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-3" />
                  <span className="font-semibold">{t('abg.search.apply', 'Apply Search')}</span>
                  <ArrowRight className="h-5 w-5 ml-3" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-3 pt-3 border-t border-slate-200/60">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">⏎</kbd>
            </div>
            <span>{t('abg.search.quick', 'Quick Search')}</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">Esc</kbd>
            <span>{t('abg.search.close', 'Close Modal')}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Sparkles className="h-3 w-3" />
            <span>{t('abg.search.aiPowered', 'AI-Powered')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};