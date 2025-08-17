import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Screen Reader Announcements
export const ScreenReaderAnnouncement: React.FC<{ message: string }> = ({ message }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      // Clear and set the message to trigger screen reader announcement
      ref.current.textContent = '';
      setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={ref}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
};

// Skip Link for Keyboard Navigation
export const SkipLink: React.FC<{ targetId: string; text: string }> = ({ targetId, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <a
      href={`#${targetId}`}
      className={`
        fixed top-4 left-4 z-[9999] px-4 py-2 bg-blue-600 text-white rounded-lg
        transform transition-transform duration-200 font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isVisible ? 'translate-y-0' : '-translate-y-16'}
      `}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {text}
    </a>
  );
};

// Accessible Loading Indicator
export const AccessibleLoader: React.FC<{
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}> = ({ isLoading, loadingText = "Loading content...", children }) => {
  return (
    <div>
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label={loadingText}
          className="sr-only"
        >
          {loadingText}
        </div>
      )}
      <div aria-hidden={isLoading}>
        {children}
      </div>
    </div>
  );
};

// Accessible Modal
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = "" }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal title
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100);

      // Trap focus within modal
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }

        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', trapFocus);
      return () => document.removeEventListener('keydown', trapFocus);
    } else {
      // Return focus to the previously focused element
      previousActiveElement.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2
            ref={titleRef}
            id="modal-title"
            tabIndex={-1}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Accessible Button with Enhanced States
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = ""
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
    >
      {loading && (
        <span className="inline-block w-4 h-4 mr-2 animate-spin">
          ⟳
        </span>
      )}
      {children}
    </button>
  );
};

// Accessible Form Field
export const AccessibleFormField: React.FC<{
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  id: string;
}> = ({ label, children, error, required = false, description, id }) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': !!error,
        'aria-required': required
      })}
      
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Tooltip
export const AccessibleTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ content, children, placement = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipId = React.useId();

  const placementClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  const showTooltip = isVisible || isFocused;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {React.cloneElement(children as React.ReactElement, {
        'aria-describedby': showTooltip ? tooltipId : undefined,
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false)
      })}
      
      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            max-w-xs whitespace-nowrap
            ${placementClasses[placement]}
          `}
        >
          {content}
          <div className={`
            absolute w-2 h-2 bg-gray-900 rotate-45
            ${placement === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''}
            ${placement === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2' : ''}
            ${placement === 'left' ? 'left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''}
            ${placement === 'right' ? 'right-full top-1/2 transform translate-x-1/2 -translate-y-1/2' : ''}
          `} />
        </div>
      )}
    </div>
  );
};

// Keyboard Navigation Helper
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (index: number) => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (selectedIndex >= 0) {
            onSelect(selectedIndex);
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(items.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items.length, onSelect, selectedIndex]);

  return { selectedIndex, setSelectedIndex };
};

export default {
  ScreenReaderAnnouncement,
  SkipLink,
  AccessibleLoader,
  AccessibleModal,
  AccessibleButton,
  AccessibleFormField,
  AccessibleTooltip,
  useKeyboardNavigation
};