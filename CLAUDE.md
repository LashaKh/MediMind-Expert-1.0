# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediMind Expert is a comprehensive medical AI co-pilot platform for healthcare professionals, providing specialty-specific workspaces (Cardiology, OB/GYN) with AI chat, medical calculators, medical news aggregation, knowledge management, and case studies. Built with React 18.3.1, TypeScript, Supabase, with streaming AI responses, voice input integration, and deployed on Netlify with Supabase Edge Functions.

## Current Branch & Progress

**Branch**: `main`
**Recent Progress** (Updated: 2025-10-27):
- ✅ **ABG System Refactoring**: Major architectural overhaul with streaming support, new component structure (IdentifiedIssuesPanel, PremiumActionPlanResults), and comprehensive documentation cleanup
- ✅ **Voice Input Integration**: Direct voice recording button integrated into AI Copilot chat interface with seamless Georgian transcription workflow
- ✅ **Streaming AI Responses**: Implemented real-time streaming for AI chat, ABG analysis, and medical interpretations
- ✅ **Georgian Language Support**: Enhanced MedicalMarkdownRenderer with Georgian source detection ("წყაროები") and improved markdown formatting
- ✅ **Dual STT Model Support**: Added Fast + GoogleChirp models with localStorage persistence and model selection in Georgian transcription
- ✅ **Enhanced Message Input**: Increased AI Copilot character limit from 2,000 to 100,000 for complex medical queries
- ✅ **Form 100 System Maturation**: Session recovery with localStorage persistence, neural-gradient UI refinements
- ✅ **Safe Async Pattern**: Standardized error handling pattern across all services for robust medical data processing
- ✅ **Documentation Updates**: Comprehensive ABG system documentation (BGsystem.md), streaming implementation guides
- ✅ **Performance Optimizations**: Maintained <200ms recording start, <5 second form generation, streaming response handling

## MCP Server Configuration

### Supabase MCP (Primary Database)
**Credentials**:
- **JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2OTc3MCwiZXhwIjoyMDYzOTQ1NzcwfQ.AVWB4s6CGI2IHK4pDSU9rZym4juJ3jwCJB7YyCPKfGE`
- **Access Token**: `sbp_a1ec55956577fedbde2561bfc49f24479a5cd533`
- **Database Password**: `Dba545c5fde36242@`
- **Project ID**: `kvsqtolsjggpyvdtdpss`
- **Project URL**: `https://kvsqtolsjggpyvdtdpss.supabase.co`

**Use for**: All database operations, user profiles,  medical data, Edge Functions deployment

### Playwright MCP (Browser Testing & Error Analysis)
**Available Tools for Browser Testing and Debugging (Use Only When Explicitly Requested)**:

#### Navigation & Setup
**Local Development**: http://localhost:8888 (use this URL for all browser testing)
- `mcp__playwright__browser_navigate` - Navigate to application URLs for testing
- `mcp__playwright__browser_resize` - Test responsive design at different viewport sizes
- `mcp__playwright__browser_install` - Install browser if not available

#### User Interactions
- `mcp__playwright__browser_click` - Click buttons, links, and interactive elements
- `mcp__playwright__browser_type` - Fill forms and input fields
- `mcp__playwright__browser_select_option` - Select dropdown options
- `mcp__playwright__browser_hover` - Test hover states and interactions
- `mcp__playwright__browser_drag` - Test drag and drop functionality

#### Error Detection & Analysis
- `mcp__playwright__browser_console_messages` - **PRIMARY**: Capture JavaScript errors, warnings, and console logs
- `mcp__playwright__browser_network_requests` - Monitor API calls, failed requests, and network issues
- `mcp__playwright__browser_snapshot` - Capture DOM structure for accessibility and element analysis
- `mcp__playwright__browser_take_screenshot` - Visual evidence of UI states and issues

