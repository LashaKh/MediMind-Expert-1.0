/**
 * Template Validation Schemas
 * 
 * Zod schemas for validating custom report template data
 * following medical software safety standards.
 */

import { z } from 'zod';
import { TEMPLATE_CONSTRAINTS } from '../../types/templates';

// Base validation schemas
export const templateNameSchema = z
  .string()
  .min(TEMPLATE_CONSTRAINTS.NAME_MIN_LENGTH, `Name must be at least ${TEMPLATE_CONSTRAINTS.NAME_MIN_LENGTH} characters`)
  .max(TEMPLATE_CONSTRAINTS.NAME_MAX_LENGTH, `Name must be less than ${TEMPLATE_CONSTRAINTS.NAME_MAX_LENGTH} characters`)
  .regex(TEMPLATE_CONSTRAINTS.NAME_PATTERN, 'Name contains invalid characters. Only letters, numbers, spaces, and common punctuation allowed')
  .trim();

export const exampleStructureSchema = z
  .string()
  .min(TEMPLATE_CONSTRAINTS.EXAMPLE_MIN_LENGTH, `Example structure must be at least ${TEMPLATE_CONSTRAINTS.EXAMPLE_MIN_LENGTH} characters`)
  .max(TEMPLATE_CONSTRAINTS.EXAMPLE_MAX_LENGTH, `Example structure must be less than ${TEMPLATE_CONSTRAINTS.EXAMPLE_MAX_LENGTH} characters`)
  .trim();

export const notesSchema = z
  .string()
  .max(TEMPLATE_CONSTRAINTS.NOTES_MAX_LENGTH, `Notes must be less than ${TEMPLATE_CONSTRAINTS.NOTES_MAX_LENGTH} characters`)
  .optional()
  .default('')
  .transform(value => value || ''); // Convert undefined to empty string

// Template CRUD schemas
export const createTemplateSchema = z.object({
  name: templateNameSchema,
  example_structure: exampleStructureSchema,
  notes: notesSchema,
});

export const updateTemplateSchema = z.object({
  name: templateNameSchema.optional(),
  example_structure: exampleStructureSchema.optional(),
  notes: notesSchema,
}).refine(data => {
  // At least one field must be provided for update
  return Object.values(data).some(value => value !== undefined && value !== '');
}, {
  message: 'At least one field must be updated',
});

// Template search and filtering
export const templateSearchSchema = z.object({
  search: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional()
    .default(''),
  order_by: z.enum(['created_at', 'usage_count', 'name'])
    .optional()
    .default('created_at'),
  order_direction: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

// Template ID validation
export const templateIdSchema = z.string()
  .uuid('Invalid template ID format');

// Full template object validation (for API responses)
export const userReportTemplateSchema = z.object({
  id: templateIdSchema,
  user_id: z.string().uuid('Invalid user ID format'),
  name: templateNameSchema,
  example_structure: exampleStructureSchema,
  notes: z.string().max(TEMPLATE_CONSTRAINTS.NOTES_MAX_LENGTH),
  created_at: z.string().datetime('Invalid created_at timestamp'),
  updated_at: z.string().datetime('Invalid updated_at timestamp'),
  usage_count: z.number().int().min(0, 'Usage count cannot be negative'),
  last_used_at: z.string().datetime().nullable(),
});

// Template list response validation
export const templateListResponseSchema = z.object({
  templates: z.array(userReportTemplateSchema),
  total_count: z.number().int().min(0),
});

// Template usage response validation
export const templateUsageResponseSchema = z.object({
  message: z.string(),
  usage_count: z.number().int().min(0),
});

// Error response validation
export const templateErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.object({
    field_errors: z.record(z.array(z.string())).optional(),
  }).optional(),
});

// Form data validation (for UI forms)
export const templateFormSchema = z.object({
  name: templateNameSchema,
  example_structure: exampleStructureSchema,
  notes: notesSchema,
});

// Medical content validation helpers
export function validateMedicalContent(content: string): boolean {
  // Basic validation for medical template content
  // Ensures content is meaningful and not just whitespace
  const trimmed = content.trim();
  
  if (trimmed.length < TEMPLATE_CONSTRAINTS.EXAMPLE_MIN_LENGTH) {
    return false;
  }
  
  // Check for meaningful medical structure indicators
  const medicalKeywords = [
    'patient', 'diagnosis', 'treatment', 'assessment', 'examination',
    'symptoms', 'history', 'plan', 'findings', 'recommendation',
    'vital', 'medication', 'procedure', 'clinical', 'medical'
  ];
  
  const lowerContent = trimmed.toLowerCase();
  const hasKeywords = medicalKeywords.some(keyword => 
    lowerContent.includes(keyword)
  );
  
  return hasKeywords || trimmed.includes('#') || trimmed.includes('- ') || trimmed.includes('*');
}

// Sanitization helpers for template content
export function sanitizeTemplateContent(content: string): string {
  // Remove potentially dangerous content while preserving medical formatting
  return content
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
}

// Type exports for use in components
export type CreateTemplateData = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateData = z.infer<typeof updateTemplateSchema>;
export type TemplateSearchData = z.infer<typeof templateSearchSchema>;
export type TemplateFormData = z.infer<typeof templateFormSchema>;
export type UserReportTemplateData = z.infer<typeof userReportTemplateSchema>;
export type TemplateListResponseData = z.infer<typeof templateListResponseSchema>;
export type TemplateErrorData = z.infer<typeof templateErrorSchema>;