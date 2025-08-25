import React from 'react';
import { FileText, Eye, Download, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

interface DocumentItemProps {
  document: DocumentWithMetadata;
  onDelete: () => void;
  onView: () => void;
  onDownload: () => void;
  isChunkItem?: boolean;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  onDelete,
  onView,
  onDownload,
  isChunkItem = false
}) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group ${isChunkItem ? 'pl-8 bg-gray-25 dark:bg-gray-800' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* File Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors duration-200">
              {document.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all sm:break-normal">
              <span className="font-medium">{document.file_name}</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">{document.formattedSize} • {document.formattedDate}</span>
            </p>
            {document.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                {document.description}
              </p>
            )}
            
            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {document.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-150"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {t('documents.item.moreTagsIndicator', { count: (document.tags.length - 3).toString() })}
                  </span>
                )}
              </div>
            )}

            {/* Error Message */}
            {document.processing_status === 'failed' && document.error_message && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top-1 duration-300">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>{t('documents.item.processingError')}:</strong> {document.error_message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 ml-3 sm:ml-4 flex-shrink-0">
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${document.statusColor} hover:scale-105`}>
              {document.processing_status === 'completed' ? t('documents.item.statusLabels.completed') : 
               document.processing_status === 'processing' ? t('documents.item.statusLabels.processing') :
               document.processing_status === 'pending' ? t('documents.item.statusLabels.pending') :
               document.processing_status === 'failed' ? t('documents.item.statusLabels.failed') : document.processing_status}
            </span>

            {/* Processing Indicator */}
            {document.processing_status === 'processing' && (
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              title={t('documents.item.viewDetails')}
              onClick={onView}
              disabled={document.processing_status === 'processing'}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={t('documents.item.viewDetails')}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              title={t('documents.item.downloadDocument')}
              onClick={onDownload}
              disabled={document.processing_status === 'processing'}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              aria-label={t('documents.item.downloadDocument')}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              title={t('documents.item.deleteDocument')}
              onClick={onDelete}
              disabled={!document.canDelete}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label={t('documents.item.deleteDocument')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 