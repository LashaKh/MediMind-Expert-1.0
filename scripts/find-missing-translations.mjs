#!/usr/bin/env node

/**
 * Automated Translation Key Finder
 * Scans all React components and finds missing translation keys
 * by comparing used keys with available translations in en/index.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.bright}${colors.blue}=== Missing Translation Key Finder ===${colors.reset}\n`);

// Step 1: Find all translation keys used in components
console.log(`${colors.cyan}Step 1: Scanning all React components...${colors.reset}`);

const componentFiles = globSync('src/**/*.{tsx,ts,jsx,js}', {
  cwd: projectRoot,
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/i18n/translations/**' // Exclude translation files themselves
  ]
});

console.log(`Found ${colors.bright}${componentFiles.length}${colors.reset} component files\n`);

// Extract all t('key') calls
const translationKeyRegex = /\bt\s*\(\s*['"]([^'"]+)['"]/g;
const usedKeys = new Set();
const keyUsageMap = new Map(); // Track which files use which keys

componentFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  const content = readFileSync(filePath, 'utf-8');

  let match;
  while ((match = translationKeyRegex.exec(content)) !== null) {
    const key = match[1];
    usedKeys.add(key);

    if (!keyUsageMap.has(key)) {
      keyUsageMap.set(key, []);
    }
    keyUsageMap.get(key).push(file);
  }
});

console.log(`Found ${colors.bright}${usedKeys.size}${colors.reset} unique translation keys in use\n`);

console.log(`${colors.cyan}Step 2: Loading English translation definitions...${colors.reset}\n`);

// Step 2: Load all English translation files dynamically
const translationDir = join(projectRoot, 'src/i18n/translations/en');
const translationFiles = globSync('**/*.ts', {
  cwd: translationDir,
  ignore: ['index.ts']
});

console.log(`Found ${colors.bright}${translationFiles.length}${colors.reset} translation files\n`);

// Recursively collect all available keys from all translation files
const availableKeys = new Set();

