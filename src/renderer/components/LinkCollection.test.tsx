import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import LinkCollection from './LinkCollection';

const mockMessages = [
  { role: 'user' as const, content: 'Check [Google](https://google.com) out' },
  { role: 'assistant' as const, content: 'See https://example.com and [Docs](https://docs.com)' },
  { role: 'user' as const, content: 'No links here' },
];

describe('LinkCollection', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    messages: mockMessages,
    onNavigateToMessage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const { container } = render(<LinkCollection {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows dialog when open', () => {
    render(<LinkCollection {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays total link count in title', () => {
    render(<LinkCollection {...defaultProps} />);
    expect(screen.getByText('링크 모음 (3)')).toBeInTheDocument();
  });

  it('shows all extracted links', () => {
    render(<LinkCollection {...defaultProps} />);
    expect(screen.getByText('https://google.com')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://docs.com')).toBeInTheDocument();
  });

  it('shows link label for markdown links', () => {
    render(<LinkCollection {...defaultProps} />);
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(<LinkCollection {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('링크 모음 닫기'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay clicked', () => {
    const { container } = render(<LinkCollection {...defaultProps} />);
    fireEvent.click(container.querySelector('.link-collection-overlay')!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    render(<LinkCollection {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onNavigateToMessage when navigate button clicked', () => {
    render(<LinkCollection {...defaultProps} />);
    const navButtons = screen.getAllByLabelText('메시지로 이동');
    fireEvent.click(navButtons[0]);
    expect(defaultProps.onNavigateToMessage).toHaveBeenCalledWith(0);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows empty message when no links', () => {
    render(
      <LinkCollection
        {...defaultProps}
        messages={[{ role: 'user', content: 'no links' }]}
      />
    );
    expect(screen.getByText('이 대화에 링크가 없습니다.')).toBeInTheDocument();
  });

  it('shows role badges', () => {
    render(<LinkCollection {...defaultProps} />);
    expect(screen.getAllByText('사용자').length).toBe(1);
    expect(screen.getAllByText('Gemini').length).toBe(2);
  });

  it('does not propagate click from panel to overlay', () => {
    const { container } = render(<LinkCollection {...defaultProps} />);
    const panel = container.querySelector('.link-collection-panel')!;
    fireEvent.click(panel);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('has copy buttons with correct aria-label', () => {
    render(<LinkCollection {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('URL 복사');
    expect(copyButtons).toHaveLength(3);
  });

  it('has navigate buttons with correct aria-label', () => {
    render(<LinkCollection {...defaultProps} />);
    const navButtons = screen.getAllByLabelText('메시지로 이동');
    expect(navButtons).toHaveLength(3);
  });

  it('displays link count 0 when no links exist', () => {
    render(
      <LinkCollection
        {...defaultProps}
        messages={[{ role: 'user', content: 'plain text' }]}
      />
    );
    expect(screen.getByText('링크 모음 (0)')).toBeInTheDocument();
  });

  it('does not close on non-Escape key press', () => {
    render(<LinkCollection {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'a' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('copies URL to clipboard on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<LinkCollection {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('URL 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeText).toHaveBeenCalledWith('https://google.com');
  });

  it('shows checkmark after successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { container } = render(<LinkCollection {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('URL 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    await waitFor(() => {
      const firstCopyBtn = container.querySelectorAll('.link-item-copy-btn')[0];
      expect(firstCopyBtn.textContent).toBe('✓');
    });
  });

  it('handles clipboard failure gracefully', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    render(<LinkCollection {...defaultProps} />);
    const copyButtons = screen.getAllByLabelText('URL 복사');
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(copyButtons[0].textContent).toBe('📋');
  });

  it('link items have title attribute with URL', () => {
    const { container } = render(<LinkCollection {...defaultProps} />);
    const items = container.querySelectorAll('.link-item-text');
    expect(items[0].getAttribute('title')).toBe('https://google.com');
  });

  it('shows label and URL separately for markdown links', () => {
    const { container } = render(<LinkCollection {...defaultProps} />);
    const labels = container.querySelectorAll('.link-item-label');
    expect(labels.length).toBe(2); // Google and Docs
  });

  it('shows only URL for bare links (no label span)', () => {
    // Create messages with only bare URL (no markdown links)
    const msgs = [
      { role: 'user' as const, content: 'Visit https://bare-url.com please' },
    ];
    const { container } = render(<LinkCollection {...defaultProps} messages={msgs} />);
    const items = container.querySelectorAll('.link-collection-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('.link-item-label')).toBeNull();
    expect(items[0].querySelector('.link-item-url')?.textContent).toBe('https://bare-url.com');
  });

  it('navigate button navigates to second message correctly', () => {
    render(<LinkCollection {...defaultProps} />);
    const navButtons = screen.getAllByLabelText('메시지로 이동');
    fireEvent.click(navButtons[1]); // second link from message index 1
    expect(defaultProps.onNavigateToMessage).toHaveBeenCalledWith(1);
  });

  it('dialog has tabIndex -1 for keyboard focus', () => {
    const { container } = render(<LinkCollection {...defaultProps} />);
    const panel = container.querySelector('.link-collection-panel');
    expect(panel?.getAttribute('tabindex')).toBe('-1');
  });
});