#### Testing Workflows
- `mcp__playwright__browser_wait_for` - Wait for elements or conditions before proceeding
- `mcp__playwright__browser_evaluate` - Execute JavaScript to test functionality
- `mcp__playwright__browser_file_upload` - Test file upload features

#### Tab Management
- `mcp__playwright__browser_tab_new` - Open new tabs for multi-window testing
- `mcp__playwright__browser_tab_select` - Switch between tabs
- `mcp__playwright__browser_tab_close` - Clean up test tabs

**Common Testing Scenarios (Use Only When User Requests Browser Testing/Debugging)**:
1. **Error Investigation**: Navigate → Console Messages → Network Requests → Screenshot
2. **Responsive Testing**: Navigate → Resize (mobile/tablet/desktop) → Screenshot → Test interactions
3. **User Flow Testing**: Navigate → Type/Click interactions → Wait for results → Validate
4. **Accessibility Audit**: Navigate → Snapshot → Evaluate → Screenshot for evidence

### Other Available MCP Servers
- **Context7**: Library documentation and code patterns  
- **Browser Tools**: Alternative browser automation (use Playwright as primary)
- **Taskmaster AI**: Project management and task tracking

### MCP Configuration Files
- **`.mcp.json`**: Primary configuration with Supabase and Playwright
- **`.mcp.json.all-three`**: Extended configuration with additional providers
- **`.mcp.json.context7-only`**: Context7-specific configuration
- **`.mcp.json.supabase-only`**: Supabase-only configuration for focused database work

### MCP Usage Guidelines
- **Playwright MCP**: Use ONLY when explicitly requested for debugging, browser testing, or error analysis. Do not use by default for development tasks.
- **Sequential Thinking MCP**: Use for debugging, troubleshooting, complex problem-solving, and detailed project planning. Avoid excessive recursive calls.
- **Information Gathering**: Use Brave Search, Puppeteer, FireCrawl when troubleshooting or searching documentation. Combine with Sequential Thinking for refined solutions.
- **Browser Tools**: Requires explicit user confirmation. User must start server and ensure Chromium is running. Disable Puppeteer before use.

## Claude Code Command System

### Available Commands
- **`/constitution`**: Create or update project constitution with principle inputs
- **`/implement`**: Execute implementation plan by processing tasks.md
- **`/plan`**: Generate comprehensive development plans and specifications
- **`/specify`**: Create detailed technical specifications
- **`/tasks`**: Manage and track development tasks
- **`/updateClaude`**: Automatically update CLAUDE.md based on recent changes
- **`/promptOptimizer`**: Optimize prompts for better AI interactions

### Command Templates & Scripts
```
.specify/
├── memory/constitution.md          # Project governance and principles
├── scripts/bash/                   # Automation scripts
│   ├── check-prerequisites.sh      # Environment validation
│   ├── common.sh                   # Shared utilities
│   ├── create-new-feature.sh       # Feature scaffolding
│   ├── setup-plan.sh              # Plan initialization
│   └── update-agent-context.sh     # Context management
└── templates/                      # Template files
    ├── agent-file-template.md
    ├── plan-template.md
    ├── spec-template.md
    └── tasks-template.md
```

## Development Commands

### Core Development
```bash
# Development with Vite hot reload
npm run dev

# Development with Netlify functions
npm run dev:netlify

# Build for production
npm run build

# Fresh build (clears all caches)
npm run build:fresh

# Preview production build locally
npm run preview
```

### Testing Suite
```bash
# Run all tests with Vitest
npm test

# Run tests with UI dashboard
npm run test:ui

# Run tests once and exit
npm run test:run

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specialized test suites
npm run test:medical        # Medical calculator tests
npm run test:search         # MediSearch component tests
npm run test:integration    # Integration tests
npm run test:e2e           # Playwright E2E tests
npm run test:performance   # Performance benchmarks
npm run test:accessibility # Accessibility compliance
```

