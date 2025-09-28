/**
 * Template Management Card Component
 * 
 * Individual card for displaying and managing custom templates.
 * Mobile-optimized with 44px touch targets and usage statistics.
 */

import React, { useState, useCallback } from 'react';
import {
  FileText,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  Calendar,
  Zap,
  MoreVertical,
  Eye,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TemplateManagementCardProps } from '../../../types/templates';

export const TemplateManagementCard: React.FC<TemplateManagementCardProps> = ({
  template,
  onEdit,
  onDelete,
  onSelect,
  disabled = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle template selection
  const handleSelect = useCallback(async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    try {
      await onSelect(template);
    } finally {
      // Keep processing state briefly for visual feedback
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [disabled, isProcessing, onSelect, template]);

  // Handle template edit
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(template);
    setShowActions(false);
  }, [onEdit, template]);

  // Handle template delete  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(template);
    setShowActions(false);
  }, [onDelete, template]);

  // Toggle actions menu
  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  }, [showActions]);

  // Format dates
  const createdAt = formatDistanceToNow(new Date(template.created_at), { addSuffix: true });
  const lastUsedAt = template.last_used_at 
    ? formatDistanceToNow(new Date(template.last_used_at), { addSuffix: true })
    : 'Never';

  // Truncate description for display
  const previewText = template.example_structure.length > 150 
    ? template.example_structure.substring(0, 150) + '...'
    : template.example_structure;

  return (
    <div className="relative">
      {/* Main Card - Premium style matching Cardiologist Consults */}
      <div
        className={`group relative bg-gradient-to-br from-[#2b6cb0] via-[#1a365d] to-[#2b6cb0] rounded-2xl p-6 shadow-lg transition-all duration-300 min-h-[180px] flex flex-col justify-between cursor-pointer ${
          disabled ? 'opacity-50 pointer-events-none' : 'hover:shadow-xl'
        }`}
        onClick={handleSelect}
      >
        {/* Subtle Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-2xl" />
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-white/90 font-medium">Initiating...</span>
            </div>
          </div>
        )}

        {/* Standardized Content Layout */}
        <div className="relative text-white flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-end space-y-1">
                {/* AI DIAGNOSIS Badge for templates */}
                <div className="flex items-center space-x-1 text-xs font-semibold bg-white/25 backdrop-blur-sm rounded-md px-2 py-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>AI TEMPLATE</span>
                </div>
                <div className="flex items-center space-x-1 text-xs font-medium bg-white/15 backdrop-blur-sm rounded-md px-2 py-0.5">
                  <Clock className="w-3 h-3" />
                  <span>30s</span>
                </div>
              </div>
            </div>
            
            <h4 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-white">
              {template.name}
            </h4>
          </div>
          
          <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
            {previewText.length > 100 ? previewText.substring(0, 100) + '...' : previewText}
          </p>
        </div>
        
        {/* Disabled State Overlay */}
        {disabled && (
          <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-xs text-white/80 font-medium">Needs Content</span>
            </div>
          </div>
        )}

        {/* Simplified Hover Action */}
        <div className={`absolute bottom-3 right-3 w-6 h-6 bg-white/15 backdrop-blur-sm rounded-md flex items-center justify-center transition-all duration-200 ${
          isProcessing ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <Zap className="w-3 h-3 text-white" />
        </div>

        {/* Actions Menu - Hidden on premium cards style but accessible */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleActions(e);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Template actions"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {/* Actions Dropdown */}
          {showActions && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                <button
                  onClick={(e) => handleEdit(e)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                  style={{ minHeight: '48px' }}
                >
                  <Edit className="w-4 h-4 flex-shrink-0" />
                  <span>Edit Template</span>
                </button>
                <button
                  onClick={(e) => handleDelete(e)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg"
                  style={{ minHeight: '48px' }}
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span>Delete Template</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};