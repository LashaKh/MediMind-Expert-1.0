import React, { forwardRef, HTMLAttributes, ReactNode, useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Check, AlertCircle, Info, Calculator, TrendingUp, Award, Sparkles, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

// Enhanced Calculator Container
interface CalculatorContainerProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: 'medical' | 'cardiology' | 'obgyn' | 'premium';
  compact?: boolean;
}

export const CalculatorContainer = forwardRef<HTMLDivElement, CalculatorContainerProps>(
  ({ className, title, subtitle, icon: Icon = Calculator, gradient = 'medical', compact = false, children, ...props }, ref) => {
    const { t } = useTranslation();
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-gray-800/20",
          gradient === 'medical' && "bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 dark:from-blue-900/20 dark:via-gray-900/90 dark:to-indigo-900/20",
          gradient === 'cardiology' && "bg-gradient-to-br from-red-50/80 via-white/90 to-pink-50/80 dark:from-red-900/20 dark:via-gray-900/90 dark:to-pink-900/20",
          gradient === 'obgyn' && "bg-gradient-to-br from-purple-50/80 via-white/90 to-pink-50/80 dark:from-purple-900/20 dark:via-gray-900/90 dark:to-pink-900/20",
          gradient === 'premium' && "bg-gradient-to-br from-amber-50/80 via-white/90 to-yellow-50/80 dark:from-amber-900/20 dark:via-gray-900/90 dark:to-yellow-900/20",
          compact && "scale-75 origin-top",
          className
        )}
        {...props}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(120,119,198,0.3),_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(120,119,198,0.2),_transparent_50%)]"></div>
        </div>

        {/* Header Section */}
        <div className={`relative ${compact ? 'p-4 pb-3' : 'p-8 pb-6'} border-b border-white/20 dark:border-gray-800/20`}>
          <div className={`flex items-center ${compact ? 'space-x-3' : 'space-x-6'}`}>
            {/* Animated Icon */}
            <div className="relative">
              {!compact && <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>}
              <div className={`relative ${compact ? 'p-2' : 'p-4'} bg-gradient-to-r from-blue-500 to-indigo-600 ${compact ? 'rounded-xl' : 'rounded-2xl'} shadow-lg`}>
                <Icon className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} text-white`} />
              </div>
              {!compact && <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />}
            </div>

            {/* Title and Subtitle */}
            <div className="flex-1">
              <h1 className={`${compact ? 'text-lg' : 'text-3xl'} font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`${compact ? 'text-sm' : 'text-lg'} text-gray-600 dark:text-gray-300 mt-1 font-medium`}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Quality Badge */}
            <div className={`flex items-center ${compact ? 'space-x-1 px-2 py-1' : 'space-x-2 px-4 py-2'} bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 ${compact ? 'rounded-lg' : 'rounded-xl'} border border-emerald-200 dark:border-emerald-800/30`}>
              <Award className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600 dark:text-emerald-400`} />
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-emerald-700 dark:text-emerald-300`}>{t('calculators.common.validated')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`relative ${compact ? 'p-4' : 'p-8'}`}>
          {children}
        </div>
      </div>
    )
  }
);