### Code Quality & Linting
```bash
# Lint entire codebase
npm run lint

# Remove console.log statements
npm run cleanup:console

# Clean build artifacts
npm run cleanup:build

# Advanced cleanup (console + OCR imports)
npm run cleanup:advanced
```

### Production Management
```bash
# Deploy to production
npm run deploy:prod

# Production database migration (with dry-run option)
npm run migrate:prod:dry
npm run migrate:prod

# Production rollback (with dry-run option) 
npm run rollback:prod:dry
npm run rollback:prod

# Health check
npm run health:check
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18.3.1 with TypeScript, Vite build system
- **Styling**: Tailwind CSS with mobile-first responsive design
- **State**: Zustand stores + React Context for complex features
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Functions**: Supabase Edge Functions (migrated from Netlify)
- **Deployment**: Netlify with Edge Functions integration
- **Testing**: Vitest + Playwright + Testing Library

### Core Architecture Patterns

#### 1. Specialty-Specific Workspace Architecture
```
src/components/
├── Workspaces/
│   ├── CardiologyWorkspace.tsx    # Cardiology-specific features
│   └── ObGynWorkspace.tsx         # OB/GYN-specific features
```
- Users choose specialty during onboarding and cannot switch
- All features (AI chat, calculators, news) are specialty-aware
- Separate Flowise chatbot endpoints for each specialty

#### 2. Feature-Based Component Organization
```
src/components/Feature/
├── Component.tsx
├── hooks/
├── types/
├── services/
└── index.ts                      # Clean exports
```
Each major feature is self-contained with its own hooks, types, and services.

#### 3. Medical Calculator System (100% Validated)
```
src/components/Calculators/
├── Calculators.tsx               # Main calculator grid
├── [CalculatorName].tsx         # Individual calculators
└── GRACE/                       # Complex multi-step calculators
    ├── GraceFormStep1.tsx
    ├── GraceFormStep2.tsx
    └── GraceResultDisplay.tsx
```
- 16+ cardiovascular calculators with ACC/AHA compliance
- Evidence-based validation with 100% test success rate
- AI integration via `useCalculatorIntegration` hook
- Mobile-optimized with touch-friendly interfaces

#### 4. AI Integration Architecture
```
Frontend: FlowiseChatWindow → useFlowiseChat → API
Backend: Supabase Edge Functions → Specialty Flowise Endpoints
State: ChatContext → React reducers → Streaming UI Updates
Voice: VoiceInputButton → Georgian TTS → Chat Integration
```
- **Streaming Support**: Real-time streaming responses for AI chat, ABG analysis, and medical interpretations
- **Voice Input Integration**: Direct voice recording button in chat interface with Georgian transcription workflow
- **Specialty-aware Routing**: Cardiology vs OB/GYN chatbot endpoints
- **File Attachment Support**: Medical image analysis with multimodal AI processing
- **Safe Async Pattern**: Robust error handling across all AI operations
- **Case Management Integration**: Privacy protection with automatic anonymization
- **Calculator Integration**: AI-powered calculator suggestions and result sharing
- **Georgian Language Support**: Enhanced markdown rendering with source detection ("წყაროები")

#### 5. Georgian Medical Transcription System (MediScribe)
```
src/components/Georgian/
├── GeorgianSTTApp.tsx             # Main transcription interface
├── GeorgianSTTAppWrapper.tsx      # Wrapper with context providers
├── SessionHistory.tsx             # Session management UI
├── TranscriptPanel.tsx            # Transcript display and editing
├── hooks/useGeorgianTTS.ts        # Core transcription logic with optimizations
├── lib/speech/georgianTTSService.ts # Supabase Edge Function integration
└── components/                    # Specialized UI components
    ├── ContextContent.tsx
    ├── HeaderControls.tsx
    ├── TabNavigation.tsx
    └── TranscriptContent.tsx
