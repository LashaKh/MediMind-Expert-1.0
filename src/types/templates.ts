/**
 * Custom Report Templates Type Definitions
 * 
 * These types define the structure for user-created medical report templates
 * that guide AI-generated reports from Georgian transcripts.
 */

export interface UserReportTemplate {
  id: string;
  user_id: string;
  name: string;
  example_structure: string;
  notes: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  last_used_at: string | null;
}

export interface CreateTemplateRequest {
  name: string;
  example_structure: string;
  notes?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  example_structure?: string;
  notes?: string;
}

export interface TemplateUsageRequest {
  template_id: string;
}

// Database response types
export interface TemplateListResponse {
  templates: UserReportTemplate[];
  total_count: number;
}

export interface TemplateUsageResponse {
  message: string;
  usage_count: number;
}

// UI state types
export interface TemplateFormData {
  name: string;
  example_structure: string;
  notes: string;
}

export interface TemplateSearchFilters {
  search: string;
  order_by: 'created_at' | 'usage_count' | 'name';
  order_direction: 'asc' | 'desc';
}

// Error types
export interface TemplateError {
  error: string;
  code: string;
  details?: {
    field_errors?: Record<string, string[]>;
  };
}

// Component props types
export interface MyTemplatesSectionProps {
  onSelectTemplate: (instruction: string) => void;
  disabled?: boolean;
  hasTranscript: boolean;
  transcript: string;
  onAddToHistory?: (instruction: string, response: string, model: string, tokensUsed?: number, processingTime?: number) => void;
}

export interface TemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: UserReportTemplate) => void;
  editTemplate?: UserReportTemplate; // Optional: template to edit (if not provided, create mode)
  onTemplateUpdated?: (template: UserReportTemplate) => void; // Called when editing existing template
}

export interface TemplateManagementCardProps {
  template: UserReportTemplate;
  onEdit: (template: UserReportTemplate) => void;
  onDelete: (template: UserReportTemplate) => void;
  onSelect: (template: UserReportTemplate) => void;
  disabled?: boolean;
}

export interface TemplateSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: TemplateSearchFilters;
  onFiltersChange: (filters: TemplateSearchFilters) => void;
  isLoading?: boolean;
}

// Template metadata for display
export interface TemplateDisplayInfo {
  id: string;
  name: string;
  description: string;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

// Template validation constants
export const TEMPLATE_CONSTRAINTS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EXAMPLE_MIN_LENGTH: 10,
  EXAMPLE_MAX_LENGTH: 50000,
  NOTES_MAX_LENGTH: 10000,
  MAX_TEMPLATES_PER_USER: 50,
  NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,()]+$/,
} as const;

// Template sorting options
export const TEMPLATE_SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'usage_count', label: 'Usage Count' },
  { value: 'name', label: 'Name' },
] as const;

export const TEMPLATE_SORT_DIRECTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
] as const;