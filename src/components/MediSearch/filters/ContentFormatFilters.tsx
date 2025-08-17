/**
 * ContentFormatFilters - Content type and file format filtering options
 * Allows users to filter by research literature, guidelines, references, etc.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentIcon,
  UserIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  SpeakerWaveIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

import type { AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';

interface ContentFormatFiltersProps {
  filters: AdvancedMedicalFilters;
  onFiltersChange: (filters: AdvancedMedicalFilters) => void;
}

interface FilterOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export const ContentFormatFilters: React.FC<ContentFormatFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  // Content type options (labels/descriptions resolved via i18n)
  const contentTypeOptions: Record<string, (FilterOption & { tKey: string })[]> = {
    researchLiterature: [
      {
        id: 'studies',
        label: t('filters.contentFormat.sections.researchLiterature.options.studies.label', 'Clinical Studies'),
        description: t('filters.contentFormat.sections.researchLiterature.options.studies.description', 'Observational and interventional studies'),
        icon: DocumentTextIcon,
        color: 'text-blue-600',
        tKey: 'studies'
      },
      {
        id: 'trials',
        label: t('filters.contentFormat.sections.researchLiterature.options.trials.label', 'Clinical Trials'),
        description: t('filters.contentFormat.sections.researchLiterature.options.trials.description', 'Randomized controlled trials and interventional studies'),
        icon: DocumentTextIcon,
        color: 'text-green-600',
        tKey: 'trials'
      },
      {
        id: 'meta-analyses',
        label: t('filters.contentFormat.sections.researchLiterature.options.metaAnalyses.label', 'Meta-Analyses'),
        description: t('filters.contentFormat.sections.researchLiterature.options.metaAnalyses.description', 'Statistical analysis of multiple studies'),
        icon: DocumentTextIcon,
        color: 'text-purple-600',
        tKey: 'metaAnalyses'
      },
      {
        id: 'systematic-reviews',
        label: t('filters.contentFormat.sections.researchLiterature.options.systematicReviews.label', 'Systematic Reviews'),
        description: t('filters.contentFormat.sections.researchLiterature.options.systematicReviews.description', 'Comprehensive evidence synthesis'),
        icon: DocumentTextIcon,
        color: 'text-indigo-600',
        tKey: 'systematicReviews'
      }
    ],
    clinicalGuidelines: [
      {
        id: 'treatment-guidelines',
        label: t('filters.contentFormat.sections.clinicalGuidelines.options.treatmentGuidelines.label', 'Treatment Guidelines'),
        description: t('filters.contentFormat.sections.clinicalGuidelines.options.treatmentGuidelines.description', 'Evidence-based treatment recommendations'),
        icon: ClipboardDocumentCheckIcon,
        color: 'text-green-600',
        tKey: 'treatmentGuidelines'
      },
      {
        id: 'diagnostic-protocols',
        label: t('filters.contentFormat.sections.clinicalGuidelines.options.diagnosticProtocols.label', 'Diagnostic Protocols'),
        description: t('filters.contentFormat.sections.clinicalGuidelines.options.diagnosticProtocols.description', 'Standardized diagnostic procedures'),
        icon: ClipboardDocumentCheckIcon,
        color: 'text-blue-600',
        tKey: 'diagnosticProtocols'
      },
      {
        id: 'best-practices',
        label: t('filters.contentFormat.sections.clinicalGuidelines.options.bestPractices.label', 'Best Practices'),
        description: t('filters.contentFormat.sections.clinicalGuidelines.options.bestPractices.description', 'Professional practice standards'),
        icon: ClipboardDocumentCheckIcon,
        color: 'text-purple-600',
        tKey: 'bestPractices'
      }
    ],
    medicalReferences: [
      {
        id: 'textbooks',
        label: t('filters.contentFormat.sections.medicalReferences.options.textbooks.label', 'Medical Textbooks'),
        description: t('filters.contentFormat.sections.medicalReferences.options.textbooks.description', 'Comprehensive medical reference books'),
        icon: BookOpenIcon,
        color: 'text-amber-600',
        tKey: 'textbooks'
      },
      {
        id: 'handbooks',
        label: t('filters.contentFormat.sections.medicalReferences.options.handbooks.label', 'Clinical Handbooks'),
        description: t('filters.contentFormat.sections.medicalReferences.options.handbooks.description', 'Practical clinical reference guides'),
        icon: BookOpenIcon,
        color: 'text-orange-600',
        tKey: 'handbooks'
      },
      {
        id: 'medical-dictionaries',
        label: t('filters.contentFormat.sections.medicalReferences.options.medicalDictionaries.label', 'Medical Dictionaries'),
        description: t('filters.contentFormat.sections.medicalReferences.options.medicalDictionaries.description', 'Medical terminology and definitions'),
        icon: BookOpenIcon,
        color: 'text-teal-600',
        tKey: 'medicalDictionaries'
      }
    ],
    educationalContent: [
      {
        id: 'cme-materials',
        label: t('filters.contentFormat.sections.educationalContent.options.cmeMaterials.label', 'CME Materials'),
        description: t('filters.contentFormat.sections.educationalContent.options.cmeMaterials.description', 'Continuing medical education resources'),
        icon: AcademicCapIcon,
        color: 'text-indigo-600',
        tKey: 'cmeMaterials'
      },
      {
        id: 'case-studies',
        label: t('filters.contentFormat.sections.educationalContent.options.caseStudies.label', 'Case Studies'),
        description: t('filters.contentFormat.sections.educationalContent.options.caseStudies.description', 'Clinical case presentations and analysis'),
        icon: AcademicCapIcon,
        color: 'text-green-600',
        tKey: 'caseStudies'
      },
      {
        id: 'learning-modules',
        label: t('filters.contentFormat.sections.educationalContent.options.learningModules.label', 'Learning Modules'),
        description: t('filters.contentFormat.sections.educationalContent.options.learningModules.description', 'Structured educational content'),
        icon: AcademicCapIcon,
        color: 'text-purple-600',
        tKey: 'learningModules'
      }
    ],
    regulatoryDocs: [
      {
        id: 'fda-approvals',
        label: t('filters.contentFormat.sections.regulatoryDocs.options.fdaApprovals.label', 'FDA Approvals'),
        description: t('filters.contentFormat.sections.regulatoryDocs.options.fdaApprovals.description', 'Drug and device approval documents'),
        icon: DocumentIcon,
        color: 'text-blue-700',
        tKey: 'fdaApprovals'
      },
      {
        id: 'drug-labels',
        label: t('filters.contentFormat.sections.regulatoryDocs.options.drugLabels.label', 'Drug Labels'),
        description: t('filters.contentFormat.sections.regulatoryDocs.options.drugLabels.description', 'Official prescribing information'),
        icon: DocumentIcon,
        color: 'text-green-700',
        tKey: 'drugLabels'
      },
      {
        id: 'safety-communications',
        label: t('filters.contentFormat.sections.regulatoryDocs.options.safetyCommunications.label', 'Safety Communications'),
        description: t('filters.contentFormat.sections.regulatoryDocs.options.safetyCommunications.description', 'FDA safety alerts and communications'),
        icon: DocumentIcon,
        color: 'text-red-600',
        tKey: 'safetyCommunications'
      }
    ],
    patientResources: [
      {
        id: 'patient-education',
        label: t('filters.contentFormat.sections.patientResources.options.patientEducation.label', 'Patient Education'),
        description: t('filters.contentFormat.sections.patientResources.options.patientEducation.description', 'Educational materials for patients'),
        icon: UserIcon,
        color: 'text-teal-600',
        tKey: 'patientEducation'
      },
      {
        id: 'fact-sheets',
        label: t('filters.contentFormat.sections.patientResources.options.factSheets.label', 'Fact Sheets'),
        description: t('filters.contentFormat.sections.patientResources.options.factSheets.description', 'Quick reference information sheets'),
        icon: UserIcon,
        color: 'text-blue-600',
        tKey: 'factSheets'
      },
      {
        id: 'brochures',
        label: t('filters.contentFormat.sections.patientResources.options.brochures.label', 'Brochures'),
        description: t('filters.contentFormat.sections.patientResources.options.brochures.description', 'Patient information brochures'),
        icon: UserIcon,
        color: 'text-green-600',
        tKey: 'brochures'
      }
    ]
  };

  // File format options
  const fileFormatOptions: FilterOption[] = [
    {
      id: 'pdf',
      label: t('filters.fileFormats.options.pdf.label', 'PDF Documents'),
      description: t('filters.fileFormats.options.pdf.description', 'Portable document format files'),
      icon: DocumentArrowDownIcon,
      color: 'text-red-600'
    },
    {
      id: 'html',
      label: t('filters.fileFormats.options.html.label', 'Web Pages'),
      description: t('filters.fileFormats.options.html.description', 'HTML web content'),
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      id: 'doc',
      label: t('filters.fileFormats.options.doc.label', 'Word Documents'),
      description: t('filters.fileFormats.options.doc.description', 'Microsoft Word documents'),
      icon: DocumentIcon,
      color: 'text-blue-700'
    },
    {
      id: 'ppt',
      label: t('filters.fileFormats.options.ppt.label', 'Presentations'),
      description: t('filters.fileFormats.options.ppt.description', 'PowerPoint presentations'),
      icon: DocumentIcon,
      color: 'text-orange-600'
    },
    {
      id: 'video',
      label: t('filters.fileFormats.options.video.label', 'Videos'),
      description: t('filters.fileFormats.options.video.description', 'Educational and clinical videos'),
      icon: PlayIcon,
      color: 'text-purple-600'
    },
    {
      id: 'audio',
      label: t('filters.fileFormats.options.audio.label', 'Audio'),
      description: t('filters.fileFormats.options.audio.description', 'Podcasts and audio content'),
      icon: SpeakerWaveIcon,
      color: 'text-green-600'
    }
  ];

  const handleContentTypeChange = (category: string, typeId: string, checked: boolean) => {
    const currentTypes = filters.contentTypes?.[category as keyof typeof filters.contentTypes] || [];
    const updatedTypes = checked
      ? [...currentTypes, typeId]
      : currentTypes.filter(id => id !== typeId);

    onFiltersChange({
      ...filters,
      contentTypes: {
        ...filters.contentTypes,
        [category]: updatedTypes
      }
    });
  };

  const handleFileFormatChange = (formatId: string, checked: boolean) => {
    const currentFormats = filters.fileFormats || [];
    const updatedFormats = checked
      ? [...currentFormats, formatId]
      : currentFormats.filter(id => id !== formatId);

    onFiltersChange({
      ...filters,
      fileFormats: updatedFormats
    });
  };

  const renderContentTypeSection = (categoryKey: string, categoryTitle: string, options: (FilterOption & { tKey: string })[]) => {
    const selectedTypes = filters.contentTypes?.[categoryKey as keyof typeof filters.contentTypes] || [];

    return (
      <div key={categoryKey} className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          {options[0] && React.createElement(options[0].icon, { className: "w-5 h-5 text-gray-600" })}
          {categoryTitle}
          {selectedTypes.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {selectedTypes.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {options.map(option => {
            const isSelected = selectedTypes.includes(option.id);
            const IconComponent = option.icon;

            return (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[60px] touch-manipulation active:scale-98 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleContentTypeChange(categoryKey, option.id, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5 min-h-[20px] min-w-[20px] touch-manipulation"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
          {t('filters.contentFormat.title', 'Content Type & Format')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('filters.contentFormat.description', 'Filter by specific types of medical content and file formats')}
        </p>
      </div>

      {/* Content Types */}
      <div className="space-y-8">
         {renderContentTypeSection('researchLiterature', t('filters.contentFormat.sections.researchLiterature.title', 'Research Literature'), contentTypeOptions.researchLiterature)}
         {renderContentTypeSection('clinicalGuidelines', t('filters.contentFormat.sections.clinicalGuidelines.title', 'Clinical Guidelines'), contentTypeOptions.clinicalGuidelines)}
         {renderContentTypeSection('medicalReferences', t('filters.contentFormat.sections.medicalReferences.title', 'Medical References'), contentTypeOptions.medicalReferences)}
         {renderContentTypeSection('educationalContent', t('filters.contentFormat.sections.educationalContent.title', 'Educational Content'), contentTypeOptions.educationalContent)}
         {renderContentTypeSection('regulatoryDocs', t('filters.contentFormat.sections.regulatoryDocs.title', 'Regulatory Documents'), contentTypeOptions.regulatoryDocs)}
         {renderContentTypeSection('patientResources', t('filters.contentFormat.sections.patientResources.title', 'Patient Resources'), contentTypeOptions.patientResources)}
      </div>

      {/* File Formats */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
          {t('filters.fileFormats.title', 'File Formats')}
          {filters.fileFormats && filters.fileFormats.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {filters.fileFormats.length}
            </span>
          )}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fileFormatOptions.map(option => {
            const isSelected = filters.fileFormats?.includes(option.id) || false;
            const IconComponent = option.icon;

            return (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[56px] touch-manipulation active:scale-98 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleFileFormatChange(option.id, e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 min-h-[16px] min-w-[16px] touch-manipulation"
                />
                <IconComponent className={`w-5 h-5 ${option.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm leading-tight">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(filters.contentTypes || filters.fileFormats) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">{t('filters.summary.title', 'Filter Summary')}</h5>
          <div className="text-sm text-gray-600 space-y-1">
            {filters.contentTypes && Object.entries(filters.contentTypes).map(([category, types]) => 
              types && types.length > 0 && (
                <div key={category}>
                  <strong className="capitalize">{t(`filters.contentFormat.sections.${category}.title`, category.replace(/([A-Z])/g, ' $1').toLowerCase())}:</strong> {types.map((id) => {
                    const option = (contentTypeOptions as any)[category]?.find((o: any) => o.id === id);
                    return option ? option.label : id;
                  }).join(', ')}
                </div>
              )
            )}
            {filters.fileFormats && filters.fileFormats.length > 0 && (
              <div>
                <strong>{t('filters.summary.fileFormatsLabel', 'File formats:')}</strong> {filters.fileFormats.map((id) => {
                  const option = fileFormatOptions.find(o => o.id === id);
                  return option ? option.label : id;
                }).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentFormatFilters;