# Tasks: MediScribe Interactive Report Editing

**Input**: Design documents from `/specs/002-on-my-generated/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   ✓ Tech stack: TypeScript with React 18.3.1, Tailwind CSS, Supabase Client, Zustand
   ✓ Libraries: useGeorgianTTS hook, Flowise Chat Integration
   ✓ Structure: Web application - React frontend with component-based architecture
2. Load optional design documents:
   ✓ data-model.md: Extract entities → ReportEdit, ReportVersion, EditSession
   ✓ contracts/: report-editing-api.yaml → 10 endpoints with contract tests
   ✓ research.md: Existing integration patterns and performance requirements
3. Generate tasks by category:
   ✓ Setup: Database schema, dependencies, component structure
   ✓ Tests: Contract tests for all endpoints, integration tests for user scenarios
   ✓ Core: Database models, React components, hooks, services
   ✓ Integration: AI processing, voice transcription, UI integration
   ✓ Polish: Performance validation, error handling, mobile optimization
4. Apply task rules:
   ✓ Different files = mark [P] for parallel execution
   ✓ Same file = sequential (no [P])
   ✓ Tests before implementation (TDD mandatory per constitution)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph with medical safety gates
7. Create parallel execution examples for component development
8. Validate task completeness:
   ✓ All contracts have tests
   ✓ All entities have models and services
   ✓ All user scenarios covered
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **React Components**: `src/components/ReportEditing/`
- **Hooks**: `src/hooks/`
- **Services**: `src/services/`
- **Database**: Supabase migrations and functions
- **Tests**: Tests follow Vitest + Playwright patterns

## Phase 3.1: Setup & Database Schema
- [ ] T001 Create database migration for report editing schema in `supabase/migrations/20250922_report_editing_schema.sql`
- [ ] T002 [P] Create Supabase Edge Function for edit instruction processing in `supabase/functions/process-edit-instruction/index.ts`
- [ ] T003 [P] Configure TypeScript interfaces for report editing in `src/types/reportEditing.ts`
- [ ] T004 [P] Setup component directory structure in `src/components/ReportEditing/`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
**MEDICAL REQUIREMENT: All tests must validate medical accuracy and HIPAA compliance**

### Database Contract Tests
- [ ] T005 [P] Contract test for create edit session endpoint in `src/tests/contract/editSessions.test.ts`
- [ ] T006 [P] Contract test for list edit sessions endpoint in `src/tests/contract/editSessions.test.ts`
- [ ] T007 [P] Contract test for update edit session endpoint in `src/tests/contract/editSessions.test.ts`
- [ ] T008 [P] Contract test for create report edit endpoint in `src/tests/contract/reportEdits.test.ts`
- [ ] T009 [P] Contract test for list report edits endpoint in `src/tests/contract/reportEdits.test.ts`
- [ ] T010 [P] Contract test for update report edit endpoint in `src/tests/contract/reportEdits.test.ts`
- [ ] T011 [P] Contract test for create report version endpoint in `src/tests/contract/reportVersions.test.ts`
- [ ] T012 [P] Contract test for list report versions endpoint in `src/tests/contract/reportVersions.test.ts`

### AI Processing Contract Tests
- [ ] T013 [P] Contract test for process edit instruction Edge Function in `src/tests/contract/aiProcessing.test.ts`
- [ ] T014 [P] Contract test for Georgian TTS transcription integration in `src/tests/contract/voiceProcessing.test.ts`

### Component Integration Tests  
- [ ] T015 [P] Integration test for report expansion and edit interface in `src/tests/integration/reportExpansion.test.ts`
- [ ] T016 [P] Integration test for text instruction processing workflow in `src/tests/integration/textInstructions.test.ts`
- [ ] T017 [P] Integration test for voice instruction processing workflow in `src/tests/integration/voiceInstructions.test.ts`
- [ ] T018 [P] Integration test for manual report editing workflow in `src/tests/integration/manualEditing.test.ts`
- [ ] T019 [P] Integration test for multiple sequential edits workflow in `src/tests/integration/sequentialEdits.test.ts`
- [ ] T020 [P] Integration test for error handling and edge cases in `src/tests/integration/errorHandling.test.ts`

### Performance & Medical Compliance Tests
- [ ] T021 [P] Performance test for <200ms recording start requirement in `src/tests/performance/recordingPerformance.test.ts`
- [ ] T022 [P] Medical accuracy validation test for AI edit processing in `src/tests/medical/accuracyValidation.test.ts`
- [ ] T023 [P] Session isolation test for HIPAA compliance in `src/tests/security/sessionIsolation.test.ts`

## Phase 3.3: Database Models & Services (ONLY after tests are failing)
- [ ] T024 [P] Create ReportEdit model interface and validation in `src/models/ReportEdit.ts`
- [ ] T025 [P] Create ReportVersion model interface and validation in `src/models/ReportVersion.ts`
- [ ] T026 [P] Create EditSession model interface and validation in `src/models/EditSession.ts`
- [ ] T027 [P] Create ReportEditingService for database operations in `src/services/reportEditingService.ts`
- [ ] T028 [P] Create VersionManagementService for report versioning in `src/services/versionManagementService.ts`
- [ ] T029 [P] Create AIEditProcessingService for Flowise integration in `src/services/aiEditProcessingService.ts`

## Phase 3.4: React Components & Hooks
- [ ] T030 Create ReportEditCard component extending MedicalAnalysisCard in `src/components/ReportEditing/ReportEditCard.tsx`
- [ ] T031 [P] Create EditInstructionInput component for dual text/voice input in `src/components/ReportEditing/EditInstructionInput.tsx`
- [ ] T032 [P] Create ReportTextEditor component for direct editing in `src/components/ReportEditing/ReportTextEditor.tsx`
- [ ] T033 [P] Create EditHistoryPanel component for version tracking in `src/components/ReportEditing/EditHistoryPanel.tsx`
- [ ] T034 [P] Create VoiceInstructionButton component for voice input in `src/components/ReportEditing/VoiceInstructionButton.tsx`

### Custom Hooks
- [ ] T035 [P] Create useReportEditing hook for edit orchestration in `src/hooks/useReportEditing.ts`
- [ ] T036 [P] Create useEditSession hook for session management in `src/hooks/useEditSession.ts`
- [ ] T037 [P] Create useVersionHistory hook for version tracking in `src/hooks/useVersionHistory.ts`
- [ ] T038 [P] Create useAIEditProcessing hook for Flowise integration in `src/hooks/useAIEditProcessing.ts`

## Phase 3.5: Integration & AI Processing
- [ ] T039 Integrate ReportEditCard with existing MedicalAnalysisCard in `src/components/Georgian/components/MedicalAnalysisCard.tsx`
- [ ] T040 Integrate voice transcription with existing useGeorgianTTS hook in EditInstructionInput component
- [ ] T041 Integrate AI edit processing with existing Flowise endpoints via ChatContext
- [ ] T042 Implement real-time edit feedback and processing indicators in ReportEditCard
- [ ] T043 Add version management and history tracking to edit workflows
- [ ] T044 Implement medical validation for edit instruction coherence

## Phase 3.6: Edge Function Implementation
- [ ] T045 Implement process-edit-instruction Edge Function logic in `supabase/functions/process-edit-instruction/index.ts`
- [ ] T046 Add medical context validation to AI edit processing in Edge Function
- [ ] T047 Implement error handling and recovery in Edge Function processing
- [ ] T048 Add processing metadata tracking and token usage monitoring

## Phase 3.7: UI/UX & Mobile Optimization
- [ ] T049 [P] Apply medical blue theme styling to all report editing components
- [ ] T050 [P] Implement 44px touch targets for mobile medical professional use
- [ ] T051 [P] Add responsive design breakpoints (320px, 768px, 1024px) to edit components
- [ ] T052 [P] Implement loading states and progress indicators for AI processing
- [ ] T053 [P] Add success/error feedback messages with medical context
- [ ] T054 [P] Optimize edit interface for bedside mobile consultations

## Phase 3.8: Error Handling & Recovery
- [ ] T055 [P] Implement voice transcription error recovery in VoiceInstructionButton
- [ ] T056 [P] Add Flowise endpoint failure handling in AIEditProcessingService
- [ ] T057 [P] Implement medical validation warnings for contradictory instructions
- [ ] T058 [P] Add session timeout handling and recovery mechanisms
- [ ] T059 [P] Implement optimistic UI updates with rollback capabilities

## Phase 3.9: Performance Optimization
- [ ] T060 [P] Optimize microphone pre-initialization for <200ms recording start
- [ ] T061 [P] Implement debounced text instruction processing to reduce API calls
- [ ] T062 [P] Add progressive loading for large medical reports in edit interface
- [ ] T063 [P] Optimize AI processing with request batching for multiple edits
- [ ] T064 [P] Implement edit instruction caching for common medical patterns

## Phase 3.10: Polish & Validation
- [ ] T065 [P] Add comprehensive error boundary components for edit workflows
- [ ] T066 [P] Implement medical terminology consistency validation
- [ ] T067 [P] Add accessibility compliance (WCAG) for medical professional use
- [ ] T068 [P] Create comprehensive edit operation logging for audit trails
- [ ] T069 [P] Implement edit preview functionality before applying changes
- [ ] T070 Run complete quickstart validation scenarios from quickstart.md
- [ ] T071 Perform medical accuracy validation against evidence-based standards
- [ ] T072 Execute performance benchmarks and constitutional compliance checks

## Dependencies
```
Setup (T001-T004) → Tests (T005-T023) → Models (T024-T029) → Components (T030-T038) → Integration (T039-T048) → Polish (T049-T072)

