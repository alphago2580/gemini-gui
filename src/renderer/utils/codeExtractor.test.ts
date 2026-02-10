import { describe, it, expect } from 'vitest';
import { extractCodeBlocks, groupByLanguage } from './codeExtractor';

describe('codeExtractor', () => {
  it('extracts code blocks from messages', () => {
    const messages = [
      { role: 'user' as const, content: 'Check this:\n```js\nconsole.log("hi");\n```' },
      { role: 'assistant' as const, content: 'Here:\n```python\nprint("hello")\n```\nAnd:\n```js\nconst x = 1;\n```' },
    ];
    const codes = extractCodeBlocks(messages);
    expect(codes).toHaveLength(3);
    expect(codes[0].language).toBe('js');
    expect(codes[0].content).toBe('console.log("hi");');
    expect(codes[0].role).toBe('user');
    expect(codes[1].language).toBe('python');
    expect(codes[2].language).toBe('js');
  });

  it('returns empty array for messages without code', () => {
    const messages = [
      { role: 'user' as const, content: 'No code here' },
    ];
    expect(extractCodeBlocks(messages)).toHaveLength(0);
  });

  it('skips empty code blocks', () => {
    const messages = [
      { role: 'user' as const, content: '```\n\n```' },
    ];
    expect(extractCodeBlocks(messages)).toHaveLength(0);
  });

  it('groups by language', () => {
    const codes = [
      { language: 'js', content: 'a', messageIndex: 0, role: 'user' as const },
      { language: 'python', content: 'b', messageIndex: 1, role: 'assistant' as const },
      { language: 'js', content: 'c', messageIndex: 2, role: 'user' as const },
      { language: '', content: 'd', messageIndex: 3, role: 'assistant' as const },
    ];
    const grouped = groupByLanguage(codes);
    expect(grouped.get('js')?.length).toBe(2);
    expect(grouped.get('python')?.length).toBe(1);
    expect(grouped.get('plain')?.length).toBe(1);
  });
});
