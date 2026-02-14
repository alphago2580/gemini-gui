import React, { useMemo } from 'react';
import './DateSeparator.css';

export interface DateSeparatorProps {
  /** The date to display. Accepts Date object or timestamp in milliseconds. */
  date: Date | number;
  /** Locale for date formatting. Defaults to 'ko-KR'. */
  locale?: string;
  /** Custom "now" reference for relative labels (오늘/어제). Defaults to current time. */
  now?: Date | number;
  /** Override the formatted label with custom text. */
  label?: string;
}

/**
 * Strips time information from a Date, returning midnight of that day.
 */
function toDateOnly(d: Date | number): Date {
  const date = typeof d === 'number' ? new Date(d) : d;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Formats a date for use as a chat separator label.
 *
 * - Same day as `now` → "오늘"
 * - Previous day → "어제"
 * - Same year → "2월 14일 (금)" (month + day + weekday)
 * - Different year → "2025년 2월 14일 (금)"
 */
export function formatDateLabel(
  date: Date | number,
  options: { locale?: string; now?: Date | number } = {},
): string {
  const { locale = 'ko-KR', now = new Date() } = options;

  const target = toDateOnly(date);
  const today = toDateOnly(now);

  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';

  const targetDate = typeof date === 'number' ? new Date(date) : date;
  const nowDate = typeof now === 'number' ? new Date(now) : now;
  const sameYear = targetDate.getFullYear() === nowDate.getFullYear();

  const weekday = targetDate.toLocaleDateString(locale, { weekday: 'short' });

  if (sameYear) {
    const monthDay = targetDate.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
    });
    return `${monthDay} (${weekday})`;
  }

  const full = targetDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `${full} (${weekday})`;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({
  date,
  locale = 'ko-KR',
  now,
  label: customLabel,
}) => {
  const label = useMemo(() => {
    if (customLabel) return customLabel;
    return formatDateLabel(date, { locale, now });
  }, [date, locale, now, customLabel]);

  return (
    <div
      className="date-separator"
      role="separator"
      aria-label={label}
    >
      <span className="date-separator-line" />
      <span className="date-separator-label">{label}</span>
      <span className="date-separator-line" />
    </div>
  );
};

export default React.memo(DateSeparator);
