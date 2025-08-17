/**
 * AudienceComplexityFilters - Target audience and complexity level filtering
 * Placeholder component - to be fully implemented
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UsersIcon } from '@heroicons/react/24/outline';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface AudienceComplexityFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

export const AudienceComplexityFilters: React.FC<AudienceComplexityFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-purple-600" />
          {t('filters.audienceComplexity.title', 'Audience & Complexity Level')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('filters.audienceComplexity.description', 'Filter by target audience, complexity level, and reading difficulty')}
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
        <UsersIcon className="w-12 h-12 text-purple-500 mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-purple-900 mb-2">Coming Soon</h4>
        <p className="text-purple-700">
          Audience targeting and complexity filtering for different professional levels will be available soon.
        </p>
      </div>
    </div>
  );
};

export default AudienceComplexityFilters;