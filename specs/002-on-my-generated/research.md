# Research: MediScribe Interactive Report Editing

## Technical Research Findings

### Existing Georgian TTS Integration
**Decision**: Reuse existing useGeorgianTTS hook with STT3 model (Fast option)
**Rationale**: 
- Already optimized for <200ms recording start via microphone pre-initialization
- Handles session isolation and medical transcription workflows
- Uses Supabase Edge Function (georgian-tts-proxy) for reliable processing
- No need to specify TTS model - defaults to STT3 when no model specified

**Integration Points**:
- Hook: `src/hooks/useGeorgianTTS.ts`
- Service: `src/lib/speech/georgianTTSService.ts` 
- Edge Function: `georgian-tts-proxy` on Supabase

### Flowise Endpoint Architecture
**Decision**: Route edit instructions through same Flowise endpoints that generated original reports
**Rationale**:
- Maintains context consistency for AI-powered report updates
- Existing medical AI chat system provides proven reliability
- Specialty-aware routing (Cardiology vs OB/GYN) already implemented

**Integration Points**:
- Chat context: `src/contexts/ChatContext.tsx`
- Flowise service: `src/components/AICopilot/FlowiseChatWindow.tsx`
- Medical analysis cards: `src/components/Georgian/components/MedicalAnalysisCard.tsx`

### Report Editing UI Patterns
**Decision**: Extend existing MedicalAnalysisCard with expandable editing interface
**Rationale**:
- Cards already support expand/collapse functionality
- Medical iconography and blue theme established
- Touch-friendly button design (44px minimum) already implemented

**Component Architecture**:
- Base: `MedicalAnalysisCard.tsx` with expand functionality
- New: Edit instruction input area (text + voice)
- New: Direct report text editing capability
- Existing: Copy, download, share, delete actions

### State Management Strategy
**Decision**: Extend existing Zustand stores with report editing state
**Rationale**:
- Medical transcription already uses Zustand for session management
- Real-time updates for voice transcription well-established
- Version history tracking needs persistent state

**State Structure**:
- Report versions and edit history
- Current editing session state
- Voice transcription integration status
- AI processing progress indicators

### Mobile-First Responsive Design
**Decision**: Follow established 44px touch target patterns
**Rationale**: 
- Medical professional use requires glove-friendly interfaces
- Existing components already mobile-optimized
- Progressive enhancement from mobile to desktop established

**Design Consistency**:
- Blue medical theme throughout
- Icon patterns (Lucide icons)
- Responsive breakpoints (320px, 768px, 1024px)
- Safe area support for modern devices

### Database Schema Requirements
**Decision**: Extend georgian_sessions table or create report_edits table
**Rationale**:
- Leverage existing session isolation patterns
- Maintain HIPAA compliance with Row Level Security
- Support version history and audit trails

**Schema Options**:
1. Extend georgian_sessions with edit_history JSON column
2. New report_edits table with foreign key to sessions
3. Hybrid approach with both session data and dedicated edit tracking

### Performance Optimization
**Decision**: Apply existing microphone pre-initialization patterns to edit voice input
**Rationale**:
- <200ms recording start requirement must be maintained
- Real-time feedback during AI processing established
- Smart segmentation (23-second chunks) proven effective

**Optimization Strategies**:
- Reuse microphone pre-initialization from useGeorgianTTS
- Implement debounced text instruction processing
- Progressive loading for report edit interface
- Optimistic UI updates with rollback on error

## Architecture Patterns Selected

### Component Composition
- **ReportEditCard**: Extends MedicalAnalysisCard with edit capabilities
- **EditInstructionInput**: Dual text/voice input component
- **ReportTextEditor**: Direct text editing with medical formatting
- **EditHistoryPanel**: Version control and change tracking

### Hook Integration
- **useReportEditing**: Orchestrates edit operations and state
- **useGeorgianTTS**: Existing voice transcription (no changes needed)
- **useFlowiseChat**: Existing AI integration (extend for edit instructions)

### Data Flow
1. User expands report card → Load edit interface
2. User inputs instruction (text/voice) → Process via existing TTS/Flowise
3. AI generates update → Merge with existing report content
4. User saves changes → Update database with version tracking
5. Manual edits → Direct text modification with auto-save

## Risk Mitigation

### Medical Accuracy
- Validate AI edits against existing report structure
- Preserve medical codes and formatting
- Maintain evidence-based content standards
- Implement medical terminology consistency checks

### Session Isolation
- Extend existing session ID patterns to edit operations
- Prevent edit contamination across user sessions
- Maintain separate edit history per report/session

### Performance Constraints
- Monitor voice transcription latency (<200ms start requirement)
- Implement progressive loading for large reports
- Cache common edit instruction patterns
- Optimize AI processing with request batching

### Error Recovery
- Rollback mechanisms for failed AI updates
- Manual edit preservation during system errors
- Voice transcription fallback options
- Network failure handling with offline edit capability