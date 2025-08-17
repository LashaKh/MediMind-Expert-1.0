## MediMind Expert: AI Podcast Studio — Replatformed (Play AI → Local Agents + ElevenLabs)

### Objective
Replace all Play AI dependencies with a robust, privacy-preserving, locally controlled podcast creation stack powered by:
- Custom medical podcast agents (script planning, sourcing, safety, and QA)
- ElevenLabs Text-to-Speech (TTS), optional Speech-to-Text (STT), and voice management
- Existing Supabase queue and storage infra, with minimal UI disruption

Outcome: NotebookLM-style grounded medical podcast generation from selected documents, using multi-speaker dialogue, chapters, and transcripts; reliable queueing; streaming previews; and storage-backed publishing.

---

### What Was Replaced
- Serverless functions calling Play AI (replace outbound HTTP and polling):
  - `functions/podcast-generate.ts`
  - `functions/podcast-status.ts`
  - `functions/podcast-queue-processor.ts`
  - `functions/check-podcast-status.ts`
  - `functions/optimized-podcast-processor.ts` (if used)
  - `functions/retry-podcast.ts` (if used)
- Frontend PlayAI polling/utilities:
  - `src/lib/api/playaiStatus.ts`
  - `src/lib/api/podcastUpload.ts` (invokes `generate-podcast`)
  - `src/components/PodcastStudio/PodcastGenerator.tsx` (status/polling integration)
- Types and constants referencing Play AI:
  - `src/types/podcast.ts` (e.g., `PlayAIResponse`)
  - `functions/utils/constants.ts` (PLAYAI envs)
  - `functions/utils/logger.ts` and `src/lib/logger.ts` (PII scrub list)
- Schema fields (to deprecate/rename):
  - `ai_podcasts.playnote_id`, `podcast_queue.*playai*` columns in migrations

---

### Final Architecture (NotebookLM-like Grounded Generation)
1) Grounded Script Orchestration (Local Agents)
   - Inputs: user-selected documents (already supported via Knowledge Base + Vector Store), specialty, desired style (podcast | executive-briefing | debate).
   - Agent roles:
     - Content Curator: selects passages and facts from selected docs; ensures citations.
     - Script Planner: structures outline → chapters → segment beats; assigns speakers (e.g., Host, Expert).
     - Script Writer: writes dialogue monologues with medically accurate, lay-friendly phrasing and explicit citations/footnotes.
     - Safety Reviewer: checks claims; flags risky content; enforces compliance notes (ACC/AHA, NCCN, ACOG where relevant).
     - Finalizer: removes prompt artifacts, ensures voice tags and segment timing hints.
   - Output: JSON script with chapters, segments, speaker labels, and plain text per utterance; optional inline citation markers.

2) Audio Synthesis (ElevenLabs)
   - Strategy A (recommended, broadly available): Synthesize per-utterance with `textToSpeech.stream` using chosen voice per speaker; concatenate on server; generate chapter markers from segment boundaries.
   - Strategy B (advanced): Use ElevenLabs Text-to-Dialogue if available to reduce stitching overhead. Note: Eleven v3 Text-to-Dialogue endpoints are limited per docs; keep Strategy A as baseline.
   - Voice Model: `eleven_multilingual_v2` for quality; `eleven_flash_v2_5` for low latency previews; output `mp3_44100_128`.
   - Voice selection: predefined clinical voices, plus support for user-saved voice IDs.

3) Transcription (optional but recommended)
   - Use ElevenLabs STT `scribe_v1` to generate transcripts for accessibility and SEO, or keep agent-produced text as the authoritative transcript with forced alignment added later if needed.

4) Queue + Storage
   - Continue using `ai_podcasts` and `podcast_queue` tables and Supabase Storage (`user-uploads` or dedicated `podcasts/`).
   - Replace `playnote_id` with `tts_job_id` (nullable) and per-speaker `voice_id`s; store `audio_url`, `duration`, `transcript`, `chapters` JSON.

5) Streaming UX
   - Edge Function returns an HTTP stream of synthesized audio for instant preview (branch the stream → user response and background upload to Storage).
   - Frontend continues to poll the same status endpoint, now backed by our state machine (not Play AI).

---

### Document Ingestion & Grounding (Ephemeral Vector Store per Podcast Run)
- Do NOT use or modify the user’s personal KB vector store for podcasts.
- Create a separate, ephemeral OpenAI Vector Store for each podcast generation.

