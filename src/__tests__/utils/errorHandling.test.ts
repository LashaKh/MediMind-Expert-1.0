/**
 * Unit tests for Error Handling Manager
 * Tests medical safety protocols, circuit breakers, and retry mechanisms
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { errorHandler, ErrorContext, MedicalErrorBoundary } from '../../utils/errorHandling';
import { render, screen } from '@testing-library/react';

// Mock console methods
const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorHandlingManager', () => {
  const mockContext: ErrorContext = {
    component: 'TestComponent',
    action: 'test_action',
    medicalContent: false,
    timestamp: Date.now(),
    sessionId: 'test_session',
    userAgent: 'test-agent',
    url: 'http://localhost:3000/test'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    errorHandler.clearErrorHistory();
    // Mock fetch for monitoring
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    errorHandler.clearErrorHistory();
  });

  describe('Error Severity Calculation', () => {
    it('should classify medical calculator errors as critical', () => {
      const calculatorContext: ErrorContext = {
        ...mockContext,
        medicalContent: true,
        action: 'calculator_calculation'
      };
      
      const error = new Error('Calculator failed');
      errorHandler.reportError(error, calculatorContext);
      
      const metrics = errorHandler.getMetrics();
      expect(metrics.criticalErrorCount).toBe(1);
      expect(metrics.medicalErrorCount).toBe(1);
    });

    it('should classify medical content errors as high severity', () => {
      const medicalContext: ErrorContext = {
        ...mockContext,
        medicalContent: true,
        action: 'fetch_medical_news'
      };
      
      const error = new Error('Medical content fetch failed');
      errorHandler.reportError(error, medicalContext);
      
      const metrics = errorHandler.getMetrics();
      expect(metrics.medicalErrorCount).toBe(1);
      expect(metrics.criticalErrorCount).toBe(0);
    });

    it('should handle non-medical errors appropriately', () => {
      const error = new Error('Generic error');
      errorHandler.reportError(error, mockContext);
      
      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.medicalErrorCount).toBe(0);
      expect(metrics.criticalErrorCount).toBe(0);
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });

      const result = await errorHandler.withRetry(mockOperation, mockContext, {
        maxAttempts: 3,
        delay: 10,
        backoff: 'exponential'
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should respect medical content retry limits', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Medical API failure'));
      
      const medicalContext: ErrorContext = {
        ...mockContext,
        medicalContent: true
      };

      await expect(errorHandler.withMedicalSafety(
        mockOperation,
        medicalContext
      )).rejects.toThrow();

      // Medical safety should limit retries to 2
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should use safety callback for medical operations', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Medical operation failed'));
      const safetyCallback = vi.fn().mockResolvedValue('safety_fallback');
      
      const medicalContext: ErrorContext = {
        ...mockContext,
        medicalContent: true
      };

      const result = await errorHandler.withMedicalSafety(
        mockOperation,
        medicalContext,
        safetyCallback
      );

      expect(result).toBe('safety_fallback');
      expect(safetyCallback).toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit breaker after error threshold', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      
      // Trigger multiple failures to open circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await errorHandler.withRetry(mockOperation, {
            ...mockContext,
            component: 'TestComponent'
          }, { maxAttempts: 1 });
        } catch (e) {
          // Expected to fail
        }
      }

      expect(errorHandler.isCircuitBreakerOpen('TestComponent')).toBe(true);
    });

    it('should prevent operations when circuit breaker is open', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      
      // Manually open circuit breaker
      for (let i = 0; i < 6; i++) {
        errorHandler.reportError(new Error('test'), {
          ...mockContext,
          component: 'TestComponent'
        });
      }

      await expect(errorHandler.withRetry(mockOperation, {
        ...mockContext,
        component: 'TestComponent'
      })).rejects.toThrow('Circuit breaker open');

      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('should reset circuit breaker after cooldown period', () => {
      // Open circuit breaker
      for (let i = 0; i < 6; i++) {
        errorHandler.reportError(new Error('test'), {
          ...mockContext,
          component: 'TestComponent'
        });
      }

      expect(errorHandler.isCircuitBreakerOpen('TestComponent')).toBe(true);
      
      // Reset circuit breaker
      errorHandler.resetCircuitBreaker('TestComponent');
      
      expect(errorHandler.isCircuitBreakerOpen('TestComponent')).toBe(false);
    });
  });

  describe('Network Error Handling', () => {
    beforeEach(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
    });

    it('should handle offline scenarios', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'));
      const cachedFallback = vi.fn().mockResolvedValue({ cached: true });

      const response = await errorHandler.handleNetworkError(
        mockOperation,
        mockContext,
        cachedFallback
      );

      expect(response.status).toBe(503);
      const responseData = await response.json();
      expect(responseData.offline).toBe(true);
    });

    it('should use cached fallback when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      
      const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'));
      const cachedFallback = vi.fn().mockResolvedValue({ fromCache: true });

      const response = await errorHandler.handleNetworkError(
        mockOperation,
        mockContext,
        cachedFallback
      );

      expect(cachedFallback).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});

describe('MedicalErrorBoundary', () => {
  const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return React.createElement('div', {}, 'Normal content');
  };

  it('should render children when no error occurs', () => {
    render(
      React.createElement(MedicalErrorBoundary, {},
        React.createElement(ThrowError, { shouldThrow: false })
      )
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render medical safety fallback for medical content errors', () => {
    render(
      <MedicalErrorBoundary medicalContent={true}>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    expect(screen.getByText('Medical Content Error')).toBeInTheDocument();
    expect(screen.getByText(/medical information with primary sources/)).toBeInTheDocument();
  });

  it('should render standard error fallback for non-medical errors', () => {
    render(
      <MedicalErrorBoundary medicalContent={false}>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/try again/)).toBeInTheDocument();
  });

  it('should provide retry functionality', () => {
    const { rerender } = render(
      <MedicalErrorBoundary maxRetries={2}>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    const retryButton = screen.getByText(/Retry \(1\/2\)/);
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onErrorMock = vi.fn();
    
    render(
      <MedicalErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalled();
  });
});