
# Implementation Plan: Custom Report Templates for MediScribe

**Branch**: `003-i-want-to` | **Date**: 2025-09-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-i-want-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Enable cardiologists to create custom report templates with structure examples and notes that guide AI-generated reports from Georgian transcripts. Templates are displayed in a "My Templates" section above existing Cardiologist Consults on the Templates page, with a popup-based creation interface that integrates with the existing Flowise endpoint for enhanced AI prompts.

## Technical Context
**Language/Version**: TypeScript 5.5.3, React 18.3.1, Node.js  
**Primary Dependencies**: React, Supabase Client, Zustand, React Hook Form, Zod, Tailwind CSS, Lucide React  
**Storage**: Supabase PostgreSQL with Row Level Security  
**Testing**: Vitest, React Testing Library, Playwright  
**Target Platform**: Web application (Vite build, Netlify deployment)
**Project Type**: Web (frontend with Supabase backend)  
**Performance Goals**: <200ms UI response, real-time template synchronization  
**Constraints**: Medical data privacy (HIPAA), mobile-first design (44px touch targets), existing Georgian transcription integration  
**Scale/Scope**: Individual users creating multiple custom templates, integration with existing Flowise AI endpoint

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Medical Safety & Compliance**: ✅ COMPLIANT
- Feature does not involve medical calculations or algorithms
- Template content is user-generated, not system-calculated
- Data validation prevents malformed input that could affect AI output quality

**Mobile-First Medical Interface**: ✅ COMPLIANT  
- Modal design accommodates mobile viewports (320px+)
- Touch targets designed for 44px minimum per existing patterns
- Progressive enhancement from existing mobile-optimized Templates page

**Performance & Reliability**: ✅ COMPLIANT
- Template operations target <200ms response time
- User data isolation through RLS prevents template contamination
- Real-time template search with client-side filtering for responsiveness

**Security & Privacy**: ✅ COMPLIANT
- Row Level Security enforced on user_report_templates table
- Template data isolated per user (no sharing in initial implementation)
- Input sanitization prevents XSS while preserving medical formatting
- HIPAA compliance maintained through existing Supabase security model

**Testing & Validation (TDD Mandatory)**: ✅ COMPLIANT
- API contract tests defined before implementation
- Component tests for UI interactions planned
- Integration tests for template-AI workflow specified
- Performance tests for mobile responsiveness included

**POST-DESIGN REVIEW**: ✅ NO NEW VIOLATIONS
All constitutional requirements maintained through Phase 1 design. No complexity deviations requiring justification.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend React components with Supabase backend integration

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 49 tasks created in tasks.md
- [x] Phase 4: Implementation complete - All core functionality implemented
- [x] Phase 5: Validation passed - All performance tests, mobile testing, and final polish completed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] No complexity deviations to document

**Generated Artifacts**:
- [x] research.md - All unknowns resolved with evidence-based decisions
- [x] data-model.md - Database schema and TypeScript types defined
- [x] contracts/api-contracts.yaml - OpenAPI specification for all endpoints
- [x] quickstart.md - Comprehensive validation framework and test scenarios
- [x] CLAUDE.md updated with new technical context
- [x] tasks.md - 49 implementation tasks with TDD approach

**Implementation Status** (Phase 4 & 5 - COMPLETE):
- [x] **Database Schema (T015-T017)**: Supabase migrations with RLS and functions
- [x] **Core Data Layer (T018-T020)**: TypeScript types, validation schemas, service layer
- [x] **React Components (T021-T024)**: Template creation modal, management cards, search
- [x] **State Management (T025-T026)**: Zustand store and custom hooks  
- [x] **Integration (T027-T032)**: Georgian transcription flow, API client, error handling, caching
- [x] **Mobile Optimization (T033)**: Responsive modal with 48px touch targets, iOS optimizations
- [x] **Polish & UX (T034-T038)**: Mobile layouts, keyboard handling, loading states, delete confirmation
- [x] **Performance & Validation (T039-T049)**: All tests, accessibility audit, production build validation

**All Key Features Successfully Delivered**:
- ✅ Custom template creation and management with full CRUD operations
- ✅ Template selection integrated into Georgian transcription interface  
- ✅ AI prompt enhancement using new general Flowise endpoint
- ✅ Offline support with sync queue and error recovery
- ✅ Mobile-first responsive design with 48px touch targets
- ✅ Comprehensive error handling and loading states
- ✅ Template usage tracking and advanced statistics
- ✅ Professional deletion confirmation modals
- ✅ Mobile keyboard optimization and viewport handling
- ✅ Performance testing and accessibility compliance
- ✅ Production build validation and deployment readiness

**🎯 PROJECT STATUS: COMPLETE & PRODUCTION READY** 
All 49 tasks completed successfully. The custom report template system is fully functional and integrated into the MediMind Expert platform.

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
