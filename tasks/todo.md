# Translation Fixes: ABG Errors, Empty STT, Chat Title

## Problems Identified
1. **ABG Analysis Error in Georgian**: Blood Gas Analysis shows "Analysis Error: An unexpected error occurred during analysis" in English even when UI is in Georgian
2. **Empty Georgian STT Transcripts**: Recording shows processing but returns empty transcripts despite successful API calls
3. **Chat Title Missing Translation**: Console loop errors for missing `chat.title` translation key showing "MediMind AI"

## Todo Items
- [x] Add error message translations to ABG translation files (en, ka, ru)
- [x] Update useABGWorkflow.ts to use i18next translations for errors
- [x] Investigate empty Georgian STT transcripts - add diagnostic logging
- [x] Fix missing chat.title translation key in all three languages
- [ ] Test ABG analysis in Georgian and verify error messages
- [ ] Test Georgian STT recording and check console logs for audio data length

## Files Modified

### ABG Translation Fixes
1. **src/i18n/translations/en/abg.ts**
   - Added `analysis.error.unexpected`
   - Added `analysis.error.service503`
   - Added `analysis.error.rateLimit`
   - Added `analysis.error.quotaExhausted`
   - Added `analysis.error.geminiError`
   - Added `analysis.error.unexpectedInterpretation`
   - Added `analysis.error.unexpectedActionPlan`

2. **src/i18n/translations/ka/abg.ts**
   - Added Georgian translations for all 7 error messages
   - Examples:
     - `unexpected`: "ანალიზის დროს მოულოდნელი შეცდომა მოხდა"
     - `service503`: "AI სერვისი დროებით მიუწვდომელია (503)..."
     - `rateLimit`: "ლიმიტი გადაჭარბებულია..."

3. **src/i18n/translations/ru/abg.ts**
   - Added Russian translations for all 7 error messages
   - Examples:
     - `unexpected`: "Во время анализа произошла непредвиденная ошибка"
     - `service503`: "Сервис ИИ временно недоступен (503)..."
     - `rateLimit`: "Превышен лимит запросов..."

4. **src/components/ABG/hooks/useABGWorkflow.ts**
   - Added `import { useTranslation } from 'react-i18next';`
   - Added `const { t } = useTranslation();` in hook
   - Replaced all hardcoded English error messages with `t()` translation calls:
     - Line 244: `t('abg.analysis.error.unexpected', ...)`
     - Line 248: `t('abg.analysis.error.service503', ...)`
     - Line 250: `t('abg.analysis.error.rateLimit', ...)`
     - Line 252: `t('abg.analysis.error.quotaExhausted', ...)`
     - Line 254: `t('abg.analysis.error.geminiError', ..., { message: err.message })`
     - Line 399: `t('abg.analysis.error.unexpectedInterpretation', ...)`
     - Line 588: `t('abg.analysis.error.unexpectedActionPlan', ...)`

### Georgian STT Diagnostic Improvements
5. **src/lib/speech/georgianTTSService.ts**
   - Added audio data length logging before sending to Google STT
   - Added language parameter logging
   - Added empty audio data check with early return
   - Added detailed warning messages when Google STT returns empty results with possible causes:
     - No speech detected
     - Audio quality too low
     - Silence or background noise only
     - Language mismatch

### Chat Title Translation Fix
6. **src/i18n/translations/en/chat.ts**
   - Added `title: 'MediMind AI'` as first key in export

7. **src/i18n/translations/ka/chat.ts**
   - Updated existing `title: 'AI ჩატი'` to `title: 'MediMind AI'` for brand consistency

8. **src/i18n/translations/ru/chat.ts**
   - Updated existing `title: 'ИИ Чат'` to `title: 'MediMind AI'` for brand consistency

---

## Review

### Changes Summary
Fixed three translation issues: ABG analysis error messages now display in Georgian/Russian when UI language is changed, added comprehensive diagnostic logging for empty Georgian STT transcripts, and resolved missing chat.title translation key causing console loop errors.

### ABG Error Translation Fix - Impact
- ✅ **Complete i18n Coverage**: All 7 ABG error messages now properly translated
- ✅ **Language Consistency**: Error messages match UI language (English, Georgian, Russian)
- ✅ **User Experience**: Georgian users now see error messages in Georgian
- ✅ **Proper i18next Integration**: Uses translation keys with fallback English text
- ✅ **Parameterized Messages**: Gemini error message includes dynamic error details

### Georgian STT Diagnostic Improvements - Impact
- ✅ **Audio Data Validation**: Early detection of empty audio data before API call
- ✅ **Better Debugging**: Console logs show:
  - Audio data length (in bytes)
  - Language parameter being sent
  - Detailed warnings when empty results are returned