Critical Gates:
- T023 (Session Isolation) must pass before any database operations
- T021 (Recording Performance) must pass before voice feature deployment  
- T022 (Medical Accuracy) must pass before AI processing deployment
- T070-T072 (Validation) must pass before production deployment
```

## Parallel Execution Groups

### Group 1: Database Setup (after T001 completes)
```bash
Task: "Create Supabase Edge Function for edit instruction processing in supabase/functions/process-edit-instruction/index.ts"
Task: "Configure TypeScript interfaces for report editing in src/types/reportEditing.ts"
Task: "Setup component directory structure in src/components/ReportEditing/"
```

### Group 2: Contract Tests (TDD Phase)
```bash
Task: "Contract test for create edit session endpoint in src/tests/contract/editSessions.test.ts"
Task: "Contract test for create report edit endpoint in src/tests/contract/reportEdits.test.ts"
Task: "Contract test for create report version endpoint in src/tests/contract/reportVersions.test.ts"
Task: "Contract test for process edit instruction Edge Function in src/tests/contract/aiProcessing.test.ts"
```

### Group 3: Integration Tests (Medical Workflows)
```bash
Task: "Integration test for report expansion and edit interface in src/tests/integration/reportExpansion.test.ts"
Task: "Integration test for text instruction processing workflow in src/tests/integration/textInstructions.test.ts"
Task: "Integration test for voice instruction processing workflow in src/tests/integration/voiceInstructions.test.ts"
Task: "Integration test for manual report editing workflow in src/tests/integration/manualEditing.test.ts"
```

### Group 4: Models & Services
```bash
Task: "Create ReportEdit model interface and validation in src/models/ReportEdit.ts"
Task: "Create ReportVersion model interface and validation in src/models/ReportVersion.ts"
Task: "Create EditSession model interface and validation in src/models/EditSession.ts"
Task: "Create ReportEditingService for database operations in src/services/reportEditingService.ts"
```

### Group 5: React Components
```bash
Task: "Create EditInstructionInput component for dual text/voice input in src/components/ReportEditing/EditInstructionInput.tsx"
Task: "Create ReportTextEditor component for direct editing in src/components/ReportEditing/ReportTextEditor.tsx"
Task: "Create EditHistoryPanel component for version tracking in src/components/ReportEditing/EditHistoryPanel.tsx"
Task: "Create VoiceInstructionButton component for voice input in src/components/ReportEditing/VoiceInstructionButton.tsx"
```

### Group 6: Custom Hooks
```bash
Task: "Create useReportEditing hook for edit orchestration in src/hooks/useReportEditing.ts"
Task: "Create useEditSession hook for session management in src/hooks/useEditSession.ts"
Task: "Create useVersionHistory hook for version tracking in src/hooks/useVersionHistory.ts"
Task: "Create useAIEditProcessing hook for Flowise integration in src/hooks/useAIEditProcessing.ts"
```

### Group 7: UI/UX Polish
```bash
Task: "Apply medical blue theme styling to all report editing components"
Task: "Implement 44px touch targets for mobile medical professional use"
Task: "Add responsive design breakpoints (320px, 768px, 1024px) to edit components"
Task: "Implement loading states and progress indicators for AI processing"
```

## Notes
- [P] tasks = different files, can be executed in parallel
- All tests must be written first and must fail before implementation (TDD)
- Medical accuracy validation is mandatory for all AI processing tasks
- Session isolation must be maintained for HIPAA compliance
- Performance requirements (<200ms recording start) are constitutional and non-negotiable
- Each task should be committed individually with descriptive commit messages
- Error handling must include medical context and recovery options

## Medical Safety Checklist
*Constitutional requirements that must be validated*

- [ ] All medical calculations achieve 100% validation
- [ ] Touch targets meet 44px minimum for clinical use
- [ ] Recording start time remains under 200ms
- [ ] Session isolation prevents transcript contamination
- [ ] Row Level Security enforced on all database operations
- [ ] Medical data anonymization maintained throughout edit process
- [ ] Evidence-based validation for all clinical algorithms
- [ ] HIPAA compliance verified for all data handling

## Task Generation Rules Applied
*Validation completed during execution*

✓ All contracts have corresponding test tasks (T005-T014)
✓ All entities have model creation tasks (T024-T026)
✓ All tests come before implementation (TDD enforced)
✓ Parallel tasks are truly independent (different files)
✓ Each task specifies exact file path
✓ No [P] task modifies same file as another [P] task
✓ Medical accuracy gates implemented before deployment
✓ Performance requirements integrated into task dependencies