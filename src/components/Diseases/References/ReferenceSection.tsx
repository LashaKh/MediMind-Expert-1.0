import React from 'react';
import { BookOpen } from 'lucide-react';
import { ReferenceProps } from '../../../types/markdown-viewer';
import ReferenceLink from './ReferenceLink';
import { parseReferenceLine, isNumberedReference, generateReferenceKey, ParsedReferencePart } from './reference-utils';

/**
 * Reference Section Component
 * Renders a complete references section with styled links and numbered references
 */
export const ReferenceSection: React.FC<ReferenceProps> = ({ content }) => {
  const lines = content.split('\n');
  
  const renderReference = (line: string, index: number) => {
    // Skip empty lines
    if (!line.trim()) return null;
    
    const parsed = parseReferenceLine(line);
    
    // Render parts of the reference line
    const renderParts = (parts: ParsedReferencePart[]) => {
      return parts.map((part, partIndex) => {
        if (part.type === 'text') {
          return <span key={partIndex}>{part.content}</span>;
        } else if (part.type === 'bold') {
          return <strong key={partIndex}>{part.content}</strong>;
        } else if (part.type === 'link' && part.href) {
          return (
            <ReferenceLink
              key={generateReferenceKey(index, `link-${partIndex}`)}
              href={part.href}
              text={part.content}
              index={index}
              matchIndex={partIndex}
            />
          );
        }
        return null;
      });
    };
    
    // Render numbered reference
    if (parsed.number) {
      return (
        <div key={index} className="group relative mb-6 pl-16 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
          {/* Reference Number Badge */}
          <div className="absolute left-4 top-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <span className="text-white font-bold text-sm">{parsed.number}</span>
          </div>
          
          {/* Reference Content */}
          <div className="text-gray-800 leading-relaxed">
            <p className="text-base">{renderParts(parsed.parts)}</p>
          </div>
        </div>
      );
    }
    
    // Render non-numbered reference (like section headers)
    return (
      <div key={index} className="mb-4 text-gray-700">
        {renderParts(parsed.parts)}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* References Header */}
      <div className="mb-8 pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">References</h3>
            <p className="text-sm text-gray-600 mt-1">Click on any reference to view the source</p>
          </div>
        </div>
      </div>
      
      {/* Reference List */}
      <div className="space-y-4">
        {lines.map((line, index) => renderReference(line, index))}
      </div>
    </div>
  );
};

export default ReferenceSection;
