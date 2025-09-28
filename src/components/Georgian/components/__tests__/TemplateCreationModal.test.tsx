import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateCreationModal } from '../TemplateCreationModal';
import { templateService } from '../../../../services/templateService';

vi.mock('../../../../services/templateService');

const mockOnClose = vi.fn();
const mockOnSuccess = vi.fn();

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

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSuccess: mockOnSuccess,
  userId: 'test-user-id'
};

describe('TemplateCreationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Template')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display all required form fields', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/template content/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/template name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });
  });

  it('should validate template name length', async () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/template name/i);
    fireEvent.change(nameInput, { target: { value: 'x'.repeat(101) } });

    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be 100 characters or less/i)).toBeInTheDocument();
    });
  });

  it('should validate content length', async () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const contentTextarea = screen.getByLabelText(/template content/i);
    fireEvent.change(contentTextarea, { target: { value: 'x'.repeat(10001) } });

    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/content must be 10000 characters or less/i)).toBeInTheDocument();
    });
  });

  it('should create template with valid data', async () => {
    const mockTemplate = {
      id: 'new-template-id',
      user_id: 'test-user-id',
      name: 'Test Template',
      description: 'Test description',
      content: 'Test content with {{placeholder}}',
      category: 'consultation',
      usage_count: 0,
      is_favorite: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    vi.mocked(templateService.createTemplate).mockResolvedValue(mockTemplate);

    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/template name/i), {
      target: { value: 'Test Template' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'consultation' }
    });
    fireEvent.change(screen.getByLabelText(/template content/i), {
      target: { value: 'Test content with {{placeholder}}' }
    });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(templateService.createTemplate).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        name: 'Test Template',
        description: 'Test description',
        content: 'Test content with {{placeholder}}',
        category: 'consultation'
      });
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockTemplate);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle creation errors', async () => {
    vi.mocked(templateService.createTemplate).mockRejectedValue(
      new Error('Failed to create template')
    );

    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/template name/i), {
      target: { value: 'Test Template' }
    });
    fireEvent.change(screen.getByLabelText(/template content/i), {
      target: { value: 'Test content' }
    });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create template/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking outside (overlay)', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close modal when clicking inside modal content', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const modalContent = screen.getByRole('dialog');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during creation', async () => {
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    
    vi.mocked(templateService.createTemplate).mockReturnValue(createPromise);

    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/template name/i), {
      target: { value: 'Test Template' }
    });
    fireEvent.change(screen.getByLabelText(/template content/i), {
      target: { value: 'Test content' }
    });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(createButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    // Resolve the promise
    resolveCreate!({
      id: 'new-template-id',
      user_id: 'test-user-id',
      name: 'Test Template',
      content: 'Test content'
    });
  });

  it('should support predefined categories', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const categorySelect = screen.getByLabelText(/category/i);
    
    expect(screen.getByRole('option', { name: /consultation/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /emergency/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /procedure/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /follow.up/i })).toBeInTheDocument();
  });

  it('should show character count for content field', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const contentTextarea = screen.getByLabelText(/template content/i);
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    expect(screen.getByText('12 / 10000')).toBeInTheDocument();
  });

  it('should highlight character count in red when approaching limit', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const contentTextarea = screen.getByLabelText(/template content/i);
    fireEvent.change(contentTextarea, { target: { value: 'x'.repeat(9500) } });

    const charCount = screen.getByText('9500 / 10000');
    expect(charCount).toHaveClass('text-red-500');
  });

  it('should reset form when modal reopens', async () => {
    const { rerender } = render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    // Open modal and fill form
    rerender(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} isOpen={true} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/template name/i), {
      target: { value: 'Test Name' }
    });

    // Close and reopen modal
    rerender(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    rerender(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} isOpen={true} />
      </TestWrapper>
    );

    // Form should be reset
    expect(screen.getByLabelText(/template name/i)).toHaveValue('');
  });

  it('should have mobile-friendly touch targets', () => {
    render(
      <TestWrapper>
        <TemplateCreationModal {...defaultProps} />
      </TestWrapper>
    );

    const createButton = screen.getByRole('button', { name: /create template/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const closeButton = screen.getByRole('button', { name: /close/i });

    // Check minimum touch target size (44px)
    expect(createButton).toHaveClass('min-h-[44px]');
    expect(cancelButton).toHaveClass('min-h-[44px]');
    expect(closeButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
  });
});