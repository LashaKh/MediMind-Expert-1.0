/**
 * Lazy Loading Service
 * 
 * Provides comprehensive lazy loading capabilities for heavy components,
 * medical calculators, and large datasets in the MediMind application.
 * 
 * Features:
 * - Component-based lazy loading with medical context
 * - Dynamic import management with caching
 * - Loading state management with medical UI
 * - Error boundaries for failed loads
 * - Preloading strategies for better UX
 * - Bundle splitting optimization
 * - Memory-aware loading decisions
 */

import React, { Suspense, ComponentType, LazyExoticComponent } from 'react'

export interface LazyLoadConfig {
  preload?: boolean
  retryOnError?: boolean
  fallbackComponent?: ComponentType
  loadingComponent?: ComponentType
  priority?: 'low' | 'normal' | 'high'
  medicalContext?: 'calculator' | 'chart' | 'report' | 'analysis' | 'general'
}

export interface LazyComponentInfo {
  name: string
  loader: () => Promise<{ default: ComponentType<any> }>
  config: LazyLoadConfig
  isLoaded: boolean
  isLoading: boolean
  lastError?: Error
  loadTime?: number
  retryCount: number
}

export interface LoadingMetrics {
  totalComponents: number
  loadedComponents: number
  loadingComponents: number
  failedComponents: number
  averageLoadTime: number
  totalLoadTime: number
}

export class LazyLoadingService {
  private components = new Map<string, LazyComponentInfo>()
  private loadedBundles = new Set<string>()
  private preloadQueue: string[] = []
  private intersectionObserver?: IntersectionObserver
  private isPreloadingEnabled = true

  constructor() {
    this.setupIntersectionObserver()
    this.setupPreloadScheduler()
  }

  /**
   * Register a lazy component with medical context
   */
  registerComponent<T = any>(
    name: string,
    loader: () => Promise<{ default: ComponentType<T> }>,
    config: LazyLoadConfig = {}
  ): LazyExoticComponent<ComponentType<T>> {
    const componentInfo: LazyComponentInfo = {
      name,
      loader,
      config: {
        priority: 'normal',
        medicalContext: 'general',
        ...config
      },
      isLoaded: false,
      isLoading: false,
      retryCount: 0
    }

    this.components.set(name, componentInfo)

    // Create lazy component with enhanced error handling
    const LazyComponent = React.lazy(async () => {
      return this.loadComponentWithMetrics(name)
    })

    // Preload if requested
    if (config.preload) {
      this.schedulePreload(name)
    }

    return LazyComponent
  }

  /**
   * Load component with comprehensive metrics and error handling
   */
  private async loadComponentWithMetrics(name: string): Promise<{ default: ComponentType<any> }> {
    const info = this.components.get(name)
    if (!info) {
      throw new Error(`Component ${name} not registered`)
    }

    info.isLoading = true
    const startTime = performance.now()

    try {
      console.log(`🔄 Loading medical component: ${name} (${info.config.medicalContext})`)
      
      const result = await info.loader()
      
      const loadTime = performance.now() - startTime
      info.loadTime = loadTime
      info.isLoaded = true
      info.isLoading = false
      info.lastError = undefined

      this.loadedBundles.add(name)
      
      console.log(`✅ Loaded ${name} in ${Math.round(loadTime)}ms`)
      
      // Report metrics
      this.reportLoadingMetrics(name, loadTime, true)
      
      return result
    } catch (error) {
      const loadTime = performance.now() - startTime
      info.loadTime = loadTime
      info.isLoading = false
      info.lastError = error as Error
      info.retryCount++

      console.error(`❌ Failed to load ${name} (attempt ${info.retryCount}):`, error)
      
      // Report error metrics
      this.reportLoadingMetrics(name, loadTime, false, error as Error)
      
      // Retry logic
      if (info.config.retryOnError && info.retryCount < 3) {
        console.log(`🔄 Retrying ${name} in ${info.retryCount * 1000}ms...`)
        await new Promise(resolve => setTimeout(resolve, info.retryCount * 1000))
        return this.loadComponentWithMetrics(name)
      }
      
      throw error
    }
  }

