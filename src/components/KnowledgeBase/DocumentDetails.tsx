import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Trash2, 
  Calendar, 
  User, 
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  ExternalLink
} from 'lucide-react';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

interface DocumentDetailsProps {
  document: DocumentWithMetadata;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  document,
  isOpen,
  onClose,
  onDelete,
  onDownload
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (document.processing_status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (document.processing_status) {
      case 'completed':
        return 'Ready for AI analysis';
      case 'processing':
        return 'Processing document...';
      case 'pending':
        return 'Waiting to be processed';
      case 'failed':
        return 'Processing failed';
      default:
        return document.processing_status;
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="document-details-title"
    >
      {/* Enhanced Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Enhanced Modal Container - Mobile Optimized */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 
                  id="document-details-title"
                  className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate"
                >
                  Document Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {document.file_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center"
              aria-label="Close document details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Enhanced Content - Mobile First */}
          <div className="p-4 sm:p-6 max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Enhanced Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Document Title and Description */}
                <div className="animate-in slide-in-from-left-2 duration-300">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {document.title}
                  </h3>
                  {document.description && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {document.description}
                    </p>
                  )}
                </div>

                {/* Enhanced Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5 animate-in slide-in-from-left-3 duration-300">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon()}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Processing Status
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {getStatusText()}
                  </p>
                  {document.processing_status === 'failed' && document.error_message && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top-1 duration-300">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {document.error_message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Tags */}
                {document.tags.length > 0 && (
                  <div className="animate-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Tags ({document.tags.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-in slide-in-from-bottom-1 duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Document Preview Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center animate-in slide-in-from-left-5 duration-300">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Document Preview
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                    Preview functionality will be available in a future update.
                  </p>
                  <button
                    onClick={onDownload}
                    disabled={document.processing_status === 'processing'}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Original File</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Sidebar Information */}
              <div className="space-y-4 sm:space-y-6">
                {/* Enhanced Metadata */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 animate-in slide-in-from-right-2 duration-300">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    File Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          File Size
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {document.formattedSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Upload Date
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {document.formattedDate}
                        </p>
                      </div>
                    </div>
                    {document.category && document.category !== 'other' && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Category
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {document.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 animate-in slide-in-from-right-3 duration-300">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={onDownload}
                      disabled={document.processing_status === 'processing'}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-4 min-h-[48px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 group"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Download Document</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!document.canDelete}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-4 min-h-[48px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Delete Document</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced AI Integration Status */}
                {document.processing_status === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-800 dark:text-green-300">
                        AI Ready
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                      This document has been processed and is available for AI-powered analysis and search.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Confirm Deletion
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Are you sure you want to delete <strong>"{document.title}"</strong>? This action cannot be undone and will permanently remove the document and all associated data.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transform hover:scale-105"
                  >
                    Delete Document
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 