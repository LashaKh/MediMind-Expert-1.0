import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Calendar,
  Tag,
  FileType,
  BarChart3,
  Clock,
  Heart,
  CheckCircle,
  Loader,
  SlidersHorizontal,
  Hash,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  status: string;
  category: string;
  tags: string[];
  dateRange: { from: string; to: string };
  fileTypes: string[];
  sizeRange: { min: number; max: number };
  favorites: boolean;
  recent: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
  availableCategories: FilterOption[];
  availableFileTypes: FilterOption[];
  totalDocuments: number;
  filteredDocuments: number;
  isOpen: boolean;
  onToggle: () => void;
}

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const TagInput: React.FC<{
  tags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}> = ({ tags, availableTags, onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return availableTags.slice(0, 5);
    return availableTags
      .filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) && 
        !tags.includes(tag)
      )
      .slice(0, 5);
  }, [inputValue, availableTags, tags]);

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className="min-h-[2.5rem] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex flex-wrap items-center gap-1">
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">{suggestion}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RangeSlider: React.FC<{
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  unit?: string;
  formatValue?: (value: number) => string;
}> = ({ min, max, value, onChange, step = 1, label, unit = '', formatValue }) => {
  const formatFn = formatValue || ((v) => `${v}${unit}`);

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatFn(value[0])} - {formatFn(value[1])}
          </span>
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          step={step}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          step={step}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
        />
        
        {/* Track fill */}
        <div 
          className="absolute h-2 bg-blue-500 rounded-lg pointer-events-none"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            width: `${((value[1] - value[0]) / (max - min)) * 100}%`
          }}
        />
      </div>
    </div>
  );
};

const FilterChip: React.FC<{
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: string;
}> = ({ label, count, isActive, onClick, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: isActive 
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600',
    green: isActive
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600',
    red: isActive
      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium border rounded-full transition-all duration-200
        ${colorClasses[color as keyof typeof colorClasses]}
      `}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
          {count}
        </span>
      )}
    </motion.button>
  );
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  availableCategories,
  availableFileTypes,
  totalDocuments,
  filteredDocuments,
  isOpen,
  onToggle
}) => {
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.fileTypes && filters.fileTypes.length > 0) count++;
    if (filters.favorites || filters.recent) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: 'all',
      category: 'all',
      tags: [],
      dateRange: { from: '', to: '' },
      fileTypes: [],
      sizeRange: { min: 0, max: 100 },
      favorites: false,
      recent: false
    });
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <FileImage className="w-4 h-4" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>
              <AnimatedCounter value={filteredDocuments} /> of{' '}
              <AnimatedCounter value={totalDocuments} /> documents
            </span>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          {filters.searchTerm && (
            <span className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 text-sm rounded-full">
              <Search className="w-3 h-3 mr-1" />
              "{filters.searchTerm}"
              <button
                onClick={() => onFiltersChange({ ...filters, searchTerm: '' })}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.tags && filters.tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 text-sm rounded-full">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  tags: (filters.tags || []).filter(t => t !== tag) 
                })}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </motion.div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6"
          >
            {/* Quick Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Quick Filters</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Favorites"
                  isActive={filters.favorites}
                  onClick={() => onFiltersChange({ ...filters, favorites: !filters.favorites })}
                  icon={<Heart className="w-3 h-3" />}
                  color="red"
                />
                <FilterChip
                  label="Recent"
                  isActive={filters.recent}
                  onClick={() => onFiltersChange({ ...filters, recent: !filters.recent })}
                  icon={<Clock className="w-3 h-3" />}
                  color="green"
                />
                <FilterChip
                  label="Completed"
                  isActive={filters.status === 'completed'}
                  onClick={() => onFiltersChange({ 
                    ...filters, 
                    status: filters.status === 'completed' ? 'all' : 'completed' 
                  })}
                  icon={<CheckCircle className="w-3 h-3" />}
                  color="green"
                />
                <FilterChip
                  label="Processing"
                  isActive={filters.status === 'pending'}
                  onClick={() => onFiltersChange({ 
                    ...filters, 
                    status: filters.status === 'pending' ? 'all' : 'pending' 
                  })}
                  icon={<Loader className="w-3 h-3" />}
                  color="blue"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Categories</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <FilterChip
                    key={category.value}
                    label={category.label}
                    count={category.count}
                    isActive={filters.category === category.value}
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      category: filters.category === category.value ? 'all' : category.value 
                    })}
                    icon={category.icon}
                  />
                ))}
              </div>
            </div>

            {/* File Types */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <FileType className="w-4 h-4" />
                <span>File Types</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableFileTypes.map(fileType => (
                  <FilterChip
                    key={fileType.value}
                    label={fileType.label}
                    count={fileType.count}
                    isActive={(filters.fileTypes || []).includes(fileType.value)}
                    onClick={() => {
                      const currentFileTypes = filters.fileTypes || [];
                      const newFileTypes = currentFileTypes.includes(fileType.value)
                        ? currentFileTypes.filter(t => t !== fileType.value)
                        : [...currentFileTypes, fileType.value];
                      onFiltersChange({ ...filters, fileTypes: newFileTypes });
                    }}
                    icon={getFileTypeIcon(fileType.value)}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </h3>
              <TagInput
                tags={filters.tags || []}
                availableTags={availableTags}
                onChange={(tags) => onFiltersChange({ ...filters, tags })}
                placeholder="Add tags to filter by..."
              />
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={(filters.dateRange || {}).from || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...(filters.dateRange || {}), from: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={(filters.dateRange || {}).to || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...(filters.dateRange || {}), to: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* File Size Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>File Size</span>
              </h3>
              <RangeSlider
                min={0}
                max={100}
                value={[
                  (filters.sizeRange || {}).min || 0, 
                  (filters.sizeRange || {}).max || 100
                ]}
                onChange={(value) => onFiltersChange({
                  ...filters,
                  sizeRange: { min: value[0], max: value[1] }
                })}
                formatValue={(value) => formatFileSize(value * 1024 * 1024)}
                unit=" MB"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};