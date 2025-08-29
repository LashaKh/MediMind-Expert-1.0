import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// =====================================
// MEDICAL DESIGN SYSTEM FOUNDATION
// =====================================

// Medical Button Component with Clinical UX Standards
const medicalButtonVariants = cva(
  [
    // Base styles - optimized for medical professionals
    "inline-flex items-center justify-center font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    "touch-manipulation select-none",
    "active:scale-[0.98] transform-gpu"
  ],
  {
    variants: {
      variant: {
        // Primary: High-contrast medical blue for critical actions
        primary: [
          "bg-gradient-to-r from-medical-blue-600 to-medical-blue-700",
          "text-white shadow-lg shadow-medical-blue-500/25",
          "hover:from-medical-blue-700 hover:to-medical-blue-800",
          "hover:shadow-xl hover:shadow-medical-blue-500/30",
          "focus-visible:ring-medical-blue-500"
        ],
        
        // Secondary: Professional neutral for supporting actions
        secondary: [
          "bg-medical-gray-100 dark:bg-medical-gray-700",
          "text-medical-gray-900 dark:text-medical-gray-100",
          "border border-medical-gray-300 dark:border-medical-gray-600",
          "hover:bg-medical-gray-200 dark:hover:bg-medical-gray-600",
          "focus-visible:ring-medical-gray-500"
        ],
        
        // Success: Medical green for confirmations
        success: [
          "bg-gradient-to-r from-medical-success-600 to-medical-success-700",
          "text-white shadow-lg shadow-medical-success-500/25",
          "hover:from-medical-success-700 hover:to-medical-success-800",
          "hover:shadow-xl hover:shadow-medical-success-500/30",
          "focus-visible:ring-medical-success-500"
        ],
        
        // Destructive: Medical red for critical actions
        destructive: [
          "bg-gradient-to-r from-medical-error-600 to-medical-error-700",
          "text-white shadow-lg shadow-medical-error-500/25",
          "hover:from-medical-error-700 hover:to-medical-error-800",
          "hover:shadow-xl hover:shadow-medical-error-500/30",
          "focus-visible:ring-medical-error-500"
        ],
        
        // Outline: Transparent for secondary actions
        outline: [
          "border-2 border-medical-gray-300 dark:border-medical-gray-600",
          "text-medical-gray-700 dark:text-medical-gray-300",
          "hover:bg-medical-gray-50 dark:hover:bg-medical-gray-800",
          "focus-visible:ring-medical-gray-500"
        ],
        
        // Ghost: Minimal for subtle actions
        ghost: [
          "text-medical-gray-700 dark:text-medical-gray-300",
          "hover:bg-medical-gray-100 dark:hover:bg-medical-gray-700",
          "focus-visible:ring-medical-gray-500"
        ]
      },
      
      size: {
        // Touch-optimized sizes for medical device use
        sm: "h-9 px-3 text-sm rounded-lg min-w-[36px]",
        md: "h-11 px-4 text-base rounded-xl min-w-[44px]", // Apple's recommended minimum
        lg: "h-12 px-6 text-base rounded-xl min-w-[48px]",
        xl: "h-14 px-8 text-lg rounded-2xl min-w-[56px]",
        
        // Icon-only buttons
        icon: "h-11 w-11 p-0 rounded-xl",
        "icon-sm": "h-9 w-9 p-0 rounded-lg",
        "icon-lg": "h-12 w-12 p-0 rounded-xl"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface MedicalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof medicalButtonVariants> {
  loading?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export const MedicalButton = forwardRef<HTMLButtonElement, MedicalButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(medicalButtonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && LeftIcon && (
          <LeftIcon className="mr-2 h-4 w-4" />
        )}
        {children}
        {!loading && RightIcon && (
          <RightIcon className="ml-2 h-4 w-4" />
        )}
      </button>
    );
  }
);

MedicalButton.displayName = "MedicalButton";

// =====================================
// MEDICAL CARD COMPONENT
// =====================================

const medicalCardVariants = cva(
  [
    "relative rounded-2xl border transition-all duration-300",
    "bg-white dark:bg-medical-gray-800",
    "border-medical-gray-200 dark:border-medical-gray-700",
    "shadow-md hover:shadow-xl"
  ],
  {
    variants: {
      variant: {
        default: "hover:border-medical-blue-300 dark:hover:border-medical-blue-600",
        elevated: [
          "shadow-xl shadow-medical-blue-500/10",
          "hover:shadow-2xl hover:shadow-medical-blue-500/20",
          "hover:-translate-y-1"
        ],
        interactive: [
          "cursor-pointer hover:border-medical-blue-400",
          "hover:-translate-y-2 hover:shadow-2xl",
          "active:translate-y-0 active:shadow-lg"
        ]
      },
      
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md"
    }
  }
);

export interface MedicalCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof medicalCardVariants> {}

export const MedicalCard = forwardRef<HTMLDivElement, MedicalCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(medicalCardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

MedicalCard.displayName = "MedicalCard";

// =====================================
// MEDICAL INPUT COMPONENT
// =====================================

const medicalInputVariants = cva(
  [
    "w-full border-2 transition-all duration-200",
    "bg-white dark:bg-medical-gray-800",
    "text-medical-gray-900 dark:text-medical-gray-100",
    "placeholder:text-medical-gray-500 dark:placeholder:text-medical-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20",
    "disabled:bg-medical-gray-50 dark:disabled:bg-medical-gray-700",
    "disabled:text-medical-gray-500 disabled:cursor-not-allowed",
    "touch-manipulation"
  ],
  {
    variants: {
      variant: {
        default: [
          "border-medical-gray-300 dark:border-medical-gray-600",
          "focus:border-medical-blue-500"
        ],
        error: [
          "border-medical-error-500",
          "focus:border-medical-error-500 focus:ring-medical-error-500/20"
        ],
        success: [
          "border-medical-success-500",
          "focus:border-medical-success-500 focus:ring-medical-success-500/20"
        ]
      },
      
      size: {
        sm: "h-9 px-3 text-sm rounded-lg",
        md: "h-11 px-4 text-base rounded-xl", // 44px minimum for medical use
        lg: "h-12 px-5 text-lg rounded-xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface MedicalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof medicalInputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export const MedicalInput = forwardRef<HTMLInputElement, MedicalInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    hint, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `medical-input-${Math.random().toString(36).slice(2, 11)}`;
    const finalVariant = error ? "error" : variant;

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-medical-gray-900 dark:text-medical-gray-100"
          >
            {label}
            {props.required && <span className="text-medical-error-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <LeftIcon className="h-5 w-5 text-medical-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              medicalInputVariants({ variant: finalVariant, size }),
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              <RightIcon className="h-5 w-5 text-medical-gray-400" />
            </div>
          )}
        </div>

        {hint && !error && (
          <p className="text-sm text-medical-gray-600 dark:text-medical-gray-400">
            {hint}
          </p>
        )}

        {error && (
          <p className="text-sm text-medical-error-600 dark:text-medical-error-400 flex items-center space-x-1">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

MedicalInput.displayName = "MedicalInput";

// =====================================
// MEDICAL TEXTAREA COMPONENT
// =====================================

export interface MedicalTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  variant?: "default" | "error" | "success";
}

export const MedicalTextarea = forwardRef<HTMLTextAreaElement, MedicalTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    showCharCount = false,
    variant = "default",
    maxLength,
    id,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaId = id || `medical-textarea-${Math.random().toString(36).slice(2, 11)}`;
    const finalVariant = error ? "error" : variant;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    const variantStyles = {
      default: "border-medical-gray-300 dark:border-medical-gray-600 focus:border-medical-blue-500",
      error: "border-medical-error-500 focus:border-medical-error-500 focus:ring-medical-error-500/20",
      success: "border-medical-success-500 focus:border-medical-success-500 focus:ring-medical-success-500/20"
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-semibold text-medical-gray-900 dark:text-medical-gray-100"
          >
            {label}
            {props.required && <span className="text-medical-error-600 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            // Base styles
            "w-full min-h-[88px] px-4 py-3 text-base rounded-xl border-2",
            "bg-white dark:bg-medical-gray-800",
            "text-medical-gray-900 dark:text-medical-gray-100",
            "placeholder:text-medical-gray-500 dark:placeholder:text-medical-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20",
            "disabled:bg-medical-gray-50 dark:disabled:bg-medical-gray-700",
            "disabled:text-medical-gray-500 disabled:cursor-not-allowed",
            "resize-y touch-manipulation transition-all duration-200",
            // Variant styles
            variantStyles[finalVariant],
            className
          )}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />

        <div className="flex justify-between items-center">
          <div className="flex-1">
            {hint && !error && (
              <p className="text-sm text-medical-gray-600 dark:text-medical-gray-400">
                {hint}
              </p>
            )}

            {error && (
              <p className="text-sm text-medical-error-600 dark:text-medical-error-400 flex items-center space-x-1">
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            )}
          </div>

          {(showCharCount || maxLength) && (
            <p className={cn(
              "text-sm ml-2 flex-shrink-0",
              maxLength && charCount > maxLength * 0.9 
                ? "text-medical-error-600" 
                : "text-medical-gray-500 dark:text-medical-gray-400"
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

MedicalTextarea.displayName = "MedicalTextarea";

// =====================================
// MEDICAL BADGE COMPONENT
// =====================================

const medicalBadgeVariants = cva(
  [
    "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg",
    "border transition-colors duration-200"
  ],
  {
    variants: {
      variant: {
        primary: "bg-medical-blue-100 dark:bg-medical-blue-900/30 text-medical-blue-700 dark:text-medical-blue-300 border-medical-blue-200 dark:border-medical-blue-700",
        secondary: "bg-medical-gray-100 dark:bg-medical-gray-700 text-medical-gray-700 dark:text-medical-gray-300 border-medical-gray-200 dark:border-medical-gray-600",
        success: "bg-medical-success-100 dark:bg-medical-success-900/30 text-medical-success-700 dark:text-medical-success-300 border-medical-success-200 dark:border-medical-success-700",
        warning: "bg-medical-warning-100 dark:bg-medical-warning-900/30 text-medical-warning-700 dark:text-medical-warning-300 border-medical-warning-200 dark:border-medical-warning-700",
        error: "bg-medical-error-100 dark:bg-medical-error-900/30 text-medical-error-700 dark:text-medical-error-300 border-medical-error-200 dark:border-medical-error-700"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export interface MedicalBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof medicalBadgeVariants> {}

export const MedicalBadge = forwardRef<HTMLDivElement, MedicalBadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(medicalBadgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

MedicalBadge.displayName = "MedicalBadge";

// =====================================
// MEDICAL LOADING COMPONENT
// =====================================

export interface MedicalLoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "medical";
  className?: string;
  text?: string;
}

export const MedicalLoading: React.FC<MedicalLoadingProps> = ({
  size = "md",
  variant = "spinner",
  className,
  text
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  if (variant === "medical") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <div className="relative">
          <div className={cn(
            "animate-spin rounded-full border-3 border-medical-blue-200",
            "border-t-medical-blue-600 border-r-medical-blue-600",
            sizeClasses[size]
          )} />
          <div className={cn(
            "absolute inset-0 animate-ping rounded-full border border-medical-blue-400/50",
            sizeClasses[size]
          )} />
        </div>
        {text && (
          <p className="text-sm text-medical-gray-600 dark:text-medical-gray-400 font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn(
          "bg-medical-blue-600 rounded-full animate-pulse",
          sizeClasses[size]
        )} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-medical-blue-600", sizeClasses[size])} />
    </div>
  );
};

// =====================================
// RESPONSIVE CONTAINER
// =====================================

export interface MedicalContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const MedicalContainer = forwardRef<HTMLDivElement, MedicalContainerProps>(
  ({ 
    className, 
    maxWidth = "lg", 
    padding = "md",
    children,
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full"
    };

    const paddingClasses = {
      none: "",
      sm: "px-4 py-3",
      md: "px-6 py-4", 
      lg: "px-8 py-6",
      xl: "px-12 py-8"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          // Safe area support
          "safe-area-inset",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MedicalContainer.displayName = "MedicalContainer";

// =====================================
// EXPORT DESIGN TOKENS
// =====================================

export const medicalDesignTokens = {
  spacing: {
    xs: '0.125rem',   // 2px
    sm: '0.25rem',    // 4px  
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    '4xl': '2rem',    // 32px
  },
  
  touchTargets: {
    sm: '36px',
    md: '44px', // Apple recommended minimum
    lg: '48px',
    xl: '56px'
  },
  
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }
} as const;

// =====================================
// MEDICAL DESIGN SYSTEM COMPLETE
// =====================================
// Drawer components are exported separately from MedicalDrawer.tsx