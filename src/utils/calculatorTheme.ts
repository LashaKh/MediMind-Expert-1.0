/**
 * Calculator Theme Utilities
 * Specialty-aware color logic framework for Calculator Categories page
 * Integrates with modern blue theme from THEME_COLORS.md
 */

import { MedicalSpecialty } from '../stores/useAppStore';

// Theme color constants (matching THEME_COLORS.md)
export const THEME_COLORS = {
  PRIMARY: '#1a365d',      // Deep Navy
  SECONDARY: '#2b6cb0',    // Vibrant Blue  
  ACCENT: '#63b3ed',       // Light Blue
  LIGHT: '#90cdf4',        // Lighter Blue
} as const;

// CSS custom property names for theme integration
export const CSS_VARIABLES = {
  CATEGORY_1: 'var(--calc-category-1)',
  CATEGORY_2: 'var(--calc-category-2)', 
  CATEGORY_3: 'var(--calc-category-3)',
  CATEGORY_4: 'var(--calc-category-4)',
  CARDIOLOGY_GRADIENT: 'var(--calc-cardiology-full)',
  OBGYN_GRADIENT: 'var(--calc-obgyn-full)',
  CARDIOLOGY_HERO: 'var(--calc-cardiology-hero)',
  OBGYN_HERO: 'var(--calc-obgyn-hero)',
  CARDIOLOGY_SUBTLE: 'var(--calc-cardiology-subtle)',
  OBGYN_SUBTLE: 'var(--calc-obgyn-subtle)',
} as const;

/**
 * Get category icon color based on category index
 * Cycles through 4-color theme progression
 */
export const getCategoryIconColor = (categoryIndex: number): string => {
  const colors = [
    CSS_VARIABLES.CATEGORY_1, // Deep Navy - High priority
    CSS_VARIABLES.CATEGORY_2, // Vibrant Blue - Standard priority
    CSS_VARIABLES.CATEGORY_3, // Light Blue - Secondary priority
    CSS_VARIABLES.CATEGORY_4, // Lighter Blue - Low priority
  ];
  
  return colors[categoryIndex % 4];
};

/**
 * Get category icon color CSS class based on category index
 * For use in Tailwind className
 */
export const getCategoryIconClass = (categoryIndex: number): string => {
  const classes = [
    'text-calc-category-1',
    'text-calc-category-2', 
    'text-calc-category-3',
    'text-calc-category-4',
  ];
  
  return classes[categoryIndex % 4];
};

/**
 * Get specialty-aware gradient based on medical specialty
 * Returns appropriate gradient for hero sections
 */
export const getSpecialtyGradient = (specialty: MedicalSpecialty): string => {
  return specialty === MedicalSpecialty.OBGYN 
    ? CSS_VARIABLES.OBGYN_GRADIENT
    : CSS_VARIABLES.CARDIOLOGY_GRADIENT;
};

/**
 * Get specialty-aware hero gradient CSS class
 * For use in Tailwind className
 */
export const getSpecialtyGradientClass = (specialty: MedicalSpecialty): string => {
  return specialty === MedicalSpecialty.OBGYN 
    ? 'bg-calc-obgyn-full'
    : 'bg-calc-cardiology-full';
};

/**
 * Get specialty-aware hero gradient for CSS style prop
 * Linear gradient for hero sections
 */
export const getSpecialtyHeroGradient = (specialty: MedicalSpecialty): string => {
  return specialty === MedicalSpecialty.OBGYN
    ? CSS_VARIABLES.OBGYN_HERO  
    : CSS_VARIABLES.CARDIOLOGY_HERO;
};

/**
 * Get specialty-aware subtle background gradient
 * For use in background decorations and floating orbs
 */
export const getSpecialtySubtleGradient = (specialty: MedicalSpecialty): string => {
  return specialty === MedicalSpecialty.OBGYN
    ? CSS_VARIABLES.OBGYN_SUBTLE
    : CSS_VARIABLES.CARDIOLOGY_SUBTLE;
};

/**
 * Get active category styling based on specialty
 * Returns CSS classes for active/selected category state
 */
export const getActiveCategoryClasses = (specialty: MedicalSpecialty): string => {
  const baseClasses = 'shadow-xl scale-105 border-2';
  const specialtyGradient = getSpecialtyGradientClass(specialty);
  
  return `${baseClasses} ${specialtyGradient}`;
};

/**
 * Get category card hover classes based on specialty
 * Provides consistent hover effects across categories
 */
export const getCategoryHoverClasses = (specialty: MedicalSpecialty): string => {
  const baseClasses = 'hover:shadow-xl hover:scale-105 transition-all duration-300';
  const specialtyHover = specialty === MedicalSpecialty.OBGYN
    ? 'hover:bg-calc-obgyn hover:text-white'
    : 'hover:bg-calc-cardiology hover:text-white';
    
  return `${baseClasses} ${specialtyHover}`;
};

/**
 * Generate inline styles for dynamic gradients
 * Useful when Tailwind classes are not sufficient
 */
