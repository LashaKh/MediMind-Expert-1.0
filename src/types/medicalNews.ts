/**
 * Medical News Types
 * TypeScript interfaces for medical news functionality
 */

export interface MedicalNewsArticle {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  category: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates';
  specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery';
  publishedDate: string;
  createdAt: string;
  clickCount: number;
  engagementScore: number;
  keywords: string[] | null;
  authorName: string | null;
  authorAffiliation: string | null;
  publicationName: string | null;
  relevanceScore: number;
  credibilityScore: number;
  contentType: 'article' | 'study' | 'guideline' | 'press_release' | 'editorial' | 'review';
  evidenceLevel: 'systematic_review' | 'rct' | 'cohort_study' | 'case_control' | 'case_series' | 'expert_opinion' | 'guideline' | null;
  processingStatus: 'pending' | 'processed' | 'failed' | 'archived';
}

export interface NewsFilters {
  specialty?: string;
  category?: string[];
  evidenceLevel?: string[];
  contentType?: string[];
  publicationSource?: string[];
  recency?: string;
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minCredibilityScore?: number;
  minRelevanceScore?: number;
  sortBy?: 'engagement' | 'date' | 'relevance' | 'credibility';
  sortOrder?: 'desc' | 'asc';
  limit?: number;
  offset?: number;
  logicMode?: 'AND' | 'OR';
}

export interface NewsResponse {
  articles: MedicalNewsArticle[];
  totalCount: number;
  limit: number;
  offset: number;
  filters: NewsFilters;
  cacheHit?: boolean;
  responseTime: number;
}

export interface TrendingResponse {
  trending: MedicalNewsArticle[];
  specialty: string;
  timeframe: string;
  totalCount: number;
  responseTime: number;
}

export interface NewsInteraction {
  id: string;
  userId: string | null;
  newsId: string;
  interactionType: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later';
  interactionValue: number | null;
  interactionMetadata: any | null;
  createdAt: string;
  sessionId: string | null;
  ipAddress: string | null;
}

export interface NewsState {
  articles: MedicalNewsArticle[];
  trendingArticles: MedicalNewsArticle[];
  isLoading: boolean;
  error: string | null;
  filters: NewsFilters;
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
  viewMode: 'grid' | 'list';
  selectedCategory: string | null;
}

export type NewsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ARTICLES'; payload: { articles: MedicalNewsArticle[]; totalCount: number; hasMore: boolean } }
  | { type: 'APPEND_ARTICLES'; payload: { articles: MedicalNewsArticle[]; hasMore: boolean } }
  | { type: 'SET_TRENDING'; payload: MedicalNewsArticle[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: NewsFilters }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'RESET_NEWS' };