import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'gray' | 'white' | 'transparent';
  enableSafeArea?: boolean;
  mobileOptimized?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md',
  background = 'gray',
  enableSafeArea = true,
  mobileOptimized = true
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-3xl';
      case 'md': return 'max-w-4xl';
      case 'lg': return 'max-w-6xl';
      case 'xl': return 'max-w-7xl';
      case '2xl': return 'max-w-8xl';
      case 'full': return 'max-w-none';
      default: return 'max-w-none';
    }
  };

  const getPaddingClass = () => {
    if (mobileOptimized) {
      // Mobile-optimized padding with safe area considerations
      const basePadding = enableSafeArea ? 'safe-padding' : '';
      
      switch (padding) {
        case 'none': return basePadding;
        case 'sm': return `p-3 sm:p-4 md:p-4 ${basePadding}`.trim();
        case 'md': return `p-4 sm:p-5 md:p-6 lg:p-8 ${basePadding}`.trim();
        case 'lg': return `p-5 sm:p-6 md:p-8 lg:p-12 ${basePadding}`.trim();
        default: return `p-4 sm:p-5 md:p-6 lg:p-8 ${basePadding}`.trim();
      }
    } else {
      // Original padding logic for backward compatibility
      switch (padding) {
        case 'none': return '';
        case 'sm': return 'p-3 md:p-4';
        case 'md': return 'p-4 md:p-6 lg:p-8';
        case 'lg': return 'p-6 md:p-8 lg:p-12';
        default: return 'p-4 md:p-6 lg:p-8';
      }
    }
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'gray': return 'bg-gray-50 dark:bg-gray-900';
      case 'white': return 'bg-white dark:bg-gray-800';
      case 'transparent': return 'bg-transparent';
      default: return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  // Get container styles with mobile optimizations
  const getContainerStyles = () => {
    const baseStyles = 'h-full w-full overflow-auto';
    const safeAreaStyles = enableSafeArea ? 'safe-area-container' : '';
    const mobileStyles = mobileOptimized ? 'mobile-optimized' : '';
    
    return `${baseStyles} ${getBackgroundClass()} ${safeAreaStyles} ${mobileStyles} ${className}`.trim();
  };

  const getInnerContainerStyles = () => {
    const baseStyles = `${getMaxWidthClass()} mx-auto ${getPaddingClass()}`;
    const mobileStyles = mobileOptimized ? 'mobile-container' : '';
    
    return `${baseStyles} ${mobileStyles}`.trim();
  };

  return (
    <div 
      className={getContainerStyles()}
      style={{
        // CSS custom properties for safe area support
        ...(enableSafeArea && {
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
          paddingLeft: 'max(env(safe-area-inset-left), 0px)', 
          paddingRight: 'max(env(safe-area-inset-right), 0px)'
        }),
        // Mobile viewport optimization
        ...(mobileOptimized && {
          minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          width: '100%',
          maxWidth: '100vw'
        })
      }}
    >
      <div className={getInnerContainerStyles()}>
        {children}
      </div>
    </div>
  );
}; 