import React, { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

// Base input component with mobile optimizations
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    label, 
    error, 
    hint, 
    success, 
    icon: Icon, 
    rightIcon: RightIcon,
    containerClassName,
    className,
    type,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base mobile-optimized styles
              'w-full min-h-[44px] px-4 py-3 text-base rounded-xl border-2 transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              // Icon spacing
              Icon && 'pl-12',
              (RightIcon || isPassword) && 'pr-12',
              
              // State-based styles
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              !error && !success && 'border-gray-300 dark:border-gray-600',
              
              // Touch optimizations
              'touch-manipulation',
              'selection:bg-primary/20',
              
              className
            )}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="touch-target-sm p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ) : RightIcon ? (
              <RightIcon className="w-5 h-5 text-gray-400" />
            ) : success ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

// Mobile-optimized textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  containerClassName?: string;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    success, 
    maxLength,
    showCharCount = false,
    containerClassName,
    className,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            // Base mobile-optimized styles
            'w-full min-h-[88px] px-4 py-3 text-base rounded-xl border-2 transition-all duration-200',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
            'resize-y',
            
            // State-based styles
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            !error && !success && 'border-gray-300 dark:border-gray-600',
            
            // Touch optimizations
            'touch-manipulation',
            'selection:bg-primary/20',
            
            className
          )}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />

        {/* Bottom row with hint and character count */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {/* Hint Text */}
            {hint && !error && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <p className={cn(
              'text-sm ml-2 flex-shrink-0',
              maxLength && charCount > maxLength * 0.9 
                ? 'text-red-600' 
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

MobileTextarea.displayName = 'MobileTextarea';

// Mobile-optimized select
interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  containerClassName?: string;
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ 
    label, 
    error, 
    hint, 
    success, 
    options,
    placeholder,
    containerClassName,
    className,
    ...props 
  }, ref) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              // Base mobile-optimized styles
              'w-full min-h-[44px] px-4 py-3 text-base rounded-xl border-2 transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
              'cursor-pointer appearance-none',
              
              // State-based styles
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              !error && !success && 'border-gray-300 dark:border-gray-600',
              
              // Touch optimizations
              'touch-manipulation',
              
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Status Icon */}
          {(success || error) && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              {success ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

MobileSelect.displayName = 'MobileSelect';

// Mobile-optimized checkbox
interface MobileCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const MobileCheckbox = forwardRef<HTMLInputElement, MobileCheckboxProps>(
  ({ label, description, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        <label className="flex items-start space-x-3 cursor-pointer touch-target-md">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-5 h-5 mt-0.5 rounded border-2 border-gray-300 dark:border-gray-600',
              'text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'transition-all duration-200 cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </label>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1 ml-8">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

MobileCheckbox.displayName = 'MobileCheckbox';

// Mobile-optimized radio group
interface MobileRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

interface MobileRadioGroupProps {
  label?: string;
  name: string;
  options: MobileRadioProps[];
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
}

export const MobileRadioGroup: React.FC<MobileRadioGroupProps> = ({
  label,
  name,
  options,
  error,
  value,
  onChange,
  containerClassName
}) => {
  return (
    <div className={cn('space-y-2', containerClassName)}>
      {/* Group Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}

      {/* Radio Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <label key={String(option.value) || index} className="flex items-start space-x-3 cursor-pointer touch-target-md">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-5 h-5 mt-0.5 border-2 border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer"
              {...option}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// Mobile-optimized button
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon,
    children, 
    className, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'active:scale-[0.98] touch-manipulation',
          
          // Size variants
          size === 'sm' && 'px-3 py-2 text-sm min-h-[36px]',
          size === 'md' && 'px-4 py-3 text-base min-h-[44px]',
          size === 'lg' && 'px-6 py-4 text-lg min-h-[52px]',
          
          // Variant styles
          variant === 'primary' && 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md',
          variant === 'secondary' && 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
          variant === 'outline' && 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
          variant === 'ghost' && 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
          
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {LeftIcon && !loading && <LeftIcon className="w-4 h-4 mr-2" />}
        {children}
        {RightIcon && <RightIcon className="w-4 h-4 ml-2" />}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton'; 