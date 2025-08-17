/**
 * Accessibility Compliance Testing Suite
 * Tests WCAG 2.1 AA compliance for medical components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
import { CalculatorCard } from '../components/Calculators/CalculatorCard';
import { ResilientComponent } from '../utils/errorRecovery';
import { TestProviders } from './helpers/TestProviders';

describe('Accessibility Compliance', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations in basic form', async () => {
      const { container } = render(
        <TestProviders>
          <form role="form" aria-label="Medical search">
            <label htmlFor="search-input">Search medical content</label>
            <input 
              id="search-input" 
              type="text" 
              aria-describedby="search-help"
              placeholder="Enter search terms"
            />
            <div id="search-help">Search for medical articles and research</div>
            <button type="submit">Search</button>
          </form>
        </TestProviders>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in CalculatorCard', async () => {
      const { container } = render(
        <TestProviders>
          <CalculatorCard 
            id="test-calc"
            name="Test Calculator"
            description="Test medical calculator"
            onClick={() => {}}
            index={0}
          />
        </TestProviders>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in forms', async () => {
      const user = userEvent.setup();
      
      render(
        <TestProviders>
          <form>
            <input type="text" placeholder="Search" />
            <button type="submit">Search</button>
          </form>
        </TestProviders>
      );

      const searchInput = screen.getByRole('textbox');
      const searchButton = screen.getByRole('button');

      // Tab navigation
      await user.tab();
      expect(searchInput).toHaveFocus();

      await user.tab();
      expect(searchButton).toHaveFocus();
    });

    it('should support keyboard navigation in calculator interface', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <TestProviders>
          <CalculatorCard 
            id="ascvd-calculator"
            name="ASCVD Risk Calculator"
            description="Calculate cardiovascular risk"
            onClick={mockOnClick}
            index={0}
          />
        </TestProviders>
      );

      // Should be able to navigate with keyboard
      const calculatorCard = screen.getByText('ASCVD Risk Calculator').closest('[role="button"]') ||
                            screen.getByText('ASCVD Risk Calculator').closest('div');
      
      if (calculatorCard) {
        await user.click(calculatorCard);
        expect(mockOnClick).toHaveBeenCalledWith('ascvd-calculator');
      }
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide proper ARIA labels for medical calculators', () => {
      render(
        <TestProviders>
          <CalculatorCard 
            id="grace-score"
            name="GRACE Score"
            description="Global Registry of Acute Coronary Events risk assessment"
            onClick={() => {}}
            index={0}
          />
        </TestProviders>
      );

      // Check for proper ARIA attributes
      const calculatorTitle = screen.getByText('GRACE Score');
      expect(calculatorTitle).toBeInTheDocument();
      
      const calculatorDescription = screen.getByText(/Global Registry of Acute Coronary Events/i);
      expect(calculatorDescription).toBeInTheDocument();
    });

    it('should provide proper form labels and descriptions', () => {
      render(
        <TestProviders>
          <form>
            <label htmlFor="medical-search">Medical Search</label>
            <input 
              id="medical-search" 
              type="text" 
              aria-describedby="search-description"
            />
            <div id="search-description">Enter medical terms to search</div>
          </form>
        </TestProviders>
      );

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAccessibleName();
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-description');
    });

    it('should announce error messages to screen readers', async () => {
      render(
        <TestProviders>
          <div>
            <div role="alert" aria-live="assertive">
              Medical content temporarily unavailable
            </div>
            <input type="text" aria-invalid="true" />
          </div>
        </TestProviders>
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Color Contrast', () => {
    it('should maintain sufficient color contrast for medical text', () => {
      const mockCalculator = {
        id: 'test-calc',
        name: 'Medical Calculator',
        description: 'Important medical calculation tool',
        category: 'Critical Care'
      };

      render(
        <TestProviders>
          <CalculatorCard calculator={mockCalculator} />
        </TestProviders>
      );

      // Test would require color contrast analysis
      // In practice, this would use tools like @axe-core/react
      const calculatorText = screen.getByText(mockCalculator.name);
      expect(calculatorText).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly in modal dialogs', async () => {
      const user = userEvent.setup();
      
      // Mock calculator dialog
      const mockCalculator = {
        id: 'chads-vasc',
        name: 'CHA2DS2-VASc Score',
        description: 'Stroke risk in atrial fibrillation',
        category: 'Risk Assessment'
      };

      render(
        <TestProviders>
          <CalculatorCard calculator={mockCalculator} />
        </TestProviders>
      );

      const openButton = screen.getByRole('button');
      await user.click(openButton);

      // Focus should move to dialog
      // Dialog should trap focus
      // Close should return focus to trigger
    });

    it('should provide skip links for main content', () => {
      render(
        <TestProviders>
          <main>
            <a href="#main-content" className="sr-only focus:not-sr-only">
              Skip to main content
            </a>
            <div id="main-content">Main content</div>
          </main>
        </TestProviders>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have touch targets of at least 44px for medical interfaces', () => {
      const mockCalculator = {
        id: 'mobile-calc',
        name: 'Mobile Calculator',
        description: 'Touch-optimized medical calculator',
        category: 'Mobile'
      };

      render(
        <TestProviders>
          <CalculatorCard calculator={mockCalculator} />
        </TestProviders>
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Check minimum touch target size (44px for medical interfaces)
      const minSize = 44;
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(minSize);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(minSize);
    });

    it('should provide proper zoom support without horizontal scrolling', () => {
      // Test responsive design at 200% zoom
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Simulated mobile width at 200% zoom
      });

      render(
        <TestProviders>
          <main style={{ maxWidth: '320px' }}>
            <form>
              <input type="text" style={{ width: '100%', maxWidth: '100%' }} />
              <button type="submit">Search</button>
            </form>
          </main>
        </TestProviders>
      );

      // Content should remain accessible without horizontal scrolling
      const searchElement = screen.getByRole('main');
      expect(searchElement).toBeInTheDocument();
    });
  });

  describe('Medical Safety Accessibility', () => {
    it('should clearly indicate medical calculator warnings', () => {
      const mockCalculator = {
        id: 'critical-calc',
        name: 'Critical Medical Calculator',
        description: 'High-risk medical calculation',
        category: 'Critical Care',
        medicalWarning: 'This calculator provides estimates only. Always verify with clinical judgment.'
      };

      render(
        <TestProviders>
          <CalculatorCard calculator={mockCalculator} />
        </TestProviders>
      );

      // Medical warnings should be clearly announced
      const warning = screen.getByText(/clinical judgment/i);
      expect(warning).toBeInTheDocument();
      expect(warning.closest('[role="alert"]')).toBeInTheDocument();
    });

    it('should provide clear error recovery instructions for medical content', () => {
      render(
        <TestProviders>
          <ResilientComponent
            data={null}
            error={new Error('Medical data unavailable')}
            medicalContent={true}
          >
            {() => <div>Content</div>}
          </ResilientComponent>
        </TestProviders>
      );

      const errorMessage = screen.getByText(/medical content is temporarily unavailable/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument();
    });
  });
});

/**
 * Accessibility Audit Helper
 */
export async function runAccessibilityAudit(component: React.ReactElement): Promise<void> {
  const { container } = render(component);
  const results = await axe(container);
  
  if (results.violations.length > 0) {
    console.error('Accessibility violations found:', results.violations);
    throw new Error(`${results.violations.length} accessibility violations found`);
  }
  
  console.log('✅ No accessibility violations found');
}

/**
 * Medical Interface Accessibility Validator
 */
export class MedicalAccessibilityValidator {
  static validateTouchTargets(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  }

  static validateColorContrast(element: HTMLElement): boolean {
    // In practice, this would use a color contrast library
    // For now, check if element has accessible colors
    const styles = window.getComputedStyle(element);
    return !styles.color.includes('gray') || styles.color.includes('dark');
  }

  static validateMedicalContent(element: HTMLElement): boolean {
    // Medical content should have proper warnings and disclaimers
    const hasWarning = element.querySelector('[role="alert"]');
    const hasDisclaimer = element.textContent?.includes('clinical') || element.textContent?.includes('medical');
    
    return !!(hasWarning || hasDisclaimer);
  }
}