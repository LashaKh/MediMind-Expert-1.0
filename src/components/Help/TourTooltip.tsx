import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TourTooltipProps {
  targetElement: HTMLElement | null;
  isVisible: boolean;
  title: string;
  content: string;
  currentStep: number;
  totalSteps: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onSkip: () => void;
  onBackToTours?: () => void; // New callback for returning to tour selector
  showPrevious?: boolean;
  isLastStep?: boolean;
  allowSkip?: boolean;
  debugMode?: boolean; // Enable debug mode with emergency DOM solution
}

type Position = 'top' | 'bottom' | 'left' | 'right';

export const TourTooltip: React.FC<TourTooltipProps> = ({
  targetElement,
  isVisible,
  title,
  content,
  currentStep,
  totalSteps,
  position = 'auto',
  onNext,
  onPrevious,
  onClose,
  onSkip,
  onBackToTours,
  showPrevious = true,
  isLastStep = false,
  allowSkip = true,
  debugMode = false
}) => {
  const { t } = useTranslation();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [finalPosition, setFinalPosition] = useState<Position>('bottom');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Detect dark mode and mobile
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDarkMode();
    checkMobile();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    window.addEventListener('resize', checkMobile);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Smart positioning with collision detection
  useEffect(() => {
    if (!targetElement || !isVisible) {
      return;
    }

    const calculatePosition = () => {
      if (!tooltipRef.current) {
        // If tooltip ref not ready, try again in next frame
        requestAnimationFrame(calculatePosition);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const spacing = 20; // Distance from target element
      const margin = 16; // Margin from viewport edges

      // Special handling for body element - center the tooltip
      if (targetElement === document.body) {
        const left = (viewportWidth - tooltipRect.width) / 2;
        const top = (viewportHeight - tooltipRect.height) / 2;

        setFinalPosition('bottom');
        setTooltipStyle({
          position: 'fixed',
          left: `${Math.max(margin, left)}px`,
          top: `${Math.max(margin, top)}px`,
          zIndex: 10000,
        });
        return;
      }

      // Calculate available space in each direction
      const spaces = {
        top: targetRect.top - spacing - margin,
        bottom: viewportHeight - targetRect.bottom - spacing - margin,
        left: targetRect.left - spacing - margin,
        right: viewportWidth - targetRect.right - spacing - margin
      };

      // Determine best position
      let bestPosition: Position = position as Position;
      
      if (position === 'auto') {
        // Find position with most space
        const sortedSpaces = Object.entries(spaces)
          .sort(([,a], [,b]) => b - a) as [Position, number][];
        
        // Check if tooltip fits in preferred positions
        for (const [pos, space] of sortedSpaces) {
          const requiredSpace = (pos === 'top' || pos === 'bottom') 
            ? tooltipRect.height 
            : tooltipRect.width;
          
          if (space >= requiredSpace) {
            bestPosition = pos;
            break;
          }
        }
        
        // Fallback to position with most space
        if (!bestPosition) {
          bestPosition = sortedSpaces[0][0];
        }
      }

      setFinalPosition(bestPosition);

      // Calculate tooltip position
      let left = 0;
      let top = 0;

      switch (bestPosition) {
        case 'top':
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.top - tooltipRect.height - spacing;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.bottom + spacing;
          break;
        case 'left':
          left = targetRect.left - tooltipRect.width - spacing;
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
        case 'right':
          left = targetRect.right + spacing;
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
      }

      // Ensure tooltip stays within viewport bounds
      left = Math.max(margin, Math.min(viewportWidth - tooltipRect.width - margin, left));
      top = Math.max(margin, Math.min(viewportHeight - tooltipRect.height - margin, top));

      setTooltipStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 10000,
      });
    };

    const observer = new ResizeObserver(calculatePosition);
    if (tooltipRef.current) {
      observer.observe(tooltipRef.current);
    }

    calculatePosition();

    const handleUpdate = () => {
      requestAnimationFrame(calculatePosition);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement, isVisible, position]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          if (showPrevious && currentStep > 0) {
            event.preventDefault();
            onPrevious();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onNext, onPrevious, onClose, showPrevious, currentStep]);

  // Touch gesture support for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    // Ignore if the swipe distance is too small
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      setTouchStart(null);
      return;
    }

    // Horizontal swipes take precedence
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && showPrevious && currentStep > 0) {
        // Swipe right - previous
        onPrevious();
      } else if (deltaX < 0) {
        // Swipe left - next
        onNext();
      }
    }

    setTouchStart(null);
  };

  if (!isVisible) {

    return null;
  }

  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Simplified version without Framer Motion for debugging
  // debugMode is now passed as a prop from PremiumTour
  
  // Add console log for debugging

  // EMERGENCY DOM SOLUTION - Direct DOM manipulation
  useEffect(() => {
    if (debugMode && isVisible) {
      // Remove any existing emergency tooltip
      const existing = document.getElementById('claude-emergency-tooltip');
      if (existing) {
        existing.remove();
      }

      // Create tooltip directly in DOM
      const tooltip = document.createElement('div');
      tooltip.id = 'claude-emergency-tooltip';
      tooltip.innerHTML = `
        <div style="
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          transform: none !important;
          width: 320px !important;
          max-width: calc(100vw - 40px) !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: #ffffff !important;
          z-index: 999999999 !important;
          padding: 16px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          border: none !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
          clip: none !important;
          overflow: visible !important;
          backdrop-filter: blur(20px) !important;
        ">
          <div style="background: rgba(255,255,255,0.2); color: white; padding: 8px; margin: -16px -16px 12px -16px; font-weight: 600; border-radius: 16px 16px 0 0; font-size: 12px; text-align: center;">
            ✨ ${t('tour.tooltip.title', 'Medical Tour Guide')} - ${t('tour.tooltip.stepCounter', { current: currentStep + 1, total: totalSteps })}
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${title}</h3>
          <div style="margin-bottom: 12px; line-height: 1.4; font-size: 13px;">${content}</div>
          <div style="background: rgba(255,255,255,0.2); height: 4px; border-radius: 2px; margin-bottom: 14px;">
            <div style="background: rgba(255,255,255,0.9); height: 100%; width: ${progress}%; border-radius: 2px; transition: width 0.3s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              ${showPrevious && currentStep > 0 ? `<button onclick="window.tourPrevious()" style="padding: 12px 20px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; margin-right: 12px; font-weight: 500; transition: all 0.2s ease; backdrop-filter: blur(10px);">← ${t('tour.tooltip.previous', 'Previous')}</button>` : ''}
              ${onBackToTours ? `<button onclick="window.tourBackToTours()" style="padding: 10px 16px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; margin-right: 12px; font-weight: 500; transition: all 0.2s ease;">🏠 ${t('tour.tooltip.allTours', 'All Tours')}</button>` : ''}
            </div>
            <div>
              ${allowSkip ? `<button onclick="window.tourSkip()" style="padding: 10px 16px; background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; margin-right: 12px; font-weight: 500;">${t('tour.tooltip.skip', 'Skip Tour')}</button>` : ''}
              <button onclick="window.tourNext()" style="padding: 12px 24px; background: rgba(255,255,255,0.9); color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                ${isLastStep ? '✓ ' + `${t('tour.tooltip.finish', 'Complete')}` : `${t('tour.tooltip.next', 'Next')} →`}
              </button>
            </div>
          </div>
          <button onclick="window.tourClose()" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; width: 32px; height: 32px; font-size: 16px; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(10px);">×</button>
        </div>
      `;
      document.body.appendChild(tooltip);

      // Set up global functions for buttons
      window.tourNext = onNext;
      window.tourPrevious = onPrevious;
      window.tourSkip = onSkip;
      window.tourClose = onClose;
      if (onBackToTours) {
        window.tourBackToTours = onBackToTours;
      }

      return () => {
        const existing = document.getElementById('claude-emergency-tooltip');
        if (existing) {
          existing.remove();
        }
        // Clean up global functions
        delete window.tourNext;
        delete window.tourPrevious;
        delete window.tourSkip;
        delete window.tourClose;
        delete window.tourBackToTours;
      };
    }
  }, [debugMode, isVisible, title, content, currentStep, totalSteps, progress, showPrevious, allowSkip, isLastStep, onNext, onPrevious, onSkip, onClose, onBackToTours]);

  if (debugMode) {
    return null; // Let the useEffect handle everything
  }

  if (false) { // Disable the old debug code

    // Test component - simple red square at top-left to verify rendering works
    const testElement = (
      <div
        style={{
          position: 'fixed !important',
          top: '10px !important',
          left: '10px !important',
          width: '100px !important',
          height: '100px !important',
          backgroundColor: '#ff0000 !important',
          zIndex: '2147483647 !important',
          border: '5px solid #ffffff !important',
          opacity: '1 !important',
          display: 'block !important'
        }}
      >
        <div style={{ color: 'white', padding: '10px', fontSize: '12px', fontWeight: 'bold' }}>
          TEST
        </div>
      </div>
    );

    // Create portal to render directly to document.body
    const portalContent = (
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed !important',
          left: tooltipStyle.left || '50px',
          top: tooltipStyle.top || '50px',
          zIndex: '2147483647 !important', // Maximum z-index
          backgroundColor: '#ffffff !important',
          border: '4px solid #ff0000 !important',
          borderRadius: '8px !important',
          padding: '20px !important',
          maxWidth: '400px !important',
          minWidth: '300px !important',
          fontFamily: 'Arial, sans-serif !important',
          fontSize: '16px !important',
          lineHeight: '1.4 !important',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8) !important',
          opacity: '1 !important',
          visibility: 'visible !important',
          display: 'block !important',
          pointerEvents: 'all !important',
          transform: 'translateZ(0) !important' // Force hardware acceleration
        }}
      >
        {/* Ultra-visible debug banner */}
        <div style={{
          position: 'absolute !important',
          top: '-35px !important',
          left: '0 !important',
          backgroundColor: '#ff0000 !important',
          color: '#ffffff !important',
          padding: '8px 12px !important',
          fontSize: '14px !important',
          fontWeight: 'bold !important',
          borderRadius: '4px !important',
          border: '2px solid #fff !important',
          zIndex: '2147483647 !important'
        }}>
          🐛 DEBUG MODE - Step {currentStep + 1}/{totalSteps}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute !important',
            top: '8px !important',
            right: '8px !important',
            backgroundColor: '#ff4444 !important',
            color: '#ffffff !important',
            border: 'none !important',
            borderRadius: '50% !important',
            width: '30px !important',
            height: '30px !important',
            fontSize: '18px !important',
            fontWeight: 'bold !important',
            cursor: 'pointer !important',
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            zIndex: '2147483647 !important'
          }}
        >
          ×
        </button>

        {/* Title */}
        <h3 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#000000',
          marginTop: '5px'
        }}>
          {title}
        </h3>

        {/* Content */}
        <div
          style={{
            marginBottom: '20px',
            color: '#333333',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Progress bar */}
        <div style={{
          backgroundColor: '#eeeeee',
          height: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          overflow: 'hidden',
          border: '1px solid #ccc'
        }}>
          <div style={{
            backgroundColor: '#00aa00',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
            borderRadius: '4px'
          }}></div>
        </div>

        {/* Progress text */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#666666',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          Progress: {Math.round(progress)}% ({currentStep + 1} of {totalSteps})
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>
            {showPrevious && currentStep > 0 && (
              <button
                onClick={onPrevious}
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#666666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {allowSkip && (
              <button
                onClick={onSkip}
                style={{
                  padding: '12px 18px',
                  backgroundColor: 'transparent',
                  color: '#666666',
                  border: '2px solid #cccccc',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Skip Tour
              </button>
            )}
            
            <button
              onClick={onNext}
              style={{
                padding: '12px 24px',
                backgroundColor: isLastStep ? '#00aa00' : '#0066cc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isLastStep ? '✓ Complete Tour' : 'Next Step →'}
            </button>
          </div>
        </div>

        {/* Debug info panel */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8f8f8',
          fontSize: '12px',
          color: '#666666',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontFamily: 'monospace'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Position: {finalPosition}</div>
          <div>Visible: {isVisible ? 'YES' : 'NO'}</div>
          <div>Target: {targetElement?.tagName || 'null'}</div>
          <div>Style: left={tooltipStyle.left}, top={tooltipStyle.top}</div>
        </div>
      </div>
    );

    // Render via portal to bypass any parent container restrictions
    return createPortal(
      <>
        {testElement}
        {portalContent}
      </>,
      document.body
    );
  }
  
    // Original version with Framer Motion
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ 
              opacity: 0, 
              scale: 0.9,
              y: finalPosition === 'top' ? 10 : finalPosition === 'bottom' ? -10 : 0,
              x: finalPosition === 'left' ? 10 : finalPosition === 'right' ? -10 : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9 
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
              scale: {
                type: "spring",
                stiffness: 200,
                damping: 25
              }
            }}
            className={`tour-tooltip ${isDarkMode ? 'dark' : ''}`}
            style={tooltipStyle}
            data-position={finalPosition}
            role="dialog"
            aria-labelledby="tour-title"
            aria-describedby="tour-content"
            aria-modal="true"
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            {/* Premium Content */}
            <div className="relative p-6">
              {/* Decorative element */}
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>

              {/* Header */}
              <div className="flex items-start justify-between mb-4 pr-8">
                <div className="flex-1">
                  <h3 
                    id="tour-title"
                    className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"
                  >
                    {title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="tour-step-counter inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {t('tour.tooltip.stepCounter', { current: currentStep + 1, total: totalSteps })}
                    </span>
                    <div className="tour-progress-dots">
                      {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                          key={i}
                          className={`tour-progress-dot ${
                            i <= currentStep ? 'active' : ''
                          } ${i < currentStep ? 'completed' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="tour-button p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  aria-label={t('tour.tooltip.close', 'Close tour')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div 
                id="tour-content"
                className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-base"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Mobile swipe hint */}
              {isMobile && (
                <div className="flex items-center justify-center mb-4 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    {t('tour.tooltip.swipeHint', 'Swipe left/right to navigate')}
                  </span>
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}

              {/* Enhanced Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="font-medium">{t('tour.tooltip.progressLabel', 'Progress')}</span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {showPrevious && currentStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onPrevious}
                      className="tour-button flex items-center px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('tour.tooltip.previous', 'Previous')}
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {allowSkip && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onSkip}
                      className="tour-button px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 font-medium"
                    >
                      {t('tour.tooltip.skip', 'Skip Tour')}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    className="tour-button flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('tour.tooltip.completeTour', 'Complete Tour')}
                      </>
                    ) : (
                      <>
                        {t('tour.tooltip.nextStep', 'Next Step')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };