import { describe, it, expect } from 'vitest';
import { extractLinks } from './linkExtractor';

describe('linkExtractor', () => {
  it('extracts markdown links', () => {
    const messages = [
      { role: 'user' as const, content: 'Check [Google](https://google.com)' },
    ];
    const links = extractLinks(messages);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('https://google.com');
    expect(links[0].text).toBe('Google');
    expect(links[0].messageIndex).toBe(0);
    expect(links[0].role).toBe('user');
  });

  it('extracts bare URLs', () => {
    const messages = [
      { role: 'assistant' as const, content: 'Visit https://example.com for more' },
    ];
    const links = extractLinks(messages);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('https://example.com');
    expect(links[0].text).toBe('https://example.com');
  });

  it('extracts both markdown and bare URLs from same message', () => {
    const messages = [
      { role: 'assistant' as const, content: 'See [Docs](https://docs.com) and https://example.com' },
    ];
    const links = extractLinks(messages);
    expect(links).toHaveLength(2);
  });

  it('deduplicates same URL in same message', () => {
    const messages = [
      { role: 'user' as const, content: '[A](https://x.com) and [B](https://x.com)' },
    ];
    const links = extractLinks(messages);
    expect(links).toHaveLength(1);
  });

  it('returns empty for messages without links', () => {
    const messages = [
      { role: 'user' as const, content: 'No links here' },
    ];
    expect(extractLinks(messages)).toHaveLength(0);
  });

  it('handles multiple messages', () => {
    const messages = [
      { role: 'user' as const, content: 'Check [Google](https://google.com)' },
      { role: 'assistant' as const, content: 'See https://example.com and [Docs](https://docs.com)' },
      { role: 'user' as const, content: 'No links' },
    ];
    const links = extractLinks(messages);
    expect(links).toHaveLength(3);
  });
});
