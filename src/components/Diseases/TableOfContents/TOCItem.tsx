import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { TableOfContentsItem } from '../../../types/markdown-viewer';

interface TOCItemProps {
  item: TableOfContentsItem;
  isActive: boolean;
  isCollapsed?: boolean;
  canToggle?: boolean;
  onItemClick: (id: string) => void;
  onToggle?: (id: string) => void;
}

/**
 * Individual Table of Contents Item Component
 * Renders a single TOC item with appropriate styling and interactions
 */
export const TOCItem: React.FC<TOCItemProps> = ({ 
  item, 
  isActive, 
  isCollapsed = false, 
  canToggle = false, 
  onItemClick, 
  onToggle 
}) => {
  const isMainSection = item.level <= 2;
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onItemClick(item.id)}
        className={`flex-1 text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group ${
          isActive
            ? 'bg-[var(--cardiology-accent-blue-light)] text-blue-800 border-l-4 border-blue-600'
            : 'text-[var(--foreground-tertiary)] hover:bg-[var(--component-surface-primary)] hover:text-[var(--cardiology-accent-blue-dark)]'
        }`}
        style={{ paddingLeft: `${item.level * 12 + 12}px` }}
      >
        <div className={`w-2 h-2 rounded-full ${
          isActive ? 'bg-[var(--cardiology-accent-blue-dark)]' : 'bg-[var(--component-panel)] group-hover:bg-[var(--cardiology-accent-blue)]'
        }`} />
        <span className="text-sm font-medium truncate">{item.title}</span>
      </button>
      
      {isMainSection && canToggle && onToggle && (
        <button
          onClick={() => onToggle(item.id)}
          className="p-1 hover:bg-[var(--component-surface-secondary)] rounded transition-colors"
          title={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          {isCollapsed ? (
            <Plus className="w-3 h-3 text-[var(--foreground-secondary)]" />
          ) : (
            <Minus className="w-3 h-3 text-[var(--foreground-secondary)]" />
          )}
        </button>
      )}
    </div>
  );
};

export default TOCItem;