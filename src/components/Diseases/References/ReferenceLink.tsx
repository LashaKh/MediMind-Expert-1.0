import React from 'react';

interface ReferenceLinkProps {
  href: string;
  text: string;
  index: number;
  matchIndex: number;
}

/**
 * Individual Reference Link Component
 * Renders a styled link with appropriate icons based on link type
 */
export const ReferenceLink: React.FC<ReferenceLinkProps> = ({ href, text, index, matchIndex }) => {
  const isPubMed = text.toLowerCase().includes('pubmed') || href.includes('pubmed.ncbi');
  const isDOI = text.toLowerCase().includes('doi') || href.includes('doi.org');
  const isFullText = text.toLowerCase().includes('full text') || text.toLowerCase().includes('open');

  const getStyleClasses = () => {
    if (isPubMed) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700';
    if (isDOI) return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700';
    if (isFullText) return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700';
    return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700';
  };

  const renderIcon = () => {
    if (isPubMed) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17v-2h2v2h-2zm2.07-7.75l-.9.92C11.45 12.9 11 13.5 11 15h2c0-.88.3-1.96.92-2.66l1.24-1.26c.37-.36.6-.86.6-1.41 0-1.31-1.06-2.37-2.37-2.37-1.31 0-2.37 1.06-2.37 2.37h1.98c0-.21.17-.38.38-.38s.39.17.39.38c0 .08-.05.2-.15.29z"/>
        </svg>
      );
    }
    if (isDOI) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      );
    }
    if (isFullText) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <a
      key={`${index}-${matchIndex}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm
        transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5
        ${getStyleClasses()}
      `}
    >
      {renderIcon()}
      <span className="font-semibold">{text}</span>
      <svg className="w-3.5 h-3.5 opacity-80" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
      </svg>
    </a>
  );
};

export default ReferenceLink;