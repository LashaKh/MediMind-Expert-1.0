#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the Vite build output to provide detailed bundle size insights
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST_DIR = path.join(__dirname, '../dist');

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function analyzeBundle() {
  try {
    if (!fs.existsSync(DIST_DIR)) {
      console.error('❌ Dist directory not found. Run `npm run build` first.');
      return;
    }

    console.log('🔍 Bundle Size Analysis\n');
    console.log('='.repeat(60));

    const files = [];
    
    function scanDirectory(dir, prefix = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(prefix, entry.name);
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, relativePath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.css'))) {
          const stats = fs.statSync(fullPath);
          files.push({
            path: relativePath,
            size: stats.size,
            type: entry.name.endsWith('.js') ? 'JavaScript' : 'CSS'
          });
        }
      }
    }
    
    scanDirectory(DIST_DIR);
    
    // Sort by size (largest first)
    files.sort((a, b) => b.size - a.size);
    
    // Calculate totals
    const totalJS = files.filter(f => f.type === 'JavaScript').reduce((sum, f) => sum + f.size, 0);
    const totalCSS = files.filter(f => f.type === 'CSS').reduce((sum, f) => sum + f.size, 0);
    const totalSize = totalJS + totalCSS;
    
    // Main bundle analysis
    const mainBundle = files.find(f => f.path.includes('index.') && f.type === 'JavaScript');
    const calculatorChunks = files.filter(f => f.path.includes('calculators/'));
    const vendorChunks = files.filter(f => f.path.includes('vendor/'));
    
    console.log('📊 SUMMARY');
    console.log('-'.repeat(30));
    console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);
    console.log(`JavaScript: ${formatBytes(totalJS)} (${((totalJS/totalSize)*100).toFixed(1)}%)`);
    console.log(`CSS: ${formatBytes(totalCSS)} (${((totalCSS/totalSize)*100).toFixed(1)}%)`);
    
    if (mainBundle) {
      console.log(`\n🎯 MAIN BUNDLE`);
      console.log('-'.repeat(30));
      console.log(`Main Bundle: ${formatBytes(mainBundle.size)}`);
      console.log(`Reduction: ${((1 - mainBundle.size/2799000)*100).toFixed(1)}% (vs 2.8MB target)`);
    }
    
    if (calculatorChunks.length > 0) {
      console.log(`\n🧮 CALCULATOR CHUNKS`);
      console.log('-'.repeat(30));
      calculatorChunks.forEach(chunk => {
        console.log(`${chunk.path}: ${formatBytes(chunk.size)}`);
      });
    }
    
    if (vendorChunks.length > 0) {
      console.log(`\n📦 VENDOR CHUNKS`);
      console.log('-'.repeat(30));
      vendorChunks.forEach(chunk => {
        console.log(`${chunk.path}: ${formatBytes(chunk.size)}`);
      });
    }
    
    console.log(`\n📋 ALL FILES (Top 20)`);
    console.log('-'.repeat(30));
    files.slice(0, 20).forEach((file, index) => {
      const percentage = ((file.size / totalSize) * 100).toFixed(1);
      console.log(`${(index + 1).toString().padStart(2)}. ${file.path.padEnd(50)} ${formatBytes(file.size).padStart(10)} (${percentage}%)`);
    });
    
    // Performance recommendations
    console.log(`\n💡 RECOMMENDATIONS`);
    console.log('-'.repeat(30));
    
    const largeChunks = files.filter(f => f.size > 500 * 1024 && f.type === 'JavaScript');
    if (largeChunks.length > 0) {
      console.log('⚠️  Large chunks detected:');
      largeChunks.forEach(chunk => {
        console.log(`   - ${chunk.path}: ${formatBytes(chunk.size)}`);
      });
    }
    
    console.log('\n✅ OPTIMIZATION STATUS:');
    console.log(`   - Main bundle: ${mainBundle && mainBundle.size < 800 * 1024 ? '✅ Optimized' : '❌ Needs work'}`);
    console.log(`   - Calculator splitting: ${calculatorChunks.length > 0 ? '✅ Implemented' : '❌ Missing'}`);
    console.log(`   - PDF lazy loading: ${files.some(f => f.path.includes('pdf')) ? '✅ Separated' : '❌ Not found'}`);
    console.log(`   - Route splitting: ${files.filter(f => f.path.includes('chunks/')).length > 10 ? '✅ Implemented' : '❌ Needs work'}`);
    
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
  }
}

analyzeBundle();