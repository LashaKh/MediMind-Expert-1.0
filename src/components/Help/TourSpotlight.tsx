import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourSpotlightProps {
  targetElement: HTMLElement | null;
  isVisible: boolean;
  onOverlayClick?: () => void;
}

export const TourSpotlight: React.FC<TourSpotlightProps> = ({
  targetElement,
  isVisible,
  onOverlayClick
}) => {
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!targetElement || !isVisible) {
      setSpotlightStyle({});
      setHighlightStyle({});
      return;
    }

    const updateSpotlight = () => {
      const rect = targetElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate optimal spotlight size based on element size
      const padding = Math.max(40, Math.min(rect.width, rect.height) * 0.3);
      const spotlightSize = Math.max(
        rect.width + padding * 2,
        rect.height + padding * 2,
        200
      );

      // Spotlight overlay styles
      const newSpotlightStyle: React.CSSProperties = {
        '--spotlight-x': `${centerX}px`,
        '--spotlight-y': `${centerY}px`,
        '--spotlight-size': `${spotlightSize}px`,
        '--spotlight-inner': `${spotlightSize * 0.4}px`,
        '--spotlight-outer': `${spotlightSize * 0.7}px`,
      } as React.CSSProperties;

      // Highlight border styles
      const newHighlightStyle: React.CSSProperties = {
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      };

      setSpotlightStyle(newSpotlightStyle);
      setHighlightStyle(newHighlightStyle);
    };

    updateSpotlight();

    // Update on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Spotlight Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            className="tour-spotlight-overlay"
            style={spotlightStyle}
            onClick={onOverlayClick}
            role="presentation"
            aria-hidden="true"
          />

          {/* Highlighted Element Border */}
          {targetElement && (
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                ...highlightStyle
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                ...highlightStyle
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8 
              }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0.0, 0.2, 1],
                scale: {
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }
              }}
              className="tour-highlight"
              style={highlightStyle}
              role="presentation"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};