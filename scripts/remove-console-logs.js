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
      
      await processFile(fullPath);
    }
  }
}

async function processFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    const originalContent = content;
    
    // Remove console.log, console.warn, console.error, console.debug statements
    // But keep them in catch blocks for error handling
    const consoleRegex = /^(?!.*catch).*console\.(log|warn|error|debug)\s*\([^)]*\)\s*;?\s*$/gm;
    
    // Remove empty console statements
    content = content.replace(consoleRegex, '');
    
    // Remove console statements that span multiple lines
    const multilineConsoleRegex = /console\.(log|warn|error|debug)\s*\([^)]*\n[^)]*\)\s*;?/gm;
    content = content.replace(multilineConsoleRegex, (match) => {
      // Keep if it's in a catch block
      if (match.includes('catch') || match.includes('error')) {
        return match;
      }
      return '';
    });
    
    // Clean up extra blank lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✓ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Run the cleanup
const srcPath = join(process.cwd(), 'src');
console.log('🧹 Removing console statements from production code...\n');

processDirectory(srcPath)
  .then(() => {
    console.log('\n✅ Console statement cleanup complete!');
  })
  .catch(error => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  });