// Load each translation file and extract keys
translationFiles.forEach(file => {
  const filePath = join(translationDir, file);
  const moduleName = file.replace(/\.ts$/, '').replace(/\//g, '.');

  try {
    const content = readFileSync(filePath, 'utf-8');
    const keys = extractKeysFromFile(content, moduleName);
    keys.forEach(key => availableKeys.add(key));
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not parse ${file}${colors.reset}`);
  }
});

console.log(`Found ${colors.bright}${availableKeys.size}${colors.reset} defined translation keys\n`);

// Helper function to extract keys from translation file
function extractKeysFromFile(content, prefix = '') {
  const keys = [];

  // Remove comments
  let cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  // Find the export default object
  const exportMatch = cleaned.match(/export\s+default\s*(\{[\s\S]*\});?\s*$/);
  if (!exportMatch) {
    return keys;
  }

  // Parse object structure to extract keys
  const objString = exportMatch[1];
  const extractedKeys = extractKeysFromObject(objString, prefix);

  return extractedKeys;
}

// Recursive function to extract nested keys
function extractKeysFromObject(objString, prefix = '') {
  const keys = [];

  // Match key: value patterns
  // This regex matches: key: 'value', key: "value", key: { nested }
  const keyPattern = /(\w+)\s*:\s*(?:(['"`])(?:(?!\2).)*\2|\{)/g;

  let match;
  let bracketCount = 0;
  let currentKey = '';
  let currentStart = 0;

  // Simple state machine to track nested objects
  for (let i = 0; i < objString.length; i++) {
    const char = objString[i];

    if (char === '{') bracketCount++;
    if (char === '}') bracketCount--;
  }

  // Extract top-level keys
  while ((match = keyPattern.exec(objString)) !== null) {
    const key = match[1];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Check if this is a string value or object
    const afterColon = objString.substring(match.index + match[0].length);
    const isObject = afterColon.trim().startsWith('{');

    if (isObject) {
      // Find the matching closing brace
      let depth = 0;
      let start = match.index + match[0].length;
      let end = start;

      for (let i = start; i < objString.length; i++) {
        if (objString[i] === '{') depth++;
        if (objString[i] === '}') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }

      const nestedObj = objString.substring(start, end + 1);
      const nestedKeys = extractKeysFromObject(nestedObj, fullKey);
      keys.push(...nestedKeys);
    } else {
      // It's a leaf value
      keys.push(fullKey);
    }
  }

  return keys;
}

console.log(`${colors.cyan}Step 3: Checking for missing keys...${colors.reset}\n`);

// Step 3: Compare used keys vs available keys
const missingKeys = [];

usedKeys.forEach(key => {
  // Check if key exists in available keys
  // We need to check both exact match and partial match (for nested keys)
  const keyExists = Array.from(availableKeys).some(availableKey => {
    return availableKey === key || availableKey.startsWith(key + '.');
  });

  if (!keyExists) {
    missingKeys.push({
      key,
      files: keyUsageMap.get(key)
    });
  }
});

// Step 4: Generate report
console.log(`${colors.bright}=== RESULTS ===${colors.reset}\n`);

if (missingKeys.length === 0) {
  console.log(`${colors.green}${colors.bright}✓ No missing translation keys found!${colors.reset}`);
  console.log(`${colors.green}All ${usedKeys.size} translation keys are defined.${colors.reset}\n`);
} else {
  console.log(`${colors.red}${colors.bright}✗ Found ${missingKeys.length} missing translation keys${colors.reset}\n`);

  // Group by category
  const byCategory = new Map();
  missingKeys.forEach(({ key, files }) => {
    const category = key.split('.')[0];
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category).push({ key, files });
  });

  // Print by category (limit to first 10 per category for readability)
  for (const [category, keys] of byCategory) {
    console.log(`${colors.yellow}${colors.bright}Category: ${category} (${keys.length} missing keys)${colors.reset}`);
    keys.slice(0, 10).forEach(({ key, files }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${key}`);
      files.slice(0, 2).forEach(file => {
        console.log(`    ${colors.cyan}→${colors.reset} ${file}`);
      });
      if (files.length > 2) {
        console.log(`    ${colors.cyan}→${colors.reset} ... and ${files.length - 2} more files`);
      }
    });
    if (keys.length > 10) {
      console.log(`  ${colors.cyan}... and ${keys.length - 10} more missing keys${colors.reset}`);
    }
    console.log('');
  }

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalKeysUsed: usedKeys.size,
      totalKeysDefined: availableKeys.size,
      missingKeysCount: missingKeys.length,
      coveragePercentage: ((1 - missingKeys.length / usedKeys.size) * 100).toFixed(2) + '%'
    },
    missingKeys: missingKeys.map(({ key, files }) => ({
      key,
      usedInFiles: files,
      category: key.split('.')[0]
    })),
    statistics: {
      byCategory: Object.fromEntries(
        Array.from(byCategory.entries()).map(([category, keys]) => [
          category,
          keys.length
        ])
      )
    }
  };

  const reportPath = join(projectRoot, 'translation-missing-keys-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`${colors.blue}Detailed report saved to:${colors.reset}`);
  console.log(`${colors.bright}translation-missing-keys-report.json${colors.reset}\n`);
}

// Summary statistics
console.log(`${colors.bright}=== STATISTICS ===${colors.reset}`);
console.log(`Total files scanned: ${colors.bright}${componentFiles.length}${colors.reset}`);
console.log(`Total translation keys used: ${colors.bright}${usedKeys.size}${colors.reset}`);
console.log(`Total translation keys defined: ${colors.bright}${availableKeys.size}${colors.reset}`);
console.log(`Missing keys: ${colors.bright}${missingKeys.length > 0 ? colors.red : colors.green}${missingKeys.length}${colors.reset}`);
console.log(`Coverage: ${colors.bright}${((1 - missingKeys.length / usedKeys.size) * 100).toFixed(2)}%${colors.reset}\n`);

// Exit with error code if missing keys found
process.exit(missingKeys.length > 0 ? 1 : 0);
