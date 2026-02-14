/**
 * Parsed result from markdown frontmatter.
 */
export interface MarkdownMeta {
  /** Key-value pairs from the YAML frontmatter block. */
  meta: Record<string, string | string[] | boolean | number>;
  /** The markdown body content after the frontmatter. */
  body: string;
}

const FRONTMATTER_REGEX = /^---[ \t]*\n([\s\S]*?\n)?---[ \t]*(?:\n|$)/;

/**
 * Parse YAML-like frontmatter from a markdown string.
 *
 * Supports:
 * - String values: `key: value`
 * - Quoted strings: `key: "value"` or `key: 'value'`
 * - Boolean values: `key: true` / `key: false`
 * - Numeric values: `key: 42` / `key: 3.14`
 * - List values (dash syntax):
 *   ```
 *   tags:
 *     - foo
 *     - bar
 *   ```
 * - Inline list values: `tags: [foo, bar]`
 *
 * Does NOT support nested objects or multi-line strings.
 */
export function parseMarkdownMeta(markdown: string): MarkdownMeta {
  const trimmed = markdown.trimStart();
  const match = trimmed.match(FRONTMATTER_REGEX);

  if (!match) {
    return { meta: {}, body: markdown };
  }

  const rawFrontmatter = match[1] ?? '';
  const body = trimmed.slice(match[0].length);
  const meta = parseFrontmatter(rawFrontmatter);

  return { meta, body };
}

function parseFrontmatter(raw: string): Record<string, string | string[] | boolean | number> {
  const result: Record<string, string | string[] | boolean | number> = {};
  const lines = raw.split('\n');

  let currentKey = '';
  let currentList: string[] | null = null;

  for (const line of lines) {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      continue;
    }

    // Check if this is a list item (  - value)
    const listItemMatch = line.match(/^[ \t]+- (.+)$/);
    if (listItemMatch && currentKey && currentList !== null) {
      currentList.push(parseScalar(listItemMatch[1].trim()));
      result[currentKey] = currentList;
      continue;
    }

    // Flush pending list
    if (currentList !== null) {
      currentList = null;
    }

    // Key-value pair
    const kvMatch = line.match(/^([a-zA-Z_][\w.-]*)\s*:\s*(.*)$/);
    if (!kvMatch) {
      continue;
    }

    const key = kvMatch[1];
    const rawValue = kvMatch[2].trim();

    // Empty value — may be followed by list items
    if (rawValue === '') {
      currentKey = key;
      currentList = [];
      continue;
    }

    // Inline list: [foo, bar, baz]
    const inlineListMatch = rawValue.match(/^\[(.+)]$/);
    if (inlineListMatch) {
      const items = inlineListMatch[1].split(',').map(item => parseScalar(item.trim()));
      result[key] = items;
      currentKey = key;
      currentList = null;
      continue;
    }

    // Scalar value
    result[key] = parseValue(rawValue);
    currentKey = key;
    currentList = null;
  }

  return result;
}

function parseScalar(value: string): string {
  return stripQuotes(value);
}

function parseValue(raw: string): string | boolean | number {
  // Boolean
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  // Numeric (integer or float) — skip leading-zero strings like "00123"
  if (/^-?(0|[1-9]\d*)$/.test(raw)) return parseInt(raw, 10);
  if (/^-?(0|[1-9]\d*)\.\d+$/.test(raw)) return parseFloat(raw);

  // Quoted string
  return stripQuotes(raw);
}

function stripQuotes(str: string): string {
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    return str.slice(1, -1);
  }
  return str;
}
