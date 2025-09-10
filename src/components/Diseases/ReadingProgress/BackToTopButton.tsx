import React from 'react';
import { ChevronUp } from 'lucide-react';

interface BackToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Back to Top Button Component
 * Provides a floating button to scroll back to the top of the page
 */
export const BackToTopButton: React.FC<BackToTopButtonProps> = ({ 
  isVisible, 
  onClick,
  className = ''
}) => {
  if (!isVisible) return null;
  
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 p-4 bg-[var(--cardiology-accent-blue-dark)] text-[var(--foreground)] rounded-full shadow-xl hover:bg-[var(--cardiology-accent-blue-dark)] transition-all duration-300 hover:scale-110 z-40 ${className}`}
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTopButton;