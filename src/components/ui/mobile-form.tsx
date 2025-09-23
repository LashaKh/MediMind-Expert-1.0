import React, { forwardRef, useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Check, CheckCircle2 } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    // Enhanced input state management
    useEffect(() => {
      if (props.value) {
        setHasValue(Boolean(props.value));
      }
    }, [props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsTyping(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      setIsTyping(true);
      props.onChange?.(e);
      
      // Stop typing indicator after a brief delay
      setTimeout(() => setIsTyping(false), 1000);
    };

    return (
      <div className={cn('space-y-2 group', containerClassName)}>
        {/* Enhanced Label with Animation */}
        {label && (
          <label 
            htmlFor={props.id}
            className={cn(
              'block font-semibold transition-all duration-300 select-none',
              'text-sm',
              isFocused || hasValue 
                ? 'text-[#2b6cb0] dark:text-[#63b3ed] transform scale-95' 
                : 'text-gray-700 dark:text-gray-300',
              error && 'text-red-600 dark:text-red-400'
            )}
          >
            {label}
            {props.required && (
              <span className={cn(
                'ml-1 transition-colors duration-200',
                isFocused ? 'text-[#63b3ed]' : 'text-red-500'
              )}>
                *
              </span>
            )}
          </label>
        )}

        {/* Enhanced Input Container */}
        <div className={cn(
          'relative group/input',
          'transition-all duration-300 ease-out'
        )}>
          {/* Background Glow Effect */}
          <div className={cn(
            'absolute inset-0 rounded-2xl transition-all duration-500',
            'bg-gradient-to-r from-[#63b3ed]/5 via-transparent to-[#90cdf4]/5',
            'opacity-0 scale-95',
            isFocused && 'opacity-100 scale-100',
            'blur-sm'
          )} />

          {/* Left Icon with Animation */}
          {Icon && (
            <div className={cn(
              'absolute left-4 top-1/2 transform -translate-y-1/2 z-20',
              'transition-all duration-300'
            )}>
              <Icon className={cn(
                'w-5 h-5 transition-all duration-300',
                isFocused 
                  ? 'text-[#2b6cb0] dark:text-[#63b3ed] scale-110' 
                  : 'text-gray-400 dark:text-gray-500',
                error && 'text-red-500',
                success && 'text-green-500'
              )} />
            </div>
          )}

          {/* Enhanced Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base premium styles
              'w-full min-h-[52px] px-4 py-3 text-base rounded-2xl border-2',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-4',
              'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
              
              // Icon spacing
              Icon && 'pl-12',
              (RightIcon || isPassword || success || error) && 'pr-12',
              
              // Enhanced state-based styles
              error && [
                'border-red-500 dark:border-red-400',
                'focus:border-red-500 focus:ring-red-500/20',
                'bg-red-50/50 dark:bg-red-900/10'
              ],
              success && [
                'border-green-500 dark:border-green-400',
                'focus:border-green-500 focus:ring-green-500/20',
                'bg-green-50/50 dark:bg-green-900/10'
              ],
              !error && !success && [
                'border-gray-200 dark:border-gray-600',
                'hover:border-[#63b3ed]/50 dark:hover:border-[#63b3ed]/40',
                'focus:border-[#2b6cb0] dark:focus:border-[#63b3ed]',
                'focus:ring-[#63b3ed]/20 dark:focus:ring-[#63b3ed]/30'
              ],
              
              // Premium interactions
              'touch-manipulation',
              'selection:bg-[#63b3ed]/20',
              'transform transition-transform',
              isFocused && 'scale-[1.02]',
              isTyping && 'scale-[1.01]',
              
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Enhanced Right Icon Area */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20',
                  'group/toggle'
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 group-hover/toggle:text-[#2b6cb0] transition-colors" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 group-hover/toggle:text-[#2b6cb0] transition-colors" />
                )}
              </button>
            ) : RightIcon ? (
              <RightIcon className="w-5 h-5 text-gray-400" />
            ) : success ? (
              <div className="relative">
                <CheckCircle2 className="w-5 h-5 text-green-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              </div>
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
            ) : null}
          </div>

          {/* Active State Indicator */}
          <div className={cn(
            'absolute bottom-0 left-1/2 transform -translate-x-1/2',
            'h-1 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
            'rounded-full transition-all duration-300 ease-out',
            isFocused ? 'w-full opacity-60' : 'w-0 opacity-0'
          )} />
        </div>

        {/* Compact Feedback Messages */}
        <div className="min-h-[16px]">
          {hint && !error && (
            <p className={cn(
              'text-xs text-gray-600 dark:text-gray-400',
              'transition-all duration-300',
              isFocused ? 'opacity-100 transform translate-y-0' : 'opacity-70'
            )}>
              {hint}
            </p>
          )}

          {error && (
            <div className={cn(
              'flex items-start space-x-1.5 text-xs text-red-600 dark:text-red-400',
              'transition-all duration-300 animate-in slide-in-from-left-2'
            )}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {success && !error && (
            <div className={cn(
              'flex items-center space-x-1.5 text-xs text-green-600 dark:text-green-400',
              'transition-all duration-300 animate-in slide-in-from-left-2'
            )}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Validated</span>
            </div>
          )}
        </div>
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
            'selection:bg-[#63b3ed]/20',
            
            className
          )}
          maxLength={maxLength && maxLength < 2000 ? maxLength : undefined}
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
          {(showCharCount || (maxLength && maxLength < 2000)) && (
            <p className={cn(
              'text-sm ml-2 flex-shrink-0',
              maxLength && charCount > maxLength * 0.9 
                ? 'text-red-600' 
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {charCount}{maxLength && maxLength < 2000 && `/${maxLength}`}
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
              'focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#2b6cb0]',
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
              'text-[#1a365d] focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#2b6cb0]',
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
              className="w-5 h-5 mt-0.5 border-2 border-gray-300 dark:border-gray-600 text-[#1a365d] focus:ring-2 focus:ring-[#63b3ed]/20 transition-all duration-200 cursor-pointer"
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
    const [isPressed, setIsPressed] = useState(false);
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const isDisabled = disabled || loading;

    // Enhanced ripple effect
    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 800);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      createRipple(e);
      props.onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      props.onMouseUp?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base premium styles
          'relative inline-flex items-center justify-center font-semibold',
          'transition-all duration-300 ease-out overflow-hidden',
          'focus:outline-none focus:ring-4 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transform-gpu perspective-1000',
          'group',
          
          // Enhanced touch interactions
          'touch-manipulation select-none',
          'active:scale-95 hover:scale-105',
          isPressed && 'scale-95',
          
          // Size variants with premium spacing
          size === 'sm' && 'px-4 py-2.5 text-sm min-h-[40px] rounded-xl',
          size === 'md' && 'px-6 py-3.5 text-base min-h-[48px] rounded-xl',
          size === 'lg' && 'px-8 py-4 text-lg min-h-[56px] rounded-2xl',
          
          // Enhanced variant styles with gradients and shadows
          variant === 'primary' && [
            'bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#1a365d]',
            'text-white font-bold tracking-wide',
            'shadow-lg shadow-[#2b6cb0]/25 hover:shadow-xl hover:shadow-[#2b6cb0]/40',
            'focus:ring-[#63b3ed]/30',
            'hover:from-[#1a365d]/95 hover:via-[#2b6cb0]/95 hover:to-[#1a365d]/95',
            'before:absolute before:inset-0 before:bg-gradient-to-r',
            'before:from-transparent before:via-white/10 before:to-transparent',
            'before:translate-x-[-100%] hover:before:translate-x-[100%]',
            'before:transition-transform before:duration-700 before:ease-out'
          ],
          variant === 'secondary' && [
            'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600',
            'text-gray-900 dark:text-gray-100',
            'shadow-md hover:shadow-lg',
            'focus:ring-gray-300 dark:focus:ring-gray-500',
            'hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500'
          ],
          variant === 'outline' && [
            'border-2 border-[#2b6cb0] text-[#2b6cb0]',
            'hover:bg-[#2b6cb0] hover:text-white hover:border-[#2b6cb0]',
            'focus:ring-[#63b3ed]/30',
            'shadow-md hover:shadow-lg hover:shadow-[#2b6cb0]/20'
          ],
          variant === 'ghost' && [
            'text-gray-700 dark:text-gray-300',
            'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200',
            'dark:hover:from-gray-700 dark:hover:to-gray-600',
            'focus:ring-gray-300 dark:focus:ring-gray-500'
          ],
          variant === 'destructive' && [
            'bg-gradient-to-r from-red-600 to-red-700',
            'text-white font-bold',
            'shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/40',
            'focus:ring-red-500/30',
            'hover:from-red-700 hover:to-red-800'
          ],
          
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        {...props}
      >
        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
            }}
          >
            <span className="block w-10 h-10 bg-white/30 rounded-full animate-ping" />
          </span>
        ))}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-pulse" />
            </div>
          </div>
        )}

        {/* Content Container */}
        <span className={cn(
          'relative flex items-center justify-center space-x-2 transition-opacity duration-200',
          loading && 'opacity-0'
        )}>
          {LeftIcon && !loading && (
            <LeftIcon className={cn(
              'transition-transform duration-200 group-hover:scale-110',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6'
            )} />
          )}
          
          <span className="relative">
            {children}
            
            {/* Shimmer effect for primary buttons */}
            {variant === 'primary' && !loading && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
            )}
          </span>
          
          {RightIcon && (
            <RightIcon className={cn(
              'transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-1',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6'
            )} />
          )}
        </span>

        {/* Hover glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          variant === 'primary' && 'bg-gradient-to-r from-[#63b3ed]/20 via-[#90cdf4]/10 to-[#63b3ed]/20 blur-sm'
        )} />
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton'; 