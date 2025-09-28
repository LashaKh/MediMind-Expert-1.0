# Tasks: Custom Report Templates for MediScribe

**Input**: Design documents from `/specs/003-i-want-to/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

**Tech Stack**: TypeScript 5.5.3, React 18.3.1, Supabase PostgreSQL, Zustand, React Hook Form, Zod  
**Project Type**: Web (frontend with Supabase backend)  
**Structure**: Frontend React components + Supabase database schema

## 🎯 Implementation Status: ALL TASKS COMPLETE ✅

**✅ COMPLETED (49/49 tasks)**: Full template system implementation with all polish and optimizations
**✅ PRODUCTION READY**: Custom report templates fully integrated and tested

### All Features Successfully Delivered:
- ✅ Complete template CRUD operations with database migrations
- ✅ Template selection integrated into Georgian transcription interface  
- ✅ AI prompt enhancement using new general Flowise endpoint
- ✅ Mobile-first responsive design with 48px touch targets
- ✅ Offline support with sync queue and error handling
- ✅ Template usage tracking and statistics
- ✅ Advanced loading states with skeleton screens
- ✅ Mobile keyboard handling and optimizations
- ✅ Professional deletion confirmation modals
- ✅ Performance testing and accessibility compliance
- ✅ Production build validation and deployment readiness

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are relative to repository root

## Phase 3.1: Setup

- [x] **T001** [P] Install required dependencies: @supabase/supabase-js types for user_report_templates
- [x] **T002** [P] Configure TypeScript types for UserReportTemplate in `src/types/templates.ts`
- [x] **T003** [P] Setup Zod validation schemas in `src/lib/validations/template-schemas.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Endpoints)
- [x] **T004** [P] Contract test GET /user-templates in `src/__tests__/api/user-templates-get.test.ts`
- [x] **T005** [P] Contract test POST /user-templates in `src/__tests__/api/user-templates-post.test.ts`
- [x] **T006** [P] Contract test PUT /user-templates/:id in `src/__tests__/api/user-templates-put.test.ts`
- [x] **T007** [P] Contract test DELETE /user-templates/:id in `src/__tests__/api/user-templates-delete.test.ts`
- [x] **T008** [P] Contract test POST /user-templates/:id/use in `src/__tests__/api/user-templates-use.test.ts`

### Integration Tests (User Stories)
- [x] **T009** [P] Integration test "Create First Template" user story in `src/__tests__/integration/create-template.test.tsx`
- [x] **T010** [P] Integration test "Use Custom Template" user story in `src/__tests__/integration/use-template.test.tsx`
- [x] **T011** [P] Integration test "Manage Templates" user story in `src/__tests__/integration/manage-templates.test.tsx`

### Component Tests
- [x] **T012** [P] Component test MyTemplatesSection in `src/components/Georgian/components/__tests__/MyTemplatesSection.test.tsx`
- [x] **T013** [P] Component test TemplateCreationModal in `src/components/Georgian/components/__tests__/TemplateCreationModal.test.tsx`
- [x] **T014** [P] Component test TemplateManagementCard in `src/components/Georgian/components/__tests__/TemplateManagementCard.test.tsx`

## Phase 3.3: Database Schema (ONLY after tests are failing)

- [x] **T015** Create Supabase migration for user_report_templates table in `supabase/migrations/20250928_create_user_report_templates.sql`
- [x] **T016** Create RLS policies for user_report_templates in `supabase/migrations/20250928_user_report_templates_rls.sql`
- [x] **T017** Create database functions (template limit check, updated_at trigger) in `supabase/migrations/20250928_user_report_templates_functions.sql`

## Phase 3.4: Core Implementation (ONLY after database and tests)

### Data Layer
- [x] **T018** [P] UserReportTemplate TypeScript interfaces in `src/types/templates.ts`
- [x] **T019** [P] Template validation schemas (Zod) in `src/lib/validations/template-schemas.ts`
- [x] **T020** [P] Template service CRUD operations in `src/services/templateService.ts`

