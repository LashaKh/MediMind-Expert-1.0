// Type definitions for Podcast generation and management

export interface Podcast {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  audio_url?: string;
  duration?: number;
  playnote_id?: string;
  synthesis_style?: string;
  voice_settings?: VoiceSettings;
  source_documents?: SourceDocument[];
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface VoiceSettings {
  voice1?: string;
  voice1Name?: string;
  voice2?: string;
  voice2Name?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
}

export interface SourceDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  content_preview?: string;
}

export interface QueueStatus {
  position?: number;
  total?: number;
  estimatedTimeMinutes?: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  queueId?: string;
}

export interface PodcastGenerationRequest {
  title: string;
  description: string;
  documentIds: string[];
  synthesisStyle: 'conversational' | 'narrative' | 'educational' | 'summary';
  voiceSettings?: VoiceSettings;
  language?: string;
  duration?: 'short' | 'medium' | 'long';
}

export interface PodcastDebugResult {
  action: string;
  timestamp: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  details?: string;
}

export interface PodcastQueueItem {
  id: string;
  user_id: string;
  document_ids: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  podcast_id?: string;
}

// PlayAIResponse interface removed - migrated to ElevenLabs

export interface PodcastDocument {
  id: string;
  title: string;
  description: string;
  content?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  tags: string[];
  created_at: string;
}