import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversations } from './useConversations';

// Mock electronAPI
const mockElectronAPI = {
  newConversation: vi.fn(),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with empty conversations and messages', () => {
    const { result } = renderHook(() => useConversations());
    expect(result.current.conversations).toEqual([]);
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentConversationId).toBeNull();
  });

  it('creates a new conversation via handleNewChat', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('새로운 대화');
    expect(result.current.conversations[0].messages).toEqual([]);
    expect(result.current.currentConversationId).toBe(result.current.conversations[0].id);
    expect(result.current.messages).toEqual([]);
  });

  it('calls electronAPI.newConversation when creating new chat', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    expect(mockElectronAPI.newConversation).toHaveBeenCalled();
  });

  it('selects an existing conversation via handleSelectConversation', () => {
    const { result } = renderHook(() => useConversations());

    // Create two conversations with different timestamps
    vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
    act(() => {
      result.current.handleNewChat();
    });
    const firstId = result.current.currentConversationId!;

    vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
    act(() => {
      result.current.handleNewChat();
    });
    const secondId = result.current.currentConversationId!;

    expect(secondId).not.toBe(firstId);

    // Select the first conversation
    act(() => {
      result.current.handleSelectConversation(firstId);
    });

    expect(result.current.currentConversationId).toBe(firstId);
  });

  it('updates messages via updateCurrentConversation', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    const newMessages = [
      { role: 'user' as const, content: 'Hello', timestamp: new Date() },
    ];

    act(() => {
      result.current.updateCurrentConversation(newMessages);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello');
  });

  it('auto-generates conversation title from first user message', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    const firstMessage = [
      { role: 'user' as const, content: 'Tell me about TypeScript generics', timestamp: new Date() },
    ];

    act(() => {
      result.current.updateCurrentConversation(firstMessage);
    });

    // generateConversationTitle truncates to first ~30 chars
    expect(result.current.conversations[0].title).not.toBe('새로운 대화');
    expect(result.current.conversations[0].title).toContain('Tell me about TypeScript');
  });

  it('persists conversations to localStorage', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    const stored = localStorage.getItem('gemini-conversations');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('새로운 대화');
  });

  it('persists current conversation ID to localStorage', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    const stored = localStorage.getItem('gemini-current-conversation');
    expect(stored).toBe(result.current.currentConversationId);
  });

  it('restores conversations from localStorage on mount', () => {
    const savedConversations = [
      {
        id: '999',
        title: '복원된 대화',
        timestamp: new Date().toISOString(),
        messages: [
          { role: 'user', content: '안녕하세요', timestamp: new Date().toISOString() },
        ],
      },
    ];
    localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
    localStorage.setItem('gemini-current-conversation', '999');

    const { result } = renderHook(() => useConversations());

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('복원된 대화');
    expect(result.current.currentConversationId).toBe('999');
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('안녕하세요');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('gemini-conversations', 'not valid json');

    const { result } = renderHook(() => useConversations());
    expect(result.current.conversations).toEqual([]);
    expect(result.current.messages).toEqual([]);
  });

  it('does not restore a conversation that no longer exists', () => {
    const savedConversations = [
      {
        id: '111',
        title: '대화 1',
        timestamp: new Date().toISOString(),
        messages: [],
      },
    ];
    localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
    localStorage.setItem('gemini-current-conversation', 'nonexistent-id');

    const { result } = renderHook(() => useConversations());

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.currentConversationId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('clears messages when creating a new conversation', () => {
    const { result } = renderHook(() => useConversations());

    // Create first conversation and add messages
    act(() => {
      result.current.handleNewChat();
    });

    act(() => {
      result.current.updateCurrentConversation([
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
      ]);
    });

    expect(result.current.messages).toHaveLength(1);

    // Create new conversation — messages should be cleared
    act(() => {
      result.current.handleNewChat();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('allows setting messages directly via setMessages', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.setMessages([
        { role: 'assistant' as const, content: 'Hi there!', timestamp: new Date() },
      ]);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hi there!');
  });

  it('ignores selectConversation for nonexistent IDs', () => {
    const { result } = renderHook(() => useConversations());

    act(() => {
      result.current.handleNewChat();
    });

    const currentId = result.current.currentConversationId;

    act(() => {
      result.current.handleSelectConversation('nonexistent');
    });

    // Should remain unchanged
    expect(result.current.currentConversationId).toBe(currentId);
  });

  it('preserves other conversations when updating current', () => {
    const { result } = renderHook(() => useConversations());

    vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
    act(() => {
      result.current.handleNewChat();
    });
    const firstId = result.current.currentConversationId!;

    vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
    act(() => {
      result.current.handleNewChat();
    });

    // Update second conversation
    act(() => {
      result.current.updateCurrentConversation([
        { role: 'user' as const, content: 'Second conversation', timestamp: new Date() },
      ]);
    });

    // First conversation should still exist and be unchanged
    const firstConv = result.current.conversations.find(c => c.id === firstId);
    expect(firstConv).toBeDefined();
    expect(firstConv!.messages).toEqual([]);
  });

  describe('deleteMessage', () => {
    it('deletes a message by index', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'First', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Second', timestamp: new Date() },
        { role: 'user' as const, content: 'Third', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      expect(result.current.messages).toHaveLength(3);

      act(() => {
        result.current.deleteMessage(1);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Third');
    });

    it('deletes the first message', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Hi', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.deleteMessage(0);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hi');
    });

    it('deletes the last message', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Hi', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.deleteMessage(1);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
    });

    it('updates the conversation in conversations list', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Hi', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.deleteMessage(0);
      });

      const conv = result.current.conversations[0];
      expect(conv.messages).toHaveLength(1);
      expect(conv.messages[0].content).toBe('Hi');
    });
  });

  describe('deleteConversation', () => {
    it('deletes a conversation by id', () => {
      const { result } = renderHook(() => useConversations());

      vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
      act(() => {
        result.current.handleNewChat();
      });
      const firstId = result.current.currentConversationId!;

      vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
      act(() => {
        result.current.handleNewChat();
      });

      expect(result.current.conversations).toHaveLength(2);

      act(() => {
        result.current.deleteConversation(firstId);
      });

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0].id).not.toBe(firstId);
    });

    it('clears messages when deleting the current conversation', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      act(() => {
        result.current.updateCurrentConversation([
          { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        ]);
      });

      expect(result.current.messages).toHaveLength(1);
      const currentId = result.current.currentConversationId!;

      act(() => {
        result.current.deleteConversation(currentId);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.currentConversationId).toBeNull();
    });

    it('does not clear messages when deleting a non-current conversation', () => {
      const { result } = renderHook(() => useConversations());

      vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
      act(() => {
        result.current.handleNewChat();
      });
      const firstId = result.current.currentConversationId!;

      vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
      act(() => {
        result.current.handleNewChat();
      });

      act(() => {
        result.current.updateCurrentConversation([
          { role: 'user' as const, content: 'Current chat', timestamp: new Date() },
        ]);
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.deleteConversation(firstId);
      });

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Current chat');
    });

    it('updates localStorage after deleting conversation', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const convId = result.current.currentConversationId!;
      expect(result.current.conversations).toHaveLength(1);

      act(() => {
        result.current.deleteConversation(convId);
      });

      const stored = localStorage.getItem('gemini-conversations');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('forkConversation', () => {
    it('creates a new conversation with messages up to the given index', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'First', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Response 1', timestamp: new Date() },
        { role: 'user' as const, content: 'Second', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Response 2', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      let newId: string | null = null;
      act(() => {
        newId = result.current.forkConversation(1);
      });

      expect(newId).not.toBeNull();
      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Response 1');
    });

    it('switches to the new forked conversation', () => {
      const { result } = renderHook(() => useConversations());

      vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
      act(() => {
        result.current.handleNewChat();
      });

      const originalId = result.current.currentConversationId;

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Hi', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
      let newId: string | null = null;
      act(() => {
        newId = result.current.forkConversation(0);
      });

      expect(result.current.currentConversationId).toBe(newId);
      expect(result.current.currentConversationId).not.toBe(originalId);
    });

    it('names the forked conversation with (분기) suffix', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Tell me about TypeScript', timestamp: new Date() },
        { role: 'assistant' as const, content: 'TypeScript is...', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.forkConversation(1);
      });

      const forkedConv = result.current.conversations[0];
      expect(forkedConv.title).toContain('(분기)');
    });

    it('returns null when no current conversation exists', () => {
      const { result } = renderHook(() => useConversations());

      let newId: string | null = null;
      act(() => {
        newId = result.current.forkConversation(0);
      });

      expect(newId).toBeNull();
    });

    it('returns null when forking with no messages', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      let newId: string | null = null;
      act(() => {
        newId = result.current.forkConversation(-1);
      });

      expect(newId).toBeNull();
    });

    it('preserves the original conversation', () => {
      const { result } = renderHook(() => useConversations());

      vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
      act(() => {
        result.current.handleNewChat();
      });
      const originalId = result.current.currentConversationId!;

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
        { role: 'assistant' as const, content: 'World', timestamp: new Date() },
        { role: 'user' as const, content: 'More', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
      act(() => {
        result.current.forkConversation(0);
      });

      const originalConv = result.current.conversations.find(c => c.id === originalId);
      expect(originalConv).toBeDefined();
      expect(originalConv!.messages).toHaveLength(3);
    });

    it('calls electronAPI.newConversation when forking', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      mockElectronAPI.newConversation.mockClear();

      const msgs = [
        { role: 'user' as const, content: 'Test', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.forkConversation(0);
      });

      expect(mockElectronAPI.newConversation).toHaveBeenCalled();
    });
  });

  describe('editMessage', () => {
    it('edits a message at the given index', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Original', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Response', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.editMessage(0, 'Edited content');
      });

      expect(result.current.messages[0].content).toBe('Edited content');
      expect(result.current.messages[1].content).toBe('Response');
    });

    it('updates the conversation in conversations list', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'Hello', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.editMessage(0, 'Modified');
      });

      const conv = result.current.conversations[0];
      expect(conv.messages[0].content).toBe('Modified');
    });

    it('preserves other messages when editing one', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'user' as const, content: 'First', timestamp: new Date() },
        { role: 'assistant' as const, content: 'Second', timestamp: new Date() },
        { role: 'user' as const, content: 'Third', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.editMessage(2, 'Third edited');
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Second');
      expect(result.current.messages[2].content).toBe('Third edited');
    });
  });

  describe('updateCurrentConversation edge cases', () => {
    it('does not update conversations when no currentConversationId', () => {
      const { result } = renderHook(() => useConversations());

      // No conversation created yet, so currentConversationId is null
      act(() => {
        result.current.updateCurrentConversation([
          { role: 'user' as const, content: 'orphan', timestamp: new Date() },
        ]);
      });

      // Messages are still set locally
      expect(result.current.messages).toHaveLength(1);
      // But no conversation is modified
      expect(result.current.conversations).toHaveLength(0);
    });

    it('does not regenerate title for multi-message updates', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      // First: set title via single user message
      act(() => {
        result.current.updateCurrentConversation([
          { role: 'user' as const, content: 'Initial question', timestamp: new Date() },
        ]);
      });
      const firstTitle = result.current.conversations[0].title;
      expect(firstTitle).toContain('Initial question');

      // Second: add assistant response — title should remain the same
      act(() => {
        result.current.updateCurrentConversation([
          { role: 'user' as const, content: 'Initial question', timestamp: new Date() },
          { role: 'assistant' as const, content: 'Here is the answer', timestamp: new Date() },
        ]);
      });

      expect(result.current.conversations[0].title).toBe(firstTitle);
    });

    it('does not regenerate title when only assistant message exists', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      act(() => {
        result.current.updateCurrentConversation([
          { role: 'assistant' as const, content: 'Hello!', timestamp: new Date() },
        ]);
      });

      // Title should remain the default since the only message is from assistant
      expect(result.current.conversations[0].title).toBe('새로운 대화');
    });
  });

  describe('multiple conversations management', () => {
    it('creates conversations in reverse chronological order', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });
      const firstId = result.current.conversations[0].id;

      act(() => {
        result.current.handleNewChat();
      });
      const secondId = result.current.conversations[0].id;

      // Second conversation should be at index 0 (prepended)
      expect(result.current.conversations[0].id).toBe(secondId);
      expect(result.current.conversations[1].id).toBe(firstId);
    });

    it('restored messages have generated IDs for legacy data', () => {
      const savedConversations = [
        {
          id: '100',
          title: '레거시 대화',
          timestamp: new Date().toISOString(),
          messages: [
            { role: 'user', content: 'old message', timestamp: new Date().toISOString() },
          ],
        },
      ];
      localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
      localStorage.setItem('gemini-current-conversation', '100');

      const { result } = renderHook(() => useConversations());

      // Legacy messages without IDs should get IDs generated
      expect(result.current.messages[0].id).toBeDefined();
      expect(result.current.messages[0].id).toMatch(/^msg-/);
    });

    it('deleteMessage on empty messages list is a no-op', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      // No messages — deleting index 0 should not crash
      act(() => {
        result.current.deleteMessage(0);
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('forkConversation uses first user message for title', () => {
      const { result } = renderHook(() => useConversations());

      act(() => {
        result.current.handleNewChat();
      });

      const msgs = [
        { role: 'assistant' as const, content: 'Welcome', timestamp: new Date() },
        { role: 'user' as const, content: 'What is TypeScript?', timestamp: new Date() },
        { role: 'assistant' as const, content: 'TypeScript is...', timestamp: new Date() },
      ];

      act(() => {
        result.current.updateCurrentConversation(msgs);
      });

      act(() => {
        result.current.forkConversation(2);
      });

      const forkedConv = result.current.conversations[0];
      expect(forkedConv.title).toContain('What is TypeScript');
      expect(forkedConv.title).toContain('(분기)');
    });
  });
});
