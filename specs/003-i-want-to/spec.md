# Feature Specification: Custom Report Templates for MediScribe

**Feature Branch**: `003-i-want-to`  
**Created**: 2025-09-28  
**Status**: Draft  
**Input**: User description: "I want to add the new feature to my mediscribe, i want user to be able to create their own report templates, idea is to give user ability to input the report example structure into the window wile creating the template, and that template will be used as part of the prompt when user sens the transcript text to flowise endpoint with generation request.  so i want My templates section on Templates page on the top of the Cardiologist Consults section. with the ability to create new templates on the same page by clciking add button which will open pop up window were user can name the template input the example output in the text areaalongside the notes or comments that will be also appened to the ai system prompmt when user click onn the card to generate the report"

## Execution Flow (main)
```
1. Parse user description from Input
   � Feature identified: Custom report templates for MediScribe transcription
2. Extract key concepts from description
   � Actors: Medical professionals (cardiologists)
   � Actions: Create templates, input structure examples, generate reports
   � Data: Template names, example structures, comments/notes, transcripts
   � Constraints: Integration with existing Flowise endpoint
3. For each unclear aspect:
   � [not necessaary : Template sharing/privacy permissions]
   � [no need: Template versioning and editing capabilities]
   � [no limit: Maximum template limits per user]
4. Fill User Scenarios & Testing section
   � Primary flow: Create template � Use template for report generation
5. Generate Functional Requirements
   � Template CRUD operations, UI integration, AI prompt enhancement
6. Identify Key Entities
   � Report Template, Template Categories, User Templates
7. Run Review Checklist
   � WARN "Spec has uncertainties around template management and limits"
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a cardiologist using MediScribe, I want to create custom report templates with my preferred structure and formatting so that when I generate reports from transcripts, the AI produces consistently formatted output that matches my clinical documentation style and hospital requirements.

### Acceptance Scenarios
1. **Given** I'm on the Templates page, **When** I click the "Add Template" button in the "My Templates" section, **Then** a popup window opens allowing me to create a new template
2. **Given** I'm creating a new template, **When** I enter a template name, example structure, and notes, **Then** the system saves my template and makes it available for report generation
3. **Given** I have created custom templates, **When** I generate a report from a Georgian transcript, **Then** I can select one of my templates to guide the AI's output format
4. **Given** I select a custom template for report generation, **When** the AI processes my transcript, **Then** the generated report follows my template structure and includes guidance from my template notes
5. **Given** I have multiple custom templates, **When** I view the Templates page, **Then** I see my templates displayed above the Cardiologist Consults section with clear visual distinction

### Edge Cases
- What happens when a user tries to create a template with an empty name or structure?
- How does the system handle templates with very large example structures or notes?
- What occurs if a user tries to create duplicate template names?
- How does the system behave when the Flowise endpoint is unavailable during template-guided report generation?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow users to create custom report templates with a name, example structure, and optional notes
- **FR-002**: System MUST display a "My Templates" section at the top of the Templates page, above existing Cardiologist Consults
- **FR-003**: System MUST provide an "Add Template" button that opens a popup window for template creation
- **FR-004**: System MUST include template example structure and notes in the AI prompt when generating reports using that template
- **FR-005**: System MUST save user-created templates persistently and associate them with the user account
- **FR-006**: System MUST allow users to select their custom templates when initiating report generation from transcripts
- **FR-007**: System MUST validate template names to prevent [NEEDS CLARIFICATION: duplicate names, special characters, length limits?]
- **FR-008**: System MUST handle template data with [NEEDS CLARIFICATION: maximum size limits for example structure and notes?]
- **FR-009**: Users MUST be able to [NEEDS CLARIFICATION: edit, delete, or duplicate existing templates?]
- **FR-010**: System MUST [NEEDS CLARIFICATION: share templates between users or keep them private?]
- **FR-011**: System MUST [NEEDS CLARIFICATION: provide template categories or organization features?]
- **FR-012**: System MUST maintain [NEEDS CLARIFICATION: version history or change tracking for templates?]

### Key Entities *(include if feature involves data)*
- **Report Template**: Represents a user-defined template with name, example structure text, optional notes/comments, creation date, and user association
- **Template Category**: [NEEDS CLARIFICATION: Whether templates should be categorized by medical specialty, document type, or user-defined categories]
- **User Templates Collection**: Association between users and their created templates, including usage statistics and last modified dates

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---