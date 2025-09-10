/**
 * AdvancedOptionsFilters - Clinical trials and advanced filtering options
 * Extends existing clinical trial filters with additional advanced options
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CogIcon } from '@heroicons/react/24/outline';
import { ClinicalTrialsFilters } from '../ClinicalTrialsFilters';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface AdvancedOptionsFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

export const AdvancedOptionsFilters: React.FC<AdvancedOptionsFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  const handleTrialFiltersChange = (trialFilters: any) => {
    onFiltersChange({
      ...filters,
      trialFilters
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
          <CogIcon className="w-6 h-6 text-[var(--foreground-tertiary)]" />
          {t('filters.advancedOptions.title', 'Advanced Options')}
        </h3>
        <p className="text-[var(--foreground-tertiary)] mb-6">
          {t('filters.advancedOptions.description', 'Clinical trials, research parameters, and specialized filtering options')}
        </p>
      </div>

      {/* Clinical Trials Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          {t('filters.advancedOptions.trials', 'Clinical Trials Filtering')}
        </h4>
        <div className="bg-[var(--component-card)] border border-[var(--glass-border-light)] rounded-lg p-1">
          <ClinicalTrialsFilters
            onFiltersChange={handleTrialFiltersChange}
            className="border-none shadow-none bg-transparent"
          />
        </div>
      </div>

      {/* Future Advanced Options */}
      <div className="bg-[var(--component-surface-primary)] border border-[var(--glass-border-light)] rounded-lg p-6 text-center">
        <CogIcon className="w-12 h-12 text-[var(--foreground-secondary)] mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-[var(--foreground-tertiary)] mb-2">{t('filters.advancedOptions.comingSoon.title', 'More Advanced Options Coming Soon')}</h4>
        <p className="text-[var(--foreground-tertiary)]">
          {t('filters.advancedOptions.comingSoon.body', 'Additional specialized filtering options for research parameters, study designs, and advanced search operators will be available in future updates.')}
        </p>
      </div>
    </div>
  );
};

export default AdvancedOptionsFilters;