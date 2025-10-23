import { DocumentWithMetadata } from '../../../lib/api/knowledgeBase';

// View mode types
export type ViewMode = 'grid' | 'list' | 'masonry' | 'timeline';
export type SortBy = 'name' | 'date' | 'size' | 'type' | 'relevance' | 'category';
export type SortOrder = 'asc' | 'desc';
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

// Document group interface for chunked documents
export interface DocumentGroup {
  id: string;
  isChunked: boolean;
  baseTitle: string;
  documents: DocumentWithMetadata[];
  totalParts?: number;
  isExpanded?: boolean;
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

// Document statistics
export interface DocumentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

// Theme configuration
export interface SpecialtyTheme {
  primary: string;
  primaryBg: string;
  primaryLight: string;
  primaryGradient: string;
  border: string;
  accent: string;
}

// Command palette command
export interface CommandPaletteCommand {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}
