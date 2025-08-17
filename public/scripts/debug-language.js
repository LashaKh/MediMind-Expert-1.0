// Language Debug Script for MediMind Expert
// Run this in browser console to check/reset language state

console.log('=== MediMind Language Debug ===');

// Check current localStorage language
const currentLang = localStorage.getItem('selectedLanguage');
console.log('Current localStorage language:', currentLang);

// Check if valid language
const validLanguages = ['en', 'ka', 'ru'];
const isValid = validLanguages.includes(currentLang);
console.log('Is valid language:', isValid);

// Function to reset language to English
window.resetLanguageToEnglish = () => {
  localStorage.setItem('selectedLanguage', 'en');
  console.log('✅ Language reset to English');
  console.log('🔄 Please refresh the page to see changes');
  location.reload();
};

// Function to set specific language
window.setLanguage = (lang) => {
  if (validLanguages.includes(lang)) {
    localStorage.setItem('selectedLanguage', lang);
    console.log(`✅ Language set to ${lang}`);
    console.log('🔄 Please refresh the page to see changes');
    location.reload();
  } else {
    console.error(`❌ Invalid language: ${lang}. Valid options: ${validLanguages.join(', ')}`);
  }
};

// Show current status
console.log('\n=== Available Commands ===');
console.log('resetLanguageToEnglish() - Reset to English');
console.log('setLanguage("en") - Set to English');
console.log('setLanguage("ru") - Set to Russian');
console.log('setLanguage("ka") - Set to Georgian');

// Auto-suggestion if invalid language
if (!isValid && currentLang) {
  console.warn(`⚠️ Invalid language detected: ${currentLang}`);
  console.log('💡 Run resetLanguageToEnglish() to fix this');
} 