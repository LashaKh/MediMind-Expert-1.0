export type PodcastStyle = 'podcast' | 'executive-briefing' | 'debate';
export type SpeakerRole = 'host' | 'expert' | 'guest';

export interface SpeakerConfig {
  role: SpeakerRole;
  displayName: string;
  voiceId: string;
}

export interface Citation {
  id: string;
  sourceId: string; // maps to OpenAI file id or internal document id
  title?: string;
  url?: string;
  snippet?: string;
}

export interface Utterance {
  id: string;
  speaker: SpeakerRole;
  text: string;
  citationIds?: string[];
  estimatedMs?: number;
}

export interface Chapter {
  id: string;
  title: string;
  startMs?: number;
  segments: Utterance[];
}

export interface PodcastScript {
  style: PodcastStyle;
  speakers: Record<SpeakerRole, SpeakerConfig>;
  chapters: Chapter[];
  citations: Citation[];
  specialty: string;
}