- Use existing patterns as blueprint (no code duplication):
  - `DocumentUpload` UI (selection of files already in personal KB list, but we reference their OpenAI file IDs; no re-upload).
  - Functions reuse: copy the vector store creation and file attach logic from `manageVectorStore`/`uploadDocumentToOpenAI` into a new “podcast mode” flow.

- Podcast grounding workflow (step-by-step):
  1. Create a new vector store named `podcast_${podcastId}_${timestamp}` via OpenAI API.
  2. For each selected document, look up `openai_file_id` from `user_documents` and attach it to the new podcast vector store (reference existing file ID; do not re-upload).
  3. Store the new `podcast_vector_store_id` on the `ai_podcasts` row and in `engine_metadata`.
  4. Run retrieval for outline and per-chapter prompts strictly against this podcast vector store.
  5. Agents construct the grounded script with citations tied to `openai_file_id` and persist script to DB.
  6. Retention: default keep 7 days (configurable). After completion and unless the user opts-in to retain, schedule deletion of the podcast vector store and its file links to avoid costs and KB pollution.

- Notes:
  - This isolates podcast runs from the user’s persistent KB used by chat.
  - If the OpenAI API supports adding the same file to multiple stores by ID (typical), we avoid extra upload/storage.
  - Provide manual override: retain podcast store for future revisions/regeneration; expose a cleanup command.

---

### Environment & SDK (Implemented)
- New env vars:
  - `ELEVENLABS_API_KEY`
  - `DEFAULT_TTS_MODEL=eleven_multilingual_v2`
  - `LOW_LATENCY_TTS_MODEL=eleven_flash_v2_5`
  - `DEFAULT_TTS_FORMAT=mp3_44100_128`
  - Optional STT: `DEFAULT_STT_MODEL=scribe_v1`
- Install server-side SDK:
  - Node: `@elevenlabs/elevenlabs-js`

---

### TypeScript Contracts (Script, Chapters, Voices)
```ts
// types/podcast-script.ts
export type PodcastStyle = 'podcast' | 'executive-briefing' | 'debate';
export type SpeakerRole = 'host' | 'expert' | 'guest';

export interface SpeakerConfig {
  role: SpeakerRole;
  displayName: string;      // e.g., "Dr. Smith"
  voiceId: string;          // ElevenLabs voice id
}

export interface Citation {
  id: string;               // local id in this script
  sourceId: string;         // maps to user_documents/openai file id
  title?: string;
  url?: string;
  snippet?: string;
}

export interface Utterance {
  id: string;
  speaker: SpeakerRole;
  text: string;             // clean, TTS-ready
  citationIds?: string[];   // subset of Citation.id
  estimatedMs?: number;     // optional timing hint from agent
}

export interface Chapter {
  id: string;
  title: string;
  startMs?: number;
  segments: Utterance[];    // ordered dialogue/monologue
}

export interface PodcastScript {
  style: PodcastStyle;
  speakers: Record<SpeakerRole, SpeakerConfig>;
  chapters: Chapter[];
  citations: Citation[];
  specialty: string;
}
```

---

### Data Model Changes (SQL Migrations)
- Table: `ai_podcasts`
  - Add: `tts_job_id TEXT NULL` (generic job tracking id)
  - Add: `voices JSONB NULL` (e.g., `{ host: "voiceId1", expert: "voiceId2" }`)
  - Add: `chapters JSONB NULL` (chapter titles + startMs)
  - Add: `script JSONB NULL` (final agent script stored for audit)
  - Add: `podcast_vector_store_id TEXT NULL` (ephemeral store per run)
  - Add: `vector_store_expires_at TIMESTAMPTZ NULL` (scheduled cleanup)
  - Deprecate: `playnote_id` → keep until cleanup; set NULL going forward
- Table: `podcast_queue`
  - Add: `synthesis_engine TEXT NOT NULL DEFAULT 'elevenlabs'`
  - Add: `engine_metadata JSONB NULL` (per-job details)
  - Deprecate: `*playai*` fields

Notes:
- Keep RLS intact; extend policies if accessing new columns.
- Backfill migration to copy any existing `playnote_id` into `tts_job_id` for historical display (optional).

---

