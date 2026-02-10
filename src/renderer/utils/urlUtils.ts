/**
 * urlUtils - URL parsing, validation, and manipulation utilities.
 */

/**
 * Check if a string is a valid URL.
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract the domain (hostname) from a URL string.
 * Returns empty string if invalid.
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Get the file extension from a URL path.
 * Returns empty string if none found.
 */
export function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    if (lastDot === -1) return '';
    const ext = pathname.substring(lastDot + 1);
    // Avoid returning extensions with slashes or query-like parts
    if (ext.includes('/')) return '';
    return ext.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Parse query parameters from a URL into a Record.
 */
export function parseQueryParams(url: string): Record<string, string> {
  try {
    const params = new URL(url).searchParams;
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch {
    return {};
  }
}

/**
 * Build a URL with query parameters appended.
 */
export function buildUrl(base: string, params: Record<string, string | number | boolean>): string {
  try {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Remove query parameters from a URL, returning just the base URL.
 */
export function stripQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

/**
 * Check if a URL is an absolute URL (has protocol).
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * Ensure a URL has a protocol. Defaults to https://.
 */
export function ensureProtocol(url: string, protocol = 'https'): string {
  if (isAbsoluteUrl(url)) return url;
  return `${protocol}://${url}`;
}

/**
 * Extract all URLs from a text string.
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

/**
 * Get the path segments from a URL as an array.
 */
export function getPathSegments(url: string): string[] {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Check if a URL matches a specific domain (case-insensitive).
 */
export function matchesDomain(url: string, domain: string): boolean {
  const urlDomain = getDomain(url);
  return urlDomain.toLowerCase() === domain.toLowerCase();
}

/**
 * Join URL path segments safely, avoiding double slashes.
 */
export function joinPath(...parts: string[]): string {
  return parts
    .map((part, i) => {
      if (i === 0) return part.replace(/\/+$/, '');
      if (i === parts.length - 1) return part.replace(/^\/+/, '');
      return part.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
}
