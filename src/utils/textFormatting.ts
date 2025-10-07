/**
 * Text Formatting Utilities for Georgian and English Medical Transcription
 */

/**
 * Format Georgian and mixed language text for proper display
 * @param text - The raw text to format
 * @returns Properly formatted text with correct spacing and punctuation
 */
export function formatTranscriptText(text: string): string {
  if (!text) return '';

  // Remove excessive whitespace and normalize spaces
  let formatted = text.replace(/\s+/g, ' ').trim();

  // Add proper spacing after Georgian sentence-ending punctuation
  // Georgian uses period (.) similar to English
  formatted = formatted.replace(/([.!?។])([^\s])/g, '$1 $2');

  // Ensure sentences start with capital letters (for mixed Georgian/English text)
  formatted = formatted.replace(/([.!?។])\s+([a-z])/g, (match, punct, letter) =>
    `${punct} ${letter.toUpperCase()}`
  );

  // Remove space before punctuation if accidentally added
  formatted = formatted.replace(/\s+([.!?,:;។])/g, '$1');

  // Ensure proper spacing after commas and semicolons
  formatted = formatted.replace(/([,:;])([^\s])/g, '$1 $2');

  return formatted;
}

/**
 * Detect if text ends with a complete sentence
 * @param text - Text to check
 * @returns True if text ends with sentence-ending punctuation
 */
export function endsWithSentence(text: string): boolean {
  if (!text) return false;

  const trimmed = text.trim();
  // Check for Georgian and standard sentence-ending punctuation
  return /[.!?។។៕។၊။।॥।।৷।।।።።።፨።።።።።។]$/.test(trimmed);
}

/**
 * Add paragraph breaks at natural boundaries
 * @param text - Text to format with paragraphs
 * @param minSentencesPerParagraph - Minimum sentences before breaking
 * @returns Text with paragraph breaks
 */
export function addParagraphBreaks(text: string, minSentencesPerParagraph: number = 3): string {
  if (!text) return '';

  // Split by sentence-ending punctuation while keeping the punctuation
  const sentences = text.match(/[^.!?។]+[.!?។]+/g) || [text];

  if (sentences.length <= minSentencesPerParagraph) {
    return text;
  }

  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  sentences.forEach((sentence, index) => {
    currentParagraph.push(sentence.trim());

    // Create paragraph break after certain number of sentences
    if (currentParagraph.length >= minSentencesPerParagraph &&
        index < sentences.length - 1) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  });

  // Add remaining sentences
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }

  return paragraphs.join('\n\n');
}

/**
 * Clean up transcription artifacts and normalize text
 * @param text - Raw transcription text
 * @returns Cleaned text
 */
export function cleanTranscriptionText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Remove multiple consecutive periods (transcription artifacts)
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // Remove standalone punctuation marks
  cleaned = cleaned.replace(/\s+([.!?,:;។])\s+([.!?,:;។])/g, ' $1');

  // Fix common transcription errors with spacing
  cleaned = cleaned.replace(/\s*,\s*/g, ', ');
  cleaned = cleaned.replace(/\s*\.\s*/g, '. ');
  cleaned = cleaned.replace(/\s*!\s*/g, '! ');
  cleaned = cleaned.replace(/\s*\?\s*/g, '? ');

  // Apply general formatting
  return formatTranscriptText(cleaned);
}

/**
 * Format text for display in textarea with proper line breaks
 * @param text - Text to format for display
 * @returns Text formatted for textarea display
 */
export function formatForTextareaDisplay(text: string): string {
  if (!text) return '';

  // First clean and format the text
  let formatted = cleanTranscriptionText(text);

  // Don't add automatic paragraph breaks - let the text flow naturally
  // The user can manually add breaks if needed

  return formatted;
}