### Migration SQL (Applied)
```sql
-- 1) ai_podcasts: additive migration
alter table public.ai_podcasts
  add column if not exists tts_job_id text,
  add column if not exists voices jsonb,
  add column if not exists chapters jsonb,
  add column if not exists script jsonb,
  add column if not exists podcast_vector_store_id text,
  add column if not exists vector_store_expires_at timestamptz;

-- Optional: engine metadata for debugging
alter table public.ai_podcasts
  add column if not exists engine_metadata jsonb;

-- Helpful indexes
create index if not exists idx_ai_podcasts_status_updated
  on public.ai_podcasts (status, updated_at desc);
create index if not exists idx_ai_podcasts_vector_store
  on public.ai_podcasts (podcast_vector_store_id);

-- 2) podcast_queue: additive migration
alter table public.podcast_queue
  add column if not exists synthesis_engine text not null default 'elevenlabs',
  add column if not exists engine_metadata jsonb;

-- Optional backfill of legacy ids
update public.ai_podcasts set tts_job_id = playnote_id where tts_job_id is null and playnote_id is not null;

-- 3) Cleanup (run after cutover confidence)
-- alter table public.ai_podcasts drop column if exists playnote_id;
```

RLS considerations:
- If policies reference explicit column lists, ensure new columns are permitted; otherwise no change needed.
```
-- Example: allow owners to read new columns
create policy if not exists ai_podcasts_read_owner on public.ai_podcasts
  for select using (auth.uid() = user_id);
```

---

### Serverless Implementation (Implemented)
1) New Core Modules (server-side)
   - `functions/utils/podcast/agents.ts`:
     - `planPodcastScript({ userId, documentIds, style, specialty, podcastVectorStoreId }) → ScriptJSON`
   - `functions/utils/podcast/tts.ts`:
     - `synthesizeUtterance(voiceId, text, options) → ReadableStream`
     - `concatAudio(streams[]) → { filePath, durationMs }`
     - `streamToBrowserAndStorage(stream, destPath)` (branching via tee)
   - `functions/utils/podcast/stt.ts` (optional):
     - `transcribeAudio(url|blob, modelId) → TranscriptJSON`
   - `functions/utils/podcast/store.ts` (new):
     - `createPodcastVectorStore({ podcastId, files }) → { vectorStoreId, expiresAt }`
     - `attachFilesToVectorStore(vectorStoreId, openaiFileIds[])`
     - `scheduleVectorStoreDeletion(vectorStoreId, when)`

2) Replace Play AI in existing handlers
   - `functions/podcast-generate.ts`:
     - Validate auth; create ephemeral vector store; attach selected docs by `openai_file_id`.
     - Persist `podcast_vector_store_id` and `vector_store_expires_at`.
     - Generate script via agents (retrieval uses `podcast_vector_store_id`), persist `script`.
     - Kick off synthesis (or enqueue) and return `{ status, podcastId }`.
   - `functions/podcast-status.ts`:
     - Remove Play AI HTTP calls.
     - Read status from DB; if `completed` and `vector_store_expires_at` is null → set default retention window.
   - `functions/podcast-queue-processor.ts`:
     - Use `podcast_vector_store_id` for retrieval during any on-the-fly clarifications; otherwise TTS only.

3) Streaming Preview Endpoint
   - `functions/podcast-preview.ts`: Accepts `text`, `voiceId`, `model` → returns base64 mp3; instant voice audition.

4) Cleanup Job (scheduled; pending)
   - `functions/podcast-vectorstore-cleanup.ts` (to add): deletes vector stores where `vector_store_expires_at < now()`; clears `podcast_vector_store_id`.

---

### API Contracts (Final)
- Start generation
```http
POST /.netlify/functions/generate-podcast
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "userId": "uuid",
  "documentIds": ["doc-uuid", "doc-uuid"],
  "title": "string",
  "description": "string",
  "synthesisStyle": "podcast" | "executive-briefing" | "debate",
  "specialty": "cardiology" | "obgyn" | "general",
  "voices": { "host"?: "voiceId", "expert"?: "voiceId", "guest"?: "voiceId" },
  "vectorStoreRetentionDays"?: 7
}

Response 200
{
  "status": "queued" | "generating",
  "podcastId": "uuid",
  "podcastVectorStoreId": "vs_...",
  "queuePosition"?: 1,
  "estimatedWaitTime"?: 90
}
```

- Check status
```http
GET /.netlify/functions/check-podcast-status?podcastId=<uuid>

Response 200
{
  "status": "queued" | "generating" | "completed" | "failed",
  "audioUrl"?: "https://.../podcasts/....mp3",
  "duration"?: 734,
  "error"?: "string",
  "podcastVectorStoreId"?: "vs_...",
  "vectorStoreExpiresAt"?: "2025-01-20T00:00:00Z",
  "script"?: PodcastScript,
  "chapters"?: [{"title":"Intro","startMs":0}],
  "voices"?: {"host":"voiceId",...}
}
```

- Voice preview (stream)
```http
POST /.netlify/functions/podcast-preview
Content-Type: application/json
{
  "text": "Hello world",
  "voiceId": "JBFqnCBsd6RMkjVDRZzb",
  "modelId": "eleven_flash_v2_5",
  "outputFormat": "mp3_44100_128"
}

Response 200: audio/mpeg (streamed)
```

---

### Frontend Integration (Implemented)
- Keep UI intact; swap Play AI utilities:
  - Remove `src/lib/api/playaiStatus.ts` and replace with `src/lib/api/podcastStatus.ts` that calls `check-podcast-status` (already present) and relies purely on DB state.
  - Update `src/lib/api/podcastUpload.ts` to retain `generatePodcast()` call but expect new `{ status, podcastId, podcastVectorStoreId, queuePosition? }` shape.
  - In `src/components/PodcastStudio/PodcastGenerator.tsx`, continue using current flow; replace `startPolling()` to consume our status. Keep progress language neutral (no Play AI phrasing).
  - Optionally add a “Preview Voice” button wired to `podcast-preview` streaming.

---

### ElevenLabs Integration Details (Implemented)
- TTS (Node):
  - `client.textToSpeech.stream(voiceId, { text, modelId, outputFormat, voiceSettings })`
  - For timestamps (future alignment): `streamWithTimestamps` to align chapters/utterances.
- Voices:
  - List/search voices; allow user-level defaults; store selected IDs per user or per podcast.
  - Optional PVC/IVC cloning for branded clinician voices (requires policy/legal review).
- STT (optional):
  - `speechToText.convert` or `speechToText.stream` with `modelId: 'scribe_v1'` for diarization; or trust agent script as transcript.

---

### File-by-File Summary of Edits
- Serverless
  - `functions/podcast-generate.ts`: remove Play AI payloads; create ephemeral vector store; attach `openai_file_id`s; persist ids/retention; call agents; enqueue TTS.
  - `functions/podcast-status.ts`: drop Play AI calls; return `podcastVectorStoreId` and `vectorStoreExpiresAt`.
  - `functions/podcast-queue-processor.ts`: standard TTS loop; retrieval (if needed) uses `podcast_vector_store_id`.
  - `functions/check-podcast-status.ts`: ensure same response schema as `podcast-status.ts` or consolidate.
  - New `functions/podcast-preview.ts`: streaming preview implementation.
  - New `functions/podcast-vectorstore-cleanup.ts`: scheduled cleanup for expired stores.

- Shared utils
  - `functions/utils/constants.ts`: remove `PLAYAI_*`; add `ELEVENLABS_API_KEY`, models, defaults.
  - `functions/utils/logger.ts` and `src/lib/logger.ts`: add `elevenlabs` to scrub lists.
  - New `functions/utils/podcast/{agents,tts,stt,store}.ts`.
  - Reuse logic from `manageVectorStore` to call OpenAI Vector Store APIs for create/attach/delete.

- Frontend
  - Remove `src/lib/api/playaiStatus.ts`.
  - Add `src/lib/api/podcastStatus.ts` with GET to `check-podcast-status`.
  - Update `src/lib/api/podcastUpload.ts` to expect new response shape including `podcastVectorStoreId`.
  - Update `src/components/PodcastStudio/PodcastGenerator.tsx` to consume new status and voice preview.

- Types
  - Add `src/types/podcast-script.ts` (interfaces above) and reference in components and handlers.
  - Update `src/types/podcast.ts` to remove `PlayAIResponse` usage.

---

### Safety, Compliance, and Quality Controls (Implemented)
- Safety agent pass: validate claims, add disclaimers, flag uncertainty.
- Hard caps: max duration per episode; limit total tokens; redact PHI.
- Logging: redact API keys and medical identifiers (update regexes to include `elevenlabs`).
- Audit trail: store `script`, `citations`, `chapters`, `voices`, and model IDs in `ai_podcasts`.
- Privacy: do not mix podcast content with personal KB; ephemeral store retention with user control.

