import React from 'react';
import { Menu } from 'lucide-react';

interface TOCToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * TOC Toggle Button Component
 * Provides a button to show/hide the table of contents when it's not visible
 */
export const TOCToggleButton: React.FC<TOCToggleButtonProps> = ({
  isVisible,
  onClick,
  className = ''
}) => {
  if (isVisible) return null;
  
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 ${className}`}
      title="Show table of contents"
    >
      <Menu className="w-5 h-5" />
      <span className="sr-only">Show table of contents</span>
    </button>
  );
};

export default TOCToggleButton;