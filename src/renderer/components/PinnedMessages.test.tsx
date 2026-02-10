import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PinnedMessages, { PinnedMessage } from './PinnedMessages';

const samplePinned: PinnedMessage[] = [
  { index: 0, role: 'user', content: 'Hello world' },
  { index: 3, role: 'assistant', content: 'This is a response from Gemini' },
];

describe('PinnedMessages', () => {
  it('should not render when no pinned messages', () => {
    const { container } = render(
      <PinnedMessages messages={[]} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    expect(container.querySelector('.pinned-messages')).toBeNull();
  });

  it('should render pinned messages count', () => {
    render(
      <PinnedMessages messages={samplePinned} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    expect(screen.getByText('2개 고정됨')).toBeInTheDocument();
  });

  it('should render message previews', () => {
    render(
      <PinnedMessages messages={samplePinned} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('This is a response from Gemini')).toBeInTheDocument();
  });

  it('should render role badges', () => {
    render(
      <PinnedMessages messages={samplePinned} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    expect(screen.getByText('사용자')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('should call onNavigate when clicking a pinned message', () => {
    const onNavigate = vi.fn();
    render(
      <PinnedMessages messages={samplePinned} onNavigate={onNavigate} onUnpin={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Hello world'));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('should call onUnpin when clicking unpin button', () => {
    const onUnpin = vi.fn();
    render(
      <PinnedMessages messages={samplePinned} onNavigate={vi.fn()} onUnpin={onUnpin} />
    );
    const unpinButtons = screen.getAllByTitle('고정 해제');
    fireEvent.click(unpinButtons[1]);
    expect(onUnpin).toHaveBeenCalledWith(3);
  });

  it('should truncate long message previews', () => {
    const longMsg: PinnedMessage[] = [
      { index: 0, role: 'user', content: 'A'.repeat(100) },
    ];
    render(
      <PinnedMessages messages={longMsg} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    const preview = screen.getByText('A'.repeat(80) + '...');
    expect(preview).toBeInTheDocument();
  });

  it('should have aria-label on container', () => {
    render(
      <PinnedMessages messages={samplePinned} onNavigate={vi.fn()} onUnpin={vi.fn()} />
    );
    expect(screen.getByLabelText('고정된 메시지')).toBeInTheDocument();
  });

  it('should navigate on Enter key press', () => {
    const onNavigate = vi.fn();
    render(
      <PinnedMessages messages={samplePinned} onNavigate={onNavigate} onUnpin={vi.fn()} />
    );
    const items = screen.getAllByRole('button');
    const firstItem = items.find(el => el.classList.contains('pinned-message-item'));
    if (firstItem) {
      fireEvent.keyDown(firstItem, { key: 'Enter' });
      expect(onNavigate).toHaveBeenCalledWith(0);
    }
  });
});
