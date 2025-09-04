#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const EXCLUDED_PATHS = [
  'node_modules',
  'dist',
  '.netlify',
  'test',
  '__tests__',
  'scripts',
  'public'
];

const EXCLUDED_FILES = [
  'logger.ts',
  'logger.js',
  'errorLogger.ts',
  'errorLogger.js',
  'debug',
  'test',
  '.test.',
  '.spec.'
];

// Georgian transcription files should be excluded to prevent syntax breaking
const GEORGIAN_TRANSCRIPTION_FILES = [
  'GeorgianSTTApp.tsx',
  'TranscriptPanel.tsx',
  'georgianTTSService.ts',
  'useGeorgianTTS.ts',
  'useSessionManagement.ts',
  'diagnosisFlowiseService.ts',
  'AIProcessingContent.tsx'
];

/**
 * Safe console log removal using careful regex patterns
 * This approach is more conservative but much safer than AST parsing
 */
function removeConsoleLogsSafely(content) {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip lines that are clearly not console statements
    if (!trimmedLine.includes('console.')) {
      result.push(line);
      i++;
      continue;
    }

    // Check if this is a simple, single-line console statement
    const simpleConsoleMatch = trimmedLine.match(/^console\.(log|warn|error|debug|info)\s*\(/);
    
    if (simpleConsoleMatch) {
      // Check if it's a complete statement on one line
      if (isCompleteConsoleStatement(trimmedLine)) {
        // Skip this line (remove it)
        console.log(`  Removing: ${trimmedLine.substring(0, 80)}${trimmedLine.length > 80 ? '...' : ''}`);
        i++;
        continue;
      } else {
        // This is a multiline console statement - handle carefully
        const multilineResult = handleMultilineConsole(lines, i);
        if (multilineResult.success) {
          // Skip all lines that were part of the console statement
          console.log(`  Removing multiline console (${multilineResult.endIndex - i + 1} lines)`);
          i = multilineResult.endIndex + 1;
          continue;
        }
      }
    }

    // If we can't safely remove it, keep the line
    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * Check if a line contains a complete console statement
 */
function isCompleteConsoleStatement(line) {
  // Simple heuristic: count parentheses
  const openParens = (line.match(/\(/g) || []).length;
  const closeParens = (line.match(/\)/g) || []).length;
  
  // Must start with console. and have balanced parentheses
  return line.trim().startsWith('console.') && 
         openParens === closeParens && 
         openParens > 0 &&
         (line.includes(';') || line.trim().endsWith(')'));
}

/**
 * Handle multiline console statements carefully
 */
function handleMultilineConsole(lines, startIndex) {
  let parenCount = 0;
  let inString = false;
  let stringChar = '';
  let endIndex = startIndex;
  
  // Look for the end of the console statement
  for (let i = startIndex; i < lines.length && i < startIndex + 20; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : '';
      
      // Handle string boundaries
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      // Count parentheses only outside strings
      if (!inString) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        
        // If we've balanced all parentheses and found a semicolon or end of line
        if (parenCount === 0 && (char === ';' || j === line.length - 1)) {
          endIndex = i;
          
          // Verify this looks like a complete console statement
          const fullStatement = lines.slice(startIndex, endIndex + 1).join('\n');
          if (fullStatement.trim().startsWith('console.') && !containsLogicCode(fullStatement)) {
            return { success: true, endIndex };
          }
        }
      }
    }
  }
  
  // If we couldn't find a clean end, don't remove it
  return { success: false, endIndex: startIndex };
}

/**
 * Check if the statement contains logic code that shouldn't be removed
 */
function containsLogicCode(statement) {
  const logicPatterns = [
    /if\s*\(/,
    /else/,
    /while\s*\(/,
    /for\s*\(/,
    /switch\s*\(/,
    /function\s*\(/,
    /=>/,
    /return\s/,
    /throw\s/,
    /catch\s*\(/,
    /finally\s*{/
  ];
  
  return logicPatterns.some(pattern => pattern.test(statement));
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // Skip excluded paths
    if (EXCLUDED_PATHS.some(excluded => fullPath.includes(excluded))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      // Skip excluded files
      if (EXCLUDED_FILES.some(excluded => entry.name.includes(excluded))) {
        continue;
      }
      
      // Skip Georgian transcription files to prevent breaking them
      if (GEORGIAN_TRANSCRIPTION_FILES.some(excluded => entry.name.includes(excluded))) {
        console.log(`⚠️  Skipping Georgian transcription file: ${entry.name}`);
        continue;
      }
      
      await processFile(fullPath);
    }
  }
}

async function processFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    const originalContent = content;
    
    console.log(`\nProcessing: ${filePath}`);
    
    // Use the safe removal method
    content = removeConsoleLogsSafely(content);
    
    // Clean up extra blank lines (but preserve intentional spacing)
    content = content.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      // Create a backup before writing
      const backupPath = filePath + '.backup';
      await writeFile(backupPath, originalContent, 'utf-8');
      
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ Cleaned: ${filePath} (backup created)`);
    } else {
      console.log(`  No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Run the cleanup
const srcPath = join(process.cwd(), 'src');
console.log('🧹 Safely removing console statements from production code...');
console.log('⚠️  Georgian transcription files will be skipped to prevent syntax breaking\n');

processDirectory(srcPath)
  .then(() => {
    console.log('\n✅ Safe console statement cleanup complete!');
    console.log('📄 Backup files (.backup) created for all modified files');
    console.log('🔍 Review changes and delete backup files if satisfied');
  })
  .catch(error => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  });