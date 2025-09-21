import { useEffect } from 'react';

/**
 * Custom hook that manages dynamic viewport height for mobile keyboard interactions.
 * 
 * This hook sets CSS custom properties and manages keyboard state for optimal
 * mobile experience when the soft keyboard appears/disappears.
 * 
 * Features:
 * - Accurate keyboard detection using Visual Viewport API
 * - Input focus tracking for proactive keyboard management
 * - Dynamic button repositioning above keyboard
 * - Smooth transitions and professional UX
 */
export const useViewportHeight = () => {
  useEffect(() => {
    let initialHeight = window.innerHeight;
    let isKeyboardOpen = false;
    let keyboardHeight = 0;
    
    const updateViewportHeight = (forceUpdate = false) => {
      // Use Visual Viewport API for accurate measurements
      const visualHeight = window.visualViewport?.height || window.innerHeight;
      const currentHeight = window.innerHeight;
      
      // Calculate keyboard height when present
      const heightDifference = initialHeight - visualHeight;
      const keyboardDetected = heightDifference > 50; // More sensitive detection
      
      // Update keyboard height for button positioning
      if (keyboardDetected) {
        keyboardHeight = heightDifference;
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      } else {
        keyboardHeight = 0;
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
      
      // Set viewport properties
      document.documentElement.style.setProperty('--viewport-height', `${visualHeight}px`);
      document.documentElement.style.setProperty('--window-height', `${currentHeight}px`);
      document.documentElement.style.setProperty('--initial-height', `${initialHeight}px`);
      
      // Update safe area for content
      const safeContentHeight = visualHeight - (keyboardDetected ? 0 : 0);
      document.documentElement.style.setProperty('--safe-content-height', `${safeContentHeight}px`);
      
      // Force layout update when keyboard state changes
      if (keyboardDetected !== isKeyboardOpen || forceUpdate) {
        isKeyboardOpen = keyboardDetected;
        
        // Apply keyboard state classes
        if (isKeyboardOpen) {
          document.body.classList.add('keyboard-open');
          document.documentElement.classList.add('keyboard-visible');
          
          // Position floating buttons above keyboard
          const buttonOffset = keyboardHeight + 24; // 24px padding above keyboard
          document.documentElement.style.setProperty('--button-bottom-offset', `${buttonOffset}px`);
        } else {
          document.body.classList.remove('keyboard-open');
          document.documentElement.classList.remove('keyboard-visible');
          document.documentElement.style.setProperty('--button-bottom-offset', '24px');
        }
        
        // Update floating elements
        const fabElements = document.querySelectorAll('.mediscribe-mobile-fab, .mediscribe-mobile-floating-upload');
        fabElements.forEach(element => {
          if (isKeyboardOpen) {
            element.classList.add('keyboard-visible');
            (element as HTMLElement).style.bottom = `${buttonOffset}px`;
          } else {
            element.classList.remove('keyboard-visible');
            (element as HTMLElement).style.bottom = '24px';
          }
        });
      }
      
      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 Viewport updated:', {
          visualHeight,
          windowHeight: currentHeight,
          keyboardHeight,
          isKeyboardOpen,
          safeContentHeight
        });
      }
    };

    // Enhanced input focus detection
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches('input, textarea, [contenteditable="true"]')) {
        // Proactively prepare for keyboard
        setTimeout(() => {
          updateViewportHeight(true);
          
          // Ensure input is visible above keyboard
          if (window.visualViewport && target) {
            const rect = target.getBoundingClientRect();
            const viewportHeight = window.visualViewport.height;
            const inputBottom = rect.bottom;
            
            // Scroll if input would be covered by keyboard
            if (inputBottom > viewportHeight - 50) {
              const scrollAmount = inputBottom - (viewportHeight - 100);
              window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
          }
        }, 100);
      }
    };

    const handleInputBlur = () => {
      // Delay to ensure keyboard is closing
      setTimeout(() => {
        updateViewportHeight();
      }, 100);
    };

    // Initialize viewport
    updateViewportHeight();

    // Visual Viewport API for precise keyboard detection
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        updateViewportHeight();
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    }

    // Standard event listeners
    window.addEventListener('resize', () => updateViewportHeight());
    window.addEventListener('orientationchange', () => {
      initialHeight = window.innerHeight; // Reset initial height on orientation change
      setTimeout(() => updateViewportHeight(true), 100);
    });
    
    // Input focus listeners for proactive keyboard management
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      document.removeEventListener('focusin', handleInputFocus);
      document.removeEventListener('focusout', handleInputBlur);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      }
    };
  }, []);
};