import React from 'react';

/**
 * Parse a reference line and extract links with their metadata
 */
export interface ParsedReferencePart {
  type: 'text' | 'bold' | 'link';
  content: string; // The actual text content
  href?: string; // For links
}

export interface ParsedReference {
  number?: string;
  parts: ParsedReferencePart[];
}

/**
 * Parse a reference line to extract number, text, and links
 * @param line - The reference line to parse
 * @returns Parsed reference data
 */
export const parseReferenceLine = (line: string): ParsedReference => {
  const parts: ParsedReferencePart[] = [];
  let currentText = line;
  let referenceNumber: string | undefined;

  // 1. Extract reference number if present
  const numberMatch = currentText.match(/^(\d+)\.\s*/);
  if (numberMatch) {
    referenceNumber = numberMatch[1];
    currentText = currentText.substring(numberMatch[0].length);
  }

  // 2. Parse bold and link elements
  const regex = /(\*{2}[^\*]+\*{2})|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(currentText)) !== null) {
    // Add preceding text as 'text' part
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: currentText.substring(lastIndex, match.index) });
    }

    if (match[1]) { // Bold match
      parts.push({ type: 'bold', content: match[1].substring(2, match[1].length - 2) });
    } else if (match[2] && match[3]) { // Link match
      parts.push({ type: 'link', content: match[2], href: match[3] });
    }
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text as 'text' part
  if (lastIndex < currentText.length) {
    parts.push({ type: 'text', content: currentText.substring(lastIndex) });
  }

  return {
    number: referenceNumber,
    parts,
  };
};

/**
 * Check if a reference line is a numbered reference
 * @param line - The line to check
 * @returns True if the line is a numbered reference
 */
export const isNumberedReference = (line: string): boolean => {
  return /^\d+\.\s+/.test(line);
};

/**
 * Generate a unique key for a reference item
 * @param index - The line index
 * @param suffix - Optional suffix for uniqueness
 * @returns Unique key string
 */
export const generateReferenceKey = (index: number, suffix?: string): string => {
  return suffix ? `ref-${index}-${suffix}` : `ref-${index}`;
};