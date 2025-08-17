// Final Modular Replacement for InteractiveMarkdownViewer
// This file replaces the original 2460-line InteractiveMarkdownViewer.tsx
// while maintaining 100% identical functionality using enhanced modular components

export { default as InteractiveMarkdownViewer } from './ModularInteractiveMarkdownViewer';
export { ModularInteractiveMarkdownViewer as default } from './ModularInteractiveMarkdownViewer';

// Re-export all the types and interfaces for backward compatibility
export type { 
  InteractiveMarkdownViewerProps,
  MarkdownSection,
  TableOfContentsItem,
  EvidenceLevel,
  ReferenceProps,
  TableOfContentsProps,
  ReadingProgressProps,
  SearchProps,
  EvidenceLevelProps
} from '../../types/markdown-viewer'; 