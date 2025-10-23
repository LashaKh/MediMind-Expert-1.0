/**
 * Document Grouping Utilities
 *
 * Handles grouping of chunked documents and similarity calculations.
 */

import { DocumentWithMetadata } from '../../../lib/api/knowledgeBase';
import { extractCleanBaseTitle } from './documentHelpers';

export interface DocumentGroup {
  id: string;
  isChunked: boolean;
  baseTitle: string;
  documents: DocumentWithMetadata[];
  totalParts?: number;
  isExpanded?: boolean;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1,     // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Calculate string similarity (0 to 1, where 1 is identical)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Find the best matching group key for a document
 */
export const findDocumentGroupKey = (
  doc: DocumentWithMetadata,
  existingGroupKeys: string[]
): string | null => {
  const cleanTitle = extractCleanBaseTitle(doc.title);
  const SIMILARITY_THRESHOLD = 0.85; // 85% similarity required

  let bestMatch: string | null = null;
  let bestSimilarity = 0;

  // Check against all existing group keys
  for (const groupKey of existingGroupKeys) {
    const similarity = calculateSimilarity(cleanTitle, groupKey);

    if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
      bestSimilarity = similarity;
      bestMatch = groupKey;
    }
  }

  return bestMatch;
};

/**
 * Enhanced robust grouping algorithm for documents
 * Groups chunked documents together while keeping regular documents separate
 */
export const groupDocuments = (documents: DocumentWithMetadata[]): DocumentGroup[] => {
  const chunkedGroups = new Map<string, DocumentWithMetadata[]>();
  const regularDocuments: DocumentWithMetadata[] = [];

  // First pass: separate chunked and regular documents
  documents.forEach(doc => {
    const isChunked = doc.tags?.includes('chunked-document');
    if (!isChunked) {
      regularDocuments.push(doc);
      return;
    }

    // For chunked documents, use multiple strategies to find the group key
    let groupKey = findDocumentGroupKey(doc, Array.from(chunkedGroups.keys()));

    if (!groupKey) {
      // Create new group key using the cleanest possible base title
      groupKey = extractCleanBaseTitle(doc.title);
    }

    if (!chunkedGroups.has(groupKey)) {
      chunkedGroups.set(groupKey, []);
    }
    chunkedGroups.get(groupKey)!.push(doc);
  });

  // Second pass: Group documents with similar upload times that might belong together
  // This handles cases where titles are too different due to truncation
  const groupedChunkedDocs = new Set<string>();
  chunkedGroups.forEach((docs) => {
    docs.forEach(doc => groupedChunkedDocs.add(doc.id));
  });

  // Find ungrouped chunked documents and try to group them by upload time + partial title similarity
  documents.forEach(doc => {
    const isChunked = doc.tags?.includes('chunked-document');
    if (isChunked && !groupedChunkedDocs.has(doc.id)) {
      // Look for documents uploaded within 10 minutes of each other with some title similarity
      const uploadTime = new Date(doc.created_at).getTime();
      const TIME_WINDOW = 10 * 60 * 1000; // 10 minutes

      let bestGroupKey: string | null = null;
      let bestSimilarity = 0;

      chunkedGroups.forEach((groupDocs, groupKey) => {
        const groupUploadTimes = groupDocs.map(d => new Date(d.created_at).getTime());
        const avgGroupUploadTime = groupUploadTimes.reduce((a, b) => a + b, 0) / groupUploadTimes.length;

        if (Math.abs(uploadTime - avgGroupUploadTime) <= TIME_WINDOW) {
          const cleanTitle = extractCleanBaseTitle(doc.title);
          const similarity = calculateSimilarity(cleanTitle, groupKey);

          if (similarity > bestSimilarity && similarity >= 0.6) { // Lower threshold for time-based grouping
            bestSimilarity = similarity;
            bestGroupKey = groupKey;
          }
        }
      });

      if (bestGroupKey) {
        chunkedGroups.get(bestGroupKey)!.push(doc);
        groupedChunkedDocs.add(doc.id);
      } else {
        // Create a new group for this orphaned document
        const newGroupKey = extractCleanBaseTitle(doc.title);
        chunkedGroups.set(newGroupKey, [doc]);
      }
    }
  });

  const groups: DocumentGroup[] = [];

  // Add regular documents as individual groups
  regularDocuments.forEach(doc => {
    groups.push({
      id: doc.id,
      isChunked: false,
      baseTitle: doc.title,
      documents: [doc]
    });
  });

  // Add chunked document groups
  chunkedGroups.forEach((chunks, baseTitle) => {
    // Sort chunks by part number (handle both formats)
    chunks.sort((a, b) => {
      // Try binary chunk format first: "Part X/Y"
      let aPartMatch = a.title.match(/Part (\d+)\/\d+$/);
      let bPartMatch = b.title.match(/Part (\d+)\/\d+$/);

      // If not found, try PDF page chunk format: "Pages X-Y (Z/Total)"
      if (!aPartMatch) {
        aPartMatch = a.title.match(/Pages \d+-\d+ \((\d+)\/\d+\)$/);
      }
      if (!bPartMatch) {
        bPartMatch = b.title.match(/Pages \d+-\d+ \((\d+)\/\d+\)$/);
      }

      const aPart = aPartMatch ? parseInt(aPartMatch[1]) : 0;
      const bPart = bPartMatch ? parseInt(bPartMatch[1]) : 0;
      return aPart - bPart;
    });

    // Extract total parts from either format
    let totalPartsMatch = chunks[0]?.title.match(/Part \d+\/(\d+)$/);
    if (!totalPartsMatch) {
      totalPartsMatch = chunks[0]?.title.match(/Pages \d+-\d+ \(\d+\/(\d+)\)$/);
    }
    const totalParts = totalPartsMatch ? parseInt(totalPartsMatch[1]) : chunks.length;

    groups.push({
      id: `chunked-${baseTitle}`,
      isChunked: true,
      baseTitle,
      documents: chunks,
      totalParts,
      isExpanded: false
    });
  });

  // Sort groups by latest document date
  const sortedGroups = groups.sort((a, b) => {
    const aLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
    const bLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
    return bLatest - aLatest;
  });

  return sortedGroups;
};
