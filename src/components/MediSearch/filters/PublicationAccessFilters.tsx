/**
 * PublicationAccessFilters - Publication date and access filtering
 * Allows users to filter by publication dates, access types, and availability
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarSolid,
  ClockIcon as ClockSolid
} from '@heroicons/react/24/solid';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface PublicationAccessFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

export const PublicationAccessFilters: React.FC<PublicationAccessFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  // Publication date ranges
  const dateRangeOptions = [
    {
      id: 'last-month',
      label: 'Last Month',
      description: 'Published within the last 30 days',
      icon: ClockIcon,
      color: 'text-green-600',
      value: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      id: 'last-3-months',
      label: 'Last 3 Months',
      description: 'Published within the last 90 days',
      icon: ClockIcon,
      color: 'text-blue-600',
      value: { from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      id: 'last-6-months',
      label: 'Last 6 Months',
      description: 'Published within the last 6 months',
      icon: ClockIcon,
      color: 'text-indigo-600',
      value: { from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      id: 'last-year',
      label: 'Last Year',
      description: 'Published within the last 12 months',
      icon: ClockIcon,
      color: 'text-purple-600',
      value: { from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      id: 'last-2-years',
      label: 'Last 2 Years',
      description: 'Published within the last 2 years',
      icon: ClockIcon,
      color: 'text-orange-600',
      value: { from: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), to: new Date() }
    },
    {
      id: 'last-5-years',
      label: 'Last 5 Years',
      description: 'Published within the last 5 years',
      icon: ClockIcon,
      color: 'text-red-600',
      value: { from: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), to: new Date() }
    }
  ];

  // Access type options
  const accessTypeOptions = [
    {
      id: 'open-access',
      label: 'Open Access',
      description: 'Freely available to everyone',
      icon: GlobeAltIcon,
      color: 'text-green-600',
      badge: 'Free',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'subscription',
      label: 'Subscription Required',
      description: 'Requires institutional or personal subscription',
      icon: LockClosedIcon,
      color: 'text-blue-600',
      badge: 'Subscription',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'pay-per-view',
      label: 'Pay-per-View',
      description: 'Available for individual purchase',
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      badge: 'Paid',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'free-with-registration',
      label: 'Free with Registration',
      description: 'Free access after user registration',
      icon: CheckCircleIcon,
      color: 'text-teal-600',
      badge: 'Registration',
      badgeColor: 'bg-teal-100 text-teal-800'
    }
  ];

  // Language options
  const languageOptions = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'es', label: 'Spanish', flag: '🇪🇸' },
    { id: 'fr', label: 'French', flag: '🇫🇷' },
    { id: 'de', label: 'German', flag: '🇩🇪' },
    { id: 'it', label: 'Italian', flag: '🇮🇹' },
    { id: 'pt', label: 'Portuguese', flag: '🇵🇹' },
    { id: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { id: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { id: 'ru', label: 'Russian', flag: '🇷🇺' },
    { id: 'ar', label: 'Arabic', flag: '🇸🇦' }
  ];

  const handleDateRangeChange = (rangeId: string, checked: boolean) => {
    const currentRanges = filters.publicationDateRange || [];
    const updatedRanges = checked
      ? [...currentRanges, rangeId]
      : currentRanges.filter(id => id !== rangeId);

    onFiltersChange({
      ...filters,
      publicationDateRange: updatedRanges
    });
  };

  const handleAccessTypeChange = (accessId: string, checked: boolean) => {
    const currentAccess = filters.accessType || [];
    const updatedAccess = checked
      ? [...currentAccess, accessId]
      : currentAccess.filter(id => id !== accessId);

    onFiltersChange({
      ...filters,
      accessType: updatedAccess
    });
  };

  const handleLanguageChange = (langId: string, checked: boolean) => {
    const currentLanguages = filters.language || [];
    const updatedLanguages = checked
      ? [...currentLanguages, langId]
      : currentLanguages.filter(id => id !== langId);

    onFiltersChange({
      ...filters,
      language: updatedLanguages
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarSolid className="w-6 h-6 text-indigo-600" />
          {t('filters.publicationAccess.title', 'Publication & Access')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('filters.publicationAccess.description', 'Filter by publication date, access type, and availability')}
        </p>
      </div>

      {/* Publication Date Range */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          {t('filters.publicationAccess.publicationDate', 'Publication Date')}
          {filters.publicationDateRange && filters.publicationDateRange.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.publicationDateRange.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dateRangeOptions.map(option => {
            const isSelected = filters.publicationDateRange?.includes(option.id) || false;
            const IconComponent = option.icon;

            return (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleDateRangeChange(option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Access Type */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <LockClosedIcon className="w-5 h-5 text-gray-600" />
          {t('filters.publicationAccess.accessType', 'Access Type')}
          {filters.accessType && filters.accessType.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.accessType.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accessTypeOptions.map(option => {
            const isSelected = filters.accessType?.includes(option.id) || false;
            const IconComponent = option.icon;

            return (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleAccessTypeChange(option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${option.badgeColor}`}>
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-gray-600" />
          {t('filters.publicationAccess.language', 'Language')}
          {filters.language && filters.language.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.language.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {languageOptions.map(option => {
            const isSelected = filters.language?.includes(option.id) || false;

            return (
              <label
                key={option.id}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleLanguageChange(option.id, e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-lg">{option.flag}</span>
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Access Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 mb-1">{t('filters.publicationAccess.tips.title', 'Access & Publication Tips')}</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('filters.publicationAccess.tips.open', 'Open access content is immediately available without restrictions')}</li>
              <li>• {t('filters.publicationAccess.tips.recent', 'Recent publications may have the most current treatment guidelines')}</li>
              <li>• {t('filters.publicationAccess.tips.access', 'Some high-quality content may require institutional access')}</li>
              <li>• {t('filters.publicationAccess.tips.ranges', 'Consider multiple date ranges for comprehensive coverage')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(filters.publicationDateRange || filters.accessType || filters.language) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">{t('filters.publicationAccess.summary', 'Publication & Access Summary')}</h5>
          <div className="text-sm text-gray-600 space-y-1">
            {filters.publicationDateRange && filters.publicationDateRange.length > 0 && (
              <div>
                <strong>{t('filters.publicationAccess.summaryRanges', 'Date ranges:')}</strong> {filters.publicationDateRange.join(', ')}
              </div>
            )}
            {filters.accessType && filters.accessType.length > 0 && (
              <div>
                <strong>{t('filters.publicationAccess.summaryAccess', 'Access types:')}</strong> {filters.accessType.join(', ')}
              </div>
            )}
            {filters.language && filters.language.length > 0 && (
              <div>
                <strong>{t('filters.publicationAccess.summaryLang', 'Languages:')}</strong> {filters.language.map(lang => languageOptions.find(l => l.id === lang)?.label || lang).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationAccessFilters;