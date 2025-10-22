/**
 * World-Class Template Creation Modal Component
 * 
 * Premium modal interface for creating custom medical report templates.
 * Features glassmorphic design, multi-step wizard, rich editor, and delightful micro-interactions.
 * Designed to impress the most sophisticated designers while maintaining medical professionalism.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Save,
  AlertCircle,
  FileText,
  Stethoscope,
  Info,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  Edit3,
  Zap,
  Heart,
  Brain,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Wand2,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Settings,
  Lightbulb,
  Target,
  BookOpen,
  Shield,
  Palette,
} from 'lucide-react';
import { templateService } from '../../../services/templateService';
import { templateFormSchema, type TemplateFormData } from '../../../lib/validations/template-schemas';
import type { TemplateCreationModalProps } from '../../../types/templates';
import { useTranslation } from '../../../hooks/useTranslation';
import '../../../styles/template-modal.css';

// Enhanced form data with wizard steps
interface ExtendedFormData extends TemplateFormData {
  category?: 'emergency' | 'routine' | 'diagnostic' | 'follow-up' | 'discharge';
  aiTone?: 'professional' | 'detailed' | 'concise' | 'comprehensive';
  includeTimestamps?: boolean;
  includeDiagnosticCodes?: boolean;
}

// Wizard step interface
interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  isCompleted?: boolean;
  isActive?: boolean;
}

// Medical template suggestions
const TEMPLATE_SUGGESTIONS = {
  emergency: {
    name: 'Emergency Cardiac Assessment',
    structure: `# Emergency Cardiac Assessment

## Chief Complaint
Patient presents with: [Primary concern]

## Vital Signs & Initial Assessment
- Blood Pressure: ___/__ mmHg
- Heart Rate: ___ bpm (rhythm: ___)
- Respiratory Rate: ___ breaths/min
- O2 Saturation: ___%
- Temperature: ___°C
- Pain Scale: __/10

## ABCDE Assessment
### Airway
- Patent/Compromised: ___
- Intervention: ___

### Breathing
- Rate/Quality: ___
- Breath Sounds: ___
- SpO2: ___%

### Circulation
- Pulse: Strong/Weak/Absent
- Capillary Refill: ___
- Skin: ___

### Disability
- GCS: ___/15
- Pupils: ___
- Blood Glucose: ___

### Exposure
- Temperature: ___
- External injuries: ___

## Cardiac Specific Assessment
### ECG Findings
- Rhythm: ___
- Rate: ___
- Intervals: PR___ QRS___ QT___
- ST Changes: ___
- Abnormalities: ___

### Cardiac Enzymes/Biomarkers
- Troponin: ___
- CK-MB: ___
- BNP/NT-proBNP: ___

## Clinical Impression
1. Primary Diagnosis: ___
2. Differential Diagnoses:
   - ___
   - ___
   - ___

## Immediate Management
### Medications Administered
- ___mg ___ IV/PO at ___hrs
- ___mg ___ IV/PO at ___hrs

### Procedures
- ___
- ___

## Disposition
- Admit to: ___
- Discharge home: ___
- Transfer to: ___
- Follow-up: ___

## Next Steps
- Serial ECGs q___
- Cardiac monitoring
- Lab recheck in ___hrs
- Cardiology consult: ___

---
*Generated with MediMind Expert AI | Template: Emergency Cardiac Assessment*`,
    notes: 'Optimized for emergency cardiac presentations with systematic ABCDE approach and cardiac-specific assessments.'
  },
  routine: {
    name: 'Routine Cardiology Consultation',
    structure: `# Cardiology Consultation Report

## Patient Information
- Date: ___
- Referring Physician: ___
- Reason for Consultation: ___

## History of Present Illness
[Detailed narrative of current symptoms and timeline]

## Cardiovascular Review of Systems
### Chest Pain/Discomfort
- Character: ___
- Location: ___
- Radiation: ___
- Triggers: ___
- Relief factors: ___

### Dyspnea
- Exertional: Class I/II/III/IV
- Orthopnea: ___
- PND: ___

### Palpitations
- Frequency: ___
- Duration: ___
- Associated symptoms: ___

### Syncope/Presyncope
- Frequency: ___
- Triggers: ___
- Prodromal symptoms: ___

## Past Medical History
### Cardiovascular
- CAD: ___
- MI: ___
- PCI/CABG: ___
- Arrhythmias: ___
- Heart Failure: ___
- Valvular Disease: ___

### Other Medical Conditions
- Diabetes: ___
- Hypertension: ___
- Hyperlipidemia: ___
- CKD: ___

## Medications
### Cardiac Medications
- ___mg ___ daily
- ___mg ___ BID

### Other Medications
- ___

## Physical Examination
### Vital Signs
- BP: ___/__ mmHg
- HR: ___ bpm
- RR: ___ breaths/min
- O2 Sat: ___%
- Weight: ___kg BMI: ___

### Cardiovascular Examination
#### Inspection
- JVP: ___cm H2O
- Peripheral edema: ___
- Cyanosis: ___

#### Palpation
- PMI: ___
- Thrills: ___
- Peripheral pulses: ___

#### Auscultation
- S1: ___
- S2: ___
- S3/S4: ___
- Murmurs: ___
- Rubs: ___

## Diagnostic Results
### ECG
- Rhythm: ___
- Rate: ___
- Axis: ___
- Intervals: ___
- ST-T Changes: ___

### Echocardiogram
- LVEF: ___%
- Wall Motion: ___
- Valve Function: ___
- Chamber Sizes: ___

### Laboratory
- Lipids: TC___ LDL___ HDL___ TG___
- HbA1c: ___%
- Creatinine: ___
- BNP: ___

## Assessment & Clinical Impression
1. ___
2. ___
3. ___

## Plan
### Medications
- Start/Continue/Adjust: ___
- Target doses: ___

### Lifestyle Modifications
- Diet: ___
- Exercise: ___
- Weight management: ___

### Follow-up
- Return visit: ___
- Laboratory monitoring: ___
- Imaging follow-up: ___

### Specialist Referrals
- ___

---
*Generated with MediMind Expert AI | Template: Routine Cardiology Consultation*`,
    notes: 'Comprehensive template for routine cardiology consultations with systematic review and evidence-based planning.'
  }
};

export const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  editTemplate,
  onTemplateUpdated,
}) => {
  const { t } = useTranslation();
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showStructurePlaceholder, setShowStructurePlaceholder] = useState(true);
  
  // Mobile gesture support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  
  // Refs for animations
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in edit mode
  const isEditMode = !!editTemplate;

  // Enhanced form setup with extended validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<ExtendedFormData>({
    resolver: zodResolver(templateFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      example_structure: '',
      notes: '',
      category: 'routine',
      aiTone: 'professional',
      includeTimestamps: true,
      includeDiagnosticCodes: false,
    },
  });

  // Wizard steps configuration
  const wizardSteps: WizardStep[] = useMemo(() => [
    {
      id: 1,
      title: t('mediscribe.templates.templateCreation.templateSetup'),
      subtitle: t('mediscribe.templates.templateCreation.nameAndDesign'),
      icon: FileText,
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      id: 2,
      title: t('mediscribe.templates.templateCreation.aiInstructions'),
      subtitle: t('mediscribe.templates.templateCreation.customizeAI'),
      icon: Brain,
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      id: 3,
      title: t('mediscribe.templates.templateCreation.reviewAndSave'),
      subtitle: t('mediscribe.templates.templateCreation.previewAndFinalize'),
      icon: CheckCircle,
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
    },
  ], [currentStep]);

  // Watch form values for real-time updates
  const watchedValues = watch();
  const nameLength = watchedValues.name?.length || 0;
  const structureLength = watchedValues.example_structure?.length || 0;
  const notesLength = watchedValues.notes?.length || 0;

  // Step validation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    let fieldsToValidate: (keyof ExtendedFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'example_structure'];
        break;
      case 2:
        fieldsToValidate = ['notes'];
        break;
      case 3:
        fieldsToValidate = ['name', 'example_structure'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    return isStepValid;
  }, [currentStep, trigger]);

  // Navigation functions
  const goToNextStep = useCallback(async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentStep, validateCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  }, [currentStep]);

  // Template suggestion handler
  const applySuggestion = useCallback((suggestionKey: string) => {
    const suggestion = TEMPLATE_SUGGESTIONS[suggestionKey as keyof typeof TEMPLATE_SUGGESTIONS];
    if (suggestion) {
      setValue('name', suggestion.name);
      setValue('example_structure', suggestion.structure);
      setValue('notes', suggestion.notes);
      setSelectedSuggestion(suggestionKey);
      
      // Trigger a small celebration animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  }, [setValue]);

  // Touch gesture handlers for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;
    
    if (isSwipe) {
      if (distance > 0 && currentStep < 4) {
        // Swipe left - go to next step
        goToNextStep();
      } else if (distance < 0 && currentStep > 1) {
        // Swipe right - go to previous step
        goToPreviousStep();
      }
    }
  }, [touchStart, touchEnd, currentStep, goToNextStep, goToPreviousStep]);

  // Update form values when editTemplate changes
  useEffect(() => {
    if (editTemplate) {
      reset({
        name: editTemplate.name || '',
        example_structure: editTemplate.example_structure || '',
        notes: editTemplate.notes || '',
        category: 'routine',
        aiTone: 'professional',
        includeTimestamps: true,
        includeDiagnosticCodes: false,
      });
    } else {
      reset({
        name: '',
        example_structure: '',
        notes: '',
        category: 'routine',
        aiTone: 'professional',
        includeTimestamps: true,
        includeDiagnosticCodes: false,
      });
    }
  }, [editTemplate, reset]);

  // Handle form submission
  const onSubmit = useCallback(async (data: ExtendedFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (isEditMode && editTemplate) {
        // Update existing template
        const updatedTemplate = await templateService.updateTemplate(editTemplate.id, {
          name: data.name,
          example_structure: data.example_structure,
          notes: data.notes,
        });

        onTemplateUpdated?.(updatedTemplate);
      } else {
        // Create new template
        const newTemplate = await templateService.createTemplate({
          name: data.name,
          example_structure: data.example_structure,
          notes: data.notes,
        });

        onTemplateCreated(newTemplate);
      }
      
      // Success animation and close
      setIsAnimating(true);
      setTimeout(() => {
        if (!isEditMode) {
          reset();
          setCurrentStep(1);
        }
        onClose();
        setIsAnimating(false);
      }, 1000);
    } catch (error: any) {
      // Handle specific error types
      if (error.code === 'DUPLICATE_NAME') {
        setSubmitError(t('mediscribe.templates.templateCreation.duplicateNameError'));
      } else if (error.code === 'TEMPLATE_LIMIT_EXCEEDED') {
        setSubmitError(t('mediscribe.templates.templateCreation.limitExceededError'));
      } else if (error.code === 'INVALID_MEDICAL_CONTENT') {
        setSubmitError(t('mediscribe.templates.templateCreation.invalidContentError'));
      } else if (error.code === 'AUTH_REQUIRED') {
        setSubmitError(t('mediscribe.templates.templateCreation.authRequiredError'));
      } else {
        setSubmitError(t(isEditMode ? 'mediscribe.templates.templateCreation.failedToUpdateError' : 'mediscribe.templates.templateCreation.failedToCreateError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, editTemplate, onTemplateCreated, onTemplateUpdated, onClose, reset]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setSubmitError(null);
      setCurrentStep(1);
      setShowTemplatePreview(false);
      setSelectedSuggestion(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Track keyboard navigation for accessibility
      if (e.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (currentStep === 3) {
              handleSubmit(onSubmit)();
            } else {
              goToNextStep();
            }
            break;
          case 'Escape':
            e.preventDefault();
            handleClose();
            break;
          case 'p':
            e.preventDefault();
            setShowTemplatePreview(!showTemplatePreview);
            break;
          case '1':
          case '2':
          case '3':
            e.preventDefault();
            const stepNum = parseInt(e.key);
            if (stepNum >= 1 && stepNum <= 3) {
              setCurrentStep(stepNum);
            }
            break;
        }
      }

      // Arrow key navigation
      if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        goToPreviousStep();
      } else if (e.key === 'ArrowRight' && currentStep < 3) {
        e.preventDefault();
        goToNextStep();
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, currentStep, showTemplatePreview, handleSubmit, onSubmit, goToNextStep, goToPreviousStep, handleClose]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Enhanced Backdrop with Glassmorphic Effect */}
      <div 
        className="template-modal-backdrop fixed inset-0"
        onClick={handleClose}
      />
      
      {/* Animated Background Particles */}
      <div className="template-modal-particles">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
      </div>
      
      {/* Main Modal Container */}
      <div className="flex min-h-full items-center justify-center p-2 lg:p-4">
        <div 
          ref={modalRef}
          className={`template-modal-container relative w-full max-w-5xl rounded-2xl lg:rounded-3xl max-h-[85vh] flex flex-col lg:flex-row ${
            isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          } ${isKeyboardNavigation ? 'keyboard-navigation' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Glassmorphic Border Animation */}
          <div className="absolute inset-0 rounded-3xl opacity-60">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#63b3ed]/20 via-[#2b6cb0]/20 to-[#1a365d]/20 animate-pulse" />
          </div>

          {/* Left Panel - Wizard Navigation */}
          <div className="wizard-panel w-full lg:w-72 lg:min-w-72 rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none p-4 lg:p-6 text-white flex-shrink-0 overflow-hidden">
            {/* Header */}
            <div className="relative mb-4 lg:mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg lg:text-xl font-bold text-white">
                    {isEditMode ? t('mediscribe.templates.templateCreation.editTemplate') : t('mediscribe.templates.templateCreation.createTemplate')}
                  </h2>
                  <p id="modal-description" className="text-white/80 text-xs lg:text-sm hidden lg:block">
                    {t('mediscribe.templates.templateCreation.designWithAI')}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="wizard-progress-bar mb-1">
                <div 
                  className="wizard-progress-fill"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/70">
                {t('mediscribe.templates.templateCreation.stepProgress', { current: currentStep, total: 3, percent: Math.round((currentStep / 3) * 100) })}
              </p>
            </div>

            {/* Steps */}
            <div className="relative space-y-1 lg:space-y-4">
              {wizardSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`wizard-step relative flex items-center space-x-2 lg:space-x-4 p-1 lg:p-3 rounded-lg lg:rounded-xl ${
                      step.isActive 
                        ? 'active' 
                        : step.isCompleted 
                        ? 'completed' 
                        : ''
                    }`}
                    tabIndex={isKeyboardNavigation ? 0 : -1}
                    role="button"
                    aria-label={`Step ${step.id}: ${step.title}`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {/* Step connector line */}
                    {index < wizardSteps.length - 1 && (
                      <div className="absolute left-3 lg:left-6 top-8 lg:top-12 w-0.5 h-4 lg:h-8 bg-white/30" />
                    )}
                    
                    <div className="wizard-step-icon w-5 h-5 lg:w-8 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center">
                      {step.isCompleted ? (
                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                      ) : (
                        <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-xs lg:text-sm">{step.title}</h3>
                      <p className="text-xs text-white/80 hidden lg:block">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Panel - Form Content */}
          <div className="flex-1 flex flex-col relative min-h-0">
            {/* Header with Close Button */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                    {wizardSteps[currentStep - 1]?.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 hidden lg:block">
                    {wizardSteps[currentStep - 1]?.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Preview Toggle - Hidden on mobile */}
                <button
                  onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                  className="preview-toggle hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  title={t('mediscribe.templates.templateCreation.togglePreview')}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{t('mediscribe.templates.templateCreation.preview')}</span>
                </button>

                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Split View - Form and Preview */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Form Section */}
              <div className={`${showTemplatePreview ? 'w-1/2' : 'w-full'} transition-all duration-300 swipe-area min-h-0`}>
                <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar min-h-0">
                    {/* Step Content */}
                    <div 
                      ref={contentRef}
                      className={`step-content ${isAnimating ? 'animate-out' : 'animate-in'}`}
                    >
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          {/* Template Name */}
                          <div className="space-y-3">
                            <label htmlFor="template-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('mediscribe.templates.templateCreation.templateName')}
                            </label>
                            <div className="relative">
                              <input
                                id="template-name"
                                type="text"
                                {...register('name')}
                                className={`template-input w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent text-base ${
                                  errors.name 
                                    ? 'border-red-300 bg-red-50/50 dark:border-red-600 dark:bg-red-900/20' 
                                    : 'border-gray-200 dark:border-gray-600 hover:border-[#63b3ed]'
                                } text-gray-900 dark:text-white placeholder-gray-500`}
                                placeholder={t('mediscribe.templates.templateCreation.templateNamePlaceholder')}
                                style={{ fontSize: '16px' }}
                                autoFocus={currentStep === 1}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                {t('mediscribe.templates.templateCreation.charCounter', { current: nameLength, max: 100 })}
                              </div>
                            </div>
                            {errors.name && (
                              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.name.message}</span>
                              </p>
                            )}
                          </div>


                          {/* Template Structure Editor - Now More Prominent */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label htmlFor="example-structure" className="block text-lg font-bold text-gray-800 dark:text-white">
                                {t('mediscribe.templates.templateCreation.templateStructure')}
                              </label>
                              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                {t('mediscribe.templates.templateCreation.charCounter', { current: structureLength, max: 50000 })}
                              </span>
                            </div>
                            
                            <div className="relative">
                              <textarea
                                id="example-structure"
                                {...register('example_structure')}
                                rows={16}
                                className={`template-textarea w-full px-5 py-5 border-3 rounded-2xl focus:ring-4 focus:ring-[#2b6cb0]/30 focus:focus:border-[#2b6cb0] transition-all duration-300 resize-none text-base font-mono shadow-lg ${
                                  errors.example_structure 
                                    ? 'border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-900/20' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-[#63b3ed] bg-white/80 dark:bg-gray-900/80'
                                } text-gray-900 dark:text-white backdrop-blur-sm`}
                                style={{ 
                                  fontSize: '16px', 
                                  lineHeight: '1.6',
                                  minHeight: '400px',
                                  maxHeight: '600px'
                                }}
                                aria-describedby={errors.example_structure ? 'structure-error' : undefined}
                                value={showStructurePlaceholder && !watchedValues.example_structure ? t('mediscribe.templates.templateCreation.structurePlaceholder') : watchedValues.example_structure}
                                onChange={(e) => {
                                  setShowStructurePlaceholder(false);
                                  setValue('example_structure', e.target.value);
                                }}
                                onFocus={() => setShowStructurePlaceholder(false)}
                                onBlur={() => {
                                  if (!watchedValues.example_structure) {
                                    setShowStructurePlaceholder(true);
                                  }
                                }}
                              />
                              
                              {/* Enhanced visual indicator */}
                              <div className="absolute top-3 right-3 text-[#2b6cb0]/30">
                                <Edit3 className="w-6 h-6" />
                              </div>
                            </div>
                            
                            {errors.example_structure && (
                              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>{errors.example_structure.message}</span>
                              </p>
                            )}
                          </div>


                        </div>
                      )}


                      {currentStep === 2 && (
                        <div className="space-y-6">
                          {/* AI Instructions Step */}
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-[#63b3ed]/10 to-[#2b6cb0]/10 rounded-xl p-6 border border-[#63b3ed]/20">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg flex items-center justify-center">
                                  <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('mediscribe.templates.templateCreation.aiConfiguration')}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('mediscribe.templates.templateCreation.customizeAIProcess')}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('mediscribe.templates.templateCreation.additionalInstructions')}
                                  </label>
                                  <textarea
                                    id="notes"
                                    {...register('notes')}
                                    rows={8}
                                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-all duration-200 resize-none text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                                      errors.notes 
                                        ? 'border-red-300 bg-red-50/50 dark:border-red-600 dark:bg-red-900/20' 
                                        : 'border-gray-200 dark:border-gray-600 hover:border-[#63b3ed]'
                                    } text-gray-900 dark:text-white`}
                                    placeholder={t('mediscribe.templates.templateCreation.aiInstructionsPlaceholder')}
                                    style={{ fontSize: '14px', lineHeight: '1.5' }}
                                    autoFocus={currentStep === 2}
                                  />
                                  <div className="flex justify-between items-center mt-2">
                                    {errors.notes && (
                                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.notes.message}</span>
                                      </p>
                                    )}
                                    <span className="text-xs text-gray-500 ml-auto bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                      {notesLength}/10,000
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-start space-x-3">
                                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">{t('mediscribe.templates.templateCreation.aiTips')}</h4>
                                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>{t('mediscribe.templates.templateCreation.tip1')}</li>
                                        <li>{t('mediscribe.templates.templateCreation.tip2')}</li>
                                        <li>{t('mediscribe.templates.templateCreation.tip3')}</li>
                                        <li>{t('mediscribe.templates.templateCreation.tip4')}</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          {/* Template Preview Summary */}
                          <div className="bg-gradient-to-br from-[#1a365d]/5 via-[#2b6cb0]/5 to-[#63b3ed]/5 rounded-xl p-6 border border-[#63b3ed]/20">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                              <Sparkles className="w-5 h-5 text-[#2b6cb0]" />
                              <span>{t('mediscribe.templates.templateCreation.templateSummary')}</span>
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.templateNameLabel')}</label>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{watchedValues.name || t('mediscribe.templates.templateCreation.untitledTemplate')}</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.categoryLabel')}</label>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{watchedValues.category || t('mediscribe.templates.templateCreation.routine')}</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.aiToneLabel')}</label>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{watchedValues.aiTone || t('mediscribe.templates.templateCreation.professional')}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.structureLengthLabel')}</label>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('mediscribe.templates.templateCreation.characters', { count: structureLength.toLocaleString() })}</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.additionalNotesLabel')}</label>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notesLength > 0 ? t('mediscribe.templates.templateCreation.characters', { count: notesLength }) : t('mediscribe.templates.templateCreation.none')}</p>
                                </div>
                                
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('mediscribe.templates.templateCreation.featuresLabel')}</label>
                                  <div className="flex flex-wrap gap-1">
                                    {watchedValues.includeTimestamps && (
                                      <span className="px-2 py-1 bg-[#2b6cb0]/10 text-[#2b6cb0] text-xs rounded-md">{t('mediscribe.templates.templateCreation.timestamps')}</span>
                                    )}
                                    {watchedValues.includeDiagnosticCodes && (
                                      <span className="px-2 py-1 bg-[#2b6cb0]/10 text-[#2b6cb0] text-xs rounded-md">{t('mediscribe.templates.templateCreation.icdCodes')}</span>
                                    )}
                                    {!watchedValues.includeTimestamps && !watchedValues.includeDiagnosticCodes && (
                                      <span className="text-xs text-gray-500">{t('mediscribe.templates.templateCreation.standard')}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error Display */}
                          {submitError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                              </div>
                            </div>
                          )}

                          {/* Success Preparation */}
                          {isSubmitting && (
                            <div className="bg-[#2b6cb0]/5 border border-[#2b6cb0]/20 rounded-xl p-6 text-center">
                              <div className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 border-4 border-[#2b6cb0]/30 border-t-[#2b6cb0] rounded-full animate-spin" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isEditMode ? t('mediscribe.templates.templateCreation.updatingTemplate') : t('mediscribe.templates.templateCreation.creatingTemplate')}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('mediscribe.templates.templateCreation.optimizingAI')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Navigation */}
                  <div className="flex-shrink-0 flex items-center justify-between p-4 lg:p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={goToPreviousStep}
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 px-3 lg:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 text-sm lg:text-base"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>{t('mediscribe.templates.templateCreation.previous')}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={goToNextStep}
                          disabled={isSubmitting}
                          className="primary-button flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-white rounded-lg lg:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
                        >
                          <span>{t('mediscribe.templates.templateCreation.continue')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!isValid || isSubmitting}
                          className="primary-button flex items-center space-x-2 px-4 lg:px-8 py-2 lg:py-3 text-white rounded-lg lg:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm lg:text-lg"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              <span>{isEditMode ? t('mediscribe.templates.templateCreation.updateTemplate') : t('mediscribe.templates.templateCreation.createTemplate')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Preview Panel */}
              {showTemplatePreview && (
                <div className="preview-panel w-1/2 border-l border-gray-200/50 dark:border-gray-700/50">
                  <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>{t('mediscribe.templates.templateCreation.livePreview')}</span>
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      <div className="preview-content rounded-lg p-6 shadow-sm">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {watchedValues.example_structure ? (
                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                              {watchedValues.example_structure}
                            </pre>
                          ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                              <p>{t('mediscribe.templates.templateCreation.structureWillAppear')}</p>
                              <p className="text-xs">{t('mediscribe.templates.templateCreation.startTypingPreview')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};