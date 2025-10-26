/**
 * STT Language Mapper Utility
 * Maps i18n language codes to Google Speech-to-Text language codes
 *
 * Supported Languages:
 * - English: 'en' → 'en-US'
 * - Georgian: 'ka' → 'ka-GE'
 * - Russian: 'ru' → 'ru-RU'
 */

type I18nLanguageCode = 'en' | 'ka' | 'ru';
type STTLanguageCode = 'en-US' | 'ka-GE' | 'ru-RU';

/**
 * Language mapping configuration
 */
const LANGUAGE_MAP: Record<I18nLanguageCode, STTLanguageCode> = {
  en: 'en-US',
  ka: 'ka-GE',
  ru: 'ru-RU'
};

/**
 * Default fallback language (English)
 */
const DEFAULT_STT_LANGUAGE: STTLanguageCode = 'en-US';

/**
 * Maps i18n language code to Google STT language code
 *
 * @param appLanguage - The current i18n language code ('en', 'ka', or 'ru')
 * @returns The corresponding Google STT language code
 *
 * @example
 * ```ts
 * getSTTLanguageCode('en')  // Returns 'en-US'
 * getSTTLanguageCode('ka')  // Returns 'ka-GE'
 * getSTTLanguageCode('ru')  // Returns 'ru-RU'
 * getSTTLanguageCode('fr')  // Returns 'en-US' (fallback)
 * ```
 */
export function getSTTLanguageCode(appLanguage: string): STTLanguageCode {
  // Normalize language code (handle cases like 'en-US' or 'ka-GE' from i18n)
  const normalizedLang = appLanguage.split('-')[0].toLowerCase();

  // Check if it's a supported language
  if (normalizedLang in LANGUAGE_MAP) {
    return LANGUAGE_MAP[normalizedLang as I18nLanguageCode];
  }

  // Fallback to English for unsupported languages
  console.warn(`Unsupported STT language: ${appLanguage}, falling back to ${DEFAULT_STT_LANGUAGE}`);
  return DEFAULT_STT_LANGUAGE;
}

/**
 * Gets a human-readable language name for display purposes
 *
 * @param sttLanguageCode - The Google STT language code
 * @returns Human-readable language name
 */
export function getLanguageName(sttLanguageCode: STTLanguageCode): string {
  const nameMap: Record<STTLanguageCode, string> = {
    'en-US': 'English',
    'ka-GE': 'ქართული (Georgian)',
    'ru-RU': 'Русский (Russian)'
  };

  return nameMap[sttLanguageCode] || sttLanguageCode;
}

/**
 * Validates if a language code is supported by the STT system
 *
 * @param languageCode - Language code to validate
 * @returns True if supported, false otherwise
 */
export function isLanguageSupported(languageCode: string): boolean {
  const normalizedLang = languageCode.split('-')[0].toLowerCase();
  return normalizedLang in LANGUAGE_MAP;
}
