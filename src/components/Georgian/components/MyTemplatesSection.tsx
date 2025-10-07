/**
 * My Templates Section Component
 * 
 * Displays user's custom report templates above the existing Cardiologist Consults section.
 * Provides template management capabilities with mobile-first design.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Clock,
  TrendingUp,
  FileText,
  Stethoscope,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { templateService } from '../../../services/templateService';
import { generateTemplateBasedReport } from '../../../services/diagnosisFlowiseService';
import { TemplateCreationModal } from './TemplateCreationModal';
import { TemplateManagementCard } from './TemplateManagementCard';
import { TemplateDeleteConfirmation } from './TemplateDeleteConfirmation';

// Skeleton component for loading state - Premium card style
const TemplateSkeletonCard: React.FC = () => (
  <div className="relative bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-lg min-h-[180px] flex flex-col justify-between animate-pulse">
    {/* Header Section */}
    <div>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse" />
        <div className="flex flex-col items-end space-y-1">
          <div className="w-20 h-5 bg-white/25 backdrop-blur-sm rounded-md animate-pulse" />
          <div className="w-12 h-4 bg-white/15 backdrop-blur-sm rounded-md animate-pulse" />
        </div>
      </div>
      
      <div className="h-6 bg-white/20 rounded animate-pulse mb-2 w-4/5" />
    </div>
    
    <div className="h-10 bg-white/15 rounded animate-pulse w-full" />
  </div>
);

import type { 
  MyTemplatesSectionProps, 
  UserReportTemplate,
} from '../../../types/templates';

export const MyTemplatesSection: React.FC<MyTemplatesSectionProps> = ({
  onSelectTemplate,
  disabled = false,
  hasTranscript,
  transcript,
  onAddToHistory,
  onSwitchToHistory,
  onTemplateSelect
}) => {
  // State management
  const [templates, setTemplates] = useState<UserReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserReportTemplate | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    template: UserReportTemplate | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    template: null,
    isDeleting: false,
  });

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await templateService.getUserTemplates();
      setTemplates(response.templates);
      setTotalCount(response.total_count);
    } catch (err) {
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - always load templates to show them in the UI
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Handle template creation
  const handleTemplateCreated = useCallback((newTemplate: UserReportTemplate) => {
    setTemplates(prev => [newTemplate, ...prev]);
    setTotalCount(prev => prev + 1);
    setIsCreateModalOpen(false);
  }, []);

  // Handle template update
  const handleTemplateUpdated = useCallback((updatedTemplate: UserReportTemplate) => {
    setTemplates(prev => 
      prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
    );
    setEditingTemplate(null);
  }, []);

  // Handle template selection - Let parent handle generation with processing modal
  const handleTemplateSelect = useCallback(async (template: UserReportTemplate) => {
    if (disabled || !hasTranscript) return; // Prevent usage without transcript content

    try {
      // Record usage
      await templateService.recordTemplateUsage(template.id);

      // Update local state
      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id
            ? { ...t, usage_count: t.usage_count + 1, last_used_at: new Date().toISOString() }
            : t
        )
      );

      // Set the selected template so parent knows to use template generation
      if (onTemplateSelect) {
        onTemplateSelect(template);
      }

      // Create instruction that triggers template processing in parent
      const instruction = `CUSTOM_TEMPLATE:${template.name}`;

      // Call parent's onSelectTemplate to trigger processing with modal
      onSelectTemplate(instruction);

    } catch (err) {
    }
  }, [disabled, hasTranscript, onSelectTemplate, onTemplateSelect]);

  // Handle template edit
  const handleTemplateEdit = useCallback((template: UserReportTemplate) => {
    setEditingTemplate(template);
  }, []);

  // Handle template delete - open confirmation modal
  const handleTemplateDelete = useCallback((template: UserReportTemplate) => {
    setDeleteConfirmation({
      isOpen: true,
      template,
      isDeleting: false,
    });
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmation.template) return;

    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

    try {
      await templateService.deleteTemplate(deleteConfirmation.template.id);
      setTemplates(prev => prev.filter(t => t.id !== deleteConfirmation.template!.id));
      setTotalCount(prev => prev - 1);
      setDeleteConfirmation({ isOpen: false, template: null, isDeleting: false });
    } catch (err) {
      setError('Failed to delete template. Please try again.');
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  }, [deleteConfirmation.template]);

  // Handle delete cancellation
  const handleDeleteCancel = useCallback(() => {
    if (!deleteConfirmation.isDeleting) {
      setDeleteConfirmation({ isOpen: false, template: null, isDeleting: false });
    }
  }, [deleteConfirmation.isDeleting]);

  // Filtered and sorted templates
  const displayTemplates = useMemo(() => {
    return templates;
  }, [templates]);

  // Show empty state message for templates when no transcript
  const showEmptyTemplateMessage = !hasTranscript;

  return (
    <div className="space-y-6">
      {/* My Templates Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              My Templates
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {totalCount} custom template{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={false} // Template creation is always enabled
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white hover:from-[#1a365d] hover:to-[#2b6cb0] shadow-md hover:shadow-lg"
          style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px touch target
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Template</span>
        </button>
      </div>

      {/* Loading State with Skeleton Cards */}
      {loading && (
        <div className="space-y-4">
          {/* Loading Message */}
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-[#2b6cb0] animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading templates...</p>
            </div>
          </div>
          
          {/* Skeleton Template Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <TemplateSkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={loadTemplates}
              className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <>
          {displayTemplates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayTemplates.map((template) => (
                <TemplateManagementCard
                  key={template.id}
                  template={template}
                  onEdit={handleTemplateEdit}
                  onDelete={handleTemplateDelete}
                  onSelect={handleTemplateSelect}
                  disabled={disabled || !hasTranscript} // Disable usage without transcript
                />
              ))}
            </div>
          ) : (
            // Empty State - Beautiful Production-Ready Design
            <div className="text-center py-16 px-4">
              {/* Gradient Icon Container */}
              <div className="relative mx-auto mb-6 w-24 h-24">
                {/* Gradient background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-3xl blur-xl opacity-30"></div>
                {/* Icon container */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <FileText className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Main CTA Button with Gradient */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105"
                style={{ minHeight: '56px' }}
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] transition-all duration-300"></div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed] via-[#2b6cb0] to-[#1a365d] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Button content */}
                <Plus className="relative w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative text-base">Create Your First Template</span>
              </button>

              {/* Subtle hint text */}
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Get started by creating a custom report template for your medical consultations
              </p>
            </div>
          )}
        </>
      )}

      {/* Template Creation/Edit Modal */}
      <TemplateCreationModal
        isOpen={isCreateModalOpen || !!editingTemplate}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTemplate(null);
        }}
        onTemplateCreated={handleTemplateCreated}
        editTemplate={editingTemplate}
        onTemplateUpdated={handleTemplateUpdated}
      />

      {/* Delete Confirmation Modal */}
      <TemplateDeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        template={deleteConfirmation.template}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleteConfirmation.isDeleting}
      />
    </div>
  );
};