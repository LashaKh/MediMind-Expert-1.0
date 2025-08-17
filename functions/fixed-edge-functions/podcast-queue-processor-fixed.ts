import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') || '';
const DEFAULT_TTS_MODEL = Deno.env.get('DEFAULT_TTS_MODEL') || 'eleven_multilingual_v2';

// Updated with working voice IDs as defaults
const DEFAULT_TTS_VOICE = 'wyWA56cQNU2KqUW4eCsI'; // Updated to working voice
const FALLBACK_VOICE = 'uYXf8XasLslADfZ2MB4u';   // Second working voice as fallback

type SpeakerRole = 'host' | 'expert' | 'guest';
interface SpeakerConfig { role: SpeakerRole; displayName: string; voiceId: string }
interface Utterance { id: string; speaker: SpeakerRole; text: string }
interface Chapter { id: string; title: string; segments: Utterance[] }
interface ScriptJSON { style: string; specialty: string; speakers: Record<string, SpeakerConfig>; chapters: Chapter[] }

function getVoiceId(speakers: Record<string, SpeakerConfig> | undefined, role: string): string {
  const v = speakers?.[role]?.voiceId;
  if (typeof v === 'string' && v.length > 0) return v;
  
  // Return role-specific defaults using working voice IDs
  if (role === 'host') return DEFAULT_TTS_VOICE;
  if (role === 'expert') return FALLBACK_VOICE;
  return DEFAULT_TTS_VOICE;
}

async function ttsToArrayBufferWithFallback(primaryVoiceId: string, text: string): Promise<ArrayBuffer> {
  const bounded = text.length > 2800 ? text.slice(0, 2800) : text;
  const tryVoice = async (voiceId: string) => {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({ text: bounded, model_id: DEFAULT_TTS_MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.7 } })
    });
    return res;
  };

  let res = await tryVoice(primaryVoiceId);
  if (!res.ok) {
    const errText = await res.text();
    console.log(`Voice ${primaryVoiceId} failed: ${res.status} ${errText}`);
    
    // Try fallback voice if primary fails
    if (primaryVoiceId !== FALLBACK_VOICE) {
      console.log(`Trying fallback voice: ${FALLBACK_VOICE}`);
      res = await tryVoice(FALLBACK_VOICE);
    }
    
    // Try default voice if fallback also fails
    if (!res.ok && primaryVoiceId !== DEFAULT_TTS_VOICE && FALLBACK_VOICE !== DEFAULT_TTS_VOICE) {
      console.log(`Trying default voice: ${DEFAULT_TTS_VOICE}`);
      res = await tryVoice(DEFAULT_TTS_VOICE);
    }
  }
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${err.slice(0, 400)}`);
  }
  return await res.arrayBuffer();
}

function concatBuffers(buffers: ArrayBuffer[]): Uint8Array {
  const total = buffers.reduce((n, b) => n + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let job: any | null = null;
  try {
    if (!ELEVENLABS_API_KEY) throw new Error('Missing ELEVENLABS_API_KEY');

    const { data: waitingList, error: listError } = await supabase
      .from('podcast_queue')
      .select('*, ai_podcasts(*)')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
      .order('position', { ascending: true })
      .limit(1);
    if (listError) throw new Error(`Queue list failed: ${listError.message}`);
    job = waitingList && waitingList.length > 0 ? (waitingList[0] as any) : null;
    if (!job) {
      return new Response(JSON.stringify({ message: 'No items in queue', processed: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('podcast_queue').update({ status: 'processing' }).eq('id', job.id);
    await supabase.from('ai_podcasts').update({ status: 'generating' }).eq('id', job.podcast_id);

    const { data: podcastRow, error: pErr } = await supabase
      .from('ai_podcasts')
      .select('id, title, description, script, voice_settings')
      .eq('id', job.podcast_id)
      .single();
    if (pErr || !podcastRow) throw new Error(`Podcast load failed: ${pErr?.message || 'not found'}`);

    const script: ScriptJSON | null = (podcastRow as any).script || null;

    const buffers: ArrayBuffer[] = [];
    if (script && Array.isArray(script.chapters) && script.chapters.length > 0) {
      for (const ch of script.chapters) {
        for (const seg of ch.segments) {
          const text = (seg.text || '').toString().trim();
          if (!text) continue;
          const voiceId = getVoiceId(script.speakers, seg.speaker);
          console.log(`Processing segment with voice ${voiceId} for speaker ${seg.speaker}`);
          const buf = await ttsToArrayBufferWithFallback(voiceId, text);
          buffers.push(buf);
        }
      }
    } else {
      const title = (podcastRow as any).title || 'Medical Podcast';
      const description = (podcastRow as any).description || '';
      const text = `${title}. ${description} We summarize key clinical insights, highlight risk considerations, and outline practical takeaways.`;
      const buf = await ttsToArrayBufferWithFallback(DEFAULT_TTS_VOICE, text);
      buffers.push(buf);
    }

    const finalBytes = concatBuffers(buffers);
    const audioBlob = new Blob([finalBytes], { type: 'audio/mpeg' });
    const storagePath = `podcasts/${job.podcast_id}/${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage.from('user-uploads').upload(storagePath, audioBlob, { contentType: 'audio/mpeg', upsert: true });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    const { data: publicUrlData } = supabase.storage.from('user-uploads').getPublicUrl(storagePath);
    const audioUrl = publicUrlData?.publicUrl;

    await supabase.from('ai_podcasts').update({ status: 'completed', audio_url: audioUrl }).eq('id', job.podcast_id);
    await supabase.from('podcast_queue').update({ status: 'completed' }).eq('id', job.id);

    console.log(`Podcast generation completed successfully: ${job.podcast_id}`);
    return new Response(JSON.stringify({ message: 'Processed', processed: 1, podcastId: job.podcast_id, audioUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Podcast generation failed:', error);
    try {
      if (job?.podcast_id) {
        await supabase.from('ai_podcasts').update({ status: 'failed', error_message: (error instanceof Error ? error.message : 'Unknown error') }).eq('id', job.podcast_id);
      }
      if (job?.id) {
        await supabase.from('podcast_queue').update({ status: 'failed' }).eq('id', job.id);
      }
    } catch {}

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});