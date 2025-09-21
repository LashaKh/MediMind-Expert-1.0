import { useEffect } from 'react';

/**
 * Custom hook that manages dynamic viewport height for mobile keyboard interactions.
 * 
 * This hook sets a CSS custom property `--viewport-height` that can be used
 * in CSS calculations instead of the problematic `100vh` on mobile devices.
 * 
 * Mobile browsers often change the viewport height when the keyboard appears,
 * but `100vh` doesn't update accordingly, causing layout issues.
 * 
 * Usage in CSS:
 * ```css
 * .mobile-container {
 *   height: calc(var(--viewport-height, 100vh) - 48px);
 * }
 * ```
 */
export const useViewportHeight = () => {
  useEffect(() => {
    let initialHeight = window.innerHeight;
    let isKeyboardOpen = false;
    
    const updateViewportHeight = () => {
      // Calculate 1% of the current inner height
      const vh = window.innerHeight * 0.01;
      const currentHeight = window.innerHeight;
      
      // Set the custom property on the document root
      document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
      
      // Also set the legacy vh unit custom property for compatibility
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Detect if keyboard is likely visible (significant height reduction)
      const heightDifference = initialHeight - currentHeight;
      const keyboardDetected = heightDifference > 100; // More sensitive threshold
      
      // Force layout update when keyboard state changes
      if (keyboardDetected !== isKeyboardOpen) {
        isKeyboardOpen = keyboardDetected;
        
        // Apply keyboard class to body for global styling
        if (isKeyboardOpen) {
          document.body.classList.add('keyboard-open');
          // Force immediate layout update
          document.body.style.height = `${currentHeight}px`;
          const root = document.getElementById('root');
          if (root) {
            root.style.height = `${currentHeight}px`;
          }
        } else {
          document.body.classList.remove('keyboard-open');
          // Restore full height
          document.body.style.height = `${initialHeight}px`;
          const root = document.getElementById('root');
          if (root) {
            root.style.height = `${initialHeight}px`;
          }
        }
      }
      
      // Add/remove keyboard classes to floating elements
      const fabElements = document.querySelectorAll('.mediscribe-mobile-fab, .mediscribe-mobile-floating-upload');
      fabElements.forEach(element => {
        if (isKeyboardOpen) {
          element.classList.add('keyboard-visible');
        } else {
          element.classList.remove('keyboard-visible');
        }
      });
      
      // Development logging (only in development mode)
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 Viewport height updated:', {
          innerHeight: currentHeight,
          initialHeight,
          heightDifference,
          isKeyboardOpen,
          viewportHeightPx: `${currentHeight}px`,
          vhUnit: `${vh}px`
        });
      }
    };

    // Set initial viewport height
    updateViewportHeight();

    // Visual Viewport API for better keyboard detection (modern browsers)
    if (window.visualViewport) {
      const handleVisualViewportResize = () => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDifference = initialHeight - currentHeight;
        const keyboardDetected = heightDifference > 100;
        
        if (keyboardDetected !== isKeyboardOpen) {
          // Force immediate update
          updateViewportHeight();
        }
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }

    // Update on resize (keyboard show/hide triggers resize)
    window.addEventListener('resize', updateViewportHeight);
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure orientation change is complete
      setTimeout(updateViewportHeight, 100);
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
    };
  }, []);
};