/**
 * Report Editing Service
 * 
 * Core service for database operations related to report editing.
 * Handles CRUD operations for edits, sessions, and versions.
 * 
 * Features:
 * - Database operations with Row Level Security
 * - Session management with isolation
 * - Edit tracking and audit trails
 * - Version management
 * - Error handling and validation
 * - Performance optimization
 */

import { createClient } from '@supabase/supabase-js'
import { 
  ReportEdit, 
  EditSession, 
  ReportVersion,
  CreateReportEditRequest,
  CreateEditSessionRequest,
  CreateReportVersionRequest,
  EditSessionFilters,
  ReportEditFilters,
  ReportVersionFilters
} from '../types/reportEditing'
import { ReportEditModel } from '../models/ReportEdit'
import { ReportVersionModel } from '../models/ReportVersion'
import { EditSessionModel } from '../models/EditSession'

// Supabase configuration
const SUPABASE_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjk3NzAsImV4cCI6MjA2Mzk0NTc3MH0.3qSJ8nQj1tOVH7Z4-Kt3Dx7LfH5-9-7N9qY8bWjJ5_w'

let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

export class ReportEditingService {
  
  // Edit Session Operations
  static async createEditSession(request: CreateEditSessionRequest, userId: string): Promise<EditSession> {
    try {
      // Create session using model
      const session = EditSessionModel.create(request.report_id, userId)
      
      // Override session_id if provided
      if (request.session_id) {
        session.session_id = request.session_id
      }
      
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('edit_sessions')
        .insert([{
          report_id: session.report_id,
          user_id: session.user_id,
          session_id: session.session_id,
          status: session.status,
          total_edits: session.total_edits,
          started_at: session.started_at
        }])
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create edit session: ${error.message}`)
      }
      
      return EditSessionModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error creating edit session:', error)
      throw error
    }
  }
  
  static async getEditSession(sessionId: string): Promise<EditSession | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('edit_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // No rows found
        }
        throw new Error(`Failed to get edit session: ${error.message}`)
      }
      
      return EditSessionModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error getting edit session:', error)
      throw error
    }
  }
  
  static async updateEditSession(sessionId: string, updates: Partial<EditSession>): Promise<EditSession> {
    try {
      const supabase = getSupabaseClient()
      
      // Validate status transition if status is being updated
      if (updates.status) {
        const currentSession = await this.getEditSession(sessionId)
        if (currentSession && !EditSessionModel.validateStatusTransition(currentSession.status, updates.status)) {
          throw new Error(`Invalid status transition from ${currentSession.status} to ${updates.status}`)
        }
      }
      
      const updateData: any = {}
      if (updates.status) updateData.status = updates.status
      if (updates.total_edits !== undefined) updateData.total_edits = updates.total_edits
      if (updates.completed_at) updateData.completed_at = updates.completed_at
      
      const { data, error } = await supabase
        .from('edit_sessions')
        .update(updateData)
        .eq('session_id', sessionId)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to update edit session: ${error.message}`)
      }
      
