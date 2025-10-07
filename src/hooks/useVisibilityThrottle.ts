import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseVisibilityThrottleOptions {
  /**
   * Callback to execute when throttle allows
   */
  callback: () => void;

  /**
   * Throttle interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;

  /**
   * Whether to pause when tab is hidden
   * @default true
   */
  pauseWhenHidden?: boolean;

  /**
   * Whether to execute immediately on visibility change
   * @default true
   */
  executeOnVisibilityChange?: boolean;

  /**
   * Whether throttling is enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook to throttle callbacks based on page visibility
 *
 * Features:
 * - Pauses execution when tab is hidden (Page Visibility API)
 * - Resumes execution when tab becomes visible
 * - Configurable throttle interval
 * - Battery-friendly - no updates when user is away
 *
 * @example
 * ```typescript
 * useVisibilityThrottle({
 *   callback: () => {
 *     fetchLatestData();
 *   },
 *   interval: 30000, // 30 seconds
 *   pauseWhenHidden: true
 * });
 * ```
 */
export function useVisibilityThrottle({
  callback,
  interval = 30000,
  pauseWhenHidden = true,
  executeOnVisibilityChange = true,
  enabled = true
}: UseVisibilityThrottleOptions) {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const callbackRef = useRef(callback);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecutionRef = useRef<number>(Date.now());

  // Keep callback ref current
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Execute callback with throttle check
  const executeCallback = useCallback(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionRef.current;

    // Only execute if enough time has passed
    if (timeSinceLastExecution >= interval) {
      callbackRef.current();
      lastExecutionRef.current = now;
    }
  }, [interval]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden;
    setIsVisible(visible);

    // Execute callback immediately when becoming visible if enabled
    if (visible && executeOnVisibilityChange && enabled) {
      callbackRef.current();
      lastExecutionRef.current = Date.now();
    }
  }, [executeOnVisibilityChange, enabled]);

  // Setup visibility listener
  useEffect(() => {
    if (!pauseWhenHidden || !enabled) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pauseWhenHidden, handleVisibilityChange, enabled]);

  // Setup throttled interval
  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Only run interval when visible or when pauseWhenHidden is false
    const shouldRun = !pauseWhenHidden || isVisible;

    if (shouldRun) {
      // Clear existing interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      // Setup new interval
      intervalIdRef.current = setInterval(() => {
        executeCallback();
      }, interval);

      // Execute immediately on setup
      executeCallback();
    } else {
      // Clear interval when not visible
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [enabled, isVisible, pauseWhenHidden, interval, executeCallback]);

  return {
    isVisible,
    isPaused: pauseWhenHidden && !isVisible,
    lastExecution: lastExecutionRef.current
  };
}

/**
 * Simple hook to track page visibility
 *
 * @example
 * ```typescript
 * const isVisible = usePageVisibility();
 *
 * useEffect(() => {
 *   if (isVisible) {
 *     // Resume operations
 *   } else {
 *     // Pause operations
 *   }
 * }, [isVisible]);
 * ```
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Hook to throttle a value update based on visibility
 *
 * @example
 * ```typescript
 * const throttledValue = useThrottledValue(someValue, {
 *   interval: 5000,
 *   pauseWhenHidden: true
 * });
 * ```
 */
export function useThrottledValue<T>(
  value: T,
  options: Omit<UseVisibilityThrottleOptions, 'callback'> = {}
): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  useVisibilityThrottle({
    ...options,
    callback: () => {
      setThrottledValue(value);
    }
  });

  return throttledValue;
}
