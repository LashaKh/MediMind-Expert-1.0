/**
 * ClinicalTrialsFilters - Filter component for clinical trials search
 * Provides location-based and status filtering
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  FunnelIcon,
  BeakerIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import type { ClinicalTrialFilters } from '@/services/clinicalTrialsService';

interface ClinicalTrialsFiltersProps {
  onFiltersChange: (filters: ClinicalTrialFilters) => void;
  className?: string;
}

export const ClinicalTrialsFilters: React.FC<ClinicalTrialsFiltersProps> = ({
  onFiltersChange,
  className = ''
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ClinicalTrialFilters>({
    recruitmentStatus: ['recruiting'],
    phase: [],
    gender: 'all'
  });
  const [locationAddress, setLocationAddress] = useState('');
  const [locationRadius, setLocationRadius] = useState(50);

  const handleFilterChange = (newFilters: Partial<ClinicalTrialFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleLocationChange = () => {
    if (locationAddress.trim()) {
      handleFilterChange({
        location: {
          address: locationAddress,
          radius: locationRadius
        }
      });
    } else {
      const { location, ...rest } = filters;
      handleFilterChange(rest);
    }
  };

  const statusOptions = [
    { value: 'recruiting', label: t('search.clinicalTrials.status.recruiting') },
    { value: 'active', label: t('search.clinicalTrials.status.active') },
    { value: 'completed', label: t('search.clinicalTrials.status.completed') }
  ];

  const phaseOptions = [
    { value: 'phase1', label: 'Phase 1' },
    { value: 'phase2', label: 'Phase 2' },
    { value: 'phase3', label: 'Phase 3' },
    { value: 'phase4', label: 'Phase 4' }
  ];

  const genderOptions = [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <FunnelIcon className="w-5 h-5 text-[#2b6cb0]" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('search.clinicalTrials.filters', 'Clinical Trial Filters')}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Location Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4" />
            {t('search.clinicalTrials.locationFilter', 'Location')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              onBlur={handleLocationChange}
              placeholder={t('search.clinicalTrials.locationPlaceholder', 'City, State or ZIP')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#2b6cb0] focus:border-[#2b6cb0] text-sm"
            />
            <select
              value={locationRadius}
              onChange={(e) => {
                setLocationRadius(Number(e.target.value));
                if (locationAddress) handleLocationChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-[#2b6cb0] focus:border-[#2b6cb0] text-sm"
            >
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
              <option value={250}>250 miles</option>
            </select>
          </div>
        </div>

        {/* Recruitment Status */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserGroupIcon className="w-4 h-4" />
            {t('search.clinicalTrials.recruitmentStatus', 'Recruitment Status')}
          </label>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={filters.recruitmentStatus?.includes(option.value) || false}
                  onChange={(e) => {
                    const current = filters.recruitmentStatus || [];
                    const updated = e.target.checked
                      ? [...current, option.value]
                      : current.filter(s => s !== option.value);
                    handleFilterChange({ recruitmentStatus: updated });
                  }}
                  className="w-4 h-4 text-[#2b6cb0] border-gray-300 rounded focus:ring-[#2b6cb0]"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phase Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BeakerIcon className="w-4 h-4" />
            {t('search.clinicalTrials.phase', 'Phase')}
          </label>
          <div className="space-y-2">
            {phaseOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={filters.phase?.includes(option.value) || false}
                  onChange={(e) => {
                    const current = filters.phase || [];
                    const updated = e.target.checked
                      ? [...current, option.value]
                      : current.filter(p => p !== option.value);
                    handleFilterChange({ phase: updated });
                  }}
                  className="w-4 h-4 text-[#2b6cb0] border-gray-300 rounded focus:ring-[#2b6cb0]"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4" />
            {t('search.clinicalTrials.ageRange', 'Age Range')}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t('search.clinicalTrials.minAge', 'Min Age')}
              onChange={(e) => {
                const min = e.target.value ? Number(e.target.value) : undefined;
                handleFilterChange({
                  ageRange: {
                    ...filters.ageRange,
                    min
                  }
                });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#2b6cb0] focus:border-[#2b6cb0] text-sm"
              min="0"
              max="120"
            />
            <input
              type="number"
              placeholder={t('search.clinicalTrials.maxAge', 'Max Age')}
              onChange={(e) => {
                const max = e.target.value ? Number(e.target.value) : undefined;
                handleFilterChange({
                  ageRange: {
                    ...filters.ageRange,
                    max
                  }
                });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#2b6cb0] focus:border-[#2b6cb0] text-sm"
              min="0"
              max="120"
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserGroupIcon className="w-4 h-4" />
            {t('search.clinicalTrials.gender', 'Gender')}
          </label>
          <select
            value={filters.gender || 'all'}
            onChange={(e) => handleFilterChange({ gender: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#2b6cb0] focus:border-[#2b6cb0] text-sm"
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setFilters({ recruitmentStatus: ['recruiting'], phase: [], gender: 'all' });
            setLocationAddress('');
            setLocationRadius(50);
            onFiltersChange({ recruitmentStatus: ['recruiting'], phase: [], gender: 'all' });
          }}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          {t('search.clinicalTrials.clearFilters', 'Clear Filters')}
        </button>
      </div>
    </div>
  );
};

export default ClinicalTrialsFilters;