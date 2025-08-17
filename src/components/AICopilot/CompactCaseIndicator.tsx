import React, { useState } from 'react';
import { FileText, X, Eye, ChevronDown, ChevronUp, User, Calendar, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { PatientCase } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';

interface CompactCaseIndicatorProps {
  activeCase: PatientCase | null;
  onViewCase?: () => void;
  onResetCase?: () => void;
  className?: string;
}

export const CompactCaseIndicator: React.FC<CompactCaseIndicatorProps> = ({
  activeCase,
  onViewCase,
  onResetCase,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!activeCase) return null;

  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low':
        return 'bg-emerald-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`
      fixed top-20 right-2 sm:right-4 z-50 
      max-w-80 transition-all duration-500 ease-out
      transform hover:scale-[1.02] animate-in slide-in-from-right-5 fade-in duration-700
      ${isExpanded ? 'w-80 sm:w-80' : 'w-72 sm:w-64'}
      ${className}
    `}>
      <div className="relative">
        {/* Main compact indicator */}
        <div className={`
          backdrop-blur-xl bg-gradient-to-br from-white/95 via-white/90 to-blue-50/90 
          border border-white/60 rounded-2xl shadow-2xl shadow-blue-500/10
          transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-200/40
          ${isExpanded ? 'rounded-b-none' : ''}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Case icon with complexity indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                {activeCase.metadata?.complexity && (
                  <div className={`
                    absolute -top-1 -right-1 w-3 h-3 rounded-full
                    ${getComplexityColor(activeCase.metadata.complexity)}
                    border-2 border-white
                  `} />
                )}
              </div>

              {/* Case title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {activeCase.title}
                  </h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  Active Case • {activeCase.specialty}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 p-0 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>

              {onResetCase && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(E)evel:** (E)
                    e.stopPropagation();
                    onResetCase();
                  }}
                  className="h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Close case"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="
            backdrop-blur-xl bg-gradient-to-b from-white/95 to-blue-50/90 
            border-x border-b border-white/60 rounded-b-2xl shadow-2xl shadow-blue-500/10
            transition-all duration-300 ease-out animate-in slide-in-from-top-2
          ">
            <div className="p-4 pt-0 space-y-3">
              {/* Patient info */}
              {(activeCase.patientName || activeCase.age || activeCase.gender) && (
                <div className="flex items-center space-x-2 text-xs">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">
                    {activeCase.patientName && `${activeCase.patientName} • `}
                    {activeCase.age && `${activeCase.age}y • `}
                    {activeCase.gender}
                  </span>
                </div>
              )}

              {/* Case description */}
              <div className="text-xs text-gray-600 leading-relaxed">
                {activeCase.description}
              </div>

              {/* Chief complaint */}
              {activeCase.chiefComplaint && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs font-medium text-blue-700 mb-1">Chief Complaint</div>
                  <div className="text-xs text-blue-600">{activeCase.chiefComplaint}</div>
                </div>
              )}

              {/* Tags */}
              {activeCase.metadata?.tags && activeCase.metadata.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {activeCase.metadata.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {activeCase.metadata.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                        +{activeCase.metadata.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Case metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Created {activeCase.createdAt.toLocaleDateString()}</span>
                </div>
                
                {onViewCase && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewCase}
                    className="h-7 px-3 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating indicator when collapsed */}
        {!isExpanded && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* Backdrop click area when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default CompactCaseIndicator;