### React Components
- [x] **T021** [P] MyTemplatesSection component in `src/components/Georgian/components/MyTemplatesSection.tsx`
- [x] **T022** [P] TemplateCreationModal component in `src/components/Georgian/components/TemplateCreationModal.tsx`
- [x] **T023** [P] TemplateManagementCard component in `src/components/Georgian/components/TemplateManagementCard.tsx`
- [x] **T024** [P] TemplateSearchBar component in `src/components/Georgian/components/TemplateSearchBar.tsx`

### State Management
- [x] **T025** Template store (Zustand) in `src/stores/templateStore.ts`
- [x] **T026** Template management hooks in `src/hooks/useTemplateManagement.ts`

## Phase 3.5: Integration

### Template Page Integration
- [x] **T027** Update PremiumTemplatesSection to include MyTemplatesSection in `src/components/Georgian/components/PremiumTemplatesSection.tsx`
- [x] **T028** Integrate template selection with AI prompt enhancement in `src/services/diagnosisFlowiseService.ts`
- [x] **T029** Update GeorgianSTTApp template selection flow in `src/components/Georgian/GeorgianSTTApp.tsx`

### API Integration
- [x] **T030** Template API client methods in `src/lib/api/templates.ts`
- [x] **T031** Error handling for template operations in `src/lib/errors/template-errors.ts`
- [x] **T032** Template caching and synchronization in `src/services/templateService.ts`

## Phase 3.6: UI/UX Polish

### Responsive Design
- [x] **T033** [P] Mobile-responsive modal design (44px touch targets) in `src/components/Georgian/components/TemplateCreationModal.tsx`
- [x] **T034** [P] Template card mobile layout optimization in `src/components/Georgian/components/TemplateManagementCard.tsx`
- [x] **T035** [P] Search functionality mobile keyboard handling in `src/components/Georgian/components/TemplateSearchBar.tsx`

### User Experience Enhancements
- [x] **T036** [P] Template usage statistics display in `src/components/Georgian/components/TemplateManagementCard.tsx`
- [x] **T037** [P] Template loading states and skeleton screens in `src/components/Georgian/components/MyTemplatesSection.tsx`
- [x] **T038** [P] Template deletion confirmation modal in `src/components/Georgian/components/TemplateDeleteConfirmation.tsx`

## Phase 3.7: Performance & Validation

### Performance Tests
- [x] **T039** [P] Template loading performance test (<200ms) in `src/__tests__/performance/template-loading.test.ts`
- [x] **T040** [P] Template search performance test (<50ms client-side) in `src/__tests__/performance/template-search.test.ts`
- [x] **T041** [P] Modal open/close performance test (<100ms) in `src/__tests__/performance/modal-performance.test.ts`

### End-to-End Validation
- [x] **T042** [P] E2E test complete template workflow in `src/__tests__/e2e/template-workflow.spec.ts`
- [x] **T043** [P] Mobile responsiveness test (320px, 375px, 414px) in `src/__tests__/e2e/mobile-templates.spec.ts`
- [x] **T044** [P] Template limit enforcement test (50 templates max) in `src/__tests__/e2e/template-limits.spec.ts`

### Final Polish
- [x] **T045** [P] Update documentation for template feature in `docs/templates-feature.md`
- [x] **T046** [P] Security audit for template input sanitization in `src/lib/security/template-sanitization.ts`
- [x] **T047** Run manual testing scenarios from `quickstart.md`
- [x] **T048** Performance optimization and bundle size analysis
- [x] **T049** Accessibility audit (WCAG compliance) for template components

## Dependencies

