// Medical Text Parser Utility
// Extract and manipulate Georgian medical text sections
// Unicode-aware parsing for medical documentation

/**
 * Parse medical history section from Georgian ER consultation report
 * Extracts text between "ანამნეზი და ჩივილები" and "ობიექტური სტატუსი"
 *
 * @param text - Full ER consultation report text
 * @returns Extracted medical history text, or null if not found
 */
export function parseGeorgianMedicalHistory(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Define patterns to find anamnesis section (with or without markdown)
  const startPatterns = [
    /\*\*ანამნეზი და ჩივილები[:\*]*/i,
    /ანამნეზი და ჩივილები:/i,
    /\*\*ანამნეზი[:\*]*/i,
    /ანამნეზი:/i,
    /\*\*ჩივილები[:\*]*/i,
    /ჩივილები:/i
  ];

  const endPatterns = [
    /\*\*ობიექტური სტატუსი[:\*]*/i,
    /ობიექტური სტატუსი:/i,
    /\*\*ობიექტური[:\*]*/i,
    /ობიექტური:/i,
    /\*\*სტატუსი[:\*]*/i,
    /სტატუსი:/i
  ];

  // Try to find section with primary markers first
  let startIndex = -1;
  let endIndex = -1;
  let usedStartMarker = '';
  let usedEndMarker = '';

  // Find start position
  for (const pattern of startPatterns) {
    const match = text.match(pattern);

    if (match && match.index !== undefined) {
      startIndex = match.index + match[0].length;
      usedStartMarker = match[0];
      break;
    }
  }

  // Find end position
  for (const pattern of endPatterns) {
    // Search from where we found the start marker
    const searchText = startIndex > -1 ? text.substring(startIndex) : text;
    const match = searchText.match(pattern);

    if (match && match.index !== undefined) {
      endIndex = startIndex > -1 ? startIndex + match.index : match.index;
      usedEndMarker = match[0];
      break;
    }
  }

  // If we couldn't find both markers, return null
  if (startIndex === -1 || endIndex === -1) {
    console.warn('Medical history section markers not found', {
      hasStartMarker: startIndex > -1,
      hasEndMarker: endIndex > -1
    });
    return null;
  }

  // Extract the text between markers
  let extractedText = text.substring(startIndex, endIndex).trim();

  // Clean up the extracted text (but preserve structure)
  extractedText = cleanMedicalText(extractedText);

  console.log('✅ Successfully parsed medical history section:', {
    startMarker: usedStartMarker,
    endMarker: usedEndMarker,
    textLength: extractedText.length,
    preview: extractedText.substring(0, 100)
  });

  return extractedText;
}

/**
 * Clean and format medical text
 * Removes excessive whitespace and normalizes formatting
 *
 * @param text - Raw medical text
 * @returns Cleaned text
 */
function cleanMedicalText(text: string): string {
  if (!text) return '';

  return text
    // Remove leading/trailing whitespace
    .trim()
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Normalize multiple newlines to double newline (paragraph breaks)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    // Remove spaces before punctuation
    .replace(/\s+([.,;:])/g, '$1')
    // Ensure space after punctuation
    .replace(/([.,;:])(\S)/g, '$1 $2');
}

/**
 * Insert brief anamnesis section into Form 100 before disease progression section
 * Finds "ავადმყოფობის მიმდინარეობა" and inserts medical history before it
 *
 * @param form100Text - Generated Form 100 text from Flowise
 * @param briefAnamnesis - Extracted medical history text
 * @returns Enhanced Form 100 with medical history inserted
 */
export function insertBriefAnamnesisIntoForm100(
  form100Text: string,
  briefAnamnesis: string | null
): string {
  // If no brief anamnesis or invalid input, return original
  if (!briefAnamnesis || !form100Text) {
    return form100Text;
  }

  // Define patterns to find disease progression section with markdown formatting
  const diseaseProgressionPatterns = [
    /\*\*ავადმყოფობის მიმდინარეობა\*\*/i,
    /\*\*მიმდინარეობა\*\*/i,
    /\*\*დაავადების მიმდინარეობა\*\*/i,
    /ავადმყოფობის მიმდინარეობა:/i,
    /მიმდინარეობა:/i
  ];

  // Try to find the disease progression section
  let insertionIndex = -1;
  let usedMarker = '';

  for (const pattern of diseaseProgressionPatterns) {
    const match = form100Text.match(pattern);

    if (match && match.index !== undefined) {
      insertionIndex = match.index;
      usedMarker = match[0];
      break;
    }
  }

  // If we couldn't find the marker, append at the end
  if (insertionIndex === -1) {
    console.warn('Disease progression marker not found in Form 100, appending at end');
    return `${form100Text}\n\n**მოკლე ანამნეზი:**\n${briefAnamnesis}`;
  }

  // Build the brief anamnesis section with proper formatting
  // Keep the extracted medical history as-is (preserve any markdown formatting)
  const anamnesisSection = `**მოკლე ანამნეზი:**\n${briefAnamnesis}\n\n`;

  // Insert before the disease progression section
  const beforeSection = form100Text.substring(0, insertionIndex);
  const afterSection = form100Text.substring(insertionIndex);

  const enhancedForm100 = `${beforeSection}${anamnesisSection}${afterSection}`;

  console.log('✅ Successfully inserted brief anamnesis into Form 100:', {
    insertionMarker: usedMarker,
    insertionPosition: insertionIndex,
    anamnesisLength: briefAnamnesis.length,
    finalLength: enhancedForm100.length
  });

  return enhancedForm100;
}

/**
 * Extract patient demographics from medical text
 * Helper function for additional parsing needs
 *
 * @param text - Medical report text
 * @returns Extracted demographics or null
 */
export function extractPatientDemographics(text: string): {
  age?: number;
  gender?: string;
} | null {
  if (!text) return null;

  const demographics: { age?: number; gender?: string } = {};

  // Try to extract age
  const agePatterns = [
    /(\d+)\s*წლის/i,  // "45 წლის"
    /ასაკი[:\s]*(\d+)/i,  // "ასაკი: 45"
    /age[:\s]*(\d+)/i  // "age: 45"
  ];

  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      demographics.age = parseInt(match[1], 10);
      break;
    }
  }

  // Try to extract gender
  const genderPatterns = [
    /(მამრობითი|მამაკაცი)/i,  // Male
    /(მდედრობითი|ქალი)/i  // Female
  ];

  for (const pattern of genderPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      demographics.gender = match[1].toLowerCase().includes('მამ') ? 'Male' : 'Female';
      break;
    }
  }

  return Object.keys(demographics).length > 0 ? demographics : null;
}

/**
 * Validate Georgian medical text structure
 * Checks if text contains expected medical report sections
 *
 * @param text - Medical report text
 * @returns Boolean indicating if text has valid structure
 */
export function validateMedicalReportStructure(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for at least one key section marker
  const keyMarkers = [
    'ანამნეზი',
    'ჩივილები',
    'დიაგნოზი',
    'სტატუსი',
    'მკურნალობა'
  ];

  return keyMarkers.some(marker => {
    const regex = new RegExp(marker, 'i');
    return regex.test(text);
  });
}
