import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ENV_VARS } from '../constants';
import { logger } from '../logger';

const supabase = createClient(ENV_VARS.SUPABASE_URL, ENV_VARS.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PlanInput {
  userId: string;
  podcastId: string;
  documentIds: string[];
  style: 'podcast' | 'executive-briefing' | 'debate';
  specialty: string;
  podcastVectorStoreId: string;
}

/**
 * Minimal grounded script planner.
 * Current implementation creates a simple 3-chapter outline using the podcast title/description
 * and ties citationIds to provided documentIds for auditability.
 */
export async function planPodcastScript(input: PlanInput) {
  const { podcastId, documentIds, style, specialty } = input;

  // Load podcast metadata
  const { data: podcast, error } = await supabase
    .from('ai_podcasts')
    .select('title, description')
    .eq('id', podcastId)
    .single();

  if (error) {
    logger.error('Failed to load podcast for planning', { podcastId, error: error.message });
    throw new Error('Failed to load podcast data');
  }

  const citations = documentIds.map((docId, idx) => ({ id: `c${idx + 1}`, sourceId: docId }));

  const speakers = {
    host: { role: 'host', displayName: 'Host', voiceId: 'JBFqnCBsd6RMkjVDRZzb' },
    expert: { role: 'expert', displayName: 'Expert', voiceId: 'Aw4FAjKCGjjNkVhN1Xmq' },
    guest: { role: 'guest', displayName: 'Guest', voiceId: 'Xb7hH8MSUJpSbSDYk0k2' }
  } as any;

  const title = podcast?.title || 'Medical Podcast';
  const description = podcast?.description || '';

  // Simple 3-chapter structure
  const chapters = [
    {
      id: 'ch1',
      title: `${title} — Overview`,
      segments: [
        { id: 'u1', speaker: 'host', text: `Welcome to ${title}. ${description}` },
        { id: 'u2', speaker: 'expert', text: `We'll cover key points and evidence relevant to ${specialty}.`, citationIds: citations.slice(0, 1).map(c => c.id) }
      ]
    },
    {
      id: 'ch2',
      title: 'Key Evidence & Guidance',
      segments: [
        { id: 'u3', speaker: 'host', text: 'Let us walk through the most important findings and guidelines.' },
        { id: 'u4', speaker: 'expert', text: 'Evidence summary and clinical implications.', citationIds: citations.slice(1, 3).map(c => c.id) }
      ]
    },
    {
      id: 'ch3',
      title: 'Clinical Takeaways',
      segments: [
        { id: 'u5', speaker: 'expert', text: 'Top takeaways clinicians should remember.' },
        { id: 'u6', speaker: 'host', text: 'Thanks for listening.' }
      ]
    }
  ];

  const script = {
    style,
    speakers,
    chapters,
    citations,
    specialty
  };

  // Persist script
  await supabase
    .from('ai_podcasts')
    .update({ script })
    .eq('id', podcastId);

  return script;
}



