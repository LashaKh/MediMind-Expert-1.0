/**
 * Types and interfaces for the Interactive Markdown Viewer component
 */

/**
 * Props for the main InteractiveMarkdownViewer component
 */
export interface InteractiveMarkdownViewerProps {
  /** Path to the markdown file to load */
  filePath?: string;
  /** Title to display in the viewer */
  title?: string;
  /** Direct markdown content as an alternative to filePath */
  markdownContent?: string;
}

/**
 * Represents an item in the table of contents
 */
export interface TableOfContentsItem {
  /** Unique identifier for the section */
  id: string;
  /** Display title of the section */
  title: string;
  /** Heading level (1-6) */
  level: number;
}

/**
 * Represents a parsed markdown section
 */
export interface MarkdownSection {
  /** Unique identifier for the section */
  id: string;
  /** Display title of the section */
  title: string;
  /** Heading level (1-6) */
  level: number;
  /** Raw markdown content of the section */
  content: string;
  /** Whether the section is collapsed in the UI */
  isCollapsed: boolean;
}

/**
 * Evidence level information for medical content
 */
export interface EvidenceLevel {
  /** Evidence level (A, B, C, D, E, etc.) */
  level: string;
  /** Tailwind color class for styling */
  color: string;
  /** Lucide icon component for display */
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props for components that render references
 */
export interface ReferenceProps {
  /** Raw markdown content containing references */
  content: string;
}

/**
 * Props for table of contents component
 */
export interface TableOfContentsProps {
  /** Array of TOC items to display */
  items: TableOfContentsItem[];
  /** Currently active section ID */
  activeSection: string;
  /** Whether the TOC is currently visible */
  isVisible: boolean;
  /** Callback when a TOC item is clicked */
  onItemClick: (id: string) => void;
  /** Callback to toggle TOC visibility */
  onToggleVisibility: () => void;
  /** Array of sections for collapse/expand functionality */
  sections?: MarkdownSection[];
  /** Callback to toggle section collapse/expand */
  onToggleSection?: (id: string) => void;
  /** Estimated reading time in minutes */
  estimatedReadTime?: number;
  /** Current reading progress as percentage */
  readingProgress?: number;
}

/**
 * Props for reading progress components
 */
export interface ReadingProgressProps {
  /** Current reading progress as a percentage (0-100) */
  progress: number;
  /** Whether to show the back to top button */
  showBackToTop: boolean;
  /** Callback when back to top is clicked */
  onBackToTop: () => void;
}

/**
 * Props for search functionality
 */
export interface SearchProps {
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Whether search is currently active */
  isSearchActive: boolean;
}

/**
 * Props for evidence level rendering
 */
export interface EvidenceLevelProps {
  /** Text content to analyze for evidence levels */
  children: React.ReactNode;
}