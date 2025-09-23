/**
 * ReportVersion Model
 * 
 * Model interface and validation for report version management.
 * Ensures version integrity and audit trail compliance.
 * 
 * Features:
 * - Version validation
 * - Sequential numbering
 * - Content integrity checks
 * - Current version management
 * - Audit trail validation
 */

import { ReportVersion, ValidationError } from '../types/reportEditing'

export class ReportVersionModel {
  
  // Validation Methods
  static validate(version: Partial<ReportVersion>): ValidationError[] {
    const errors: ValidationError[] = []
    
    // Required field validation
    if (!version.report_id?.trim()) {
      errors.push({
        code: 'MISSING_REPORT_ID',
        message: 'Report ID is required',
        field: 'report_id',
        value: version.report_id,
        recoverable: true
      })
    }
    
    if (!version.user_id?.trim()) {
      errors.push({
        code: 'MISSING_USER_ID',
        message: 'User ID is required',
        field: 'user_id',
        value: version.user_id,
        recoverable: true
      })
    }
    
    if (version.version_number === undefined || version.version_number === null) {
      errors.push({
        code: 'MISSING_VERSION_NUMBER',
        message: 'Version number is required',
        field: 'version_number',
        value: version.version_number,
        recoverable: true
      })
    } else if (!this.validateVersionNumber(version.version_number)) {
      errors.push({
        code: 'INVALID_VERSION_NUMBER',
        message: 'Version number must be a positive integer',
        field: 'version_number',
        value: version.version_number,
        recoverable: true
      })
    }
    
    if (!version.content?.trim()) {
      errors.push({
        code: 'MISSING_CONTENT',
        message: 'Content is required and cannot be empty',
        field: 'content',
        value: version.content,
        recoverable: true
      })
    } else if (!this.validateContent(version.content)) {
      errors.push({
        code: 'INVALID_CONTENT',
        message: 'Content validation failed',
        field: 'content',
        value: version.content,
        recoverable: true
      })
    }
    
    // Business logic validation
    if (version.is_current === undefined || version.is_current === null) {
      errors.push({
        code: 'MISSING_CURRENT_FLAG',
        message: 'is_current flag is required',
        field: 'is_current',
        value: version.is_current,
        recoverable: true
      })
    }
    
    return errors
  }
  
  static validateVersionNumber(versionNumber: any): boolean {
    return Number.isInteger(versionNumber) && versionNumber > 0
  }
  
  static validateContent(content: string): boolean {
    if (!content?.trim()) {
      return false
    }
    
    // Content should be reasonable length
    if (content.length > 100000) {
      return false
    }
    
    // Content should contain some medical-relevant text
    const hasMedicalContent = /patient|diagnosis|treatment|clinical|medical|history|examination|assessment|plan/i.test(content)
    
    return hasMedicalContent
  }
  
  static validateCurrentVersionConstraint(reportId: string, isCurrent: boolean): boolean {
    // This would typically check the database, but for now we validate the logic
    return reportId?.trim() !== '' && typeof isCurrent === 'boolean'
  }
  
  // Version Management
  static async getNextVersionNumber(reportId: string): Promise<number> {
    // This method would typically query the database to find the highest version number
    // For now, this is a placeholder that would be implemented with actual database access
    if (!reportId?.trim()) {
      throw new Error('Report ID is required to determine next version number')
    }
    
    // This would be replaced with actual database query:
    // SELECT MAX(version_number) FROM report_versions WHERE report_id = ?
    // For now, return 1 as placeholder
    return 1
  }
  
  static async ensureSingleCurrentVersion(reportId: string, newCurrentVersionId: string): Promise<void> {
    // This method would typically update the database to ensure only one current version
    if (!reportId?.trim()) {
      throw new Error('Report ID is required')
    }
    
    if (!newCurrentVersionId?.trim()) {
      throw new Error('New current version ID is required')
    }
    
    // This would be replaced with actual database operations:
    // 1. UPDATE report_versions SET is_current = false WHERE report_id = ? AND is_current = true
    // 2. UPDATE report_versions SET is_current = true WHERE id = ?
    console.log(`Setting version ${newCurrentVersionId} as current for report ${reportId}`)
  }
  
  // Content Operations
  static generateEditSummary(originalContent: string, updatedContent: string): string {
    if (!originalContent?.trim() && !updatedContent?.trim()) {
      return 'Empty content'
    }
    
    if (!originalContent?.trim()) {
      return 'Initial content created'
    }
    
    if (!updatedContent?.trim()) {
      return 'Content cleared'
    }
    
    const diff = this.calculateContentDifference(originalContent, updatedContent)
    
    if (diff.additions === 0 && diff.deletions === 0) {
      return 'Content reformatted'
    }
    
    const parts = []
    if (diff.additions > 0) {
      parts.push(`+${diff.additions} chars`)
    }
    if (diff.deletions > 0) {
      parts.push(`-${diff.deletions} chars`)
    }
    
    return parts.join(', ')
  }
  
