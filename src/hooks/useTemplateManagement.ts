/**
 * Template Management Hooks
 * 
 * Custom React hooks for template management operations with caching,
 * error handling, and optimistic updates.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useTemplateStore, useTemplateActions, useTemplateState, useTemplateSelectors } from '../stores/templateStore';
import type {
  UserReportTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateSearchFilters,
} from '../types/templates';

/**
 * Main hook for template management
 */
export const useTemplateManagement = () => {
  const state = useTemplateState();
  const actions = useTemplateActions();
  const selectors = useTemplateSelectors();

  // Load templates on mount
  useEffect(() => {
    actions.loadTemplates();
  }, []);

  // Load stats on mount
  useEffect(() => {
    actions.loadStats();
  }, []);

  // Enhanced create function with validation
  const createTemplate = useCallback(async (data: CreateTemplateRequest) => {
    // Check template limit before creating
    if (selectors.isAtLimit) {
      throw new Error('Template limit reached. Please delete some templates before creating new ones.');
    }

    return await actions.createTemplate(data);
  }, [actions.createTemplate, selectors.isAtLimit]);

  // Enhanced update function
  const updateTemplate = useCallback(async (id: string, data: UpdateTemplateRequest) => {
    return await actions.updateTemplate(id, data);
  }, [actions.updateTemplate]);

  // Enhanced delete function with confirmation
  const deleteTemplate = useCallback(async (id: string, skipConfirmation = false) => {
    const template = state.templates.find(t => t.id === id);
    
    if (!template) {
      throw new Error('Template not found');
    }

    if (!skipConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
      );
      
      if (!confirmed) {
        return;
      }
    }

    return await actions.deleteTemplate(id);
  }, [actions.deleteTemplate, state.templates]);

  // Enhanced template selection with usage tracking
  const selectTemplate = useCallback(async (template: UserReportTemplate) => {
    await actions.recordUsage(template.id);
    
    // Return enhanced prompt with template structure and notes
    const enhancedPrompt = `${template.example_structure}${
      template.notes ? `\n\nAdditional guidance: ${template.notes}` : ''
    }`;
    
    return enhancedPrompt;
  }, [actions.recordUsage]);

  // Search and filter management
  const updateFilters = useCallback((filters: Partial<TemplateSearchFilters>) => {
    actions.setFilters(filters);
  }, [actions.setFilters]);

  // Search by query
  const searchTemplates = useCallback((query: string) => {
    actions.setFilters({ search: query });
  }, [actions.setFilters]);

  // Sort templates
  const sortTemplates = useCallback((
    orderBy: TemplateSearchFilters['order_by'],
    direction: TemplateSearchFilters['order_direction'] = 'desc'
  ) => {
    actions.setFilters({ order_by: orderBy, order_direction: direction });
  }, [actions.setFilters]);

  // Clear search and filters
  const clearFilters = useCallback(() => {
    actions.setFilters({
      search: '',
      order_by: 'created_at',
      order_direction: 'desc',
    });
  }, [actions.setFilters]);

  // Refresh templates
  const refreshTemplates = useCallback(() => {
    actions.loadTemplates();
    actions.loadStats();
  }, [actions.loadTemplates, actions.loadStats]);

  return {
    // State
    templates: state.templates,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    totalCount: state.totalCount,
    stats: state.stats,
    
    // Computed values
    ...selectors,
    
    // Actions
    createTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    updateFilters,
    searchTemplates,
    sortTemplates,
    clearFilters,
    refreshTemplates,
    clearError: actions.clearError,
  };
};

/**
 * Hook for template creation workflow
 */
export const useTemplateCreation = () => {
  const { createTemplate, isAtLimit, templatesRemaining } = useTemplateManagement();

  const canCreateTemplate = useMemo(() => !isAtLimit, [isAtLimit]);
  
  const getTemplateLimit = useCallback(() => ({
    current: 50 - (templatesRemaining || 0),
    max: 50,
    remaining: templatesRemaining || 0,
    canCreate: canCreateTemplate,
  }), [templatesRemaining, canCreateTemplate]);

  return {
    createTemplate,
    canCreateTemplate,
    getTemplateLimit,
    isApproachingLimit: templatesRemaining !== undefined && templatesRemaining <= 5,
  };
};

