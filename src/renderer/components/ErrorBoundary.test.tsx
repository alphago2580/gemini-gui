import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Component that throws on demand
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
  });

  it('resets error state when reset button is clicked', async () => {
    const user = userEvent.setup();

    // We need a component that can toggle throwing
    let shouldThrow = true;
    function ToggleThrow() {
      if (shouldThrow) throw new Error('Boom');
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleThrow />
      </ErrorBoundary>
    );

    // Error state
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

    // Fix the child before resetting
    shouldThrow = false;

    await user.click(screen.getByText('다시 시도'));

    // Re-render triggers because state reset causes re-render
    rerender(
      <ErrorBoundary>
        <ToggleThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('calls console.error via componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('does not show error UI for non-throwing children', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
  });

  it('displays the specific error message from the thrown error', () => {
    function SpecificError(): React.ReactElement {
      throw new Error('Database connection failed');
    }
    render(
      <ErrorBoundary>
        <SpecificError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
  });

  it('renders multiple children before error', () => {
    render(
      <ErrorBoundary>
        <div>Child A</div>
        <div>Child B</div>
        <div>Child C</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child A')).toBeInTheDocument();
    expect(screen.getByText('Child B')).toBeInTheDocument();
    expect(screen.getByText('Child C')).toBeInTheDocument();
  });

  it('shows error UI with reset button that has correct text', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    const button = screen.getByText('다시 시도');
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('error-reset-btn');
  });

  it('custom fallback takes precedence over default error UI', () => {
    const customFallback = <div data-testid="custom">Custom error view</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
  });

  it('logs error with componentDidCatch including error info', () => {
    const consoleSpy = console.error as ReturnType<typeof vi.fn>;
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    const errorBoundaryCalls = consoleSpy.mock.calls.filter(
      (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('ErrorBoundary caught')
    );
    expect(errorBoundaryCalls.length).toBeGreaterThanOrEqual(1);
  });
});
