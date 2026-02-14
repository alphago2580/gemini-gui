/**
 * Format a timestamp as a human-readable relative time string
 * using Intl.RelativeTimeFormat for proper i18n support.
 *
 * Handles both past ("5분 전") and future ("5분 후") timestamps.
 * Falls back to a simple formatter when Intl.RelativeTimeFormat is unavailable.
 */

type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

interface TimeThreshold {
  unit: TimeUnit;
  seconds: number;
  max: number;
}

const THRESHOLDS: TimeThreshold[] = [
  { unit: 'second', seconds: 1, max: 60 },
  { unit: 'minute', seconds: 60, max: 3600 },
  { unit: 'hour', seconds: 3600, max: 86400 },
  { unit: 'day', seconds: 86400, max: 604800 },
  { unit: 'week', seconds: 604800, max: 2592000 },
  { unit: 'month', seconds: 2592000, max: 31536000 },
  { unit: 'year', seconds: 31536000, max: Infinity },
];

export interface FormatRelativeTimeOptions {
  /** The locale to use for formatting. Defaults to 'ko-KR'. */
  locale?: string;
  /** Custom "now" timestamp in milliseconds. Defaults to Date.now(). */
  now?: number;
  /** The style of the formatted string: 'long', 'short', or 'narrow'. Defaults to 'long'. */
  style?: 'long' | 'short' | 'narrow';
  /** The numeric display: 'always' or 'auto'. 'auto' may produce "어제" instead of "1일 전". Defaults to 'auto'. */
  numeric?: 'always' | 'auto';
}

/**
 * Determines the appropriate time unit and value for a given time difference.
 */
export function getRelativeTimeParts(diffSeconds: number): { value: number; unit: TimeUnit } {
  const absDiff = Math.abs(diffSeconds);
  const sign = diffSeconds < 0 ? -1 : 1;

  if (absDiff < 10) {
    return { value: 0, unit: 'second' };
  }

  for (const threshold of THRESHOLDS) {
    if (absDiff < threshold.max) {
      const magnitude = Math.floor(absDiff / threshold.seconds);
      return {
        value: sign * magnitude,
        unit: threshold.unit,
      };
    }
  }

  // Fallback — shouldn't be reached due to Infinity max
  const years = Math.floor(absDiff / 31536000);
  return { value: sign * years, unit: 'year' };
}

/**
 * Format a timestamp as a relative time string.
 *
 * @param timestamp - The target timestamp in milliseconds.
 * @param options - Formatting options.
 * @returns A locale-formatted relative time string.
 *
 * @example
 * ```ts
 * formatRelativeTime(Date.now() - 5 * 60 * 1000); // "5분 전"
 * formatRelativeTime(Date.now() + 3600 * 1000);    // "1시간 후"
 * formatRelativeTime(Date.now() - 86400 * 1000);   // "어제"
 * ```
 */
export function formatRelativeTime(
  timestamp: number,
  options: FormatRelativeTimeOptions = {},
): string {
  const {
    locale = 'ko-KR',
    now = Date.now(),
    style = 'long',
    numeric = 'auto',
  } = options;

  const diffMs = timestamp - now;
  const diffSeconds = diffMs / 1000;

  const { value, unit } = getRelativeTimeParts(diffSeconds);

  if (typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function') {
    const formatter = new Intl.RelativeTimeFormat(locale, { style, numeric });
    return formatter.format(value, unit);
  }

  // Fallback for environments without Intl.RelativeTimeFormat
  return fallbackFormat(value, unit);
}

function fallbackFormat(value: number, unit: TimeUnit): string {
  if (value === 0 && unit === 'second') {
    return '방금';
  }

  const absValue = Math.abs(value);
  const unitNames: Record<TimeUnit, string> = {
    second: '초',
    minute: '분',
    hour: '시간',
    day: '일',
    week: '주',
    month: '개월',
    year: '년',
  };

  const unitStr = unitNames[unit];
  const suffix = value < 0 ? '전' : '후';

  return `${absValue}${unitStr} ${suffix}`;
}
