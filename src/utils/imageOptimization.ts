/**
 * Advanced Image Optimization for Medical News Content
 * Implements lazy loading, compression, and format conversion
 */

import React from 'react';

export interface ImageOptimizationConfig {
  enableWebP: boolean;
  enableAVIF: boolean;
  lazyLoadingEnabled: boolean;
  compressionQuality: number;
  maxWidth: number;
  maxHeight: number;
  placeholderEnabled: boolean;
  retryAttempts: number;
  medicalImagePriority: boolean;
}

export interface OptimizedImageData {
  src: string;
  srcSet: string;
  placeholder: string;
  alt: string;
  width?: number;
  height?: number;
  format: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  loadingStrategy: 'eager' | 'lazy';
  medicalRelevance?: 'high' | 'medium' | 'low';
}

export interface ImageLoadingStats {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  cachedImages: number;
  averageLoadTime: number;
  bandwidthSaved: number;
  medicalImagesLoaded: number;
}

class ImageOptimizationManager {
  private config: ImageOptimizationConfig = {
    enableWebP: true,
    enableAVIF: false, // Limited browser support
    lazyLoadingEnabled: true,
    compressionQuality: 0.85,
    maxWidth: 1200,
    maxHeight: 800,
    placeholderEnabled: true,
    retryAttempts: 3,
    medicalImagePriority: true
  };