```
- **Performance**: <200ms recording start (microphone pre-initialization)
- **Dual STT Models**: Fast model + GoogleChirp model with user-selectable switching
- **Model Persistence**: STT model selection saved to localStorage for session continuity
- **Streaming Support**: Streaming vs single-shot transcription mode selection
- **Real-time**: Live transcription with smart 23-second auto-segmentation
- **Session Management**: Cross-session isolation with unique session IDs
- **Edge Functions**: Supabase integration for Georgian speech processing
- **Mobile Optimized**: Touch-friendly recording controls for medical consultations
- **Dual Transcript Support**: Parallel transcription from Google and Enagram models

#### 6. Form 100 Generation System (Emergency Reports)
```
src/components/Form100/
├── Form100Modal.tsx               # Multi-step wizard modal
├── Form100Button.tsx              # Integration trigger button  
├── DiagnosisDropdown.tsx          # ICD-10 diagnosis selection
├── VoiceTranscriptField.tsx       # Voice recording integration
├── AngiographyReportField.tsx     # Specialized medical text field
├── hooks/                         # State management hooks
│   ├── useForm100Generation.ts    # Form generation logic
│   ├── useForm100Modal.ts         # Modal state management
│   └── useDiagnosisSelection.ts   # Diagnosis selection logic
├── config/diagnosisConfig.ts      # ICD-10 diagnosis database
├── utils/validation.ts            # Medical form validation
├── components/LoadingStates.tsx   # Progress indicators
└── styles/mobile.css              # Mobile touch optimization
```
- **Evidence-Based**: ICD-10 compliant diagnosis codes with medical literature references
- **AI-Powered**: Flowise integration for intelligent form generation from clinical data
- **Voice Integration**: Seamless connection to Georgian TTS system for transcript inclusion
- **Mobile-Optimized**: 44px touch targets, keyboard-aware layouts, medical-grade UX
- **Multi-Step Wizard**: Patient info → Clinical data → Documentation → Generation workflow
- **HIPAA Compliant**: Secure data transmission and session isolation
- **Performance**: <5 second form generation, <200ms voice recording integration
- **Medical Templates**: Pre-configured angiography and clinical report templates

#### 7. ABG Analysis System (Recent Major Refactoring)
```
src/components/ABG/
├── PremiumABGAnalysis.tsx         # Main ABG analysis interface
├── IdentifiedIssuesPanel.tsx      # Core issues extraction (NEW)
├── PremiumActionPlanResults.tsx   # AI-generated action plans (NEW)
├── PremiumABGHeader.tsx           # Enhanced header with streaming status
├── DeletionConfirmDialog.tsx      # Improved deletion workflow
├── hooks/
│   ├── useABGAnalysis.ts         # Core ABG logic
│   └── useStreamingResults.ts    # Streaming response handling (NEW)
└── services/abgService.ts        # Unified ABG processing
```
- **Streaming Architecture**: Real-time ABG interpretation results with progressive UI updates
- **Voice Input Integration**: Direct voice recording in ABG workflow for clinical notes
- **Unified Processing**: Free OCR integration with consolidated ABG analysis service
- **Component Refactoring**: New IdentifiedIssuesPanel and PremiumActionPlanResults for better separation of concerns
- **Enhanced Documentation**: Comprehensive BGsystem.md (1,381 lines) with streaming implementation guides
- **Error Handling**: Safe Async patterns for robust medical data processing
- **Mobile Optimization**: Touch-friendly ABG parameter inputs with medical-grade validation

#### 8. Mobile-First Responsive Design
```
src/styles/responsive.css         # CSS custom properties system
src/components/ui/mobile-form.tsx # Mobile form component library
src/components/Layout/BottomNavigation.tsx # Mobile navigation
```
- Touch targets minimum 44px (Apple guidelines)
- Safe area support for modern mobile devices
- Progressive enhancement from mobile to desktop

### Key Services & APIs

#### Medical Data Processing
- **Georgian Transcription**: `src/hooks/useGeorgianTTS.ts` - Real-time medical transcription with dual STT model support (Fast + GoogleChirp)
- **Speech Processing**: `src/lib/speech/georgianTTSService.ts` - Supabase Edge Function integration with streaming support
- **Form 100 Generation**: `src/services/form100Service.ts` - Emergency consultation report generation with unified Flowise endpoint and retry mechanism (3 attempts, exponential backoff)
- **Flowise Integration**: `src/services/flowiseIntegration.ts` - AI-powered medical document generation with streaming responses and Safe Async error handling
- **ABG Analysis**: `src/services/abgService.ts` - Unified blood gas analysis with free OCR, streaming interpretations, and voice input integration
- **Diagnosis Service**: `src/services/diagnosisFlowiseService.ts` - Specialty-specific diagnosis routing with updated implementation
- **Safe Async Pattern**: Standardized error handling wrapper used across all services for robust medical data processing
- **Streaming Architecture**: Real-time AI response streaming for chat, ABG analysis, and medical interpretations
- **Medical Calculators**: Validated algorithms with population-specific calibration and AI integration
- **Medical News**: Specialty-filtered news aggregation and engagement tracking

#### Document & Knowledge Management
```
Pipeline: DocumentUpload → document-upload.js → documentProcessor.js → vectorStore.js
```
- OpenAI Vector Store integration for AI-powered document search
- Support for PDF, Word, Excel, TXT, and image files
- Real-time progress tracking with `useDocumentProgress`

#### Authentication & Security
- Supabase Auth with specialty selection during onboarding
- Row Level Security on all database tables
- HIPAA-compliant session management
- Medical data anonymization in case management

### Database Schema (Key Tables)
```sql
-- User management with specialty tracking
profiles (id, specialty, created_at)

