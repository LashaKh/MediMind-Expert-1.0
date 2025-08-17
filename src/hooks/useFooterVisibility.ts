import { useState, useEffect, useCallback } from 'react';

interface UseFooterVisibilityOptions {
  threshold?: number; // How close to bottom (in pixels) before showing footer
  debounceMs?: number; // Debounce scroll events
}

export const useFooterVisibility = ({
  threshold = 10,
  debounceMs = 50
}: UseFooterVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const checkScrollPosition = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if we're at the absolute bottom
    const atBottom = scrollY + windowHeight >= documentHeight - threshold;
    
    setIsAtBottom(atBottom);
    setLastScrollY(scrollY);
    
    // Show footer only when at absolute bottom
    if (atBottom) {
      setIsVisible(true);
    } else {
      // Hide immediately when not at bottom
      setIsVisible(false);
    }
  }, [threshold]);

  const debouncedCheckScroll = useCallback(
    debounce(checkScrollPosition, debounceMs),
    [checkScrollPosition, debounceMs]
  );

  useEffect(() => {
    // Initial check
    checkScrollPosition();
    
    // Add scroll listener
    window.addEventListener('scroll', debouncedCheckScroll, { passive: true });
    
    // Add resize listener to recalculate on window resize
    window.addEventListener('resize', checkScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', debouncedCheckScroll);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [debouncedCheckScroll, checkScrollPosition]);

  return {
    isVisible,
    isAtBottom,
    lastScrollY
  };
};