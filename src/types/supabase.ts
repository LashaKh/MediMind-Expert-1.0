export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      medical_news: {
        Row: {
          id: string
          title: string
          summary: string
          source_url: string
          source_name: string
          category: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates'
          specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          published_date: string
          created_at: string
          updated_at: string
          click_count: number
          engagement_score: number
          content_hash: string | null
          keywords: string[] | null
          author_name: string | null
          author_affiliation: string | null
          publication_name: string | null
          relevance_score: number
          credibility_score: number
          content_type: 'article' | 'study' | 'guideline' | 'press_release' | 'editorial' | 'review'
          evidence_level: 'systematic_review' | 'rct' | 'cohort_study' | 'case_control' | 'case_series' | 'expert_opinion' | 'guideline' | null
          processing_status: 'pending' | 'processed' | 'failed' | 'archived'
          error_message: string | null
        }
        Insert: {
          id?: string
          title: string
          summary: string
          source_url: string
          source_name: string
          category: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates'
          specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          published_date: string
          created_at?: string
          updated_at?: string
          click_count?: number
          engagement_score?: number
          content_hash?: string | null
          keywords?: string[] | null
          author_name?: string | null
          author_affiliation?: string | null
          publication_name?: string | null
          relevance_score?: number
          credibility_score?: number
          content_type?: 'article' | 'study' | 'guideline' | 'press_release' | 'editorial' | 'review'
          evidence_level?: 'systematic_review' | 'rct' | 'cohort_study' | 'case_control' | 'case_series' | 'expert_opinion' | 'guideline' | null
          processing_status?: 'pending' | 'processed' | 'failed' | 'archived'
          error_message?: string | null
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          source_url?: string
          source_name?: string
          category?: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates'
          specialty?: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          published_date?: string
          created_at?: string
          updated_at?: string
          click_count?: number
          engagement_score?: number
          content_hash?: string | null
          keywords?: string[] | null
          author_name?: string | null
          author_affiliation?: string | null
          publication_name?: string | null
          relevance_score?: number
          credibility_score?: number
          content_type?: 'article' | 'study' | 'guideline' | 'press_release' | 'editorial' | 'review'
          evidence_level?: 'systematic_review' | 'rct' | 'cohort_study' | 'case_control' | 'case_series' | 'expert_opinion' | 'guideline' | null
          processing_status?: 'pending' | 'processed' | 'failed' | 'archived'
          error_message?: string | null
        }
        Relationships: []
      }
      news_user_interactions: {
        Row: {
          id: string
          user_id: string | null
          news_id: string
          interaction_type: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later'
          interaction_value: number | null
          interaction_metadata: Json | null
          created_at: string
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer_url: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          news_id: string
          interaction_type: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later'
          interaction_value?: number | null
          interaction_metadata?: Json | null
          created_at?: string
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          news_id?: string
          interaction_type?: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later'
          interaction_value?: number | null
          interaction_metadata?: Json | null
          created_at?: string
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "news_user_interactions_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "medical_news"
            referencedColumns: ["id"]
          }
        ]
      }
      news_collection_configs: {
        Row: {
          id: string
          specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          search_queries: string[]
          api_preferences: Json
          update_frequency: number
          is_active: boolean
          max_articles_per_collection: number
          min_credibility_score: number
          min_relevance_score: number
          max_article_age_days: number
          enable_summarization: boolean
          enable_keyword_extraction: boolean
          enable_categorization: boolean
          created_at: string
          updated_at: string
          last_collection_at: string | null
        }
        Insert: {
          id?: string
          specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          search_queries: string[]
          api_preferences?: Json
          update_frequency?: number
          is_active?: boolean
          max_articles_per_collection?: number
          min_credibility_score?: number
          min_relevance_score?: number
          max_article_age_days?: number
          enable_summarization?: boolean
          enable_keyword_extraction?: boolean
          enable_categorization?: boolean
          created_at?: string
          updated_at?: string
          last_collection_at?: string | null
        }
        Update: {
          id?: string
          specialty?: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery'
          search_queries?: string[]
          api_preferences?: Json
          update_frequency?: number
          is_active?: boolean
          max_articles_per_collection?: number
          min_credibility_score?: number
          min_relevance_score?: number
          max_article_age_days?: number
          enable_summarization?: boolean
          enable_keyword_extraction?: boolean
          enable_categorization?: boolean
          created_at?: string
          updated_at?: string
          last_collection_at?: string | null
        }
        Relationships: []
      }
      knowledge_base_documents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          tags: string[]
          is_private: boolean
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_status: string
          processing_status: string
          vector_store_id: string | null
          openai_file_id: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          category?: string
          tags?: string[]
          is_private?: boolean
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_status?: string
          processing_status?: string
          vector_store_id?: string | null
          openai_file_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          tags?: string[]
          is_private?: boolean
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          upload_status?: string
          processing_status?: string
          vector_store_id?: string | null
          openai_file_id?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      personal_knowledge_base_documents: {
        Row: {
          associated_openai_vector_store_id: string
          created_at: string
          error_message: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          openai_file_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          associated_openai_vector_store_id: string
          created_at?: string
          error_message?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          openai_file_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          associated_openai_vector_store_id?: string
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          openai_file_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_knowledge_base_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          about_me_context: string | null
          created_at: string
          email: string
          full_name: string | null
          medical_specialty: string | null
          personal_openai_vector_store_id: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_me_context?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          medical_specialty?: string | null
          personal_openai_vector_store_id?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_me_context?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          medical_specialty?: string | null
          personal_openai_vector_store_id?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
