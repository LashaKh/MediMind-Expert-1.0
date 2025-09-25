import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  UseVersionHistoryReturn,
  ReportVersion,
  CreateReportVersionRequest,
  VersionComparison
} from '../types/reportEditing'
import { ReportEditingService } from '../services/reportEditingService'
import { ReportVersionModel } from '../models/ReportVersion'

/**
 * useVersionHistory Hook
 * 
 * Manages report version history and tracking with comprehensive audit capabilities.
 * Provides robust version management for medical report editing workflows.
 * 
 * Features:
 * - Version history loading with pagination support
 * - Version creation and validation
 * - Current version management with integrity checks
 * - Version comparison and diff utilities
 * - Audit trail maintenance for compliance
 * - Version sequence validation
 * - Content integrity verification
 * - Performance optimization with caching
 * - Search and filtering capabilities
 */
export const useVersionHistory = (
  reportId?: string,
  userId?: string,
  autoLoad: boolean = true
): UseVersionHistoryReturn => {
  // Core state
  const [versions, setVersions] = useState<ReportVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastLoadTime, setLastLoadTime] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'version_number'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Derived state
  const currentVersion = useMemo(() => {
    return versions.find(v => v.is_current) || null
  }, [versions])
  
  // Filtered and sorted versions
  const filteredVersions = useMemo(() => {
    let filtered = versions
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(version => 
        version.edit_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const aValue = sortBy === 'created_at' ? new Date(a.created_at).getTime() : a.version_number
      const bValue = sortBy === 'created_at' ? new Date(b.created_at).getTime() : b.version_number
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filtered
  }, [versions, searchTerm, sortBy, sortOrder])
  
  // Version statistics
  const versionStats = useMemo(() => {
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageContentLength: 0,
        totalContentChanges: 0
      }
    }
    
    const sorted = [...versions].sort((a, b) => a.version_number - b.version_number)
    const contentLengths = versions.map(v => v.content.length)
    const averageLength = contentLengths.reduce((sum, len) => sum + len, 0) / contentLengths.length
    
    // Calculate total changes
    let totalChanges = 0
    for (let i = 1; i < sorted.length; i++) {
      const diff = ReportVersionModel.calculateContentDifference(
        sorted[i - 1].content,
        sorted[i].content
      )
      totalChanges += diff.modifications
    }
    
    return {
      totalVersions: versions.length,
      oldestVersion: sorted[0],
      newestVersion: sorted[sorted.length - 1],
      averageContentLength: Math.round(averageLength),
      totalContentChanges: totalChanges
    }
  }, [versions])

  // Auto-load versions on mount
  useEffect(() => {
    if (autoLoad && reportId && !lastLoadTime) {
      loadVersions()
    }
  }, [autoLoad, reportId, lastLoadTime])

  // Load version history
  const loadVersions = useCallback(async (forceReload: boolean = false): Promise<void> => {
    if (!reportId) {
      setError('Report ID is required to load versions')
      return
    }
    
    // Skip loading if recently loaded and not forcing reload
    if (!forceReload && lastLoadTime && Date.now() - lastLoadTime.getTime() < 30000) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const loadedVersions = await ReportEditingService.getVersionHistory(reportId)
      
      // Validate version sequence integrity
      const sequenceValidation = ReportVersionModel.isValidVersionSequence(loadedVersions)
      if (!sequenceValidation.isValid) {
        console.warn('Version sequence issues detected:', sequenceValidation.issues)
        setError(`Version integrity warning: ${sequenceValidation.issues.join(', ')}`)
      }
      
      setVersions(loadedVersions)
      setLastLoadTime(new Date())
      
    } catch (error) {
      console.error('Failed to load version history:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load version history'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [reportId, lastLoadTime])

  // Create new version
  const createVersion = useCallback(async (
    content: string,
    editSummary?: string,
    createdByEditId?: string
  ): Promise<ReportVersion> => {
    if (!reportId || !userId) {
      throw new Error('Report ID and User ID are required to create version')
    }
    
    if (!content.trim()) {
      throw new Error('Version content cannot be empty')
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Get next version number
      const nextVersionNumber = await ReportVersionModel.getNextVersionNumber(reportId)
      
      // Generate edit summary if not provided
      const summary = editSummary || (
        currentVersion 
          ? ReportVersionModel.generateEditSummary(currentVersion.content, content)
          : 'Initial version creation'
      )
      
      // Create version request
      const createRequest: CreateReportVersionRequest = {
        report_id: reportId,
        content: content.trim(),
        edit_summary: summary,
        created_by_edit_id: createdByEditId || null
      }
      
      // Validate request
      const versionData = {
        ...createRequest,
        user_id: userId,
        version_number: nextVersionNumber,
        is_current: true
      }
      
      const validationErrors = ReportVersionModel.validate(versionData)
      if (validationErrors.length > 0) {
        throw new Error(`Version validation failed: ${validationErrors.map(e => e.message).join(', ')}`)
      }
      
      // Create version via API
      const newVersion = await ReportEditingService.createReportVersion(createRequest, userId)
      
      // Update local state
      setVersions(prev => {
        // Mark all previous versions as not current
        const updatedPrevious = prev.map(v => ({ ...v, is_current: false }))
        return [newVersion, ...updatedPrevious]
      })
      
      return newVersion
      
    } catch (error) {
      console.error('Failed to create version:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create version'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [reportId, userId, currentVersion])

  // Set current version
  const setCurrentVersion = useCallback(async (versionId: string): Promise<void> => {
    const targetVersion = versions.find(v => v.id === versionId)
    if (!targetVersion) {
      throw new Error('Version not found')
    }
    
    if (targetVersion.is_current) {
      return // Already current
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Ensure single current version constraint
      await ReportVersionModel.ensureSingleCurrentVersion(reportId!, versionId)
      
      // Update local state
      setVersions(prev => prev.map(v => ({
        ...v,
        is_current: v.id === versionId
      })))
      
    } catch (error) {
      console.error('Failed to set current version:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to set current version'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [versions, reportId])

  // Compare two versions
  const compareVersions = useCallback((
    version1Id: string,
    version2Id: string
  ): VersionComparison | null => {
    const v1 = versions.find(v => v.id === version1Id)
    const v2 = versions.find(v => v.id === version2Id)
    
    if (!v1 || !v2) {
      setError('One or both versions not found for comparison')
      return null
    }
    
    const comparison = ReportVersionModel.compareVersions(v1, v2)
    
    return {
      version1: v1,
      version2: v2,
      contentDiff: comparison.contentDiff,
      timeDiff: comparison.timeDiff,
      versionDiff: comparison.versionDiff,
      summary: `${comparison.contentDiff.modifications} changes across ${comparison.versionDiff} versions`
    }
  }, [versions])

  // Get version by number
  const getVersionByNumber = useCallback((versionNumber: number): ReportVersion | null => {
    return versions.find(v => v.version_number === versionNumber) || null
  }, [versions])

  // Generate version summary
  const generateVersionSummary = useCallback((versionId: string): string => {
    const version = versions.find(v => v.id === versionId)
    if (!version) {
      return 'Version not found'
    }
    
    return ReportVersionModel.generateVersionSummary(version)
  }, [versions])

  // Export version history
  const exportVersionHistory = useCallback(() => {
    const exportData = {
      reportId,
      exportDate: new Date().toISOString(),
      versionStats,
      versions: filteredVersions,
      sequenceValidation: ReportVersionModel.isValidVersionSequence(versions)
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${reportId}-versions.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [reportId, versionStats, filteredVersions, versions])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh versions
  const refreshVersions = useCallback(() => {
    return loadVersions(true)
  }, [loadVersions])

  return {
    versions: filteredVersions,
    allVersions: versions,
    currentVersion,
    isLoading,
    error,
    versionStats,
    searchTerm,
    sortBy,
    sortOrder,
    
    // Actions
    loadVersions,
    createVersion,
    setCurrentVersion,
    compareVersions,
    getVersionByNumber,
    generateVersionSummary,
    exportVersionHistory,
    refreshVersions,
    clearError,
    
    // Filters
    setSearchTerm,
    setSortBy,
    setSortOrder
  }
}