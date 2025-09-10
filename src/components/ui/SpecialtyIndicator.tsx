import React from 'react';
import { useSpecialty, MedicalSpecialty, getSpecialtyDisplayName } from '../../stores/useAppStore';

interface SpecialtyIndicatorProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'text' | 'card';
}

export const SpecialtyIndicator: React.FC<SpecialtyIndicatorProps> = ({
  className = '',
  showIcon = true,
  size = 'md',
  variant = 'badge'
}) => {
  const { specialty, isLoading, error, isSpecialtyVerified } = useSpecialty();

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === 'badge' && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--component-surface-tertiary)] h-6 w-24"></div>
        )}
        {variant === 'text' && (
          <div className="bg-[var(--component-surface-tertiary)] h-4 w-20 rounded"></div>
        )}
        {variant === 'card' && (
          <div className="bg-[var(--component-surface-tertiary)] h-16 w-48 rounded-lg"></div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        {variant === 'badge' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            ⚠️ Specialty Error
          </span>
        )}
        {variant === 'text' && (
          <span className="text-sm">Specialty unavailable</span>
        )}
        {variant === 'card' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <span className="text-red-800 text-sm">Unable to load specialty information</span>
          </div>
        )}
      </div>
    );
  }

  // No specialty verified
  if (!isSpecialtyVerified || !specialty) {
    return (
      <div className={`text-[var(--foreground-secondary)] ${className}`}>
        {variant === 'badge' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--component-surface-secondary)] text-[var(--foreground-tertiary)]">
            👤 General
          </span>
        )}
        {variant === 'text' && (
          <span className="text-sm">No specialty</span>
        )}
        {variant === 'card' && (
          <div className="bg-[var(--component-surface-primary)] border border-[var(--glass-border-light)] rounded-lg p-4">
            <span className="text-[var(--foreground-tertiary)] text-sm">Specialty not specified</span>
          </div>
        )}
      </div>
    );
  }

  // Get specialty-specific styling
  const getSpecialtyStyles = (specialty: MedicalSpecialty) => {
    switch (specialty) {
      case MedicalSpecialty.CARDIOLOGY:
        return {
          icon: '❤️',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          accentColor: 'text-red-600'
        };
      case MedicalSpecialty.OBGYN:
        return {
          icon: '🤱',
          bgColor: 'bg-pink-100',
          textColor: 'text-pink-800',
          borderColor: 'border-pink-200',
          accentColor: 'text-pink-600'
        };
      default:
        return {
          icon: '🏥',
          bgColor: 'bg-[var(--cardiology-accent-blue-light)]',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          accentColor: 'text-[var(--cardiology-accent-blue-dark)]'
        };
    }
  };

  const styles = getSpecialtyStyles(specialty);
  const displayName = getSpecialtyDisplayName(specialty);

  // Size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'px-2 py-1',
          text: 'text-xs',
          iconSize: 'text-sm'
        };
      case 'lg':
        return {
          padding: 'px-4 py-2',
          text: 'text-base',
          iconSize: 'text-lg'
        };
      default: // md
        return {
          padding: 'px-3 py-1',
          text: 'text-sm',
          iconSize: 'text-base'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Render based on variant
  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${styles.bgColor} ${styles.textColor} ${sizeStyles.padding} ${sizeStyles.text} ${className}`}>
        {showIcon && <span className={`mr-1 ${sizeStyles.iconSize}`}>{styles.icon}</span>}
        {displayName}
      </span>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`${styles.accentColor} ${sizeStyles.text} ${className}`}>
        {showIcon && <span className={`mr-1 ${sizeStyles.iconSize}`}>{styles.icon}</span>}
        {displayName}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${styles.bgColor} border ${styles.borderColor} rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          {showIcon && <span className="text-2xl mr-3">{styles.icon}</span>}
          <div>
            <h3 className={`font-semibold ${styles.textColor}`}>{displayName}</h3>
            <p className="text-[var(--foreground-tertiary)] text-sm">Current Specialty</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Specialty-themed loading component
export const SpecialtyLoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs">🏥</span>
        </div>
      </div>
      <span className="ml-2 text-sm text-[var(--foreground-tertiary)]">Loading specialty...</span>
    </div>
  );
}; 