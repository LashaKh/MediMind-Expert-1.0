import React from 'react';
import { BookOpen, X, Clock, Eye, Plus, Minus } from 'lucide-react';
import { TableOfContentsProps } from '../../../types/markdown-viewer';
import TOCItem from './TOCItem';

/**
 * Enhanced Table of Contents Component
 * Renders a sophisticated table of contents with medical functionality
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  items, 
  activeSection, 
  isVisible, 
  onItemClick, 
  onToggleVisibility,
  sections = [],
  onToggleSection,
  estimatedReadTime = 0,
  readingProgress = 0
}) => {
  if (!isVisible || items.length === 0) return null;
  
  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* TOC Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-semibold">Table of Contents</h3>
            </div>
            <button
              onClick={onToggleVisibility}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Close table of contents"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Reading Progress Info */}
          <div className="mt-3 flex items-center space-x-4 text-sm text-blue-100">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{estimatedReadTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{Math.round(readingProgress)}% complete</span>
            </div>
          </div>
        </div>

        {/* TOC Content */}
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
          <nav className="space-y-1">
            {items.map((item, index) => {
              const section = sections.find(s => s.id === item.id);
              const isCollapsed = section?.isCollapsed || false;
              const isMainSection = item.level <= 2;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <button
                    onClick={() => onItemClick(item.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    style={{ paddingLeft: `${item.level * 12 + 12}px` }}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activeSection === item.id ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-blue-400'
                    }`} />
                    <span className="text-sm font-medium truncate">{item.title}</span>
                  </button>
                  
                  {isMainSection && onToggleSection && (
                    <button
                      onClick={() => onToggleSection(item.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                      {isCollapsed ? (
                        <Plus className="w-3 h-3 text-gray-500" />
                      ) : (
                        <Minus className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;