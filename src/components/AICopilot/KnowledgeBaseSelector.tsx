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
  // Debug logging

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<KnowledgeBaseType | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
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
      label: t('knowledgeBase.curatedKnowledge'),
      description: t('knowledgeBase.curatedKnowledgeDesc'),
      icon: Globe,
      color: {
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'from-blue-500/10 to-indigo-500/10',
        border: 'border-blue-200/50',
        text: 'text-blue-700',
        hover: 'hover:from-blue-500/20 hover:to-indigo-500/20'
      },
      badge: t('knowledgeBase.badgeVerified'),
      count: t('knowledgeBase.sourcesCount')
    },
    {
      type: 'personal' as KnowledgeBaseType,
      label: t('knowledgeBase.personalLibrary'),
      description: t('knowledgeBase.personalLibraryDesc'),
      icon: User,
      color: {
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'from-emerald-500/10 to-teal-500/10',
        border: 'border-emerald-200/50',
        text: 'text-emerald-700',
        hover: 'hover:from-emerald-500/20 hover:to-teal-500/20'
      },
      badge: personalDocumentCount > 0 ? t('knowledgeBase.badgeReady') : t('knowledgeBase.badgeEmpty'),
      count: personalDocumentCount > 0 
        ? t('knowledgeBase.personalCount', { count: String(personalDocumentCount) })
        : t('knowledgeBase.uploadToEnable')
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

  return (
    <div className={`relative z-[100] ${className}`} ref={dropdownRef}>
      {/* Premium Selector Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          group relative h-10 sm:h-11 px-4 sm:px-5 rounded-xl
          bg-gradient-to-r from-white/95 to-slate-50/95 border border-slate-200/60
          shadow-md backdrop-blur-xl
          hover:shadow-lg hover:border-slate-300/60
          transition-all duration-200 ease-out
          ${isOpen ? 'shadow-lg border-blue-200/60' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
        `}
        ref={buttonRef}
      >
        {/* Sophisticated Background Effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
          bg-gradient-to-r ${selectedOption?.color.bg}
          ${isOpen ? 'opacity-100' : 'group-hover:opacity-60'}
        `} />
        
        <div className="relative flex items-center space-x-4 min-w-0">
          {/* Enhanced Icon Container */}
          <div className={`
            relative p-2.5 rounded-xl
            bg-gradient-to-br ${selectedOption?.color.bg}
            border ${selectedOption?.color.border}
            shadow-md transition-all duration-300
            ${isOpen ? 'scale-110 rotate-6 shadow-lg' : 'group-hover:scale-105 group-hover:rotate-3'}
          `}>
            <SelectedIcon className={`w-5 h-5 ${selectedOption?.color.text} relative z-10 transition-transform duration-300`} />
            <div className={`
              absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
              bg-gradient-to-br ${selectedOption?.color.gradient}
              ${isOpen ? 'opacity-25' : 'group-hover:opacity-15'}
            `} />
            
            {/* Premium shine effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Refined Label and Status */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center space-x-3 mb-0.5">
              <span className="text-sm font-bold text-slate-700 truncate">
                {selectedOption?.label}
              </span>
              <div className={`
                px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
                ${selectedOption?.type === 'curated' 
                  ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50' 
                  : personalDocumentCount > 0
                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50'
                    : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50'
                }
              `}>
                {selectedOption?.badge}
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium truncate">
              {selectedOption?.count}
            </span>
          </div>

          {/* Enhanced Dropdown Arrow */}
          <div className="flex-shrink-0">
            <ChevronDown className={`
              w-4 h-4 transition-all duration-300
              ${isOpen ? 'rotate-180 text-blue-600 scale-110' : 'text-slate-500 group-hover:text-slate-700'}
            `} />
          </div>
        </div>
      </Button>

      {/* Premium Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <>
          {/* Enhanced Backdrop Overlay */}
          <div 
            className="fixed inset-0 z-[9998] bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            ref={dropdownRef}
            className={`
              fixed z-[9999]
              backdrop-blur-3xl bg-white/98 border border-slate-200/60
              rounded-3xl shadow-2xl shadow-slate-900/10 p-3
              animate-in slide-in-from-top-4 zoom-in-95 duration-300
            `}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 360)}px`,
              maxWidth: '90vw'
            }}
          >
            {/* Sophisticated Background Effects */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/3 via-indigo-500/2 to-purple-500/3" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-conic from-slate-100/50 via-white/30 to-slate-100/50 opacity-40" />
            
            {knowledgeBaseOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = option.type === selectedKnowledgeBase;
              const isDisabled = option.type === 'personal' && personalDocumentCount === 0;
              const isHovered = hoveredOption === option.type;

              return (
                <div
                  key={option.type}
                  className={`
                    relative p-5 rounded-2xl cursor-pointer mb-2 last:mb-0
                    transition-all duration-300 ease-out
                    ${isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-[1.02] hover:-translate-y-0.5'
                    }
                    ${isSelected 
                      ? `bg-gradient-to-r ${option.color.bg} border-2 ${option.color.border} shadow-lg shadow-${option.color.text.split('-')[1]}-500/20` 
                      : isHovered && !isDisabled
                        ? `bg-gradient-to-r ${option.color.hover} border-2 ${option.color.border} shadow-md`
                        : 'border-2 border-transparent hover:border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50'
                    }
                  `}
                  onClick={() => !isDisabled && handleSelect(option.type)}
                  onMouseEnter={() => setHoveredOption(option.type)}
                  onMouseLeave={() => setHoveredOption(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Premium Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className={`
                        p-1.5 rounded-full bg-gradient-to-r ${option.color.gradient}
                        shadow-lg shadow-${option.color.text.split('-')[1]}-500/30
                        animate-in zoom-in-50 duration-300
                      `}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-5">
                    {/* Enhanced Icon */}
                    <div className={`
                      relative p-4 rounded-2xl
                      bg-gradient-to-br ${option.color.bg}
                      border-2 ${option.color.border}
                      shadow-lg transition-all duration-300
                      ${isHovered && !isDisabled ? 'scale-110 rotate-6 shadow-xl' : 'shadow-md'}
                    `}>
                      <Icon className={`w-6 h-6 ${option.color.text} relative z-10 transition-transform duration-300`} />
                      {isDisabled && (
                        <div className="absolute inset-0 rounded-2xl bg-slate-500/30 flex items-center justify-center backdrop-blur-sm">
                          <Lock className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                      
                      {/* Premium shine effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Enhanced Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`text-base font-bold ${option.color.text}`}>
                          {option.label}
                        </h4>
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-bold shadow-sm border
                          ${option.type === 'curated' 
                            ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200/60' 
                            : personalDocumentCount > 0
                              ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200/60'
                          }
                        `}>
                          {option.badge}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed mb-3 font-medium">
                        {option.description}
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 font-semibold">
                            {option.count}
                          </span>
                        </div>
                        {option.type === 'curated' && (
                          <>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-600 font-semibold">{t('knowledgeBase.aiVerified')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sophisticated Hover Effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
                    bg-gradient-to-br ${option.color.gradient}
                    ${isHovered && !isDisabled ? 'opacity-5' : ''}
                  `} />
                </div>
              );
            })}

            {/* Premium Footer Info */}
            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50/80 to-white/80 border border-slate-200/40 backdrop-blur-sm">
              <div className="flex items-center space-x-3 text-sm text-slate-600">
                <div className="flex-shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  {t('knowledgeBase.selectionInfluenceNotice')}
                </span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}; 