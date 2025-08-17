import { createClient } from '@supabase/supabase-js';
import { ENV_VARS } from '../constants';
import { logger } from '../logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const supabase = createClient(ENV_VARS.SUPABASE_URL, ENV_VARS.SUPABASE_SERVICE_ROLE_KEY);

async function openaiFetch(path: string, init: RequestInit) {
  const base = 'https://api.openai.com';
  const resp = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  } as any);
  if (!resp.ok) {
    const text = await resp.text().catch(() => 'OpenAI error');
    throw new Error(text);
  }
  return resp.json();
}

export async function createPodcastVectorStore(podcastId: string, userId: string, name?: string) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
  const vsName = name || `podcast_${podcastId}_${Date.now()}`;
  logger.info('Creating podcast vector store', { vsName, podcastId, userId });
  const store = await openaiFetch('/v1/vector_stores', {
    method: 'POST',
    body: JSON.stringify({ name: vsName })
  });
  return store.id as string;
}

export async function attachFilesToVectorStore(vectorStoreId: string, openaiFileIds: string[]) {
  if (!openaiFileIds?.length) return;
  await openaiFetch(`/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/batch`, {
    method: 'POST',
    body: JSON.stringify({ file_ids: openaiFileIds })
  });
}

export async function scheduleVectorStoreDeletion(podcastId: string, vectorStoreId: string, retentionDays = 7) {
  const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('ai_podcasts')
    .update({ podcast_vector_store_id: vectorStoreId, vector_store_expires_at: expiresAt })
    .eq('id', podcastId);
  logger.info('Scheduled vector store deletion', { podcastId, vectorStoreId, expiresAt });
}


