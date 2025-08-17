# Pathway.md Content Extraction Guide Using Puppeteer MCP

Quick guide for extracting complete content from Pathway.md medical articles using Puppeteer MCP. 

**Prerequisites**: Chrome installed, account registered at team@updevoteai.com, password is Dba545c5fde36242 Puppeteer MCP available.

# first if you are not already logged in, log in with this email team@updevoteai.com using google log in , 

## Step 1: Navigate to Target Article

```javascript
// Navigate to specific Pathway.md article
mcp__puppeteer__puppeteer_navigate("https://www.pathway.md/diseases/[article-id]")
```

**Verification:**
```javascript
mcp__puppeteer__puppeteer_evaluate("document.title")
// Should return article title, not registration page
```

## Step 2: EXPAND ALL collapsed fields Extract Full Content all the sources included !!!!!

### 2.1 Expand All Content

```javascript
// Click to expand all sections for complete content
mcp__puppeteer__puppeteer_click("text=Expand All Topics")
```

### 2.2 Verify Content Loading

```javascript
// Check total content size (should be 40,000+ characters for full articles)
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.length")
```

### 2.3 Extract Content in Chunks **WITH IMMEDIATE STUDY LINK CAPTURE**

**CRITICAL FOR LARGE CONTENT (>10,000 characters)**: Use step-by-step extraction and file building approach:

#### For Content >10,000 Characters: 
**DO NOT extract all content at once**. Instead, use this **MANDATORY** step-by-step approach:

**🚨 CRITICAL PATTERN: EXTRACT → WRITE TO FILE → VERIFY STUDY LINKS → EXTRACT NEXT CHUNK**

```javascript
// STEP 1: Check total content size first
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.length")

// STEP 2: If >10,000 characters, use chunk-by-chunk approach
// ===== CHUNK 1 EXTRACTION (0-10,000) =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(0, 10000)")
// → **IMMEDIATELY WRITE** this chunk to markdown file before proceeding

// ===== CRITICAL: VERIFY STUDY LINKS IN CHUNK 1 =====
// Check for study names that need PubMed links
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const chunkText = document.body.innerText.slice(0, 10000);
  const studyPattern = /\\b[A-Z]{2,}[\\s-][A-Z]{2,}\\b|\\b[A-Z]+\\s(?:study|trial|Study|Trial)\\b/g;
  const studies = chunkText.match(studyPattern) || [];
  return studies.length > 0 ? 'STUDIES FOUND: ' + studies.join(', ') : 'No studies detected';
})()`)
// → **ADD PUBMED LINKS** for any detected studies before proceeding

// ===== CHUNK 2 EXTRACTION (10,000-20,000) =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(10000, 20000)")
// → **IMMEDIATELY APPEND** this chunk to markdown file before proceeding

// ===== CRITICAL: VERIFY STUDY LINKS IN CHUNK 2 =====
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const chunkText = document.body.innerText.slice(10000, 20000);
  const studyPattern = /\\b[A-Z]{2,}[\\s-][A-Z]{2,}\\b|\\b[A-Z]+\\s(?:study|trial|Study|Trial)\\b/g;
  const studies = chunkText.match(studyPattern) || [];
  return studies.length > 0 ? 'STUDIES FOUND: ' + studies.join(', ') : 'No studies detected';
})()`)
// → **ADD PUBMED LINKS** for any detected studies before proceeding

// ===== CHUNK 3 EXTRACTION (20,000-30,000) =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(20000, 30000)")
// → **IMMEDIATELY APPEND** this chunk to markdown file before proceeding

// ===== CRITICAL: VERIFY STUDY LINKS IN CHUNK 3 =====
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const chunkText = document.body.innerText.slice(20000, 30000);
  const studyPattern = /\\b[A-Z]{2,}[\\s-][A-Z]{2,}\\b|\\b[A-Z]+\\s(?:study|trial|Study|Trial)\\b/g;
  const studies = chunkText.match(studyPattern) || [];
  return studies.length > 0 ? 'STUDIES FOUND: ' + studies.join(', ') : 'No studies detected';
})()`)
// → **ADD PUBMED LINKS** for any detected studies before proceeding

// Continue this MANDATORY pattern: 
// EXTRACT CHUNK → WRITE TO FILE → VERIFY STUDY LINKS → ADD PUBMED LINKS → EXTRACT NEXT CHUNK
// Until total content length is reached
```

**🚨 NEVER SKIP THE FILE WRITING STEP BETWEEN CHUNKS**

**Why This Approach:**
- Prevents API token limit errors (>32,000 output tokens)
- Ensures no content is lost between extractions
- **CRITICAL**: Captures study links during extraction, not retroactively
- Provides immediate file building for verification
- Avoids memory issues with large content
- **PREVENTS MISSING STUDY REFERENCES** - our biggest risk

## Step 3: Extract All Reference Links and Sources

### 3.1 Extract PubMed and DOI References

```javascript
// Extract all reference links with their URLs
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const references = [];
  const referenceElements = document.querySelectorAll('a[href*="doi.org"], a[href*="pubmed"], a[href*="ncbi.nlm.nih.gov"], a[href*="Open"]');
  referenceElements.forEach((link, index) => {
    references.push({
      text: link.innerText.trim(),
      url: link.href,
      context: link.parentElement?.innerText?.slice(0, 200) + '...'
    });
  });
  return JSON.stringify(references, null, 2);
})()`)
```