      return EditSessionModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error updating edit session:', error)
      throw error
    }
  }
  
  static async listEditSessions(userId: string, filters?: EditSessionFilters): Promise<EditSession[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('edit_sessions')
        .select('*')
        .eq('user_id', userId)
      
      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.report_id) {
        query = query.eq('report_id', filters.report_id)
      }
      if (filters?.date_from) {
        query = query.gte('started_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('started_at', filters.date_to)
      }
      
      // Order by most recent first
      query = query.order('started_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(`Failed to list edit sessions: ${error.message}`)
      }
      
      return data.map(session => EditSessionModel.fromApiResponse(session))
    } catch (error) {
      console.error('Error listing edit sessions:', error)
      throw error
    }
  }
  
  // Report Edit Operations
  static async createReportEdit(request: CreateReportEditRequest, userId: string): Promise<ReportEdit> {
    try {
      // Validate the request
      const editData = {
        ...request,
        user_id: userId,
        updated_content: request.original_content // Will be updated by AI processing
      }
      
      const edit = ReportEditModel.create(editData)
      
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('report_edits')
        .insert([{
          report_id: edit.report_id,
          user_id: edit.user_id,
          session_id: edit.session_id,
          edit_type: edit.edit_type,
          instruction_text: edit.instruction_text,
          voice_transcript: edit.voice_transcript,
          original_content: edit.original_content,
          updated_content: edit.updated_content,
          processing_metadata: edit.processing_metadata,
          created_at: edit.created_at
        }])
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create report edit: ${error.message}`)
      }
      
      // Increment edit count in session
      try {
        await this.incrementSessionEditCount(request.session_id)
      } catch (error) {
        console.warn('Failed to increment session edit count:', error)
      }
      
      return ReportEditModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error creating report edit:', error)
      throw error
    }
  }
  
  static async getReportEdit(editId: string): Promise<ReportEdit | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('report_edits')
        .select('*')
        .eq('id', editId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // No rows found
        }
        throw new Error(`Failed to get report edit: ${error.message}`)
      }
      
      return ReportEditModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error getting report edit:', error)
      throw error
    }
  }
  
  static async updateReportEdit(editId: string, updates: Partial<ReportEdit>): Promise<ReportEdit> {
    try {
      const supabase = getSupabaseClient()
      
      const updateData: any = {}
      if (updates.updated_content) updateData.updated_content = updates.updated_content
      if (updates.processing_metadata) updateData.processing_metadata = updates.processing_metadata
      if (updates.processed_at) updateData.processed_at = updates.processed_at
      
      const { data, error } = await supabase
        .from('report_edits')
        .update(updateData)
        .eq('id', editId)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to update report edit: ${error.message}`)
      }
      
      return ReportEditModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error updating report edit:', error)
      throw error
    }
  }
  
  static async listReportEdits(reportId: string, filters?: ReportEditFilters): Promise<ReportEdit[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('report_edits')
        .select('*')
        .eq('report_id', reportId)
      
      // Apply filters
      if (filters?.session_id) {
        query = query.eq('session_id', filters.session_id)
      }
      if (filters?.edit_type) {
        query = query.eq('edit_type', filters.edit_type)
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }
      
      // Order by creation time (newest first)
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(`Failed to list report edits: ${error.message}`)
      }
      
      return data.map(edit => ReportEditModel.fromApiResponse(edit))
    } catch (error) {
      console.error('Error listing report edits:', error)
      throw error
    }
  }
  
  // Report Version Operations
  static async createReportVersion(request: CreateReportVersionRequest, userId: string): Promise<ReportVersion> {
    try {
      const supabase = getSupabaseClient()
      
      // Get next version number
      const { data: maxVersionData } = await supabase
        .from('report_versions')
        .select('version_number')
        .eq('report_id', request.report_id)
        .order('version_number', { ascending: false })
        .limit(1)
      
      const nextVersionNumber = maxVersionData && maxVersionData.length > 0 
        ? maxVersionData[0].version_number + 1 
        : 1
      
      // Create version using model
      const versionData = {
        ...request,
        user_id: userId,
        version_number: nextVersionNumber,
        is_current: true // New version becomes current
      }
      
      const version = ReportVersionModel.create(versionData)
      
      // Start transaction to ensure data consistency
      const { data, error } = await supabase.rpc('create_report_version_with_current_update', {
        p_report_id: version.report_id,
        p_user_id: version.user_id,
        p_version_number: version.version_number,
        p_content: version.content,
        p_edit_summary: version.edit_summary,
        p_created_by_edit_id: version.created_by_edit_id
      })
      
      if (error) {
        // Fallback to manual transaction
        return await this.createReportVersionWithTransaction(version)
      }
      
      return ReportVersionModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error creating report version:', error)
      throw error
    }
  }
  
  private static async createReportVersionWithTransaction(version: ReportVersion): Promise<ReportVersion> {
    const supabase = getSupabaseClient()
    
    // First, unset current flag on existing versions
    await supabase
      .from('report_versions')
      .update({ is_current: false })
      .eq('report_id', version.report_id)
      .eq('is_current', true)
    
    // Then create new version
    const { data, error } = await supabase
      .from('report_versions')
      .insert([{
        report_id: version.report_id,
        user_id: version.user_id,
        version_number: version.version_number,
        content: version.content,
        edit_summary: version.edit_summary,
        is_current: version.is_current,
        created_by_edit_id: version.created_by_edit_id,
        created_at: version.created_at
      }])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create report version: ${error.message}`)
    }
    
    return ReportVersionModel.fromApiResponse(data)
  }
  
  static async getReportVersion(versionId: string): Promise<ReportVersion | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('report_versions')
        .select('*')
        .eq('id', versionId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // No rows found
        }
        throw new Error(`Failed to get report version: ${error.message}`)
      }
      
      return ReportVersionModel.fromApiResponse(data)
    } catch (error) {
      console.error('Error getting report version:', error)
      throw error
    }
  }
  
  static async listReportVersions(reportId: string, currentOnly?: boolean): Promise<ReportVersion[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('report_versions')
        .select('*')
        .eq('report_id', reportId)
      
      if (currentOnly) {
        query = query.eq('is_current', true)
      }
      
      // Order by version number (newest first)
      query = query.order('version_number', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(`Failed to list report versions: ${error.message}`)
      }
      
      return data.map(version => ReportVersionModel.fromApiResponse(version))
    } catch (error) {
      console.error('Error listing report versions:', error)
      throw error
    }
  }
  
  static async getCurrentVersion(reportId: string): Promise<ReportVersion | null> {
    try {
      const versions = await this.listReportVersions(reportId, true)
      return versions.length > 0 ? versions[0] : null
    } catch (error) {
      console.error('Error getting current version:', error)
      throw error
    }
  }
  
  static async setCurrentVersion(versionId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      
      // First get the version to find the report_id
      const version = await this.getReportVersion(versionId)
      if (!version) {
        throw new Error('Version not found')
      }
      
      // Unset current flag on all versions for this report
      await supabase
        .from('report_versions')
        .update({ is_current: false })
        .eq('report_id', version.report_id)
        .eq('is_current', true)
      
      // Set current flag on the specified version
      const { error } = await supabase
        .from('report_versions')
        .update({ is_current: true })
        .eq('id', versionId)
      
      if (error) {
        throw new Error(`Failed to set current version: ${error.message}`)
      }
    } catch (error) {
      console.error('Error setting current version:', error)
      throw error
    }
  }
  
  // Utility Methods
  static async incrementSessionEditCount(sessionId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.rpc('increment_session_edit_count', {
        p_session_id: sessionId
      })
      
      if (error) {
        // Fallback to manual increment
        const session = await this.getEditSession(sessionId)
        if (session) {
          await this.updateEditSession(sessionId, {
            total_edits: (session.total_edits || 0) + 1
          })
        }
      }
    } catch (error) {
      console.error('Error incrementing session edit count:', error)
      // Don't throw - this is not critical
    }
  }
  
  static async getEditStatistics(reportId: string): Promise<{
    totalEdits: number
    totalVersions: number
    activeSessions: number
    lastEditDate: string | null
  }> {
    try {
      const supabase = getSupabaseClient()
      
      // Get statistics in parallel
      const [editsResult, versionsResult, sessionsResult] = await Promise.all([
        supabase
          .from('report_edits')
          .select('created_at')
          .eq('report_id', reportId),
        supabase
          .from('report_versions')
          .select('id')
          .eq('report_id', reportId),
        supabase
          .from('edit_sessions')
          .select('id')
          .eq('report_id', reportId)
          .eq('status', 'active')
      ])
      
      const edits = editsResult.data || []
      const versions = versionsResult.data || []
      const activeSessions = sessionsResult.data || []
      
      const lastEditDate = edits.length > 0 
        ? edits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null
      
      return {
        totalEdits: edits.length,
        totalVersions: versions.length,
        activeSessions: activeSessions.length,
        lastEditDate
      }
    } catch (error) {
      console.error('Error getting edit statistics:', error)
      return {
        totalEdits: 0,
        totalVersions: 0,
        activeSessions: 0,
        lastEditDate: null
      }
    }
  }
  
  static async cleanupExpiredSessions(timeoutMinutes: number = 60): Promise<number> {
    try {
      const supabase = getSupabaseClient()
      const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('edit_sessions')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'active')
        .lt('started_at', cutoffTime)
        .select('id')
      
      if (error) {
        throw new Error(`Failed to cleanup expired sessions: ${error.message}`)
      }
      
      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error)
      return 0
    }
  }
}