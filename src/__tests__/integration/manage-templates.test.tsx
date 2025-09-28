import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeorgianSTTApp } from '../../components/Georgian/GeorgianSTTApp';
import { templateService } from '../../services/templateService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');
vi.mock('../../services/templateService');

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

const mockTemplates = [
  {
    id: 'template-1',
    user_id: 'test-user-id',
    name: 'Cardiology Consultation',
    description: 'Standard cardiology consultation template',
    content: 'Chief Complaint: {{chief_complaint}}\nHistory: {{history}}',
    category: 'consultation',
    usage_count: 5,
    is_favorite: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template-2', 
    user_id: 'test-user-id',
    name: 'Emergency Assessment',
    description: 'Emergency room assessment template',
    content: 'Vitals: {{vitals}}\nAssessment: {{assessment}}',
    category: 'emergency',
    usage_count: 2,
    is_favorite: false,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z'
  }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Integration: Manage Templates User Story', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Supabase auth
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    // Mock template service methods
    vi.mocked(templateService.getUserTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(templateService.updateTemplate).mockResolvedValue(mockTemplates[0]);
    vi.mocked(templateService.deleteTemplate).mockResolvedValue();
  });

  it('should display user templates and allow management operations', async () => {
    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
      expect(screen.getByText('Emergency Assessment')).toBeInTheDocument();
    });

    // Verify template service was called
    expect(templateService.getUserTemplates).toHaveBeenCalledWith('test-user-id');
  });

  it('should allow editing a template', async () => {
    const updatedTemplate = {
      ...mockTemplates[0],
      name: 'Updated Cardiology Template',
      description: 'Updated description'
    };
    
    vi.mocked(templateService.updateTemplate).mockResolvedValue(updatedTemplate);

    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
    });

    // Find and click edit button for first template
    const editButtons = screen.getAllByLabelText(/edit template/i);
    fireEvent.click(editButtons[0]);

    // Wait for edit modal to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Update template name
    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Cardiology Template' } });

    // Update description
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Verify update was called
    await waitFor(() => {
      expect(templateService.updateTemplate).toHaveBeenCalledWith(
        'template-1',
        expect.objectContaining({
          name: 'Updated Cardiology Template',
          description: 'Updated description'
        })
      );
    });
  });

  it('should allow marking template as favorite', async () => {
    const favoritedTemplate = { ...mockTemplates[1], is_favorite: true };
    vi.mocked(templateService.updateTemplate).mockResolvedValue(favoritedTemplate);

    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Emergency Assessment')).toBeInTheDocument();
    });

    // Find and click favorite button for second template (not favorited)
    const favoriteButtons = screen.getAllByLabelText(/toggle favorite/i);
    fireEvent.click(favoriteButtons[1]);

    // Verify favorite update was called
    await waitFor(() => {
      expect(templateService.updateTemplate).toHaveBeenCalledWith(
        'template-2',
        expect.objectContaining({
          is_favorite: true
        })
      );
    });
  });

  it('should allow deleting a template with confirmation', async () => {
    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Emergency Assessment')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByLabelText(/delete template/i);
    fireEvent.click(deleteButtons[1]);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Verify deletion was called
    await waitFor(() => {
      expect(templateService.deleteTemplate).toHaveBeenCalledWith('template-2');
    });
  });

  it('should show template usage statistics', async () => {
    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load and check usage statistics
    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
      expect(screen.getByText('5 uses')).toBeInTheDocument();
      expect(screen.getByText('2 uses')).toBeInTheDocument();
    });
  });

  it('should allow searching through templates', async () => {
    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
      expect(screen.getByText('Emergency Assessment')).toBeInTheDocument();
    });

    // Find search input and search for "cardiology"
    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'cardiology' } });

    // Should show only cardiology template
    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
      expect(screen.queryByText('Emergency Assessment')).not.toBeInTheDocument();
    });
  });

  it('should handle empty state when no templates exist', async () => {
    vi.mocked(templateService.getUserTemplates).mockResolvedValue([]);

    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first template/i)).toBeInTheDocument();
    });
  });

  it('should handle template loading errors gracefully', async () => {
    vi.mocked(templateService.getUserTemplates).mockRejectedValue(
      new Error('Failed to fetch templates')
    );

    render(
      <TestWrapper>
        <GeorgianSTTApp />
      </TestWrapper>
    );

    // Navigate to templates section
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error loading templates/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});