  /**
   * Create medical loading wrapper with context-appropriate UI
   */
  createMedicalWrapper<T = any>(
    LazyComponent: LazyExoticComponent<ComponentType<T>>,
    config: LazyLoadConfig = {}
  ): ComponentType<T> {
    const LoadingComponent = config.loadingComponent || this.getMedicalLoadingComponent(config.medicalContext)
    const FallbackComponent = config.fallbackComponent || this.getMedicalErrorComponent(config.medicalContext)

    return (props: T) => (
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Suspense fallback={<LoadingComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  /**
   * Get medical context-specific loading component
   */
  private getMedicalLoadingComponent(context: LazyLoadConfig['medicalContext']): ComponentType {
    switch (context) {
      case 'calculator':
        return () => (
          <div className="medical-calculator-loading bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-blue-700 dark:text-blue-300 font-medium">
                Loading Medical Calculator...
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-blue-600 dark:text-blue-400">
              Preparing clinical calculations and validations
            </div>
          </div>
        )
      
      case 'chart':
        return () => (
          <div className="medical-chart-loading bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-pulse flex space-x-2">
                <div className="h-4 bg-green-500 rounded w-3"></div>
                <div className="h-6 bg-green-500 rounded w-3"></div>
                <div className="h-5 bg-green-500 rounded w-3"></div>
                <div className="h-7 bg-green-500 rounded w-3"></div>
              </div>
              <div className="text-green-700 dark:text-green-300 font-medium">
                Loading Medical Chart...
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400">
              Rendering clinical data visualization
            </div>
          </div>
        )
      
      case 'report':
        return () => (
          <div className="medical-report-loading bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div className="text-purple-700 dark:text-purple-300 font-medium">
                Loading Medical Report...
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-purple-600 dark:text-purple-400">
              Preparing medical documentation interface
            </div>
          </div>
        )
      
      case 'analysis':
        return () => (
          <div className="medical-analysis-loading bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                Loading Medical Analysis...
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-emerald-600 dark:text-emerald-400">
              Initializing AI medical processing
            </div>
          </div>
        )
      
      default:
        return () => (
          <div className="medical-loading bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <div className="text-slate-700 dark:text-slate-300 font-medium">
                Loading Medical Component...
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
              Please wait while the component loads
            </div>
          </div>
        )
    }
  }

  /**
   * Get medical context-specific error component
   */
  private getMedicalErrorComponent(context: LazyLoadConfig['medicalContext']): ComponentType {
    return () => (
      <div className="medical-error bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">!</span>
          </div>
          <div className="text-red-700 dark:text-red-300 font-medium">
            Failed to Load Medical Component
          </div>
        </div>
        <div className="mt-3 text-center text-sm text-red-600 dark:text-red-400">
          {context === 'calculator' && 'Medical calculator could not be loaded. Please refresh the page.'}
          {context === 'chart' && 'Medical chart could not be loaded. Please check your connection.'}
          {context === 'report' && 'Medical report interface could not be loaded. Please try again.'}
          {context === 'analysis' && 'Medical analysis component could not be loaded. Please refresh.'}
          {!context && 'Component could not be loaded. Please refresh the page.'}
        </div>
        <div className="mt-4 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  /**
   * Schedule component for preloading
   */
  private schedulePreload(name: string): void {
    if (!this.preloadQueue.includes(name)) {
      this.preloadQueue.push(name)
    }
  }

  /**
   * Setup intersection observer for viewport-based loading
   */
  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const componentName = entry.target.getAttribute('data-lazy-component')
            if (componentName) {
              this.preloadComponent(componentName)
            }
          }
        })
      },
      { rootMargin: '100px' } // Start loading 100px before viewport
    )
  }

  /**
   * Setup preload scheduler
   */
  private setupPreloadScheduler(): void {
    // Preload high-priority components after initial load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.processPreloadQueue()
        }, 2000) // Wait 2s after page load
      })
    }
  }

  /**
   * Process preload queue based on priority
   */
  private async processPreloadQueue(): Promise<void> {
    if (!this.isPreloadingEnabled) return

    // Sort by priority
    const sortedQueue = this.preloadQueue
      .map(name => ({ name, info: this.components.get(name)! }))
      .filter(item => item.info && !item.info.isLoaded)
      .sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return priorityOrder[b.info.config.priority!] - priorityOrder[a.info.config.priority!]
      })

    // Preload components with delay to avoid blocking
    for (const { name } of sortedQueue) {
      try {
        await this.preloadComponent(name)
        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay between preloads
      } catch (error) {
        console.warn(`Preload failed for ${name}:`, error)
      }
    }
  }

  /**
   * Preload specific component
   */
  async preloadComponent(name: string): Promise<void> {
    const info = this.components.get(name)
    if (!info || info.isLoaded || info.isLoading) return

    try {
      await this.loadComponentWithMetrics(name)
      console.log(`🚀 Preloaded medical component: ${name}`)
    } catch (error) {
      console.warn(`Preload failed for ${name}:`, error)
    }
  }

  /**
   * Report loading metrics
   */
  private reportLoadingMetrics(name: string, loadTime: number, success: boolean, error?: Error): void {
    const metrics = {
      component: name,
      loadTime,
      success,
      error: error?.message,
      timestamp: new Date().toISOString()
    }

    // Send to analytics or monitoring service
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('component-load-metrics', { detail: metrics }))
    }
  }

  /**
   * Get loading metrics
   */
  getLoadingMetrics(): LoadingMetrics {
    const components = Array.from(this.components.values())
    
    return {
      totalComponents: components.length,
      loadedComponents: components.filter(c => c.isLoaded).length,
      loadingComponents: components.filter(c => c.isLoading).length,
      failedComponents: components.filter(c => c.lastError).length,
      averageLoadTime: components
        .filter(c => c.loadTime)
        .reduce((sum, c, _, arr) => sum + c.loadTime! / arr.length, 0),
      totalLoadTime: components
        .filter(c => c.loadTime)
        .reduce((sum, c) => sum + c.loadTime!, 0)
    }
  }

  /**
   * Get component status
   */
  getComponentStatus(name: string): LazyComponentInfo | null {
    return this.components.get(name) || null
  }

  /**
   * Enable/disable preloading
   */
  setPreloadingEnabled(enabled: boolean): void {
    this.isPreloadingEnabled = enabled
  }

  /**
   * Clear loading cache
   */
  clearCache(): void {
    this.loadedBundles.clear()
    this.components.forEach(component => {
      component.isLoaded = false
      component.isLoading = false
      component.lastError = undefined
      component.loadTime = undefined
      component.retryCount = 0
    })
  }
}

