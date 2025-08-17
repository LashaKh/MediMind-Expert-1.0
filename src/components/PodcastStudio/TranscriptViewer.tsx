import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface TranscriptEntry {
  id: string;
  speaker: 'host1' | 'host2';
  text: string;
  startTime: number;
  endTime: number;
  highlighted?: boolean;
}

interface TranscriptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  transcript?: TranscriptEntry[] | string;
  currentTime?: number;
  onSeek?: (time: number) => void;
  podcastTitle?: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  isOpen,
  onClose,
  transcript,
  currentTime = 0,
  onSeek,
  podcastTitle
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedEntries, setHighlightedEntries] = useState<string[]>([]);
  const activeEntryRef = useRef<HTMLDivElement>(null);

  // Parse transcript if it's a string
  const parsedTranscript: TranscriptEntry[] = React.useMemo(() => {
    if (!transcript) return [];
    
    if (typeof transcript === 'string') {
      // Simple parsing for string format
      const lines = transcript.split('\n').filter(line => line.trim());
      return lines.map((line, index) => {
        const speakerMatch = line.match(/^(Host 1|Host 2|Dr\. \w+):\s*(.+)$/);
        return {
          id: `entry-${index}`,
          speaker: speakerMatch?.[1]?.includes('1') || speakerMatch?.[1]?.startsWith('Dr') ? 'host1' : 'host2',
          text: speakerMatch?.[2] || line,
          startTime: index * 10, // Estimated timing
          endTime: (index + 1) * 10,
        };
      });
    }
    
    return transcript as TranscriptEntry[];
  }, [transcript]);

  // Find current active entry based on time
  const activeEntryId = React.useMemo(() => {
    const currentEntry = parsedTranscript.find(
      entry => currentTime >= entry.startTime && currentTime <= entry.endTime
    );
    return currentEntry?.id;
  }, [parsedTranscript, currentTime]);

  // Filter transcript by search term
  const filteredTranscript = React.useMemo(() => {
    if (!searchTerm) return parsedTranscript;
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = parsedTranscript.filter(entry =>
      entry.text.toLowerCase().includes(searchLower)
    );
    
    // Update highlighted entries
    setHighlightedEntries(filtered.map(entry => entry.id));
    
    return filtered;
  }, [parsedTranscript, searchTerm]);

  // Auto-scroll to active entry
  useEffect(() => {
    if (activeEntryId && activeEntryRef.current) {
      activeEntryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeEntryId]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEntryClick = (entry: TranscriptEntry) => {
    if (onSeek) {
      onSeek(entry.startTime);
    }
  };

  const handleDownload = () => {
    const content = parsedTranscript
      .map(entry => {
        const speakerName = entry.speaker === 'host1' ? 'Host 1' : 'Host 2';
        const timestamp = `[${formatTime(entry.startTime)}]`;
        return `${timestamp} ${speakerName}: ${entry.text}`;
      })
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${podcastTitle || 'podcast'}-transcript.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const content = parsedTranscript
      .map(entry => `${entry.speaker === 'host1' ? 'Host 1' : 'Host 2'}: ${entry.text}`)
      .join('\n\n');

    if (navigator.share) {
      const [, error] = await safeAsync(
        async () => {
          await navigator.share({
            title: `${podcastTitle} - Transcript`,
            text: content
          });
        },
        {
          context: 'share podcast transcript via native sharing',
          severity: ErrorSeverity.LOW
        }
      );
      // Share cancellation is expected behavior, so we don't need to handle the error
    } else {
      await navigator.clipboard.writeText(content);
      // Could show a toast notification here
    }
  };

  const getSpeakerInfo = (speaker: 'host1' | 'host2') => {
    return speaker === 'host1' 
      ? { name: 'Dr. Sarah Chen', color: 'text-purple-600', bg: 'bg-purple-100' }
      : { name: 'Dr. Michael Rodriguez', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('podcast.transcript.title')}
                  </h2>
                  {podcastTitle && (
                    <p className="text-sm text-gray-600">
                      {podcastTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                  title={t('podcast.transcript.download')}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  title={t('podcast.transcript.share')}
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('podcast.transcript.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  {t('podcast.transcript.search.results', { 
                    count: filteredTranscript.length,
                    total: parsedTranscript.length 
                  })}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
              {parsedTranscript.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mb-3" />
                  <p className="text-lg font-medium mb-1">
                    {t('podcast.transcript.empty.title')}
                  </p>
                  <p className="text-sm">
                    {t('podcast.transcript.empty.description')}
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {filteredTranscript.map((entry) => {
                    const speakerInfo = getSpeakerInfo(entry.speaker);
                    const isActive = entry.id === activeEntryId;
                    const isHighlighted = highlightedEntries.includes(entry.id);
                    
                    return (
                      <motion.div
                        key={entry.id}
                        ref={isActive ? activeEntryRef : undefined}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          group flex space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200
                          ${isActive
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 shadow-sm'
                            : isHighlighted
                              ? 'bg-yellow-50 border border-yellow-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }
                        `}
                        onClick={() => handleEntryClick(entry)}
                      >
                        {/* Speaker Avatar */}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                          ${entry.speaker === 'host1' 
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }
                        `}>
                          {entry.speaker === 'host1' ? 'SC' : 'MR'}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Speaker Name & Time */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${speakerInfo.color}`}>
                              {speakerInfo.name}
                            </span>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatTime(entry.startTime)}</span>
                              {onSeek && (
                                <SpeakerWaveIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              )}
                            </div>
                          </div>

                          {/* Text */}
                          <p className="text-gray-700 leading-relaxed">
                            {searchTerm ? (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: entry.text.replace(
                                    new RegExp(`(${searchTerm})`, 'gi'),
                                    '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                  )
                                }}
                              />
                            ) : (
                              entry.text
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {parsedTranscript.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>
                      {t('podcast.transcript.stats.entries', { count: parsedTranscript.length })}
                    </span>
                    {currentTime > 0 && (
                      <span>
                        {t('podcast.transcript.stats.currentTime', { time: formatTime(currentTime) })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full"></div>
                      <span>Dr. Sarah Chen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full"></div>
                      <span>Dr. Michael Rodriguez</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranscriptViewer;