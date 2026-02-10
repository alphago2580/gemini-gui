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
});
