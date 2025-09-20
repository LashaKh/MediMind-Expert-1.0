import React from 'react';
import { Menu, Download, Share2, Printer } from 'lucide-react';
import SearchBar from './SearchBar';
import { ReadingStats } from '../ReadingProgress';

interface NavigationHeaderProps {
  title?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  estimatedReadTime: number;
  readingProgress: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onToggleTOC: () => void;
  onDownloadPDF: () => void;
  onShare: () => void;
  onPrint: () => void;
  showTOC: boolean;
}

/**
 * Navigation Header Component
 * Provides navigation controls and document actions
 */
export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  estimatedReadTime,
  readingProgress,
  bookmarked,
  onToggleBookmark,
  onToggleTOC,
  onDownloadPDF,
  onShare,
  onPrint,
  showTOC
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Title and TOC Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleTOC}
              className="p-2 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/10 to-[#2b6cb0]/10 hover:from-[#90cdf4]/20 hover:via-[#63b3ed]/20 hover:to-[#2b6cb0]/20 border border-[#63b3ed]/20 hover:border-[#63b3ed]/40 text-[#2b6cb0] dark:text-[#63b3ed] rounded-lg transition-colors"
              title={showTOC ? 'Hide table of contents' : 'Show table of contents'}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {title && (
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-lg mx-4">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              isSearchActive={Boolean(searchTerm)}
            />
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            <ReadingStats
              estimatedReadTime={estimatedReadTime}
              readingProgress={readingProgress}
              bookmarked={bookmarked}
              onToggleBookmark={onToggleBookmark}
              className="hidden md:flex"
            />
            
            <div className="flex items-center space-x-1">
              <button
                onClick={onDownloadPDF}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={onPrint}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;