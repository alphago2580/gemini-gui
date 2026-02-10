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
});
