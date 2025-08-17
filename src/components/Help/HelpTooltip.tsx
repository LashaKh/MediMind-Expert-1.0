import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  trigger?: 'hover' | 'click';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  position = 'top',
  size = 'md',
  trigger = 'hover',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const tooltipSizeClasses = {
    sm: 'max-w-xs text-xs',
    md: 'max-w-sm text-sm',
    lg: 'max-w-md text-base'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-full"
        aria-label="Help"
      >
        <HelpCircle className={iconSizeClasses[size]} />
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} ${tooltipSizeClasses[size]}`}
          onMouseEnter={() => trigger === 'hover' && setIsVisible(true)}
          onMouseLeave={() => trigger === 'hover' && setIsVisible(false)}
        >
          <div className="bg-gray-900 text-white rounded-lg shadow-lg p-3 relative">
            {/* Close button for click trigger */}
            {trigger === 'click' && (
              <button
                onClick={handleClose}
                className="absolute top-1 right-1 text-gray-300 hover:text-white"
                aria-label="Close help"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Title */}
            {title && (
              <div className="font-semibold mb-1 pr-6">
                {title}
              </div>
            )}

            {/* Content */}
            <div className="text-gray-100 leading-relaxed">
              {content}
            </div>

            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 