// Enhanced Input Field
interface CalculatorInputProps extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  unit?: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'text' | 'number' | 'email';
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export const CalculatorInput = forwardRef<HTMLInputElement, CalculatorInputProps>(
  ({ className, label, value, onChange, error, helpText, unit, icon: Icon, type = 'text', required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
      if (value && !error) {
        setIsValid(true);
      } else if (error) {
        setIsValid(false);
      } else {
        setIsValid(null);
      }
    }, [value, error]);

    return (
      <div className="space-y-2">
        {/* Label with Help Icon */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
            <span>{label}</span>
            {required && <span className="text-red-500 text-xs">*</span>}
          </label>
          {helpText && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
              </button>
              {showHelp && (
                <div className="absolute bottom-full right-0 mb-2 z-[70] animate-fadeIn">
                  <div className="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-xl text-white dark:text-gray-900 text-xs rounded-xl py-3 px-4 max-w-xs shadow-2xl border border-gray-700 dark:border-gray-300">
                    {helpText}
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95 dark:border-t-gray-100/95"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="relative group">
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            inputMode={type === 'number' ? 'numeric' : type === 'email' ? 'email' : 'text'}
            autoComplete={type === 'email' ? 'email' : type === 'number' ? 'off' : 'on'}
            className={cn(
              "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium min-h-[44px]",
              "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base",
              "touch-manipulation", // Improves touch responsiveness
              unit && "pr-16",
              error && "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20",
              !error && isValid && "border-green-300 dark:border-green-600",
              !error && !isValid && isFocused && "border-blue-300 dark:border-blue-600",
              !error && !isValid && !isFocused && "border-gray-300 dark:border-gray-600",
              className
            )}
            {...props}
          />

          {/* Unit Display */}
          {unit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </div>
          )}

          {/* Validation Icon */}
          {isValid !== null && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}

          {/* Focus Ring Animation */}
          {isFocused && (
            <div className="absolute inset-0 rounded-xl border-2 border-blue-500 animate-pulse"></div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 animate-shake">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

// Enhanced Select Field with Sophisticated Dropdown
interface CalculatorSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  options: { value: string; label: string; disabled?: boolean; description?: string }[];
  placeholder?: string;
  searchable?: boolean;
}

export const CalculatorSelect = forwardRef<HTMLDivElement, CalculatorSelectProps>(
  ({ className, label, value, onChange, error, helpText, icon: Icon, required, options, placeholder, searchable = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (value && !error) {
        setIsValid(true);
      } else if (error) {
        setIsValid(false);
      } else {
        setIsValid(null);
      }
    }, [value, error]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens and determine position
    useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus();
      }
      
      // Determine dropdown position to avoid going off-screen
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320; // Approximate max height of dropdown
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }, [isOpen, searchable]);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            const selectedOption = filteredOptions[highlightedIndex];
            if (!selectedOption.disabled) {
              onChange(selectedOption.value);
              setIsOpen(false);
              setSearchTerm('');
              setHighlightedIndex(-1);
            }
          }
          break;
      }
    };

    const selectedOption = options.find(option => option.value === value);

    return (
      <div className="space-y-2" ref={ref} {...props}>
        {/* Label */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
            <span>{label}</span>
            {required && <span className="text-red-500 text-xs">*</span>}
          </label>
          {helpText && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
              </button>
              {showHelp && (
                <div className="absolute bottom-full right-0 mb-2 z-[70] animate-fadeIn">
                  <div className="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-xl text-white dark:text-gray-900 text-xs rounded-xl py-3 px-4 max-w-xs shadow-2xl border border-gray-700 dark:border-gray-300">
                    {helpText}
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95 dark:border-t-gray-100/95"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown Container */}
        <div className="relative" ref={containerRef}>
          {/* Trigger */}
          <div
            className={cn(
              "relative group cursor-pointer",
              "bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg",
              "border-2 rounded-2xl transition-all duration-300",
              "hover:bg-white dark:hover:bg-gray-800",
              "hover:shadow-lg hover:shadow-blue-500/10",
              "focus-within:ring-4 focus-within:ring-blue-500/20",
              "min-h-[72px]", // Consistent height
              error && "border-red-300 dark:border-red-600 hover:border-red-400",
              !error && isValid && "border-green-300 dark:border-green-600 hover:border-green-400",
              !error && !isValid && (isFocused || isOpen) && "border-blue-300 dark:border-blue-600",
              !error && !isValid && !isFocused && !isOpen && "border-gray-300 dark:border-gray-600",
              isOpen && "ring-4 ring-blue-500/20 border-blue-500 shadow-xl",
              className
            )}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <div className="flex items-center justify-between px-5 py-4 min-h-[44px]">
              <div className="flex-1 min-w-0">
                {selectedOption ? (
                  <div className="space-y-1.5">
                    <div className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-tight">
                      {selectedOption.label}
                    </div>
                    {selectedOption.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {selectedOption.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-[15px]">
                    {placeholder || 'Select an option...'}
                  </span>
                )}
              </div>

              {/* Icons */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Validation Icon */}
                {isValid !== null && (
                  <div className="transition-all duration-200">
                    {isValid ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <AlertCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Dropdown Arrow */}
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                      isOpen && "transform rotate-180 text-blue-500"
                    )} 
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Selection Indicator */}
            {selectedOption && (
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
            )}
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div 
              ref={dropdownRef}
              className={cn(
                "absolute left-0 right-0 z-[99999] animate-sophisticatedFadeIn",
                dropdownPosition === 'bottom' ? "top-full mt-2" : "bottom-full mb-2"
              )}
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                {/* Search Input */}
                {searchable && (
                  <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setHighlightedIndex(-1);
                        }}
                        placeholder="Search options..."
                        inputMode="search"
                        autoComplete="off"
                        className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 min-h-[44px] touch-manipulation"
                      />
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div className="max-h-80 overflow-y-auto py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <div className="font-semibold text-sm">No options found</div>
                      <div className="text-xs mt-1">Try adjusting your search</div>
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative mx-2 my-1 rounded-xl transition-all duration-200 cursor-pointer group",
                          "hover:bg-gradient-to-r hover:from-blue-50/90 hover:to-indigo-50/90 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30",
                          "hover:shadow-sm hover:shadow-blue-500/10",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                          highlightedIndex === index && "bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-sm shadow-blue-500/10",
                          option.disabled && "opacity-50 cursor-not-allowed",
                          option.value === value && "bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-800/40 dark:to-indigo-800/40 font-medium shadow-md shadow-blue-500/20"
                        )}
                        onClick={() => {
                          if (!option.disabled) {
                            onChange(option.value);
                            setIsOpen(false);
                            setSearchTerm('');
                            setHighlightedIndex(-1);
                          }
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div className="flex items-center justify-between px-4 py-4 min-h-[60px]">
                          <div className="flex-1 space-y-1.5">
                            <div className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-tight">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pr-2">
                                {option.description}
                              </div>
                            )}
                          </div>
                          
                          {option.value === value && (
                            <div className="ml-3 flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Selection Indicator */}
                        {option.value === value && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
                        )}

                        {/* Enhanced Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-xl transition-all duration-200 pointer-events-none"></div>
                        
                        {/* Hover Border */}
                        <div className="absolute inset-0 border border-transparent group-hover:border-blue-200/50 dark:group-hover:border-blue-800/50 rounded-xl transition-all duration-200 pointer-events-none"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 animate-sophisticatedFadeIn">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

// Enhanced Checkbox
interface CalculatorCheckboxProps extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const CalculatorCheckbox = forwardRef<HTMLInputElement, CalculatorCheckboxProps>(
  ({ label, checked, onChange, description, icon: Icon, ...props }, ref) => (
    <div className="group">
      <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 min-h-[44px] touch-manipulation">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <div className={cn(
            "w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
            checked 
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 shadow-lg" 
              : "border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 group-hover:border-blue-300"
          )}>
            {checked && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
          </div>
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </label>
    </div>
  )
);

// Enhanced Button
interface CalculatorButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}

export const CalculatorButton = forwardRef<HTMLButtonElement, CalculatorButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon: Icon, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[44px] touch-manipulation",
        
        // Variants
        variant === 'primary' && "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500/30",
        variant === 'secondary' && "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-gray-500/30",
        variant === 'success' && "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500/30",
        variant === 'danger' && "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500/30",
        variant === 'outline' && "border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-500/30",
        
        // Sizes
        size === 'sm' && "px-4 py-2 text-sm",
        size === 'md' && "px-6 py-3 text-base",
        size === 'lg' && "px-8 py-4 text-lg",
        size === 'xl' && "px-10 py-5 text-xl",
        
        className
      )}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button Content */}
      <div className={cn("flex items-center justify-center space-x-2", loading && "opacity-0")}>
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
    </button>
  )
);

