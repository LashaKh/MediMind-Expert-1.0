<!--
Sync Impact Report:
Version change: Template → 1.0.0 (Initial constitution for MediMind Expert)
Added sections:
- Medical Safety & Compliance (Healthcare-specific governance)
- Mobile-First Development (Touch-optimized medical interface standards)
- Performance & Reliability (Clinical-grade availability requirements)
- Security & Privacy (HIPAA compliance and medical data protection)
- Testing & Validation (Evidence-based medical accuracy requirements)
Templates requiring updates:
- ✅ plan-template.md: Constitution check references updated
- ✅ spec-template.md: Medical compliance requirements aligned
- ✅ tasks-template.md: TDD and validation task patterns confirmed
Follow-up TODOs: None - all placeholders filled
-->

# MediMind Expert Constitution

## Core Principles

### I. Medical Safety & Compliance (NON-NEGOTIABLE)
All medical calculations, algorithms, and clinical data MUST achieve 100% validation before deployment. Every calculator requires evidence-based validation with published medical literature references. All patient safety considerations take absolute precedence over development speed or feature convenience. Clinical accuracy is non-negotiable.

*Rationale: Healthcare applications directly impact patient outcomes. Incorrect medical calculations or advice can cause patient harm, making accuracy the paramount concern above all other development considerations.*

### II. Mobile-First Medical Interface
Touch targets MUST meet 44px minimum for medical professional use in clinical environments. Progressive enhancement from mobile to desktop ensures bedside usability. All interfaces must support safe areas for modern devices and maintain clinical workflow continuity across device transitions.

*Rationale: Medical professionals frequently use mobile devices during patient consultations, rounds, and emergency situations. Interface design must accommodate gloved hands, quick access patterns, and varying lighting conditions in clinical settings.*

### III. Performance & Reliability
Recording start times MUST remain under 200ms through microphone pre-initialization. Session isolation MUST prevent transcript contamination across users. Real-time processing with smart auto-segmentation ensures continuous operation during medical consultations without interruption.

*Rationale: Clinical workflows cannot tolerate delays or errors. Medical transcription systems must provide instant responsiveness and reliable session management to support time-critical medical documentation and decision-making.*

### IV. Security & Privacy
Row Level Security MUST be enforced on all database tables. Medical data anonymization is mandatory in case management. HIPAA-compliant session management and medical data protection standards must be maintained throughout the application architecture.

*Rationale: Medical applications handle protected health information (PHI) requiring strict compliance with healthcare privacy regulations. Any security breach could result in legal liability and compromise patient confidentiality.*

### V. Testing & Validation (TDD Mandatory)
Test-Driven Development is strictly enforced: Tests written → User approved → Tests fail → Then implement. Medical calculator tests must achieve 100% success rate before deployment. Evidence-based validation with published literature references required for all clinical algorithms.

*Rationale: Medical applications require higher testing standards than typical software due to patient safety implications. TDD ensures comprehensive coverage and validates clinical accuracy before implementation.*

## Medical Standards

### Evidence-Based Development
All medical calculators must reference published medical literature from peer-reviewed sources. Population-specific calibration factors must be included for demographic accuracy. Conservative bias required - err on side of patient safety in all clinical calculations and recommendations.

### Specialty Awareness
Users choose medical specialty during onboarding and cannot switch specialties. All features (AI chat, calculators, news) must be specialty-aware with appropriate routing to Cardiology vs OB/GYN specific implementations and content.

### Clinical Workflow Integration
Georgian medical transcription system with real-time processing and 23-second auto-segmentation. Cross-session isolation with unique session IDs prevents transcript contamination. Supabase Edge Functions integration for reliable speech processing with robust error recovery patterns.

## Development Workflow

### Architecture Compliance
Feature-based component organization with self-contained hooks, types, and services. Zustand stores + React Context for complex state management. Supabase PostgreSQL with Row Level Security for all data operations. Mobile-first responsive design with touch-friendly interfaces.

### Code Quality Gates
React 18.3.1 patterns with TypeScript strict mode mandatory. WCAG accessibility compliance for medical professionals. Comprehensive error handling with `safeAsync` patterns. Mobile-first CSS with Tailwind utilities and progressive enhancement.

### Testing Requirements
Playwright MCP primary for browser testing and error analysis. Console messages captured first for JavaScript error detection. Responsive testing at 320px, 768px, 1024px breakpoints. Medical accuracy validation for all clinical calculations. Cross-device consistency verification.

## Governance

### Amendment Process
Constitution supersedes all other development practices. Any amendments require documentation in this file with version increment, approval by medical advisory stakeholders, and migration plan for existing code compliance.

### Version Control
Changes increment version according to semantic versioning: MAJOR for backward incompatible safety/compliance changes, MINOR for new medical standards or development principles, PATCH for clarifications and non-semantic improvements.

### Compliance Review
All pull requests must verify compliance with medical safety principles. Development complexity must be justified against patient safety benefits. Clinical accuracy takes precedence over code simplicity when medical outcomes are at stake.

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21