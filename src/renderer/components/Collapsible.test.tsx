import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Collapsible from './Collapsible';

const mockOnToggle = vi.fn();

beforeEach(() => {
  mockOnToggle.mockReset();
});

function renderCollapsible(props: Partial<React.ComponentProps<typeof Collapsible>> = {}) {
  return render(
    <Collapsible title="테스트 섹션" {...props}>
      <p>섹션 내용</p>
    </Collapsible>
  );
}

describe('Collapsible', () => {
  // --- Rendering ---

  it('renders trigger with title', () => {
    renderCollapsible();
    expect(screen.getByRole('button', { name: /테스트 섹션/ })).toBeInTheDocument();
  });

  it('renders chevron', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-chevron')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = renderCollapsible({ icon: <span data-testid="icon">📁</span> });
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(container.querySelector('.collapsible-icon')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    renderCollapsible({ badge: <span data-testid="badge">3</span> });
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  // --- Open/close behavior ---

  it('is closed by default', () => {
    renderCollapsible();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens when defaultOpen is true', () => {
    renderCollapsible({ defaultOpen: true });
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on click', () => {
    renderCollapsible();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onToggle with new state', () => {
    renderCollapsible({ onToggle: mockOnToggle });
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('opens on Enter key', () => {
    renderCollapsible();
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens on Space key', () => {
    renderCollapsible();
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  // --- Controlled mode ---

  it('respects controlled open prop', () => {
    const { rerender } = render(
      <Collapsible title="제어됨" open={false} onToggle={mockOnToggle}>
        <p>내용</p>
      </Collapsible>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <Collapsible title="제어됨" open={true} onToggle={mockOnToggle}>
        <p>내용</p>
      </Collapsible>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  // --- Disabled ---

  it('does not toggle when disabled', () => {
    renderCollapsible({ disabled: true, onToggle: mockOnToggle });
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('button is disabled', () => {
    renderCollapsible({ disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies disabled class', () => {
    const { container } = renderCollapsible({ disabled: true });
    expect(container.querySelector('.collapsible-disabled')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-default')).toBeInTheDocument();
  });

  it('applies bordered variant', () => {
    const { container } = renderCollapsible({ variant: 'bordered' });
    expect(container.querySelector('.collapsible-bordered')).toBeInTheDocument();
  });

  it('applies filled variant', () => {
    const { container } = renderCollapsible({ variant: 'filled' });
    expect(container.querySelector('.collapsible-filled')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = renderCollapsible({ size: 'small' });
    expect(container.querySelector('.collapsible-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = renderCollapsible({ size: 'large' });
    expect(container.querySelector('.collapsible-large')).toBeInTheDocument();
  });

  // --- Animation ---

  it('applies animated class by default', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-animated')).toBeInTheDocument();
  });

  it('does not apply animated class when animated=false', () => {
    const { container } = renderCollapsible({ animated: false });
    expect(container.querySelector('.collapsible-animated')).not.toBeInTheDocument();
  });

  it('uses hidden attribute when not animated and closed', () => {
    renderCollapsible({ animated: false });
    const region = screen.getByRole('region', { hidden: true });
    expect(region).toHaveAttribute('hidden');
  });

  // --- Accessibility ---

  it('trigger has aria-expanded', () => {
    renderCollapsible();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded');
  });

  it('trigger has aria-controls', () => {
    renderCollapsible();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-controls');
  });

  it('content has region role', () => {
    renderCollapsible({ defaultOpen: true });
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('content is labeled by trigger', () => {
    renderCollapsible({ defaultOpen: true });
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-labelledby');
  });

  it('chevron is aria-hidden', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-chevron')).toHaveAttribute('aria-hidden', 'true');
  });

  // --- Open class ---

  it('applies open class when open', () => {
    const { container } = renderCollapsible({ defaultOpen: true });
    expect(container.querySelector('.collapsible-open')).toBeInTheDocument();
  });

  it('does not apply open class when closed', () => {
    const { container } = renderCollapsible();
    expect(container.querySelector('.collapsible-open')).not.toBeInTheDocument();
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = renderCollapsible({ className: 'my-section' });
    expect(container.querySelector('.collapsible.my-section')).toBeInTheDocument();
  });
});
