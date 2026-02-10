import { describe, it, expect } from 'vitest';
import {
  insertBold,
  insertItalic,
  insertInlineCode,
  insertStrikethrough,
  insertLink,
  insertCodeBlock,
  wrapSelection,
} from './textFormatting';

describe('textFormatting', () => {
  describe('wrapSelection', () => {
    it('wraps selected text', () => {
      const result = wrapSelection('hello world', 6, 11, '**', '**');
      expect(result.text).toBe('hello **world**');
      expect(result.selectionStart).toBe(8);
      expect(result.selectionEnd).toBe(13);
    });

    it('inserts placeholder when no selection', () => {
      const result = wrapSelection('hello', 5, 5, '**', '**');
      expect(result.text).toBe('hello**text**');
      expect(result.selectionStart).toBe(7);
      expect(result.selectionEnd).toBe(11);
    });
  });

  describe('insertBold', () => {
    it('wraps selected text in **', () => {
      const result = insertBold('hello', 0, 5);
      expect(result.text).toBe('**hello**');
    });
  });

  describe('insertItalic', () => {
    it('wraps selected text in *', () => {
      const result = insertItalic('hello', 0, 5);
      expect(result.text).toBe('*hello*');
    });
  });

  describe('insertInlineCode', () => {
    it('wraps selected text in backticks', () => {
      const result = insertInlineCode('hello', 0, 5);
      expect(result.text).toBe('`hello`');
    });
  });

  describe('insertStrikethrough', () => {
    it('wraps selected text in ~~', () => {
      const result = insertStrikethrough('hello', 0, 5);
      expect(result.text).toBe('~~hello~~');
    });
  });

  describe('insertLink', () => {
    it('wraps selected text in link syntax', () => {
      const result = insertLink('hello', 0, 5);
      expect(result.text).toBe('[hello](url)');
    });

    it('inserts placeholder when no selection', () => {
      const result = insertLink('', 0, 0);
      expect(result.text).toBe('[text](url)');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('insertCodeBlock', () => {
    it('wraps selected text in code block', () => {
      const result = insertCodeBlock('hello', 0, 5);
      expect(result.text).toBe('```\nhello\n```');
    });

    it('inserts placeholder when no selection', () => {
      const result = insertCodeBlock('', 0, 0);
      expect(result.text).toBe('```\ncode\n```');
      expect(result.selectionStart).toBe(4);
      expect(result.selectionEnd).toBe(8);
    });
  });

  describe('wrapSelection — edge cases', () => {
    it('wraps selection in the middle of text', () => {
      const result = wrapSelection('hello beautiful world', 6, 15, '**', '**');
      expect(result.text).toBe('hello **beautiful** world');
      expect(result.selectionStart).toBe(8);
      expect(result.selectionEnd).toBe(17);
    });

    it('inserts placeholder at cursor position in middle of text', () => {
      const result = wrapSelection('hello world', 5, 5, '`', '`');
      expect(result.text).toBe('hello`text` world');
      expect(result.selectionStart).toBe(6);
      expect(result.selectionEnd).toBe(10);
    });

    it('handles asymmetric prefix and suffix', () => {
      const result = wrapSelection('abc', 0, 3, '<em>', '</em>');
      expect(result.text).toBe('<em>abc</em>');
      expect(result.selectionStart).toBe(4);
      expect(result.selectionEnd).toBe(7);
    });
  });

  describe('insertBold — no selection', () => {
    it('inserts placeholder when no selection', () => {
      const result = insertBold('hello ', 6, 6);
      expect(result.text).toBe('hello **text**');
      expect(result.selectionStart).toBe(8);
      expect(result.selectionEnd).toBe(12);
    });
  });

  describe('insertLink — cursor positioning with selection', () => {
    it('selects url placeholder when text is selected', () => {
      const result = insertLink('click here please', 6, 10);
      expect(result.text).toBe('click [here](url) please');
      expect(result.selectionStart).toBe(13);
      expect(result.selectionEnd).toBe(16);
    });
  });

  describe('insertCodeBlock — cursor positioning with selection', () => {
    it('selects content inside code block when text is selected', () => {
      const result = insertCodeBlock('prefix some code suffix', 7, 16);
      expect(result.text).toBe('prefix ```\nsome code\n``` suffix');
      expect(result.selectionStart).toBe(11);
      expect(result.selectionEnd).toBe(20);
    });
  });

  describe('insertInlineCode — no selection', () => {
    it('inserts placeholder when no selection', () => {
      const result = insertInlineCode('word ', 5, 5);
      expect(result.text).toBe('word `text`');
      expect(result.selectionStart).toBe(6);
      expect(result.selectionEnd).toBe(10);
    });
  });

  describe('insertStrikethrough — no selection', () => {
    it('inserts placeholder when no selection', () => {
      const result = insertStrikethrough('', 0, 0);
      expect(result.text).toBe('~~text~~');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(6);
    });
  });
});
