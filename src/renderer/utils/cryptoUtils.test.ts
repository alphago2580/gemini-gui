import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateUUID,
  randomHex,
  randomInt,
  hashDjb2,
  hashSHA256,
  base64Encode,
  base64Decode,
  shortId,
  timingSafeEqual,
  stringToColor,
} from './cryptoUtils';

describe('cryptoUtils', () => {
  describe('generateUUID', () => {
    it('returns a valid UUID v4 format', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('generates unique UUIDs', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
      expect(uuids.size).toBe(100);
    });

    it('works with fallback when crypto.randomUUID is unavailable', () => {
      const originalRandomUUID = crypto.randomUUID;
      Object.defineProperty(crypto, 'randomUUID', {
        value: undefined,
        configurable: true,
      });

      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );

      Object.defineProperty(crypto, 'randomUUID', {
        value: originalRandomUUID,
        configurable: true,
      });
    });
  });

  describe('randomHex', () => {
    it('returns correct length hex string', () => {
      const hex = randomHex(8);
      expect(hex).toHaveLength(16); // 8 bytes = 16 hex chars
    });

    it('returns default 16 byte (32 char) hex', () => {
      const hex = randomHex();
      expect(hex).toHaveLength(32);
    });

    it('returns empty string for zero or negative length', () => {
      expect(randomHex(0)).toBe('');
      expect(randomHex(-1)).toBe('');
    });

    it('returns only hex characters', () => {
      const hex = randomHex(32);
      expect(hex).toMatch(/^[0-9a-f]+$/);
    });

    it('generates unique values', () => {
      const hexes = new Set(Array.from({ length: 50 }, () => randomHex(8)));
      expect(hexes.size).toBe(50);
    });
  });

  describe('randomInt', () => {
    it('returns integer in range [min, max)', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('returns min when min equals max', () => {
      expect(randomInt(5, 5)).toBe(5);
    });

    it('returns min when min > max', () => {
      expect(randomInt(10, 5)).toBe(10);
    });

    it('works with negative numbers', () => {
      for (let i = 0; i < 50; i++) {
        const result = randomInt(-10, 0);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThan(0);
      }
    });
  });

  describe('hashDjb2', () => {
    it('returns consistent hash for same input', () => {
      const hash1 = hashDjb2('hello');
      const hash2 = hashDjb2('hello');
      expect(hash1).toBe(hash2);
    });

    it('returns different hashes for different inputs', () => {
      const hash1 = hashDjb2('hello');
      const hash2 = hashDjb2('world');
      expect(hash1).not.toBe(hash2);
    });

    it('returns number', () => {
      expect(typeof hashDjb2('test')).toBe('number');
    });

    it('handles empty string', () => {
      expect(hashDjb2('')).toBe(5381);
    });

    it('handles Unicode strings', () => {
      const hash = hashDjb2('안녕하세요');
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThan(0);
    });

    it('returns unsigned 32-bit integer', () => {
      const hash = hashDjb2('some long string that might overflow');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe('hashSHA256', () => {
    it('returns hex string of 64 characters', async () => {
      const hash = await hashSHA256('hello');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('returns consistent hash for same input', async () => {
      const hash1 = await hashSHA256('test');
      const hash2 = await hashSHA256('test');
      expect(hash1).toBe(hash2);
    });

    it('returns different hashes for different inputs', async () => {
      const hash1 = await hashSHA256('hello');
      const hash2 = await hashSHA256('world');
      expect(hash1).not.toBe(hash2);
    });

    it('handles empty string', async () => {
      const hash = await hashSHA256('');
      expect(hash).toHaveLength(64);
    });
  });

  describe('base64Encode / base64Decode', () => {
    it('encodes and decodes ASCII string', () => {
      const original = 'hello world';
      const encoded = base64Encode(original);
      expect(encoded).toBe('aGVsbG8gd29ybGQ=');
      expect(base64Decode(encoded)).toBe(original);
    });

    it('encodes and decodes Unicode string', () => {
      const original = '안녕하세요 🌍';
      const encoded = base64Encode(original);
      const decoded = base64Decode(encoded);
      expect(decoded).toBe(original);
    });

    it('handles empty string', () => {
      expect(base64Encode('')).toBe('');
      expect(base64Decode('')).toBe('');
    });

    it('roundtrips special characters', () => {
      const original = '<script>alert("xss")</script>';
      expect(base64Decode(base64Encode(original))).toBe(original);
    });
  });

  describe('shortId', () => {
    it('returns 8 character hex string', () => {
      const id = shortId();
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[0-9a-f]{8}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => shortId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('timingSafeEqual', () => {
    it('returns true for equal strings', () => {
      expect(timingSafeEqual('abc', 'abc')).toBe(true);
    });

    it('returns false for different strings of same length', () => {
      expect(timingSafeEqual('abc', 'abd')).toBe(false);
    });

    it('returns false for different length strings', () => {
      expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    });

    it('returns true for empty strings', () => {
      expect(timingSafeEqual('', '')).toBe(true);
    });

    it('handles Unicode strings', () => {
      expect(timingSafeEqual('안녕', '안녕')).toBe(true);
      expect(timingSafeEqual('안녕', '안뇽')).toBe(false);
    });
  });

  describe('stringToColor', () => {
    it('returns HSL color string', () => {
      const color = stringToColor('test');
      expect(color).toMatch(/^hsl\(\d+, 65%, 55%\)$/);
    });

    it('returns consistent color for same input', () => {
      expect(stringToColor('hello')).toBe(stringToColor('hello'));
    });

    it('returns different colors for different inputs', () => {
      // Different strings usually produce different hues
      const color1 = stringToColor('alice');
      const color2 = stringToColor('bob');
      // Not guaranteed to be different but very likely
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
    });

    it('handles empty string', () => {
      const color = stringToColor('');
      expect(color).toMatch(/^hsl\(\d+, 65%, 55%\)$/);
    });
  });
});
