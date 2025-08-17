export interface APIResponse {
  text: string;
  error?: string;
  sources?: SourceDocument[];
  imageAnalysis?: string;
}

export interface SourceDocument {
  id?: string;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  score?: number;
  url?: string;
}

export interface APIError {
  message: string;
  status?: number;
}