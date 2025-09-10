/**
 * MedicalDomainFilters - Medical specialty and domain filtering options
 * Placeholder component - to be fully implemented
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface MedicalDomainFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

export const MedicalDomainFilters: React.FC<MedicalDomainFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
          <HeartIcon className="w-6 h-6 text-red-600" />
          {t('filters.medicalDomain.title', 'Medical Domain & Specialties')}
        </h3>
        <p className="text-[var(--foreground-tertiary)] mb-6">
          {t('filters.medicalDomain.description', 'Filter by medical specialties, subspecialties, and clinical topics')}
        </p>
      </div>

      <div className="bg-[var(--cardiology-accent-blue-light)] border border-blue-200 rounded-lg p-6 text-center">
        <HeartIcon className="w-12 h-12 text-[var(--cardiology-accent-blue)] mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-blue-900 mb-2">{t('filters.medicalDomain.comingSoon.title', 'Coming Soon')}</h4>
        <p className="text-[var(--cardiology-accent-blue-dark)]">
          {t('filters.medicalDomain.comingSoon.body', 'Medical specialty filtering with 25+ specialties and subspecialties will be available in the next update.')}
        </p>
      </div>
    </div>
  );
};

export default MedicalDomainFilters;