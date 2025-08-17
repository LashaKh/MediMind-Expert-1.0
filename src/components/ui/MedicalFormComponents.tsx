import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle,
  ChevronDown,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Sparkles,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { 
  useMagneticHover,
  useCardEntranceAnimation,
  useTouchRipple,
  useAnimatedCounter
} from '../../hooks/useAdvancedAnimations';

/* MEDIMIND EXPERT - MEDICAL FORM COMPONENTS */
/* World-class form components with advanced animations and medical theming */

interface MedicalInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  delay?: number;
}

export const MedicalInput: React.FC<MedicalInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  success,
  icon,
  disabled = false,
  className = '',
  delay = 0
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { elementRef } = useCardEntranceAnimation(delay);
  const magneticRef = useMagneticHover();
  const touchRippleRef = useTouchRipple();

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasValue = value && value.length > 0;

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative group ${className}`}
    >
      {/* Medical Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-medical-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${8 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
          isFocused 
            ? 'bg-blue-500/10 shadow-medical-glow-blue' 
            : error 
            ? 'bg-red-500/5' 
            : success 
            ? 'bg-green-500/5' 
            : 'bg-transparent'
        }`} />

        {/* Input Field */}
        <div className="relative medical-glass">
          {/* Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
              {icon}
            </div>
          )}

          <input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`medical-input w-full ${
              icon ? 'pl-12' : 'pl-4'
            } ${
              type === 'password' ? 'pr-12' : 'pr-4'
            } py-4 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-smart-input-focus`}
          />

          {/* Password Toggle */}
          {type === 'password' && (
            <button
              ref={magneticRef as React.RefObject<HTMLButtonElement>}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-all duration-300 animate-magnetic-hover"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Status Icon */}
          {(error || success) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500 animate-bounce" />
              ) : success ? (
                <Check className="w-5 h-5 text-green-500 animate-bounce" />
              ) : null}
            </div>
          )}

          {/* Floating Label Effect */}
          {(isFocused || hasValue) && (
            <div className="absolute -top-2 left-3 px-2 bg-white dark:bg-gray-800 text-xs font-medium text-blue-600 dark:text-blue-400 animate-scale-in">
              {label}
            </div>
          )}
        </div>

        {/* Shimmer Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl animate-loading-shimmer pointer-events-none" />
        )}
      </div>

      {/* Error/Success Message */}
      {(error || success) && (
        <div className={`mt-2 text-sm flex items-center space-x-2 animate-slide-in-bottom ${
          error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
        }`}>
          {error ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

interface MedicalSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  delay?: number;
}

export const MedicalSelect: React.FC<MedicalSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = '',
  delay = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { elementRef } = useCardEntranceAnimation(delay);
  const magneticRef = useMagneticHover();

  const selectedOption = options.find(option => option.value === value);

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative group ${className}`}
    >
      {/* Medical Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/20 rounded-full animate-medical-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${10 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Select Container */}
      <div className="relative">
        <button
          ref={magneticRef as React.RefObject<HTMLButtonElement>}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="medical-input w-full pl-4 pr-12 py-4 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-left text-gray-900 dark:text-gray-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-magnetic-hover"
        >
          <div className="flex items-center space-x-3">
            {selectedOption?.icon && (
              <div className="text-teal-600 dark:text-teal-400">
                {selectedOption.icon}
              </div>
            )}
            <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
              {selectedOption?.label || placeholder || 'Select an option'}
            </span>
          </div>
        </button>

        {/* Dropdown Arrow */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 medical-glass bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-teal-500/10 transition-all duration-200 group/option"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {option.icon && (
                  <div className="text-teal-600 dark:text-teal-400 group-hover/option:scale-110 transition-transform duration-200">
                    {option.icon}
                  </div>
                )}
                <span className="text-gray-900 dark:text-gray-100 group-hover/option:text-teal-600 dark:group-hover/option:text-teal-400 transition-colors duration-200">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-2 animate-slide-in-bottom">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

interface MedicalTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  delay?: number;
}

export const MedicalTextarea: React.FC<MedicalTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  maxLength,
  disabled = false,
  className = '',
  delay = 0
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { elementRef } = useCardEntranceAnimation(delay);
  const { elementRef: counterRef, currentValue } = useAnimatedCounter(value.length, 500);

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative group ${className}`}
    >
      {/* Medical Particle Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-medical-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${12 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxLength && (
          <div 
            ref={counterRef as React.RefObject<HTMLDivElement>}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {currentValue}/{maxLength}
          </div>
        )}
      </div>

      {/* Textarea Container */}
      <div className="relative">
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
          isFocused 
            ? 'bg-purple-500/10 shadow-medical-glow-blue' 
            : error 
            ? 'bg-red-500/5' 
            : 'bg-transparent'
        }`} />

        <div className="relative medical-glass">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            className="medical-input w-full px-4 py-4 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none animate-smart-input-focus"
          />

          {/* Character Count Indicator */}
          {maxLength && value.length > maxLength * 0.8 && (
            <div className="absolute bottom-3 right-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                value.length >= maxLength 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : value.length > maxLength * 0.9 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {maxLength - value.length}
              </div>
            </div>
          )}
        </div>

        {/* Shimmer Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl animate-loading-shimmer pointer-events-none" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-2 animate-slide-in-bottom">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface MedicalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export const MedicalButton: React.FC<MedicalButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  delay = 0
}) => {
  const { elementRef } = useCardEntranceAnimation(delay);
  const magneticRef = useMagneticHover();
  const touchRippleRef = useTouchRipple();

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-medical-lg hover:shadow-medical-glow-blue',
    secondary: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-medical-lg hover:shadow-medical-glow-success',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-medical-lg',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      ref={elementRef as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative overflow-hidden rounded-2xl font-medium transition-all duration-300 
        transform hover:-translate-y-1 hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        animate-button-magnetic hw-accelerate
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* Ripple Effect Container */}
      <div ref={touchRippleRef as React.RefObject<HTMLDivElement>} className="absolute inset-0 overflow-hidden rounded-2xl" />

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-loading-shimmer" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : icon ? (
          <div className="group-hover:rotate-12 transition-transform duration-300">
            {icon}
          </div>
        ) : null}
        <span>{loading ? 'Loading...' : children}</span>
        {variant === 'primary' && !loading && (
          <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
    </button>
  );
};

interface MedicalFormSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const MedicalFormSection: React.FC<MedicalFormSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  delay = 0
}) => {
  const { elementRef } = useCardEntranceAnimation(delay);

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative medical-glass animate-magnetic-hover hw-accelerate ${className}`}
    >
      {/* Medical Particle Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-medical-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 3}s`
            }}
          >
            {i % 4 === 0 ? <Heart className="w-2 h-2 text-red-400/20" /> :
             i % 4 === 1 ? <Brain className="w-2 h-2 text-purple-400/20" /> :
             i % 4 === 2 ? <Activity className="w-2 h-2 text-green-400/20" /> :
             <Stethoscope className="w-2 h-2 text-blue-400/20" />}
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center space-x-4 mb-6 p-6 pb-0">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="relative z-10 p-6 pt-0">
        {children}
      </div>

      {/* Professional Verification Badge */}
      <div className="absolute top-4 right-4">
        <ShieldCheck className="w-5 h-5 text-green-400 animate-live-pulse" />
      </div>
    </div>
  );
}; 