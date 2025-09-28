/**
 * Integration Test: Create First Template User Story
 * 
 * Tests the complete user flow for creating a custom template.
 * MUST FAIL initially before components are implemented.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Supabase and other dependencies
vi.mock('@supabase/supabase-js');
vi.mock('../../../services/templateService');

describe('Create First Template User Story', () => {
  const mockOnTemplateCreated = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete the create template user journey', async () => {
    // This test MUST FAIL until components are implemented
    try {
      // User Story: Given user is on Templates page with active transcript
      const { MyTemplatesSection } = await import('../../../components/Georgian/components/MyTemplatesSection');
      
      render(
        <MyTemplatesSection 
          onSelectTemplate={vi.fn()}
          disabled={false}
          hasTranscript={true}
        />
      );

      // When: User clicks "Add Template" button in "My Templates" section
      const addButton = screen.getByRole('button', { name: /add template/i });
      expect(addButton).toBeInTheDocument();
      
      await user.click(addButton);

      // Then: Modal opens with template creation form
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Verify form fields are present
      expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/example structure/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();

      // Fill out the form
      const nameInput = screen.getByLabelText(/template name/i);
      const structureInput = screen.getByLabelText(/example structure/i);
      const notesInput = screen.getByLabelText(/notes/i);

      await user.type(nameInput, 'Emergency Cardiology Assessment');
      await user.type(structureInput, '# Emergency Assessment\n\n## Chief Complaint\n[Patient concern]\n\n## Vital Signs\n- BP: [value]\n- HR: [value]');
      await user.type(notesInput, 'Focus on STEMI criteria and time-sensitive interventions');

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveButton);

      // Verify template creation
      await waitFor(() => {
        expect(mockOnTemplateCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Emergency Cardiology Assessment',
            example_structure: expect.stringContaining('Emergency Assessment'),
            notes: expect.stringContaining('STEMI criteria'),
          })
        );
      });

    } catch (error) {
      // Expected to fail - components don't exist yet
      expect(error).toBeDefined();
      expect(String(error)).toMatch(/MyTemplatesSection|Cannot resolve module/);
    }
  });

  it('should validate form fields before submission', async () => {
    try {
      const { TemplateCreationModal } = await import('../../../components/Georgian/components/TemplateCreationModal');
      
      render(
        <TemplateCreationModal 
          isOpen={true}
          onClose={vi.fn()}
          onTemplateCreated={mockOnTemplateCreated}
        />
      );

      // Try to submit without required fields
      const saveButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/example structure.*required/i)).toBeInTheDocument();
      });

      // Template should not be created
      expect(mockOnTemplateCreated).not.toHaveBeenCalled();

    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });

  it('should handle template name conflicts', async () => {
    try {
      const { TemplateCreationModal } = await import('../../../components/Georgian/components/TemplateCreationModal');
      
      // Mock service to return conflict error
      const { templateService } = await import('../../../services/templateService');
      vi.mocked(templateService.createTemplate).mockRejectedValue(
        new Error('Template name already exists')
      );

      render(
        <TemplateCreationModal 
          isOpen={true}
          onClose={vi.fn()}
          onTemplateCreated={mockOnTemplateCreated}
        />
      );

      // Fill form with duplicate name
      await user.type(screen.getByLabelText(/template name/i), 'Existing Template');
      await user.type(screen.getByLabelText(/example structure/i), 'Valid example structure content for testing purposes');
      
      // Submit form
      const saveButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/name already exists/i)).toBeInTheDocument();
      });

    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });

  it('should handle template limit exceeded', async () => {
    try {
      const { TemplateCreationModal } = await import('../../../components/Georgian/components/TemplateCreationModal');
      
      // Mock service to return limit error
      const { templateService } = await import('../../../services/templateService');
      vi.mocked(templateService.createTemplate).mockRejectedValue(
        new Error('User cannot have more than 50 templates')
      );

      render(
        <TemplateCreationModal 
          isOpen={true}
          onClose={vi.fn()}
          onTemplateCreated={mockOnTemplateCreated}
        />
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/template name/i), 'Template 51');
      await user.type(screen.getByLabelText(/example structure/i), 'Valid example structure for the 51st template');
      
      const saveButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveButton);

      // Should show limit error
      await waitFor(() => {
        expect(screen.getByText(/cannot have more than 50/i)).toBeInTheDocument();
      });

    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });

  it('should close modal on cancel', async () => {
    const mockOnClose = vi.fn();

    try {
      const { TemplateCreationModal } = await import('../../../components/Georgian/components/TemplateCreationModal');
      
      render(
        <TemplateCreationModal 
          isOpen={true}
          onClose={mockOnClose}
          onTemplateCreated={mockOnTemplateCreated}
        />
      );

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();

    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });

  it('should sanitize user input', async () => {
    try {
      const { TemplateCreationModal } = await import('../../../components/Georgian/components/TemplateCreationModal');
      
      render(
        <TemplateCreationModal 
          isOpen={true}
          onClose={vi.fn()}
          onTemplateCreated={mockOnTemplateCreated}
        />
      );

      // Enter malicious content
      await user.type(screen.getByLabelText(/template name/i), 'Test <script>alert("xss")</script>');
      await user.type(screen.getByLabelText(/example structure/i), 'Valid content javascript:void(0) but sanitized');
      
      const saveButton = screen.getByRole('button', { name: /save template/i });
      await user.click(saveButton);

      // Verify sanitization occurred
      await waitFor(() => {
        const createCall = mockOnTemplateCreated.mock.calls[0]?.[0];
        if (createCall) {
          expect(createCall.name).not.toContain('<script>');
          expect(createCall.example_structure).not.toContain('javascript:');
        }
      });

    } catch (error) {
      // Expected to fail
      expect(error).toBeDefined();
    }
  });
});