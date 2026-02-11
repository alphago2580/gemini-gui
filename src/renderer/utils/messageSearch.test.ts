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

  it('returns empty for empty conversations array', () => {
    expect(searchMessages([], 'hello')).toHaveLength(0);
  });

  it('finds match at start of content', () => {
    const results = searchMessages(conversations, 'Tell');
    expect(results).toHaveLength(1);
    expect(results[0].matchStart).toBe(0);
    expect(results[0].matchEnd).toBe(4);
  });

  it('finds match at end of content', () => {
    const results = searchMessages(conversations, 'generics');
    expect(results).toHaveLength(1);
    expect(results[0].matchEnd).toBe(results[0].content.length);
  });

  it('only finds first occurrence per message', () => {
    const convs = [{
      id: '1',
      title: 'Test',
      messages: [{ role: 'user' as const, content: 'hello hello hello' }],
    }];
    const results = searchMessages(convs, 'hello');
    expect(results).toHaveLength(1);
    expect(results[0].matchStart).toBe(0);
  });

  it('preserves conversationTitle in results', () => {
    const results = searchMessages(conversations, 'TypeScript');
    expect(results[0].conversationTitle).toBe('TS Question');
  });

  it('preserves role in results', () => {
    const results = searchMessages(conversations, 'hooks');
    expect(results[0].role).toBe('user');
    expect(results[1].role).toBe('assistant');
  });

  it('searches across multiple conversations', () => {
    const convs = [
      { id: '1', title: 'A', messages: [{ role: 'user' as const, content: 'shared word' }] },
      { id: '2', title: 'B', messages: [{ role: 'user' as const, content: 'shared again' }] },
    ];
    const results = searchMessages(convs, 'shared');
    expect(results).toHaveLength(2);
    expect(results[0].conversationId).toBe('1');
    expect(results[1].conversationId).toBe('2');
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

  it('returns no ellipsis when content is shorter than context window', () => {
    const result = getMatchContext('short', 0, 5, 40);
    expect(result).toBe('short');
    expect(result).not.toContain('...');
  });

  it('adds leading ellipsis when match is past start', () => {
    const content = 'prefix_long_text_' + 'x'.repeat(50) + '_match_here';
    const matchStart = content.indexOf('match');
    const result = getMatchContext(content, matchStart, matchStart + 5, 5);
    expect(result.startsWith('...')).toBe(true);
  });

  it('adds trailing ellipsis when content continues past context', () => {
    const content = 'match_here' + '_suffix_long_text_' + 'x'.repeat(50);
    const result = getMatchContext(content, 0, 5, 5);
    expect(result.endsWith('...')).toBe(true);
  });

  it('uses default contextLength of 40', () => {
    const content = 'x'.repeat(100) + 'MATCH' + 'y'.repeat(100);
    const matchStart = 100;
    const result = getMatchContext(content, matchStart, matchStart + 5);
    expect(result.startsWith('...')).toBe(true);
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBeLessThan(content.length);
  });

  it('handles zero-length match', () => {
    const result = getMatchContext('Hello world', 5, 5, 3);
    expect(typeof result).toBe('string');
  });
});
