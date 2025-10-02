/**
 * Markdown Formatter Utility
 * 
 * Formats markdown text into clean, readable JSX for medical reports.
 * Handles headings, lists, bold text, and paragraphs without showing raw markdown.
 * Also detects and highlights empty fields marked with 'Value_to_be_filled'.
 */

import React from 'react';

interface FormattedTextProps {
  children: React.ReactNode;
  className?: string;
}

const FormattedParagraph: React.FC<FormattedTextProps> = ({ children, className = '' }) => (
  <p
    className={`mb-3 text-slate-800 dark:text-slate-200 leading-relaxed ${className}`}
    style={{
      width: '100%',
      maxWidth: '100%',
      margin: '0 0 12px 0',
      padding: 0,
      boxSizing: 'border-box'
    }}
  >
    {children}
  </p>
);

const FormattedHeading: React.FC<FormattedTextProps & { level: number }> = ({ children, level, className = '' }) => {
  const baseClasses = 'font-bold text-slate-900 dark:text-slate-100 mb-2 mt-4';
  const style = {
    width: '100%',
    maxWidth: '100%',
    margin: '16px 0 8px 0',
    padding: 0,
    boxSizing: 'border-box' as const
  };

  switch (level) {
    case 1:
      return <h1 className={`text-xl ${baseClasses} ${className}`} style={style}>{children}</h1>;
    case 2:
      return <h2 className={`text-lg ${baseClasses} ${className}`} style={style}>{children}</h2>;
    case 3:
      return <h3 className={`text-base ${baseClasses} ${className}`} style={style}>{children}</h3>;
    default:
      return <h4 className={`text-sm ${baseClasses} ${className}`} style={style}>{children}</h4>;
  }
};

const FormattedList: React.FC<FormattedTextProps & { ordered?: boolean }> = ({ children, ordered = false, className = '' }) => {
  const Tag = ordered ? 'ol' : 'ul';
  const listClasses = ordered
    ? 'list-decimal list-inside mb-3 space-y-1'
    : 'list-disc list-inside mb-3 space-y-1';

  return (
    <Tag
      className={`${listClasses} text-slate-800 dark:text-slate-200 ${className}`}
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 0 12px 0',
        padding: 0,
        paddingLeft: '24px',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </Tag>
  );
};

