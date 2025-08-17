/**
 * FilterCategoryTabs - Tabbed organization system for advanced medical filters
 * Provides intuitive navigation between different filter categories
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  // Content & Format
  DocumentTextIcon,
  FolderIcon,
  DocumentIcon,
  
  // Authority & Quality
  ShieldCheckIcon,
  AcademicCapIcon,
  StarIcon,
  
  // Medical Domain
  HeartIcon,
  BeakerIcon,
  UserGroupIcon,
  
  // Audience & Complexity
  UsersIcon,
  ChartBarIcon,
  BookOpenIcon,
  
  // Publication & Access
  CalendarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  
  // Geographic & Context
  MapPinIcon,
  BuildingOfficeIcon,
  CogIcon,
  
  // Quick Access
  BoltIcon,
  MagnifyingGlassIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

import {
  DocumentTextIcon as DocumentTextSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  HeartIcon as HeartSolid,
  UsersIcon as UsersSolid,
  CalendarIcon as CalendarSolid,
  MapPinIcon as MapPinSolid,
  BoltIcon as BoltSolid
} from '@heroicons/react/24/solid';

export type FilterCategoryId = 
  | 'quick-filters'
  | 'content-format'
  | 'authority-quality'
  | 'medical-domain'
  | 'publication-access'
  | 'geographic-context'
  | 'advanced-options';

export interface FilterCategory {
  id: FilterCategoryId;
  label: string;
  description: string;
  icon: React.ElementType;
  iconActive: React.ElementType;
  color: string;
  badgeColor: string;
  count?: number;
  isPopular?: boolean;
}

interface FilterCategoryTabsProps {
  activeCategory: FilterCategoryId;
  onCategoryChange: (category: FilterCategoryId) => void;
  categoryCounts?: Record<FilterCategoryId, number>;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const FilterCategoryTabs: React.FC<FilterCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  categoryCounts = {},
  className = '',
  layout = 'horizontal'
}) => {
  const { t } = useTranslation();
  const [hoveredCategory, setHoveredCategory] = useState<FilterCategoryId | null>(null);

  const categories: FilterCategory[] = [
    {
      id: 'quick-filters',
      label: t('filters.categories.quickFilters', 'Quick Filters'),
      description: t('filters.categories.quickFiltersDesc', 'Popular filter combinations for common searches'),
      icon: BoltIcon,
      iconActive: BoltSolid,
      color: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      isPopular: true
    },
    {
      id: 'content-format',
      label: t('filters.categories.contentFormat', 'Content & Format'),
      description: t('filters.categories.contentFormatDesc', 'Filter by content type, file format, and document structure'),
      icon: DocumentTextIcon,
      iconActive: DocumentTextSolid,
      color: 'text-blue-600',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'authority-quality',
      label: t('filters.categories.authorityQuality', 'Authority & Quality'),
      description: t('filters.categories.authorityQualityDesc', 'Source credibility, peer review status, and evidence quality'),
      icon: ShieldCheckIcon,
      iconActive: ShieldCheckSolid,
      color: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      id: 'medical-domain',
      label: t('filters.categories.medicalDomain', 'Medical Domain'),
      description: t('filters.categories.medicalDomainDesc', 'Medical specialties, subspecialties, and clinical topics'),
      icon: HeartIcon,
      iconActive: HeartSolid,
      color: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-700',
      isPopular: true
    },
    {
      id: 'publication-access',
      label: t('filters.categories.publicationAccess', 'Publication & Access'),
      description: t('filters.categories.publicationAccessDesc', 'Publication date, access type, and availability'),
      icon: CalendarIcon,
      iconActive: CalendarSolid,
      color: 'text-indigo-600',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'geographic-context',
      label: t('filters.categories.geographicContext', 'Geographic & Context'),
      description: t('filters.categories.geographicContextDesc', 'Geographic relevance, practice settings, and patient populations'),
      icon: MapPinIcon,
      iconActive: MapPinSolid,
      color: 'text-teal-600',
      badgeColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 'advanced-options',
      label: t('filters.categories.advancedOptions', 'Advanced Options'),
      description: t('filters.categories.advancedOptionsDesc', 'Clinical trials, research parameters, and specialized filters'),
      icon: CogIcon,
      iconActive: CogIcon,
      color: 'text-gray-600',
      badgeColor: 'bg-gray-100 text-gray-700'
    }
  ];

  const renderTab = (category: FilterCategory, index: number) => {
    const isActive = activeCategory === category.id;
    const isHovered = hoveredCategory === category.id;
    const count = categoryCounts[category.id] || 0;
    const hasActiveFilters = count > 0;
    
    const IconComponent = isActive || isHovered ? category.iconActive : category.icon;

    return (
      <button
        key={category.id}
        onClick={() => onCategoryChange(category.id)}
        onMouseEnter={() => setHoveredCategory(category.id)}
        onMouseLeave={() => setHoveredCategory(null)}
        className={`group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
          layout === 'vertical' ? 'w-full justify-start' : 'flex-1 justify-center'
        } ${
          isActive
            ? `bg-white shadow-lg border-2 border-current ${category.color} transform scale-105`
            : hasActiveFilters
            ? 'bg-white/80 hover:bg-white shadow-md border border-gray-200 hover:border-current hover:shadow-lg text-gray-700 hover:text-current'
            : 'bg-transparent hover:bg-white/60 text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200'
        }`}
        title={category.description}
        style={{
          animationDelay: `${index * 50}ms`
        }}
      >
        {/* Background gradient for active state */}
        {isActive && (
          <div className={`absolute inset-0 bg-gradient-to-r opacity-5 rounded-xl ${
            category.color.includes('yellow') ? 'from-yellow-400 to-orange-400' :
            category.color.includes('blue') ? 'from-blue-400 to-cyan-400' :
            category.color.includes('green') ? 'from-green-400 to-emerald-400' :
            category.color.includes('red') ? 'from-red-400 to-pink-400' :
            category.color.includes('purple') ? 'from-purple-400 to-indigo-400' :
            category.color.includes('indigo') ? 'from-indigo-400 to-blue-400' :
            category.color.includes('teal') ? 'from-teal-400 to-cyan-400' :
            'from-gray-400 to-slate-400'
          }`}></div>
        )}

        {/* Icon */}
        <div className={`relative flex-shrink-0 ${
          isActive ? category.color : ''
        }`}>
          <IconComponent className={`w-6 h-6 transition-all duration-300 ${
            isActive ? 'scale-110' : 'group-hover:scale-105'
          }`} />
          
          {/* Popular indicator */}
          {category.isPopular && !isActive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Label and description */}
        <div className={`flex-1 text-left ${layout === 'vertical' ? '' : 'hidden lg:block'}`}>
          <div className={`font-semibold text-sm transition-colors duration-300 ${
            isActive ? category.color : ''
          }`}>
            {category.label}
          </div>
          {layout === 'vertical' && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {category.description}
            </div>
          )}
        </div>

        {/* Badge for active filters */}
        {hasActiveFilters && (
          <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
            isActive 
              ? 'bg-current text-white' 
              : category.badgeColor
          } ${count > 9 ? 'animate-pulse' : ''}`}>
            {count > 99 ? '99+' : count}
          </div>
        )}

        {/* Active indicator line */}
        {isActive && layout === 'horizontal' && (
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-full transition-all duration-300 ${
            category.color.replace('text-', 'bg-')
          }`}></div>
        )}

        {/* Active indicator line for vertical */}
        {isActive && layout === 'vertical' && (
          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300 ${
            category.color.replace('text-', 'bg-')
          }`}></div>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-current to-transparent"></div>
      </button>
    );
  };

  if (layout === 'vertical') {
    return (
      <div className={`space-y-2 ${className}`}>
        {categories.map((category, index) => renderTab(category, index))}
      </div>
    );
  }

  return (
    <div className={`bg-gray-50/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 ${className}`}>
      {/* Mobile dropdown for small screens */}
      <div className="block lg:hidden">
        <select
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value as FilterCategoryId)}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
              {categoryCounts[category.id] > 0 && ` (${categoryCounts[category.id]})`}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden lg:flex items-center gap-2">
        {categories.map((category, index) => renderTab(category, index))}
      </div>

      {/* Quick stats */}
      <div className="hidden lg:flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200/50 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{t('filters.summary.activeFilters', 'Active filters')}: {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{t('filters.summary.categories', 'Categories')}: {Object.keys(categoryCounts).filter(key => categoryCounts[key as FilterCategoryId] > 0).length}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterCategoryTabs;