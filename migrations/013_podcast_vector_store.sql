-- Podcast Vector Store support (ephemeral store per run)
-- Safe additive migration

alter table if exists public.ai_podcasts
  add column if not exists tts_job_id text,
  add column if not exists voices jsonb,
  add column if not exists chapters jsonb,
  add column if not exists script jsonb,
  add column if not exists podcast_vector_store_id text,
  add column if not exists vector_store_expires_at timestamptz,
  add column if not exists engine_metadata jsonb;

create index if not exists idx_ai_podcasts_status_updated on public.ai_podcasts (status, updated_at desc);
create index if not exists idx_ai_podcasts_vector_store on public.ai_podcasts (podcast_vector_store_id);

alter table if exists public.podcast_queue
  add column if not exists synthesis_engine text not null default 'elevenlabs',
  add column if not exists engine_metadata jsonb;

-- Optional: backfill Legacy PlayAI id
update public.ai_podcasts set tts_job_id = playnote_id where tts_job_id is null and playnote_id is not null;

-- Cleanup to be executed after full cutover (commented by default)
-- alter table public.ai_podcasts drop column if exists playnote_id;



