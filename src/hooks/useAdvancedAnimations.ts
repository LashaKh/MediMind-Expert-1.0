import { useRef, useEffect, useState, useCallback } from 'react';

/* MEDIMIND EXPERT - ADVANCED ANIMATION HOOKS */
/* Performance-optimized hooks for world-class profile animations */

/**
 * Hook for managing card entrance animations with staggered delays
 */
export const useCardEntranceAnimation = (delay: number = 0) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            element.classList.add('animate-card-entrance');
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return { elementRef, isVisible };
};

/**
 * Hook for magnetic hover effects on interactive elements
 */
export const useMagneticHover = () => {
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 50;

    if (distance < maxDistance) {
      const strength = (maxDistance - distance) / maxDistance;
      const moveX = (x / distance) * strength * 8;
      const moveY = (y / distance) * strength * 8;

      element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
    } else {
      element.style.transform = 'translate(0, 0) scale(1)';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const element = elementRef.current;
    if (element) {
      element.style.transform = 'translate(0, 0) scale(1)';
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return elementRef;
};

/**
 * Hook for animated counters with smooth transitions
 */
export const useAnimatedCounter = (
  endValue: number,
  duration: number = 2000,
  startOnVisible: boolean = true
) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!startOnVisible) {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setCurrentValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, endValue, duration]);

  return { elementRef, currentValue, isAnimating: currentValue < endValue };
};

/**
 * Hook for managing glass morphism pulse animation
 */
export const useGlassMorphismPulse = (isActive: boolean = true) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isActive) {
      element.classList.add('animate-glass-morphism-pulse');
    } else {
      element.classList.remove('animate-glass-morphism-pulse');
    }

    return () => {
      element.classList.remove('animate-glass-morphism-pulse');
    };
  }, [isActive]);

  return elementRef;
};

/**
 * Hook for particle system background animations
 */
export const useParticleAnimation = (particleCount: number = 20) => {
  const containerRef = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 2,
    }));

    setParticles(newParticles);
  }, [particleCount]);

  return { containerRef, particles };
};

/**
 * Hook for professional progress ring animation
 */
export const useProgressRing = (percentage: number, radius: number = 45) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease out cubic
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = percentage * easeOutCubic;
      
      setAnimatedPercentage(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, percentage]);

  return {
    elementRef,
    strokeDasharray,
    strokeDashoffset,
    animatedPercentage
  };
};

/**
 * Hook for touch ripple effects on mobile devices
 */
export const useTouchRipple = () => {
  const elementRef = useRef<HTMLElement>(null);

  const createRipple = useCallback((e: TouchEvent | MouseEvent) => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (e as TouchEvent).touches?.[0]?.clientX || (e as MouseEvent).clientX;
    const y = (e as TouchEvent).touches?.[0]?.clientY || (e as MouseEvent).clientY;

    const ripple = document.createElement('div');
    ripple.className = 'absolute rounded-full bg-white/30 animate-touch-ripple pointer-events-none';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = `${x - rect.left - 10}px`;
    ripple.style.top = `${y - rect.top - 10}px`;

    element.appendChild(ripple);

    setTimeout(() => {
      if (element.contains(ripple)) {
        element.removeChild(ripple);
      }
    }, 600);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouch = (e: TouchEvent) => createRipple(e);
    const handleClick = (e: MouseEvent) => createRipple(e);

    element.addEventListener('touchstart', handleTouch);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('touchstart', handleTouch);
      element.removeEventListener('click', handleClick);
    };
  }, [createRipple]);

  return elementRef;
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (
  animationClass: string,
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isTriggered) {
          element.classList.add(animationClass);
          setIsTriggered(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationClass, threshold, rootMargin, isTriggered]);

  return { elementRef, isTriggered };
};

/**
 * Hook for managing multiple staggered animations
 */
export const useStaggeredAnimation = (
  items: any[],
  baseDelay: number = 100,
  animationClass: string = 'animate-fade-in-up'
) => {
  const containerRef = useRef<HTMLElement>(null);
  const [triggeredItems, setTriggeredItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((_, index) => {
            setTimeout(() => {
              const element = container.children[index] as HTMLElement;
              if (element) {
                element.classList.add(animationClass);
                setTriggeredItems(prev => new Set([...prev, index]));
              }
            }, index * baseDelay);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [items, baseDelay, animationClass]);

  return { containerRef, triggeredItems };
};

/**
 * Performance monitoring hook for animations
 */
export const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60);
  const [isPerformanceGood, setIsPerformanceGood] = useState(true);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const currentFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFPS);
        setIsPerformanceGood(currentFPS >= 50); // 50 FPS threshold

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return { fps, isPerformanceGood };
};

/**
 * Gesture-based animation hook for mobile interactions
 */
export const useGestureAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  const [gestureState, setGestureState] = useState({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setGestureState({
      isActive: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!gestureState.isActive) return;

    const touch = e.touches[0];
    setGestureState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  }, [gestureState.isActive]);

  const handleTouchEnd = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const deltaX = gestureState.currentX - gestureState.startX;
  const deltaY = gestureState.currentY - gestureState.startY;

  return {
    elementRef,
    gestureState,
    deltaX,
    deltaY,
    isGesturing: gestureState.isActive,
  };
}; 