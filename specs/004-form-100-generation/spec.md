# Feature Specification: Form 100 Generation for ER Consultation Reports

**Feature Branch**: `004-form-100-generation`  
**Created**: 2025-09-30  
**Status**: Draft  
**Input**: User description: "Form 100 generation feature for ER consultation reports with diagnosis dropdown and transcript input fields"

## Execution Flow (main)
```
1. Parse user description from Input
   ’  Extracted: Form 100 generation with diagnosis dropdown and transcript fields
2. Extract key concepts from description
   ’  Actors: ER cardiologists, Actions: generate Form 100, Data: ER reports + transcripts + angiography
3. For each unclear aspect:
   ’  All key aspects identified from user description and screenshots
4. Fill User Scenarios & Testing section
   ’  Clear user flow: view report ’ click generate Form 100 ’ select diagnosis ’ add inputs ’ generate
5. Generate Functional Requirements
   ’  All requirements are testable and specific
6. Identify Key Entities (if data involved)
   ’  Form 100 document, Diagnosis codes, Transcript data, Angiography reports
7. Run Review Checklist
   ’  No implementation details, focused on user value
8. Return: SUCCESS (spec ready for planning)
```

---

## ¡ Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As an ER cardiologist, after generating an ER consultation report for a cardiac patient, I need to create a standardized Form 100 document by selecting the appropriate final diagnosis and supplementing with additional clinical information (voice transcripts and angiography reports) to ensure comprehensive patient documentation for regulatory and clinical continuity requirements.

### Acceptance Scenarios
1. **Given** an existing ER consultation report with diagnosis I24.9 (acute ischemic heart disease), **When** I click the "Generate Form 100" button, **Then** I see a dropdown list of 6 specific related diagnoses to choose from
2. **Given** I have selected a diagnosis from the dropdown, **When** the input fields appear, **Then** I can record voice instructions using the same transcription interface as edit requests and enter angiography report text
3. **Given** I have filled in the doctor transcript and angiography report fields, **When** I click the generation button, **Then** the system sends the ER consult text, transcript, and angiography data to generate Form 100 content
4. **Given** I'm viewing an ER report with diagnosis I26.0 (pulmonary embolism) or I50.0 (heart failure), **When** I click "Generate Form 100", **Then** I see diagnosis options specific to that condition category
5. **Given** I select diagnosis I20.0 (unstable angina), **When** I generate Form 100, **Then** the system uses the live endpoint for processing, while other diagnoses use placeholder endpoints

### Edge Cases
- What happens when the voice transcription fails during input recording?
- How does the system handle empty angiography report fields?
- What occurs if the Flowise endpoint is unavailable during Form 100 generation?
- How does the system behave when no diagnosis is selected from the dropdown?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST display a "Generate Form 100" button on all ER consultation report cards
- **FR-002**: System MUST show a diagnosis-specific dropdown when the Form 100 button is clicked, containing 6 diagnosis options for I24.9 reports
- **FR-003**: System MUST provide diagnosis dropdowns for I26.0 (pulmonary embolism) and I50.0 (heart failure) reports with relevant diagnosis lists
- **FR-004**: System MUST open input fields after diagnosis selection: doctor transcript field with voice recording capability and angiography report text field
- **FR-005**: Doctor transcript field MUST use the same voice transcription implementation as the current edit request functionality
- **FR-006**: System MUST send three inputs to Flowise endpoint: original ER consult text, user transcript (if provided), and angiography report text
- **FR-007**: System MUST use the live Flowise endpoint for I20.0 diagnosis (unstable angina) and mock endpoints for all other diagnoses
- **FR-008**: System MUST generate Form 100 content when the generation button is clicked with completed input fields
- **FR-009**: System MUST handle the specific diagnosis list for I24.9: I20.0 (unstable angina), I21.4 (acute subendocardial MI), I20.0 (unstable angina), I21.0 (acute anterior wall MI), I20.8 (other angina forms), I21.9 (acute unspecified MI/MINOCA)
- **FR-010**: Voice recording interface MUST maintain the same UX patterns as existing transcript functionality with microphone button and real-time feedback

### Key Entities *(include if feature involves data)*
- **Form 100 Document**: Standardized medical form generated from ER consultation data, diagnosis selection, and supplementary clinical information
- **Diagnosis Code**: ICD-10 medical diagnosis codes with Georgian descriptions, organized by primary condition categories (I24.9, I26.0, I50.0)
- **ER Consultation Report**: Existing generated medical report serving as primary input for Form 100 generation
- **Doctor Transcript**: Voice-recorded clinical notes captured using the existing transcription system
- **Angiography Report**: Text-based cardiac catheterization findings and interventional procedure documentation
- **Flowise Endpoint Configuration**: External AI processing endpoint with live service for I20.0 diagnosis and mock endpoints for development/future implementation

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---