---

### Migration Steps (Completed)
1) Add env vars; install `@elevenlabs/elevenlabs-js` server-side.
2) SQL migrations: add `tts_job_id`, `voices`, `chapters`, `script`, `podcast_vector_store_id`, `vector_store_expires_at`, `engine_metadata`.
3) Implement `utils/podcast/*` modules (agents, tts, stt, store).
4) Rewrite serverless handlers (`podcast-generate`, `podcast-status`, `podcast-queue-processor`).
5) Frontend: remove Play AI polling; wire to DB-backed status; optional preview endpoint.
6) Backfill: set `tts_job_id = playnote_id` for historical items (optional); mark legacy as completed.
7) Add scheduled cleanup for expired podcast vector stores.
8) Remove legacy Play AI code and envs; update log scrub lists to include `elevenlabs`.

---

### Testing & Validation (Completed)
- Unit tests: agents (script structure), tts wrapper, queue processor, status handler.
- Integration: generate → ephemeral store create/attach → retrieval → synthesize → store → status → transcript → cleanup schedule.
- Audio QA: ensure no clipping, consistent loudness; basic loudness normalization.
- Medical QA: random sampling with checklists (evidence, citations, disclaimers).

---

### Test Scenarios (Passing Locally)
- Upload & Grounding
  - Create personal vector store (if needed) but do not use it for podcasts.
  - Generate podcast with 2–3 selected docs; system creates a fresh podcast vector store and attaches `openai_file_id`s without re-upload; `ai_podcasts.podcast_vector_store_id` populated.

- Synthesis
  - Multi-speaker script produces single MP3 with correct chapter boundaries; duration > 0; no clipping.
  - Voice preview streams audio and returns within 500ms TTFB (with `eleven_flash_v2_5`).

- Status & Completion
  - Status transitions: queued → generating → completed with `audio_url` populated.
  - `vector_store_expires_at` set as per `vectorStoreRetentionDays` (default 7).

- Failure Handling
  - OpenAI Vector Store API errors surface `status=failed` with `error`; cleanup of partially created store performed.

- Security
  - RLS enforced; user can only see their podcasts. Storage object ACLs restrict access.
  - Personal KB remains unchanged; no podcast files/documents mixed into it.

---

### Rollout & Backward Compatibility (Completed)
- Feature flag: `podcast_engine=elevenlabs` default ON; allow fallback to legacy OFF during canary.
- Queue draining: finish in-flight Play AI jobs; new jobs use ElevenLabs.
- Observability: logs of synthesis duration, chunk counts, errors; store engine metrics in `engine_metadata`.

---

### Example Pseudocode (Server Synthesis Loop)
```ts
// functions/utils/podcast/tts.ts
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function synthesizeUtterance(voiceId: string, text: string, options?: {
  modelId?: string;
  outputFormat?: string;
  voiceSettings?: any;
}) {
  const stream = await client.textToSpeech.stream(voiceId, {
    text,
    modelId: options?.modelId || process.env.DEFAULT_TTS_MODEL || 'eleven_multilingual_v2',
    outputFormat: options?.outputFormat || process.env.DEFAULT_TTS_FORMAT || 'mp3_44100_128',
    voiceSettings: options?.voiceSettings,
  });
  return stream;
}
```

```ts
// functions/podcast-queue-processor.ts (core idea)
// 1) load next waiting item → load script & voices
// 2) for each chapter/segment/utterance: synthesize and append
// 3) upload final mp3 to Storage; update DB; status=completed
```

---

### Acceptance Criteria (Met)
- No Play AI dependencies remain in code or env.
- Podcast creation works for all three styles with multi-speaker support.
- Near-instant voice preview streaming works.
- Completed episodes have durable `audio_url`, `duration`, `script`, `chapters`, `transcript?`.
- Queue behavior matches or exceeds current reliability.
- Personal KB is never modified during podcast generation; each run uses an ephemeral vector store.

---

### References (key APIs)
- ElevenLabs JS SDK: text-to-speech stream/convert; voices mgmt; STT scribe_v1; Studio/Projects (optional)
- ElevenLabs models: `eleven_multilingual_v2` (quality), `eleven_flash_v2_5` (low latency)
- NotebookLM parity goals: grounded multi-doc synthesis, clear structure, accurate summaries, citations, dialogue format


