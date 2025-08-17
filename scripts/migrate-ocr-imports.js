#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const IMPORT_MAPPINGS = {
  // Old imports -> New imports
  "import { extractTextFromImage } from '../utils/imageOcrExtractor'": "import { extractTextFromImage } from '../utils/unifiedOcrExtractor'",
  "import { extractTextFromImage } from './imageOcrExtractor'": "import { extractTextFromImage } from './unifiedOcrExtractor'",
  "import { analyzeImageForText } from '../utils/imageTextDetector'": "import { analyzeImageForText } from '../utils/unifiedOcrExtractor'",
  "import { analyzeImageForText } from './imageTextDetector'": "import { analyzeImageForText } from './unifiedOcrExtractor'",
  "import { extractTextFromPdf } from '../utils/ocrExtractor'": "import { extractTextFromPdf } from '../utils/unifiedOcrExtractor'",
  "import { extractTextFromPdf } from './ocrExtractor'": "import { extractTextFromPdf } from './unifiedOcrExtractor'",
  "import { getFileProcessingRecommendation } from '../utils/imageTextDetector'": "import { getFileProcessingRecommendation } from '../utils/unifiedOcrExtractor'",
  "import { getFileProcessingRecommendation } from './imageTextDetector'": "import { getFileProcessingRecommendation } from './unifiedOcrExtractor'",
  "import { cleanupTextDetectionWorker } from '../utils/imageTextDetector'": "import { cleanupOcrWorkers } from '../utils/unifiedOcrExtractor'",
  "import { cleanupTextDetectionWorker } from './imageTextDetector'": "import { cleanupOcrWorkers } from './unifiedOcrExtractor'"
};

const FUNCTION_MAPPINGS = {
  "cleanupTextDetectionWorker": "cleanupOcrWorkers"
};

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // Skip node_modules and other excluded paths
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) {
      continue;
    }
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      await migrateImports(fullPath);
    }
  }
}

async function migrateImports(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    const originalContent = content;
    let hasChanges = false;
    
    // Replace import statements
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(escapeRegex(oldImport), 'g'), newImport);
        hasChanges = true;
      }
    }
    
    // Replace function calls
    for (const [oldFunction, newFunction] of Object.entries(FUNCTION_MAPPINGS)) {
      const functionCallRegex = new RegExp(`\\b${oldFunction}\\b`, 'g');
      if (functionCallRegex.test(content)) {
        content = content.replace(functionCallRegex, newFunction);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✓ Migrated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run the migration
const srcPath = join(process.cwd(), 'src');
console.log('🔄 Migrating OCR imports to unified extractor...\n');

processDirectory(srcPath)
  .then(() => {
    console.log('\n✅ OCR import migration complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the application to ensure imports work correctly');
    console.log('2. Remove old OCR utility files if no longer needed:');
    console.log('   - src/utils/imageOcrExtractor.ts');
    console.log('   - src/utils/imageTextDetector.ts');
    console.log('   - src/utils/ocrExtractor.ts');
  })
  .catch(error => {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  });