/**
 * Crypto utilities — hashing, UUID generation, random values
 */

/**
 * Generate a UUID v4 string using crypto.randomUUID or fallback
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a random hex string of given byte length
 */
export function randomHex(byteLength: number = 16): string {
  if (byteLength <= 0) return '';
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback
  let hex = '';
  for (let i = 0; i < byteLength; i++) {
    hex += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

/**
 * Generate a random integer between min (inclusive) and max (exclusive)
 */
export function randomInt(min: number, max: number): number {
  if (min >= max) return min;
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Simple hash function (djb2) for non-cryptographic use
 * Returns a 32-bit unsigned integer hash
 */
export function hashDjb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Hash a string using SHA-256 via Web Crypto API
 * Returns hex string. Falls back to djb2 hex if Web Crypto is unavailable.
 */
export async function hashSHA256(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback to djb2
  return hashDjb2(str).toString(16);
}

/**
 * Base64 encode a string (UTF-8 safe)
 */
export function base64Encode(str: string): string {
  if (typeof btoa === 'function') {
    // Handle Unicode by encoding to UTF-8 first
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  // Node.js fallback
  return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Base64 decode a string (UTF-8 safe)
 */
export function base64Decode(encoded: string): string {
  if (typeof atob === 'function') {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }
  // Node.js fallback
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * Generate a short ID (8 chars) using random bytes
 */
export function shortId(): string {
  return randomHex(4);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Hash string to consistent HSL color (useful for avatars/tags)
 */
export function stringToColor(str: string): string {
  const hash = hashDjb2(str);
  const h = hash % 360;
  return `hsl(${h}, 65%, 55%)`;
}
