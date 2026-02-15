import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './RelativeTimestamp.css';

export type RelativeTimestampSize = 'small' | 'medium' | 'large';

export interface RelativeTimestampProps {
  /** The timestamp to display relative to now. Accepts Date or ms timestamp. */
  timestamp: Date | number;
  /** Custom "now" reference for testing. Defaults to current time. */
  now?: Date | number;
  /** Enable auto-updating. Defaults to true. */
  autoUpdate?: boolean;
  /** Size variant */
  size?: RelativeTimestampSize;
  /** Locale for absolute date formatting. Defaults to 'ko-KR'. */
  locale?: string;
  /** Show absolute time tooltip on hover. Defaults to true. */
  showTooltip?: boolean;
  /** Additional CSS class */
  className?: string;
  /** id attribute */
  id?: string;
}

/**
 * Format a timestamp as a human-readable relative time string in Korean.
 *
 * Returns strings like: "방금 전", "5초 전", "3분 전", "2시간 전", "어제", "3일 전", "2주 전", "3개월 전", "1년 전"
 */
export function formatRelativeTime(
  timestamp: Date | number,
  now: Date | number = Date.now(),
): string {
  const ts = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const diffMs = nowMs - ts;

  // Future timestamps
  if (diffMs < 0) {
    return '방금 전';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) return '방금 전';
  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (weeks < 5) return `${weeks}주 전`;
  if (months < 12) return `${months}개월 전`;
  return `${years}년 전`;
}

/**
 * Determine the update interval (in ms) based on how old the timestamp is.
 * Recent timestamps update more frequently.
 */
export function getUpdateInterval(diffMs: number): number {
  if (diffMs < 60_000) return 10_000;         // < 1 min → every 10s
  if (diffMs < 3_600_000) return 60_000;      // < 1 hour → every 1 min
  if (diffMs < 86_400_000) return 300_000;    // < 1 day → every 5 min
  return 3_600_000;                            // older → every 1 hour
}

/**
 * Format a Date as an absolute date/time string.
 */
function formatAbsoluteTime(timestamp: Date | number, locale: string): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const RelativeTimestamp: React.FC<RelativeTimestampProps> = ({
  timestamp,
  now: nowProp,
  autoUpdate = true,
  size = 'medium',
  locale = 'ko-KR',
  showTooltip = true,
  className,
  id,
}) => {
  const getNow = useCallback(() => {
    if (nowProp !== undefined) {
      return typeof nowProp === 'number' ? nowProp : nowProp.getTime();
    }
    return Date.now();
  }, [nowProp]);

  const [currentNow, setCurrentNow] = useState(getNow);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const relativeText = useMemo(
    () => formatRelativeTime(timestamp, currentNow),
    [timestamp, currentNow],
  );

  const absoluteText = useMemo(
    () => formatAbsoluteTime(timestamp, locale),
    [timestamp, locale],
  );

  const tsMs = typeof timestamp === 'number' ? timestamp : timestamp.getTime();

  useEffect(() => {
    if (!autoUpdate || nowProp !== undefined) return;

    const scheduleUpdate = () => {
      const diffMs = Date.now() - tsMs;
      const interval = getUpdateInterval(diffMs);
      intervalRef.current = setTimeout(() => {
        setCurrentNow(Date.now());
        scheduleUpdate();
      }, interval);
    };

    scheduleUpdate();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoUpdate, nowProp, tsMs]);

  const classNames = [
    'relative-timestamp',
    `relative-timestamp--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <time
      id={id}
      className={classNames}
      dateTime={new Date(tsMs).toISOString()}
      title={showTooltip ? absoluteText : undefined}
      aria-label={`${relativeText} (${absoluteText})`}
    >
      {relativeText}
    </time>
  );
};

export default React.memo(RelativeTimestamp);