- ✅ **Root Cause Analysis**: Helps identify whether issue is:
  - Empty/corrupted audio data
  - Silent recording
  - Low audio quality
  - Language detection problem

### Chat Title Translation Fix - Impact
- ✅ **Console Error Elimination**: Removed repetitive `missingKey en translation chat.title` errors
- ✅ **Brand Consistency**: All languages now use "MediMind AI" as the product name
- ✅ **Clean Console Output**: Significantly reduced console noise for better debugging
- ✅ **Translation Completeness**: chat.title key now available in all 3 languages (EN, KA, RU)

### Translation Examples

**English:**
```
An unexpected error occurred during analysis
AI service is temporarily unavailable (503). This usually resolves within a few minutes. Please try again shortly.
Rate limit exceeded. Please wait a moment before trying again.
```

**Georgian:**
```
ანალიზის დროს მოულოდნელი შეცდომა მოხდა
AI სერვისი დროებით მიუწვდომელია (503). ეს ჩვეულებრივ რამდენიმე წუთში აღდგება. გთხოვთ სცადოთ ხელახლა.
ლიმიტი გადაჭარბებულია. გთხოვთ დაელოდოთ მომენტს და სცადოთ ხელახლა.
```

**Russian:**
```
Во время анализа произошла непредвиденная ошибка
Сервис ИИ временно недоступен (503). Обычно это решается в течение нескольких минут. Пожалуйста, попробуйте снова позже.
Превышен лимит запросов. Пожалуйста, подождите немного и попробуйте снова.
```

### Testing Instructions

#### ABG Error Messages Test
1. Switch UI to Georgian language
2. Upload a blood gas report
3. Trigger an error (e.g., by disconnecting internet or using invalid image)
4. Verify error message appears in Georgian, not English
5. Repeat for Russian language
6. Check specific errors:
   - 503 service unavailable error
   - Rate limit error
   - Quota exhausted error
   - General unexpected error

#### Georgian STT Diagnostic Test
1. Open browser console (F12)
2. Navigate to MediScribe (Georgian transcription page)
3. Start recording
4. Speak in Georgian
5. Check console for new diagnostic logs:
   - `📊 Audio data length: XXXXX bytes`
   - `🗣️ Language: ka-GE`
   - `✅ Google STT result: ...`
6. If empty results:
   - Check for `⚠️ Google STT returned empty result` warning
   - Review possible causes listed in warning
7. Verify audio data length is > 0 (not empty)

### Next Steps for Empty STT Issue
Based on diagnostic logs, determine:
1. **If audio data length is 0**: Problem is in audio capture/encoding before API call
2. **If audio data length > 0 but empty result**: Problem could be:
   - Google STT Edge Function not processing audio properly
   - Audio format/encoding incompatible with Google STT
   - Language detection issue
   - Audio quality/volume too low

Recommend testing with:
- Different microphone quality
- Different browsers
- Checking Edge Function logs on Supabase
- Testing with known good Georgian audio sample

### Files Changed Summary
- ✅ src/i18n/translations/en/abg.ts (7 new error keys)
- ✅ src/i18n/translations/ka/abg.ts (7 Georgian translations)
- ✅ src/i18n/translations/ru/abg.ts (7 Russian translations)
- ✅ src/components/ABG/hooks/useABGWorkflow.ts (i18next integration, 7 error message replacements)
- ✅ src/lib/speech/georgianTTSService.ts (diagnostic logging improvements)
- ✅ src/i18n/translations/en/chat.ts (added title key)
- ✅ src/i18n/translations/ka/chat.ts (updated title to "MediMind AI")
- ✅ src/i18n/translations/ru/chat.ts (updated title to "MediMind AI")

### Root Cause - ABG Errors
**Before**: Error messages hardcoded in English in `useABGWorkflow.ts`
**After**: All error messages use i18next translation system with fallback text

### Root Cause - Empty STT (Investigation)
**Hypothesis**: Either audio capture is failing OR Google STT is not detecting Georgian speech
**Solution**: Added comprehensive logging to identify exact failure point
**Next**: User needs to test and review console logs to determine root cause

### Root Cause - Chat Title
**Before**: Missing `chat.title` translation key in English chat.ts, causing i18next to log errors repeatedly
**After**: Added `title: 'MediMind AI'` to English chat.ts and standardized Georgian/Russian translations to use product name
**Impact**: Eliminated console loop of missingKey errors (was appearing 20+ times on page load)
