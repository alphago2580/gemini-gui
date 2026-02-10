import { truncate, capitalize, slugify, escapeHtml, stripHtml, highlightMatches, excerpt, countOccurrences, isBlank, pluralize } from './stringUtils';

describe('stringUtils', () => {
  describe('truncate', () => {
    it('returns short strings unchanged', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates and appends suffix', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('uses custom suffix', () => {
      expect(truncate('abcdefgh', 6, '…')).toBe('abcde…');
    });

    it('handles exact length', () => {
      expect(truncate('abc', 3)).toBe('abc');
    });

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles already capitalized', () => {
      expect(capitalize('World')).toBe('World');
    });

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('slugify', () => {
    it('converts to lowercase with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world');
    });

    it('handles multiple spaces', () => {
      expect(slugify('one   two   three')).toBe('one-two-three');
    });

    it('trims leading/trailing hyphens', () => {
      expect(slugify('  hello  ')).toBe('hello');
    });

    it('preserves Korean characters', () => {
      expect(slugify('안녕 세계')).toBe('안녕-세계');
    });
  });

  describe('escapeHtml', () => {
    it('escapes all special characters', () => {
      expect(escapeHtml('<script>"alert(\'xss\')&</script>')).toBe(
        '&lt;script&gt;&quot;alert(&#39;xss&#39;)&amp;&lt;/script&gt;'
      );
    });

    it('returns plain text unchanged', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });
  });

  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    });

    it('handles self-closing tags', () => {
      expect(stripHtml('line<br/>break')).toBe('linebreak');
    });

    it('returns plain text unchanged', () => {
      expect(stripHtml('no tags here')).toBe('no tags here');
    });
  });

  describe('highlightMatches', () => {
    it('wraps matches with mark tags', () => {
      const result = highlightMatches('hello world', 'world');
      expect(result).toContain('<mark>world</mark>');
    });

    it('is case-insensitive', () => {
      const result = highlightMatches('Hello HELLO', 'hello');
      expect(result).toContain('<mark>Hello</mark>');
      expect(result).toContain('<mark>HELLO</mark>');
    });

    it('returns escaped text with empty query', () => {
      expect(highlightMatches('<b>test</b>', '')).toBe('&lt;b&gt;test&lt;/b&gt;');
    });

    it('escapes regex special characters in query', () => {
      const result = highlightMatches('price: $5.00', '$5');
      expect(result).toContain('<mark>');
    });
  });

  describe('excerpt', () => {
    it('returns short strings unchanged', () => {
      expect(excerpt('short', 10)).toBe('short');
    });

    it('cuts at word boundary', () => {
      const result = excerpt('the quick brown fox jumps', 15);
      expect(result).toBe('the quick...');
    });

    it('handles no word boundary', () => {
      const result = excerpt('abcdefghijklmnop', 5);
      expect(result).toBe('abcde...');
    });
  });

  describe('countOccurrences', () => {
    it('counts case-insensitive occurrences', () => {
      expect(countOccurrences('Hello hello HELLO', 'hello')).toBe(3);
    });

    it('returns 0 for no matches', () => {
      expect(countOccurrences('abc', 'xyz')).toBe(0);
    });

    it('returns 0 for empty substring', () => {
      expect(countOccurrences('abc', '')).toBe(0);
    });

    it('handles regex special chars in substring', () => {
      expect(countOccurrences('a.b.c', '.')).toBe(2);
    });
  });

  describe('isBlank', () => {
    it('returns true for empty string', () => {
      expect(isBlank('')).toBe(true);
    });

    it('returns true for whitespace only', () => {
      expect(isBlank('   \t\n  ')).toBe(true);
    });

    it('returns false for non-blank string', () => {
      expect(isBlank('hello')).toBe(false);
    });

    it('returns false for string with leading/trailing spaces', () => {
      expect(isBlank('  hello  ')).toBe(false);
    });
  });

  describe('pluralize', () => {
    it('uses singular for count 1', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
    });

    it('adds s for count > 1', () => {
      expect(pluralize(3, 'item')).toBe('3 items');
    });

    it('uses custom plural', () => {
      expect(pluralize(2, 'child', 'children')).toBe('2 children');
    });

    it('uses plural for count 0', () => {
      expect(pluralize(0, 'item')).toBe('0 items');
    });
  });
});
