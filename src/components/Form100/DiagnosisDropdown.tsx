// Diagnosis Dropdown Component
// Evidence-based ICD-10 diagnosis selection with search functionality
// Medical-grade validation with Georgian/English bilingual support

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DiagnosisDropdownProps, DiagnosisCode, DiagnosisCategory } from '../../types/form100';
import { 
  DIAGNOSIS_CODES, 
  DIAGNOSIS_CATEGORIES,
  getDiagnosisByCategory,
  searchDiagnoses,
  getActiveCategories
} from './config/diagnosisConfig';

// Category icons mapping for medical specialties
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  emergency: AlertCircle,
  cardiology: Heart,
  respiratory: Activity,
  neurological: Brain,
  gastrointestinal: Stethoscope,
  trauma: AlertCircle
};

const DiagnosisDropdown: React.FC<DiagnosisDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select diagnosis...",
  disabled = false,
  required = false,
  className,
  categories = getActiveCategories(),
  showSearch = true,
  specializedDiagnosisList
}) => {
  // Component state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DiagnosisCategory | null>(null);
  const [filteredDiagnoses, setFilteredDiagnoses] = useState<DiagnosisCode[]>([]);
  
  // Refs for accessibility and click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter diagnoses based on search query and category
  const diagnoses = useMemo(() => {
    // Use specialized list if provided (for NSTEMI reports, etc.)
    const baseList = specializedDiagnosisList || DIAGNOSIS_CODES.filter(d => d.isActive);
    
    if (searchQuery) {
      // Search within the specialized list if provided, otherwise search all
      const searchResults = specializedDiagnosisList 
        ? baseList.filter(diagnosis => 
            diagnosis.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            diagnosis.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            diagnosis.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            diagnosis.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : searchDiagnoses(searchQuery);
      return searchResults;
    }
    
    if (selectedCategory && !specializedDiagnosisList) {
      return getDiagnosisByCategory(selectedCategory.id);
    }
    
    return baseList;
  }, [searchQuery, selectedCategory, specializedDiagnosisList]);

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Handle diagnosis selection
  const handleDiagnosisSelect = (diagnosis: DiagnosisCode) => {
    onChange(diagnosis);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Handle category filter
  const handleCategorySelect = (category: DiagnosisCategory | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCategory(null);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && !isOpen) {
      toggleDropdown();
    }
  };

  // Render severity indicator
  const renderSeverityIndicator = (severity?: DiagnosisCode['severity']) => {
    if (!severity) return null;
    
    const severityConfig = {
      mild: { color: 'bg-green-100 text-green-800', text: 'Mild' },
      moderate: { color: 'bg-yellow-100 text-yellow-800', text: 'Moderate' },
      severe: { color: 'bg-orange-100 text-orange-800', text: 'Severe' },
      critical: { color: 'bg-red-100 text-red-800', text: 'Critical' }
    };
    
    const config = severityConfig[severity];
    
    return (
      <span className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        config.color
      )}>
        {config.text}
      </span>
    );
  };

  // Render category icon
  const getCategoryIcon = (categoryId: string) => {
    const IconComponent = CATEGORY_ICONS[categoryId] || Stethoscope;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Main dropdown trigger */}
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm",
          "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "transition-all duration-200",
          disabled && "bg-gray-50 text-gray-400 cursor-not-allowed",
          isOpen && "border-blue-400 ring-2 ring-blue-500 ring-opacity-20",
          "min-h-[44px]" // Mobile touch target
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {value ? (
            <>
              <div className="flex-shrink-0">
                {getCategoryIcon(value.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 truncate">
                    {value.name}
                  </span>
                  {renderSeverityIndicator(value.severity)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-mono text-gray-500">
                    {value.code}
                  </span>
                  <span className="text-xs text-gray-400">
                    {value.nameEn}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-400 flex-1 truncate">
              {placeholder}
            </span>
          )}
        </div>
        
        <ChevronDown className={cn(
          "w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 w-full -mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search and filters */}
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            {showSearch && (
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search diagnoses..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {/* Category filters - only show if not using specialized list */}
            {!specializedDiagnosisList && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    !selectedCategory 
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center space-x-1",
                      selectedCategory?.id === category.id
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {getCategoryIcon(category.id)}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Show specialized list indicator */}
            {specializedDiagnosisList && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  NSTEMI Specialized Diagnosis List
                </span>
              </div>
            )}
          </div>

          {/* Diagnosis list */}
          <div className="max-h-52 overflow-y-auto">
            {diagnoses.length > 0 ? (
              <ul className="py-1">
                {diagnoses.map((diagnosis) => (
                  <li key={diagnosis.id}>
                    <button
                      onClick={() => handleDiagnosisSelect(diagnosis)}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors",
                        "border-b border-gray-100 last:border-b-0"
                      )}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getCategoryIcon(diagnosis.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {diagnosis.name}
                            </span>
                            {renderSeverityIndicator(diagnosis.severity)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-500">
                              {diagnosis.code}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {diagnosis.nameEn}
                            </span>
                          </div>
                          {diagnosis.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {diagnosis.description}
                            </p>
                          )}
                        </div>
                        {value?.id === diagnosis.id && (
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Stethoscope className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {searchQuery 
                    ? `No diagnoses found for "${searchQuery}"` 
                    : "No diagnoses available"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation message */}
      {required && !value && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          Primary diagnosis is required
        </p>
      )}
    </div>
  );
};

export default DiagnosisDropdown;