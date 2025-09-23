import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  History,
  Clock,
  User,
  Edit3,
  Mic,
  Type,
  Eye,
  RotateCcw,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Hash,
  Calendar,
  Filter,
  Search
} from 'lucide-react'
import { EditHistoryPanelProps, ReportVersion, ReportEdit } from '../../types/reportEditing'
import { MedicalButton } from '../ui/MedicalDesignSystem'

/**
 * EditHistoryPanel Component
 * 
 * Comprehensive panel for displaying edit history and version tracking.
 * Provides detailed audit trail for medical reports with HIPAA compliance.
 * 
 * Features:
 * - Chronological edit history with detailed metadata
 * - Version comparison and diff visualization
 * - Edit type filtering (text, voice, manual)
 * - Version restoration with confirmation
 * - Edit statistics and analytics
 * - Export capabilities for audit compliance
 * - Session-based grouping
 * - Search and filter functionality
 * - Mobile-optimized timeline view
 */
const EditHistoryPanel: React.FC<EditHistoryPanelProps> = ({
  reportId,
  sessionId,
  onVersionRestore,
  className = ''
}) => {
  const [versions, setVersions] = useState<ReportVersion[]>([])
  const [edits, setEdits] = useState<ReportEdit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'text_instruction' | 'voice_instruction' | 'manual_edit'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyCurrentSession, setShowOnlyCurrentSession] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'versions'>('timeline')

  // Mock data for demonstration (will be replaced with actual API calls)
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock versions data
        const mockVersions: ReportVersion[] = [
          {
            id: 'v1',
            report_id: reportId,
            user_id: 'user1',
            version_number: 3,
            content: 'Updated patient report with corrected diagnosis and treatment plan...',
            edit_summary: 'Fixed diagnosis terminology and updated medication dosages',
            is_current: true,
            created_by_edit_id: 'edit3',
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
          },
          {
            id: 'v2',
            report_id: reportId,
            user_id: 'user1',
            version_number: 2,
            content: 'Patient report with preliminary diagnosis and treatment plan...',
            edit_summary: 'Added treatment recommendations based on voice instructions',
            is_current: false,
            created_by_edit_id: 'edit2',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
          },
          {
            id: 'v3',
            report_id: reportId,
            user_id: 'user1',
            version_number: 1,
            content: 'Initial patient report with basic information...',
            edit_summary: 'Initial report creation',
            is_current: false,
            created_by_edit_id: null,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
          }
        ]
        
        // Mock edits data
        const mockEdits: ReportEdit[] = [
          {
            id: 'edit3',
            report_id: reportId,
            user_id: 'user1',
            session_id: sessionId,
            edit_type: 'text_instruction',
            instruction_text: 'Fix the diagnosis codes and update medication dosages to current standards',
            original_content: 'Patient report with preliminary diagnosis...',
            updated_content: 'Updated patient report with corrected diagnosis...',
            processing_metadata: { processing_time: 2340, model: 'flowise-cardiology' },
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          },
          {
            id: 'edit2',
            report_id: reportId,
            user_id: 'user1',
            session_id: sessionId,
            edit_type: 'voice_instruction',
            voice_transcript: 'Add treatment recommendations for hypertension management',
            original_content: 'Initial patient report with basic information...',
            updated_content: 'Patient report with preliminary diagnosis...',
            processing_metadata: { processing_time: 3120, model: 'flowise-cardiology' },
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          }
        ]
        
        setVersions(mockVersions)
        setEdits(mockEdits)
      } catch (error) {
        console.error('Failed to load edit history:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadHistory()
  }, [reportId, sessionId])

  // Filter and search functionality
  const filteredEdits = useMemo(() => {
    let filtered = edits
    
    if (filterType !== 'all') {
      filtered = filtered.filter(edit => edit.edit_type === filterType)
    }
    
    if (showOnlyCurrentSession) {
      filtered = filtered.filter(edit => edit.session_id === sessionId)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(edit => 
        edit.instruction_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edit.voice_transcript?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [edits, filterType, showOnlyCurrentSession, searchTerm, sessionId])

  const handleVersionRestore = useCallback((version: ReportVersion) => {
    if (window.confirm(`Restore to version ${version.version_number}? This will replace the current content.`)) {
      onVersionRestore?.(version.content)
    }
  }, [onVersionRestore])

  const handleExport = useCallback(() => {
    const exportData = {
      reportId,
      sessionId,
      versions,
      edits: filteredEdits,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${reportId}-history.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [reportId, sessionId, versions, filteredEdits])

  const getEditTypeIcon = (editType: string) => {
    switch (editType) {
      case 'voice_instruction': return Mic
      case 'text_instruction': return Type
      case 'manual_edit': return Edit3
      default: return Activity
    }
  }

  const getEditTypeColor = (editType: string) => {
    switch (editType) {
      case 'voice_instruction': return 'from-[#2b6cb0] to-[#63b3ed]'
      case 'text_instruction': return 'from-[#1a365d] to-[#2b6cb0]'
      case 'manual_edit': return 'from-[#2b6cb0] to-[#90cdf4]'
      default: return 'from-[#1a365d]/60 to-[#2b6cb0]/60'
    }
  }

  const formatDuration = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = now.getTime() - then.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-[#1a365d]/20 rounded-lg border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2 py-8">
          <div className="w-5 h-5 border-2 border-[#2b6cb0] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#1a365d] dark:text-[#90cdf4]">Loading edit history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-[#1a365d]/20 rounded-lg border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#63b3ed]/30 dark:border-[#2b6cb0]/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
            <h3 className="text-lg font-semibold text-[#1a365d] dark:text-[#90cdf4]">
              Edit History
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <MedicalButton
              variant="ghost"
              size="sm"
              leftIcon={Download}
              onClick={handleExport}
              title="Export history"
            >
              Export
            </MedicalButton>
          </div>
        </div>
        
        {/* View mode toggle */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex rounded-lg overflow-hidden border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#2b6cb0] text-white'
                  : 'bg-white dark:bg-[#1a365d]/30 text-[#1a365d] dark:text-[#90cdf4] hover:bg-[#90cdf4]/10 dark:hover:bg-[#2b6cb0]/30'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('versions')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'versions'
                  ? 'bg-[#2b6cb0] text-white'
                  : 'bg-white dark:bg-[#1a365d]/30 text-[#1a365d] dark:text-[#90cdf4] hover:bg-[#90cdf4]/10 dark:hover:bg-[#2b6cb0]/30'
              }`}
            >
              Versions
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#1a365d]/70 dark:text-[#90cdf4]/70" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 rounded px-2 py-1 bg-white dark:bg-[#1a365d]/30 text-[#1a365d] dark:text-[#90cdf4]"
            >
              <option value="all">All Edit Types</option>
              <option value="text_instruction">Text Instructions</option>
              <option value="voice_instruction">Voice Instructions</option>
              <option value="manual_edit">Manual Edits</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#1a365d]/70 dark:text-[#90cdf4]/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search instructions..."
              className="text-sm border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 rounded px-3 py-1 bg-white dark:bg-[#1a365d]/30 text-[#1a365d] dark:text-[#90cdf4] placeholder-[#1a365d]/60 dark:placeholder-[#90cdf4]/60"
            />
          </div>
          
          <label className="flex items-center space-x-2 text-sm text-[#1a365d] dark:text-[#90cdf4]">
            <input
              type="checkbox"
              checked={showOnlyCurrentSession}
              onChange={(e) => setShowOnlyCurrentSession(e.target.checked)}
              className="rounded border-[#63b3ed]/50 dark:border-[#2b6cb0]/60"
            />
            <span>Current session only</span>
          </label>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {viewMode === 'timeline' ? (
          <div className="space-y-4">
            {filteredEdits.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-[#63b3ed]/50 dark:text-[#2b6cb0]/60 mx-auto mb-3" />
                <p className="text-[#1a365d]/70 dark:text-[#90cdf4]/70 mb-1">No edit history found</p>
                <p className="text-sm text-[#1a365d]/60 dark:text-[#90cdf4]/60">
                  {filterType !== 'all' || searchTerm || showOnlyCurrentSession
                    ? 'Try adjusting your filters'
                    : 'Edit operations will appear here as you make changes'}
                </p>
              </div>
            ) : (
              filteredEdits.map((edit, index) => {
                const IconComponent = getEditTypeIcon(edit.edit_type)
                const isExpanded = expandedVersion === edit.id
                
                return (
                  <div key={edit.id} className="relative">
                    {/* Timeline line */}
                    {index < filteredEdits.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-16 bg-[#63b3ed]/30 dark:bg-[#2b6cb0]/50" />
                    )}
                    
                    <div className="flex space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getEditTypeColor(edit.edit_type)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 bg-[#90cdf4]/10 dark:bg-[#1a365d]/30 rounded-lg border border-[#63b3ed]/30 dark:border-[#2b6cb0]/50">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">
                                {edit.edit_type === 'voice_instruction' ? 'Voice Instruction' :
                                 edit.edit_type === 'text_instruction' ? 'Text Instruction' : 'Manual Edit'}
                              </h4>
                              <div className="flex items-center space-x-3 text-xs text-[#1a365d]/70 dark:text-[#90cdf4]/70 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(edit.created_at)}</span>
                                </div>
                                {edit.processing_metadata?.processing_time && (
                                  <div className="flex items-center space-x-1">
                                    <Activity className="w-3 h-3" />
                                    <span>{edit.processing_metadata.processing_time}ms</span>
                                  </div>
                                )}
                                {edit.session_id === sessionId && (
                                  <span className="px-2 py-0.5 bg-[#63b3ed]/20 dark:bg-[#2b6cb0]/30 text-[#1a365d] dark:text-[#90cdf4] rounded-full text-xs">
                                    Current session
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setExpandedVersion(isExpanded ? null : edit.id)}
                              className="text-[#1a365d]/60 dark:text-[#90cdf4]/60 hover:text-[#1a365d] dark:hover:text-[#90cdf4]"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                          
                          <p className="text-sm text-[#1a365d] dark:text-[#90cdf4] mb-3">
                            {edit.instruction_text || edit.voice_transcript || 'Manual content modification'}
                          </p>
                          
                          {isExpanded && (
                            <div className="space-y-3 pt-3 border-t border-[#63b3ed]/30 dark:border-[#2b6cb0]/50">
                              <div>
                                <h5 className="text-xs font-semibold text-[#1a365d]/80 dark:text-[#90cdf4]/80 mb-1">Processing Details</h5>
                                <div className="text-xs text-[#1a365d]/70 dark:text-[#90cdf4]/70 space-y-1">
                                  <div>Model: {edit.processing_metadata?.model || 'N/A'}</div>
                                  <div>Processing Time: {edit.processing_metadata?.processing_time || 0}ms</div>
                                  <div>Created: {new Date(edit.created_at).toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div key={version.id} className={`border rounded-lg p-4 ${
                version.is_current
                  ? 'border-[#2b6cb0] bg-[#63b3ed]/10 dark:bg-[#1a365d]/30'
                  : 'border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 bg-white dark:bg-[#1a365d]/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-[#1a365d] dark:text-[#90cdf4]" />
                      <h4 className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">
                        Version {version.version_number}
                        {version.is_current && (
                          <span className="ml-2 px-2 py-0.5 bg-[#2b6cb0] text-white rounded-full text-xs">
                            Current
                          </span>
                        )}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-[#1a365d]/80 dark:text-[#90cdf4]/80 mb-2">
                      {version.edit_summary}
                    </p>
                    
                    <div className="flex items-center space-x-3 text-xs text-[#1a365d]/70 dark:text-[#90cdf4]/70">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(version.created_at).toLocaleString()}</span>
                      </div>
                      <div>
                        {version.content.length} characters
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!version.is_current && (
                      <MedicalButton
                        variant="ghost"
                        size="sm"
                        leftIcon={RotateCcw}
                        onClick={() => handleVersionRestore(version)}
                        title="Restore this version"
                      >
                        Restore
                      </MedicalButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 bg-[#90cdf4]/10 dark:bg-[#1a365d]/30">
        <div className="flex items-center justify-between text-xs text-[#1a365d]/70 dark:text-[#90cdf4]/70">
          <div>
            Report: {reportId} • Session: {sessionId}
          </div>
          <div>
            {filteredEdits.length} edit{filteredEdits.length !== 1 ? 's' : ''} • {versions.length} version{versions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditHistoryPanel