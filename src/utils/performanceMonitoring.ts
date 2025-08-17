/**
 * Advanced Performance Monitoring System for Medical News
 * Tracks page load times, API responses, user interactions with medical targets
 */

export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // Percentage of sessions to monitor (0-1)
  pageLoadTarget: number; // Target page load time in ms
  apiResponseTarget: number; // Target API response time in ms
  medicalContentPriority: boolean;
  reportingEndpoint: string;
  bufferSize: number;
  batchReportingEnabled: boolean;
}

export interface PerformanceMetric {
  id: string;
  type: 'page_load' | 'api_response' | 'user_interaction' | 'resource_timing' | 'vital';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'ratio';
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  medicalContent?: boolean;
  specialtyContext?: string;
  evidenceLevel?: string;
  metadata?: Record<string, any>;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

export interface PerformanceReport {
  sessionId: string;
  userId?: string;
  specialty?: string;
  timestamp: number;
  pageLoadMetrics: PerformanceMetric[];
  apiMetrics: PerformanceMetric[];
  userInteractionMetrics: PerformanceMetric[];
  webVitals: WebVital[];
  resourceTimings: PerformanceMetric[];
  errors: ErrorMetric[];
  medicalContentPerformance: {
    newsLoadTime: number;
    calculatorResponseTime: number;
    searchResultsTime: number;
    imageLoadTime: number;
  };
  networkInfo: {
    effectiveType: string;
    rtt: number;
    downlink: number;
  };
  deviceInfo: {
    memory?: number;
    cores?: number;
    isMobile: boolean;
    isTablet: boolean;
  };
}

export interface ErrorMetric {
  type: 'javascript' | 'network' | 'resource' | 'medical_data';
  message: string;
  source: string;
  stack?: string;
  timestamp: number;
  url: string;
  medicalContext?: boolean;
}

class PerformanceMonitor {
  private config: PerformanceConfig = {
    enabled: false, // Disabled until API endpoint is implemented
    sampleRate: 0.1, // Monitor 10% of sessions by default
    pageLoadTarget: 2000, // 2 seconds
    apiResponseTarget: 200, // 200ms impact on existing functionality
    medicalContentPriority: true,
    reportingEndpoint: '/api/performance-metrics',
    bufferSize: 100,
    batchReportingEnabled: true
  };

  private sessionId: string;
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVital[] = [];
  private errors: ErrorMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private navigationStart: number = 0;
  private isMonitoring: boolean = false;

  constructor(customConfig?: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...customConfig };
    this.sessionId = this.generateSessionId();
    
    // Determine if this session should be monitored
    this.isMonitoring = Math.random() < this.config.sampleRate;
    
    if (this.isMonitoring && this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (typeof window === 'undefined') return;

    this.navigationStart = performance.timeOrigin || performance.timing?.navigationStart || Date.now();
    
    // Set up observers
    this.setupPerformanceObservers();
    this.setupWebVitalsTracking();
    this.setupErrorTracking();
    this.setupUserInteractionTracking();
    this.setupMedicalContentTracking();
    
    // Track page load
    this.trackPageLoad();
    
    // Set up periodic reporting
    if (this.config.batchReportingEnabled) {
      this.setupPeriodicReporting();
    }
    
    // Track page visibility changes
    this.setupVisibilityTracking();
    
    console.log('[Performance] Monitoring initialized for session:', this.sessionId);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    // Navigation timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.processNavigationEntry(entry as PerformanceNavigationTiming);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);
    } catch (error) {
      console.warn('[Performance] Navigation observer failed:', error);
    }

    // Resource timing for medical content
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.processResourceEntry(entry as PerformanceResourceTiming);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('[Performance] Resource observer failed:', error);
    }

