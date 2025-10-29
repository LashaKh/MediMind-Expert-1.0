/**
 * Inline Edit Replacer Utility
 *
 * Handles replacing "Value_to_be_filled" placeholders with user-provided values
 * while maintaining proper field tracking and order.
 */

/**
 * Replace a specific occurrence of "Value_to_be_filled" in content
 * Uses field ID (0-indexed) to replace the correct occurrence
 *
 * @param content - The markdown content containing Value_to_be_filled placeholders
 * @param fieldId - The field identifier (e.g., "field-0", "field-1")
 * @param newValue - The value to replace the placeholder with
 * @returns Updated content with the placeholder replaced
 */
export function replaceFieldValue(
  content: string,
  fieldId: string,
  newValue: string
): string {
  if (!content || !fieldId || !newValue) {
    return content;
  }

  // Extract the field index from fieldId (e.g., "field-3" → 3)
  const fieldIndex = parseInt(fieldId.split('-')[1], 10);

  if (isNaN(fieldIndex)) {
    return content;
  }

  // Split content by "Value_to_be_filled" to get all occurrences
  const parts = content.split('Value_to_be_filled');

  // Check if the field index is valid
  if (fieldIndex >= parts.length - 1) {
    return content;
  }

  // Replace the specific occurrence
  // Join all parts before the target occurrence, add the new value, then join the remaining parts
  const before = parts.slice(0, fieldIndex + 1).join('Value_to_be_filled');
  const after = parts.slice(fieldIndex + 1).join('Value_to_be_filled');

  return before + newValue + after;
}

/**
 * Apply multiple inline edits to content
 * IMPROVED: Replaces all fields in one pass to avoid rejoining issues
 *
 * @param content - The original markdown content
 * @param edits - Map of field IDs to their new values
 * @returns Content with all edits applied
 */
export function applyMultipleEdits(
  content: string,
  edits: Record<string, string>
): string {
  if (!content || !edits || Object.keys(edits).length === 0) {
    return content;
  }

  // Split content by "Value_to_be_filled" to get all parts
  const parts = content.split('Value_to_be_filled');

  // If no placeholders found, return original
  if (parts.length <= 1) {
    return content;
  }

  // Convert edit keys to indices
  const editsByIndex: Record<number, string> = {};
  Object.entries(edits).forEach(([fieldId, value]) => {
    const index = parseInt(fieldId.split('-')[1], 10);
    if (!isNaN(index)) {
      editsByIndex[index] = value;
    }
  });

  // Rebuild content by inserting either edit values or placeholders
  let result = parts[0]; // Start with first part

  for (let i = 0; i < parts.length - 1; i++) {
    // Insert either the edit value or keep the placeholder
    if (editsByIndex[i] !== undefined) {
      result += editsByIndex[i]; // Use edited value
    } else {
      result += 'Value_to_be_filled'; // Keep placeholder
    }

    // Add the next part
    result += parts[i + 1];
  }

  return result;
}

/**
 * Count remaining "Value_to_be_filled" placeholders in content
 *
 * @param content - The markdown content
 * @returns Number of unfilled placeholders
 */
export function countUnfilledFields(content: string): number {
  if (!content) {
    return 0;
  }

  const matches = content.match(/Value_to_be_filled/g);
  return matches ? matches.length : 0;
}

/**
 * Check if all fields are filled in the content
 *
 * @param content - The markdown content
 * @returns True if no "Value_to_be_filled" placeholders remain
 */
export function areAllFieldsFilled(content: string): boolean {
  return countUnfilledFields(content) === 0;
}
