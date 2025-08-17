import { supabase } from '../supabase';

export interface PodcastStatusResponse {
  podcast: {
    id: string;
    title: string;
    status: 'pending' | 'queued' | 'generating' | 'completed' | 'failed';
    audio_url?: string | null;
    duration?: number | null;
    transcript?: string | null;
    error_message?: string | null;
    podcast_vector_store_id?: string | null;
    vector_store_expires_at?: string | null;
    debug_info?: any | null;
  };
  queue: {
    id: string;
    position: number;
    status: 'waiting' | 'processing' | 'completed' | 'failed';
  } | null;
  script?: {
    style: string;
    specialty: string;
    speakers: {
      host: { role: string; displayName: string; voiceId: string };
      expert: { role: string; displayName: string; voiceId: string };
    };
    chapters: Array<{
      id: string;
      title: string;
      segments: Array<{
        id: string;
        speaker: string;
        text: string;
      }>;
    }>;
    citations?: Array<{
      id: string;
      sourceId: string;
      title: string;
    }>;
  } | null;
  podcastVectorStoreId?: string | null;
  vectorStoreExpiresAt?: string | null;
}

export async function getPodcastStatus(podcastId: string, userId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('[Podcast] status:request', { podcastId, hasToken: !!session?.access_token });
  const { data, error } = await supabase.functions.invoke('podcast-status', {
    body: { podcastId, userId }
  });
  if (error) throw new Error(error.message || 'Failed to get status');
  try {
    console.log('[Podcast] status:response', {
      status: data?.podcast?.status,
      queue: data?.queue,
      vectorStoreId: data?.podcast?.podcast_vector_store_id,
      // script details may not always be returned
    });
  } catch {}
  return data as PodcastStatusResponse;
}


