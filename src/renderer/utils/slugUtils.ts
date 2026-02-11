/**
 * Slug generation utilities for URL-friendly string conversion.
 */

/** Convert a string to a URL-friendly slug. */
export function slugify(str: string, separator: string = '-'): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove non-alphanumeric chars (keep spaces and hyphens)
    .replace(/[\s-]+/g, separator)   // Replace spaces/hyphens with separator
    .replace(new RegExp(`^${escapeForRegex(separator)}+|${escapeForRegex(separator)}+$`, 'g'), ''); // Trim separators from edges
}

/** Escape a string for use in a RegExp. */
function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Convert a slug back to a human-readable title. */
export function unslugify(slug: string, separator: string = '-'): string {
  return slug
    .split(separator)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Generate a unique slug by appending a numeric suffix if needed. */
export function uniqueSlug(str: string, existing: string[], separator: string = '-'): string {
  const base = slugify(str, separator);
  if (!existing.includes(base)) return base;

  let counter = 1;
  while (existing.includes(`${base}${separator}${counter}`)) {
    counter++;
  }
  return `${base}${separator}${counter}`;
}

/** Truncate a slug to a maximum length, cutting at a separator boundary. */
export function truncateSlug(str: string, maxLength: number, separator: string = '-'): string {
  const slug = slugify(str, separator);
  if (slug.length <= maxLength) return slug;

  const truncated = slug.slice(0, maxLength);
  // If the cut is exactly at a separator boundary (next char is separator or end), keep as-is
  if (slug[maxLength] === separator || slug.length === maxLength) {
    return truncated;
  }
  // Otherwise, cut back to the last separator to avoid partial words
  const lastSep = truncated.lastIndexOf(separator);
  if (lastSep > 0) {
    return truncated.slice(0, lastSep);
  }
  return truncated;
}

/** Check if a string is already a valid slug. */
export function isValidSlug(str: string, separator: string = '-'): boolean {
  const sep = escapeForRegex(separator);
  const pattern = new RegExp(`^[a-z0-9]+(?:${sep}[a-z0-9]+)*$`);
  return pattern.test(str);
}

/** Convert a file path to a slug. */
export function filePathToSlug(filePath: string, separator: string = '-'): string {
  const name = filePath
    .replace(/\\/g, '/')
    .split('/')
    .pop() || '';
  const withoutExt = name.replace(/\.[^.]+$/, '');
  return slugify(withoutExt, separator);
}

/** Convert camelCase or PascalCase to a slug. */
export function camelToSlug(str: string, separator: string = '-'): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, `$1${separator}$2`)
    .replace(/([A-Z])([A-Z][a-z])/g, `$1${separator}$2`)
    .toLowerCase();
}

/** Convert a slug to camelCase. */
export function slugToCamel(slug: string, separator: string = '-'): string {
  const parts = slug.split(separator);
  if (parts.length === 0) return '';
  return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}