  private loadingStats: ImageLoadingStats = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    cachedImages: 0,
    averageLoadTime: 0,
    bandwidthSaved: 0,
    medicalImagesLoaded: 0
  };

  private imageCache = new Map<string, OptimizedImageData>();
  private loadingQueue = new Map<string, Promise<OptimizedImageData>>();
  private intersectionObserver?: IntersectionObserver;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.initializeObservers();
    this.setupPerformanceMonitoring();
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.intersectionObserver!.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before viewport
          threshold: 0.1
        }
      );
    }
  }

  /**
   * Setup performance monitoring for images
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
          this.updateLoadingStats(entry as PerformanceResourceTiming);
        }
      });
    });

    this.performanceObserver.observe({ entryTypes: ['resource'] });
  }

  /**
   * Update loading statistics
   */
  private updateLoadingStats(entry: PerformanceResourceTiming): void {
    this.loadingStats.totalImages++;
    
    if (entry.transferSize > 0) {
      this.loadingStats.loadedImages++;
      
      // Calculate average load time
      const loadTime = entry.responseEnd - entry.startTime;
      this.loadingStats.averageLoadTime = (
        (this.loadingStats.averageLoadTime * (this.loadingStats.loadedImages - 1) + loadTime) /
        this.loadingStats.loadedImages
      );
      
      // Check if cached
      if (entry.transferSize === 0) {
        this.loadingStats.cachedImages++;
      }
    } else {
      this.loadingStats.failedImages++;
    }
  }

  /**
   * Detect browser format support
   */
  private async detectFormatSupport(): Promise<{
    webp: boolean;
    avif: boolean;
  }> {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    // AVIF detection is more complex
    let avifSupport = false;
    try {
      const avifImage = new Image();
      avifSupport = await new Promise((resolve) => {
        avifImage.onload = () => resolve(true);
        avifImage.onerror = () => resolve(false);
        avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWZcaBCQCU';
      });
    } catch {
      avifSupport = false;
    }
    
    return { webp: webpSupport, avif: avifSupport };
  }

  /**
   * Generate optimized image URLs
   */
  private generateOptimizedUrls(
    originalUrl: string,
    width: number,
    height: number,
    formats: { webp: boolean; avif: boolean }
  ): { src: string; srcSet: string } {
    // For external URLs, we can't always optimize, so we'll provide the original
    // In a real implementation, you'd use a service like Cloudinary or ImageKit
    
    const baseUrl = originalUrl;
    const srcSet: string[] = [];
    
    // Generate different sizes
    const sizes = [
      { w: Math.floor(width * 0.5), suffix: '0.5x' },
      { w: width, suffix: '1x' },
      { w: Math.floor(width * 1.5), suffix: '1.5x' },
      { w: Math.floor(width * 2), suffix: '2x' }
    ];
    
    sizes.forEach(({ w, suffix }) => {
      // In production, replace with actual optimization service
      if (formats.webp && this.config.enableWebP) {
        srcSet.push(`${baseUrl}?w=${w}&f=webp ${suffix}`);
      } else {
        srcSet.push(`${baseUrl}?w=${w} ${suffix}`);
      }
    });
    
    return {
      src: `${baseUrl}?w=${width}`,
      srcSet: srcSet.join(', ')
    };
  }

  /**
   * Generate placeholder image
   */
  private generatePlaceholder(width: number, height: number, alt: string): string {
    if (!this.config.placeholderEnabled) return '';
    
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" aria-label="${alt}">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="20%" y="20%" width="60%" height="60%" fill="#e5e7eb" rx="4"/>
        <circle cx="35%" cy="35%" r="8%" fill="#d1d5db"/>
        <polygon points="45%,50% 55%,40% 65%,50% 75%,60% 45%,60%" fill="#d1d5db"/>
        <text x="50%" y="75%" text-anchor="middle" fill="#9ca3af" font-size="12" font-family="sans-serif">
          Medical Image
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Determine if image is medical content
   */
  private analyzeMedicalRelevance(
    url: string,
    alt: string,
    context?: string
  ): 'high' | 'medium' | 'low' {
    const medicalKeywords = [
      'medical', 'clinical', 'patient', 'doctor', 'hospital', 'surgery',
      'diagnostic', 'treatment', 'therapy', 'pharmaceutical', 'drug',
      'anatomy', 'pathology', 'radiology', 'cardiology', 'oncology'
    ];
    
    const text = `${url} ${alt} ${context || ''}`.toLowerCase();
    const matchCount = medicalKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (matchCount >= 3) return 'high';
    if (matchCount >= 1) return 'medium';
    return 'low';
  }

  /**
   * Optimize image with medical context
   */
  async optimizeImage(
    originalUrl: string,
    options: {
      alt: string;
      width?: number;
      height?: number;
      priority?: boolean;
      medicalContext?: string;
      loadingStrategy?: 'eager' | 'lazy';
    }
  ): Promise<OptimizedImageData> {
    const cacheKey = `${originalUrl}_${options.width || 'auto'}_${options.height || 'auto'}`;
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }
    
    // Check if already loading
    if (this.loadingQueue.has(cacheKey)) {
      return await this.loadingQueue.get(cacheKey)!;
    }
    
    // Start optimization process
    const optimizationPromise = this.performOptimization(originalUrl, options);
    this.loadingQueue.set(cacheKey, optimizationPromise);
    
    try {
      const result = await optimizationPromise;
      this.imageCache.set(cacheKey, result);
      return result;
    } finally {
      this.loadingQueue.delete(cacheKey);
    }
  }

  /**
   * Perform actual image optimization
   */
  private async performOptimization(
    originalUrl: string,
    options: {
      alt: string;
      width?: number;
      height?: number;
      priority?: boolean;
      medicalContext?: string;
      loadingStrategy?: 'eager' | 'lazy';
    }
  ): Promise<OptimizedImageData> {
    const formats = await this.detectFormatSupport();
    const medicalRelevance = this.analyzeMedicalRelevance(
      originalUrl,
      options.alt,
      options.medicalContext
    );
    
    // Determine dimensions
    const width = options.width || this.config.maxWidth;
    const height = options.height || this.config.maxHeight;
    
    // Generate optimized URLs
    const { src, srcSet } = this.generateOptimizedUrls(originalUrl, width, height, formats);
    
    // Generate placeholder
    const placeholder = this.generatePlaceholder(width, height, options.alt);
    
    // Calculate estimated sizes (simplified)
    const originalSize = width * height * 3; // Rough estimate
    const optimizedSize = Math.floor(originalSize * this.config.compressionQuality);
    const compressionRatio = originalSize / optimizedSize;
    
    // Determine loading strategy
    const loadingStrategy = options.loadingStrategy || 
      (options.priority || medicalRelevance === 'high' ? 'eager' : 'lazy');
    
    const optimizedData: OptimizedImageData = {
      src,
      srcSet,
      placeholder,
      alt: options.alt,
      width,
      height,
      format: formats.webp ? 'webp' : 'jpeg',
      originalSize,
      optimizedSize,
      compressionRatio,
      loadingStrategy,
      medicalRelevance
    };
    
    // Update stats
    if (medicalRelevance === 'high' || medicalRelevance === 'medium') {
      this.loadingStats.medicalImagesLoaded++;
    }
    
    this.loadingStats.bandwidthSaved += (originalSize - optimizedSize);
    
    return optimizedData;
  }

  /**
   * Load image with error handling and retries
   */
  private async loadImage(img: HTMLImageElement): Promise<void> {
    const originalSrc = img.dataset.src || img.src;
    const srcSet = img.dataset.srcset;
    
    let attempts = 0;
    const maxAttempts = this.config.retryAttempts;
    
    const attemptLoad = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const tempImg = new Image();
        
        tempImg.onload = () => {
          img.src = originalSrc;
          if (srcSet) img.srcset = srcSet;
          img.classList.remove('loading');
          img.classList.add('loaded');
          resolve();
        };
        
        tempImg.onerror = () => {
          attempts++;
          if (attempts < maxAttempts) {
            // Exponential backoff
            setTimeout(() => {
              attemptLoad().then(resolve).catch(reject);
            }, Math.pow(2, attempts) * 1000);
          } else {
            // Show error placeholder
            img.src = this.generatePlaceholder(
              img.width || 300,
              img.height || 200,
              img.alt || 'Failed to load image'
            );
            img.classList.add('error');
            reject(new Error('Failed to load image after retries'));
          }
        };
        
        tempImg.src = originalSrc;
      });
    };
    
    try {
      await attemptLoad();
    } catch (error) {

    }
  }

  /**
   * Setup lazy loading for an image element
   */
  setupLazyLoading(img: HTMLImageElement, optimizedData: OptimizedImageData): void {
    if (!this.config.lazyLoadingEnabled || optimizedData.loadingStrategy === 'eager') {
      // Load immediately
      img.src = optimizedData.src;
      if (optimizedData.srcSet) img.srcset = optimizedData.srcSet;
      return;
    }
    
    // Set placeholder
    if (optimizedData.placeholder) {
      img.src = optimizedData.placeholder;
    }
    
    // Store data for lazy loading
    img.dataset.src = optimizedData.src;
    if (optimizedData.srcSet) img.dataset.srcset = optimizedData.srcSet;
    
    // Add loading class
    img.classList.add('loading');
    
    // Observe for intersection
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  /**
   * Preload critical medical images
   */
  async preloadCriticalImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(async (url) => {
      try {
        const optimizedData = await this.optimizeImage(url, {
          alt: 'Preloaded medical image',
          priority: true,
          loadingStrategy: 'eager',
          medicalContext: 'critical'
        });
        
        // Create and load image
        const img = new Image();
        img.src = optimizedData.src;
        if (optimizedData.srcSet) img.srcset = optimizedData.srcSet;
        
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });
      } catch (error) {

      }
    });
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get image loading statistics
   */
  getLoadingStats(): ImageLoadingStats {
    return { ...this.loadingStats };
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingStats = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      cachedImages: 0,
      averageLoadTime: 0,
      bandwidthSaved: 0,
      medicalImagesLoaded: 0
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ImageOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Create singleton instance
export const imageOptimizer = new ImageOptimizationManager();

/**
 * React hook for optimized images
 */
export function useOptimizedImage(
  src: string,
  options: {
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    medicalContext?: string;
  }
) {
  const [optimizedData, setOptimizedData] = React.useState<OptimizedImageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    let cancelled = false;
    
    imageOptimizer.optimizeImage(src, options)
      .then((data) => {
        if (!cancelled) {
          setOptimizedData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [src, options.width, options.height, options.priority]);
  
  return { optimizedData, loading, error };
}

/**
 * Optimized Image React component
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  medicalContext?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  medicalContext,
  className = '',
  onLoad,
  onError
}) => {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const { optimizedData, loading, error } = useOptimizedImage(src, {
    alt,
    width,
    height,
    priority,
    medicalContext
  });
  
  React.useEffect(() => {
    if (optimizedData && imgRef.current) {
      imageOptimizer.setupLazyLoading(imgRef.current, optimizedData);
      
      const img = imgRef.current;
      const handleLoad = () => onLoad?.();
      const handleError = () => onError?.(error || 'Failed to load image');
      
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      
      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }
  }, [optimizedData, onLoad, onError, error]);
  
  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
        aria-label="Loading image..."
      />
    );
  }
  
  if (error) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }
  
  return (
    <img
      ref={imgRef}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

export default imageOptimizer;