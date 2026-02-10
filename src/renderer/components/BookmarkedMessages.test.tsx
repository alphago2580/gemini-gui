import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BookmarkedMessages, { BookmarkedMessage } from './BookmarkedMessages';

const mockBookmarks: BookmarkedMessage[] = [
  {
    conversationId: 'conv-1',
    conversationTitle: 'Test Conversation',
    messageIndex: 0,
    role: 'user',
    content: 'Hello, this is a user message',
    timestamp: new Date('2026-01-01'),
  },
  {
    conversationId: 'conv-1',
    conversationTitle: 'Test Conversation',
    messageIndex: 2,
    role: 'assistant',
    content: 'Hello, this is an assistant response',
    timestamp: new Date('2026-01-01'),
  },
  {
    conversationId: 'conv-2',
    conversationTitle: 'Another Chat',
    messageIndex: 1,
    role: 'user',
    content: 'Another bookmarked message',
    timestamp: new Date('2026-01-02'),
  },
];

describe('BookmarkedMessages', () => {
  const onClose = vi.fn();
  const onNavigateToMessage = vi.fn();
  const onRemoveBookmark = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <BookmarkedMessages
        isOpen={false}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders bookmarked messages when open', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(screen.getByText('북마크')).toBeInTheDocument();
    expect(screen.getAllByText('Test Conversation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Another Chat')).toBeInTheDocument();
  });

  it('shows total count in All filter', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(screen.getByText(`전체 (${mockBookmarks.length})`)).toBeInTheDocument();
  });

  it('filters by user role', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByLabelText('사용자 필터'));
    const items = screen.getAllByRole('option');
    expect(items.length).toBe(2);
  });

  it('filters by assistant role', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByLabelText('AI 필터'));
    const items = screen.getAllByRole('option');
    expect(items.length).toBe(1);
  });

  it('shows empty message when no bookmarks', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={[]}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(screen.getByText(/북마크된 메시지가 없습니다/)).toBeInTheDocument();
  });

  it('navigates to message on click', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    const items = screen.getAllByRole('option');
    fireEvent.click(items[0]);
    expect(onNavigateToMessage).toHaveBeenCalledWith('conv-1', 0);
    expect(onClose).toHaveBeenCalled();
  });

  it('removes bookmark on remove button click', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    const removeButtons = screen.getAllByTitle('북마크 해제');
    fireEvent.click(removeButtons[0]);
    expect(onRemoveBookmark).toHaveBeenCalledWith('conv-1', 0);
    expect(onNavigateToMessage).not.toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates with ArrowDown/ArrowUp and Enter', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    const dialog = screen.getByRole('dialog');

    fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    const items = screen.getAllByRole('option');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(onNavigateToMessage).toHaveBeenCalledWith('conv-1', 2);
  });

  it('closes on close button click', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByLabelText('북마크 닫기'));
    expect(onClose).toHaveBeenCalled();
  });

  it('truncates long content', () => {
    const longBookmark: BookmarkedMessage[] = [{
      conversationId: 'conv-1',
      conversationTitle: 'Test',
      messageIndex: 0,
      role: 'user',
      content: 'A'.repeat(250),
      timestamp: new Date(),
    }];
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={longBookmark}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    const content = screen.getByRole('option').querySelector('.bookmark-item-content');
    expect(content?.textContent?.length).toBeLessThanOrEqual(210);
  });
});
