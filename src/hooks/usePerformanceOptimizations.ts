import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, throttle } from 'lodash';

// Virtual scrolling for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    return { start: Math.max(0, start), end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight]);

  const onScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      setIsScrolling(true);
    }, 16),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsScrolling(false), 150);
    return () => clearTimeout(timer);
  }, [scrollTop]);

  return {
    visibleItems,
    onScroll,
    isScrolling,
    totalHeight: items.length * itemHeight,
    containerProps: {
      style: { height: containerHeight, overflow: 'auto' },
      onScroll
    }
  };
};

// Debounced search
export const useDebouncedSearch = (
  initialValue: string = '',
  delay: number = 300
) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const debouncedSetValue = useCallback(
    debounce((newValue: string) => {
      setDebouncedValue(newValue);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetValue(value);
  }, [value, debouncedSetValue]);

  return [debouncedValue, setValue] as const;
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
};

// Image lazy loading with placeholder
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (hasIntersected && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsError(true);
      };
      img.src = src;
    }
  }, [hasIntersected, src]);

  return { ref, src: imageSrc, isLoaded, isError };
};

// Memoized calculations
export const useMemoizedCalculation = <T, R>(
  fn: (data: T) => R,
  data: T,
  dependencies: any[] = []
) => {
  return useMemo(() => fn(data), [data, ...dependencies]);
};

// Throttled window events
export const useThrottledWindowEvent = (
  eventType: keyof WindowEventMap,
  handler: (event: Event) => void,
  delay: number = 100
) => {
  const throttledHandler = useCallback(throttle(handler, delay), [handler, delay]);

  useEffect(() => {
    window.addEventListener(eventType, throttledHandler);
    return () => window.removeEventListener(eventType, throttledHandler);
  }, [eventType, throttledHandler]);
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {

    }
  });

  const logPerformance = useCallback((action: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - ${action}: ${duration.toFixed(2)}ms`);
    }
  }, [componentName]);

  return { renderCount: renderCountRef.current, logPerformance };
};

// Optimized state updates
export const useOptimizedState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev)
        : newState;
      
      // Only update if the state actually changed
      if (JSON.stringify(nextState) !== JSON.stringify(stateRef.current)) {
        stateRef.current = nextState;
        return nextState;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, optimizedSetState] as const;
};

// Batched updates for better performance
export const useBatchedUpdates = () => {
  const updateQueue = useRef<(() => void)[]>([]);
  const isScheduled = useRef(false);

  const batchUpdate = useCallback((updateFn: () => void) => {
    updateQueue.current.push(updateFn);
    
    if (!isScheduled.current) {
      isScheduled.current = true;
      
      requestAnimationFrame(() => {
        const updates = updateQueue.current.splice(0);
        updates.forEach(update => update());
        isScheduled.current = false;
      });
    }
  }, []);

  return batchUpdate;
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Preload resources
export const usePreloadResources = (resources: string[]) => {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(js|mjs)$/)) {
        link.as = 'script';
      } else if (resource.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
        link.as = 'image';
      } else if (resource.match(/\.(woff|woff2|ttf|eot)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }, [resources]);
};

// FPS monitoring
export const useFPSMonitor = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return fps;
};

export default {
  useVirtualScrolling,
  useDebouncedSearch,
  useIntersectionObserver,
  useLazyImage,
  useMemoizedCalculation,
  useThrottledWindowEvent,
  usePerformanceMonitor,
  useOptimizedState,
  useBatchedUpdates,
  useMemoryMonitor,
  usePreloadResources,
  useFPSMonitor
};