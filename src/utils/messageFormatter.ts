export const sanitizeHTML = (content: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const formatAIResponse = (content: string): string => {
  // Don't format content here - let React Markdown handle it
  // Only handle source references
  let formatted = content;
  
  // Enhanced source reference handling with interactive citations
  formatted = formatted.replace(/\[(\d+)\]/g, (match, num) => {
    return `<span class="inline-source-ref cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded transition-colors" data-source-number="${num}" title="Click to highlight source ${num}">[${num}]</span>`;
  });
  
  return formatted;
};

export const extractSourceReferences = (content: string): { content: string; references: string[] } => {
  // Extract source references from content like [1], [2], etc.
  const references: string[] = [];
  const cleanContent = content.replace(/\[(\d+)\]/g, (match, num) => {
    references.push(num);
    return `<sup class="text-blue-600 dark:text-blue-400">[${num}]</sup>`;
  });
  
  return {
    content: cleanContent,
    references
  };
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const highlightSearchTerms = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}; 