    // Long task tracking
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackMetric({
            type: 'user_interaction',
            name: 'long_task',
            value: entry.duration,
            medicalContent: this.isMedicalContent(entry.name)
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (error) {
      console.warn('[Performance] Long task observer failed:', error);
    }
  }

  /**
   * Setup Web Vitals tracking
   */
  private setupWebVitalsTracking(): void {
    // Import and use web-vitals library if available
    // For now, implement basic vital tracking
    this.trackCoreWebVitals();
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.recordWebVital({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: this.getRating('LCP', lastEntry.startTime),
            delta: lastEntry.startTime,
            id: this.generateMetricId(),
            entries: [lastEntry]
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('[Performance] LCP tracking failed:', error);
      }
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        this.recordWebVital({
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
          delta: clsValue,
          id: this.generateMetricId(),
          entries: list.getEntries()
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('[Performance] CLS tracking failed:', error);
    }

    // First Input Delay (FID) - approximation
    let fidTracked = false;
    const trackFID = (event: Event) => {
      if (fidTracked) return;
      fidTracked = true;
      
      const startTime = performance.now();
      requestIdleCallback(() => {
        const fidValue = performance.now() - startTime;
        this.recordWebVital({
          name: 'FID',
          value: fidValue,
          rating: this.getRating('FID', fidValue),
          delta: fidValue,
          id: this.generateMetricId(),
          entries: []
        });
      });
    };

    ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
      addEventListener(type, trackFID, { once: true, passive: true });
    });
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        source: event.filename || 'unknown',
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        medicalContext: this.isMedicalContent(event.filename || '')
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'javascript',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        source: 'promise',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        medicalContext: true // Assume medical context for unhandled rejections
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        this.trackError({
          type: 'resource',
          message: `Failed to load: ${(target as any).src || (target as any).href}`,
          source: target.tagName.toLowerCase(),
          timestamp: Date.now(),
          url: window.location.href,
          medicalContext: this.isMedicalContent((target as any).src || (target as any).href || '')
        });
      }
    }, true);
  }

  /**
   * Setup user interaction tracking
   */
  private setupUserInteractionTracking(): void {
    // Track medical-specific interactions
    const medicalInteractions = [
      'news-article-click',
      'calculator-use',
      'search-submit',
      'filter-apply',
      'read-later-add'
    ];

    medicalInteractions.forEach(interaction => {
      document.addEventListener(interaction, (event: any) => {
        this.trackMedicalInteraction(interaction, event.detail);
      });
    });

    // Track scroll depth for medical content
    this.setupScrollTracking();
    
    // Track time on medical pages
    this.setupTimeTracking();
  }

  /**
   * Setup medical content specific tracking
   */
  private setupMedicalContentTracking(): void {
    // Track medical news loading performance
    this.trackMedicalNewsPerformance();
    
    // Track calculator response times
    this.trackCalculatorPerformance();
    
    // Track search performance
    this.trackSearchPerformance();
  }

  /**
   * Track page load performance
   */
  private trackPageLoad(): void {
    const loadComplete = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // DOM Content Loaded
        this.trackMetric({
          type: 'page_load',
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          medicalContent: this.isMedicalContent(window.location.pathname)
        });

        // Full page load
        this.trackMetric({
          type: 'page_load',
          name: 'full_page_load',
          value: navigation.loadEventEnd - navigation.navigationStart,
          medicalContent: this.isMedicalContent(window.location.pathname)
        });

        // Time to Interactive (approximation)
        this.trackMetric({
          type: 'page_load',
          name: 'time_to_interactive',
          value: navigation.domInteractive - navigation.navigationStart,
          medicalContent: this.isMedicalContent(window.location.pathname)
        });
      }
    };

    if (document.readyState === 'complete') {
      loadComplete();
    } else {
      window.addEventListener('load', loadComplete);
    }
  }

  /**
   * Process navigation timing entry
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const isMedical = this.isMedicalContent(entry.name);
    
    // DNS lookup time
    if (entry.domainLookupEnd > entry.domainLookupStart) {
      this.trackMetric({
        type: 'page_load',
        name: 'dns_lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        medicalContent: isMedical
      });
    }

    // Connection time
    if (entry.connectEnd > entry.connectStart) {
      this.trackMetric({
        type: 'page_load',
        name: 'connection_time',
        value: entry.connectEnd - entry.connectStart,
        medicalContent: isMedical
      });
    }

    // Server response time
    if (entry.responseStart > entry.requestStart) {
      this.trackMetric({
        type: 'page_load',
        name: 'server_response',
        value: entry.responseStart - entry.requestStart,
        medicalContent: isMedical
      });
    }
  }

  /**
   * Process resource timing entry
   */
  private processResourceEntry(entry: PerformanceResourceTiming): void {
    const isMedical = this.isMedicalContent(entry.name);
    const isAPI = entry.name.includes('/api/');
    const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(entry.name);
    
    // API response time
    if (isAPI) {
      this.trackMetric({
        type: 'api_response',
        name: 'api_response_time',
        value: entry.responseEnd - entry.requestStart,
        medicalContent: isMedical,
        metadata: {
          endpoint: entry.name,
          transferSize: entry.transferSize,
          cached: entry.transferSize === 0
        }
      });
    }

    // Image load time
    if (isImage) {
      this.trackMetric({
        type: 'resource_timing',
        name: 'image_load_time',
        value: entry.responseEnd - entry.startTime,
        medicalContent: isMedical,
        metadata: {
          size: entry.transferSize,
          cached: entry.transferSize === 0
        }
      });
    }

    // Check for slow resources
    const loadTime = entry.responseEnd - entry.startTime;
    if (loadTime > 1000) { // Slower than 1 second
      this.trackMetric({
        type: 'resource_timing',
        name: 'slow_resource',
        value: loadTime,
        medicalContent: isMedical,
        metadata: {
          resource: entry.name,
          size: entry.transferSize
        }
      });
    }
  }

  /**
   * Track medical news performance
   */
  private trackMedicalNewsPerformance(): void {
    const startTime = performance.now();
    
    // Listen for news load events
    document.addEventListener('medical-news-loaded', (event: any) => {
      const loadTime = performance.now() - startTime;
      this.trackMetric({
        type: 'page_load',
        name: 'medical_news_load',
        value: loadTime,
        medicalContent: true,
        specialtyContext: event.detail?.specialty,
        metadata: {
          articleCount: event.detail?.count,
          category: event.detail?.category
        }
      });
    });
  }

  /**
   * Track calculator performance
   */
  private trackCalculatorPerformance(): void {
    document.addEventListener('calculator-execution', (event: any) => {
      this.trackMetric({
        type: 'api_response',
        name: 'calculator_response',
        value: event.detail?.executionTime || 0,
        medicalContent: true,
        specialtyContext: event.detail?.specialty,
        metadata: {
          calculatorType: event.detail?.type,
          inputCount: event.detail?.inputs?.length
        }
      });
    });
  }

  /**
   * Track search performance
   */
  private trackSearchPerformance(): void {
    document.addEventListener('search-completed', (event: any) => {
      this.trackMetric({
        type: 'api_response',
        name: 'search_response',
        value: event.detail?.responseTime || 0,
        medicalContent: true,
        specialtyContext: event.detail?.specialty,
        metadata: {
          query: event.detail?.query,
          resultCount: event.detail?.resultCount,
          providers: event.detail?.providers
        }
      });
    });
  }

  /**
   * Setup scroll tracking
   */
  private setupScrollTracking(): void {
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
    
    // Report scroll depth on page unload
    window.addEventListener('beforeunload', () => {
      this.trackMetric({
        type: 'user_interaction',
        name: 'scroll_depth',
        value: maxScroll,
        unit: 'ratio',
        medicalContent: this.isMedicalContent(window.location.pathname)
      });
    });
  }

  /**
   * Setup time tracking
   */
  private setupTimeTracking(): void {
    const startTime = Date.now();
    let isVisible = !document.hidden;
    let totalVisibleTime = 0;
    let lastVisibilityChangeTime = startTime;
    
    const updateVisibleTime = () => {
      if (isVisible) {
        totalVisibleTime += Date.now() - lastVisibilityChangeTime;
      }
      lastVisibilityChangeTime = Date.now();
    };

    document.addEventListener('visibilitychange', () => {
      updateVisibleTime();
      isVisible = !document.hidden;
    });

    window.addEventListener('beforeunload', () => {
      updateVisibleTime();
      this.trackMetric({
        type: 'user_interaction',
        name: 'time_on_page',
        value: totalVisibleTime,
        medicalContent: this.isMedicalContent(window.location.pathname)
      });
    });
  }

  /**
   * Setup visibility tracking
   */
  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportMetrics(); // Report when page becomes hidden
      }
    });
  }

  /**
   * Setup periodic reporting
   */
  private setupPeriodicReporting(): void {
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.reportMetrics();
      }
    }, 30000); // Report every 30 seconds
  }

  /**
   * Track a performance metric
   */
  trackMetric(options: {
    type: PerformanceMetric['type'];
    name: string;
    value: number;
    unit?: PerformanceMetric['unit'];
    medicalContent?: boolean;
    specialtyContext?: string;
    evidenceLevel?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      type: options.type,
      name: options.name,
      value: options.value,
      unit: options.unit || 'ms',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      medicalContent: options.medicalContent || false,
      specialtyContext: options.specialtyContext,
      evidenceLevel: options.evidenceLevel,
      metadata: options.metadata
    };

    this.metrics.push(metric);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    // Auto-report if buffer is full
    if (this.metrics.length >= this.config.bufferSize) {
      this.reportMetrics();
    }
  }

  /**
   * Track medical interaction
   */
  trackMedicalInteraction(interactionType: string, details: any): void {
    this.trackMetric({
      type: 'user_interaction',
      name: interactionType,
      value: performance.now(),
      medicalContent: true,
      specialtyContext: details?.specialty,
      metadata: details
    });
  }

  /**
   * Track error
   */
  trackError(error: ErrorMetric): void {
    if (!this.isMonitoring) return;
    
    this.errors.push(error);
    
    // Report critical errors immediately
    if (error.medicalContext) {
      this.reportMetrics();
    }
  }

  /**
   * Record Web Vital
   */
  recordWebVital(vital: WebVital): void {
    if (!this.isMonitoring) return;
    
    this.webVitals.push(vital);
    
    // Report poor vitals immediately
    if (vital.rating === 'poor') {
      this.reportMetrics();
    }
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metric: PerformanceMetric): void {
    let shouldAlert = false;
    let alertMessage = '';

    // Check page load performance
    if (metric.type === 'page_load' && metric.name === 'full_page_load') {
      if (metric.value > this.config.pageLoadTarget) {
        shouldAlert = true;
        alertMessage = `Slow page load: ${metric.value}ms (target: ${this.config.pageLoadTarget}ms)`;
      }
    }

    // Check API response performance
    if (metric.type === 'api_response') {
      if (metric.value > this.config.apiResponseTarget) {
        shouldAlert = true;
        alertMessage = `Slow API response: ${metric.value}ms (target: ${this.config.apiResponseTarget}ms)`;
      }
    }

    // Prioritize medical content alerts
    if (shouldAlert && metric.medicalContent && this.config.medicalContentPriority) {
      console.warn(`[Performance Alert - Medical] ${alertMessage}`, metric);
      
      // Could integrate with alerting system here
      // this.sendAlert(alertMessage, metric);
    }
  }

  /**
   * Generate metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Check if content is medical-related
   */
  private isMedicalContent(url: string): boolean {
    const medicalKeywords = [
      '/medical-search',
      '/calculators',
      '/news',
      'medical',
      'clinical',
      'cardiology',
      'obgyn'
    ];
    
    return medicalKeywords.some(keyword => url.toLowerCase().includes(keyword));
  }

  /**
   * Get Web Vital rating
   */
  private getRating(vital: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'CLS': { good: 0.1, poor: 0.25 },
      'FID': { good: 100, poor: 300 },
      'FCP': { good: 1800, poor: 3000 },
      'LCP': { good: 2500, poor: 4000 },
      'TTFB': { good: 800, poor: 1800 }
    };

    const threshold = thresholds[vital as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const networkInfo = this.getNetworkInfo();
    const deviceInfo = this.getDeviceInfo();
    
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      pageLoadMetrics: this.metrics.filter(m => m.type === 'page_load'),
      apiMetrics: this.metrics.filter(m => m.type === 'api_response'),
      userInteractionMetrics: this.metrics.filter(m => m.type === 'user_interaction'),
      webVitals: this.webVitals,
      resourceTimings: this.metrics.filter(m => m.type === 'resource_timing'),
      errors: this.errors,
      medicalContentPerformance: this.calculateMedicalContentPerformance(),
      networkInfo,
      deviceInfo
    };
  }

  /**
   * Calculate medical content performance
   */
  private calculateMedicalContentPerformance() {
    const medicalMetrics = this.metrics.filter(m => m.medicalContent);
    
    return {
      newsLoadTime: this.getAverageMetricValue(medicalMetrics, 'medical_news_load'),
      calculatorResponseTime: this.getAverageMetricValue(medicalMetrics, 'calculator_response'),
      searchResultsTime: this.getAverageMetricValue(medicalMetrics, 'search_response'),
      imageLoadTime: this.getAverageMetricValue(medicalMetrics, 'image_load_time')
    };
  }

  /**
   * Get average metric value
   */
  private getAverageMetricValue(metrics: PerformanceMetric[], name: string): number {
    const matchingMetrics = metrics.filter(m => m.name === name);
    if (matchingMetrics.length === 0) return 0;
    
    const sum = matchingMetrics.reduce((total, metric) => total + metric.value, 0);
    return sum / matchingMetrics.length;
  }

  /**
   * Get network information
   */
  private getNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      rtt: connection?.rtt || 0,
      downlink: connection?.downlink || 0
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    return {
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      isTablet: /Tablet|iPad/i.test(navigator.userAgent)
    };
  }

  /**
   * Report metrics to server
   */
  async reportMetrics(): Promise<void> {
    if (!this.isMonitoring || this.metrics.length === 0) return;

    try {
      const report = this.generateReport();
      
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      // Clear reported metrics
      this.metrics = [];
      this.webVitals = [];
      this.errors = [];

      console.log('[Performance] Metrics reported successfully');
    } catch (error) {
      console.warn('[Performance] Failed to report metrics:', error);
    }
  }

  /**
   * Get current performance stats
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      metricsCount: this.metrics.length,
      vitalsCount: this.webVitals.length,
      errorsCount: this.errors.length,
      isMonitoring: this.isMonitoring,
      medicalContentMetrics: this.metrics.filter(m => m.medicalContent).length
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.isMonitoring = enabled && Math.random() < this.config.sampleRate;
    
    if (!enabled) {
      this.cleanup();
    } else if (this.isMonitoring) {
      this.initialize();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup observers and listeners
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Report final metrics
    if (this.metrics.length > 0) {
      this.reportMetrics();
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for custom implementations
export default PerformanceMonitor;