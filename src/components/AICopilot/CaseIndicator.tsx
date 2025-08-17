import React, { useState, useEffect } from 'react';
import { FileText, X, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PatientCase } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';

interface CaseIndicatorProps {
  activeCase: PatientCase | null;
  onViewCase?: () => void;
  onResetCase?: () => void;
  className?: string;
}

export const CaseIndicator: React.FC<CaseIndicatorProps> = ({
  activeCase,
  onViewCase,
  onResetCase,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (activeCase) {
      // Simulate case progress animation
      const timer = setTimeout(() => setProgress(75), 300);
      return () => clearTimeout(timer);
    }
  }, [activeCase]);

  if (!activeCase) return null;

  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className={`
        relative backdrop-blur-xl 
        bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/90 
        border border-blue-200/50 rounded-2xl p-4 mb-4 
        shadow-xl shadow-blue-500/10
        transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-blue-100/20 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="relative">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-semibold text-blue-900 truncate">
                {activeCase.title}
              </h4>
              {activeCase.metadata?.complexity && (
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getComplexityColor(activeCase.metadata.complexity)}`}
                >
                  {activeCase.metadata.complexity}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-blue-700/80 line-clamp-2 mb-3">
              {activeCase.description}
            </p>
            
            {/* Progress indicator */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span className="font-medium">Case Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {activeCase.metadata?.tags && activeCase.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activeCase.metadata.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-blue-100/50 text-blue-700 border-blue-300/50 backdrop-blur-sm"
                  >
                    {tag}
                  </Badge>
                ))}
                {activeCase.metadata.tags.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-100/50 text-blue-700 border-blue-300/50 backdrop-blur-sm"
                  >
                    +{activeCase.metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={`
          flex items-center space-x-2 transition-all duration-300
          ${isHovered ? 'opacity-100 transform translate-x-0' : 'opacity-70 transform translate-x-1'}
        `}>
          {onViewCase && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(E)
                e.preventDefault();
                e.stopPropagation();
                onViewCase();
              }}
              className="
                group relative p-2 h-9 w-9 rounded-xl 
                bg-blue-100/50 hover:bg-blue-200/70 
                text-blue-600 hover:text-blue-800 
                border border-blue-200/50 hover:border-blue-300
                transition-all duration-200 hover:scale-105
                backdrop-blur-sm shadow-lg hover:shadow-xl
              "
              title="View case details"
            >
              <Eye className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            </Button>
          )}
          
          {onResetCase && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(E)
                e.preventDefault();
                e.stopPropagation();
                setIsResetting(true);
                onResetCase();
                setTimeout(() => setIsResetting(false), 500);
              }}
              className={`
                group relative p-2 h-9 w-9 rounded-xl transition-all duration-200 
                backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105
                ${isResetting 
                  ? 'bg-red-200/70 text-red-700 border-red-300' 
                  : 'bg-red-100/50 hover:bg-red-200/70 text-red-600 hover:text-red-800 border border-red-200/50 hover:border-red-300'
                }
              `}
              title="Remove case and start fresh"
              disabled={isResetting}
            >
              <X className={`w-4 h-4 transition-transform duration-200 ${isResetting ? 'animate-spin' : 'group-hover:scale-110'}`} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Case metadata footer */}
      <div className="relative z-10 mt-3 pt-3 border-t border-blue-200/30 text-xs text-blue-600/80">
        <div className="flex items-center justify-between">
          <span className="font-medium">{t('case.activeCase')}</span>
          <span>Created {activeCase.createdAt.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}; 