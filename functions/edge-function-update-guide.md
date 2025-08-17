# Edge Function Update Guide - Podcast Fixes

## Issues Fixed

### 1. **"Body already consumed" Error**
- **Root Cause**: `podcast-status` function was trying to read `req.json()` multiple times
- **Fix**: Store the parsed body in a variable and reuse it instead of reading multiple times

### 2. **Voice ID Issues** 
- **Root Cause**: Using invalid voice ID `Aw4FAjKCGjjNkVhN1Xmq` (voice_not_found error)
- **Fix**: Updated to working voice IDs:
  - `wyWA56cQNU2KqUW4eCsI` (host/primary)
  - `uYXf8XasLslADfZ2MB4u` (expert/fallback)

## Files Updated

### 1. `generate-podcast` Function
**File**: `/functions/fixed-edge-functions/generate-podcast-fixed.ts`
- ✅ Updated `MEDICAL_VOICES` object with working voice IDs
- ✅ Improved fallback voice assignment in script generation

### 2. `podcast-queue-processor` Function  
**File**: `/functions/fixed-edge-functions/podcast-queue-processor-fixed.ts`
- ✅ Updated default voice constants
- ✅ Enhanced `getVoiceId()` function with better fallback logic
- ✅ Improved error handling in `ttsToArrayBufferWithFallback()`
- ✅ Added console logging for voice selection debugging

### 3. `podcast-status` Function
**File**: `/functions/fixed-edge-functions/podcast-status-fixed.ts`
- ✅ **CRITICAL FIX**: Prevent "Body already consumed" error by reading body only once
- ✅ Better error handling for JSON parsing
- ✅ Improved logging for debugging

### 4. `podcast-preview` Function
**File**: `/functions/fixed-edge-functions/podcast-preview-fixed.ts`
- ✅ Updated default voice IDs
- ✅ Added fallback voice retry logic
- ✅ Enhanced error logging

## Next Steps

### Immediate Actions Required:
1. **Update Supabase Edge Functions** with the fixed code:
   - Copy content from `/functions/fixed-edge-functions/` files
   - Paste into corresponding Edge Functions in Supabase dashboard
   - Deploy updated functions

2. **Test Voice IDs**:
   - Use podcast preview feature to test both voice IDs
   - Generate a test podcast to verify full pipeline

### To Update Edge Functions:
1. Go to Supabase Dashboard → Edge Functions
2. For each function (generate-podcast, podcast-queue-processor, podcast-status, podcast-preview):
   - Open the function
   - Replace the content with the corresponding `-fixed.ts` file
   - Deploy the function

## Key Improvements

### Voice Selection Logic:
```typescript
// Before (causing voice_not_found)
const MEDICAL_VOICES = {
  host: 'JBFqnCBsd6RMkjVDRZzb',
  expert: 'Aw4FAjKCGjjNkVhN1Xmq'  // ❌ Invalid voice
};

// After (working voices)
const MEDICAL_VOICES = {
  host: 'wyWA56cQNU2KqUW4eCsI',    // ✅ Working voice
  expert: 'uYXf8XasLslADfZ2MB4u'   // ✅ Working voice
};
```

### Body Consumption Fix:
```typescript
// Before (causing "Body already consumed")
if (req.method === 'POST') {
  const body = await req.json();  // First read
  // Later in code...
  const anotherRead = await req.json(); // ❌ Body already consumed
}

// After (single read)
let requestBody: any = null;
if (req.method === 'POST') {
  requestBody = await req.json();  // Single read, stored in variable
  // Use requestBody throughout the function
}
```

## Verification Steps

After updating the Edge Functions:

1. **Test Voice Preview**:
   ```bash
   # Test both voices work
   curl -X POST https://your-project.supabase.co/functions/v1/podcast-preview \
     -H "Content-Type: application/json" \
     -d '{"text":"Test audio","voiceId":"wyWA56cQNU2KqUW4eCsI"}'
   ```

2. **Generate Test Podcast**:
   - Use the podcast generation feature with a small document
   - Monitor logs for voice selection and generation success

3. **Check Queue Status**:
   - Ensure `podcast-status` function works without "Body already consumed" error
   - Verify proper queue processing

## Expected Results

- ✅ No more "Body already consumed" errors
- ✅ No more "voice_not_found" errors  
- ✅ Successful podcast generation with both voices
- ✅ Proper fallback voice handling
- ✅ Better error logging and debugging

## Emergency Rollback

If issues occur, the original functions are still in Supabase. Simply revert to the previous version in the Edge Functions dashboard.