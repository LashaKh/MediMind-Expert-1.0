/**
 * Lazy loading utilities for heavy dependencies
 * Helps reduce initial bundle size and improve performance
 */

// Type definitions for lazy-loaded modules
type PDFModule = typeof import('jspdf');
type AutoTableModule = typeof import('jspdf-autotable');
type Html2CanvasModule = typeof import('html2canvas');
type TesseractModule = typeof import('tesseract.js');

// Cached modules to avoid re-importing
let pdfModule: PDFModule | null = null;
let autoTableModule: AutoTableModule | null = null;
let html2CanvasModule: Html2CanvasModule | null = null;
let tesseractModule: TesseractModule | null = null;

/**
 * Lazy load jsPDF for PDF generation
 */
export async function loadPdfModule(): Promise<PDFModule> {
  if (!pdfModule) {
    pdfModule = await import('jspdf');
  }
  return pdfModule;
}

/**
 * Lazy load jsPDF AutoTable for PDF tables
 */
export async function loadAutoTableModule(): Promise<AutoTableModule> {
  if (!autoTableModule) {
    autoTableModule = await import('jspdf-autotable');
  }
  return autoTableModule;
}

/**
 * Lazy load html2canvas for screenshots
 */
export async function loadHtml2CanvasModule(): Promise<Html2CanvasModule> {
  if (!html2CanvasModule) {
    html2CanvasModule = await import('html2canvas');
  }
  return html2CanvasModule;
}

/**
 * Lazy load Tesseract.js for OCR
 */
export async function loadTesseractModule(): Promise<TesseractModule> {
  if (!tesseractModule) {
    tesseractModule = await import('tesseract.js');
  }
  return tesseractModule;
}

/**
 * Lazy load all PDF-related modules at once
 */
export async function loadPdfModules(): Promise<{
  jsPDF: PDFModule;
  autoTable: AutoTableModule;
  html2canvas: Html2CanvasModule;
}> {
  const [jsPDF, autoTable, html2canvas] = await Promise.all([
    loadPdfModule(),
    loadAutoTableModule(),
    loadHtml2CanvasModule()
  ]);
  
  return { jsPDF, autoTable, html2canvas };
}

/**
 * Preload critical modules based on user behavior
 */
export function preloadCriticalModules(): void {
  // Only preload if user is likely to need these features
  if (typeof window !== 'undefined') {
    // Preload PDF modules on user interaction
    const preloadPdf = () => {
      loadPdfModules().catch(console.error);
      document.removeEventListener('click', preloadPdf);
      document.removeEventListener('touchstart', preloadPdf);
    };
    
    // Preload OCR on scroll or after delay
    const preloadOcr = () => {
      loadTesseractModule().catch(console.error);
      document.removeEventListener('scroll', preloadOcr);
    };
    
    // Add event listeners for preloading
    document.addEventListener('click', preloadPdf, { once: true, passive: true });
    document.addEventListener('touchstart', preloadPdf, { once: true, passive: true });
    document.addEventListener('scroll', preloadOcr, { once: true, passive: true });
    
    // Fallback: preload after 3 seconds of inactivity
    setTimeout(() => {
      loadPdfModules().catch(console.error);
    }, 3000);
  }
}

/**
 * Component wrapper for lazy-loaded features
 */
export function withLazyLoading<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  loader: () => Promise<any>,
  LoadingComponent?: React.ComponentType
) {
  return function LazyLoadedComponent(props: T) {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    
    React.useEffect(() => {
      if (!isLoaded && !isLoading) {
        setIsLoading(true);
        loader()
          .then(() => {
            setIsLoaded(true);
            setIsLoading(false);
          })
          .catch((error) => {

            setIsLoading(false);
          });
      }
    }, [isLoaded, isLoading]);
    
    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>;
    }
    
    if (!isLoaded) {
      return <div>Click to load feature</div>;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook for lazy module loading
 */
export function useLazyModule<T>(loader: () => Promise<T>) {
  const [module, setModule] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const loadModule = React.useCallback(async () => {
    if (module || loading) return module;
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedModule = await loader();
      setModule(loadedModule);
      return loadedModule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load module');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [module, loading, loader]);
  
  return { module, loading, error, loadModule };
}

// React import for TypeScript
import * as React from 'react';