  static calculateContentDifference(content1: string, content2: string): {
    additions: number
    deletions: number
    modifications: number
  } {
    const len1 = content1?.length || 0
    const len2 = content2?.length || 0
    
    if (len1 === 0 && len2 === 0) {
      return { additions: 0, deletions: 0, modifications: 0 }
    }
    
    if (len1 === 0) {
      return { additions: len2, deletions: 0, modifications: len2 }
    }
    
    if (len2 === 0) {
      return { additions: 0, deletions: len1, modifications: len1 }
    }
    
    // Simple character-based diff
    const lengthDiff = len2 - len1
    const additions = Math.max(0, lengthDiff)
    const deletions = Math.max(0, -lengthDiff)
    
    // Count character modifications
    let modifications = 0
    const minLength = Math.min(len1, len2)
    
    for (let i = 0; i < minLength; i++) {
      if (content1[i] !== content2[i]) {
        modifications++
      }
    }
    
    // Add length difference to modifications
    modifications += Math.abs(lengthDiff)
    
    return {
      additions,
      deletions,
      modifications
    }
  }
  
  // Factory Methods
  static create(data: Partial<ReportVersion>): ReportVersion {
    const errors = this.validate(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`)
    }
    
    const now = new Date().toISOString()
    
    return {
      id: data.id || crypto.randomUUID(),
      report_id: data.report_id!,
      user_id: data.user_id!,
      version_number: data.version_number!,
      content: data.content!.trim(),
      edit_summary: data.edit_summary?.trim() || null,
      is_current: data.is_current ?? false,
      created_by_edit_id: data.created_by_edit_id || null,
      created_at: data.created_at || now
    }
  }
  
  static createFromEdit(editId: string, reportId: string, content: string, summary: string): ReportVersion {
    if (!editId?.trim()) {
      throw new Error('Edit ID is required')
    }
    
    if (!reportId?.trim()) {
      throw new Error('Report ID is required')
    }
    
    if (!content?.trim()) {
      throw new Error('Content is required')
    }
    
    // This would typically get the next version number from the database
    // For now, we'll use a placeholder
    const versionNumber = 1 // This should be: await this.getNextVersionNumber(reportId)
    
    return this.create({
      report_id: reportId,
      user_id: '', // This would be provided from context
      version_number: versionNumber,
      content: content,
      edit_summary: summary?.trim() || this.generateEditSummary('', content),
      is_current: true,
      created_by_edit_id: editId
    })
  }
  
  static fromApiResponse(response: any): ReportVersion {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid API response format')
    }
    
    return {
      id: response.id,
      report_id: response.report_id,
      user_id: response.user_id,
      version_number: response.version_number,
      content: response.content,
      edit_summary: response.edit_summary || null,
      is_current: Boolean(response.is_current),
      created_by_edit_id: response.created_by_edit_id || null,
      created_at: response.created_at
    }
  }
  
  static toApiRequest(version: ReportVersion): any {
    return {
      report_id: version.report_id,
      version_number: version.version_number,
      content: version.content,
      edit_summary: version.edit_summary,
      is_current: version.is_current,
      created_by_edit_id: version.created_by_edit_id
    }
  }
  
  // Utility Methods
  static compareVersions(version1: ReportVersion, version2: ReportVersion): {
    contentDiff: ReturnType<typeof ReportVersionModel.calculateContentDifference>
    timeDiff: number
    versionDiff: number
  } {
    const contentDiff = this.calculateContentDifference(version1.content, version2.content)
    
    const time1 = new Date(version1.created_at).getTime()
    const time2 = new Date(version2.created_at).getTime()
    const timeDiff = Math.abs(time2 - time1)
    
    const versionDiff = Math.abs(version2.version_number - version1.version_number)
    
    return {
      contentDiff,
      timeDiff,
      versionDiff
    }
  }
  
  static generateVersionSummary(version: ReportVersion): string {
    const summary = version.edit_summary || 'No summary available'
    const timestamp = new Date(version.created_at).toLocaleString()
    const status = version.is_current ? ' (Current)' : ''
    
    return `v${version.version_number}${status}: ${summary} - ${timestamp}`
  }
  
  static isValidVersionSequence(versions: ReportVersion[]): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    if (versions.length === 0) {
      return { isValid: true, issues: [] }
    }
    
    // Sort by version number
    const sortedVersions = [...versions].sort((a, b) => a.version_number - b.version_number)
    
    // Check for gaps in version numbers
    for (let i = 0; i < sortedVersions.length; i++) {
      const expectedVersion = i + 1
      if (sortedVersions[i].version_number !== expectedVersion) {
        issues.push(`Version sequence gap: expected v${expectedVersion}, found v${sortedVersions[i].version_number}`)
      }
    }
    
    // Check that all versions belong to the same report
    const reportId = sortedVersions[0].report_id
    const differentReports = sortedVersions.filter(v => v.report_id !== reportId)
    if (differentReports.length > 0) {
      issues.push(`Versions belong to different reports: ${differentReports.map(v => v.report_id).join(', ')}`)
    }
    
    // Check for exactly one current version
    const currentVersions = versions.filter(v => v.is_current)
    if (currentVersions.length === 0) {
      issues.push('No current version found')
    } else if (currentVersions.length > 1) {
      issues.push(`Multiple current versions found: ${currentVersions.map(v => v.version_number).join(', ')}`)
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
  
  static sanitizeContent(content: string): string {
    if (!content) return ''
    
    return content
      .trim()
      // Remove script tags for security
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Preserve medical formatting but remove dangerous HTML
      .replace(/<(?!\/?(p|br|div|span|strong|em|ul|ol|li)\b)[^>]*>/gi, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Limit excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Ensure reasonable length
      .substring(0, 100000)
  }
}