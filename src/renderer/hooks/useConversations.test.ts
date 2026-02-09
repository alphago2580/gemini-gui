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
});
