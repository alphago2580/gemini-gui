import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
