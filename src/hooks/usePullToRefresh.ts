import { useState, useCallback, useRef, useEffect } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
  refreshingTimeout?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

/**
 * Standalone pull-to-refresh hook with no dependencies on external stores.
 * Designed to prevent circular dependency issues.
 */
export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
  refreshingTimeout = 2000
}: PullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false
  });

  const touchStartY = useRef<number>(0);
  const pullStarted = useRef<boolean>(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe window and document checks
  const safeWindow = typeof window !== 'undefined' ? window : null;
  const safeDocument = typeof document !== 'undefined' ? document : null;

  // Check if user can pull (at scroll top)
  const canInitiatePull = useCallback((): boolean => {
    if (!safeWindow || !safeDocument || !enabled) return false;
    
    // Check if we're at the top of the page
    if (safeWindow.scrollY > 0) return false;
    
    // Check if any scrollable parent is not at top
    const scrollableParent = safeDocument.querySelector('.overflow-y-auto');
    if (scrollableParent && scrollableParent.scrollTop > 0) return false;
    
    return true;
  }, [safeWindow, safeDocument, enabled]);

  // Calculate pull distance with resistance
  const calculatePullDistance = useCallback((touchDistance: number): number => {
    if (touchDistance <= 0) return 0;
    
    // Apply resistance formula for natural feel
    const resistedDistance = touchDistance / resistance;
    return Math.min(resistedDistance, threshold * 1.5);
  }, [threshold, resistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing) return;
    
    if (canInitiatePull()) {
      touchStartY.current = e.touches[0].clientY;
      pullStarted.current = true;
    }
  }, [enabled, state.isRefreshing, canInitiatePull]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing || !pullStarted.current) return;
    
    const currentY = e.touches[0].clientY;
    const touchDistance = currentY - touchStartY.current;
    
    if (touchDistance > 0 && canInitiatePull()) {
      // Prevent default to stop scrolling
      e.preventDefault();
      
      const pullDistance = calculatePullDistance(touchDistance);
      const canRefresh = pullDistance >= threshold;
      
      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
        canRefresh
      }));
      
      // Haptic feedback when threshold reached
      if (canRefresh && !state.canRefresh) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }
  }, [enabled, state.isRefreshing, state.canRefresh, canInitiatePull, calculatePullDistance, threshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!enabled || state.isRefreshing || !pullStarted.current) return;
    
    pullStarted.current = false;
    
    if (state.canRefresh) {
      // Start refreshing
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
        pullDistance: threshold
      }));
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      }
      
      // Auto-hide refreshing state after timeout
      refreshTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false
        }));
      }, refreshingTimeout);
    } else {
      // Reset state with animation
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [enabled, state.isRefreshing, state.canRefresh, onRefresh, threshold, refreshingTimeout]);

  // Manually stop refreshing (useful for immediate feedback)
  const stopRefreshing = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isRefreshing: false,
      pullDistance: 0,
      canRefresh: false
    }));
  }, []);

  // Setup touch event listeners
  useEffect(() => {
    if (!safeDocument || !enabled) return;

    const options = { passive: false };
    
    safeDocument.addEventListener('touchstart', handleTouchStart, options);
    safeDocument.addEventListener('touchmove', handleTouchMove, options);
    safeDocument.addEventListener('touchend', handleTouchEnd, options);
    
    return () => {
      safeDocument.removeEventListener('touchstart', handleTouchStart);
      safeDocument.removeEventListener('touchmove', handleTouchMove);
      safeDocument.removeEventListener('touchend', handleTouchEnd);
    };
  }, [safeDocument, enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    stopRefreshing,
    pullProgress: Math.min(state.pullDistance / threshold, 1)
  };
};