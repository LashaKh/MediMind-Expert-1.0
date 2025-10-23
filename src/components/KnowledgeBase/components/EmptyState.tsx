/**
 * Empty State Component
 *
 * Displays empty library state with CTA to upload first document.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { SearchFilters, SpecialtyTheme } from '../PersonalLibrary/types';

interface EmptyStateProps {
  filters: SearchFilters;
  theme: SpecialtyTheme;
  onUploadClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filters,
  theme,
  onUploadClick
}) => {
  const { t } = useTranslation();

  const hasActiveFilters = filters.searchTerm || filters.category !== 'all' || filters.tags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      {/* Enhanced Icon with Medical Blue Gradient */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
        <BookOpen className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} />
      </motion.div>

      {/* Typography */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3"
      >
        {hasActiveFilters
          ? t('knowledgeBase.noDocumentsMatchSearch')
          : t('knowledgeBase.yourKnowledgeBaseAwaits')
        }
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto"
      >
        {hasActiveFilters
          ? t('knowledgeBase.tryAdjustingCriteria')
          : t('knowledgeBase.startBuildingLibrary')
        }
      </motion.p>

      {/* CTA Button */}
      {!hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadClick}
          className={`
            px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg
            bg-gradient-to-r ${theme.primaryGradient}
            hover:shadow-xl transition-all duration-300
            flex items-center space-x-2 mx-auto
          `}
        >
          <Upload className="w-5 h-5" />
          <span>{t('knowledgeBase.uploadYourFirstDocument')}</span>
        </motion.button>
      )}
    </motion.div>
  );
};
