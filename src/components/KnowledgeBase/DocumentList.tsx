import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Upload, FileText, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { DocumentItem } from './DocumentItem';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

interface DocumentListProps {
  documents: DocumentWithMetadata[];
  isLoading: boolean;
  searchTerm: string;
  filterStatus: string;
  total: number;
  onDeleteDocument: (documentId: string, title: string) => Promise<void>;
  onViewDocument: (document: DocumentWithMetadata) => void;
  onDownloadDocument: (document: DocumentWithMetadata) => void;
  onUpload: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  searchTerm,
  filterStatus,
  total,
  onDeleteDocument,
  onViewDocument,
  onDownloadDocument,
  onUpload
}) => {
  const { t } = useTranslation();

  // Enhanced loading state with skeleton items
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 sm:p-6 animate-pulse">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced empty state
  if (documents.length === 0) {
    const isFiltered = searchTerm || filterStatus !== 'all';
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-8 sm:p-12 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            {isFiltered ? (
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 animate-pulse" />
            ) : (
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            )}
          </div>
          
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {isFiltered ? t('documents.list.noDocumentsFiltered') : t('documents.list.noDocuments')}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
            {isFiltered
              ? t('documents.list.adjustSearchCriteria')
              : t('documents.list.uploadFirstDocument')
            }
          </p>
          
          {!isFiltered && (
            <button
              onClick={onUpload}
              className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">{t('documents.list.uploadFirstButton')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Enhanced Document Count Header */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('documents.list.showing')} <span className="text-primary font-semibold">{documents.length}</span> {t('documents.list.of')}{' '}
            <span className="text-primary font-semibold">{total}</span> {t('documents.list.documents')}
          </div>
          {total > documents.length && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('documents.list.moreResultsAvailable')}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Documents List with staggered animations */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {documents.map((document, index) => (
          <div 
            key={document.id}
            className="animate-in slide-in-from-bottom-1 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <DocumentItem
              document={document}
              onDelete={() => onDeleteDocument(document.id, document.title)}
              onView={() => onViewDocument(document)}
              onDownload={() => onDownloadDocument(document)}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Footer for pagination hint */}
      {total > documents.length && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('documents.list.showingFirst', { count: documents.length.toString() })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 