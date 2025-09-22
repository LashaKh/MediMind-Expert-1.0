# Quickstart: MediScribe Interactive Report Editing

## Overview
This quickstart validates the MediScribe Interactive Report Editing feature through end-to-end user scenarios, ensuring all functional requirements are met and the system maintains medical-grade accuracy and performance.

## Prerequisites
- MediMind Expert application running locally (http://localhost:8888)
- Supabase database with report editing schema deployed
- Georgian TTS service configured and accessible
- Flowise AI endpoints available for medical analysis
- Test user authenticated with medical specialty (Cardiology or OB/GYN)

## Test Data Setup

### 1. Create Test Medical Report
```bash
# Navigate to MediScribe page and generate a test report
# This creates a ProcessingHistory record with analysis results
curl -X POST "http://localhost:8888/api/georgian-sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-001",
    "transcript": "Patient presents with chest pain and dyspnea on exertion. EKG shows ST elevation in leads II, III, aVF.",
    "processingResults": {
      "analysis": "Heart Failure ER Report (I50.0)",
      "content": "EMERGENCY DEPARTMENT REPORT\n\nChief Complaint: Chest pain and shortness of breath\n\nHistory of Present Illness:\nPatient presents with acute onset chest pain and dyspnea on exertion. Symptoms began 2 hours ago while climbing stairs.\n\nPhysical Examination:\n- Vital Signs: BP 160/95, HR 110, RR 24, O2 Sat 92% on room air\n- Cardiovascular: S3 gallop present, bilateral lower extremity edema\n- Respiratory: Bilateral crackles at lung bases\n\nDiagnostic Results:\n- EKG: ST elevation in leads II, III, aVF\n- Chest X-ray: Cardiomegaly with pulmonary edema\n- BNP: 850 pg/mL (elevated)\n\nAssessment and Plan:\nPrimary Diagnosis: Heart Failure, unspecified (I50.0)\n- Initiate diuretic therapy\n- Monitor fluid balance\n- Cardiology consultation\n- Serial cardiac enzymes"
    }
  }'
```

### 2. Verify Database Schema
```sql
-- Ensure all tables exist with proper RLS
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('report_edits', 'report_versions', 'edit_sessions');

-- Verify RLS policies are active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('report_edits', 'report_versions', 'edit_sessions');
```

## Test Scenarios

### Scenario 1: Basic Report Expansion and Edit Interface
**Objective**: Verify expandable interface shows editing options
**Requirements**: FR-001, FR-002

1. **Navigate to MediScribe page**
   ```javascript
   // Browser automation test
   await page.goto('http://localhost:8888/mediscribe');
   await page.waitForSelector('[data-testid="medical-analysis-card"]');
   ```

2. **Expand generated report card**
   ```javascript
   const reportCard = page.locator('[data-testid="medical-analysis-card"]').first();
   await reportCard.locator('[data-testid="expand-button"]').click();
   ```

3. **Verify edit interface elements**
   ```javascript
   // Check for dual input options
   await expect(page.locator('[data-testid="text-instruction-input"]')).toBeVisible();
   await expect(page.locator('[data-testid="voice-instruction-button"]')).toBeVisible();
   await expect(page.locator('[data-testid="report-text-editor"]')).toBeVisible();
   ```

**Expected Results**:
- Report card expands to show full content
- Text instruction input area visible (minimum 44px touch targets)
- Voice instruction button visible and accessible
- Direct report editing textarea available
- All UI elements follow medical blue theme

### Scenario 2: Text Instruction Processing
**Objective**: Verify text-based report modification via AI
**Requirements**: FR-004, FR-006, FR-011

1. **Enter text instruction**
   ```javascript
   const textInput = page.locator('[data-testid="text-instruction-input"]');
   await textInput.fill('Add patient complained of shortness of breath for 3 days');
   ```

2. **Submit instruction**
   ```javascript
   await page.locator('[data-testid="submit-instruction-button"]').click();
   await page.waitForSelector('[data-testid="processing-indicator"]');
   ```

3. **Verify AI processing**
   ```javascript
   // Check processing feedback
   await expect(page.locator('[data-testid="processing-indicator"]')).toContainText('Processing via Flowise AI...');
   
   // Wait for completion
   await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 30000 });
   ```

4. **Validate updated content**
   ```javascript
   const updatedContent = await page.locator('[data-testid="report-content"]').textContent();
   expect(updatedContent).toContain('shortness of breath for 3 days');
   expect(updatedContent).toContain('I50.0'); // Medical code preserved
   ```

**Expected Results**:
- Processing indicator shows real-time feedback
- Updated report maintains medical formatting
- Medical codes and structure preserved
- Success message with medical context displayed
- Edit operation recorded in database

### Scenario 3: Voice Instruction Processing
**Objective**: Verify voice-based report modification using Georgian TTS
**Requirements**: FR-003, FR-007

1. **Prepare audio test data**
   ```javascript
   // Mock audio blob for Georgian instruction
   const mockAudioBlob = new Blob([mockAudioData], { type: 'audio/webm' });
   ```

2. **Activate voice recording**
   ```javascript
   await page.locator('[data-testid="voice-instruction-button"]').click();
   await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
   ```

3. **Verify microphone initialization**
   ```javascript
   // Check performance requirement: <200ms start time
   const startTime = Date.now();
   await page.waitForSelector('[data-testid="recording-active"]');
   const initTime = Date.now() - startTime;
   expect(initTime).toBeLessThan(200);
   ```

4. **Process voice instruction**
   ```javascript
   // Simulate audio input and transcription
   await page.evaluate(() => {
     window.mockGeorgianTTSResponse = {
       text: 'დაამატე რომ პაციენტი უჩივის ქოშინზე სამი დღეა',
       confidence: 0.95
     };
   });
   
   await page.locator('[data-testid="stop-recording-button"]').click();
   ```

5. **Verify transcription and AI processing**
   ```javascript
   // Check Georgian TTS integration
   await expect(page.locator('[data-testid="voice-transcript"]')).toContainText('ქოშინზე სამი დღეა');
   
   // Verify AI processing of transcribed instruction
   await page.waitForSelector('[data-testid="ai-processing-voice"]');
   ```

**Expected Results**:
- Recording starts within 200ms (microphone pre-initialization)
- Georgian speech transcribed correctly using STT3 model
- Transcription sent to same Flowise endpoint as original report
- Updated report reflects voice instruction content
- Session isolation maintained throughout process

### Scenario 4: Manual Report Editing
**Objective**: Verify direct text editing capability
**Requirements**: FR-005, FR-008

1. **Access direct editing mode**
   ```javascript
   await page.locator('[data-testid="enable-manual-edit"]').click();
   const editor = page.locator('[data-testid="report-text-editor"]');
   await expect(editor).toHaveAttribute('contenteditable', 'true');
   ```

2. **Make manual edits**
   ```javascript
   const originalContent = await editor.textContent();
   await editor.fill(originalContent + '\n\nAdditional Notes: Patient has history of hypertension.');
   ```

3. **Save manual changes**
   ```javascript
   await page.locator('[data-testid="save-manual-edit"]').click();
   await page.waitForSelector('[data-testid="save-success"]');
   ```

4. **Verify version history**
   ```javascript
   await page.locator('[data-testid="version-history-button"]').click();
   const versions = page.locator('[data-testid="version-item"]');
   await expect(versions).toHaveCount(2); // Original + manual edit
   ```

**Expected Results**:
- Report content becomes directly editable
- Manual changes saved with version tracking
- Version history shows clear modification indicators
- All changes maintain medical formatting standards

### Scenario 5: Multiple Sequential Edits
**Objective**: Verify multiple edit operations on same report
**Requirements**: FR-010, FR-012

1. **Perform text instruction edit**
   ```javascript
   await textInput.fill('Update vital signs: BP 140/90, HR 95');
   await page.locator('[data-testid="submit-instruction-button"]').click();
   await page.waitForSelector('[data-testid="processing-complete"]');
   ```

2. **Perform voice instruction edit**
   ```javascript
   await page.locator('[data-testid="voice-instruction-button"]').click();
   // Simulate voice input for medication update
   await page.locator('[data-testid="stop-recording-button"]').click();
   await page.waitForSelector('[data-testid="processing-complete"]');
   ```

3. **Perform manual edit**
   ```javascript
   const editor = page.locator('[data-testid="report-text-editor"]');
   await editor.focus();
   await editor.press('Control+End'); // Go to end
   await editor.type('\n\nDischarge Instructions: Follow up with cardiology in 1 week.');
   await page.locator('[data-testid="save-manual-edit"]').click();
   ```

4. **Verify coherent integration**
   ```javascript
   const finalContent = await page.locator('[data-testid="report-content"]').textContent();
   expect(finalContent).toContain('BP 140/90, HR 95'); // Text instruction
   expect(finalContent).toContain('cardiology in 1 week'); // Manual edit
   expect(finalContent).toContain('I50.0'); // Original medical code preserved
   ```

**Expected Results**:
- All three edit types integrate coherently
- No conflicting information in final report
- Medical structure and codes maintained
- Version history tracks all modifications

### Scenario 6: Error Handling and Edge Cases
**Objective**: Verify robust error handling
**Requirements**: FR-009, FR-011

1. **Test voice transcription failure**
   ```javascript
   await page.evaluate(() => {
     window.mockTTSError = new Error('Transcription service unavailable');
   });
   
   await page.locator('[data-testid="voice-instruction-button"]').click();
   await page.waitForSelector('[data-testid="transcription-error"]');
   ```

2. **Test Flowise endpoint failure**
   ```javascript
   await page.route('**/functions/v1/process-edit-instruction', route => {
     route.fulfill({ status: 500, body: 'AI service temporarily unavailable' });
   });
   
   await textInput.fill('Add test instruction');
   await page.locator('[data-testid="submit-instruction-button"]').click();
   await page.waitForSelector('[data-testid="ai-processing-error"]');
   ```

3. **Test medically contradictory instruction**
   ```javascript
   await textInput.fill('Change diagnosis to broken arm (completely unrelated to cardiac symptoms)');
   await page.locator('[data-testid="submit-instruction-button"]').click();
   await page.waitForSelector('[data-testid="medical-validation-warning"]');
   ```

**Expected Results**:
- Clear error messages with medical context
- System gracefully handles service failures
- Medical validation prevents contradictory changes
- User can retry operations after errors
- No data corruption during error states

## Performance Validation

### Recording Start Time Test
```javascript
async function validateRecordingPerformance() {
  const startTime = performance.now();
  await page.locator('[data-testid="voice-instruction-button"]').click();
  await page.waitForSelector('[data-testid="recording-active"]');
  const endTime = performance.now();
  
  const recordingStartTime = endTime - startTime;
  expect(recordingStartTime).toBeLessThan(200); // Constitutional requirement
}
```

### AI Processing Response Time
```javascript
async function validateAIResponseTime() {
  const startTime = performance.now();
  await textInput.fill('Quick test instruction');
  await page.locator('[data-testid="submit-instruction-button"]').click();
  await page.waitForSelector('[data-testid="processing-complete"]');
  const endTime = performance.now();
  
  const processingTime = endTime - startTime;
  // Log for monitoring, no hard requirement but track for optimization
  console.log(`AI processing completed in ${processingTime}ms`);
}
```

## Database Validation

### Verify Data Integrity
```sql
-- Check edit session creation
SELECT * FROM edit_sessions 
WHERE report_id = 'test-report-001' 
AND status = 'active';

-- Verify edit operations
SELECT edit_type, instruction_text, processing_metadata 
FROM report_edits 
WHERE session_id = 'test-session-001' 
ORDER BY created_at;

-- Check version history
SELECT version_number, edit_summary, is_current 
FROM report_versions 
WHERE report_id = 'test-report-001' 
ORDER BY version_number;
```

### Verify Row Level Security
```sql
-- Attempt to access another user's data (should return empty)
SET session.user_id = 'different-user-id';
SELECT * FROM report_edits WHERE report_id = 'test-report-001';
-- Expected: 0 rows returned due to RLS policy
```

## Success Criteria
- All test scenarios pass without errors
- Performance requirements met (<200ms recording start)
- Medical accuracy maintained throughout edit process
- UI responsive and touch-friendly (44px targets)
- Data integrity preserved with proper version tracking
- Error handling graceful with clear medical context
- Session isolation prevents cross-user contamination

## Troubleshooting

### Common Issues

1. **Recording fails to start**
   - Verify microphone permissions granted
   - Check georgian-tts-proxy Edge Function deployment
   - Ensure Supabase authentication token valid

2. **AI processing timeout**
   - Verify Flowise endpoint accessibility
   - Check network connectivity
   - Validate instruction format and content

3. **Manual edits not saving**
   - Check database connection
   - Verify RLS policies allow writes
   - Ensure session management active

4. **Version history inconsistent**
   - Verify transaction handling in version creation
   - Check unique constraints on is_current flag
   - Validate foreign key relationships

### Debug Commands
```bash
# Check Supabase connection
supabase status

# Verify Edge Functions
supabase functions list

# Monitor database activity
tail -f /var/log/postgresql/postgresql.log

# Check browser console for JavaScript errors
console.log('Debugging report editing...');
```

This quickstart provides comprehensive validation of the MediScribe Interactive Report Editing feature, ensuring all functional requirements are met while maintaining the medical-grade standards required by the MediMind Expert constitution.