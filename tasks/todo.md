# Task: Format "As per" Text in Markdown Display

## Overview
We need to enhance the markdown display to handle special formatting for "As per" text patterns. When text appears as "As per ", it should be formatted in italics while leaving the rest of the sentence in regular text.

## Current State Analysis
From the codebase review, I found:
1. The `EnhancedMarkdownRenderer.tsx` already has sophisticated pattern processing for guidelines
2. The markdown-utils.ts has pattern detection for evidence levels and guidelines
3. There are already 7 different regex patterns for detecting "As per" guidelines
4. The GuidelineBox component handles formatted display of guidelines

## Implementation Plan

### 1. [ ] Analyze Current "As per" Pattern Processing
- Location: `src/components/Diseases/MarkdownContent/EnhancedMarkdownRenderer.tsx`
- Current patterns found (lines 583-605):
  - Pattern 1: Multi-point guidelines with bullet points
  - Pattern 2: Single-line guidelines with (A) format
  - Pattern 3: Single-line guidelines with Level A format
  - Pattern 4: Multi-point guidelines without dashes
  - Pattern 5: Single bullet point under multi-point header
  - Pattern 6: Plain multi-line guidelines ending with Level A/B/etc
  - Pattern 7: Plain multi-point guidelines with bullet points

### 2. [ ] Create Simple Italic Formatter for "As per" Text
- Add a new text processing function to handle simple "As per" italicization
- This should work within paragraph text, not just for guidelines
- Pattern: `As per <text>` → `_As per_ <text>`

### 3. [ ] Integration Points
- Option A: Add preprocessing in `processContentForGuidelines` function
- Option B: Add to paragraph component processing in MarkdownComponents
- Option C: Create a new text processor in markdown-utils.ts

### 4. [ ] Implementation Steps
1. Create regex pattern to match "As per " at the beginning of sentences
2. Add text replacement logic to italicize just the "As per" portion
3. Ensure it doesn't interfere with existing guideline patterns
4. Test with various content scenarios

### 5. [ ] Testing Scenarios
- [ ] Simple "As per" text in paragraphs
- [ ] "As per" in guidelines (should use GuidelineBox)
- [ ] Multiple "As per" instances in same paragraph
- [ ] "As per" at different positions (start, middle, end of sentence)

## Proposed Solution

### Simple Text Processor
```typescript
// Add to markdown-utils.ts
export const processAsPerText = (text: string): string => {
  // Pattern to match "As per" at word boundaries
  const asPerPattern = /\b(As per)\b/g;
  
  // Replace with italicized version
  return text.replace(asPerPattern, '_$1_');
};
```

### Integration in EnhancedMarkdownRenderer
Update the paragraph component to process text:
```typescript
p: ({ children, ...props }: any) => {
  const text = extractTextFromChildren(children);
  
  // Process "As per" text for italics
  const processedText = processAsPerText(text);
  
  // Continue with existing processing...
}
```

## Review Checklist
- [ ] Pattern doesn't conflict with existing guideline processing
- [ ] Works with both plain text and complex markdown content
- [ ] Maintains all existing functionality
- [ ] Performance impact is minimal
- [ ] Build passes successfully