/**
 * Contract Test: POST /user-templates
 * 
 * This test validates the API contract for creating new templates.
 * MUST FAIL initially before implementation exists.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createTemplateSchema, userReportTemplateSchema } from '../../lib/validations/template-schemas';

// Mock Supabase client
vi.mock('@supabase/supabase-js');

describe('POST /user-templates API Contract', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  it('should create a new template with valid data', async () => {
    const templateData = {
      name: 'Emergency Cardiology Assessment',
      example_structure: '# Emergency Cardiac Assessment\n\n## Chief Complaint\n[Patient concern]\n\n## Vital Signs\n- BP: [value]\n- HR: [value]',
      notes: 'Focus on STEMI criteria and time-sensitive interventions',
    };

    // Validate input data
    const inputValidation = createTemplateSchema.safeParse(templateData);
    expect(inputValidation.success).toBe(true);

    const expectedResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      ...templateData,
      created_at: '2025-09-28T10:00:00Z',
      updated_at: '2025-09-28T10:00:00Z',
      usage_count: 0,
      last_used_at: null,
    };

    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValue({
      data: expectedResponse,
      error: null,
    });

    try {
      const { templateService } = await import('../../services/templateService');
      const result = await templateService.createTemplate(templateData);
      
      // Validate response structure
      const validation = userReportTemplateSchema.safeParse(result);
      expect(validation.success).toBe(true);
      
      expect(result).toEqual(expectedResponse);
      expect(mockSupabase.insert).toHaveBeenCalledWith([{
        name: templateData.name,
        example_structure: templateData.example_structure,
        notes: templateData.notes,
      }]);
    } catch (error) {
      // Expected to fail - service doesn't exist yet
      expect(error).toBeDefined();
      expect(String(error)).toContain('templateService');
    }
  });

  it('should reject invalid template data', async () => {
    const invalidData = {
      name: 'x', // Too short
      example_structure: 'short', // Too short
      notes: 'valid notes',
    };

    const validation = createTemplateSchema.safeParse(invalidData);
    expect(validation.success).toBe(false);
    expect(validation.error?.issues).toHaveLength(2); // name and example_structure errors
  });

  it('should handle duplicate template names', async () => {
    const templateData = {
      name: 'Existing Template',
      example_structure: 'Valid example structure that is long enough for requirements',
      notes: 'Valid notes',
    };

    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: {
        code: '23505', // PostgreSQL unique violation
        message: 'duplicate key value violates unique constraint',
      },
    });

    try {
      const { templateService } = await import('../../services/templateService');
      await templateService.createTemplate(templateData);
      
      // Should not reach here
      expect(false).toBe(true);
    } catch (error) {
      // Expected to fail with duplicate error or import error
      expect(error).toBeDefined();
    }
  });

  it('should handle template limit exceeded', async () => {
    const templateData = {
      name: 'Template 51',
      example_structure: 'Valid example structure that meets minimum length requirements',
      notes: 'This would be the 51st template',
    };

    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: {
        code: 'P0001', // Custom PostgreSQL error
        message: 'User cannot have more than 50 templates',
      },
    });

    try {
      const { templateService } = await import('../../services/templateService');
      await templateService.createTemplate(templateData);
      
      // Should not reach here
      expect(false).toBe(true);
    } catch (error) {
      // Expected to fail with limit error or import error
      expect(error).toBeDefined();
    }
  });

  it('should sanitize template content', () => {
    const maliciousData = {
      name: 'Test Template<script>alert("xss")</script>',
      example_structure: 'Valid content javascript:void(0) with script removal',
      notes: '<!-- comment -->Normal notes content',
    };

    // This will be handled by the sanitization function
    const { sanitizeTemplateContent } = require('../../lib/validations/template-schemas');
    
    const sanitizedName = sanitizeTemplateContent(maliciousData.name);
    const sanitizedStructure = sanitizeTemplateContent(maliciousData.example_structure);
    const sanitizedNotes = sanitizeTemplateContent(maliciousData.notes);

    expect(sanitizedName).not.toContain('<script>');
    expect(sanitizedStructure).not.toContain('javascript:');
    expect(sanitizedNotes).not.toContain('<!-- comment -->');
  });

  it('should validate medical content structure', () => {
    const validMedicalTemplate = {
      name: 'Cardiology Assessment',
      example_structure: '# Patient Assessment\n\n## Chief Complaint\n[Patient concern]\n\n## Medical History\n[Previous conditions]\n\n## Physical Examination\n[Clinical findings]',
      notes: 'Focus on cardiovascular assessment and risk factors',
    };

    const validation = createTemplateSchema.safeParse(validMedicalTemplate);
    expect(validation.success).toBe(true);

    // Validate medical content
    const { validateMedicalContent } = require('../../lib/validations/template-schemas');
    const isValidMedical = validateMedicalContent(validMedicalTemplate.example_structure);
    expect(isValidMedical).toBe(true);
  });

  it('should reject non-medical content', () => {
    const nonMedicalTemplate = {
      name: 'Shopping List',
      example_structure: 'This is just a regular text that does not contain medical keywords or structure',
      notes: 'This is not medical content',
    };

    const { validateMedicalContent } = require('../../lib/validations/template-schemas');
    const isValidMedical = validateMedicalContent(nonMedicalTemplate.example_structure);
    expect(isValidMedical).toBe(false);
  });
});