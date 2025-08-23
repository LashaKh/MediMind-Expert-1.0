import React, { useState, useCallback, useEffect } from 'react';
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
  User,
  Eye,
  X
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
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);

  // Auto-center modal when opened
  useEffect(() => {
    if (selectedSource) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Scroll to center of viewport if needed
      const modalElement = document.querySelector('[data-modal="text-chunk"]');
      if (modalElement) {
        modalElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        });
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSource]);

  if (!sources || sources.length === 0) {
    return null;
  }

  const visibleSources = isExpanded ? sources : sources.slice(0, maxInitialDisplay);
  const hasMoreSources = sources.length > maxInitialDisplay;

  return (
    <>
      <div className={`mt-4 w-full ${className}`}>
        {/* Sources header with gradient background - Clickable to expand/collapse */}
        <div 
          className={`bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:via-gray-600 dark:hover:to-gray-700 transition-all duration-200 ${
            isSectionOpen ? 'rounded-t-xl' : 'rounded-xl'
          }`}
          onClick={() => setIsSectionOpen(!isSectionOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Link className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t('chat.sources')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sources.length} reference{sources.length !== 1 ? 's' : ''} found • Click to {isSectionOpen ? 'collapse' : 'view'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Show More/Less button only when section is open and has more sources */}
              {isSectionOpen && hasMoreSources && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the section toggle
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-blue-200 dark:border-blue-700 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  <span>{isExpanded ? t('chat.showLess') : t('chat.showMore')}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              
              {/* Main expand/collapse indicator */}
              <div className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                {isSectionOpen ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* Sources list - only show when section is open */}
        {isSectionOpen && (
          <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-600 rounded-b-xl w-full">
            <div className="divide-y divide-gray-100 dark:divide-gray-700 flex flex-col">
              {visibleSources.map((source, index) => {
              const sourceNumber = index + 1;
              const isHighlighted = highlightedSourceNumber === sourceNumber;
              
              return (
                <div
                  key={source.id}
                  className={`relative group transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 w-full block ${
                    isHighlighted 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' 
                      : ''
                  } ${index === 0 ? 'rounded-t-none' : ''} ${index === visibleSources.length - 1 && !hasMoreSources ? 'rounded-b-xl' : ''}`}
                  onMouseEnter={() => setHoveredSource(source.id)}
                  onMouseLeave={() => setHoveredSource(null)}
                  onClick={() => onSourceHighlight?.(isHighlighted ? null : sourceNumber)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Enhanced source number badge */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getSourceTypeColor(source.type)} ${
                        isHighlighted ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'shadow-sm'
                      } transition-all duration-200`}>
                        {getSourceIcon(source.type)}
                      </div>

                      {/* Source content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm flex items-center space-x-1 group flex-1 min-w-0 transition-colors duration-200"
                              >
                                <span className="truncate">{source.title || 'Medical Source'}</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-gray-900 dark:text-gray-100 font-medium text-sm block truncate flex-1">
                                {source.title || 'Medical Source'}
                              </span>
                            )}
                          </div>
                          
                          {/* Enhanced action buttons */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* View text chunk button */}
                            {(source.excerpt || source.type === 'personal') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSource(source);
                                }}
                                className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:shadow-sm"
                                title="View full text content"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Enhanced metadata row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(source.type)} ring-1 ring-inset ring-gray-500/10`}>
                              {source.type}
                            </span>
                            {source.type === 'personal' && source.vectorStoreContext?.retrievalMethod && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {source.vectorStoreContext.retrievalMethod}
                              </span>
                            )}
                          </div>
                          
                          {source.confidenceScore && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                {formatConfidenceScore(source.confidenceScore)}
                              </span>
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

                        {/* Enhanced excerpt preview */}
                        {showExcerpts && source.excerpt && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              <span className="text-gray-400 dark:text-gray-500">"</span>
                              {source.excerpt.length > 150 ? `${source.excerpt.slice(0, 150)}...` : source.excerpt}
                              <span className="text-gray-400 dark:text-gray-500">"</span>
                            </div>
                            {source.excerpt.length > 150 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSource(source);
                                }}
                                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors duration-200"
                              >
                                Read full content →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        
            {/* Collapsed sources indicator */}
            {!isExpanded && hasMoreSources && (
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>{sources.length - maxInitialDisplay} more reference{sources.length - maxInitialDisplay !== 1 ? 's' : ''} available</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Text Chunk Modal */}
      {selectedSource && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
          data-modal="text-chunk"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300 my-auto">
            {/* Enhanced Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    {getSourceIcon(selectedSource.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedSource.title || 'Medical Source'}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-blue-100 text-sm font-medium px-2 py-0.5 bg-white/20 rounded-full">
                        {selectedSource.type}
                      </span>
                      {selectedSource.confidenceScore && (
                        <div className="flex items-center space-x-1 text-green-200">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-sm font-semibold">
                            {Math.round(selectedSource.confidenceScore * 100)}% confidence
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSource(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>
            </div>
            
            {/* Enhanced Modal Content with Perfect Scrolling */}
            <div className="flex flex-col h-full max-h-[calc(85vh-140px)]">
              {/* Metadata Section */}
              {(selectedSource.documentMetadata || selectedSource.openaiFileId || selectedSource.confidenceScore) && (
                <div className="flex-shrink-0 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedSource.documentMetadata?.pageNumber && (
                      <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Page {selectedSource.documentMetadata.pageNumber}
                        </span>
                      </div>
                    )}
                    {selectedSource.documentMetadata?.uploadDate && (
                      <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(selectedSource.documentMetadata.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedSource.openaiFileId && (
                      <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        <Hash className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {selectedSource.openaiFileId.slice(0, 12)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Scrollable Text Content - Full Height */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6">
                  <div className="prose prose-base dark:prose-invert max-w-none">
                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap break-words">
                      {selectedSource.excerpt || 'No text content available for this source.'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              {selectedSource.url && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={selectedSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Original Source</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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