/**
 * HTML sanitizer — strips dangerous tags and attributes to prevent XSS.
 *
 * Unlike `escapeHtml` (which escapes ALL HTML) or `stripHtml` (which removes
 * ALL tags), this utility selectively allows safe tags and attributes while
 * removing dangerous content like <script>, event handlers, and javascript: URLs.
 */

/** Default tags considered safe for rendering. */
const DEFAULT_ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'details',
  'div', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
  'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q',
  's', 'samp', 'small', 'span', 'strong', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'var',
]);

/** Default attributes considered safe. Keyed by tag name or '*' for global. */
const DEFAULT_ALLOWED_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  '*': new Set(['class', 'id', 'title', 'lang', 'dir']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
  'ol': new Set(['start', 'type']),
  'blockquote': new Set(['cite']),
  'q': new Set(['cite']),
  'details': new Set(['open']),
};

/** Patterns that indicate a dangerous URL scheme. */
const DANGEROUS_URL_PATTERN = /^\s*(javascript|vbscript|data)\s*:/i;

/** Attributes whose values are URLs and must be scheme-checked. */
const URL_ATTRIBUTES: ReadonlySet<string> = new Set(['href', 'src', 'cite']);

export interface SanitizeOptions {
  /** Set of allowed tag names (lowercase). Defaults to DEFAULT_ALLOWED_TAGS. */
  allowedTags?: ReadonlySet<string>;
  /** Map of tag -> allowed attribute names. Use '*' for global. */
  allowedAttributes?: Readonly<Record<string, ReadonlySet<string>>>;
}

/**
 * Sanitize an HTML string by removing disallowed tags and dangerous attributes.
 *
 * - Disallowed tags are removed but their text content is preserved.
 * - Script/style tags have their content removed entirely.
 * - Event handler attributes (on*) are always stripped.
 * - URL attributes with javascript:/vbscript:/data: schemes are stripped.
 *
 * @param html - The raw HTML string to sanitize.
 * @param options - Optional configuration for allowed tags/attributes.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string, options?: SanitizeOptions): string {
  const allowedTags = options?.allowedTags ?? DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = options?.allowedAttributes ?? DEFAULT_ALLOWED_ATTRIBUTES;

  // First pass: remove script/style tags and their content entirely
  let result = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  // Also remove self-closing or unclosed script/style tags
  result = result.replace(/<(script|style)\b[^>]*\/?>/gi, '');

  // Second pass: process all remaining tags
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g,
    (_match, tagName: string, attrString: string | undefined) => {
      const lowerTag = tagName.toLowerCase();

      // If tag is not allowed, remove it (content is preserved)
      if (!allowedTags.has(lowerTag)) {
        return '';
      }

      // For closing tags, no attributes to process
      if (_match.startsWith('</')) {
        return `</${lowerTag}>`;
      }

      // Process attributes for opening/self-closing tags
      const sanitizedAttrs = sanitizeAttributes(lowerTag, attrString ?? '', allowedAttributes);
      const isSelfClosing = _match.endsWith('/>');
      const attrStr = sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';

      return isSelfClosing ? `<${lowerTag}${attrStr} />` : `<${lowerTag}${attrStr}>`;
    }
  );

  return result;
}

/**
 * Parse and filter attributes for a given tag, keeping only allowed ones.
 */
function sanitizeAttributes(
  tag: string,
  attrString: string,
  allowedAttributes: Readonly<Record<string, ReadonlySet<string>>>
): string[] {
  const result: string[] = [];
  if (!attrString.trim()) return result;

  const globalAllowed = allowedAttributes['*'] ?? new Set<string>();
  const tagAllowed = allowedAttributes[tag] ?? new Set<string>();

  // Match attribute patterns: name="value", name='value', name=value, or name (boolean)
  const attrPattern = /([a-zA-Z][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrPattern.exec(attrString)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

    // Always reject event handlers
    if (attrName.startsWith('on')) {
      continue;
    }

    // Check if attribute is allowed (globally or per-tag)
    if (!globalAllowed.has(attrName) && !tagAllowed.has(attrName)) {
      continue;
    }

    // For URL attributes, check for dangerous schemes
    if (URL_ATTRIBUTES.has(attrName) && DANGEROUS_URL_PATTERN.test(attrValue)) {
      continue;
    }

    // Encode the value to prevent attribute injection
    const safeValue = attrValue
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');

    result.push(`${attrName}="${safeValue}"`);
  }

  return result;
}
