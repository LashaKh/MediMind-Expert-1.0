import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date...",
  error,
  helpText,
  icon: Icon = Calendar,
  disabled = false,
  minDate,
  maxDate,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setDisplayDate(date);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(date);
    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(displayDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDisplayDate(newDate);
  };

  const getDaysInMonth = (): Date[] => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="w-4 h-4 text-blue-500" />
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>

      {/* Input Field */}
      <div className="relative">
        <div
          ref={inputRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            relative w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 cursor-pointer
            ${error 
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400' 
              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isOpen ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-600' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`${selectedDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
              {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
            </span>
            <div className="flex items-center space-x-2">
              {selectedDate && !disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Clear date"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <Calendar className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-600 rounded-xl shadow-2xl backdrop-blur-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-xl">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
              
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === displayDate.getMonth();
                  const disabled = isDateDisabled(date);
                  const selected = isSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      key={index}
                      onClick={() => !disabled && isCurrentMonth && handleDateSelect(date)}
                      disabled={disabled || !isCurrentMonth}
                      className={`
                        p-2 text-sm rounded-lg transition-all duration-200 hover:scale-105
                        ${!isCurrentMonth 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : disabled
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : selected
                          ? 'bg-blue-500 text-white font-semibold shadow-lg'
                          : today
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border-2 border-blue-300 dark:border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Today Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => handleDateSelect(new Date())}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
          <Icon className="w-3 h-3" />
          <span>{helpText}</span>
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
          <Icon className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}; 