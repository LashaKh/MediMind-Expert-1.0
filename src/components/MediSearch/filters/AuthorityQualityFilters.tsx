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
        label: t('filters.authorityQuality.authorities.government.cdc.name', 'CDC'),
        description: t('filters.authorityQuality.authorities.government.cdc.description', 'Centers for Disease Control and Prevention'),
        examples: t('filters.authorityQuality.authorities.government.cdc.examples', { returnObjects: true, defaultValue: ['Disease surveillance', 'Public health guidelines'] }) as string[],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'fda',
        label: t('filters.authorityQuality.authorities.government.fda.name', 'FDA'),
        description: t('filters.authorityQuality.authorities.government.fda.description', 'Food and Drug Administration'),
        examples: t('filters.authorityQuality.authorities.government.fda.examples', { returnObjects: true, defaultValue: ['Drug approvals', 'Safety communications'] }) as string[],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'nih',
        label: t('filters.authorityQuality.authorities.government.nih.name', 'NIH'),
        description: t('filters.authorityQuality.authorities.government.nih.description', 'National Institutes of Health'),
        examples: t('filters.authorityQuality.authorities.government.nih.examples', { returnObjects: true, defaultValue: ['Research funding', 'Clinical guidelines'] }) as string[],
        icon: ShieldCheckIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      },
      {
        id: 'who',
        label: t('filters.authorityQuality.authorities.government.who.name', 'WHO'),
        description: t('filters.authorityQuality.authorities.government.who.description', 'World Health Organization'),
        examples: t('filters.authorityQuality.authorities.government.who.examples', { returnObjects: true, defaultValue: ['Global health guidelines', 'Disease classification'] }) as string[],
        icon: GlobeAltIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      }
    ],
    professionalSocieties: [
      {
        id: 'aha',
        label: t('filters.authorityQuality.authorities.professionalSocieties.aha.name', 'AHA'),
        description: t('filters.authorityQuality.authorities.professionalSocieties.aha.description', 'American Heart Association'),
        examples: t('filters.authorityQuality.authorities.professionalSocieties.aha.examples', { returnObjects: true, defaultValue: ['Cardiology guidelines', 'CPR protocols'] }) as string[],
        icon: BuildingOfficeIcon,
        color: 'text-red-600',
        trustLevel: 'high'
      },
      {
        id: 'acs',
        label: t('filters.authorityQuality.authorities.professionalSocieties.acs.name', 'ACS'),
        description: t('filters.authorityQuality.authorities.professionalSocieties.acs.description', 'American Cancer Society'),
        examples: t('filters.authorityQuality.authorities.professionalSocieties.acs.examples', { returnObjects: true, defaultValue: ['Cancer screening', 'Treatment guidelines'] }) as string[],
        icon: BuildingOfficeIcon,
        color: 'text-purple-600',
        trustLevel: 'high'
      },
      {
        id: 'asco',
        label: t('filters.authorityQuality.authorities.professionalSocieties.asco.name', 'ASCO'),
        description: t('filters.authorityQuality.authorities.professionalSocieties.asco.description', 'American Society of Clinical Oncology'),
        examples: t('filters.authorityQuality.authorities.professionalSocieties.asco.examples', { returnObjects: true, defaultValue: ['Oncology guidelines', 'Treatment recommendations'] }) as string[],
        icon: BuildingOfficeIcon,
        color: 'text-indigo-600',
        trustLevel: 'high'
      },
      {
        id: 'acp',
        label: t('filters.authorityQuality.authorities.professionalSocieties.acp.name', 'ACP'),
        description: t('filters.authorityQuality.authorities.professionalSocieties.acp.description', 'American College of Physicians'),
        examples: t('filters.authorityQuality.authorities.professionalSocieties.acp.examples', { returnObjects: true, defaultValue: ['Internal medicine guidelines', 'Best practices'] }) as string[],
        icon: BuildingOfficeIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      }
    ],
    academicInstitutions: [
      {
        id: 'harvard',
        label: t('filters.authorityQuality.authorities.academicInstitutions.harvard.name', 'Harvard Medical School'),
        description: t('filters.authorityQuality.authorities.academicInstitutions.harvard.description', 'Leading medical education and research'),
        examples: t('filters.authorityQuality.authorities.academicInstitutions.harvard.examples', { returnObjects: true, defaultValue: ['Medical research', 'Clinical studies'] }) as string[],
        icon: AcademicCapIcon,
        color: 'text-red-700',
        trustLevel: 'high'
      },
      {
        id: 'mayo-clinic',
        label: t('filters.authorityQuality.authorities.academicInstitutions.mayo.name', 'Mayo Clinic'),
        description: t('filters.authorityQuality.authorities.academicInstitutions.mayo.description', 'Integrated clinical practice and research'),
        examples: t('filters.authorityQuality.authorities.academicInstitutions.mayo.examples', { returnObjects: true, defaultValue: ['Clinical guidelines', 'Patient care protocols'] }) as string[],
        icon: AcademicCapIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      },
      {
        id: 'johns-hopkins',
        label: t('filters.authorityQuality.authorities.academicInstitutions.hopkins.name', 'Johns Hopkins'),
        description: t('filters.authorityQuality.authorities.academicInstitutions.hopkins.description', 'Medical research and education leader'),
        examples: t('filters.authorityQuality.authorities.academicInstitutions.hopkins.examples', { returnObjects: true, defaultValue: ['Research publications', 'Clinical protocols'] }) as string[],
        icon: AcademicCapIcon,
        color: 'text-blue-700',
        trustLevel: 'high'
      }
    ],
    publishers: [
      {
        id: 'nejm',
        label: t('filters.authorityQuality.authorities.publishers.nejm.name', 'New England Journal of Medicine'),
        description: t('filters.authorityQuality.authorities.publishers.nejm.description', 'Premier medical journal'),
        examples: t('filters.authorityQuality.authorities.publishers.nejm.examples', { returnObjects: true, defaultValue: ['High-impact research', 'Clinical trials'] }) as string[],
        icon: BookOpenIcon,
        color: 'text-indigo-700',
        trustLevel: 'high'
      },
      {
        id: 'lancet',
        label: t('filters.authorityQuality.authorities.publishers.lancet.name', 'The Lancet'),
        description: t('filters.authorityQuality.authorities.publishers.lancet.description', 'Leading international medical journal'),
        examples: t('filters.authorityQuality.authorities.publishers.lancet.examples', { returnObjects: true, defaultValue: ['Global health research', 'Clinical studies'] }) as string[],
        icon: BookOpenIcon,
        color: 'text-red-600',
        trustLevel: 'high'
      },
      {
        id: 'bmj',
        label: t('filters.authorityQuality.authorities.publishers.bmj.name', 'BMJ'),
        description: t('filters.authorityQuality.authorities.publishers.bmj.description', 'British Medical Journal'),
        examples: t('filters.authorityQuality.authorities.publishers.bmj.examples', { returnObjects: true, defaultValue: ['Evidence-based medicine', 'Clinical research'] }) as string[],
        icon: BookOpenIcon,
        color: 'text-blue-600',
        trustLevel: 'high'
      },
      {
        id: 'jama',
        label: t('filters.authorityQuality.authorities.publishers.jama.name', 'JAMA'),
        description: t('filters.authorityQuality.authorities.publishers.jama.description', 'Journal of the American Medical Association'),
        examples: t('filters.authorityQuality.authorities.publishers.jama.examples', { returnObjects: true, defaultValue: ['Clinical research', 'Medical guidelines'] }) as string[],
        icon: BookOpenIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      }
    ],
    medicalOrganizations: [
      {
        id: 'uptodate',
        label: t('filters.authorityQuality.authorities.medicalOrganizations.uptodate.name', 'UpToDate'),
        description: t('filters.authorityQuality.authorities.medicalOrganizations.uptodate.description', 'Clinical decision support resource'),
        examples: t('filters.authorityQuality.authorities.medicalOrganizations.uptodate.examples', { returnObjects: true, defaultValue: ['Clinical guidelines', 'Point-of-care information'] }) as string[],
        icon: GlobeAltIcon,
        color: 'text-teal-600',
        trustLevel: 'high'
      },
      {
        id: 'cochrane',
        label: t('filters.authorityQuality.authorities.medicalOrganizations.cochrane.name', 'Cochrane Library'),
        description: t('filters.authorityQuality.authorities.medicalOrganizations.cochrane.description', 'Systematic reviews and evidence synthesis'),
        examples: t('filters.authorityQuality.authorities.medicalOrganizations.cochrane.examples', { returnObjects: true, defaultValue: ['Systematic reviews', 'Meta-analyses'] }) as string[],
        icon: GlobeAltIcon,
        color: 'text-green-600',
        trustLevel: 'high'
      },
      {
        id: 'medscape',
        label: t('filters.authorityQuality.authorities.medicalOrganizations.medscape.name', 'Medscape'),
        description: t('filters.authorityQuality.authorities.medicalOrganizations.medscape.description', 'Medical information and education'),
        examples: t('filters.authorityQuality.authorities.medicalOrganizations.medscape.examples', { returnObjects: true, defaultValue: ['Medical news', 'Continuing education'] }) as string[],
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
      label: t('filters.authorityQuality.peerReviewOptions.peerReviewed.label', 'Peer-Reviewed'),
      description: t('filters.authorityQuality.peerReviewOptions.peerReviewed.description', 'Reviewed by independent experts in the field'),
      icon: CheckBadgeIcon,
      color: 'text-green-600',
      trustLevel: 'high' as const
    },
    {
      id: 'editorial-review',
      label: t('filters.authorityQuality.peerReviewOptions.editorialReview.label', 'Editorial Review'),
      description: t('filters.authorityQuality.peerReviewOptions.editorialReview.description', 'Reviewed by editorial staff'),
      icon: CheckBadgeIcon,
      color: 'text-blue-600',
      trustLevel: 'medium' as const
    },
    {
      id: 'expert-consensus',
      label: t('filters.authorityQuality.peerReviewOptions.expertConsensus.label', 'Expert Consensus'),
      description: t('filters.authorityQuality.peerReviewOptions.expertConsensus.description', 'Based on expert panel agreement'),
      icon: CheckBadgeIcon,
      color: 'text-purple-600',
      trustLevel: 'high' as const
    }
  ];

  // Citation tier options
  const citationTierOptions = [
    {
      id: 'highly-cited',
      label: t('filters.authorityQuality.citationTiers.highlyCited.label', 'Highly Cited'),
      description: t('filters.authorityQuality.citationTiers.highlyCited.description', 'Articles with high citation counts (>100 citations)'),
      icon: StarIcon,
      color: 'text-yellow-600',
      badge: t('filters.authorityQuality.citationTiers.highlyCited.impact', 'High Impact')
    },
    {
      id: 'moderately-cited',
      label: t('filters.authorityQuality.citationTiers.moderatelyCited.label', 'Moderately Cited'),
      description: t('filters.authorityQuality.citationTiers.moderatelyCited.description', 'Articles with moderate citation counts (10-100 citations)'),
      icon: StarIcon,
      color: 'text-blue-600',
      badge: t('filters.authorityQuality.citationTiers.moderatelyCited.impact', 'Good Impact')
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