import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EnhancedTooltipProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
  badge?: string;
  children: React.ReactElement;
  disabled?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  title,
  description,
  icon: Icon,
  gradient = 'from-blue-500 to-indigo-600',
  badge,
  children,
  disabled = false,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, show: false });
  const [isMobile, setIsMobile] = useState(false);
  const childRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (isMobile || disabled) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320; // Estimated tooltip width
    const tooltipHeight = 150; // Estimated tooltip height
    
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - tooltipHeight - 12;
    
    // Adjust position based on viewport boundaries
    if (position === 'bottom' || top < 10) {
      top = rect.bottom + 12;
    }
    
    // Keep tooltip within viewport horizontally
    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
    
    // Keep tooltip within viewport vertically
    if (top + tooltipHeight > viewportHeight - 10) {
      top = rect.top - tooltipHeight - 12;
    }
    if (top < 10) {
      top = rect.bottom + 12;
    }
    
    setTooltipPosition({
      top,
      left,
      show: true
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipPosition(prev => ({ ...prev, show: false }));
    setIsVisible(false);
  };

  const childWithHandlers = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...children.props
  });

  return (
    <>
      {childWithHandlers}
      
      {/* Beautiful Tooltip Portal */}
      {tooltipPosition.show && isVisible && !isMobile && !disabled && createPortal(
        <div
          className={`fixed z-[200] pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200 ${className}`}
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
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  {Icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {title}
                    </h3>
                    {badge && (
                      <div className={`
                        inline-flex px-3 py-1 rounded-full text-xs font-bold mt-1
                        bg-gradient-to-r ${gradient} text-white shadow-sm
                      `}>
                        {badge}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div className="text-sm text-slate-600 leading-relaxed">
                  {description}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};