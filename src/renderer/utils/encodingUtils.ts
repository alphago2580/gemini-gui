/**
 * Encoding and decoding utilities for common formats.
 */

/** Encode a string to Base64. */
export function toBase64(input: string): string {
  if (typeof btoa === 'function') {
    // Handle Unicode by encoding to UTF-8 first
    return btoa(
      encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  }
  return Buffer.from(input, 'utf-8').toString('base64');
}

/** Decode a Base64 string. */
export function fromBase64(input: string): string {
  if (typeof atob === 'function') {
    return decodeURIComponent(
      Array.from(atob(input))
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  }
  return Buffer.from(input, 'base64').toString('utf-8');
}

/** Encode a string to hexadecimal. */
export function toHex(input: string): string {
  return Array.from(input)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

/** Decode a hexadecimal string. */
export function fromHex(input: string): string {
  const hex = input.replace(/\s+/g, '');
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  const chars: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16);
    if (isNaN(code)) {
      throw new Error(`Invalid hex character at position ${i}`);
    }
    chars.push(String.fromCharCode(code));
  }
  return chars.join('');
}

/** URL-encode a string. */
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

/** URL-decode a string. */
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

/** Encode a string to a URL-safe Base64 variant (no padding, + → -, / → _). */
export function toBase64Url(input: string): string {
  return toBase64(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decode a URL-safe Base64 string. */
export function fromBase64Url(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 2) base64 += '==';
  else if (pad === 3) base64 += '=';
  return fromBase64(base64);
}

/** Escape HTML special characters. */
export function escapeHtml(input: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/** Unescape HTML entities back to characters. */
export function unescapeHtml(input: string): string {
  const unescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => unescapeMap[entity]);
}

/** Convert a Uint8Array to a hex string. */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Convert a hex string to a Uint8Array. */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const val = parseInt(clean.substring(i, i + 2), 16);
    if (isNaN(val)) {
      throw new Error(`Invalid hex character at position ${i}`);
    }
    bytes[i / 2] = val;
  }
  return bytes;
}
