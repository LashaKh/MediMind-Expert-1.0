// Transcript utility functions for Georgian MediScribe

/**
 * Formats time from milliseconds to MM:SS format
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "3:45")
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Copies text to clipboard
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  if (text && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};

/**
 * Downloads transcript as a text file
 * @param text - Transcript text to download
 * @param filename - Optional filename (will generate timestamp-based name if not provided)
 */
export const downloadTranscription = (text: string, filename?: string): void => {
  if (!text) return;
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `georgian-transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Formats processing time from milliseconds to readable format
 * @param ms - Processing time in milliseconds
 * @returns Formatted processing time (e.g., "2.54s")
 */
export const formatProcessingTime = (ms: number): string => {
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Validates if text contains Georgian characters
 * @param text - Text to validate
 * @returns True if text contains Georgian characters
 */
export const hasGeorgianText = (text: string): boolean => {
  // Georgian Unicode range: U+10A0-U+10FF (Georgian), U+2D00-U+2D2F (Georgian Supplement)
  const georgianRegex = /[\u10A0-\u10FF\u2D00-\u2D2F]/;
  return georgianRegex.test(text);
};

/**
 * Estimates word count in Georgian text
 * Georgian words are separated by spaces and punctuation
 * @param text - Text to count words in
 * @returns Estimated word count
 */
export const getGeorgianWordCount = (text: string): number => {
  if (!text?.trim()) return 0;
  
  // Remove punctuation and split by whitespace
  const words = text
    .replace(/[.,!?;:—–-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
    
  return words.length;
};

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};