### Critical Paths
- **Setup (T001-T003)** → All other tasks
- **Tests (T004-T014)** → Implementation (T015-T048)
- **Database (T015-T017)** → Data Layer (T018-T020)
- **Data Layer (T018-T020)** → Components (T021-T024)
- **Components (T021-T024)** → State Management (T025-T026)
- **Core Implementation (T018-T026)** → Integration (T027-T032)
- **Integration (T027-T032)** → Polish (T033-T049)

### Blocking Dependencies
- T015 blocks T018, T020, T025
- T018, T019 block T020, T021-T024, T025
- T020 blocks T026, T030, T032
- T021-T024 block T027, T033-T038
- T025, T026 block T027, T029
- T030-T032 block T039-T044

## Parallel Execution Examples

### Setup Phase (T001-T003)
```bash
# Launch T001-T003 together:
Task: "Install required dependencies for UserReportTemplate types"
Task: "Configure TypeScript interfaces in src/types/templates.ts"
Task: "Setup Zod validation schemas in src/lib/validations/template-schemas.ts"
```

### Contract Tests Phase (T004-T008)
```bash
# Launch T004-T008 together:
Task: "Contract test GET /user-templates in src/__tests__/api/user-templates-get.test.ts"
Task: "Contract test POST /user-templates in src/__tests__/api/user-templates-post.test.ts"
Task: "Contract test PUT /user-templates/:id in src/__tests__/api/user-templates-put.test.ts"
Task: "Contract test DELETE /user-templates/:id in src/__tests__/api/user-templates-delete.test.ts"
Task: "Contract test POST /user-templates/:id/use in src/__tests__/api/user-templates-use.test.ts"
```

### Component Implementation Phase (T021-T024)
```bash
# Launch T021-T024 together:
Task: "MyTemplatesSection component in src/components/Georgian/components/MyTemplatesSection.tsx"
Task: "TemplateCreationModal component in src/components/Georgian/components/TemplateCreationModal.tsx"
Task: "TemplateManagementCard component in src/components/Georgian/components/TemplateManagementCard.tsx"
Task: "TemplateSearchBar component in src/components/Georgian/components/TemplateSearchBar.tsx"
```

### Performance Tests Phase (T039-T041)
```bash
# Launch T039-T041 together:
Task: "Template loading performance test (<200ms) in src/__tests__/performance/template-loading.test.ts"
Task: "Template search performance test (<50ms client-side) in src/__tests__/performance/template-search.test.ts"
Task: "Modal open/close performance test (<100ms) in src/__tests__/performance/modal-performance.test.ts"
```

## Task Generation Summary

**From Contracts (api-contracts.yaml)**:
- 5 API endpoints → 5 contract tests (T004-T008)
- 5 endpoints → 5 implementation tasks (T030-T032)

**From Data Model (data-model.md)**:
- 1 entity (UserReportTemplate) → 1 model task (T018)
- 1 database table → 3 migration tasks (T015-T017)
- CRUD operations → 1 service task (T020)

**From User Stories (quickstart.md)**:
- 3 user stories → 3 integration tests (T009-T011)
- UI components → 4 component tests (T012-T014)

**From Technical Requirements**:
- Mobile-first design → 3 responsive tasks (T033-T035)
- Performance goals → 3 performance tests (T039-T041)
- Constitutional compliance → Security and accessibility tasks (T046, T049)

## Validation Checklist ✅

- [x] All contracts have corresponding tests (T004-T008)
- [x] All entities have model tasks (T018)
- [x] All tests come before implementation (T004-T014 before T015-T048)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD ordering enforced (tests → implementation → polish)
- [x] Mobile-first and performance requirements included
- [x] Constitutional compliance verified

## Notes

- **[P] tasks** = Different files, no dependencies, can run in parallel
- **Verify tests fail** before implementing (TDD requirement)
- **Commit after each task** for incremental progress
- **Mobile testing** required at 320px, 375px, 414px breakpoints
- **Performance targets**: <200ms UI response, <50ms search, <100ms modal
- **Security**: Input sanitization, RLS policies, HIPAA compliance maintained