import { describe, it, expect } from 'vitest';
import { parseMarkdownMeta, MarkdownMeta } from './parseMarkdownMeta';

describe('parseMarkdownMeta', () => {
  it('returns empty meta and original body when no frontmatter', () => {
    const input = '# Hello World\n\nSome content here.';
    const result = parseMarkdownMeta(input);
    expect(result.meta).toEqual({});
    expect(result.body).toBe(input);
  });

  it('parses simple key-value string pairs', () => {
    const input = '---\ntitle: My Post\nauthor: Alice\n---\n# Hello';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('My Post');
    expect(result.meta.author).toBe('Alice');
    expect(result.body).toBe('# Hello');
  });

  it('parses quoted string values with double quotes', () => {
    const input = '---\ntitle: "Hello World"\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Hello World');
  });

  it('parses quoted string values with single quotes', () => {
    const input = "---\ntitle: 'Hello World'\n---\nBody";
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Hello World');
  });

  it('parses boolean true', () => {
    const input = '---\ndraft: true\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.draft).toBe(true);
  });

  it('parses boolean false', () => {
    const input = '---\npublished: false\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.published).toBe(false);
  });

  it('parses integer values', () => {
    const input = '---\nversion: 42\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.version).toBe(42);
  });

  it('parses negative integer values', () => {
    const input = '---\noffset: -5\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.offset).toBe(-5);
  });

  it('parses float values', () => {
    const input = '---\nrating: 3.14\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.rating).toBe(3.14);
  });

  it('parses negative float values', () => {
    const input = '---\ntemp: -2.5\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.temp).toBe(-2.5);
  });

  it('parses dash-style list values', () => {
    const input = '---\ntags:\n  - react\n  - typescript\n  - testing\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.tags).toEqual(['react', 'typescript', 'testing']);
  });

  it('parses inline list values', () => {
    const input = '---\ntags: [react, typescript, testing]\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.tags).toEqual(['react', 'typescript', 'testing']);
  });

  it('parses inline list with quoted items', () => {
    const input = '---\ntags: ["hello world", \'foo bar\']\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.tags).toEqual(['hello world', 'foo bar']);
  });

  it('handles mixed types in frontmatter', () => {
    const input = '---\ntitle: My Post\nversion: 2\ndraft: true\ntags:\n  - a\n  - b\n---\nContent';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('My Post');
    expect(result.meta.version).toBe(2);
    expect(result.meta.draft).toBe(true);
    expect(result.meta.tags).toEqual(['a', 'b']);
    expect(result.body).toBe('Content');
  });

  it('ignores comment lines in frontmatter', () => {
    const input = '---\n# This is a comment\ntitle: Test\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Test');
    expect(Object.keys(result.meta)).toHaveLength(1);
  });

  it('ignores empty lines in frontmatter', () => {
    const input = '---\ntitle: Test\n\nauthor: Bob\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Test');
    expect(result.meta.author).toBe('Bob');
  });

  it('handles frontmatter with no body content', () => {
    const input = '---\ntitle: Only Meta\n---\n';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Only Meta');
    expect(result.body).toBe('');
  });

  it('handles frontmatter at end of file without trailing newline', () => {
    const input = '---\ntitle: Test\n---';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Test');
    expect(result.body).toBe('');
  });

  it('returns original content when --- is not at start', () => {
    const input = 'Some text\n---\ntitle: Not Meta\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta).toEqual({});
    expect(result.body).toBe(input);
  });

  it('handles leading whitespace before frontmatter', () => {
    const input = '  \n---\ntitle: Test\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Test');
    expect(result.body).toBe('Body');
  });

  it('handles empty string input', () => {
    const result = parseMarkdownMeta('');
    expect(result.meta).toEqual({});
    expect(result.body).toBe('');
  });

  it('handles only frontmatter delimiters with no content', () => {
    const input = '---\n---\nBody text';
    const result = parseMarkdownMeta(input);
    expect(result.meta).toEqual({});
    expect(result.body).toBe('Body text');
  });

  it('parses keys with dots and dashes', () => {
    const input = '---\nmy-key: value1\nmy.other.key: value2\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta['my-key']).toBe('value1');
    expect(result.meta['my.other.key']).toBe('value2');
  });

  it('parses keys with underscores', () => {
    const input = '---\ncreated_at: 2024-01-01\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta['created_at']).toBe('2024-01-01');
  });

  it('preserves body content exactly', () => {
    const body = '# Title\n\nParagraph with **bold** text.\n\n```js\nconsole.log("hello");\n```\n';
    const input = `---\ntitle: Test\n---\n${body}`;
    const result = parseMarkdownMeta(input);
    expect(result.body).toBe(body);
  });

  it('handles values with colons', () => {
    const input = '---\nurl: https://example.com\ntime: 12:30:00\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.url).toBe('https://example.com');
    expect(result.meta.time).toBe('12:30:00');
  });

  it('treats string that looks numeric-ish but is not pure number as string', () => {
    const input = '---\ndate: 2024-01-15\ncode: 00123\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.date).toBe('2024-01-15');
    expect(result.meta.code).toBe('00123');
  });

  it('handles single item dash list', () => {
    const input = '---\ntags:\n  - solo\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.tags).toEqual(['solo']);
  });

  it('handles tab-indented list items', () => {
    const input = '---\ntags:\n\t- one\n\t- two\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.tags).toEqual(['one', 'two']);
  });

  it('ignores malformed lines without key-value structure', () => {
    const input = '---\ntitle: Good\nno colon here\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('Good');
    expect(Object.keys(result.meta)).toHaveLength(1);
  });

  it('handles zero as a numeric value', () => {
    const input = '---\ncount: 0\n---\nBody';
    const result = parseMarkdownMeta(input);
    expect(result.meta.count).toBe(0);
  });

  it('handles Korean content in values', () => {
    const input = '---\ntitle: 한글 제목\nauthor: 홍길동\ntags:\n  - 리액트\n  - 타입스크립트\n---\n본문 내용';
    const result = parseMarkdownMeta(input);
    expect(result.meta.title).toBe('한글 제목');
    expect(result.meta.author).toBe('홍길동');
    expect(result.meta.tags).toEqual(['리액트', '타입스크립트']);
    expect(result.body).toBe('본문 내용');
  });
});