/**
 * Hook for template selection workflow
 */
export const useTemplateSelection = () => {
  const { templates, selectTemplate, recentlyUsedTemplates, templatesByUsage } = useTemplateManagement();

  // Get suggested templates based on usage patterns
  const getSuggestedTemplates = useCallback((limit = 5) => {
    // Prefer recently used templates, then fall back to most used
    const suggested = new Map<string, UserReportTemplate>();
    
    // Add recently used templates first
    recentlyUsedTemplates.slice(0, Math.ceil(limit / 2)).forEach(template => {
      suggested.set(template.id, template);
    });
    
    // Fill remaining slots with most used templates
    templatesByUsage.forEach(template => {
      if (suggested.size < limit && !suggested.has(template.id)) {
        suggested.set(template.id, template);
      }
    });
    
    return Array.from(suggested.values());
  }, [recentlyUsedTemplates, templatesByUsage]);

  // Get templates by category (could be extended in the future)
  const getTemplatesByCategory = useCallback((category?: string) => {
    // For now, return all templates as we don't have categories
    // This can be extended when category support is added
    return templates;
  }, [templates]);

  return {
    templates,
    selectTemplate,
    getSuggestedTemplates,
    getTemplatesByCategory,
    recentlyUsedTemplates,
    mostUsedTemplates: templatesByUsage.slice(0, 5),
  };
};

/**
 * Hook for template search and filtering
 */
export const useTemplateSearch = () => {
  const { 
    templates, 
    filters, 
    loading, 
    searchTemplates, 
    sortTemplates, 
    clearFilters,
    updateFilters 
  } = useTemplateManagement();

  // Debounced search
  const debouncedSearch = useCallback((query: string, delay = 300) => {
    const timeoutId = setTimeout(() => {
      searchTemplates(query);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTemplates]);

  // Get search suggestions based on template names
  const getSearchSuggestions = useCallback((query: string, limit = 5) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return templates
      .filter(template => 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.notes.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit)
      .map(template => ({
        id: template.id,
        suggestion: template.name,
        type: 'template_name' as const,
      }));
  }, [templates]);

  // Check if search is active
  const hasActiveSearch = useMemo(() => {
    return filters.search.length > 0;
  }, [filters.search]);

  // Check if filters are applied
  const hasActiveFilters = useMemo(() => {
    return filters.order_by !== 'created_at' || filters.order_direction !== 'desc';
  }, [filters]);

  return {
    templates,
    filters,
    loading,
    hasActiveSearch,
    hasActiveFilters,
    searchTemplates,
    debouncedSearch,
    sortTemplates,
    updateFilters,
    clearFilters,
    getSearchSuggestions,
  };
};

/**
 * Hook for template statistics and analytics
 */
export const useTemplateStats = () => {
  const { stats, usageStats, loadStats } = useTemplateManagement();

  // Get usage trends (could be extended with more complex analytics)
  const getUsageTrends = useCallback(() => {
    return {
      totalUsage: usageStats.totalUsage,
      averageUsage: usageStats.averageUsage,
      mostUsedTemplate: usageStats.mostUsedTemplate,
      usageDistribution: usageStats.totalTemplates > 0 
        ? usageStats.totalUsage / usageStats.totalTemplates 
        : 0,
    };
  }, [usageStats]);

  // Get template health metrics
  const getTemplateHealth = useCallback(() => {
    const { totalTemplates, averageUsage, mostUsedTemplate } = usageStats;
    
    return {
      utilization: totalTemplates > 0 ? (averageUsage > 0 ? 'good' : 'low') : 'none',
      distribution: mostUsedTemplate && totalTemplates > 1 
        ? (mostUsedTemplate.usage_count > averageUsage * 2 ? 'concentrated' : 'balanced')
        : 'unknown',
      recommendations: totalTemplates === 0 
        ? ['Create your first template to get started']
        : averageUsage < 1 
        ? ['Consider using your templates more frequently', 'Review template relevance']
        : ['Template usage looks healthy'],
    };
  }, [usageStats]);

  return {
    stats,
    usageStats,
    loadStats,
    getUsageTrends,
    getTemplateHealth,
  };
};