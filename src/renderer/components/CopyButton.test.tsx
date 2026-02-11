import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CopyButton from './CopyButton';

// Mock clipboard API
const mockWriteText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);

beforeEach(() => {
  mockWriteText.mockClear();
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText,
    },
  });
});

describe('CopyButton', () => {
  // --- Rendering ---

  it('renders copy button', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button', { name: '복사' })).toBeInTheDocument();
  });

  it('renders default icon', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<CopyButton text="hello" icon="📎" />);
    expect(screen.getByText('📎')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<CopyButton text="hello" label="복사하기" />);
    expect(screen.getByText('복사하기')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<CopyButton text="hello" />);
    expect(container.querySelector('.copy-button-label')).not.toBeInTheDocument();
  });

  // --- Copy behavior ---

  it('copies text to clipboard on click', async () => {
    render(<CopyButton text="hello world" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(mockWriteText).toHaveBeenCalledWith('hello world');
  });

  it('shows copied state after click', async () => {
    const { container } = render(<CopyButton text="hello" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(container.querySelector('.copy-button-copied')).toBeInTheDocument();
  });

  it('shows copied icon after click', async () => {
    render(<CopyButton text="hello" copiedIcon="✓" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows copiedLabel after click', async () => {
    render(<CopyButton text="hello" label="복사하기" copiedLabel="완료!" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(screen.getByText('완료!')).toBeInTheDocument();
  });

  it('resets after delay', async () => {
    vi.useFakeTimers();
    const { container } = render(<CopyButton text="hello" resetDelay={1000} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(container.querySelector('.copy-button-copied')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelector('.copy-button-copied')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('calls onCopy callback', async () => {
    const onCopy = vi.fn();
    render(<CopyButton text="hello" onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(onCopy).toHaveBeenCalledWith('hello');
  });

  it('calls onError callback on clipboard failure', async () => {
    const error = new Error('fail');
    mockWriteText.mockRejectedValueOnce(error);
    const onError = vi.fn();
    render(<CopyButton text="hello" onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(onError).toHaveBeenCalledWith(error);
  });

  // --- Disabled ---

  it('does not copy when disabled', async () => {
    render(<CopyButton text="hello" disabled />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('button is disabled when disabled', () => {
    render(<CopyButton text="hello" disabled />);
    expect(screen.getByRole('button', { name: '복사' })).toBeDisabled();
  });

  it('applies disabled class', () => {
    const { container } = render(<CopyButton text="hello" disabled />);
    expect(container.querySelector('.copy-button-disabled')).toBeInTheDocument();
  });

  // --- Sizes ---

  it('applies small size', () => {
    const { container } = render(<CopyButton text="hello" size="small" />);
    expect(container.querySelector('.copy-button-small')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<CopyButton text="hello" />);
    expect(container.querySelector('.copy-button-medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<CopyButton text="hello" size="large" />);
    expect(container.querySelector('.copy-button-large')).toBeInTheDocument();
  });

  // --- Variants ---

  it('applies default variant by default', () => {
    const { container } = render(<CopyButton text="hello" />);
    expect(container.querySelector('.copy-button-default')).toBeInTheDocument();
  });

  it('applies ghost variant', () => {
    const { container } = render(<CopyButton text="hello" variant="ghost" />);
    expect(container.querySelector('.copy-button-ghost')).toBeInTheDocument();
  });

  it('applies outline variant', () => {
    const { container } = render(<CopyButton text="hello" variant="outline" />);
    expect(container.querySelector('.copy-button-outline')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('uses custom ariaLabel', () => {
    render(<CopyButton text="hello" ariaLabel="코드 복사" />);
    expect(screen.getByRole('button', { name: '코드 복사' })).toBeInTheDocument();
  });

  it('changes aria-label to copiedLabel when copied', async () => {
    render(<CopyButton text="hello" copiedLabel="복사 완료" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '복사' }));
    });
    expect(screen.getByRole('button', { name: '복사 완료' })).toBeInTheDocument();
  });

  it('icon is aria-hidden', () => {
    const { container } = render(<CopyButton text="hello" />);
    const icon = container.querySelector('.copy-button-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