// Results Display Component
interface ResultsDisplayProps {
  title: string;
  value: string | number;
  unit?: string;
  category: 'low' | 'borderline' | 'intermediate' | 'high' | 'normal' | 'elevated';
  interpretation?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: ReactNode;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  title,
  value,
  unit,
  category,
  interpretation,
  icon: Icon = TrendingUp,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'low':
      case 'normal':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-800',
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        };
      case 'borderline':
      case 'elevated':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        };
      case 'intermediate':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
        };
      case 'high':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          border: 'border-red-200 dark:border-red-800',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      default:
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <div className={cn(
      "p-4 sm:p-6 lg:p-8 rounded-2xl border-2 backdrop-blur-sm relative overflow-hidden transition-all duration-300",
      config.bg,
      config.border
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-white to-transparent rounded-full blur-lg"></div>
      </div>

      {/* Content */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className={cn("p-3 rounded-xl", config.badge)}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <div className={cn("px-4 py-2 rounded-full text-sm font-bold", config.badge)}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        </div>

        {/* Main Result */}
        <div className="text-center py-6">
          <div className={cn("text-5xl font-bold mb-2", config.color)}>
            {value}
            {unit && <span className="text-2xl ml-1 opacity-80">{unit}</span>}
          </div>
          {interpretation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                {t('common.detailed_analysis') || 'Detailed Analysis'}
              </h3>
              <p className="text-blue-800">{interpretation}</p>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        {children && (
          <div className="border-t border-white/20 dark:border-gray-800/20 pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors min-h-[44px] touch-manipulation"
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">{t('common.detailed_analysis') || 'Detailed Analysis'}</span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            {isExpanded && (
              <div className="mt-4 space-y-4 animate-fadeIn">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 