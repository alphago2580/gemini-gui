import { describe, it, expect } from 'vitest';
import {
  escapeRegex,
  isEmail,
  isUrl,
  isIPv4,
  isAlphanumeric,
  isHexColor,
  extractEmails,
  extractUrls,
  extractHashtags,
  extractMentions,
  matchesGlob,
  countMatches,
  isUUID,
  isNumeric,
  replaceAll,
} from './regexUtils';

describe('regexUtils', () => {
  describe('escapeRegex', () => {
    it('escapes special characters', () => {
      expect(escapeRegex('a.b*c?d')).toBe('a\\.b\\*c\\?d');
    });

    it('escapes brackets and braces', () => {
      expect(escapeRegex('[test]{1}')).toBe('\\[test\\]\\{1\\}');
    });

    it('leaves normal text unchanged', () => {
      expect(escapeRegex('hello world')).toBe('hello world');
    });

    it('escapes dollar and caret', () => {
      expect(escapeRegex('^start$end')).toBe('\\^start\\$end');
    });
  });

  describe('isEmail', () => {
    it('validates basic email', () => {
      expect(isEmail('user@example.com')).toBe(true);
    });

    it('validates email with subdomain', () => {
      expect(isEmail('user@mail.example.com')).toBe(true);
    });

    it('validates email with dots in local part', () => {
      expect(isEmail('first.last@example.com')).toBe(true);
    });

    it('rejects missing @', () => {
      expect(isEmail('userexample.com')).toBe(false);
    });

    it('rejects missing domain', () => {
      expect(isEmail('user@')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isEmail('')).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('validates http URL', () => {
      expect(isUrl('http://example.com')).toBe(true);
    });

    it('validates https URL', () => {
      expect(isUrl('https://example.com/path')).toBe(true);
    });

    it('validates URL with query string', () => {
      expect(isUrl('https://example.com?q=test')).toBe(true);
    });

    it('rejects without protocol', () => {
      expect(isUrl('example.com')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isUrl('')).toBe(false);
    });
  });

  describe('isIPv4', () => {
    it('validates standard IP', () => {
      expect(isIPv4('192.168.1.1')).toBe(true);
    });

    it('validates localhost', () => {
      expect(isIPv4('127.0.0.1')).toBe(true);
    });

    it('validates max values', () => {
      expect(isIPv4('255.255.255.255')).toBe(true);
    });

    it('rejects values > 255', () => {
      expect(isIPv4('256.0.0.1')).toBe(false);
    });

    it('rejects too few octets', () => {
      expect(isIPv4('192.168.1')).toBe(false);
    });

    it('rejects non-numeric', () => {
      expect(isIPv4('abc.def.ghi.jkl')).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('accepts letters and digits', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
    });

    it('rejects spaces', () => {
      expect(isAlphanumeric('abc 123')).toBe(false);
    });

    it('rejects special characters', () => {
      expect(isAlphanumeric('abc!')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isAlphanumeric('')).toBe(false);
    });
  });

  describe('isHexColor', () => {
    it('validates 6-digit with #', () => {
      expect(isHexColor('#ff0000')).toBe(true);
    });

    it('validates 3-digit with #', () => {
      expect(isHexColor('#f00')).toBe(true);
    });

    it('validates without #', () => {
      expect(isHexColor('ff0000')).toBe(true);
    });

    it('rejects invalid hex', () => {
      expect(isHexColor('#gggggg')).toBe(false);
    });

    it('rejects wrong length', () => {
      expect(isHexColor('#ff00')).toBe(false);
    });
  });

  describe('extractEmails', () => {
    it('extracts single email', () => {
      expect(extractEmails('Contact us at info@test.com')).toEqual(['info@test.com']);
    });

    it('extracts multiple emails', () => {
      const text = 'Email a@b.com or c@d.com';
      expect(extractEmails(text)).toEqual(['a@b.com', 'c@d.com']);
    });

    it('returns empty array when no emails', () => {
      expect(extractEmails('no emails here')).toEqual([]);
    });
  });

  describe('extractUrls', () => {
    it('extracts URLs from text', () => {
      const text = 'Visit https://example.com for more info';
      expect(extractUrls(text)).toEqual(['https://example.com']);
    });

    it('extracts multiple URLs', () => {
      const text = 'See http://a.com and https://b.com/path';
      expect(extractUrls(text)).toEqual(['http://a.com', 'https://b.com/path']);
    });

    it('returns empty when no URLs', () => {
      expect(extractUrls('just plain text')).toEqual([]);
    });
  });

  describe('extractHashtags', () => {
    it('extracts hashtags', () => {
      expect(extractHashtags('Hello #world #test')).toEqual(['#world', '#test']);
    });

    it('extracts Korean hashtags', () => {
      expect(extractHashtags('#안녕 #세계')).toEqual(['#안녕', '#세계']);
    });

    it('returns empty when no hashtags', () => {
      expect(extractHashtags('no tags')).toEqual([]);
    });
  });

  describe('extractMentions', () => {
    it('extracts mentions', () => {
      expect(extractMentions('Hello @user1 and @user2')).toEqual(['@user1', '@user2']);
    });

    it('returns empty when no mentions', () => {
      expect(extractMentions('no mentions')).toEqual([]);
    });
  });

  describe('matchesGlob', () => {
    it('matches with wildcard *', () => {
      expect(matchesGlob('file.txt', '*.txt')).toBe(true);
    });

    it('matches with wildcard ?', () => {
      expect(matchesGlob('file1.txt', 'file?.txt')).toBe(true);
    });

    it('rejects non-matching', () => {
      expect(matchesGlob('file.csv', '*.txt')).toBe(false);
    });

    it('matches exact string', () => {
      expect(matchesGlob('hello', 'hello')).toBe(true);
    });

    it('? does not match empty', () => {
      expect(matchesGlob('file.txt', 'file?.txt')).toBe(false);
    });
  });

  describe('countMatches', () => {
    it('counts string pattern occurrences', () => {
      expect(countMatches('hello world hello', 'hello')).toBe(2);
    });

    it('counts regex pattern occurrences', () => {
      expect(countMatches('abc123def456', /\d+/g)).toBe(2);
    });

    it('returns 0 for no matches', () => {
      expect(countMatches('hello', 'xyz')).toBe(0);
    });

    it('handles regex without global flag', () => {
      expect(countMatches('aaa', /a/)).toBe(3);
    });
  });

  describe('isUUID', () => {
    it('validates v4 UUID', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('rejects invalid UUID', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
    });

    it('rejects UUID v1 format', () => {
      expect(isUUID('550e8400-e29b-11d4-a716-446655440000')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('accepts digits only', () => {
      expect(isNumeric('12345')).toBe(true);
    });

    it('rejects decimals', () => {
      expect(isNumeric('12.34')).toBe(false);
    });

    it('rejects negative', () => {
      expect(isNumeric('-1')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isNumeric('')).toBe(false);
    });
  });

  describe('replaceAll', () => {
    it('replaces all occurrences', () => {
      expect(replaceAll('aXbXc', 'X', 'Y')).toBe('aYbYc');
    });

    it('handles no occurrences', () => {
      expect(replaceAll('hello', 'x', 'y')).toBe('hello');
    });

    it('handles empty replacement', () => {
      expect(replaceAll('a.b.c', '.', '')).toBe('abc');
    });

    it('handles special regex characters safely', () => {
      expect(replaceAll('a[0]b[1]', '[', '(')).toBe('a(0]b(1]');
    });
  });
});