### 3.2 Extract Related Calculator Links

```javascript
// Extract calculator and internal pathway links
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const allLinks = [];
  const linkElements = document.querySelectorAll('a[href]');
  linkElements.forEach((link) => {
    if (link.href && 
        (link.href.includes('pubmed') || 
         link.href.includes('doi.org') || 
         link.href.includes('ncbi.nlm.nih.gov') ||
         link.href.includes('pathway.md'))) {
      allLinks.push({
        text: link.innerText.trim(),
        url: link.href,
        type: link.href.includes('pathway.md') ? 'internal' : 'external'
      });
    }
  });
  return JSON.stringify(allLinks, null, 2);
})()`)
```

### 3.3 Verify Reference Count

```javascript
// Count total references to ensure completeness
mcp__puppeteer__puppeteer_evaluate("document.querySelectorAll('a[href*=\"pubmed\"], a[href*=\"doi.org\"]').length")
```

## Step 4: Content Organization

### Key Sections to Identify:
- **Background** (Definition, Pathophysiology, Epidemiology)
- **Guidelines** (with evidence levels A, B, C, D, E, I)
- **Clinical Findings** (Symptoms, Medical History) 
- **Studies** (Recent research and trials) - **🚨 CRITICAL: CAPTURE PUBMED LINKS IMMEDIATELY**
- **References** (Citations and links)

### Reference Link Formatting Requirements:
- **PubMed Links**: Format as `[PubMed](https://pubmed.ncbi.nlm.nih.gov/PMID)`
- **Calculator Links**: Include all related Pathway.md calculator references
- **Internal Links**: Preserve navigation and section links
- **Source Attribution**: Always include original Pathway.md article link

## Quick Workflow for Large Content (>10,000 characters)

```javascript
// 1. Navigate to article
mcp__puppeteer__puppeteer_navigate("https://www.pathway.md/diseases/[article-id]")

// 2. Expand all content sections
mcp__puppeteer__puppeteer_click("text=Expand All Topics")
// Look for additional "Expand" buttons and click them too
mcp__puppeteer__puppeteer_click("text=Expand")

// 3. Check total content size
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.length")

// 4. 🚨 MANDATORY CHUNK-BY-CHUNK EXTRACTION (for content >10,000 chars)
// ===== CHUNK 1: EXTRACT → WRITE → VERIFY STUDIES → PROCEED =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(0, 10000)")
// → **IMMEDIATELY** write this to markdown file
// → **IMMEDIATELY** check for study names and add PubMed links
// → **ONLY THEN** proceed to chunk 2

// ===== CHUNK 2: EXTRACT → WRITE → VERIFY STUDIES → PROCEED =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(10000, 20000)")
// → **IMMEDIATELY** append this to markdown file
// → **IMMEDIATELY** check for study names and add PubMed links
// → **ONLY THEN** proceed to chunk 3

// ===== CHUNK 3: EXTRACT → WRITE → VERIFY STUDIES → PROCEED =====
mcp__puppeteer__puppeteer_evaluate("document.body.innerText.slice(20000, 30000)")
// → **IMMEDIATELY** append this to markdown file
// → **IMMEDIATELY** check for study names and add PubMed links
// → **ONLY THEN** proceed to chunk 4

// Continue pattern: EXTRACT → WRITE → VERIFY STUDIES → EXTRACT → WRITE → VERIFY STUDIES
// **NEVER SKIP THE WRITE AND VERIFY STEPS**
// Until reaching total content length

// 5. Extract all reference links (after content extraction is complete)
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const references = [];
  const referenceElements = document.querySelectorAll('a[href*="doi.org"], a[href*="pubmed"], a[href*="ncbi.nlm.nih.gov"], a[href*="Open"]');
  referenceElements.forEach((link, index) => {
    references.push({
      text: link.innerText.trim(),
      url: link.href,
      context: link.parentElement?.innerText?.slice(0, 200) + '...'
    });
  });
  return JSON.stringify(references, null, 2);
})()`)

