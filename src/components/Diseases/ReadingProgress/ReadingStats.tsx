import React from 'react';
import { Clock, Eye, Bookmark } from 'lucide-react';

interface ReadingStatsProps {
  estimatedReadTime: number;
  readingProgress: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  className?: string;
}

/**
 * Reading Stats Component
 * Displays reading statistics including estimated time and progress
 */
export const ReadingStats: React.FC<ReadingStatsProps> = ({
  estimatedReadTime,
  readingProgress,
  bookmarked,
  onToggleBookmark,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-4 text-sm text-[var(--foreground-tertiary)] ${className}`}>
      {/* Estimated Reading Time */}
      <div className="flex items-center space-x-1">
        <Clock className="w-4 h-4" />
        <span>{estimatedReadTime} min read</span>
      </div>
      
      {/* Reading Progress */}
      <div className="flex items-center space-x-1">
        <Eye className="w-4 h-4" />
        <span>{Math.round(readingProgress)}% read</span>
      </div>
      
      {/* Bookmark Toggle */}
      <button
        onClick={onToggleBookmark}
        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
          bookmarked 
            ? 'bg-[var(--cardiology-accent-blue-light)] text-[var(--cardiology-accent-blue-dark)] hover:bg-[var(--cardiology-accent-blue-medium)]' 
            : 'hover:bg-[var(--component-surface-secondary)]'
        }`}
        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
      </button>
    </div>
  );
};

export default ReadingStats;