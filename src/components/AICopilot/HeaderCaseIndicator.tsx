import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, Eye, ChevronDown, ChevronUp, User, Calendar, Tag, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { PatientCase } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';

interface HeaderCaseIndicatorProps {
  activeCase: PatientCase | null;
  onViewCase?: () => void;
  onResetCase?: () => void;
  className?: string;
}

export const HeaderCaseIndicator: React.FC<HeaderCaseIndicatorProps> = ({
  activeCase,
  onViewCase,
  onResetCase,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position when expanded
  useEffect(() => {
    if (isExpanded && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };

      updatePosition();

      // Update position on scroll and resize
      const handleUpdate = () => {
        if (buttonRef.current) {
          updatePosition();
        }
      };

      window.addEventListener('scroll', handleUpdate);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isExpanded]);

  if (!activeCase) return null;

  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low':
        return 'bg-emerald-400';
      case 'medium':
        return 'bg-amber-400';
      case 'high':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <>
      {/* Main Header Case Button */}
      <div 
        ref={buttonRef}
        className={`
          flex items-center space-x-2 sm:space-x-3 h-10 sm:h-11 px-4 sm:px-5 rounded-xl
          bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/60
          shadow-md backdrop-blur-xl
          hover:shadow-lg hover:border-blue-300/60
          transition-all duration-200 ease-out cursor-pointer
          ${isExpanded ? 'shadow-lg border-blue-300/60' : ''}
          ${className}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Case Icon with Status */}
        <div className="relative flex-shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          {/* Active indicator */}
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border border-white" />
          {/* Complexity indicator */}
          {activeCase.metadata?.complexity && (
            <div className={`
              absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white
              ${getComplexityColor(activeCase.metadata.complexity)}
            `} />
          )}
        </div>

        {/* Case Info */}
        <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-blue-800 truncate max-w-24 sm:max-w-32 lg:max-w-48 xl:max-w-64">
              {activeCase.title}
            </span>
            <Activity className="w-3 h-3 text-green-500 animate-pulse flex-shrink-0" />
          </div>
          <div className="flex items-center space-x-2 text-xs text-blue-600">
            <span className="font-medium hidden sm:inline">Active Case</span>
            <span className="font-medium sm:hidden">Active</span>
            <span className="text-blue-500">•</span>
            <span className="capitalize">{activeCase.specialty}</span>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-100/50"
            title={isExpanded ? "Collapse" : "Expand case details"}
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
              onClick={(E) => {
                e.stopPropagation();
                onResetCase();
              }}
              className="h-6 w-6 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Close case"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Portal-rendered Dropdown */}
      {isExpanded && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9999] bg-black/5"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Dropdown Content */}
          <div 
            className="
              fixed z-[10000]
              backdrop-blur-xl bg-gradient-to-b from-white/95 to-blue-50/90 
              border border-blue-200/60 rounded-2xl shadow-2xl shadow-blue-500/20
              animate-in slide-in-from-top-2 duration-300 ease-out
            "
            style={{ 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: Math.max(dropdownPosition.width, 320),
              maxWidth: '90vw'
            }}
          >
            <div className="p-4 space-y-3 max-w-sm">
              {/* Patient Info */}
              {(activeCase.patientName || activeCase.age || activeCase.gender) && (
                <div className="flex items-center space-x-2 text-xs bg-blue-50/50 rounded-lg p-2">
                  <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-700 font-medium">
                    {activeCase.patientName && `${activeCase.patientName} • `}
                    {activeCase.age && `${activeCase.age}y • `}
                    {activeCase.gender}
                  </span>
                </div>
              )}

              {/* Case Description */}
              <div className="text-xs text-gray-700 leading-relaxed bg-gray-50/50 rounded-lg p-2">
                <div className="font-medium text-gray-800 mb-1">Case Description</div>
                {activeCase.description}
              </div>

              {/* Chief Complaint */}
              {activeCase.chiefComplaint && (
                <div className="bg-amber-50/50 rounded-lg p-2">
                  <div className="text-xs font-medium text-amber-700 mb-1">Chief Complaint</div>
                  <div className="text-xs text-amber-600">{activeCase.chiefComplaint}</div>
                </div>
              )}

              {/* Tags */}
              {activeCase.metadata?.tags && activeCase.metadata.tags.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Tag className="w-3 h-3" />
                    <span className="font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeCase.metadata.tags.slice(0, 4).map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-0.5 bg-blue-100/70 text-blue-700 rounded-md text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {activeCase.metadata.tags.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                        +{activeCase.metadata.tags.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Created {activeCase.createdAt.toLocaleDateString()}</span>
                </div>
                
                {onViewCase && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(E) => {
                      e.stopPropagation();
                      onViewCase();
                      setIsExpanded(false);
                    }}
                    className="h-7 px-3 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default HeaderCaseIndicator;