/**
 * Simple Error Boundary Component
 */
class ErrorBoundary extends React.Component<
  { fallback: React.ComponentType; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback />
    }

    return this.props.children
  }
}

// Singleton instance
export const lazyLoadingService = new LazyLoadingService()

// Medical component lazy loaders
export const MedicalLazyComponents = {
  // Medical Calculators (high priority)
  GRACE: () => lazyLoadingService.registerComponent(
    'GRACE',
    () => import('../components/Calculators/GRACE/GRACECalculator'),
    { priority: 'high', medicalContext: 'calculator', preload: true }
  ),
  
  CHADS2VASC: () => lazyLoadingService.registerComponent(
    'CHADS2VASC',
    () => import('../components/Calculators/CHADS2VASC'),
    { priority: 'high', medicalContext: 'calculator', preload: true }
  ),
  
  BMI: () => lazyLoadingService.registerComponent(
    'BMI',
    () => import('../components/Calculators/BMI'),
    { priority: 'normal', medicalContext: 'calculator' }
  ),

  // Report Components (normal priority)
  ReportEditCard: () => lazyLoadingService.registerComponent(
    'ReportEditCard',
    () => import('../components/ReportEditing/ReportEditCard'),
    { priority: 'normal', medicalContext: 'report', retryOnError: true }
  ),

  EditHistoryPanel: () => lazyLoadingService.registerComponent(
    'EditHistoryPanel',
    () => import('../components/ReportEditing/EditHistoryPanel'),
    { priority: 'low', medicalContext: 'report' }
  ),

  // Analysis Components (normal priority)
  MedicalAnalysisCard: () => lazyLoadingService.registerComponent(
    'MedicalAnalysisCard',
    () => import('../components/Georgian/components/MedicalAnalysisCard'),
    { priority: 'normal', medicalContext: 'analysis', retryOnError: true }
  ),

  // Heavy UI Components (low priority)
  Chart: () => lazyLoadingService.registerComponent(
    'Chart',
    () => import('../components/Charts/MedicalChart'),
    { priority: 'low', medicalContext: 'chart' }
  )
}