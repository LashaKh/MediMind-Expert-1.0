import { useMemo } from 'react';
import { DocumentGroup, SearchFilters, SortBy, SortOrder } from '../types';

interface UseDocumentFilteringProps {
  documentGroups: DocumentGroup[];
  filters: SearchFilters;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export const useDocumentFiltering = ({
  documentGroups,
  filters,
  sortBy,
  sortOrder
}: UseDocumentFilteringProps) => {
  // Filter and sort document groups
  const processedDocumentGroups = useMemo(() => {
    let filteredGroups = [...documentGroups];

    // Apply date range filters
    filteredGroups = filteredGroups.filter(group => {
      // Check if any document in the group matches date range filters
      const matchesDateRange = group.documents.some(doc => {
        let matches = true;

        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          matches = matches && new Date(doc.created_at) >= fromDate;
        }

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          matches = matches && new Date(doc.created_at) <= toDate;
        }

        return matches;
      });

      return matchesDateRange;
    });

    // Sort groups
    filteredGroups.sort((a, b) => {
      let comparison = 0;

      // For sorting, use the primary document (first for chunked, only for regular)
      const aPrimary = a.documents[0];
      const bPrimary = b.documents[0];

      switch (sortBy) {
        case 'name':
          comparison = a.baseTitle.localeCompare(b.baseTitle);
          break;
        case 'date':
          const aLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
          const bLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
          comparison = aLatest - bLatest;
          break;
        case 'size':
          const aTotalSize = a.documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
          const bTotalSize = b.documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
          comparison = aTotalSize - bTotalSize;
          break;
        case 'type':
          comparison = aPrimary.file_type.localeCompare(bPrimary.file_type);
          break;
        case 'category':
          comparison = aPrimary.category.localeCompare(bPrimary.category);
          break;
        default:
          const aDefaultLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
          const bDefaultLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
          comparison = aDefaultLatest - bDefaultLatest;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredGroups;
  }, [documentGroups, filters, sortBy, sortOrder]);

  // Get flattened documents for stats
  const processedDocuments = useMemo(() => {
    return processedDocumentGroups.flatMap(group => group.documents);
  }, [processedDocumentGroups]);

  return {
    processedDocumentGroups,
    processedDocuments
  };
};
