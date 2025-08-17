/**
 * AuthorityQualityFilters - Source credibility and quality filtering options
 * Allows users to filter by source authority, peer review status, and evidence quality
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheckIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  GlobeAltIcon,
  StarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import {
  ShieldCheckIcon as ShieldCheckSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface AuthorityQualityFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

interface AuthorityOption {
  id: string;
  label: string;
  description: string;
  examples: string[];
  icon: React.ElementType;
  color: string;
  trustLevel: 'high' | 'medium' | 'standard';
}

export const AuthorityQualityFilters: React.FC<AuthorityQualityFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  // Source authority options
  const authorityOptions: Record<string, AuthorityOption[]> = {
    government: [
      {
        id: 'cdc',
        label: 'CDC',
        description: 'Centers for Disease Control and Prevention',
        examples: ['Disease surveillance', 'Public health guidelines'],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'fda',
        label: 'FDA',
        description: 'Food and Drug Administration',
        examples: ['Drug approvals', 'Safety communications'],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'nih',
        label: 'NIH',
        description: 'National Institutes of Health',
        examples: ['Research funding', 'Clinical guidelines'],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'who',
        label: 'WHO',
        description: 'World Health Organization',
        examples: ['Global health guidelines', 'Disease classification'],
        icon: GlobeAltIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      }
    ],
    professionalSocieties: [
      {
        id: 'aha',
        label: 'AHA',
        description: 'American Heart Association',
        examples: ['Cardiology guidelines', 'CPR protocols'],
        icon: BuildingOfficeIcon,
        color: 'text-red-600',
        trustLevel: 'high'
      },
      {
        id: 'acs',
        label: 'ACS',
        description: 'American Cancer Society',
        examples: ['Cancer screening', 'Treatment guidelines'],
        icon: BuildingOfficeIcon,
        color: 'text-purple-600',
        trustLevel: 'high'
      },
      {
        id: 'asco',
        label: 'ASCO',
        description: 'American Society of Clinical Oncology',
        examples: ['Oncology guidelines', 'Treatment recommendations'],
        icon: BuildingOfficeIcon,
        color: 'text-indigo-600',
        trustLevel: 'high'
      },
      {
        id: 'acp',
        label: 'ACP',
        description: 'American College of Physicians',
        examples: ['Internal medicine guidelines', 'Best practices'],
        icon: BuildingOfficeIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      }
    ],
    academicInstitutions: [
      {
        id: 'harvard',
        label: 'Harvard Medical School',
        description: 'Leading medical education and research',
        examples: ['Medical research', 'Clinical studies'],
        icon: AcademicCapIcon,
        color: 'text-red-700',
        trustLevel: 'high'
      },
      {
        id: 'mayo-clinic',
        label: 'Mayo Clinic',
        description: 'Integrated clinical practice and research',
        examples: ['Clinical guidelines', 'Patient care protocols'],
        icon: AcademicCapIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      },
      {
        id: 'johns-hopkins',
        label: 'Johns Hopkins',
        description: 'Medical research and education leader',
        examples: ['Research publications', 'Clinical protocols'],
        icon: AcademicCapIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      }
    ],
    publishers: [
      {
        id: 'nejm',
        label: 'New England Journal of Medicine',
        description: 'Premier medical journal',
        examples: ['High-impact research', 'Clinical trials'],
        icon: BookOpenIcon,
        color: 'text-indigo-700',
        trustLevel: 'high'
      },
      {
        id: 'lancet',
        label: 'The Lancet',
        description: 'Leading international medical journal',
        examples: ['Global health research', 'Clinical studies'],
        icon: BookOpenIcon,
        color: 'text-red-600',
        trustLevel: 'high'
      },
      {
        id: 'bmj',
        label: 'BMJ',
        description: 'British Medical Journal',
        examples: ['Evidence-based medicine', 'Clinical research'],
        icon: BookOpenIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      },
      {
        id: 'jama',
        label: 'JAMA',
        description: 'Journal of the American Medical Association',
        examples: ['Clinical research', 'Medical guidelines'],
        icon: BookOpenIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      }
    ],
    medicalOrganizations: [
      {
        id: 'uptodate',
        label: 'UpToDate',
        description: 'Clinical decision support resource',
        examples: ['Clinical guidelines', 'Point-of-care information'],
        icon: GlobeAltIcon,
        color: 'text-teal-600',
        trustLevel: 'high'
      },
      {
        id: 'cochrane',
        label: 'Cochrane Library',
        description: 'Systematic reviews and evidence synthesis',
        examples: ['Systematic reviews', 'Meta-analyses'],
        icon: GlobeAltIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      },
      {
        id: 'medscape',
        label: 'Medscape',
        description: 'Medical information and education',
        examples: ['Medical news', 'Continuing education'],
        icon: GlobeAltIcon,
        color: 'text-blue-500',
        trustLevel: 'medium'
      }
    ]
  };

  // Peer review status options
  const peerReviewOptions = [
    {
      id: 'peer-reviewed',
      label: 'Peer-Reviewed',
      description: 'Reviewed by independent experts in the field',
      icon: CheckBadgeIcon,
      color: 'text-green-600',
      trustLevel: 'high' as const
    },
    {
      id: 'editorial-review',
      label: 'Editorial Review',
      description: 'Reviewed by editorial staff',
      icon: CheckBadgeIcon,
      color: 'text-blue-600',
      trustLevel: 'medium' as const
    },
    {
      id: 'expert-consensus',
      label: 'Expert Consensus',
      description: 'Based on expert panel agreement',
      icon: CheckBadgeIcon,
      color: 'text-purple-600',
      trustLevel: 'high' as const
    }
  ];

  // Citation tier options
  const citationTierOptions = [
    {
      id: 'highly-cited',
      label: 'Highly Cited',
      description: 'Articles with high citation counts (>100 citations)',
      icon: StarIcon,
      color: 'text-yellow-600',
      badge: 'High Impact'
    },
    {
      id: 'moderately-cited',
      label: 'Moderately Cited',
      description: 'Articles with moderate citation counts (10-100 citations)',
      icon: StarIcon,
      color: 'text-blue-600',
      badge: 'Good Impact'
    },
    {
      id: 'new-content',
      label: 'Recent Publications',
      description: 'Newly published content with emerging impact',
      icon: StarIcon,
      color: 'text-green-600',
      badge: 'Emerging'
    }
  ];

  const handleAuthorityChange = (category: string, authorityId: string, checked: boolean) => {
    const currentAuthorities = filters.sourceAuthority?.[category as keyof typeof filters.sourceAuthority] || [];
    const updatedAuthorities = checked
      ? [...currentAuthorities, authorityId]
      : currentAuthorities.filter(id => id !== authorityId);

    onFiltersChange({
      ...filters,
      sourceAuthority: {
        ...filters.sourceAuthority,
        [category]: updatedAuthorities
      }
    });
  };

  const handlePeerReviewChange = (reviewId: string, checked: boolean) => {
    const currentReviews = filters.peerReviewStatus || [];
    const updatedReviews = checked
      ? [...currentReviews, reviewId]
      : currentReviews.filter(id => id !== reviewId);

    onFiltersChange({
      ...filters,
      peerReviewStatus: updatedReviews
    });
  };

  const handleCitationTierChange = (tierId: string, checked: boolean) => {
    const currentTiers = filters.citationTier || [];
    const updatedTiers = checked
      ? [...currentTiers, tierId]
      : currentTiers.filter(id => id !== tierId);

    onFiltersChange({
      ...filters,
      citationTier: updatedTiers
    });
  };

  const getTrustLevelColor = (level: 'high' | 'medium' | 'standard') => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAuthoritySection = (categoryKey: string, categoryTitle: string, options: AuthorityOption[]) => {
    const selectedAuthorities = filters.sourceAuthority?.[categoryKey as keyof typeof filters.sourceAuthority] || [];

    return (
      <div key={categoryKey} className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          {options[0] && React.createElement(options[0].icon, { className: "w-5 h-5 text-gray-600" })}
          {categoryTitle}
          {selectedAuthorities.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {selectedAuthorities.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map(option => {
            const isSelected = selectedAuthorities.includes(option.id);
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
                  onChange={(e) => handleAuthorityChange(categoryKey, option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTrustLevelColor(option.trustLevel)}`}>
                      {option.trustLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> {option.examples.join(', ')}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheckSolid className="w-6 h-6 text-green-600" />
          {t('filters.authorityQuality.title', 'Authority & Quality')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('filters.authorityQuality.description', 'Filter by source credibility, peer review status, and evidence quality')}
        </p>
      </div>

      {/* Source Authority */}
      <div className="space-y-8">
        {renderAuthoritySection('government', t('filters.authorityQuality.sections.government', 'Government Sources'), authorityOptions.government)}
        {renderAuthoritySection('professionalSocieties', t('filters.authorityQuality.sections.professionalSocieties', 'Professional Societies'), authorityOptions.professionalSocieties)}
        {renderAuthoritySection('academicInstitutions', t('filters.authorityQuality.sections.academicInstitutions', 'Academic Institutions'), authorityOptions.academicInstitutions)}
        {renderAuthoritySection('publishers', t('filters.authorityQuality.sections.publishers', 'Publishers & Journals'), authorityOptions.publishers)}
        {renderAuthoritySection('medicalOrganizations', t('filters.authorityQuality.sections.medicalOrganizations', 'Medical Organizations'), authorityOptions.medicalOrganizations)}
      </div>

      {/* Peer Review Status */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-gray-600" />
          {t('filters.authorityQuality.peerReview', 'Peer Review Status')}
          {filters.peerReviewStatus && filters.peerReviewStatus.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.peerReviewStatus.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {peerReviewOptions.map(option => {
            const isSelected = filters.peerReviewStatus?.includes(option.id) || false;
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
                  onChange={(e) => handlePeerReviewChange(option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTrustLevelColor(option.trustLevel)}`}>
                      {option.trustLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Citation Tier */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <StarSolid className="w-5 h-5 text-yellow-600" />
          {t('filters.authorityQuality.citationImpact', 'Citation Impact')}
          {filters.citationTier && filters.citationTier.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.citationTier.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {citationTierOptions.map(option => {
            const isSelected = filters.citationTier?.includes(option.id) || false;
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
                  onChange={(e) => handleCitationTierChange(option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`w-4 h-4 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
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

      {/* Quality Indicators */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-amber-900 mb-1">{t('filters.authorityQuality.tips.title', 'Quality Assessment Tips')}</h5>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• {t('filters.authorityQuality.tips.gov', 'Government sources and major professional societies provide the highest authority')}</li>
              <li>• {t('filters.authorityQuality.tips.peer', 'Peer-reviewed content has undergone independent expert evaluation')}</li>
              <li>• {t('filters.authorityQuality.tips.cited', 'Highly cited articles indicate significant impact in the medical community')}</li>
              <li>• {t('filters.authorityQuality.tips.combine', 'Consider combining multiple quality indicators for best results')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(filters.sourceAuthority || filters.peerReviewStatus || filters.citationTier) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">{t('filters.authorityQuality.summary', 'Authority & Quality Summary')}</h5>
          <div className="text-sm text-gray-600 space-y-1">
            {filters.sourceAuthority && Object.entries(filters.sourceAuthority).map(([category, authorities]) => 
              authorities && authorities.length > 0 && (
                <div key={category}>
                  <strong className="capitalize">{t(`filters.authorityQuality.sections.${category}`, category.replace(/([A-Z])/g, ' $1').toLowerCase())}:</strong> {authorities.join(', ')}
                </div>
              )
            )}
            {filters.peerReviewStatus && filters.peerReviewStatus.length > 0 && (
              <div>
                <strong>{t('filters.authorityQuality.peerReviewLabel', 'Peer review:')}</strong> {filters.peerReviewStatus.join(', ')}
              </div>
            )}
            {filters.citationTier && filters.citationTier.length > 0 && (
              <div>
                <strong>{t('filters.authorityQuality.citationTierLabel', 'Citation tier:')}</strong> {filters.citationTier.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityQualityFilters;