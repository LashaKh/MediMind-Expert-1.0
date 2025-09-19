/**
 * ClinicalTrialCard - Component for displaying clinical trial search results
 * Shows key trial information in an accessible, user-friendly format
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BeakerIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { ClinicalTrialSearchResult } from '@/services/clinicalTrialsService';

interface ClinicalTrialCardProps {
  trial: ClinicalTrialSearchResult;
  onViewDetails?: (trial: ClinicalTrialSearchResult) => void;
  className?: string;
}

export const ClinicalTrialCard: React.FC<ClinicalTrialCardProps> = ({
  trial,
  onViewDetails,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'RECRUITING':
        return {
          color: 'text-green-700 bg-green-100',
          icon: CheckCircleIcon,
          label: t('search.clinicalTrials.status.recruiting', 'Recruiting')
        };
      case 'ACTIVE_NOT_RECRUITING':
        return {
          color: 'text-[#1a365d] bg-[#90cdf4]/20',
          icon: ClockIcon,
          label: t('search.clinicalTrials.status.active', 'Active')
        };
      case 'COMPLETED':
        return {
          color: 'text-gray-700 bg-gray-100',
          icon: CheckCircleIcon,
          label: t('search.clinicalTrials.status.completed', 'Completed')
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: InformationCircleIcon,
          label: status
        };
    }
  };

  // Get phase display
  const getPhaseDisplay = (phase?: string) => {
    if (!phase) return null;
    const phaseNumber = phase.replace('PHASE', '').replace('_', ' ');
    return `Phase ${phaseNumber}`;
  };

  const statusDisplay = getStatusDisplay(trial.clinicalTrialData?.status || 'UNKNOWN');
  const StatusIcon = statusDisplay.icon;

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {trial.title}
            </h3>
            <p className="text-sm text-gray-600">
              NCT ID: {trial.clinicalTrialData?.nctId}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusDisplay.label}</span>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Phase */}
          {trial.clinicalTrialData?.phase && (
            <div className="flex items-start gap-2">
              <BeakerIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">{t('search.clinicalTrials.phase', 'Phase')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {getPhaseDisplay(trial.clinicalTrialData.phase)}
                </p>
              </div>
            </div>
          )}

          {/* Enrollment */}
          {trial.clinicalTrialData?.enrollment && (
            <div className="flex items-start gap-2">
              <UserGroupIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">{t('search.clinicalTrials.enrollment', 'Enrollment')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {trial.clinicalTrialData.enrollment.toLocaleString()} {t('search.clinicalTrials.participants', 'participants')}
                </p>
              </div>
            </div>
          )}

          {/* Start Date */}
          {trial.clinicalTrialData?.startDate && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">{t('search.clinicalTrials.startDate', 'Start Date')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(trial.clinicalTrialData.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Location Count */}
          {trial.clinicalTrialData?.locations && trial.clinicalTrialData.locations.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">{t('search.clinicalTrials.locations', 'Locations')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {trial.clinicalTrialData.locations.length} {t('search.clinicalTrials.sites', 'sites')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {trial.snippet}
        </p>

        {/* Eligibility Summary */}
        {trial.clinicalTrialData?.eligibility && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {t('search.clinicalTrials.eligibility', 'Eligibility')}:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {trial.clinicalTrialData.eligibility.gender && (
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">
                  {t('search.clinicalTrials.gender', 'Gender')}: {trial.clinicalTrialData.eligibility.gender}
                </span>
              )}
              {trial.clinicalTrialData.eligibility.minAge && (
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">
                  {t('search.clinicalTrials.minAge', 'Min Age')}: {trial.clinicalTrialData.eligibility.minAge}
                </span>
              )}
              {trial.clinicalTrialData.eligibility.maxAge && (
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">
                  {t('search.clinicalTrials.maxAge', 'Max Age')}: {trial.clinicalTrialData.eligibility.maxAge}
                </span>
              )}
              {trial.clinicalTrialData.eligibility.acceptsHealthyVolunteers !== undefined && (
                <span className="px-2 py-1 bg-white rounded-md text-gray-600">
                  {trial.clinicalTrialData.eligibility.acceptsHealthyVolunteers
                    ? t('search.clinicalTrials.acceptsHealthy', 'Accepts Healthy Volunteers')
                    : t('search.clinicalTrials.patientsOnly', 'Patients Only')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nearest Location */}
        {trial.clinicalTrialData?.locations && trial.clinicalTrialData.locations.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {t('search.clinicalTrials.nearestLocation', 'Nearest Location')}:
            </p>
            <p className="text-sm text-gray-600">
              {trial.clinicalTrialData.locations[0].facility}
              {trial.clinicalTrialData.locations[0].city && `, ${trial.clinicalTrialData.locations[0].city}`}
              {trial.clinicalTrialData.locations[0].state && `, ${trial.clinicalTrialData.locations[0].state}`}
              {trial.clinicalTrialData.locations[0].country && `, ${trial.clinicalTrialData.locations[0].country}`}
              {trial.clinicalTrialData.locations[0].distance && (
                <span className="text-[#2b6cb0] ml-1">
                  ({trial.clinicalTrialData.locations[0].distance} {t('search.clinicalTrials.miles', 'miles')})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails?.(trial)}
            className="flex-1 px-4 py-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1a365d] transition-colors font-medium text-sm"
          >
            {t('search.clinicalTrials.checkEligibility', 'Check Eligibility')}
          </button>
          <a
            href={trial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
          >
            {t('search.clinicalTrials.viewDetails', 'View Details')}
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Last Updated */}
        {trial.clinicalTrialData?.lastUpdateDate && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            {t('search.clinicalTrials.lastUpdated', 'Last updated')}: {new Date(trial.clinicalTrialData.lastUpdateDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ClinicalTrialCard;