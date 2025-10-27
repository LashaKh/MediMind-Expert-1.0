import { logger } from '../lib/logger';

/**
 * Medical Safety Validation for Streaming Responses
 * Ensures critical medical information is not shown incompletely during streaming
 */

// Critical keywords that require complete sentences before display
const CRITICAL_KEYWORDS = [
  'emergency',
  'call 911',
  'immediate',
  'urgent',
  'life-threatening',
  'critical',
  'severe',
  'cardiac arrest',
  'myocardial infarction',
  'stroke',
  'anaphylaxis',
  'hemorrhage',
  'respiratory failure',
  'shock',
  'seizure'
];

// Medical dosage patterns (requires complete sentence)
const DOSAGE_PATTERNS = [
  /\d+\s*(mg|mcg|g|ml|units?)/i,
  /\d+\s*times?\s*(daily|per day|weekly)/i,
  /every\s+\d+\s*hours?/i
];

/**
 * Check if content contains critical medical keywords
 */
export function containsCriticalKeywords(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return CRITICAL_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

/**
 * Check if content contains medication dosage information
 */
export function containsDosageInfo(content: string): boolean {
  return DOSAGE_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Wait for a complete sentence before releasing critical content
 * Used to prevent showing half of "Call 911 if..." mid-stream
 */
export function bufferCriticalContent(content: string): {
  safeToShow: string;
  buffered: string;
} {
  // If no critical keywords, return all content
  if (!containsCriticalKeywords(content) && !containsDosageInfo(content)) {
    return {
      safeToShow: content,
      buffered: ''
    };
  }

  // Find complete sentences (ending with . ! ?)
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const completeSentences = sentences.join(' ');
  const remaining = content.slice(completeSentences.length).trim();

  logger.debug('Buffering critical medical content', {
    totalLength: content.length,
    safeLength: completeSentences.length,
    bufferedLength: remaining.length
  });

  return {
    safeToShow: completeSentences,
    buffered: remaining
  };
}

/**
 * Validate that dosage information is complete and safe to display
 */
export function validateDosageComplete(content: string): boolean {
  // Check for incomplete dosage patterns
  const incompleteDosagePatterns = [
    /\d+\s*$/i, // Number at end without unit
    /\d+\s*mg?$/i, // Incomplete mg
    /\d+\s*mcg?$/i, // Incomplete mcg
    /take\s*\d*$/i // "take" followed by incomplete number
  ];

  const hasIncompleteDosage = incompleteDosagePatterns.some(pattern =>
    pattern.test(content.trim())
  );

  return !hasIncompleteDosage;
}

/**
 * Check if content ends mid-word or mid-sentence (unsafe to display critical info)
 */
export function isContentComplete(content: string): boolean {
  const trimmed = content.trim();

  // Empty content is not complete
  if (!trimmed) return false;

  // Check if ends with sentence terminator
  const endsWithPunctuation = /[.!?]$/.test(trimmed);

  // Check if ends mid-word (no space after last word)
  const endsWithSpace = /\s$/.test(content);

  // Content is complete if it ends with punctuation or has trailing space
  return endsWithPunctuation || endsWithSpace;
}

/**
 * Medical content streaming filter
 * Applies safety rules to streaming content to prevent displaying
 * incomplete critical medical information
 */
export class MedicalStreamingFilter {
  private buffer: string = '';
  private releasedContent: string = '';

  /**
   * Add new token to the filter
   * Returns content that is safe to display
   */
  addToken(token: string): string {
    this.buffer += token;

    // Non-critical content: release immediately
    if (!containsCriticalKeywords(this.buffer) && !containsDosageInfo(this.buffer)) {
      const toRelease = this.buffer;
      this.buffer = '';
      this.releasedContent += toRelease;
      return toRelease;
    }

    // Critical content: wait for complete sentence
    const { safeToShow, buffered } = bufferCriticalContent(this.buffer);

    if (safeToShow) {
      this.buffer = buffered;
      this.releasedContent += safeToShow;
      return safeToShow;
    }

    // Nothing safe to release yet
    return '';
  }

  /**
   * Flush remaining buffer at end of stream
   * Returns any buffered content that hasn't been released
   */
  flush(): string {
    const remaining = this.buffer;
    this.buffer = '';
    this.releasedContent += remaining;
    return remaining;
  }

  /**
   * Get total content released so far
   */
  getReleasedContent(): string {
    return this.releasedContent;
  }

  /**
   * Reset the filter
   */
  reset() {
    this.buffer = '';
    this.releasedContent = '';
  }
}

/**
 * Validate streaming response safety
 * Checks for common issues that could make content unsafe
 */
export function validateStreamingSafety(content: string): {
  isSafe: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for incomplete dosage information
  if (containsDosageInfo(content) && !validateDosageComplete(content)) {
    issues.push('Incomplete dosage information detected');
  }

  // Check for critical keywords without proper context
  if (containsCriticalKeywords(content) && !isContentComplete(content)) {
    issues.push('Critical medical information may be incomplete');
  }

  // Check for very short responses with critical keywords
  if (containsCriticalKeywords(content) && content.length < 50) {
    issues.push('Critical medical advice too brief');
  }

  return {
    isSafe: issues.length === 0,
    issues
  };
}

/**
 * Log medical safety validation results
 */
export function logSafetyValidation(
  content: string,
  validation: { isSafe: boolean; issues: string[] }
) {
  if (!validation.isSafe) {
    logger.warn('Medical streaming safety issues detected', {
      contentLength: content.length,
      issues: validation.issues,
      hasCriticalKeywords: containsCriticalKeywords(content),
      hasDosageInfo: containsDosageInfo(content)
    });
  }
}
