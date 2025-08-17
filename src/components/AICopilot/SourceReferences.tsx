import React, { useState, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  FileText, 
  Link, 
  BookOpen, 
  Database,
  Copy,
  Calendar,
  Hash,
  Tag,
  TrendingUp,
  User
} from 'lucide-react';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { SourceReference } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';

interface SourceReferencesProps {
  sources: SourceReference[];
  className?: string;
  maxInitialDisplay?: number;
  showExcerpts?: boolean;
  highlightedSourceNumber?: number | null;
  onSourceHighlight?: (sourceNumber: number | null) => void;
}

const getSourceIcon = (type: SourceReference['type']) => {
  switch (type) {
    case 'guideline':
      return <BookOpen className="w-3 h-3" />;
    case 'research':
      return <FileText className="w-3 h-3" />;
    case 'document':
      return <FileText className="w-3 h-3" />;
    case 'textbook':
      return <BookOpen className="w-3 h-3" />;
    case 'personal':
      return <Database className="w-3 h-3" />;
    default:
      return <Link className="w-3 h-3" />;
  }
};

const getSourceTypeColor = (type: SourceReference['type']) => {
  switch (type) {
    case 'guideline':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'research':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'document':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'textbook':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'personal':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatConfidenceScore = (score?: number): string => {
  if (score === undefined) return '';
  return `${Math.round(score * 100)}%`;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

const copyToClipboard = async (text: string) => {
  const [, error] = await safeAsync(
    () => navigator.clipboard.writeText(text),
    {
      context: 'copy source reference to clipboard',
      severity: ErrorSeverity.LOW
    }
  );
  
  // Note: We don't show error messages for clipboard operations
  // as they're not critical and may fail due to permissions
};

export const SourceReferences: React.FC<SourceReferencesProps> = ({
  sources,
  className = '',
  maxInitialDisplay = 3,
  showExcerpts = true,
  highlightedSourceNumber,
  onSourceHighlight
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  const visibleSources = isExpanded ? sources : sources.slice(0, maxInitialDisplay);
  const hasMoreSources = sources.length > maxInitialDisplay;

  return (
    <div className={`mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 ${className}`}>
      {/* Sources header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center space-x-1">
          <Link className="w-3 h-3" />
          <span>{t('chat.sources')} ({sources.length})</span>
        </div>
        
        {hasMoreSources && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>{isExpanded ? t('chat.showLess') : t('chat.showMore')}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Sources list */}
      <div className="space-y-2">
        {visibleSources.map((source, index) => {
          const sourceNumber = index + 1;
          const isHighlighted = highlightedSourceNumber === sourceNumber;
          
          return (
            <div
              key={source.id}
              className={`relative group transition-all duration-200 ${
                isHighlighted 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2 -m-1' 
                  : ''
              }`}
              onMouseEnter={() => setHoveredSource(source.id)}
              onMouseLeave={() => setHoveredSource(null)}
              onClick={() => onSourceHighlight?.(isHighlighted ? null : sourceNumber)}
            >
              <div className="flex items-start space-x-2 text-xs">
                {/* Source number badge */}
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getSourceTypeColor(source.type)} ${
                  isHighlighted ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
                }`}>
                  <span className="mr-1">{getSourceIcon(source.type)}</span>
                  {sourceNumber}
                </span>

                {/* Source content */}
                <div className="flex-1 min-w-0">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 group"
                    >
                      <span className="truncate">{source.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300 block truncate">{source.title}</span>
                  )}

                  {/* Source type indicator and confidence score */}
                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="text-gray-400 dark:text-gray-500 capitalize">
                      {source.type}
                      {source.type === 'personal' && source.vectorStoreContext?.retrievalMethod && (
                        <span className="ml-1 text-gray-300 dark:text-gray-600">
                          • {source.vectorStoreContext.retrievalMethod}
                        </span>
                      )}
                    </span>
                    
                    {source.confidenceScore && (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">{formatConfidenceScore(source.confidenceScore)}</span>
                      </div>
                    )}
                  </div>

                  {/* OpenAI Vector Store metadata for personal documents */}
                  {source.type === 'personal' && (source.openaiFileId || source.documentMetadata) && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs space-y-1">
                      {/* OpenAI File ID */}
                      {source.openaiFileId && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                            <Hash className="w-3 h-3" />
                            <span>File ID:</span>
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                              {source.openaiFileId.slice(0, 12)}...
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(source.openaiFileId!)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Copy File ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Document metadata */}
                      {source.documentMetadata && (
                        <div className="space-y-1">
                          {source.documentMetadata.uploadDate && (
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                              <Calendar className="w-3 h-3" />
                              <span>Uploaded:</span>
                              <span>{new Date(source.documentMetadata.uploadDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {source.documentMetadata.fileSize && (
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                              <FileText className="w-3 h-3" />
                              <span>Size:</span>
                              <span>{formatFileSize(source.documentMetadata.fileSize)}</span>
                            </div>
                          )}

                          {source.documentMetadata.pageNumber && (
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                              <span>Page {source.documentMetadata.pageNumber}</span>
                              {source.chunkIndex && (
                                <span className="text-gray-400">• Chunk {source.chunkIndex}</span>
                              )}
                            </div>
                          )}

                          {source.documentMetadata.sectionTitle && (
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                              <span>Section:</span>
                              <span className="italic">{source.documentMetadata.sectionTitle}</span>
                            </div>
                          )}

                          {source.documentMetadata.tags && source.documentMetadata.tags.length > 0 && (
                            <div className="flex items-start space-x-1 text-gray-600 dark:text-gray-300">
                              <Tag className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {source.documentMetadata.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vector Store context */}
                      {source.vectorStoreContext?.namespace && (
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-600">
                          <User className="w-3 h-3" />
                          <span>Namespace:</span>
                          <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                            {source.vectorStoreContext.namespace}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Excerpt */}
                  {showExcerpts && source.excerpt && (
                    <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs italic">
                      "{source.excerpt.length > 120 ? `${source.excerpt.slice(0, 120)}...` : source.excerpt}"
                    </div>
                  )}
                </div>
              </div>

              {/* Hover preview */}
              {hoveredSource === source.id && source.excerpt && source.excerpt.length > 120 && (
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg z-10 max-w-md">
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">
                    {source.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    "{source.excerpt}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsed sources indicator */}
      {!isExpanded && hasMoreSources && (
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {sources.length - maxInitialDisplay} more source{sources.length - maxInitialDisplay !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
};

// Inline source reference component for use within message text
export const InlineSourceReference: React.FC<{
  sourceNumber: number;
  source: SourceReference;
  className?: string;
}> = ({ sourceNumber, source, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <sup className={`text-xs font-medium cursor-pointer ${getSourceTypeColor(source.type)} px-1 py-0.5 rounded ml-0.5`}>
        [{sourceNumber}]
      </sup>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {source.title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
};

export default SourceReferences; 