/**
 * ReportEdit Model
 * 
 * Model interface and validation for report edit operations.
 * Provides type safety and validation for edit data.
 * 
 * Features:
 * - Type validation
 * - Data sanitization
 * - Business rule enforcement
 * - Medical data validation
 * - HIPAA compliance checks
 */

import { ReportEdit, EditType, ValidationError, ProcessingMetadata } from '../types/reportEditing'

export class ReportEditModel {
  
  // Validation Methods
  static validate(edit: Partial<ReportEdit>): ValidationError[] {
    const errors: ValidationError[] = []
    
    // Required field validation
    if (!edit.report_id?.trim()) {
      errors.push({
        code: 'MISSING_REPORT_ID',
        message: 'Report ID is required',
        field: 'report_id',
        value: edit.report_id,
        recoverable: true
      })
    }
    
    if (!edit.user_id?.trim()) {
      errors.push({
        code: 'MISSING_USER_ID',
        message: 'User ID is required',
        field: 'user_id',
        value: edit.user_id,
        recoverable: true
      })
    }
    
    if (!edit.session_id?.trim()) {
      errors.push({
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required',
        field: 'session_id',
        value: edit.session_id,
        recoverable: true
      })
    }
    
    if (!edit.edit_type) {
      errors.push({
        code: 'MISSING_EDIT_TYPE',
        message: 'Edit type is required',
        field: 'edit_type',
        value: edit.edit_type,
        recoverable: true
      })
    } else if (!this.validateEditType(edit.edit_type)) {
      errors.push({
        code: 'INVALID_EDIT_TYPE',
        message: 'Edit type must be text_instruction, voice_instruction, or manual_edit',
        field: 'edit_type',
        value: edit.edit_type,
        recoverable: true
      })
    }
    
    if (!edit.original_content?.trim()) {
      errors.push({
        code: 'MISSING_ORIGINAL_CONTENT',
        message: 'Original content is required',
        field: 'original_content',
        value: edit.original_content,
        recoverable: true
      })
    }
    
    if (!edit.updated_content?.trim()) {
      errors.push({
        code: 'MISSING_UPDATED_CONTENT',
        message: 'Updated content is required',
        field: 'updated_content',
        value: edit.updated_content,
        recoverable: true
      })
    }
    
    // Content validation
    if (edit.original_content && edit.updated_content) {
      if (!this.validateContent(edit.original_content, edit.updated_content)) {
        errors.push({
          code: 'IDENTICAL_CONTENT',
          message: 'Original and updated content cannot be identical',
          field: 'updated_content',
          value: edit.updated_content,
          recoverable: true
        })
      }
    }
    
    // Voice transcript validation
    if (edit.edit_type && !this.validateVoiceTranscript(edit.edit_type, edit.voice_transcript)) {
      errors.push({
        code: 'MISSING_VOICE_TRANSCRIPT',
        message: 'Voice transcript is required for voice_instruction edit type',
        field: 'voice_transcript',
        value: edit.voice_transcript,
        recoverable: true
      })
    }
    
    // Session ID format validation
    if (edit.session_id && !this.isValidSessionId(edit.session_id)) {
      errors.push({
        code: 'INVALID_SESSION_ID',
        message: 'Session ID format is invalid',
        field: 'session_id',
        value: edit.session_id,
        recoverable: true
      })
    }
    
    // Medical content validation
    if (edit.updated_content) {
      const medicalValidation = this.validateMedicalContent(edit.updated_content)
      if (!medicalValidation.isValid) {
        errors.push({
          code: 'MEDICAL_CONTENT_INVALID',
          message: 'Medical content validation failed',
          field: 'updated_content',
          value: edit.updated_content,
          recoverable: true,
          details: { warnings: medicalValidation.warnings }
        })
      }
    }
    
    return errors
  }
  
  static validateEditType(editType: string): boolean {
    const validTypes: EditType[] = ['text_instruction', 'voice_instruction', 'manual_edit']
    return validTypes.includes(editType as EditType)
  }
  
  static validateContent(originalContent: string, updatedContent: string): boolean {
    if (!originalContent?.trim() || !updatedContent?.trim()) {
      return false
    }
    
    // Content must be different (after normalization)
    const normalizedOriginal = originalContent.trim().toLowerCase()
    const normalizedUpdated = updatedContent.trim().toLowerCase()
    
    return normalizedOriginal !== normalizedUpdated
  }
  
  static validateVoiceTranscript(editType: EditType, voiceTranscript?: string): boolean {
    if (editType === 'voice_instruction') {
      return Boolean(voiceTranscript?.trim())
    }
    return true // Not required for other types
  }
  
