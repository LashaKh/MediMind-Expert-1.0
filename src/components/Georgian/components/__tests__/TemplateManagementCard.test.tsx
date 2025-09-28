import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateManagementCard } from '../TemplateManagementCard';
import { UserReportTemplate } from '../../../../types/templates';

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();
const mockOnToggleFavorite = vi.fn();
const mockOnUse = vi.fn();

const mockTemplate: UserReportTemplate = {
  id: 'template-1',
  user_id: 'test-user-id',
  name: 'Cardiology Consultation',
  description: 'Standard cardiology consultation template for patient assessments',
  content: 'Chief Complaint: {{chief_complaint}}\nHistory: {{history}}\nExamination: {{examination}}',
  category: 'consultation',
  usage_count: 15,
  is_favorite: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z'
};

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
  template: mockTemplate,
  onEdit: mockOnEdit,
  onDelete: mockOnDelete,
  onToggleFavorite: mockOnToggleFavorite,
  onUse: mockOnUse
};

describe('TemplateManagementCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render template information correctly', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
    expect(screen.getByText('Standard cardiology consultation template for patient assessments')).toBeInTheDocument();
    expect(screen.getByText('consultation')).toBeInTheDocument();
    expect(screen.getByText('15 uses')).toBeInTheDocument();
  });

  it('should show favorite icon when template is favorited', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    expect(favoriteButton).toHaveClass('text-yellow-500'); // Filled star
  });

  it('should show unfavorite icon when template is not favorited', () => {
    const unfavoritedTemplate = { ...mockTemplate, is_favorite: false };
    
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={unfavoritedTemplate} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    expect(favoriteButton).toHaveClass('text-gray-400'); // Empty star
  });

  it('should call onToggleFavorite when favorite button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    fireEvent.click(favoriteButton);

    expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockTemplate);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const editButton = screen.getByLabelText(/edit template/i);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplate);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const deleteButton = screen.getByLabelText(/delete template/i);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTemplate);
  });

  it('should call onUse when use button is clicked', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const useButton = screen.getByRole('button', { name: /use template/i });
    fireEvent.click(useButton);

    expect(mockOnUse).toHaveBeenCalledWith(mockTemplate);
  });

  it('should display formatted creation date', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/created jan 1, 2025/i)).toBeInTheDocument();
  });

  it('should display last updated date if different from creation', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/updated jan 15, 2025/i)).toBeInTheDocument();
  });

  it('should show only creation date if never updated', () => {
    const neverUpdatedTemplate = {
      ...mockTemplate,
      updated_at: mockTemplate.created_at
    };

    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={neverUpdatedTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText(/created jan 1, 2025/i)).toBeInTheDocument();
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const longDescriptionTemplate = {
      ...mockTemplate,
      description: 'This is a very long description that should be truncated when it exceeds the maximum character limit for display purposes in the template card component to maintain a clean and organized layout.'
    };

    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={longDescriptionTemplate} />
      </TestWrapper>
    );

    const description = screen.getByText(/this is a very long description/i);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('should handle template with no description', () => {
    const noDescriptionTemplate = {
      ...mockTemplate,
      description: null
    };

    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={noDescriptionTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('should show correct usage count formatting', () => {
    const zeroUsageTemplate = { ...mockTemplate, usage_count: 0 };
    const { rerender } = render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={zeroUsageTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('0 uses')).toBeInTheDocument();

    const singleUsageTemplate = { ...mockTemplate, usage_count: 1 };
    rerender(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={singleUsageTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('1 use')).toBeInTheDocument();

    const multipleUsageTemplate = { ...mockTemplate, usage_count: 5 };
    rerender(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={multipleUsageTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('5 uses')).toBeInTheDocument();
  });

  it('should display category with proper formatting', () => {
    const emergencyTemplate = { ...mockTemplate, category: 'emergency' };
    const { rerender } = render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={emergencyTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('emergency')).toBeInTheDocument();
    expect(screen.getByText('emergency')).toHaveClass('bg-red-100', 'text-red-800');

    const consultationTemplate = { ...mockTemplate, category: 'consultation' };
    rerender(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={consultationTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('consultation')).toHaveClass('bg-blue-100', 'text-blue-800');

    const procedureTemplate = { ...mockTemplate, category: 'procedure' };
    rerender(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} template={procedureTemplate} />
      </TestWrapper>
    );

    expect(screen.getByText('procedure')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should have mobile-friendly touch targets', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    const editButton = screen.getByLabelText(/edit template/i);
    const deleteButton = screen.getByLabelText(/delete template/i);
    const useButton = screen.getByRole('button', { name: /use template/i });

    // Check minimum touch target size (44px)
    expect(favoriteButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    expect(editButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    expect(deleteButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    expect(useButton).toHaveClass('min-h-[44px]');
  });

  it('should show hover effects on interactive elements', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const card = screen.getByRole('article');
    expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow');

    const useButton = screen.getByRole('button', { name: /use template/i });
    expect(useButton).toHaveClass('hover:bg-blue-700');
  });

  it('should display content preview with proper truncation', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/chief complaint:/i)).toBeInTheDocument();
    
    const contentPreview = screen.getByText(/chief complaint:/i).closest('div');
    expect(contentPreview).toHaveClass('line-clamp-3');
  });

  it('should handle keyboard navigation', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    const editButton = screen.getByLabelText(/edit template/i);
    const deleteButton = screen.getByLabelText(/delete template/i);
    const useButton = screen.getByRole('button', { name: /use template/i });

    // All interactive elements should be focusable
    expect(favoriteButton).toHaveAttribute('tabIndex', '0');
    expect(editButton).toHaveAttribute('tabIndex', '0');
    expect(deleteButton).toHaveAttribute('tabIndex', '0');
    expect(useButton).toHaveAttribute('tabIndex', '0');
  });

  it('should show loading state when actions are in progress', async () => {
    const { rerender } = render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    // Simulate loading state
    rerender(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} isLoading={true} />
      </TestWrapper>
    );

    // Buttons should be disabled during loading
    expect(screen.getByLabelText(/toggle favorite/i)).toBeDisabled();
    expect(screen.getByLabelText(/edit template/i)).toBeDisabled();
    expect(screen.getByLabelText(/delete template/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /use template/i })).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <TemplateManagementCard {...defaultProps} />
      </TestWrapper>
    );

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-labelledby');

    const favoriteButton = screen.getByLabelText(/toggle favorite/i);
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    const editButton = screen.getByLabelText(/edit template/i);
    expect(editButton).toHaveAttribute('aria-label', 'Edit template');

    const deleteButton = screen.getByLabelText(/delete template/i);
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete template');
  });
});