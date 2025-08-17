import React from 'react';
import { ChevronUp } from 'lucide-react';
import { ReadingProgressProps } from '../../../types/markdown-viewer';

/**
 * Reading Progress Component
 * Displays reading progress bar and back-to-top button
 */
export const ReadingProgress: React.FC<ReadingProgressProps> = ({
  progress,
  showBackToTop,
  onBackToTop
}) => {
  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={onBackToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
          title="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default ReadingProgress; 