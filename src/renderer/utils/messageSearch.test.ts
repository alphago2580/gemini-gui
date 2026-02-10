import { describe, it, expect } from 'vitest';
import { searchMessages, getMatchContext } from './messageSearch';

describe('searchMessages', () => {
  const conversations = [
    {
      id: '1',
      title: 'React Chat',
      messages: [
        { role: 'user' as const, content: 'Tell me about React hooks' },
        { role: 'assistant' as const, content: 'React hooks are used in functional components' },
      ],
    },
    {
      id: '2',
      title: 'TS Question',
      messages: [
        { role: 'user' as const, content: 'Explain TypeScript generics' },
      ],
    },
  ];

  it('returns empty for empty query', () => {
    expect(searchMessages(conversations, '')).toHaveLength(0);
    expect(searchMessages(conversations, '  ')).toHaveLength(0);
  });

  it('finds matching messages', () => {
    const results = searchMessages(conversations, 'React');
    expect(results).toHaveLength(2);
    expect(results[0].conversationId).toBe('1');
    expect(results[0].messageIndex).toBe(0);
  });

  it('case insensitive search', () => {
    const results = searchMessages(conversations, 'react');
    expect(results).toHaveLength(2);
  });

  it('returns no results for non-matching query', () => {
    expect(searchMessages(conversations, 'Python')).toHaveLength(0);
  });

  it('includes match positions', () => {
    const results = searchMessages(conversations, 'TypeScript');
    expect(results).toHaveLength(1);
    expect(results[0].matchStart).toBeGreaterThanOrEqual(0);
    expect(results[0].matchEnd).toBeGreaterThan(results[0].matchStart);
  });
});

describe('getMatchContext', () => {
  it('returns context around match', () => {
    const content = 'A'.repeat(100);
    const result = getMatchContext(content, 50, 55, 10);
    expect(result).toContain('...');
  });

  it('handles match at start', () => {
    const result = getMatchContext('Hello world', 0, 5, 10);
    expect(result).toContain('Hello');
  });

  it('handles match at end', () => {
    const result = getMatchContext('Hello world', 6, 11, 10);
    expect(result).toContain('world');
  });
});
