
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

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
[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context
**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Medical Safety & Compliance**: All medical calculations, algorithms, and clinical data MUST achieve 100% validation before deployment. Evidence-based validation with published medical literature references required.

**Mobile-First Medical Interface**: Touch targets MUST meet 44px minimum for medical professional use. Progressive enhancement from mobile to desktop ensures bedside usability.

**Performance & Reliability**: Recording start times MUST remain under 200ms. Session isolation MUST prevent transcript contamination. Real-time processing with smart auto-segmentation required.

**Security & Privacy**: Row Level Security MUST be enforced on all database tables. Medical data anonymization mandatory in case management. HIPAA-compliant session management required.

**Testing & Validation (TDD Mandatory)**: Tests written → User approved → Tests fail → Then implement. Medical calculator tests must achieve 100% success rate before deployment.

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

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

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
The /tasks command will generate a comprehensive, ordered task list following TDD principles:

1. **Infrastructure Setup Tasks** (5 tasks):
   - Performance monitoring service implementation
   - Device capability detection utility
   - LocalStorage persistence layer
   - Performance Observer API integration
   - Web Vitals library integration

2. **React Optimization Tasks** (15 tasks):
   - Apply React.memo to high-priority components (P0: calculators, chat, transcription)
   - Implement useCallback for event handlers in context providers
   - Add useMemo for expensive medical calculations
   - Split Context providers (Auth, Chat, Specialty)
   - Optimize list rendering with virtualization

3. **Bundle Optimization Tasks** (10 tasks):
   - Implement route-based lazy loading for major features
   - Create dynamic imports for PDF export, OCR, Analytics
   - Optimize Vite configuration with enhanced manualChunks
   - Replace heavy libraries (html2canvas, jsPDF alternatives)
   - Enable Terser dead code elimination

4. **CSS Performance Tasks** (5 tasks):
   - Implement GPU detection utility
   - Create CSS fallback stylesheets
   - Apply performance mode classes
   - Optimize animation performance
   - Test backdrop-filter fallbacks

5. **Real-time Optimization Tasks** (5 tasks):
   - Implement connection pooling for Supabase channels
   - Add visibility-based throttling
   - Optimize analytics update frequency
   - Add cleanup patterns for subscriptions
   - Test real-time CPU usage

6. **Testing & Validation Tasks** (10 tasks):
   - Write contract tests for performance APIs (4 endpoints)
   - Create performance benchmark tests
   - Implement visual regression tests
   - Validate medical calculator accuracy (100% pass)
   - Execute quickstart validation scenarios

**Ordering Strategy**:
- **Phase 3A**: Infrastructure (Tasks 1-5) - Serial execution
- **Phase 3B**: React optimization (Tasks 6-20) - [P] Parallel by component
- **Phase 3C**: Bundle optimization (Tasks 21-30) - Serial (build config changes)
- **Phase 3D**: CSS/Real-time (Tasks 31-40) - [P] Parallel by feature
- **Phase 3E**: Testing validation (Tasks 41-50) - Serial (validates previous phases)

**Estimated Output**: 50 numbered, ordered tasks in tasks.md with TDD structure

**Task Template**:
```
Task #: [Task Name]
Priority: [P0/P1/P2]
Parallel: [Yes/No]
Dependencies: [Task #s]
Validation: [Test that must pass]
```

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
- [x] Phase 2: Task planning approach described (/plan command)
- [x] Phase 3: Tasks generated (/tasks command) - 45 tasks created
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (NONE - additive optimization only)

**Artifacts Generated**:
- [x] research.md - Technical decisions and best practices
- [x] data-model.md - Performance metrics and device capability entities
- [x] contracts/README.md - API contract specifications summary
- [x] quickstart.md - Validation scenarios and test execution
- [x] CLAUDE.md - Updated agent context
- [x] tasks.md - 45 implementation tasks with dependencies and parallel execution guide

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
