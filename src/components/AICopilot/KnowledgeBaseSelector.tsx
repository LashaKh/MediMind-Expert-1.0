import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Info, ChevronDown, Database, Globe, Sparkles, CheckCircle, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';

export type KnowledgeBaseType = 'curated' | 'personal';

interface KnowledgeBaseSelectorProps {
  selectedKnowledgeBase: KnowledgeBaseType;
  onKnowledgeBaseChange: (type: KnowledgeBaseType) => void;
  personalDocumentCount?: number;
  disabled?: boolean;
  className?: string;
}

export const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({
  selectedKnowledgeBase,
  onKnowledgeBaseChange,
  personalDocumentCount = 0,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Check if we should show compact mobile version
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<KnowledgeBaseType | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, show: false });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  const knowledgeBaseOptions = [
    {
      type: 'curated' as KnowledgeBaseType,
      label: t('knowledge-base.curatedKnowledge'),
      description: t('knowledge-base.curatedKnowledgeDesc'),
      tooltipTitle: t('knowledge-base.curatedTooltipTitle', 'Medical Knowledge Base'),
      tooltipDesc: t('knowledge-base.curatedTooltipDesc', 'AI will answer using established cardiology knowledge from medical experts and trusted sources.'),
      icon: Globe,
      color: {
        gradient: 'from-[#1a365d] to-[#2b6cb0]',
        bg: 'from-[#1a365d]/10 to-[#2b6cb0]/10',
        border: 'border-[#63b3ed]/50',
        text: 'text-[#1a365d]',
        hover: 'hover:from-[#1a365d]/20 hover:to-[#2b6cb0]/20'
      },
      badge: t('knowledge-base.badgeVerified'),
      count: t('knowledge-base.sourcesCount')
    },
    {
      type: 'personal' as KnowledgeBaseType,
      label: t('knowledge-base.personalLibrary'),
      description: t('knowledge-base.personalLibraryDesc'),
      tooltipTitle: t('knowledge-base.personalTooltipTitle', 'Your Documents'),
      tooltipDesc: t('knowledge-base.personalTooltipDesc', 'AI will answer using information from your uploaded documents and personal files.'),
      icon: User,
      color: {
        gradient: 'from-[#2b6cb0] to-[#63b3ed]',
        bg: 'from-[#2b6cb0]/10 to-[#63b3ed]/10',
        border: 'border-[#90cdf4]/50',
        text: 'text-[#2b6cb0]',
        hover: 'hover:from-[#2b6cb0]/20 hover:to-[#63b3ed]/20'
      },
      badge: personalDocumentCount > 0 ? t('knowledge-base.badgeReady') : t('knowledge-base.badgeEmpty'),
      count: t('knowledge-base.personalCount', { count: personalDocumentCount || 0 })
    }
  ];

  const selectedOption = knowledgeBaseOptions.find(opt => opt.type === selectedKnowledgeBase);
  const SelectedIcon = selectedOption?.icon || Globe;

  const handleSelect = (type: KnowledgeBaseType) => {
    if (type === 'personal' && personalDocumentCount === 0) {
      return;
    }
    onKnowledgeBaseChange(type);
    setIsOpen(false);
  };

  // Handle tooltip positioning on hover
  const handleMouseEnter = (event: React.MouseEvent, option: KnowledgeBaseType) => {
    if (isMobile) return; // No tooltips on mobile
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 320; // Estimated tooltip width
    
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    
    // Keep tooltip within viewport
    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
    
    setTooltipPosition({
      top: rect.bottom + 12,
      left: left,
      show: true
    });
    setHoveredOption(option);
  };

  const handleMouseLeave = () => {
    setTooltipPosition(prev => ({ ...prev, show: false }));
    setHoveredOption(null);
  };

  // Use tabs instead of dropdown for better UX
  if (isMobile) {
    return (
      <div className={`flex bg-white/90 backdrop-blur-xl rounded-xl shadow-md border border-slate-200/60 overflow-hidden ${className}`}>
        {knowledgeBaseOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.type === selectedKnowledgeBase;
          const isDisabled = option.type === 'personal' && personalDocumentCount === 0;
          
          return (
            <button
              key={option.type}
              onClick={() => !isDisabled && onKnowledgeBaseChange(option.type)}
              disabled={disabled || isDisabled}
              className={`
                group relative flex-1 min-h-[56px] px-3 py-3 transition-all duration-200
                ${isSelected 
                  ? `bg-gradient-to-br ${option.color.bg} ${option.color.border} border-2` 
                  : 'border-2 border-transparent hover:bg-white/60'
                }
                ${disabled || isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              `}
              title={`${option.label} - ${option.badge}`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className={`w-5 h-5 ${isSelected ? option.color.text : 'text-slate-600'} transition-colors duration-200`} />
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                )}
              </div>
              
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1">
                <div className={`
                  w-3 h-3 rounded-full border-2 border-white shadow-sm
                  ${option.type === 'curated' 
                    ? 'bg-[#2b6cb0]' 
                    : personalDocumentCount > 0
                      ? 'bg-[#63b3ed]'
                      : 'bg-amber-500'
                  }
                `} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className={`relative z-[100] ${className}`} ref={dropdownRef}>
      {/* Desktop: Clear tab-style selector */}
      <div className="flex bg-white/95 backdrop-blur-xl rounded-xl shadow-md border border-slate-200/60 overflow-hidden">
        {knowledgeBaseOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.type === selectedKnowledgeBase;
          const isDisabled = option.type === 'personal' && personalDocumentCount === 0;
          
          return (
            <button
              key={option.type}
              onClick={() => !isDisabled && onKnowledgeBaseChange(option.type)}
              onMouseEnter={(e) => handleMouseEnter(e, option.type)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled || isDisabled}
              className={`
                group relative flex-1 min-h-[56px] px-6 py-4 transition-all duration-200
                ${isSelected 
                  ? `bg-gradient-to-br ${option.color.bg} border-b-4 ${option.color.border}` 
                  : 'border-b-4 border-transparent hover:bg-white/60 hover:border-b-slate-200'
                }
                ${disabled || isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset
              `}
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${isSelected 
                    ? `bg-gradient-to-br ${option.color.bg} border ${option.color.border} shadow-md` 
                    : 'bg-slate-100 border border-slate-200'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isSelected ? option.color.text : 'text-slate-600'} transition-colors duration-200`} />
                </div>
                
                {/* Content */}
                <div className="flex flex-col items-start min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-bold ${isSelected ? option.color.text : 'text-slate-700'} transition-colors duration-200`}>
                      {option.label}
                    </span>
                    <div className={`
                      px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border
                      ${isSelected 
                        ? `bg-gradient-to-r ${option.color.gradient.replace('from-', 'from-').replace('to-', '/20 to-')} text-white border-white/20`
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                      }
                    `}>
                      {option.badge}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-1">
                    {option.count}
                  </span>
                </div>
              </div>
              
              {/* Active indicator */}
              {isSelected && (
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.color.gradient} opacity-5 pointer-events-none`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Beautiful Tooltip */}
      {tooltipPosition.show && hoveredOption && !isMobile && createPortal(
        <div
          className="fixed z-[200] pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: '320px'
          }}
        >
          <div className="relative">
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 rotate-45 bg-white border-l border-t border-slate-200/60"></div>
            </div>
            
            {/* Tooltip Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-900/20 p-6">
              {(() => {
                const option = knowledgeBaseOptions.find(opt => opt.type === hoveredOption);
                if (!option) return null;
                
                const Icon = option.icon;
                
                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color.gradient} shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {option.tooltipTitle}
                        </h3>
                        <div className={`
                          inline-flex px-3 py-1 rounded-full text-xs font-bold
                          bg-gradient-to-r ${option.color.gradient} text-white shadow-sm
                        `}>
                          {option.badge}
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="text-sm text-slate-600 leading-relaxed">
                      {option.tooltipDesc}
                    </div>
                    
                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        {option.count}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}; 