-- Georgian transcription sessions with cross-session isolation
georgian_sessions (id, user_id, title, transcript, processing_results, created_at, session_id)

-- Medical news with specialty filtering  
medical_news (specialty, category, evidence_level, engagement_score)

-- Knowledge base with vector embeddings
user_documents (user_id, openai_file_id, processing_status)
user_vector_stores (user_id, openai_vector_store_id)

-- Case management with privacy protection
user_cases (user_id, title, description, is_active)

-- Performance monitoring
liked_search_results, clinical_trials_monitoring
```

## Key Development Guidelines

### Medical Calculator Development
1. **Validation First**: Achieve 100% test success before deployment
2. **Evidence-Based**: All algorithms must reference medical literature  
3. **Population-Specific**: Include demographic calibration factors
4. **Conservative Bias**: Err on side of patient safety
5. **Mobile Optimization**: Touch-friendly with responsive validation

### Georgian Transcription Development
1. **Performance Optimization**: Maintain <200ms recording start time with microphone pre-initialization
2. **Dual STT Model Support**: Implement Fast model + GoogleChirp model with user-selectable switching
3. **Model Persistence**: Save STT model selection to localStorage for session continuity
4. **Session Isolation**: Use unique session IDs to prevent transcript contamination
5. **Real-time Processing**: Implement smart 23-second auto-segmentation for continuous recording
6. **Streaming Mode Selection**: Support both streaming and single-shot transcription modes
7. **Error Handling**: Use `safeAsync` patterns for robust microphone and API handling
8. **Mobile-First**: Touch-friendly controls optimized for bedside medical consultations

### AI Integration Patterns
1. **Streaming First**: Implement real-time streaming for all AI responses with progressive rendering
2. **Specialty Awareness**: Always route to appropriate medical chatbot (Cardiology vs OB/GYN)
3. **Voice Input Integration**: Support voice recording with Georgian transcription workflow
4. **Safe Async Error Handling**: Use standardized error handling wrapper for all AI operations
5. **Context Enhancement**: Include relevant case/document context in AI queries
6. **File Processing**: Support medical image attachments with multimodal AI processing
7. **Privacy First**: Automatic anonymization of patient data in case management
8. **Calculator Integration**: Suggest relevant calculators in chat with AI-powered recommendations
9. **Georgian Language Support**: Handle Georgian source detection and markdown formatting

### Testing Strategy
1. **Standard Testing**: Use Vitest, npm test commands, and code analysis for primary testing
2. **Playwright MCP**: Use ONLY when explicitly requested for browser testing, debugging, or error analysis
3. **Console Error Analysis**: When user reports browser issues, then use Playwright to capture JavaScript errors
4. **Responsive Testing**: Use Playwright testing only when specifically requested at 320px, 768px, 1024px breakpoints
5. **Medical Accuracy**: Validate all clinical calculations through unit tests
6. **Cross-Device**: Ensure consistency through code review and standard testing practices

### Mobile-First Development
1. **Touch Targets**: Minimum 44px for medical professional use
2. **Progressive Enhancement**: Build mobile-first, enhance for desktop
3. **Safe Areas**: Support notches and home indicators
4. **Performance**: Optimize for bedside mobile use cases
5. **Clinical Workflows**: Seamless transition between devices
6. **Mobile Responsiveness**: Comprehensive viewport testing at 320px, 375px, and 414px breakpoints
7. **Keyboard Interactions**: Mobile keyboard-aware layout management with viewport height constraints

### Database Operations
- Use Supabase MCP for all database interactions
- Test Edge Functions through direct API calls and unit tests
- Use browser automation ONLY when explicitly requested for debugging
- Monitor real-time subscriptions and data updates
- Execute `supabase_setup_safe.sql` before user testing
- Maintain Row Level Security on all tables

### Code Quality Standards
- Follow React 18.3.1 patterns and TypeScript strict mode
- Maintain component modularity with feature-based organization
- Ensure WCAG accessibility compliance for medical professionals
- Mobile-first CSS with Tailwind utilities
- Comprehensive error handling with `safeAsync` patterns

## Recent Updates (Updated: 2025-10-27)

### ABG System Refactoring (October 26, 2025)
- **Component Architecture Overhaul**: Major restructuring with new `IdentifiedIssuesPanel.tsx` and `PremiumActionPlanResults.tsx` for improved separation of concerns
- **Streaming Integration**: Real-time streaming ABG interpretation results with progressive UI updates
- **Voice Input Integration**: Direct voice recording button integrated into ABG workflow for clinical notes
- **Unified Service Processing**: Consolidated ABG analysis service with free OCR integration
- **Documentation Cleanup**: Removed 10+ obsolete documentation files and added comprehensive `docs/BGsystem.md` (1,381 lines)
- **Enhanced Header**: Updated `PremiumABGHeader.tsx` with streaming status indicators
- **Improved Workflows**: New `DeletionConfirmDialog.tsx` for better user confirmation patterns

### AI Copilot Enhancements
- **Voice Input Integration**: Added `VoiceInputButton.tsx` directly in chat interface for seamless Georgian transcription workflow
- **Streaming Response Handling**: Implemented real-time streaming for all AI chat responses with progressive rendering
- **Georgian Language Support**: Enhanced `MedicalMarkdownRenderer.tsx` with Georgian source detection ("წყაროები") and improved markdown formatting
- **Message Input Expansion**: Increased character limit from 2,000 to 100,000 for complex medical queries and case documentation
- **Safe Async Pattern**: Standardized error handling across all AI operations for robust medical data processing

### Georgian Transcription System Improvements
- **Dual STT Model Support**: Added Fast model + GoogleChirp model with user-selectable switching in UI
- **Model Persistence**: STT model selection automatically saved to localStorage for session continuity
- **Streaming Mode Selection**: User can toggle between streaming and single-shot transcription modes
- **Dual Transcript Support**: Parallel transcription from Google and Enagram models for accuracy comparison
- **Enhanced Session Management**: Improved cross-session isolation with unique session IDs

### Form 100 System Maturation
- **Session Recovery**: Implemented localStorage persistence for form state recovery after browser refresh
- **Neural-Gradient UI**: Refined premium UI with glassmorphism effects and medical-grade animations
- **Translation Updates**: Enhanced Georgian, English, and Russian translations for medical terminology
- **Unified Endpoint**: Consolidated Flowise integration with single endpoint and retry mechanism (3 attempts, exponential backoff)

### Development Infrastructure
- **Safe Async Pattern**: Standardized error handling wrapper implemented across all services (form100Service, flowiseIntegration, abgService)
- **Streaming Architecture**: Consistent streaming implementation across ChatContext, ABG components, and AI integrations
- **STT Language Mapper**: New utility for language code mapping in speech processing
- **Edge Function Updates**: Enhanced Supabase Edge Functions for action plan processing and streaming support
- **Comprehensive Documentation**: Added streaming implementation guides and architectural documentation

## Critical Architecture Patterns

### Safe Async Pattern
Standardized error handling wrapper used across all medical services for robust data processing:
```typescript
const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorCode: string
): Promise<ServiceResponse<T>> => {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};
```
- **Implementation**: Used in form100Service, flowiseIntegration, abgService, and all Edge Function integrations
- **Error Codes**: Standardized taxonomy (VALIDATION_FAILED, FLOWISE_TIMEOUT, NETWORK_ERROR, etc.)
- **Type Safety**: Full TypeScript support with generic return types
- **Medical Safety**: Ensures all medical data operations have consistent error recovery patterns

### Streaming Response Pattern
Progressive rendering of AI responses for real-time user feedback:
- **ChatContext Integration**: React reducers manage streaming state with UPDATE_STREAMING_MESSAGE actions
- **ABG Analysis**: Real-time interpretation results with progressive UI updates in IdentifiedIssuesPanel
- **Voice Input**: Streaming transcription updates with onLiveTranscriptUpdate callbacks
- **Error Recovery**: Graceful handling of streaming interruptions with retry logic
- **Performance**: Non-blocking rendering maintains responsive UI during long AI responses

### Georgian Transcription Performance Optimizations
- **Microphone Pre-initialization**: `preInitializeMicrophone()` in `useGeorgianTTS.ts` eliminates 2-3 second recording delays
- **Smart Segmentation**: Automatic 23-second chunks with seamless continuation for long recordings
- **Session Isolation**: Unique session IDs prevent transcript contamination across recordings
- **Background Processing**: Non-blocking audio processing maintains responsive UI
- **Dual STT Models**: Fast model + GoogleChirp model with user-selectable switching and localStorage persistence

### Component State Management
- **Local Transcript State**: GeorgianSTTApp maintains local transcript state separate from session management
- **Real-time Updates**: `onLiveTranscriptUpdate` callback provides session-aware updates
- **Streaming State Handling**: ChatContext and ABG components manage progressive streaming updates with React reducers
- **Voice Input State**: Integrated voice recording state across AI Copilot and ABG workflows
- **STT Model Persistence**: localStorage integration for user-selected STT model preferences (Fast vs GoogleChirp)
- **Cross-Component Communication**: Props drilling with TypeScript interfaces for type safety
- **Async Operation State**: Safe Async pattern ensures consistent error handling across all medical data operations

### Edge Function Integration
- **Supabase Edge Functions**: `georgian-tts-proxy` handles speech processing with authentication
- **Error Recovery**: Graceful fallback patterns for network/API failures
- **Token Management**: Fresh authentication for reliable processing

### Build & Deployment
- Always run cleanup commands before production builds
- Test serverless functions thoroughly before deployment
- Validate Edge Function performance and error handling
- Monitor build sizes and performance metrics
- Verify mobile optimization in production builds
```
- do not use playwrite unless requested
