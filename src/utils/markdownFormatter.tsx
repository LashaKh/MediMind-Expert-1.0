/**
 * Markdown Formatter Utility
 * 
 * Formats markdown text into clean, readable JSX for medical reports.
 * Handles headings, lists, bold text, and paragraphs without showing raw markdown.
 */

import React from 'react';

interface FormattedTextProps {
  children: React.ReactNode;
  className?: string;
}

const FormattedParagraph: React.FC<FormattedTextProps> = ({ children, className = '' }) => (
  <p className={`mb-3 text-slate-800 dark:text-slate-200 leading-relaxed ${className}`}>
    {children}
  </p>
);

const FormattedHeading: React.FC<FormattedTextProps & { level: number }> = ({ children, level, className = '' }) => {
  const baseClasses = 'font-bold text-slate-900 dark:text-slate-100 mb-2 mt-4';
  
  switch (level) {
    case 1:
      return <h1 className={`text-xl ${baseClasses} ${className}`}>{children}</h1>;
    case 2:
      return <h2 className={`text-lg ${baseClasses} ${className}`}>{children}</h2>;
    case 3:
      return <h3 className={`text-base ${baseClasses} ${className}`}>{children}</h3>;
    default:
      return <h4 className={`text-sm ${baseClasses} ${className}`}>{children}</h4>;
  }
};

const FormattedList: React.FC<FormattedTextProps & { ordered?: boolean }> = ({ children, ordered = false, className = '' }) => {
  const Tag = ordered ? 'ol' : 'ul';
  const listClasses = ordered 
    ? 'list-decimal list-inside mb-3 space-y-1' 
    : 'list-disc list-inside mb-3 space-y-1';
    
  return (
    <Tag className={`${listClasses} text-slate-800 dark:text-slate-200 ${className}`}>
      {children}
    </Tag>
  );
};

const FormattedListItem: React.FC<FormattedTextProps> = ({ children, className = '' }) => (
  <li className={`text-slate-800 dark:text-slate-200 leading-relaxed ${className}`}>
    {children}
  </li>
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

  return <div className="formatted-markdown">{elements}</div>;
}

/**
 * Format inline text elements (bold, italic, etc.)
 */
function formatInlineText(text: string): React.ReactNode {
  if (!text) return text;

  // Handle bold text
  let formatted: React.ReactNode = text;
  
  // Replace **bold** with <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const formattedParts: React.ReactNode[] = [];
  
  parts.forEach((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      formattedParts.push(
        <strong key={`bold-${index}`} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    } else {
      // Handle *italic* within each part
      const italicParts = part.split(/(\*[^*]+\*)/g);
      italicParts.forEach((subpart, subindex) => {
        if (subpart.startsWith('*') && subpart.endsWith('*') && !subpart.startsWith('**')) {
          formattedParts.push(
            <em key={`italic-${index}-${subindex}`} className="italic">
              {subpart.slice(1, -1)}
            </em>
          );
        } else if (subpart) {
          formattedParts.push(subpart);
        }
      });
    }
  });
  
  formatted = formattedParts;

  return formatted;
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