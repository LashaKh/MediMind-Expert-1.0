import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Upload, FileText, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { DocumentItem } from './DocumentItem';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

// Group chunked documents together
interface DocumentGroup {
  id: string;
  isChunked: boolean;
  baseTitle: string;
  documents: DocumentWithMetadata[];
  totalParts?: number;
  isExpanded?: boolean;
}

// Utility function to group documents
const groupDocuments = (documents: DocumentWithMetadata[]): DocumentGroup[] => {
  console.log('🔍 GROUPING DEBUG: Starting to group documents:', documents.length);
  
  const chunkedGroups = new Map<string, DocumentWithMetadata[]>();
  const regularDocuments: DocumentWithMetadata[] = [];

  // Separate chunked and regular documents
  documents.forEach(doc => {
    console.log('📄 Checking document:', doc.title, 'Tags:', doc.tags);
    const isChunked = doc.tags?.includes('chunked-document');
    console.log('🧩 Is chunked?', isChunked);
    
    if (isChunked) {
      // Extract base title by removing " - Part X/Y"
      const baseTitle = doc.title.replace(/ - Part \d+\/\d+$/, '');
      console.log('📝 Base title extracted:', baseTitle);
      
      if (!chunkedGroups.has(baseTitle)) {
        chunkedGroups.set(baseTitle, []);
      }
      chunkedGroups.get(baseTitle)!.push(doc);
      console.log('✅ Added to chunked group:', baseTitle);
    } else {
      regularDocuments.push(doc);
      console.log('📋 Added to regular documents');
    }
  });

  const groups: DocumentGroup[] = [];

  // Add regular documents as individual groups
  regularDocuments.forEach(doc => {
    groups.push({
      id: doc.id,
      isChunked: false,
      baseTitle: doc.title,
      documents: [doc]
    });
  });

  // Add chunked document groups
  chunkedGroups.forEach((chunks, baseTitle) => {
    // Sort chunks by part number
    chunks.sort((a, b) => {
      const aPartMatch = a.title.match(/Part (\d+)\/\d+$/);
      const bPartMatch = b.title.match(/Part (\d+)\/\d+$/);
      const aPart = aPartMatch ? parseInt(aPartMatch[1]) : 0;
      const bPart = bPartMatch ? parseInt(bPartMatch[1]) : 0;
      return aPart - bPart;
    });

    const totalPartsMatch = chunks[0]?.title.match(/Part \d+\/(\d+)$/);
    const totalParts = totalPartsMatch ? parseInt(totalPartsMatch[1]) : chunks.length;

    groups.push({
      id: `chunked-${baseTitle}`,
      isChunked: true,
      baseTitle,
      documents: chunks,
      totalParts,
      isExpanded: false
    });
  });

  const sortedGroups = groups.sort((a, b) => {
    // Sort by latest document date in each group
    const aLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
    const bLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
    return bLatest - aLatest;
  });
  
  console.log('🎯 FINAL GROUPS:', sortedGroups.map(g => ({
    id: g.id,
    isChunked: g.isChunked,
    baseTitle: g.baseTitle,
    documentCount: g.documents.length
  })));
  
  return sortedGroups;
};

interface DocumentListProps {
  documents: DocumentWithMetadata[];
  isLoading: boolean;
  searchTerm: string;
  filterStatus: string;
  total: number;
  viewMode?: 'list' | 'grid';
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
  viewMode = 'list',
  onDeleteDocument,
  onViewDocument,
  onDownloadDocument,
  onUpload
}) => {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group documents
  const documentGroups = useMemo(() => groupDocuments(documents), [documents]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

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

      {/* Render based on view mode */}
      {viewMode === 'list' ? (
        /* List View - Enhanced Documents List with grouped chunked documents */
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {documentGroups.map((group, groupIndex) => (
            <div key={group.id} className="animate-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${groupIndex * 50}ms` }}>
              {group.isChunked ? (
                <>
                  {/* Chunked Document Group Header */}
                  <div className="px-4 sm:px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
                    <div 
                      className="flex items-center justify-between cursor-pointer group hover:bg-blue-100 dark:hover:bg-blue-900/30 -mx-4 px-4 py-2 rounded-md transition-colors"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors truncate">
                            {group.baseTitle}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {group.documents.length}/{group.totalParts} parts
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Chunked Document
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Group Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(group.documents[0]);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="View first part"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Chunk Items */}
                  {expandedGroups.has(group.id) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50">
                      {group.documents.map((document, index) => (
                        <div 
                          key={document.id}
                          className="border-l-4 border-blue-200 dark:border-blue-800"
                        >
                          <DocumentItem
                            document={document}
                            onDelete={() => onDeleteDocument(document.id, document.title)}
                            onView={() => onViewDocument(document)}
                            onDownload={() => onDownloadDocument(document)}
                            isChunkItem={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Regular Document Item */
                <DocumentItem
                  document={group.documents[0]}
                  onDelete={() => onDeleteDocument(group.documents[0].id, group.documents[0].title)}
                  onView={() => onViewDocument(group.documents[0])}
                  onDownload={() => onDownloadDocument(group.documents[0])}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Grid View - Grouped chunked documents in grid layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documentGroups.map((group, groupIndex) => (
            <div key={group.id} className="animate-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${groupIndex * 50}ms` }}>
              {group.isChunked ? (
                /* Chunked Document Group Card */
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header with icon and group info */}
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2">
                          {group.baseTitle}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {group.documents.length}/{group.totalParts} parts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chunked badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                        📚 Chunked Document
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDocument(group.documents[0])}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600"
                        title={expandedGroups.has(group.id) ? 'Hide parts' : 'Show all parts'}
                      >
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded parts list */}
                    {expandedGroups.has(group.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        {group.documents.map((document, index) => (
                          <div key={document.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                              Part {index + 1}
                            </span>
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => onViewDocument(document)}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="View this part"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Regular Document Card - Keep existing grid card design */
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2">
                          {group.documents[0].title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.documents[0].formattedSize} • {group.documents[0].formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDocument(group.documents[0])}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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