// 6. Append reference links to markdown file
```

## Study Link Detection Script (Use After Each Chunk)

```javascript
// 🚨 CRITICAL: Run this after each chunk to detect studies needing PubMed links
mcp__puppeteer__puppeteer_evaluate(`(() => {
  const chunkText = document.body.innerText.slice([START], [END]); // Replace with actual chunk range
  
  // Common study name patterns
  const studyPatterns = [
    /\\b[A-Z]{2,}[\\s-][A-Z]{2,}\\b/g,           // REDUCE-IT, CLEAR Outcomes
    /\\b[A-Z]+\\s(?:study|trial|Study|Trial)\\b/g, // FOURIER study
    /\\b[A-Z]{3,}\\b/g,                           // BROADWAY, RACING
    /\\b4S\\b|\\bWOSCOPS\\b|\\bIMPROVE-IT\\b/g   // Specific named studies
  ];
  
  const detectedStudies = [];
  studyPatterns.forEach(pattern => {
    const matches = chunkText.match(pattern) || [];
    detectedStudies.push(...matches);
  });
  
  const uniqueStudies = [...new Set(detectedStudies)];
  return uniqueStudies.length > 0 ? 
    'STUDIES REQUIRING PUBMED LINKS: ' + uniqueStudies.join(', ') : 
    'No studies detected in this chunk';
})()`)
```

## Small Content Workflow (<10,000 characters)

For smaller articles, you can extract all content at once:

```javascript
// 1-2. Navigate and expand (same as above)

// 3. Extract all content at once (only for small articles)
mcp__puppeteer__puppeteer_evaluate("document.body.innerText")

// 4. Extract references and create markdown file
```

## Success Indicators

✅ **No login prompts** - Account access working  
✅ **"Expand All Topics" available** - Full content accessible  
✅ **40,000+ characters** - Complete article extracted  
✅ **Evidence levels preserved** - A, B, C, D, E, I classifications visible  
✅ **Multiple guidelines sources** - ACC, ESC, AHA, CCS, etc.
✅ **All PubMed links extracted** - References with clickable links preserved
✅ **🚨 CRITICAL: Study links captured during extraction** - Not retroactively added
✅ **Calculator links included** - Related Pathway.md tools referenced
✅ **Source attribution complete** - Original article link included
✅ **🚨 Each chunk written to file before next extraction** - Mandatory step completion

## Troubleshooting

**If content truncated:** Extract in smaller 5,000 character chunks  
**If login required:** Navigate to main pathway.md first, then to article  
**If expansion fails:** Click individual section headers manually and look for additional "Expand" buttons
**If links missing:** Re-run reference extraction script and verify JSON output
**If reference count low:** Check for additional link selectors or DOM changes
**🚨 If study links missing:** You skipped the study verification step - go back and add them systematically
**If API token limit errors:** ALWAYS use chunk-by-chunk approach for content >10,000 characters
**If content appears incomplete:** Verify all "Expand" buttons were clicked, not just "Expand All Topics"

# Must Rules
- Make sure to extract all the resource links with the resources
- Create md folder with extracted disease text in this folder: /Users/Lasha/Desktop/MediMindexpert copy/docs/cardiology-diseases.md
- **🚨 CRITICAL**: Always extract and preserve all PubMed reference links **DURING EACH CHUNK EXTRACTION**
- **🚨 CRITICAL**: **WRITE EACH CHUNK TO FILE BEFORE EXTRACTING NEXT CHUNK** - Never skip this step
- **🚨 CRITICAL**: **VERIFY STUDY LINKS AFTER EACH CHUNK** - Use the study detection script
- **CRITICAL**: Include all related calculator links from Pathway.md
- **CRITICAL**: Format all references with proper markdown links
- **CRITICAL**: Verify reference link count matches article reference count
- **CRITICAL**: Include original Pathway.md source attribution
- **CRITICAL FOR LARGE CONTENT**: Use chunk-by-chunk extraction with immediate file writing
- **CRITICAL**: Check for and click ALL "Expand" buttons, not just "Expand All Topics"
- **CRITICAL**: Set CLAUDE_CODE_MAX_OUTPUT_TOKENS environment variable to avoid API limits

## Reference Link Extraction Verification

After extraction, verify:
1. **PubMed link count** matches references section
2. **Calculator links** are properly formatted
3. **Internal navigation links** preserved where relevant
4. **External research links** all functional
5. **Source attribution** to original Pathway.md article included
6. **🚨 Study names have corresponding PubMed links** - Most critical verification

## Common Study Names That Need PubMed Links

Watch for these common patterns during extraction:
- **REDUCE-IT, CLEAR Outcomes, IMPROVE-IT, FOURIER**
- **BROADWAY, RACING, LODESTAR, ZOE METHOD**
- **4S, WOSCOPS, AURORA, ADH-Wizard**
- **Any ALL-CAPS abbreviations followed by "study" or "trial"**
- **Hyphenated study names (ABC-DEF pattern)**

**🚨 If you see these study names without [PubMed](link), immediately add the links using search_replace operations.**

# Never change from the step by step method to the diffferen "More Efficient" bulk method, always proceed with chunk by chunk methond

# DO NOT EXTRACT LARGER CHUNKS YOU MUST CONTINUE STEP BY STEP WITH 10 000 CHUNK AT A TIME
# Never speed up the process
 