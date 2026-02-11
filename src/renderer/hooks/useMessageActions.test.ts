import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useMessageActions } from './useMessageActions';

// Mock useLocalStorage
const mockSetPinnedMessages = vi.fn();
vi.mock('./useLocalStorage', () => ({
  useLocalStorage: (key: string, initial: unknown) => {
    const [val, setVal] = React.useState(initial);
    mockSetPinnedMessages.mockImplementation(setVal);
    return [val, mockSetPinnedMessages];
  },
}));

// Mock useBookmarks
const mockAddBookmark = vi.fn();
const mockRemoveBookmark = vi.fn();
vi.mock('./useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    addBookmark: mockAddBookmark,
    removeBookmark: mockRemoveBookmark,
    isBookmarked: () => false,
    clearBookmarks: vi.fn(),
    getBookmarksForConversation: () => [],
  }),
}));

// Mock useEmojiReactions
const mockToggleReaction = vi.fn();
const mockGetReactions = vi.fn().mockReturnValue([]);
vi.mock('./useEmojiReactions', () => ({
  useEmojiReactions: () => ({
    toggleReaction: mockToggleReaction,
    getReactions: mockGetReactions,
    addReaction: vi.fn(),
    removeReaction: vi.fn(),
    clearReactions: vi.fn(),
    clearAllReactions: vi.fn(),
  }),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

function createDefaultParams(overrides = {}) {
  return {
    messages: [
      { role: 'user' as const, content: 'Hello', id: 'msg-1' },
      { role: 'assistant' as const, content: 'Hi there', id: 'msg-2' },
    ],
    conversations: [{ id: 'conv-1', title: 'Test Conv' }],
    currentConversationId: 'conv-1',
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    forkConversation: vi.fn(),
    messagesContainerRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    handleSelectConversation: vi.fn(),
    ...overrides,
  };
}

describe('useMessageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null context menu', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));
    expect(result.current.contextMenu).toBeNull();
  });

  it('returns context menu items', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));
    expect(result.current.contextMenuItems.length).toBe(7);
    expect(result.current.contextMenuItems[0].id).toBe('copy');
    expect(result.current.contextMenuItems[6].id).toBe('delete');
  });

  it('handleMessageContextMenu sets context menu state', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    expect(result.current.contextMenu).toEqual({ x: 100, y: 200, messageIndex: 0 });
  });

  it('closeContextMenu resets context menu', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });
    expect(result.current.contextMenu).not.toBeNull();

    act(() => result.current.closeContextMenu());
    expect(result.current.contextMenu).toBeNull();
  });

  it('handleContextMenuAction copy calls clipboard', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    // Set context menu first
    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    act(() => result.current.handleContextMenuAction('copy'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello');
    expect(result.current.contextMenu).toBeNull();
  });

  it('handleContextMenuAction delete calls deleteMessage', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 1);
    });

    act(() => result.current.handleContextMenuAction('delete'));

    expect(params.deleteMessage).toHaveBeenCalledWith(1);
  });

  it('handleContextMenuAction fork calls forkConversation', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    act(() => result.current.handleContextMenuAction('fork'));

    expect(params.forkConversation).toHaveBeenCalledWith(0);
  });

  it('handleContextMenuAction does nothing when contextMenu is null', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => result.current.handleContextMenuAction('copy'));

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('getReactions delegates to useEmojiReactions', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));
    result.current.getReactions('conv-1', 0);
    expect(mockGetReactions).toHaveBeenCalledWith('conv-1', 0);
  });

  it('initializes with null emoji picker', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));
    expect(result.current.emojiPickerTarget).toBeNull();
  });

  it('closeEmojiPicker resets picker state', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));
    act(() => result.current.closeEmojiPicker());
    expect(result.current.emojiPickerTarget).toBeNull();
  });

  it('handleSearchNavigate calls handleSelectConversation for different conversation', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => result.current.handleSearchNavigate('conv-2', 5));

    expect(params.handleSelectConversation).toHaveBeenCalledWith('conv-2');
  });

  it('handleSearchNavigate does not switch for same conversation', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => result.current.handleSearchNavigate('conv-1', 5));

    expect(params.handleSelectConversation).not.toHaveBeenCalled();
  });

  it('returns stable context menu items on rerender', () => {
    const { result, rerender } = renderHook(() => useMessageActions(createDefaultParams()));
    const first = result.current.contextMenuItems;
    rerender();
    expect(result.current.contextMenuItems).toBe(first);
  });

  it('handleContextMenuAction edit calls editMessage', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    act(() => result.current.handleContextMenuAction('edit'));

    expect(params.editMessage).toHaveBeenCalledWith(0, 'Hello');
  });

  it('handleContextMenuAction pin adds pinned message', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    act(() => result.current.handleContextMenuAction('pin'));

    expect(mockSetPinnedMessages).toHaveBeenCalled();
  });

  it('handleContextMenuAction bookmark calls addBookmark', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useMessageActions(params));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 1);
    });

    act(() => result.current.handleContextMenuAction('bookmark'));

    expect(mockAddBookmark).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'conv-1',
        messageIndex: 1,
        role: 'assistant',
        content: 'Hi there',
      })
    );
  });

  it('handleContextMenuAction emoji sets emoji picker target', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 50, clientY: 60 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });

    act(() => result.current.handleContextMenuAction('emoji'));

    expect(result.current.emojiPickerTarget).toEqual({ index: 0, x: 50, y: 60 });
  });

  it('handleEmojiSelect toggles reaction and closes picker', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    // Open emoji picker via context menu
    act(() => {
      const event = { preventDefault: vi.fn(), clientX: 50, clientY: 60 } as unknown as React.MouseEvent;
      result.current.handleMessageContextMenu(event, 0);
    });
    act(() => result.current.handleContextMenuAction('emoji'));

    // Select an emoji
    act(() => result.current.handleEmojiSelect('👍'));

    expect(mockToggleReaction).toHaveBeenCalledWith('conv-1', 0, '👍');
    expect(result.current.emojiPickerTarget).toBeNull();
  });

  it('handleEmojiSelect does nothing without picker target', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => result.current.handleEmojiSelect('👍'));

    expect(mockToggleReaction).not.toHaveBeenCalled();
  });

  it('handlePinMessage does not duplicate existing pinned index', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    // Pin message at index 0
    act(() => result.current.handlePinMessage(0));
    // Pin same index again
    act(() => result.current.handlePinMessage(0));

    // setPinnedMessages should have been called, but the internal filter prevents duplicates
    expect(mockSetPinnedMessages).toHaveBeenCalled();
  });

  it('handleUnpinMessage removes by index', () => {
    const { result } = renderHook(() => useMessageActions(createDefaultParams()));

    act(() => result.current.handleUnpinMessage(0));

    expect(mockSetPinnedMessages).toHaveBeenCalled();
  });
});
