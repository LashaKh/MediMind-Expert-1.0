import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface TourTooltipPortalProps {
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
  showPrevious?: boolean;
  isLastStep?: boolean;
  allowSkip?: boolean;
  debugMode?: boolean;
}

type Position = 'top' | 'bottom' | 'left' | 'right';

export const TourTooltipPortal: React.FC<TourTooltipPortalProps> = ({
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
  showPrevious = true,
  isLastStep = false,
  allowSkip = true,
  debugMode = true
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [finalPosition, setFinalPosition] = useState<Position>('bottom');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Create portal root - FINAL FIX: Truly persistent portal with no cleanup
  useEffect(() => {
    let root = document.getElementById('tour-tooltip-portal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tour-tooltip-portal';
      root.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 999999 !important;
      `;
      document.body.appendChild(root);
      console.log('🔧 Created TRULY persistent portal root:', root);
    }
    setPortalRoot(root);

    // NO CLEANUP FUNCTION - Let the portal persist across all renders and component lifecycles
    // The portal will be cleaned up when the page is refreshed or navigated away
  }, []); // Empty dependency array ensures this only runs once

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

  // Enhanced DOM inspection logging
  const logDOMState = (tooltip: HTMLElement) => {
    const computedStyles = window.getComputedStyle(tooltip);
    const rect = tooltip.getBoundingClientRect();
    
    console.log('📊 DOM Inspection Report:', {
      element: tooltip,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right
      },
      computedStyles: {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        position: computedStyles.position,
        zIndex: computedStyles.zIndex,
        transform: computedStyles.transform,
        top: computedStyles.top,
        left: computedStyles.left,
        backgroundColor: computedStyles.backgroundColor,
        color: computedStyles.color,
        overflow: computedStyles.overflow,
        clipPath: computedStyles.clipPath,
        clip: computedStyles.clip
      },
      parentElements: []
    });

    // Check parent elements for overflow/clip issues
    let parent = tooltip.parentElement;
    let level = 0;
    while (parent && level < 5) {
      const parentStyles = window.getComputedStyle(parent);
      const parentRect = parent.getBoundingClientRect();
      
      console.log(`📊 Parent ${level + 1} (${parent.tagName}):`, {
        element: parent,
        rect: parentRect,
        styles: {
          overflow: parentStyles.overflow,
          overflowX: parentStyles.overflowX,
          overflowY: parentStyles.overflowY,
          clipPath: parentStyles.clipPath,
          clip: parentStyles.clip,
          position: parentStyles.position,
          zIndex: parentStyles.zIndex,
          transform: parentStyles.transform
        }
      });

      parent = parent.parentElement;
      level++;
    }

    // Check if tooltip is actually visible on screen
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );

    console.log('👁️ Visibility Analysis:', {
      isInViewport,
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
      tooltipRect: rect,
      recommendations: [
        !isInViewport && 'Tooltip is outside viewport',
        computedStyles.display === 'none' && 'display: none detected',
        computedStyles.visibility === 'hidden' && 'visibility: hidden detected',
        parseFloat(computedStyles.opacity) === 0 && 'opacity: 0 detected',
        computedStyles.clipPath !== 'none' && 'clip-path detected on tooltip',
        computedStyles.transform !== 'none' && `transform detected: ${computedStyles.transform}`
      ].filter(Boolean)
    });
  };

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
      
      const spacing = 20;
      const margin = 16;

      console.log('📍 Position Calculation:', {
        targetRect,
        tooltipRect,
        viewport: { width: viewportWidth, height: viewportHeight }
      });

      // Special handling for body element - center the tooltip
      if (targetElement === document.body) {
        const left = Math.max(margin, (viewportWidth - 400) / 2); // Use fixed width for body
        const top = Math.max(margin, (viewportHeight - 300) / 2);  // Use estimated height
        
        console.log('📍 Body positioning:', { left, top });
        
        setFinalPosition('bottom');
        const style = {
          position: 'fixed' as const,
          left: `${left}px`,
          top: `${top}px`,
          zIndex: 999999,
          pointerEvents: 'auto' as const,
        };
        
        setTooltipStyle(style);
        console.log('✅ Applied body style:', style);
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
        const sortedSpaces = Object.entries(spaces)
          .sort(([,a], [,b]) => b - a) as [Position, number][];
        
        for (const [pos, space] of sortedSpaces) {
          const requiredSpace = (pos === 'top' || pos === 'bottom') 
            ? tooltipRect.height || 300  // Fallback height
            : tooltipRect.width || 400;   // Fallback width
          
          if (space >= requiredSpace) {
            bestPosition = pos;
            break;
          }
        }
        
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
          left = targetRect.left + (targetRect.width - (tooltipRect.width || 400)) / 2;
          top = targetRect.top - (tooltipRect.height || 300) - spacing;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width - (tooltipRect.width || 400)) / 2;
          top = targetRect.bottom + spacing;
          break;
        case 'left':
          left = targetRect.left - (tooltipRect.width || 400) - spacing;
          top = targetRect.top + (targetRect.height - (tooltipRect.height || 300)) / 2;
          break;
        case 'right':
          left = targetRect.right + spacing;
          top = targetRect.top + (targetRect.height - (tooltipRect.height || 300)) / 2;
          break;
      }

      // Ensure tooltip stays within viewport bounds
      left = Math.max(margin, Math.min(viewportWidth - (tooltipRect.width || 400) - margin, left));
      top = Math.max(margin, Math.min(viewportHeight - (tooltipRect.height || 300) - margin, top));

      console.log('📍 Final positioning:', { bestPosition, left, top });

      const style = {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 999999,
        pointerEvents: 'auto' as const,
      };

      setTooltipStyle(style);
      console.log('✅ Applied style:', style);

      // Log DOM state after a short delay to allow styles to apply
      setTimeout(() => {
        if (tooltipRef.current) {
          logDOMState(tooltipRef.current);
        }
      }, 100);
    };

    // Initial calculation
    calculatePosition();

    const handleUpdate = () => {
      requestAnimationFrame(calculatePosition);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement, isVisible, position]);

  if (!isVisible || !portalRoot) {
    console.log('❌ Not rendering - visible:', isVisible, 'portalRoot:', !!portalRoot);
    return null;
  }

  const progress = ((currentStep + 1) / totalSteps) * 100;

  console.log('🎨 Rendering portal tooltip:', {
    title,
    debugMode,
    tooltipStyle,
    portalRoot: portalRoot?.id
  });

  // Create tooltip content
  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={{
        ...tooltipStyle,
        // Maximum specificity with !important
        backgroundColor: debugMode ? '#ffffff !important' : undefined,
        border: debugMode ? '4px solid #ff0000 !important' : undefined,
        borderRadius: '12px !important',
        padding: '24px !important',
        maxWidth: '420px !important',
        minWidth: '320px !important',
        fontFamily: 'system-ui, -apple-system, sans-serif !important',
        fontSize: '16px !important',
        lineHeight: '1.5 !important',
        boxShadow: debugMode 
          ? '0 20px 40px rgba(0,0,0,0.3) !important, 0 0 0 2px #ff0000 !important'
          : '0 20px 40px rgba(0,0,0,0.15) !important',
        opacity: '1 !important',
        visibility: 'visible !important',
        display: 'block !important',
        transform: 'none !important',
        animation: debugMode ? 'debugPulse 2s ease-in-out infinite !important' : undefined,
        pointerEvents: 'auto !important',
        zIndex: '999999 !important'
      }}
      className={debugMode ? 'tour-tooltip-debug' : 'tour-tooltip'}
      data-debug={debugMode}
      data-position={finalPosition}
      role="dialog"
      aria-labelledby="tour-title"
      aria-describedby="tour-content"
      aria-modal="true"
    >
      {/* Debug banner */}
      {debugMode && (
        <div style={{
          position: 'absolute !important' as any,
          top: '-40px !important' as any,
          left: '0 !important' as any,
          backgroundColor: '#ff0000 !important' as any,
          color: '#ffffff !important' as any,
          padding: '8px 16px !important' as any,
          fontSize: '14px !important' as any,
          fontWeight: 'bold !important' as any,
          borderRadius: '6px !important' as any,
          border: '2px solid #fff !important' as any,
          zIndex: '999999 !important' as any,
          pointerEvents: 'none !important' as any
        }}>
          🐛 DEBUG PORTAL - Step {currentStep + 1}/{totalSteps}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute !important' as any,
          top: '8px !important' as any,
          right: '8px !important' as any,
          backgroundColor: debugMode ? '#ff4444 !important' : '#f3f4f6 !important',
          color: debugMode ? '#ffffff !important' : '#374151 !important',
          border: 'none !important' as any,
          borderRadius: '50% !important' as any,
          width: '32px !important' as any,
          height: '32px !important' as any,
          fontSize: '18px !important' as any,
          fontWeight: 'bold !important' as any,
          cursor: 'pointer !important' as any,
          display: 'flex !important' as any,
          alignItems: 'center !important' as any,
          justifyContent: 'center !important' as any,
          zIndex: '999999 !important' as any,
          pointerEvents: 'auto !important' as any
        }}
        aria-label="Close tour"
      >
        ×
      </button>

      {/* Title */}
      <h3 
        id="tour-title"
        style={{
          fontSize: '24px !important' as any,
          fontWeight: 'bold !important' as any,
          marginBottom: '16px !important' as any,
          color: debugMode ? '#000000 !important' : '#111827 !important',
          marginTop: '0 !important' as any,
          lineHeight: '1.3 !important' as any
        }}
      >
        {title}
      </h3>

      {/* Content */}
      <div
        id="tour-content"
        style={{
          marginBottom: '20px !important' as any,
          color: debugMode ? '#333333 !important' : '#374151 !important',
          lineHeight: '1.6 !important' as any
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Progress bar */}
      <div style={{
        backgroundColor: '#e5e7eb !important' as any,
        height: '12px !important' as any,
        borderRadius: '6px !important' as any,
        marginBottom: '20px !important' as any,
        overflow: 'hidden !important' as any,
        border: '1px solid #d1d5db !important' as any
      }}>
        <div style={{
          backgroundColor: debugMode ? '#00aa00 !important' : '#3b82f6 !important',
          height: '100% !important' as any,
          width: `${progress}% !important` as any,
          transition: 'width 0.5s ease !important' as any,
          borderRadius: '5px !important' as any
        }}></div>
      </div>

      {/* Progress text */}
      <div style={{
        textAlign: 'center !important' as any,
        fontSize: '14px !important' as any,
        color: '#6b7280 !important' as any,
        marginBottom: '24px !important' as any,
        fontWeight: '600 !important' as any
      }}>
        {Math.round(progress)}% Complete ({currentStep + 1} of {totalSteps})
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex !important' as any,
        justifyContent: 'space-between !important' as any,
        alignItems: 'center !important' as any,
        gap: '12px !important' as any
      }}>
        <div>
          {showPrevious && currentStep > 0 && (
            <button
              onClick={onPrevious}
              style={{
                padding: '12px 20px !important' as any,
                backgroundColor: '#6b7280 !important' as any,
                color: '#ffffff !important' as any,
                border: 'none !important' as any,
                borderRadius: '8px !important' as any,
                cursor: 'pointer !important' as any,
                fontSize: '14px !important' as any,
                fontWeight: '600 !important' as any,
                pointerEvents: 'auto !important' as any
              }}
            >
              ← Previous
            </button>
          )}
        </div>
        
        <div style={{ 
          display: 'flex !important' as any, 
          gap: '12px !important' as any 
        }}>
          {allowSkip && (
            <button
              onClick={onSkip}
              style={{
                padding: '12px 20px !important' as any,
                backgroundColor: 'transparent !important' as any,
                color: '#6b7280 !important' as any,
                border: '2px solid #d1d5db !important' as any,
                borderRadius: '8px !important' as any,
                cursor: 'pointer !important' as any,
                fontSize: '14px !important' as any,
                fontWeight: '600 !important' as any,
                pointerEvents: 'auto !important' as any
              }}
            >
              Skip Tour
            </button>
          )}
          
          <button
            onClick={onNext}
            style={{
              padding: '12px 24px !important' as any,
              backgroundColor: isLastStep 
                ? (debugMode ? '#00aa00 !important' : '#10b981 !important')
                : (debugMode ? '#0066cc !important' : '#3b82f6 !important'),
              color: '#ffffff !important' as any,
              border: 'none !important' as any,
              borderRadius: '8px !important' as any,
              cursor: 'pointer !important' as any,
              fontSize: '14px !important' as any,
              fontWeight: '600 !important' as any,
              pointerEvents: 'auto !important' as any
            }}
          >
            {isLastStep ? '✓ Complete Tour' : 'Next Step →'}
          </button>
        </div>
      </div>

      {/* Debug info panel */}
      {debugMode && (
        <div style={{
          marginTop: '20px !important' as any,
          padding: '12px !important' as any,
          backgroundColor: '#f9fafb !important' as any,
          fontSize: '12px !important' as any,
          color: '#6b7280 !important' as any,
          borderRadius: '6px !important' as any,
          border: '1px solid #d1d5db !important' as any,
          fontFamily: 'monospace !important' as any
        }}>
          <div><strong>🔍 Debug Info:</strong></div>
          <div>Position: {finalPosition}</div>
          <div>Visible: {isVisible ? 'YES' : 'NO'}</div>
          <div>Target: {targetElement?.tagName || 'null'}</div>
          <div>Portal: {portalRoot?.id}</div>
          <div>Style: left={tooltipStyle.left}, top={tooltipStyle.top}</div>
          <div>Z-Index: {tooltipStyle.zIndex}</div>
        </div>
      )}
    </div>
  );

  return createPortal(tooltipContent, portalRoot);
};

// Add CSS animation for debug mode
const debugCSS = `
@keyframes debugPulse {
  0%, 100% {
    box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 2px #ff0000;
  }
  50% {
    box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 4px #ff0000, 0 0 20px rgba(255,0,0,0.3);
  }
}
`;

// Inject debug CSS
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = debugCSS;
  if (!document.head.querySelector('style[data-debug-tooltip]')) {
    styleEl.setAttribute('data-debug-tooltip', 'true');
    document.head.appendChild(styleEl);
  }
}