/**
 * Personal Library Types
 *
 * TypeScript type definitions for the Personal Library Premium feature.
 */

import { DocumentWithMetadata } from '../../../lib/api/knowledgeBase';
import { DocumentGroup } from '../utils/documentGrouping';

// View modes
export type ViewMode = 'grid' | 'list' | 'masonry' | 'timeline';

// Sort options
export type SortBy = 'name' | 'date' | 'size' | 'type' | 'relevance' | 'category';
export type SortOrder = 'asc' | 'desc';

// Display density
export type DisplayDensity = 'comfortable' | 'compact' | 'spacious';

// Search filters interface
export interface SearchFilters {
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

// Personal library state
export interface PersonalLibraryState {
  documents: DocumentWithMetadata[];
  documentGroups: DocumentGroup[];
  expandedGroups: Set<string>;
  selectedDocuments: Set<string>;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  displayDensity: DisplayDensity;
  showMetadata: boolean;
  showPreview: boolean;
}

// Document stats
export interface DocumentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalSize: number;
  categories: Record<string, number>;
  recentUploads: number;
}

// Specialty theme
export interface SpecialtyTheme {
  primary: string;
  primaryBg: string;
  primaryLight: string;
  primaryGradient: string;
  border: string;
  accent: string;
}

// Re-export DocumentGroup for convenience
export type { DocumentGroup };
