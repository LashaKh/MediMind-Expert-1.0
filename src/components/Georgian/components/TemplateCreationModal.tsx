/**
 * Template Creation Modal Component
 * 
 * Modal interface for creating custom medical report templates.
 * Implements mobile-first design with 44px touch targets and medical validation.
 */

import React, { useState, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { templateService } from '../../../services/templateService';
import { templateFormSchema, type TemplateFormData } from '../../../lib/validations/template-schemas';
import type { TemplateCreationModalProps } from '../../../types/templates';

export const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  editTemplate,
  onTemplateUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Determine if we're in edit mode
  const isEditMode = !!editTemplate;

  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      example_structure: '',
      notes: '',
    },
  });

  // Update form values when editTemplate changes
  useEffect(() => {
    if (editTemplate) {
      reset({
        name: editTemplate.name || '',
        example_structure: editTemplate.example_structure || '',
        notes: editTemplate.notes || '',
      });
    } else {
      reset({
        name: '',
        example_structure: '',
        notes: '',
      });
    }
  }, [editTemplate, reset]);

  // Watch form values for character counts
  const watchedValues = watch();
  const nameLength = watchedValues.name?.length || 0;
  const structureLength = watchedValues.example_structure?.length || 0;
  const notesLength = watchedValues.notes?.length || 0;

  // Handle form submission
  const onSubmit = useCallback(async (data: TemplateFormData) => {
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
      
      // Close modal and reset form on success
      if (isEditMode) {
        // For edit mode, let the parent handle closing
      } else {
        reset();
      }
    } catch (error: any) {
      
      // Handle specific error types
      if (error.code === 'DUPLICATE_NAME') {
        setSubmitError('A template with this name already exists. Please choose a different name.');
      } else if (error.code === 'TEMPLATE_LIMIT_EXCEEDED') {
        setSubmitError('You have reached the maximum limit of 50 templates. Please delete some templates before creating new ones.');
      } else if (error.code === 'INVALID_MEDICAL_CONTENT') {
        setSubmitError('Template structure must contain medical content with appropriate keywords or formatting.');
      } else if (error.code === 'AUTH_REQUIRED') {
        setSubmitError('Please sign in to create templates.');
      } else {
        setSubmitError(`Failed to ${isEditMode ? 'update' : 'create'} template. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, editTemplate, onTemplateCreated, onTemplateUpdated, reset]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setSubmitError(null);
      onClose();
      // Note: Don't reset here to avoid clearing form when switching between modes
    }
  }, [isSubmitting, onClose]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal - Mobile-first responsive design */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl
                        max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Header - Mobile optimized */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Mobile handle indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full sm:hidden"></div>
            
            <div className="flex items-center space-x-3 min-w-0 flex-1 mt-3 sm:mt-0">
              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {isEditMode ? 'Modify your custom medical report template' : 'Design a custom medical report template'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-shrink-0 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Close modal"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form - Scrollable content */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
              <label 
                htmlFor="template-name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Template Name *
              </label>
              <input
                id="template-name"
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-colors 
                           text-base sm:text-sm touch-manipulation ${
                  errors.name 
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
                placeholder="e.g., Emergency Cardiology Assessment"
                style={{ minHeight: '48px', fontSize: '16px' }} // Prevent zoom on iOS
              />
              <div className="flex justify-between items-center">
                <div>
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.name.message}</span>
                    </p>
                  )}
                </div>
                <span className={`text-xs ${nameLength > 90 ? 'text-red-600' : 'text-gray-500'}`}>
                  {nameLength}/100
                </span>
              </div>
            </div>

            {/* Example Structure */}
            <div className="space-y-2">
              <label 
                htmlFor="example-structure" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Example Structure *
              </label>
              <div className="relative">
                <textarea
                  id="example-structure"
                  {...register('example_structure')}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-colors 
                             resize-y text-base sm:text-sm touch-manipulation ${
                    errors.example_structure 
                      ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } text-gray-900 dark:text-white`}
                  style={{ minHeight: '120px', fontSize: '16px' }} // Prevent zoom on iOS
                  placeholder="# Emergency Cardiac Assessment

## Chief Complaint
[Patient's primary concern]

## Vital Signs
- Blood Pressure: [value] mmHg
- Heart Rate: [value] bpm
- O2 Saturation: [value]%

## ECG Findings
[12-lead ECG interpretation]

## Assessment & Plan
[Clinical impression and treatment plan]"
                />
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {errors.example_structure && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.example_structure.message}</span>
                    </p>
                  )}
                  <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                    <Info className="w-3 h-3" />
                    <span>Use medical terminology and structure for best AI results</span>
                  </div>
                </div>
                <span className={`text-xs ${structureLength > 45000 ? 'text-red-600' : 'text-gray-500'}`}>
                  {structureLength}/50,000
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label 
                htmlFor="notes" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-colors 
                           resize-y text-base sm:text-sm touch-manipulation ${
                  errors.notes 
                    ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
                style={{ minHeight: '80px', fontSize: '16px' }} // Prevent zoom on iOS
                placeholder="Additional guidance for AI generation (e.g., focus areas, time-sensitive protocols, specialty-specific considerations)"
              />
              <div className="flex justify-between items-center">
                <div>
                  {errors.notes && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.notes.message}</span>
                    </p>
                  )}
                </div>
                <span className={`text-xs ${notesLength > 9000 ? 'text-red-600' : 'text-gray-500'}`}>
                  {notesLength}/10,000
                </span>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
                </div>
              </div>
            )}

            </div>
            
            {/* Footer - Mobile optimized sticky footer */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 p-4 sm:p-6 pt-4 
                           border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="order-2 sm:order-1 flex-1 px-6 py-4 sm:py-3 border border-gray-300 dark:border-gray-600 
                          text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                          touch-manipulation text-base sm:text-sm font-medium"
                style={{ minHeight: '48px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="order-1 sm:order-2 flex-1 flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 
                          bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white rounded-lg 
                          hover:from-[#1a365d] hover:to-[#2b6cb0] transition-all 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          touch-manipulation text-base sm:text-sm font-medium"
                style={{ minHeight: '48px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Template' : 'Save Template'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};