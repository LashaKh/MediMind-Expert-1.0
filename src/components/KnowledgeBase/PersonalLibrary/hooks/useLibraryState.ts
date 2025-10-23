import { useState, useMemo } from 'react';
import { PersonalLibraryState, ViewMode, SortBy, SortOrder, DisplayDensity, DocumentStats } from '../types';

const initialState: PersonalLibraryState = {
  documents: [],
  documentGroups: [],
  expandedGroups: new Set<string>(),
  selectedDocuments: new Set<string>(),
  viewMode: 'grid' as ViewMode,
  sortBy: 'date' as SortBy,
  sortOrder: 'desc' as SortOrder,
  displayDensity: 'comfortable' as DisplayDensity,
  showMetadata: true,
  showPreview: false
};

export const useLibraryState = () => {
  const [state, setState] = useState<PersonalLibraryState>(initialState);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setState(prev => {
      const newExpandedGroups = new Set(prev.expandedGroups);
      if (newExpandedGroups.has(groupId)) {
        newExpandedGroups.delete(groupId);
      } else {
        newExpandedGroups.add(groupId);
      }
      return { ...prev, expandedGroups: newExpandedGroups };
    });
  };

  // Toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setState(prev => {
      const newSelectedDocuments = new Set(prev.selectedDocuments);
      if (newSelectedDocuments.has(documentId)) {
        newSelectedDocuments.delete(documentId);
      } else {
        newSelectedDocuments.add(documentId);
      }
      return { ...prev, selectedDocuments: newSelectedDocuments };
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setState(prev => ({ ...prev, selectedDocuments: new Set() }));
  };

  // Select all documents
  const selectAllDocuments = () => {
    setState(prev => {
      const allDocumentIds = new Set(
        prev.documentGroups.flatMap(group => group.documents.map(doc => doc.id))
      );
      return { ...prev, selectedDocuments: allDocumentIds };
    });
  };

  // Update view mode
  const setViewMode = (viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
  };

  // Update sort settings
  const setSortBy = (sortBy: SortBy) => {
    setState(prev => ({ ...prev, sortBy }));
  };

  const setSortOrder = (sortOrder: SortOrder) => {
    setState(prev => ({ ...prev, sortOrder }));
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Update display density
  const setDisplayDensity = (displayDensity: DisplayDensity) => {
    setState(prev => ({ ...prev, displayDensity }));
  };

  // Toggle metadata display
  const toggleMetadata = () => {
    setState(prev => ({ ...prev, showMetadata: !prev.showMetadata }));
  };

  // Toggle preview display
  const togglePreview = () => {
    setState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  };

  // Calculate document statistics
  const documentStats: DocumentStats = useMemo(() => {
    const allDocuments = state.documentGroups.flatMap(group => group.documents);

    const stats: DocumentStats = {
      total: allDocuments.length,
      completed: 0,
      pending: 0,
      failed: 0,
      totalSize: 0,
      byCategory: {},
      byType: {}
    };

    allDocuments.forEach(doc => {
      // Count by status
      if (doc.upload_status === 'completed') stats.completed++;
      else if (doc.upload_status === 'failed') stats.failed++;
      else stats.pending++;

      // Sum total size
      stats.totalSize += doc.file_size || 0;

      // Count by category
      const category = doc.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by type
      const type = doc.file_type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }, [state.documentGroups]);

  // Get grid classes based on display density
  const getGridClasses = (): string => {
    switch (state.displayDensity) {
      case 'compact':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3';
      case 'comfortable':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'spacious':
        return 'grid-cols-1 md:grid-cols-2 gap-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  return {
    state,
    setState,
    toggleGroup,
    toggleDocumentSelection,
    clearSelections,
    selectAllDocuments,
    setViewMode,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    setDisplayDensity,
    toggleMetadata,
    togglePreview,
    documentStats,
    getGridClasses
  };
};
