import { describe, it, expect } from 'vitest';
import {
  toBase64,
  fromBase64,
  toHex,
  fromHex,
  urlEncode,
  urlDecode,
  toBase64Url,
  fromBase64Url,
  escapeHtml,
  unescapeHtml,
  bytesToHex,
  hexToBytes,
} from './encodingUtils';

describe('encodingUtils', () => {
  describe('toBase64 / fromBase64', () => {
    it('encodes empty string', () => {
      expect(toBase64('')).toBe('');
    });

    it('encodes simple ASCII string', () => {
      expect(toBase64('hello')).toBe('aGVsbG8=');
    });

    it('round-trips ASCII string', () => {
      const input = 'Hello, World!';
      expect(fromBase64(toBase64(input))).toBe(input);
    });

    it('round-trips Unicode string', () => {
      const input = '안녕하세요 🌍';
      expect(fromBase64(toBase64(input))).toBe(input);
    });

    it('decodes known Base64 value', () => {
      expect(fromBase64('aGVsbG8=')).toBe('hello');
    });

    it('handles special characters', () => {
      const input = '<script>alert("xss")</script>';
      expect(fromBase64(toBase64(input))).toBe(input);
    });
  });

  describe('toHex / fromHex', () => {
    it('encodes empty string', () => {
      expect(toHex('')).toBe('');
    });

    it('encodes simple string', () => {
      expect(toHex('abc')).toBe('616263');
    });

    it('round-trips string', () => {
      const input = 'Hello!';
      expect(fromHex(toHex(input))).toBe(input);
    });

    it('decodes known hex value', () => {
      expect(fromHex('48656c6c6f')).toBe('Hello');
    });

    it('throws on odd-length hex string', () => {
      expect(() => fromHex('abc')).toThrow('Invalid hex string: odd length');
    });

    it('throws on invalid hex characters', () => {
      expect(() => fromHex('ZZZZ')).toThrow('Invalid hex character');
    });

    it('ignores whitespace in hex input', () => {
      expect(fromHex('48 65 6c 6c 6f')).toBe('Hello');
    });
  });

  describe('urlEncode / urlDecode', () => {
    it('encodes space', () => {
      expect(urlEncode('hello world')).toBe('hello%20world');
    });

    it('encodes special characters', () => {
      expect(urlEncode('a=1&b=2')).toBe('a%3D1%26b%3D2');
    });

    it('round-trips string', () => {
      const input = 'path/to/file?q=hello world&lang=ko';
      expect(urlDecode(urlEncode(input))).toBe(input);
    });

    it('handles Unicode', () => {
      const input = '검색어';
      expect(urlDecode(urlEncode(input))).toBe(input);
    });
  });

  describe('toBase64Url / fromBase64Url', () => {
    it('removes padding', () => {
      const result = toBase64Url('a');
      expect(result).not.toContain('=');
    });

    it('replaces + with - and / with _', () => {
      // A string that produces + or / in base64
      const input = '>>??';
      const result = toBase64Url(input);
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });

    it('round-trips string', () => {
      const input = 'Hello, Base64 URL!';
      expect(fromBase64Url(toBase64Url(input))).toBe(input);
    });

    it('round-trips with special chars', () => {
      const input = 'abc+/def==';
      expect(fromBase64Url(toBase64Url(input))).toBe(input);
    });
  });

  describe('escapeHtml / unescapeHtml', () => {
    it('escapes ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes less than', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('escapes double quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('escapes single quotes', () => {
      expect(escapeHtml("it's")).toBe("it&#39;s");
    });

    it('escapes script tag', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('unescapes all entities', () => {
      expect(unescapeHtml('&lt;div class=&quot;test&quot;&gt;')).toBe('<div class="test">');
    });

    it('round-trips string', () => {
      const input = '<a href="test">it\'s a & link</a>';
      expect(unescapeHtml(escapeHtml(input))).toBe(input);
    });

    it('leaves plain text unchanged', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });
  });

  describe('bytesToHex / hexToBytes', () => {
    it('converts empty array', () => {
      expect(bytesToHex(new Uint8Array([]))).toBe('');
    });

    it('converts bytes to hex', () => {
      expect(bytesToHex(new Uint8Array([0, 255, 128]))).toBe('00ff80');
    });

    it('round-trips bytes', () => {
      const input = new Uint8Array([1, 2, 3, 255, 0, 128]);
      expect(hexToBytes(bytesToHex(input))).toEqual(input);
    });

    it('converts hex string to bytes', () => {
      const result = hexToBytes('ff00ab');
      expect(result).toEqual(new Uint8Array([255, 0, 171]));
    });

    it('throws on odd-length hex', () => {
      expect(() => hexToBytes('abc')).toThrow('Invalid hex string: odd length');
    });

    it('throws on invalid hex characters', () => {
      expect(() => hexToBytes('ZZZZ')).toThrow('Invalid hex character');
    });

    it('handles whitespace in hex input', () => {
      const result = hexToBytes('ff 00 ab');
      expect(result).toEqual(new Uint8Array([255, 0, 171]));
    });
  });
});
