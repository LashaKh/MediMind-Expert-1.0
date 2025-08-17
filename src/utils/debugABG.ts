/**
 * Debug utility for ABG text extraction issues
 * Open browser console and use: window.debugABG(file)
 */

import { testGeminiVisionExtraction, testABGExtraction } from './testGeminiVision';
import { analyzeABGImage } from '../services/abgVisionService';

// Make debugging functions available globally for console testing
declare global {
  interface Window {
    debugABG: (file: File) => Promise<void>;
    testGeminiDirect: (file: File) => Promise<void>;
    testABGService: (file: File) => Promise<void>;
  }
}

/**
 * Main debugging function - tests the full ABG analysis pipeline
 */
window.debugABG = async function(file: File) {
  console.clear();
  console.log('🩺 ABG Text Extraction Debug Tool');
  console.log('================================');
  console.log(`Testing with file: ${file.name} (${file.size} bytes, ${file.type})`);
  console.log('');

  try {
    // Test 1: Direct Gemini Vision API
    console.log('🔬 Test 1: Direct Gemini Vision API');
    console.log('-----------------------------------');
    const geminiResult = await testGeminiVisionExtraction(file);
    
    if (geminiResult.success) {
      console.log('✅ Gemini Vision extraction successful!');
      console.log(`📊 Confidence: ${Math.round(geminiResult.confidence * 100)}%`);
      console.log(`📝 Text length: ${geminiResult.extractedText.length} characters`);
      console.log('');
      console.log('📄 Extracted text:');
      console.log('------------------');
      console.log(geminiResult.extractedText);
      console.log('');
      
      // Test extracted values against expected ABG values
      const abgTest = testABGExtraction(geminiResult.extractedText);
      console.log('🧪 ABG Value Detection:');
      console.log(`   Accuracy: ${Math.round(abgTest.accuracy * 100)}%`);
      console.log(`   Found: ${abgTest.matches.join(', ')}`);
      if (abgTest.missing.length > 0) {
        console.log(`   Missing: ${abgTest.missing.join(', ')}`);
      }
      console.log('');
    } else {
      console.error('❌ Gemini Vision extraction failed:', geminiResult.error);
      console.log('');
    }

    // Test 2: Full ABG Service (includes interpretation)
    console.log('🔬 Test 2: Full ABG Analysis Service');
    console.log('------------------------------------');
    const abgServiceResult = await analyzeABGImage(file);
    
    console.log('✅ ABG Service analysis complete!');
    console.log(`📊 Confidence: ${Math.round(abgServiceResult.confidence * 100)}%`);
    console.log(`⏱️ Processing time: ${abgServiceResult.processingTimeMs}ms`);
    console.log('');
    console.log('📄 Raw analysis from ABG service:');
    console.log('----------------------------------');
    console.log(abgServiceResult.rawAnalysis);
    console.log('');

    // Compare results
    console.log('🔍 Comparison Analysis');
    console.log('----------------------');
    if (geminiResult.success) {
      const directLength = geminiResult.extractedText.length;
      const serviceLength = abgServiceResult.rawAnalysis.length;
      console.log(`Direct Gemini: ${directLength} chars, ${Math.round(geminiResult.confidence * 100)}% confidence`);
      console.log(`ABG Service: ${serviceLength} chars, ${Math.round(abgServiceResult.confidence * 100)}% confidence`);
      
      if (geminiResult.extractedText !== abgServiceResult.rawAnalysis) {
        console.warn('⚠️ Results differ between direct Gemini and ABG service!');
        console.log('This might indicate a caching or processing issue.');
      } else {
        console.log('✅ Results match between direct Gemini and ABG service');
      }
    }

  } catch (error) {
    console.error('💥 Debug test failed:', error);
  }

  console.log('');
  console.log('🔧 Debug Tips:');
  console.log('- Check browser network tab for API calls');
  console.log('- Look for any cached results or service worker issues');
  console.log('- Verify image quality and format compatibility');
  console.log('- Check console for any additional error messages');
};

/**
 * Test only the direct Gemini Vision API
 */
window.testGeminiDirect = async function(file: File) {
  console.log('🔬 Testing Gemini Vision API directly...');
  const result = await testGeminiVisionExtraction(file);
  console.log('Result:', result);
};

/**
 * Test only the ABG analysis service
 */
window.testABGService = async function(file: File) {
  console.log('🔬 Testing ABG Analysis Service...');
  const result = await analyzeABGImage(file);
  console.log('Result:', result);
};

// Log available debug functions on page load
console.log('🩺 ABG Debug Tools Available:');
console.log('- window.debugABG(file) - Full debug analysis');
console.log('- window.testGeminiDirect(file) - Test Gemini Vision only');
console.log('- window.testABGService(file) - Test ABG service only');
console.log('');
console.log('Usage: Select an ABG image file, then call window.debugABG(file)');