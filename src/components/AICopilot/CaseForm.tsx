import React, { useState, useCallback } from 'react';
import { AlertTriangle, FileText, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { MobileInput, MobileTextarea, MobileSelect, MobileButton } from '../ui/mobile-form';
import { PatientCase } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';

interface CaseFormProps {
  onSubmit: (caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  specialty?: 'cardiology' | 'obgyn';
  initialData?: Partial<PatientCase>;
}

interface FormData {
  title: string;
  description: string;
  anonymizedInfo: string;
  category: string;
  tags: string;
  complexity: 'low' | 'medium' | 'high';
}

export const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  specialty,
  initialData
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    anonymizedInfo: initialData?.anonymizedInfo || '',
    category: initialData?.metadata?.category || '',
    tags: initialData?.metadata?.tags?.join(', ') || '',
    complexity: initialData?.metadata?.complexity || 'medium'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = useCallback(() => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('case.titleRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('case.descriptionRequired');
    }

    if (!formData.anonymizedInfo.trim()) {
      newErrors.anonymizedInfo = t('case.patientInfoRequired');
    } else if (formData.anonymizedInfo.length < 50) {
      newErrors.anonymizedInfo = t('case.patientInfoTooShort');
    }

    // Basic anonymization check
    const sensitivePatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Full names (John Doe)
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Dates (MM/DD/YYYY)
      /\b\d{4}-\d{2}-\d{2}\b/, // ISO dates (YYYY-MM-DD)
      /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN patterns
      /\b\d{10,}\b/, // Long numbers that might be IDs
    ];

    const hasSensitiveInfo = sensitivePatterns.some(pattern => 
      pattern.test(formData.anonymizedInfo)
    );

    if (hasSensitiveInfo) {
      newErrors.anonymizedInfo = t('case.sensitiveInfoDetected');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    const caseData: Omit<PatientCase, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      anonymizedInfo: formData.anonymizedInfo.trim(),
      specialty: specialty,
      status: 'active',
      metadata: {
        category: formData.category.trim() || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        complexity: formData.complexity
      }
    };

    onSubmit(caseData);
  }, [formData, specialty, isSubmitting, onSubmit, validateForm]);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  // Category options based on specialty
  const getCategoryOptions = useCallback(() => {
    const baseOptions = [
      { value: '', label: t('case.selectCategory') },
      { value: 'diagnosis', label: t('case.diagnosisCategory') },
      { value: 'treatment', label: t('case.treatment') },
      { value: 'consultation', label: t('case.consultation') },
    ];

    if (specialty === 'cardiology') {
      return [
        ...baseOptions,
        { value: 'interventional', label: t('case.interventionalCardiology') },
        { value: 'electrophysiology', label: t('case.electrophysiology') },
        { value: 'heart-failure', label: t('case.heartFailure') },
        { value: 'preventive', label: t('case.preventiveCardiology') },
      ];
    } else if (specialty === 'obgyn') {
      return [
        ...baseOptions,
        { value: 'obstetrics', label: t('case.obstetrics') },
        { value: 'gynecology', label: t('case.gynecology') },
        { value: 'reproductive', label: t('case.reproductiveHealth') },
        { value: 'maternal-fetal', label: t('case.maternalFetalMedicine') },
      ];
    }

    return baseOptions;
  }, [specialty, t]);

  const complexityOptions = [
    { value: 'low', label: t('case.lowComplexity') },
    { value: 'medium', label: t('case.mediumComplexity') },
    { value: 'high', label: t('case.highComplexity') },
  ];

  return (
    <div className="mobile:p-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Case Title */}
        <MobileInput
          id="title"
          type="text"
          label={t('case.caseTitle')}
          value={formData.title}
          onChange={handleInputChange('title')}
          placeholder={t('case.titlePlaceholder')}
          error={errors.title}
          required
          disabled={isSubmitting}
          icon={FileText}
        />

        {/* Case Description */}
        <MobileTextarea
          id="description"
          label={t('case.caseDescription')}
          value={formData.description}
          onChange={handleInputChange('description')}
          placeholder={t('case.descriptionPlaceholder')}
          rows={3}
          error={errors.description}
          required
          disabled={isSubmitting}
        />

        {/* Anonymized Patient Information */}
        <div className="space-y-4">
          <MobileTextarea
            id="anonymizedInfo"
            label={t('case.anonymizedPatientInfo')}
            value={formData.anonymizedInfo}
            onChange={handleInputChange('anonymizedInfo')}
            placeholder={t('case.patientInfoPlaceholder')}
            rows={8}
            error={errors.anonymizedInfo}
            required
            disabled={isSubmitting}
            maxLength={2000}
            showCharCount
            hint={t('case.charactersMinimum', { count: formData.anonymizedInfo.length.toString() })}
          />
          
          {/* Privacy Warning */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">{t('case.privacyNotice')}</p>
                <p>{t('case.privacyNoticeDetailed')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 mobile:gap-4 md:grid-cols-2 gap-6">
          {/* Category */}
          <MobileSelect
            id="category"
            label={t('case.category')}
            value={formData.category}
            onChange={handleInputChange('category')}
            options={getCategoryOptions()}
            disabled={isSubmitting}
            hint={t('case.categoryHint')}
          />

          {/* Complexity */}
          <MobileSelect
            id="complexity"
            label={t('case.complexityLevel')}
            value={formData.complexity}
            onChange={handleInputChange('complexity')}
            options={complexityOptions}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Tags */}
        <MobileInput
          id="tags"
          type="text"
          label={t('case.tags')}
          value={formData.tags}
          onChange={handleInputChange('tags')}
          placeholder={t('case.tagsPlaceholder')}
          disabled={isSubmitting}
          hint={t('case.tagsHint')}
        />

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <MobileButton
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            loading={isSubmitting}
          >
            {isSubmitting ? t('case.creatingCase') : t('case.createCase')}
          </MobileButton>
        </div>
      </form>
    </div>
  );
}; 