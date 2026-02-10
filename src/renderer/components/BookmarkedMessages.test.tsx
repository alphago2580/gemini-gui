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

  it('shows filtered-empty message when filter has no results', () => {
    const userOnly: BookmarkedMessage[] = [{
      conversationId: 'conv-1',
      conversationTitle: 'Test',
      messageIndex: 0,
      role: 'user',
      content: 'User message',
      timestamp: new Date(),
    }];
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={userOnly}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByLabelText('AI 필터'));
    expect(screen.getByText('필터에 해당하는 북마크가 없습니다.')).toBeInTheDocument();
  });

  it('displays role badge correctly for user and assistant', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(screen.getAllByText('사용자').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('does not close when clicking inside the panel', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ArrowUp does not go below 0', () => {
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
    fireEvent.keyDown(dialog, { key: 'ArrowUp' });
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown does not exceed list length', () => {
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
    // Press ArrowDown many times
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    }
    const items = screen.getAllByRole('option');
    expect(items[items.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('mouseEnter updates selected index', () => {
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
    fireEvent.mouseEnter(items[2]);
    expect(items[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('has dialog role and aria-label', () => {
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
    expect(dialog).toHaveAttribute('aria-label', '북마크된 메시지');
  });

  it('has listbox role on the list container', () => {
    render(
      <BookmarkedMessages
        isOpen={true}
        onClose={onClose}
        bookmarks={mockBookmarks}
        onNavigateToMessage={onNavigateToMessage}
        onRemoveBookmark={onRemoveBookmark}
      />
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