const FormattedListItem: React.FC<FormattedTextProps> = ({ children, className = '' }) => (
  <li
    className={`text-slate-800 dark:text-slate-200 leading-relaxed ${className}`}
    style={{
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}
  >
    {children}
  </li>
);

/**
 * Component for highlighting empty fields that need to be filled
 */
const EmptyFieldIndicator: React.FC<{ fieldName?: string }> = ({ fieldName }) => (
  <span
    className="empty-field-indicator inline-flex items-center space-x-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-md border border-amber-300 dark:border-amber-600 font-semibold text-sm cursor-help transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 animate-pulse"
    data-field={fieldName}
    title={`This field needs to be filled: ${fieldName || 'Unknown field'}`}
  >
    <span className="empty-field-text">Value_to_be_filled</span>
    <span className="empty-field-icon text-amber-600 dark:text-amber-400" role="img" aria-label="Warning">
      ⚠️
    </span>
  </span>
);

/**
 * Parse markdown text into formatted React components
 */
export function formatMarkdown(text: string): JSX.Element {
  if (!text) return <></>;

  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      elements.push(
        <FormattedList key={`list-${key++}`} ordered={currentList.type === 'ol'}>
          {currentList.items.map((item, idx) => (
            <FormattedListItem key={`item-${idx}`}>
              {formatInlineText(item)}
            </FormattedListItem>
          ))}
        </FormattedList>
      );
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Handle headings
    if (trimmedLine.startsWith('#')) {
      flushList();
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const content = trimmedLine.replace(/^#+\s*/, '');
      elements.push(
        <FormattedHeading key={`heading-${key++}`} level={level}>
          {formatInlineText(content)}
        </FormattedHeading>
      );
      return;
    }

    // Handle unordered lists
    if (trimmedLine.match(/^[-*+]\s/)) {
      const content = trimmedLine.replace(/^[-*+]\s/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(content);
      return;
    }

    // Handle ordered lists
    if (trimmedLine.match(/^\d+\.\s/)) {
      const content = trimmedLine.replace(/^\d+\.\s/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(content);
      return;
    }

    // Handle regular paragraphs
    if (trimmedLine) {
      flushList();
      elements.push(
        <FormattedParagraph key={`para-${key++}`}>
          {formatInlineText(trimmedLine)}
        </FormattedParagraph>
      );
    }
  });

  // Flush any remaining list
  flushList();

  return (
    <div
      className="formatted-markdown"
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      {elements}
    </div>
  );
}

/**
 * Format inline text elements (bold, italic, empty fields, etc.)
 */
function formatInlineText(text: string): React.ReactNode {
  if (!text) return text;

  // First, handle empty fields before other formatting
  const emptyFieldRegex = /Value_to_be_filled/g;
  const hasEmptyFields = emptyFieldRegex.test(text);
  
  if (hasEmptyFields) {
    const parts = text.split(/(Value_to_be_filled)/g);
    const formattedParts: React.ReactNode[] = [];
    
    parts.forEach((part, index) => {
      if (part === 'Value_to_be_filled') {
        // Try to extract context from surrounding text to identify the field
        const beforeText = parts[index - 1] || '';
        const fieldMatch = beforeText.match(/([\w\s]+):\s*$/i);
        const fieldName = fieldMatch ? fieldMatch[1].trim() : 'Unknown field';
        
        formattedParts.push(
          <EmptyFieldIndicator key={`empty-field-${index}`} fieldName={fieldName} />
        );
      } else if (part) {
        // Apply other formatting to non-empty-field parts
        formattedParts.push(formatOtherInlineText(part, index));
      }
    });
    
    return formattedParts;
  }
  
  // If no empty fields, apply regular formatting
  return formatOtherInlineText(text, 0);
}

/**
 * Handle other inline formatting (bold, italic) excluding empty fields
 */
function formatOtherInlineText(text: string, keyOffset: number = 0): React.ReactNode {
  if (!text) return text;

  // Handle bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const formattedParts: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      formattedParts.push(
        <strong key={`bold-${keyOffset}-${index}`} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    } else {
      // Handle *italic* within each part
      const italicParts = part.split(/(\*[^*]+\*)/g);
      italicParts.forEach((subpart, subindex) => {
        if (subpart.startsWith('*') && subpart.endsWith('*') && !subpart.startsWith('**')) {
          formattedParts.push(
            <em key={`italic-${keyOffset}-${index}-${subindex}`} className="italic">
              {subpart.slice(1, -1)}
            </em>
          );
        } else if (subpart) {
          formattedParts.push(subpart);
        }
      });
    }
  });
  
  return formattedParts;
}

/**
 * Extract clean text from markdown (for copying)
 */
export function extractCleanText(markdownText: string): string {
  if (!markdownText) return '';

  return markdownText
    // Remove markdown headings
    .replace(/^#+\s*/gm, '')
    // Remove markdown bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Clean up list markers
    .replace(/^[-*+]\s/gm, '• ')
    .replace(/^\d+\.\s/gm, '')
    // Keep Value_to_be_filled as-is for identification
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdownFormatting(text: string): boolean {
  if (!text) return false;
  
  const markdownPatterns = [
    /^#+\s/m,           // Headings
    /\*\*[^*]+\*\*/,    // Bold
    /\*[^*]+\*/,        // Italic
    /^[-*+]\s/m,        // Unordered lists
    /^\d+\.\s/m         // Ordered lists
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Count empty fields in text
 */
export function countEmptyFields(text: string): number {
  if (!text) return 0;
  const matches = text.match(/Value_to_be_filled/g);
  return matches ? matches.length : 0;
}

/**
 * Check if text contains empty fields
 */
export function hasEmptyFields(text: string): boolean {
  return countEmptyFields(text) > 0;
}

/**
 * Extract field names that are empty
 */
export function extractEmptyFieldNames(text: string): string[] {
  if (!text) return [];
  
  const fieldNames: string[] = [];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.includes('Value_to_be_filled')) {
      // Try to extract field name from patterns like "Field Name: Value_to_be_filled"
      const fieldMatch = line.match(/([\w\s]+):\s*Value_to_be_filled/i);
      if (fieldMatch) {
        fieldNames.push(fieldMatch[1].trim());
      } else {
        // Look for patterns where the field name is before the value
        const contextMatch = line.match(/([\w\s]+).*Value_to_be_filled/i);
        if (contextMatch) {
          fieldNames.push(contextMatch[1].trim());
        } else {
          fieldNames.push('Unknown field');
        }
      }
    }
  });
  
  return fieldNames;
}