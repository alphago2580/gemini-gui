/**
 * Regex pattern utilities for common validation and matching tasks.
 */

/** Escape special regex characters in a string. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Test if a string is a valid email address. */
export function isEmail(str: string): boolean {
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return pattern.test(str);
}

/** Test if a string is a valid URL. */
export function isUrl(str: string): boolean {
  const pattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  return pattern.test(str);
}

/** Test if a string is a valid IPv4 address. */
export function isIPv4(str: string): boolean {
  const pattern = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return pattern.test(str);
}

/** Test if a string contains only alphanumeric characters. */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/** Test if a string is a valid hex color (3 or 6 digits, with or without #). */
export function isHexColor(str: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str);
}

/** Extract all email addresses from a string. */
export function extractEmails(str: string): string[] {
  const pattern = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g;
  return str.match(pattern) || [];
}

/** Extract all URLs from a string. */
export function extractUrls(str: string): string[] {
  const pattern = /https?:\/\/[^\s/$.?#].[^\s)>]*/gi;
  return str.match(pattern) || [];
}

/** Extract all hashtags from a string. */
export function extractHashtags(str: string): string[] {
  const pattern = /#[a-zA-Z0-9_\u00C0-\u024F\uAC00-\uD7AF]+/g;
  return str.match(pattern) || [];
}

/** Extract all @mentions from a string. */
export function extractMentions(str: string): string[] {
  const pattern = /@[a-zA-Z0-9_]+/g;
  return str.match(pattern) || [];
}

/** Test if a string matches a glob-like pattern (* and ?). */
export function matchesGlob(str: string, pattern: string): boolean {
  const regexStr = escapeRegex(pattern)
    .replace(/\\\*/g, '.*')
    .replace(/\\\?/g, '.');
  return new RegExp(`^${regexStr}$`).test(str);
}

/** Count occurrences of a pattern in a string. */
export function countMatches(str: string, pattern: string | RegExp): number {
  const regex =
    typeof pattern === 'string'
      ? new RegExp(escapeRegex(pattern), 'g')
      : new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return (str.match(regex) || []).length;
}

/** Test if a string is a valid UUID (v4). */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/** Test if a string contains only digits. */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/** Replace all occurrences of a literal string (no regex special chars). */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}
