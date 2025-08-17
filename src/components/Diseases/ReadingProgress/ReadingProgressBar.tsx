import React from 'react';

interface ReadingProgressBarProps {
  progress: number;
  className?: string;
}

/**
 * Reading Progress Bar Component
 * Displays a progress bar showing reading completion percentage
 */
export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ 
  progress, 
  className = '' 
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;