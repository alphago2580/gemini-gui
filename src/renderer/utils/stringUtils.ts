/**
 * Truncate a string to maxLength, appending suffix if truncated.
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize the first character of a string.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Convert a string to slug form (lowercase, hyphens, no special chars).
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Highlight occurrences of query in text by wrapping with <mark> tags.
 * Case-insensitive.
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escapeHtml(text).replace(
    new RegExp(`(${escapedQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')})`, 'gi'),
    '<mark>$1</mark>'
  );
}

/**
 * Extract the first N characters as an excerpt, ending at a word boundary.
 */
export function excerpt(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  const trimmed = str.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.5) {
    return trimmed.slice(0, lastSpace) + '...';
  }
  return trimmed + '...';
}

/**
 * Count occurrences of a substring in a string (case-insensitive).
 */
export function countOccurrences(str: string, substring: string): number {
  if (!substring) return 0;
  const escaped = substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = str.match(new RegExp(escaped, 'gi'));
  return matches ? matches.length : 0;
}

/**
 * Check if a string contains only whitespace or is empty.
 */
export function isBlank(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Pluralize a word based on count: pluralize(1, 'item') => '1 item', pluralize(3, 'item') => '3 items'.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural || singular + 's');
  return `${count} ${word}`;
}
