/**
 * GeographicContextFilters - Geographic and contextual filtering
 * Allows users to filter by geographic relevance, practice settings, and patient populations
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  BuildingOffice2Icon,
  HomeIcon,
  UserGroupIcon,
  GlobeAmericasIcon,
  AcademicCapIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  MapPinIcon as MapPinSolid
} from '@heroicons/react/24/solid';
import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface GeographicContextFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

export const GeographicContextFilters: React.FC<GeographicContextFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  // Geographic regions
  const geographicRegions = [
    {
      id: 'north-america',
      label: 'North America',
      description: 'United States, Canada, Mexico',
      icon: GlobeAmericasIcon,
      color: 'text-blue-600',
      countries: ['US', 'CA', 'MX']
    },
    {
      id: 'europe',
      label: 'Europe',
      description: 'European Union and associated countries',
      icon: GlobeAmericasIcon,
      color: 'text-green-600',
      countries: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK']
    },
    {
      id: 'asia-pacific',
      label: 'Asia-Pacific',
      description: 'East Asia, Southeast Asia, Oceania',
      icon: GlobeAmericasIcon,
      color: 'text-red-600',
      countries: ['JP', 'CN', 'KR', 'AU', 'NZ', 'SG', 'TH', 'IN']
    },
    {
      id: 'latin-america',
      label: 'Latin America',
      description: 'South and Central America',
      icon: GlobeAmericasIcon,
      color: 'text-yellow-600',
      countries: ['BR', 'AR', 'CL', 'CO', 'PE', 'VE']
    },
    {
      id: 'middle-east-africa',
      label: 'Middle East & Africa',
      description: 'MENA region and Sub-Saharan Africa',
      icon: GlobeAmericasIcon,
      color: 'text-purple-600',
      countries: ['AE', 'SA', 'EG', 'ZA', 'NG', 'KE']
    }
  ];

  // Practice settings
  const practiceSettings = [
    {
      id: 'hospital-inpatient',
      label: 'Hospital Inpatient',
      description: 'Acute care, emergency departments, intensive care',
      icon: BuildingOffice2Icon,
      color: 'text-red-600',
      category: 'acute-care'
    },
    {
      id: 'hospital-outpatient',
      label: 'Hospital Outpatient',
      description: 'Ambulatory surgery, specialty clinics',
      icon: BuildingOffice2Icon,
      color: 'text-blue-600',
      category: 'ambulatory'
    },
    {
      id: 'primary-care',
      label: 'Primary Care',
      description: 'Family medicine, internal medicine, pediatrics',
      icon: HeartIcon,
      color: 'text-green-600',
      category: 'primary'
    },
    {
      id: 'specialty-clinic',
      label: 'Specialty Clinic',
      description: 'Specialized outpatient practices',
      icon: AcademicCapIcon,
      color: 'text-indigo-600',
      category: 'specialty'
    },
    {
      id: 'home-care',
      label: 'Home Care',
      description: 'Telemedicine, home visits, remote monitoring',
      icon: HomeIcon,
      color: 'text-teal-600',
      category: 'home'
    },
    {
      id: 'long-term-care',
      label: 'Long-term Care',
      description: 'Nursing homes, assisted living, rehabilitation',
      icon: UserGroupIcon,
      color: 'text-orange-600',
      category: 'long-term'
    }
  ];

  // Patient populations
  const patientPopulations = [
    {
      id: 'pediatric',
      label: 'Pediatric',
      description: 'Children and adolescents (0-18 years)',
      ageRange: '0-18',
      color: 'text-blue-600'
    },
    {
      id: 'adult',
      label: 'Adult',
      description: 'Adults (18-65 years)',
      ageRange: '18-65',
      color: 'text-green-600'
    },
    {
      id: 'geriatric',
      label: 'Geriatric',
      description: 'Elderly patients (65+ years)',
      ageRange: '65+',
      color: 'text-purple-600'
    },
    {
      id: 'pregnant-women',
      label: 'Pregnant Women',
      description: 'Prenatal, perinatal, and postnatal care',
      ageRange: 'reproductive',
      color: 'text-pink-600'
    },
    {
      id: 'immunocompromised',
      label: 'Immunocompromised',
      description: 'Patients with weakened immune systems',
      ageRange: 'all',
      color: 'text-red-600'
    },
    {
      id: 'chronic-conditions',
      label: 'Chronic Conditions',
      description: 'Diabetes, hypertension, COPD, etc.',
      ageRange: 'all',
      color: 'text-orange-600'
    }
  ];

  const handleGeographicChange = (regionId: string, checked: boolean) => {
    const currentRegions = filters.geographicRelevance || [];
    const updatedRegions = checked
      ? [...currentRegions, regionId]
      : currentRegions.filter(id => id !== regionId);

    onFiltersChange({
      ...filters,
      geographicRelevance: updatedRegions
    });
  };

  const handlePracticeSettingChange = (settingId: string, checked: boolean) => {
    const currentSettings = filters.practiceSettings || [];
    const updatedSettings = checked
      ? [...currentSettings, settingId]
      : currentSettings.filter(id => id !== settingId);

    onFiltersChange({
      ...filters,
      practiceSettings: updatedSettings
    });
  };

  const handlePatientPopulationChange = (populationId: string, checked: boolean) => {
    const currentPopulations = filters.patientPopulations || [];
    const updatedPopulations = checked
      ? [...currentPopulations, populationId]
      : currentPopulations.filter(id => id !== populationId);

    onFiltersChange({
      ...filters,
      patientPopulations: updatedPopulations
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPinSolid className="w-6 h-6 text-teal-600" />
          {t('filters.geographicContext.title', 'Geographic & Context')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('filters.geographicContext.description', 'Filter by geographic relevance, practice settings, and patient populations')}
        </p>
      </div>

      {/* Geographic Regions */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-gray-600" />
          {t('filters.geographicContext.regions', 'Geographic Regions')}
          {filters.geographicRelevance && filters.geographicRelevance.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.geographicRelevance.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {geographicRegions.map(region => {
            const isSelected = filters.geographicRelevance?.includes(region.id) || false;
            const IconComponent = region.icon;

            return (
              <label
                key={region.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleGeographicChange(region.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${region.color}`} />
                    <span className="font-medium text-gray-900">{region.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{region.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Practice Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <BuildingOffice2Icon className="w-5 h-5 text-gray-600" />
          {t('filters.geographicContext.practice', 'Practice Settings')}
          {filters.practiceSettings && filters.practiceSettings.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.practiceSettings.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {practiceSettings.map(setting => {
            const isSelected = filters.practiceSettings?.includes(setting.id) || false;
            const IconComponent = setting.icon;

            return (
              <label
                key={setting.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handlePracticeSettingChange(setting.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${setting.color}`} />
                    <span className="font-medium text-gray-900">{setting.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Patient Populations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-gray-600" />
          {t('filters.geographicContext.populations', 'Patient Populations')}
          {filters.patientPopulations && filters.patientPopulations.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.patientPopulations.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {patientPopulations.map(population => {
            const isSelected = filters.patientPopulations?.includes(population.id) || false;

            return (
              <label
                key={population.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handlePatientPopulationChange(population.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-4 h-4 rounded-full ${population.color.replace('text-', 'bg-')}`}></span>
                    <span className="font-medium text-gray-900">{population.label}</span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {population.ageRange}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{population.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Context Tips */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-teal-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-teal-900 mb-1">{t('filters.geographicContext.tips.title', 'Geographic & Context Tips')}</h5>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• {t('filters.geographicContext.tips.regions', 'Geographic filters help find region-specific guidelines and practices')}</li>
              <li>• {t('filters.geographicContext.tips.practice', 'Practice settings determine care protocols and resource availability')}</li>
              <li>• {t('filters.geographicContext.tips.populations', 'Patient populations affect treatment approaches and safety considerations')}</li>
              <li>• {t('filters.geographicContext.tips.combine', 'Consider combining multiple contexts for comprehensive care guidance')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(filters.geographicRelevance || filters.practiceSettings || filters.patientPopulations) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">{t('filters.geographicContext.summary', 'Geographic & Context Summary')}</h5>
          <div className="text-sm text-gray-600 space-y-1">
            {filters.geographicRelevance && filters.geographicRelevance.length > 0 && (
              <div>
                <strong>{t('filters.geographicContext.summaryRegions', 'Geographic regions:')}</strong> {filters.geographicRelevance.map(id => geographicRegions.find(r => r.id === id)?.label || id).join(', ')}
              </div>
            )}
            {filters.practiceSettings && filters.practiceSettings.length > 0 && (
              <div>
                <strong>{t('filters.geographicContext.summaryPractice', 'Practice settings:')}</strong> {filters.practiceSettings.map(id => practiceSettings.find(s => s.id === id)?.label || id).join(', ')}
              </div>
            )}
            {filters.patientPopulations && filters.patientPopulations.length > 0 && (
              <div>
                <strong>{t('filters.geographicContext.summaryPopulations', 'Patient populations:')}</strong> {filters.patientPopulations.map(id => patientPopulations.find(p => p.id === id)?.label || id).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographicContextFilters;