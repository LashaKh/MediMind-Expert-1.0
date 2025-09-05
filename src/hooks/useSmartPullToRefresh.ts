import { useCallback, useRef, useEffect } from 'react';

interface SmartPullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
  threshold?: number;
}

/**
 * Smart pull-to-refresh that NEVER interferes with normal scrolling.
 * Only works when pulling from the very top of the page.
 */
export const useSmartPullToRefresh = ({
  onRefresh,
  enabled = true,
  threshold = 60
}: SmartPullToRefreshOptions) => {
  const isRefreshing = useRef(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Check if we're at the absolute top of the page
  const isAtPageTop = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Must be at absolute top (0 scroll)
    if (window.scrollY !== 0) return false;
    
    // Check if any scrollable element is scrolled
    const scrollables = document.querySelectorAll('[data-scrollable]');
    for (const el of scrollables) {
      if (el.scrollTop > 0) return false;
    }
    
    return true;
  }, []);

  // Handle the pull gesture ONLY in safe zones
  const handlePull = useCallback((deltaY: number) => {
    if (!enabled || isRefreshing.current || !isAtPageTop()) return;
    
    if (deltaY >= threshold) {
      isRefreshing.current = true;
      
      // Simple page refresh - no complex UI
      onRefresh().then(() => {
        setTimeout(() => {
          isRefreshing.current = false;
        }, 1000);
      }).catch(() => {
        isRefreshing.current = false;
      });
    }
  }, [enabled, threshold, onRefresh, isAtPageTop]);

  // Bind to specific safe areas only (header/top area)
  const bindToElement = useCallback((element: HTMLElement | null) => {
    if (!element || !enabled) return;

    let isTracking = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAtPageTop()) {
        startY.current = e.touches[0].clientY;
        isTracking = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking) return;
      
      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;
      
      // Only handle significant downward pulls when at page top
      if (deltaY > 20 && isAtPageTop()) {
        // Show minimal feedback - just change cursor or add slight transform
        element.style.transform = `translateY(${Math.min(deltaY * 0.3, 20)}px)`;
        element.style.opacity = `${Math.max(0.8, 1 - deltaY * 0.01)}`;
      }
    };

    const handleTouchEnd = () => {
      if (!isTracking) return;
      
      const deltaY = currentY.current - startY.current;
      
      // Reset visual feedback
      element.style.transform = '';
      element.style.opacity = '';
      
      // Trigger refresh if threshold met
      if (deltaY >= threshold) {
        handlePull(deltaY);
      }
      
      isTracking = false;
    };

    // Use passive listeners to not interfere with scrolling
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, handlePull, isAtPageTop]);

  return {
    bindToElement,
    isRefreshing: isRefreshing.current
  };
};