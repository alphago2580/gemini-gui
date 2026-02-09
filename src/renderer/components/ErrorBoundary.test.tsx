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
});
