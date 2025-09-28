/**
 * Template Delete Confirmation Component
 * 
 * Modal dialog for confirming template deletion with mobile-optimized design.
 * Prevents accidental deletion with clear warning and action buttons.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
} from 'lucide-react';
import type { UserReportTemplate } from '../../../types/templates';

interface TemplateDeleteConfirmationProps {
  isOpen: boolean;
  template: UserReportTemplate | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const TemplateDeleteConfirmation: React.FC<TemplateDeleteConfirmationProps> = ({
  isOpen,
  template,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus on cancel button for better accessibility
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel, isDeleting]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  }, [onCancel, isDeleting]);

  // Handle confirm deletion
  const handleConfirm = useCallback(() => {
    if (!isDeleting) {
      onConfirm();
    }
  }, [onConfirm, isDeleting]);

  if (!isOpen || !template) {
    return null;
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        data-testid="modal-overlay"
      >
        {/* Modal Content */}
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto relative animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Template
              </h3>
            </div>
            
            {!isDeleting && (
              <button
                onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Warning Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">This action cannot be undone.</p>
                    <p>The template and all its data will be permanently deleted.</p>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You are about to delete:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                        {template.name}
                      </h4>
                      {template.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}</span>
                        <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deletion Impact */}
              {template.usage_count > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <span className="font-medium">Note:</span> This template has been used{' '}
                    {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}. 
                    Consider if you might need it again in the future.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
            <button
              ref={cancelButtonRef}
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ minHeight: '48px' }}
            >
              <span>Cancel</span>
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ minHeight: '48px' }}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};