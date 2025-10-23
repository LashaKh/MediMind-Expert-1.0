/**
 * Library Stats Component
 *
 * Displays library statistics cards (total, completed, processing, storage).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Archive, CheckCircle, Activity, Cloud } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { DocumentStats, SpecialtyTheme } from '../types/library.types';
import { formatFileSize } from '../utils/documentHelpers';

interface LibraryStatsProps {
  stats: DocumentStats;
  theme: SpecialtyTheme;
}

export const LibraryStats: React.FC<LibraryStatsProps> = ({ stats, theme }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Total Documents */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('knowledge-base.totalLibrary')}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t('knowledge-base.documentsCount')}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primaryGradient} shadow-lg`}>
            <Archive className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('knowledge-base.ready')}
            </p>
            <p className="text-3xl font-bold text-[#2b6cb0]">
              {stats.completed}
            </p>
            <p className="text-xs text-[#2b6cb0] mt-1">
              {t('knowledge-base.processed')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Processing */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('knowledge-base.processing')}
            </p>
            <p className="text-3xl font-bold text-[#63b3ed]">
              {stats.pending}
            </p>
            <p className="text-xs text-[#63b3ed] mt-1">
              {t('knowledge-base.inQueue')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#63b3ed] to-[#90cdf4] shadow-lg">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Storage Used */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('knowledge-base.storage')}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatFileSize(stats.totalSize)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t('knowledge-base.totalUsed')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] shadow-lg">
            <Cloud className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
