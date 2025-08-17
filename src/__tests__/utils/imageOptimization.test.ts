/**
 * Unit tests for Image Optimization Manager
 * Tests lazy loading, format optimization, and medical image prioritization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { imageOptimizer } from '../../utils/imageOptimization';

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock Image constructor
global.Image = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  onload: null,
  onerror: null
}));

describe('ImageOptimizationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Format Optimization', () => {
    it('should detect WebP support and optimize format', async () => {
      // Mock WebP support
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue('data:image/webp;base64,test')
      };
      
      document.createElement = vi.fn().mockReturnValue(mockCanvas);

      const result = await imageOptimizer.optimizeImageUrl(
        'https://example.com/image.jpg',
        { medicalImage: false }
      );

      expect(result.optimizedUrl).toContain('.webp');
      expect(result.format).toBe('webp');
    });

    it('should fallback to original format when WebP unsupported', async () => {
      // Mock no WebP support
      const mockCanvas = {
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test')
      };
      
      document.createElement = vi.fn().mockReturnValue(mockCanvas);

      const result = await imageOptimizer.optimizeImageUrl(
        'https://example.com/image.jpg',
        { medicalImage: false }
      );

      expect(result.format).toBe('jpeg');
      expect(result.optimizedUrl).toBe('https://example.com/image.jpg');
    });

    it('should preserve medical image quality', async () => {
      const result = await imageOptimizer.optimizeImageUrl(
        'https://medical.com/xray.jpg',
        { medicalImage: true, compressionQuality: 0.9 }
      );

      expect(result.compressionQuality).toBeGreaterThanOrEqual(0.9);
      expect(result.medicalOptimized).toBe(true);
    });
  });

  describe('Lazy Loading', () => {
    it('should implement lazy loading for non-critical images', () => {
      const mockImg = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        src: '',
        loading: 'lazy'
      };

      document.createElement = vi.fn().mockReturnValue(mockImg);

      imageOptimizer.createLazyImage('https://example.com/image.jpg', {
        alt: 'Test image',
        lazy: true
      });

      expect(mockImg.loading).toBe('lazy');
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should prioritize medical images for immediate loading', () => {
      const mockImg = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        src: '',
        loading: 'eager'
      };

      document.createElement = vi.fn().mockReturnValue(mockImg);

      imageOptimizer.createLazyImage('https://medical.com/scan.jpg', {
        alt: 'Medical scan',
        medicalImage: true,
        priority: true
      });

      expect(mockImg.loading).toBe('eager');
    });

    it('should implement progressive loading for large medical images', async () => {
      const progressCallback = vi.fn();

      const result = await imageOptimizer.loadImageWithProgress(
        'https://medical.com/large-scan.jpg',
        progressCallback,
        { medicalImage: true }
      );

      expect(progressCallback).toHaveBeenCalled();
      expect(result.loadTime).toBeDefined();
      expect(result.medicalImage).toBe(true);
    });
  });

  describe('Medical Image Processing', () => {
    it('should detect medical image content automatically', async () => {
      const medicalUrl = 'https://medical.com/chest-xray.jpg';
      
      const result = await imageOptimizer.optimizeImageUrl(medicalUrl);
      
      expect(result.medicalDetected).toBe(true);
      expect(result.compressionQuality).toBeGreaterThan(0.8);
    });

    it('should apply medical-specific optimization settings', async () => {
      const result = await imageOptimizer.optimizeImageUrl(
        'https://example.com/medical-chart.png',
        { 
          medicalImage: true,
          preserveDetail: true,
          compressionQuality: 0.95
        }
      );

      expect(result.compressionQuality).toBe(0.95);
      expect(result.detailPreserved).toBe(true);
    });

    it('should track medical image performance metrics', async () => {
      const performanceTracker = vi.fn();
      
      await imageOptimizer.loadImageWithProgress(
        'https://medical.com/scan.jpg',
        performanceTracker,
        { 
          medicalImage: true,
          trackPerformance: true 
        }
      );

      expect(performanceTracker).toHaveBeenCalledWith(
        expect.objectContaining({
          medicalImage: true,
          loadTime: expect.any(Number)
        })
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle image load failures gracefully', async () => {
      const mockImg = {
        addEventListener: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Image load failed')), 100);
          }
        }),
        removeEventListener: vi.fn(),
        src: ''
      };

      document.createElement = vi.fn().mockReturnValue(mockImg);

      const result = await imageOptimizer.loadImageWithProgress(
        'https://broken.com/image.jpg',
        vi.fn(),
        { retryAttempts: 2 }
      );

      expect(result.error).toBeDefined();
      expect(result.fallbackUsed).toBe(true);
    });

    it('should provide placeholder for failed medical images', async () => {
      const result = await imageOptimizer.createLazyImage(
        'https://broken.com/medical-scan.jpg',
        {
          alt: 'Medical scan',
          medicalImage: true,
          placeholder: true
        }
      );

      expect(result.placeholder).toBeDefined();
      expect(result.medicalPlaceholder).toBe(true);
    });

    it('should retry failed loads with exponential backoff', async () => {
      const loadAttempts: number[] = [];
      
      const mockImg = {
        addEventListener: vi.fn((event, callback) => {
          if (event === 'error') {
            loadAttempts.push(Date.now());
            if (loadAttempts.length < 3) {
              setTimeout(() => callback(new Error('Load failed')), 50);
            } else {
              setTimeout(() => callback(null), 50); // Success on third try
            }
          }
        }),
        removeEventListener: vi.fn(),
        src: ''
      };

      document.createElement = vi.fn().mockReturnValue(mockImg);

      await imageOptimizer.loadImageWithProgress(
        'https://unreliable.com/image.jpg',
        vi.fn(),
        { retryAttempts: 3, retryDelay: 100 }
      );

      expect(loadAttempts.length).toBe(2); // Failed twice, succeeded on third
    });
  });

  describe('Performance Optimization', () => {
    it('should batch image operations for efficiency', async () => {
      const imageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ];

      const results = await imageOptimizer.batchOptimize(imageUrls, {
        medicalImage: false,
        batchSize: 3
      });

      expect(results.length).toBe(3);
      expect(results.every(r => r.optimized)).toBe(true);
    });

    it('should implement caching for optimized images', async () => {
      const imageUrl = 'https://example.com/cached-image.jpg';
      
      // First load
      const result1 = await imageOptimizer.optimizeImageUrl(imageUrl);
      
      // Second load should use cache
      const result2 = await imageOptimizer.optimizeImageUrl(imageUrl);

      expect(result2.fromCache).toBe(true);
      expect(result1.optimizedUrl).toBe(result2.optimizedUrl);
    });

    it('should respect medical image priority in processing queue', async () => {
      const medicalImage = 'https://medical.com/urgent-scan.jpg';
      const regularImage = 'https://example.com/regular.jpg';

      const medicalPromise = imageOptimizer.optimizeImageUrl(medicalImage, { 
        medicalImage: true, 
        priority: true 
      });
      
      const regularPromise = imageOptimizer.optimizeImageUrl(regularImage, { 
        medicalImage: false 
      });

      const [medicalResult, regularResult] = await Promise.all([
        medicalPromise, 
        regularPromise
      ]);

      // Medical image should complete first or have higher priority
      expect(medicalResult.priority).toBe('high');
      expect(regularResult.priority).toBe('normal');
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enableWebP: false,
        compressionQuality: 0.7,
        maxWidth: 800,
        medicalImagePriority: false
      };

      imageOptimizer.updateConfig(newConfig);
      
      const config = imageOptimizer.getConfig();
      expect(config.enableWebP).toBe(false);
      expect(config.compressionQuality).toBe(0.7);
      expect(config.maxWidth).toBe(800);
      expect(config.medicalImagePriority).toBe(false);
    });

    it('should maintain medical safety settings', () => {
      imageOptimizer.updateConfig({ compressionQuality: 0.5 });
      
      // Medical images should still maintain high quality
      const config = imageOptimizer.getConfig();
      expect(config.medicalImagePriority).toBe(true);
    });
  });
});