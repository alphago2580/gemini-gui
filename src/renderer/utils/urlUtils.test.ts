import { describe, it, expect } from 'vitest';
import {
  isValidUrl,
  getDomain,
  getFileExtension,
  parseQueryParams,
  buildUrl,
  stripQueryParams,
  isAbsoluteUrl,
  ensureProtocol,
  extractUrls,
  getPathSegments,
  matchesDomain,
  joinPath,
} from './urlUtils';

describe('urlUtils', () => {
  describe('isValidUrl', () => {
    it('returns true for valid HTTP URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('returns true for URL with path and query', () => {
      expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
    });

    it('returns false for plain string', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('returns true for ftp URL', () => {
      expect(isValidUrl('ftp://files.example.com/doc.pdf')).toBe(true);
    });
  });

  describe('getDomain', () => {
    it('extracts domain from URL', () => {
      expect(getDomain('https://www.example.com/path')).toBe('www.example.com');
    });

    it('returns empty string for invalid URL', () => {
      expect(getDomain('invalid')).toBe('');
    });

    it('handles URLs with port', () => {
      expect(getDomain('http://localhost:3000/api')).toBe('localhost');
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('https://example.com/file.pdf')).toBe('pdf');
    });

    it('returns lowercase extension', () => {
      expect(getFileExtension('https://example.com/image.PNG')).toBe('png');
    });

    it('returns empty for no extension', () => {
      expect(getFileExtension('https://example.com/path/')).toBe('');
    });

    it('returns empty for invalid URL', () => {
      expect(getFileExtension('invalid')).toBe('');
    });

    it('handles extension with query params', () => {
      expect(getFileExtension('https://example.com/file.js?v=1')).toBe('js');
    });
  });

  describe('parseQueryParams', () => {
    it('parses query parameters', () => {
      expect(parseQueryParams('https://example.com?a=1&b=hello')).toEqual({ a: '1', b: 'hello' });
    });

    it('returns empty object for no params', () => {
      expect(parseQueryParams('https://example.com')).toEqual({});
    });

    it('returns empty object for invalid URL', () => {
      expect(parseQueryParams('invalid')).toEqual({});
    });

    it('handles encoded values', () => {
      expect(parseQueryParams('https://example.com?q=hello%20world')).toEqual({ q: 'hello world' });
    });
  });

  describe('buildUrl', () => {
    it('builds URL with params', () => {
      const result = buildUrl('https://example.com', { page: 1, q: 'test' });
      expect(result).toContain('page=1');
      expect(result).toContain('q=test');
    });

    it('appends to existing params', () => {
      const result = buildUrl('https://example.com?a=1', { b: 2 });
      expect(result).toContain('a=1');
      expect(result).toContain('b=2');
    });

    it('returns base for invalid URL', () => {
      expect(buildUrl('invalid', { a: '1' })).toBe('invalid');
    });

    it('handles boolean and number values', () => {
      const result = buildUrl('https://example.com', { flag: true, count: 5 });
      expect(result).toContain('flag=true');
      expect(result).toContain('count=5');
    });
  });

  describe('stripQueryParams', () => {
    it('removes query params from URL', () => {
      expect(stripQueryParams('https://example.com/path?a=1&b=2')).toBe('https://example.com/path');
    });

    it('returns same URL if no params', () => {
      expect(stripQueryParams('https://example.com/path')).toBe('https://example.com/path');
    });

    it('returns original for invalid URL', () => {
      expect(stripQueryParams('invalid')).toBe('invalid');
    });
  });

  describe('isAbsoluteUrl', () => {
    it('returns true for https', () => {
      expect(isAbsoluteUrl('https://example.com')).toBe(true);
    });

    it('returns true for http', () => {
      expect(isAbsoluteUrl('http://example.com')).toBe(true);
    });

    it('returns false for relative path', () => {
      expect(isAbsoluteUrl('/path/to/file')).toBe(false);
    });

    it('returns false for plain text', () => {
      expect(isAbsoluteUrl('example.com')).toBe(false);
    });

    it('returns true for custom protocol', () => {
      expect(isAbsoluteUrl('mailto:user@example.com')).toBe(true);
    });
  });

  describe('ensureProtocol', () => {
    it('adds https:// to bare domain', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
    });

    it('keeps existing protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });

    it('supports custom protocol', () => {
      expect(ensureProtocol('example.com', 'ftp')).toBe('ftp://example.com');
    });
  });

  describe('extractUrls', () => {
    it('extracts URLs from text', () => {
      const text = 'Visit https://example.com and http://test.org for more.';
      expect(extractUrls(text)).toEqual(['https://example.com', 'http://test.org']);
    });

    it('returns empty array for no URLs', () => {
      expect(extractUrls('no urls here')).toEqual([]);
    });

    it('handles URLs with paths and params', () => {
      const text = 'Link: https://example.com/path?q=1';
      expect(extractUrls(text)).toEqual(['https://example.com/path?q=1']);
    });
  });

  describe('getPathSegments', () => {
    it('returns path segments', () => {
      expect(getPathSegments('https://example.com/a/b/c')).toEqual(['a', 'b', 'c']);
    });

    it('returns empty array for root path', () => {
      expect(getPathSegments('https://example.com/')).toEqual([]);
    });

    it('returns empty for invalid URL', () => {
      expect(getPathSegments('invalid')).toEqual([]);
    });
  });

  describe('matchesDomain', () => {
    it('matches exact domain', () => {
      expect(matchesDomain('https://example.com/path', 'example.com')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(matchesDomain('https://Example.COM', 'example.com')).toBe(true);
    });

    it('does not match different domain', () => {
      expect(matchesDomain('https://other.com', 'example.com')).toBe(false);
    });
  });

  describe('joinPath', () => {
    it('joins path segments', () => {
      expect(joinPath('https://example.com', 'api', 'v1', 'users')).toBe('https://example.com/api/v1/users');
    });

    it('handles trailing and leading slashes', () => {
      expect(joinPath('https://example.com/', '/api/', '/v1')).toBe('https://example.com/api/v1');
    });

    it('handles single part', () => {
      expect(joinPath('/path')).toBe('/path');
    });

    it('filters empty parts', () => {
      expect(joinPath('a', '', 'b')).toBe('a/b');
    });
  });
});