export const generateGradientStyle = (specialty: MedicalSpecialty, opacity = 1): React.CSSProperties => {
  const gradient = specialty === MedicalSpecialty.OBGYN
    ? `linear-gradient(135deg, ${THEME_COLORS.SECONDARY}, ${THEME_COLORS.ACCENT}, ${THEME_COLORS.LIGHT})`
    : `linear-gradient(135deg, ${THEME_COLORS.PRIMARY}, ${THEME_COLORS.SECONDARY}, ${THEME_COLORS.ACCENT})`;
    
  return {
    background: gradient,
    opacity,
  };
};

/**
 * Generate specialty-aware floating orb styles
 * Replaces hardcoded random colors with theme-compliant orb decorations
 */
export const generateOrbStyle = (
  specialty: MedicalSpecialty, 
  orbIndex: number,
  size: number = 400
): React.CSSProperties => {
  const colors = specialty === MedicalSpecialty.OBGYN 
    ? [THEME_COLORS.SECONDARY, THEME_COLORS.ACCENT, THEME_COLORS.LIGHT]
    : [THEME_COLORS.PRIMARY, THEME_COLORS.SECONDARY, THEME_COLORS.ACCENT];
    
  const primaryColor = colors[orbIndex % colors.length];
  const secondaryColor = colors[(orbIndex + 1) % colors.length];
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    background: `linear-gradient(to right, ${primaryColor}/15, ${secondaryColor}/10)`,
    borderRadius: '50%',
    filter: 'blur(3xl)',
    animation: 'pulse 6s ease-in-out infinite',
  };
};

/**
 * Utility to check if current theme matches target color
 * Useful for conditional rendering based on theme state
 */
export const isThemeColor = (color: string): boolean => {
  return Object.values(THEME_COLORS).includes(color as any);
};

/**
 * Get validation badge colors that align with theme
 * Maintains consistency with specialty colors
 */
export const getValidationBadgeClasses = (specialty: MedicalSpecialty): string => {
  const baseClasses = 'px-3 py-1.5 rounded-xl border shadow-md backdrop-blur-sm';
  const specialtyClasses = specialty === MedicalSpecialty.OBGYN
    ? 'bg-gradient-to-r from-calc-theme-accent/20 to-calc-theme-light/15 text-calc-theme-secondary border-calc-theme-accent/30'
    : 'bg-gradient-to-r from-calc-theme-primary/20 to-calc-theme-secondary/15 text-calc-theme-primary border-calc-theme-secondary/30';
    
  return `${baseClasses} ${specialtyClasses}`;
};

/**
 * Get feature indicator colors based on feature type and specialty
 */
export const getFeatureIndicatorClasses = (
  featureType: 'clinical' | 'accurate' | 'validated',
  specialty: MedicalSpecialty
): string => {
  const baseClasses = 'px-2.5 py-1.5 rounded-lg border shadow-sm';
  
  // Use consistent theme colors for features regardless of specialty
  const colorMap = {
    clinical: 'bg-gradient-to-r from-calc-theme-secondary/20 to-calc-theme-secondary/10 text-calc-theme-secondary border-calc-theme-secondary/30',
    accurate: 'bg-gradient-to-r from-calc-theme-accent/20 to-calc-theme-accent/10 text-calc-theme-accent border-calc-theme-accent/30', 
    validated: 'bg-gradient-to-r from-calc-theme-primary/20 to-calc-theme-primary/10 text-calc-theme-primary border-calc-theme-primary/30',
  };
  
  return `${baseClasses} ${colorMap[featureType]}`;
};

/**
 * Get stats section colors that progress through theme
 * Maintains visual hierarchy with theme colors
 */
export const getStatsColors = () => ({
  validated: CSS_VARIABLES.CATEGORY_1, // Deep Navy
  clinical: CSS_VARIABLES.CATEGORY_2,  // Vibrant Blue  
  evidence: CSS_VARIABLES.CATEGORY_3,  // Light Blue
  performance: CSS_VARIABLES.CATEGORY_4, // Lighter Blue
});

/**
 * Type-safe category color assignment
 * Ensures color assignment follows theme progression
 */
export interface CategoryColorAssignment {
  iconColor: string;
  iconClass: string;
  hoverClasses: string;
  activeClasses: string;
}

export const getCategoryColorAssignment = (
  categoryIndex: number,
  specialty: MedicalSpecialty
): CategoryColorAssignment => {
  return {
    iconColor: getCategoryIconColor(categoryIndex),
    iconClass: getCategoryIconClass(categoryIndex),
    hoverClasses: getCategoryHoverClasses(specialty),
    activeClasses: getActiveCategoryClasses(specialty),
  };
};

/**
 * Migration helper to replace hardcoded color mappings
 * Maps old Tailwind classes to new theme classes
 */
export const LEGACY_COLOR_MAPPING = {
  'text-red-600': 'text-calc-category-1',
  'text-blue-600': 'text-calc-category-2', 
  'text-purple-600': 'text-calc-category-3',
  'text-green-600': 'text-calc-category-4',
  'text-orange-600': 'text-calc-category-1',
  'text-indigo-600': 'text-calc-category-2',
  'text-pink-600': 'text-calc-category-3',
} as const;

/**
 * Helper to migrate legacy color class to theme class
 */
export const migrateLegacyColorClass = (legacyClass: string): string => {
  return LEGACY_COLOR_MAPPING[legacyClass as keyof typeof LEGACY_COLOR_MAPPING] || legacyClass;
};