  // Data Sanitization
  static sanitizeInstruction(instruction: string): string {
    if (!instruction) return ''
    
    return instruction
      .trim()
      // Remove potential script injections
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove HTML tags but preserve content
      .replace(/<[^>]*>/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Limit length for safety
      .substring(0, 2000)
  }
  
  static sanitizeContent(content: string): string {
    if (!content) return ''
    
    return content
      .trim()
      // Remove script tags but preserve medical content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Preserve line breaks in medical reports
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize excessive whitespace while preserving structure
      .replace(/ +/g, ' ')
      // Limit content length
      .substring(0, 50000)
  }
  
  // Business Rules
  static isContentChanged(original: string, updated: string): boolean {
    return this.validateContent(original, updated)
  }
  
  static isValidSessionId(sessionId: string): boolean {
    if (!sessionId?.trim()) return false
    
    // Session ID should be alphanumeric with hyphens, reasonable length
    const sessionIdPattern = /^[a-zA-Z0-9-_]{10,100}$/
    return sessionIdPattern.test(sessionId.trim())
  }
  
  // Medical Validation
  static validateMedicalContent(content: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    
    if (!content?.trim()) {
      return { isValid: false, warnings: ['Content is empty'] }
    }
    
    // Check for suspicious non-medical content
    const suspiciousPatterns = [
      /😊|😁|🎉|💯/g, // Emojis not appropriate in medical records
      /lol|omg|wtf/gi, // Informal language
      /amazing|awesome|fantastic/gi, // Overly positive language for medical context
    ]
    
    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const patternNames = ['emojis', 'informal language', 'inappropriate enthusiasm']
        warnings.push(`Contains ${patternNames[index]} inappropriate for medical records`)
      }
    })
    
    // Check for missing critical medical structure
    const hasPatientReference = /patient|pt\.|case|subject/i.test(content)
    if (!hasPatientReference) {
      warnings.push('Content may be missing patient reference')
    }
    
    // Check for potential PHI (simplified check)
    const potentialPHI = [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
      /\b\d{10,}\b/g, // Long numbers that might be IDs
    ]
    
    potentialPHI.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const types = ['Social Security Numbers', 'potential ID numbers']
        warnings.push(`May contain ${types[index]} - ensure PHI is properly anonymized`)
      }
    })
    
    // Content is valid if no critical issues found
    const isValid = warnings.length === 0 || warnings.every(w => 
      w.includes('may be missing') || w.includes('ensure PHI')
    )
    
    return { isValid, warnings }
  }
  
  // Factory Methods
  static create(data: Partial<ReportEdit>): ReportEdit {
    const errors = this.validate(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`)
    }
    
    const now = new Date().toISOString()
    
    return {
      id: data.id || crypto.randomUUID(),
      report_id: data.report_id!,
      user_id: data.user_id!,
      session_id: data.session_id!,
      edit_type: data.edit_type!,
      instruction_text: data.instruction_text ? this.sanitizeInstruction(data.instruction_text) : undefined,
      voice_transcript: data.voice_transcript?.trim() || undefined,
      original_content: this.sanitizeContent(data.original_content!),
      updated_content: this.sanitizeContent(data.updated_content!),
      processing_metadata: data.processing_metadata || {},
      created_at: data.created_at || now,
      processed_at: data.processed_at
    }
  }
  
  static fromApiResponse(response: any): ReportEdit {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid API response format')
    }
    
    return {
      id: response.id,
      report_id: response.report_id,
      user_id: response.user_id,
      session_id: response.session_id,
      edit_type: response.edit_type as EditType,
      instruction_text: response.instruction_text || undefined,
      voice_transcript: response.voice_transcript || undefined,
      original_content: response.original_content,
      updated_content: response.updated_content,
      processing_metadata: response.processing_metadata || {},
      created_at: response.created_at,
      processed_at: response.processed_at || undefined
    }
  }
  
  static toApiRequest(edit: ReportEdit): any {
    return {
      report_id: edit.report_id,
      session_id: edit.session_id,
      edit_type: edit.edit_type,
      instruction_text: edit.instruction_text || null,
      voice_transcript: edit.voice_transcript || null,
      original_content: edit.original_content,
      updated_content: edit.updated_content,
      processing_metadata: edit.processing_metadata
    }
  }
  
  // Utility Methods
  static calculateContentDifference(original: string, updated: string): {
    additions: number
    deletions: number
    charactersChanged: number
  } {
    const originalLength = original?.length || 0
    const updatedLength = updated?.length || 0
    
    if (originalLength === 0) {
      return {
        additions: updatedLength,
        deletions: 0,
        charactersChanged: updatedLength
      }
    }
    
    if (updatedLength === 0) {
      return {
        additions: 0,
        deletions: originalLength,
        charactersChanged: originalLength
      }
    }
    
    // Simple character-based diff calculation
    const lengthDiff = updatedLength - originalLength
    const additions = Math.max(0, lengthDiff)
    const deletions = Math.max(0, -lengthDiff)
    
    // Rough estimate of changes by comparing character by character
    let changedChars = 0
    const minLength = Math.min(originalLength, updatedLength)
    
    for (let i = 0; i < minLength; i++) {
      if (original[i] !== updated[i]) {
        changedChars++
      }
    }
    
    return {
      additions,
      deletions,
      charactersChanged: changedChars + Math.abs(lengthDiff)
    }
  }
  
  static generateEditSummary(edit: ReportEdit): string {
    const diff = this.calculateContentDifference(edit.original_content, edit.updated_content)
    const changeType = edit.edit_type === 'manual_edit' ? 'Manual edit' : 
                      edit.edit_type === 'voice_instruction' ? 'Voice instruction' : 'Text instruction'
    
    const instruction = edit.instruction_text || edit.voice_transcript || 'Direct content modification'
    const truncatedInstruction = instruction.length > 100 ? 
      instruction.substring(0, 100) + '...' : instruction
    
    return `${changeType}: ${truncatedInstruction} (${diff.charactersChanged} chars changed)`
  }
}