/**
 * QuickFilters - Pre-configured popular filter combinations for common medical searches
 * Provides instant access to commonly used filter combinations
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  // Medical specialties
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  EyeIcon,
  
  // Content types
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  
  // Quality indicators
  StarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  FireIcon,
  
  // Audience types
  UserGroupIcon,
  UsersIcon,
  UserIcon,
  
  // Utility
  ClockIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  PlusIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  SparklesIcon as SparklesSolid,
  FireIcon as FireSolid,
  BoltIcon as BoltSolid
} from '@heroicons/react/24/solid';

import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

export interface QuickFilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconActive: React.ElementType;
  color: string;
  badgeColor: string;
  filters: AdvancedMedicalFilters;
  category: 'specialty' | 'content' | 'quality' | 'audience' | 'recent' | 'access';
  isPopular?: boolean;
  isPremium?: boolean;
}

interface QuickFiltersProps {
  onFilterSelect: (filters: AdvancedMedicalFilters, presetName: string) => void;
  activeFilters?: AdvancedMedicalFilters;
  onSaveCurrentFilters?: (name: string) => void;
  savedFilters?: QuickFilterPreset[];
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onFilterSelect,
  activeFilters,
  onSaveCurrentFilters,
  savedFilters = [],
  className = ''
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | QuickFilterPreset['category']>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Pre-configured popular filter combinations
  const presetFilters: QuickFilterPreset[] = [
    // Medical Specialty Filters
    {
      id: 'cardiology-guidelines',
      name: t('filters.quickFilters.presets.cardiologyGuidelines.name', 'Cardiology Guidelines'),
      description: t('filters.quickFilters.presets.cardiologyGuidelines.description', 'Latest cardiology treatment guidelines and protocols'),
      icon: HeartIcon,
      iconActive: HeartSolid,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'specialty',
      isPopular: true,
      filters: {
        contentTypes: {
          clinicalGuidelines: ['treatment-guidelines', 'diagnostic-protocols']
        },
        medicalSpecialties: {
          clinical: ['cardiology']
        },
        sourceAuthority: {
          professionalSocieties: ['aha', 'acc', 'esc']
        },
        recencyPeriod: '2-years',
        evidenceGrade: ['grade-a-strong', 'grade-b-moderate']
      }
    },
    {
      id: 'oncology-research',
      name: t('filters.quickFilters.presets.cancerResearch.name', 'Cancer Research'),
      description: t('filters.quickFilters.presets.cancerResearch.description', 'Latest oncology research papers and clinical trials'),
      icon: BeakerIcon,
      iconActive: BeakerIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'specialty',
      isPopular: true,
      filters: {
        contentTypes: {
          researchLiterature: ['studies', 'trials', 'meta-analyses']
        },
        medicalSpecialties: {
          clinical: ['oncology']
        },
        sourceAuthority: {
          academicInstitutions: ['mskcc', 'dana-farber', 'md-anderson']
        },
        recencyPeriod: '1-year',
        citationTier: ['highly-cited']
      }
    },
    {
      id: 'neurology-textbooks',
      name: t('filters.quickFilters.presets.neurologyReferences.name', 'Neurology References'),
      description: t('filters.quickFilters.presets.neurologyReferences.description', 'Comprehensive neurology textbooks and handbooks'),
      icon: CpuChipIcon,
      iconActive: CpuChipIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'specialty',
      filters: {
        contentTypes: {
          medicalReferences: ['textbooks', 'handbooks']
        },
        medicalSpecialties: {
          clinical: ['neurology']
        },
        targetAudience: ['expert', 'general-practitioner'],
        accessType: ['open-access', 'subscription-required']
      }
    },

    // Content Type Filters
    {
      id: 'systematic-reviews',
      name: t('filters.quickFilters.presets.systematicReviews.name', 'Systematic Reviews'),
      description: t('filters.quickFilters.presets.systematicReviews.description', 'High-quality systematic reviews and meta-analyses'),
      icon: DocumentTextIcon,
      iconActive: DocumentTextIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'content',
      isPopular: true,
      filters: {
        contentTypes: {
          researchLiterature: ['systematic-reviews', 'meta-analyses']
        },
        sourceAuthority: {
          medicalOrganizations: ['cochrane']
        },
        evidenceGrade: ['grade-a-strong'],
        peerReviewStatus: ['peer-reviewed']
      }
    },
    {
      id: 'clinical-guidelines',
      name: t('filters.quickFilters.presets.clinicalGuidelines.name', 'Clinical Guidelines'),
      description: t('filters.quickFilters.presets.clinicalGuidelines.description', 'Evidence-based clinical practice guidelines'),
      icon: ClipboardDocumentCheckIcon,
      iconActive: ClipboardDocumentCheckIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'content',
      isPopular: true,
      filters: {
        contentTypes: {
          clinicalGuidelines: ['treatment-guidelines', 'diagnostic-protocols', 'best-practices']
        },
        sourceAuthority: {
          professionalSocieties: ['aha', 'acs', 'acp', 'idsa'],
          government: ['cdc', 'nih']
        },
        validationStatus: ['clinically-validated']
      }
    },
    {
      id: 'medical-education',
      name: t('filters.quickFilters.presets.medicalEducation.name', 'Medical Education'),
      description: t('filters.quickFilters.presets.medicalEducation.description', 'CME materials, case studies, and learning resources'),
      icon: AcademicCapIcon,
      iconActive: AcademicCapIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'content',
      filters: {
        contentTypes: {
          educationalContent: ['cme-materials', 'case-studies', 'learning-modules']
        },
        targetAudience: ['medical-student', 'general-practitioner'],
        contentComplexity: ['intermediate', 'advanced']
      }
    },

    // Quality & Authority Filters
    {
      id: 'high-impact',
      name: t('filters.quickFilters.presets.highImpactStudies.name', 'High Impact Studies'),
      description: t('filters.quickFilters.presets.highImpactStudies.description', 'Highly cited research from top journals'),
      icon: StarIcon,
      iconActive: StarSolid,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'quality',
      isPopular: true,
      filters: {
        citationTier: ['highly-cited'],
        sourceAuthority: {
          publishers: ['nejm', 'lancet', 'bmj', 'jama']
        },
        peerReviewStatus: ['peer-reviewed'],
        evidenceGrade: ['grade-a-strong']
      }
    },
    {
      id: 'government-sources',
      name: t('filters.quickFilters.presets.governmentSources.name', 'Government Sources'),
      description: t('filters.quickFilters.presets.governmentSources.description', 'Official government health information'),
      icon: ShieldCheckIcon,
      iconActive: ShieldCheckSolid,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'quality',
      filters: {
        sourceAuthority: {
          government: ['cdc', 'fda', 'nih', 'who']
        },
        validationStatus: ['clinically-validated'],
        geographicRelevance: ['us-guidelines', 'global']
      }
    },

    // Audience-Specific Filters
    {
      id: 'patient-education',
      name: t('filters.quickFilters.presets.patientEducation.name', 'Patient Education'),
      description: t('filters.quickFilters.presets.patientEducation.description', 'Patient-friendly health information and resources'),
      icon: UserIcon,
      iconActive: UserIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'audience',
      filters: {
        contentTypes: {
          patientResources: ['patient-education', 'fact-sheets']
        },
        targetAudience: ['patient'],
        readingLevel: ['patient-friendly'],
        accessType: ['open-access', 'free-registration']
      }
    },
    {
      id: 'medical-students',
      name: t('filters.quickFilters.presets.medicalStudents.name', 'Medical Students'),
      description: t('filters.quickFilters.presets.medicalStudents.description', 'Educational content for medical students'),
      icon: UsersIcon,
      iconActive: UsersIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'audience',
      filters: {
        targetAudience: ['medical-student'],
        contentComplexity: ['basic', 'intermediate'],
        contentTypes: {
          educationalContent: ['case-studies', 'learning-modules'],
          medicalReferences: ['handbooks']
        }
      }
    },

    // Recent & Access Filters
    {
      id: 'latest-research',
      name: t('filters.quickFilters.presets.latestResearch.name', 'Latest Research'),
      description: t('filters.quickFilters.presets.latestResearch.description', 'Most recent medical research and discoveries'),
      icon: ClockIcon,
      iconActive: ClockIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'recent',
      isPopular: true,
      filters: {
        recencyPeriod: 'last-30-days',
        contentTypes: {
          researchLiterature: ['studies', 'trials']
        },
        updateStatus: ['recently-updated']
      }
    },
    {
      id: 'open-access',
      name: t('filters.quickFilters.presets.openAccess.name', 'Open Access'),
      description: t('filters.quickFilters.presets.openAccess.description', 'Freely available medical literature'),
      icon: LockClosedIcon,
      iconActive: LockClosedIcon,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'access',
      filters: {
        accessType: ['open-access'],
        fullTextAvailable: true,
        downloadFormat: ['pdf-available']
      }
    },

    // Advanced Combinations
    {
      id: 'breakthrough-research',
      name: t('filters.quickFilters.presets.breakthroughResearch.name', 'Breakthrough Research'),
      description: t('filters.quickFilters.presets.breakthroughResearch.description', 'Revolutionary medical discoveries and innovations'),
      icon: SparklesIcon,
      iconActive: SparklesSolid,
      color: 'text-[#2b6cb0]',
      badgeColor: 'bg-[#90cdf4]/20 text-[#1a365d]',
      category: 'quality',
      isPremium: true,
      filters: {
        citationTier: ['highly-cited'],
        evidenceGrade: ['grade-a-strong'],
        recencyPeriod: '1-year',
        contentTypes: {
          researchLiterature: ['meta-analyses', 'systematic-reviews']
        },
        sourceAuthority: {
          publishers: ['nejm', 'lancet', 'nature', 'science']
        }
      }
    }
  ];

  // Combine preset and saved filters
  const allFilters = [...presetFilters, ...savedFilters];

  // Filter by category
  const filteredFilters = selectedCategory === 'all' 
    ? allFilters 
    : allFilters.filter(filter => filter.category === selectedCategory);

  const categories = [
    { id: 'all', name: t('filters.filterCategories.all', 'All Filters'), count: allFilters.length },
    { id: 'specialty', name: t('filters.filterCategories.specialty', 'Medical Specialties'), count: allFilters.filter(f => f.category === 'specialty').length },
    { id: 'content', name: t('filters.filterCategories.content', 'Content Types'), count: allFilters.filter(f => f.category === 'content').length },
    { id: 'quality', name: t('filters.filterCategories.quality', 'Quality & Authority'), count: allFilters.filter(f => f.category === 'quality').length },
    { id: 'audience', name: t('filters.filterCategories.audience', 'Audience'), count: allFilters.filter(f => f.category === 'audience').length },
    { id: 'recent', name: t('filters.filterCategories.recent', 'Recent'), count: allFilters.filter(f => f.category === 'recent').length },
    { id: 'access', name: t('filters.filterCategories.access', 'Access'), count: allFilters.filter(f => f.category === 'access').length }
  ];

  const handleSaveCurrentFilters = () => {
    if (filterName.trim() && onSaveCurrentFilters) {
      onSaveCurrentFilters(filterName.trim());
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const hasActiveFilters = activeFilters && Object.keys(activeFilters).some(key => {
    const value = activeFilters[key as keyof AdvancedMedicalFilters];
    return value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : 
       typeof value === 'object' ? Object.keys(value).length > 0 : 
       value);
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with save option */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BoltSolid className="w-5 h-5 text-[#2b6cb0]" />
            {t('filters.quickFilters.title', 'Quick Filters')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('filters.quickFilters.subtitle', 'Popular filter combinations for common medical searches')}
          </p>
        </div>

        {/* Save current filters - Mobile touch optimized */}
        {hasActiveFilters && onSaveCurrentFilters && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#2b6cb0] hover:text-[#1a365d] hover:bg-[#90cdf4]/20 rounded-lg transition-colors duration-200 min-h-[44px] touch-manipulation"
          >
            <BookmarkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filters.quickFilters.saveCurrent', 'Save Current')}</span>
            <span className="sm:hidden">{t('common.save', 'Save')}</span>
          </button>
        )}
      </div>

      {/* Category tabs - Mobile-first responsive */}
      <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 min-h-[44px] flex items-center justify-center whitespace-nowrap touch-manipulation ${
              selectedCategory === category.id
                ? 'bg-[#2b6cb0] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {category.name}
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              selectedCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Quick filter grid - Mobile-optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFilters.map((filter, index) => {
          const IconComponent = filter.iconActive;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterSelect(filter.filters, filter.name)}
              className="group relative p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left min-h-[80px] touch-manipulation active:scale-95"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Premium badge */}
              {filter.isPremium && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                  {t('filters.quickFilters.badges.premium', 'Premium')}
                </div>
              )}

              {/* Popular badge */}
              {filter.isPopular && !filter.isPremium && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full">
                  {t('filters.quickFilters.badges.popular', 'Popular')}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${filter.badgeColor} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`w-5 h-5 ${filter.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#1a365d] transition-colors duration-200">
                    {filter.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {filter.description}
                  </p>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#2b6cb0]/5 to-[#1a365d]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredFilters.length === 0 && (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('filters.quickFilters.empty', 'No quick filters found for this category')}</p>
        </div>
      )}

      {/* Save dialog - Mobile responsive */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('filters.quickFilters.saveDialog.title', 'Save Filter Combination')}</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder={t('filters.quickFilters.saveDialog.placeholder', 'Enter filter name...')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-[#2b6cb0] mb-4 min-h-[44px] text-base touch-manipulation"
              inputMode="text"
              autoComplete="off"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 min-h-[44px] touch-manipulation"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSaveCurrentFilters}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] touch-manipulation"
              >
                {t('common.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFilters;