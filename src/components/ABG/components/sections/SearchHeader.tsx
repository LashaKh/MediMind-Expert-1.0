import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import { quickSearchSuggestions } from '../config/searchConfig';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFiltersCount: number;
  onClose: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeFiltersCount,
  onClose,
  searchInputRef
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-blue-50" />
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/20 rounded-full blur-3xl translate-x-32 -translate-y-32" />
        </div>
      </div>
      
      <div className="relative px-6 py-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-30 scale-110" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent"
              >
                {t('abg.filtersAdvanced.title', 'Advanced Filters')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 flex items-center gap-2 mt-1"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t('abg.search.intelligentFiltering', 'Intelligent ABG filtering with AI-powered insights')}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Filters Badge */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md">
                    <Filter className="h-3 w-3 mr-1" />
                    {t('abg.filtersAdvanced.activeCount', '{{count}} active', { count: activeFiltersCount })}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full h-12 w-12 p-0 hover:bg-slate-100/70 transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Intelligent Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 relative"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl">
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('abg.results.searchPlaceholder', 'Search results...')}
                className="pl-14 pr-12 h-12 text-base bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 font-medium"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100/70 transition-colors"
                    aria-label={t('abg.search.clear', 'Clear search')}
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Search Suggestions */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">{t('abg.search.quickSearches', 'Quick searches:')}</span>
            {quickSearchSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 hover:text-slate-800 transition-all duration-200"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};