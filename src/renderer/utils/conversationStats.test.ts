import { describe, it, expect } from 'vitest';
import { calculateConversationStats, formatNumber } from './conversationStats';

describe('conversationStats', () => {
  it('returns zeros for empty conversations', () => {
    const stats = calculateConversationStats([]);
    expect(stats.totalConversations).toBe(0);
    expect(stats.totalMessages).toBe(0);
    expect(stats.longestConversation).toBeNull();
  });

  it('calculates stats correctly', () => {
    const conversations = [
      {
        id: '1', title: 'Chat 1', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'assistant' as const, content: 'Hi there!' },
        ],
      },
      {
        id: '2', title: 'Chat 2', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'Test' },
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.totalConversations).toBe(2);
    expect(stats.totalMessages).toBe(3);
    expect(stats.userMessages).toBe(2);
    expect(stats.assistantMessages).toBe(1);
    expect(stats.averageMessagesPerConversation).toBe(1.5);
    expect(stats.longestConversation?.title).toBe('Chat 1');
    expect(stats.shortestConversation?.title).toBe('Chat 2');
    expect(stats.emptyConversations).toBe(0);
  });

  it('counts empty conversations', () => {
    const conversations = [
      { id: '1', title: 'Empty', timestamp: new Date(), messages: [] },
      { id: '2', title: 'Has msg', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'Hi' }] },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.emptyConversations).toBe(1);
  });

  it('calculates totalCharacters correctly', () => {
    const conversations = [
      {
        id: '1', title: 'Chars', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'abc' },
          { role: 'assistant' as const, content: 'defgh' },
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.totalCharacters).toBe(8);
  });

  it('calculates averageMessageLength correctly', () => {
    const conversations = [
      {
        id: '1', title: 'Avg', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'ab' },
          { role: 'assistant' as const, content: 'cdef' },
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.averageMessageLength).toBe(3);
  });

  it('returns 0 averageMessageLength when all conversations are empty', () => {
    const conversations = [
      { id: '1', title: 'E1', timestamp: new Date(), messages: [] },
      { id: '2', title: 'E2', timestamp: new Date(), messages: [] },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.averageMessageLength).toBe(0);
    expect(stats.emptyConversations).toBe(2);
  });

  it('handles single conversation correctly', () => {
    const conversations = [
      {
        id: '1', title: 'Solo', timestamp: new Date(),
        messages: [{ role: 'user' as const, content: 'only' }],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.totalConversations).toBe(1);
    expect(stats.averageMessagesPerConversation).toBe(1);
    expect(stats.longestConversation?.title).toBe('Solo');
    expect(stats.shortestConversation?.title).toBe('Solo');
  });

  it('identifies longest and shortest with same-length conversations', () => {
    const conversations = [
      { id: '1', title: 'A', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'x' }] },
      { id: '2', title: 'B', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'y' }] },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.longestConversation?.messageCount).toBe(1);
    expect(stats.shortestConversation?.messageCount).toBe(1);
  });

  it('averageMessagesPerConversation rounds to 1 decimal', () => {
    const conversations = [
      {
        id: '1', title: 'A', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'a' },
          { role: 'assistant' as const, content: 'b' },
          { role: 'user' as const, content: 'c' },
        ],
      },
      {
        id: '2', title: 'B', timestamp: new Date(),
        messages: [{ role: 'user' as const, content: 'd' }],
      },
      {
        id: '3', title: 'C', timestamp: new Date(),
        messages: [{ role: 'user' as const, content: 'e' }],
      },
    ];
    const stats = calculateConversationStats(conversations);
    // 5 / 3 = 1.6666... → rounds to 1.7
    expect(stats.averageMessagesPerConversation).toBe(1.7);
  });

  it('longestConversation picks first when tied', () => {
    const conversations = [
      { id: '1', title: 'First', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'x' }, { role: 'assistant' as const, content: 'y' }] },
      { id: '2', title: 'Second', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'a' }, { role: 'assistant' as const, content: 'b' }] },
    ];
    const stats = calculateConversationStats(conversations);
    // First one is set first; second doesn't exceed so first remains
    expect(stats.longestConversation?.title).toBe('First');
  });

  it('shortestConversation picks first when tied', () => {
    const conversations = [
      { id: '1', title: 'First', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'x' }] },
      { id: '2', title: 'Second', timestamp: new Date(), messages: [{ role: 'user' as const, content: 'a' }] },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.shortestConversation?.title).toBe('First');
  });

  it('all fields present in empty stats', () => {
    const stats = calculateConversationStats([]);
    expect(stats).toEqual({
      totalConversations: 0,
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      averageMessagesPerConversation: 0,
      longestConversation: null,
      shortestConversation: null,
      totalCharacters: 0,
      averageMessageLength: 0,
      emptyConversations: 0,
    });
  });

  it('handles many conversations correctly', () => {
    const conversations = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`, title: `Conv ${i}`, timestamp: new Date(),
      messages: Array.from({ length: i % 5 }, (_, j) => ({
        role: (j % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: 'x'.repeat(i + 1),
      })),
    }));
    const stats = calculateConversationStats(conversations);
    expect(stats.totalConversations).toBe(100);
    expect(stats.totalMessages).toBeGreaterThan(0);
  });

  it('averageMessageLength rounds to integer', () => {
    const conversations = [
      {
        id: '1', title: 'A', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: 'abc' },  // 3
          { role: 'assistant' as const, content: 'de' }, // 2
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    // 5 / 2 = 2.5 → Math.round → 3
    expect(stats.averageMessageLength).toBe(3);
  });

  it('handles only-assistant messages', () => {
    const conversations = [
      {
        id: '1', title: 'Bot', timestamp: new Date(),
        messages: [
          { role: 'assistant' as const, content: 'Hi' },
          { role: 'assistant' as const, content: 'Hello' },
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.userMessages).toBe(0);
    expect(stats.assistantMessages).toBe(2);
  });

  it('handles all-empty-content messages', () => {
    const conversations = [
      {
        id: '1', title: 'Empty msgs', timestamp: new Date(),
        messages: [
          { role: 'user' as const, content: '' },
          { role: 'assistant' as const, content: '' },
        ],
      },
    ];
    const stats = calculateConversationStats(conversations);
    expect(stats.totalCharacters).toBe(0);
    expect(stats.averageMessageLength).toBe(0);
  });
});

describe('formatNumber', () => {
  it('returns plain number under 1000', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(5500)).toBe('5.5K');
  });

  it('formats millions with M', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });

  it('formats 0', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formats 999999 as K', () => {
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('formats exact boundary 1000000 as M', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
  });

  it('formats 1500 as 1.5K', () => {
    expect(formatNumber(1500)).toBe('1.5K');
  });
});
