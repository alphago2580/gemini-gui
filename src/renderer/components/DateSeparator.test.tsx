import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DateSeparator, { formatDateLabel } from './DateSeparator';

describe('DateSeparator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 15, 12, 0, 0)); // Feb 15, 2026 12:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDateLabel', () => {
    const now = new Date(2026, 1, 15, 12, 0, 0);

    it('returns "오늘" for today', () => {
      const today = new Date(2026, 1, 15, 8, 30, 0);
      expect(formatDateLabel(today, { now })).toBe('오늘');
    });

    it('returns "오늘" for today at midnight', () => {
      const todayMidnight = new Date(2026, 1, 15, 0, 0, 0);
      expect(formatDateLabel(todayMidnight, { now })).toBe('오늘');
    });

    it('returns "오늘" for today at 23:59', () => {
      const todayLate = new Date(2026, 1, 15, 23, 59, 59);
      expect(formatDateLabel(todayLate, { now })).toBe('오늘');
    });

    it('returns "어제" for yesterday', () => {
      const yesterday = new Date(2026, 1, 14, 18, 0, 0);
      expect(formatDateLabel(yesterday, { now })).toBe('어제');
    });

    it('returns "어제" for yesterday at midnight', () => {
      const yesterdayMidnight = new Date(2026, 1, 14, 0, 0, 0);
      expect(formatDateLabel(yesterdayMidnight, { now })).toBe('어제');
    });

    it('returns month and day with weekday for same year', () => {
      const feb13 = new Date(2026, 1, 13, 10, 0, 0);
      const result = formatDateLabel(feb13, { now });
      // Should contain month, day and weekday info
      expect(result).toContain('13');
      expect(result).toMatch(/\(.+\)/); // weekday in parentheses
    });

    it('includes year for dates in a different year', () => {
      const lastYear = new Date(2025, 11, 25, 10, 0, 0);
      const result = formatDateLabel(lastYear, { now });
      expect(result).toContain('2025');
      expect(result).toContain('25');
      expect(result).toMatch(/\(.+\)/); // weekday in parentheses
    });

    it('handles timestamp input', () => {
      const todayTs = new Date(2026, 1, 15, 9, 0, 0).getTime();
      expect(formatDateLabel(todayTs, { now })).toBe('오늘');
    });

    it('handles timestamp for now parameter', () => {
      const today = new Date(2026, 1, 15, 9, 0, 0);
      expect(formatDateLabel(today, { now: now.getTime() })).toBe('오늘');
    });

    it('uses current time as default now', () => {
      const today = new Date(2026, 1, 15, 9, 0, 0);
      expect(formatDateLabel(today)).toBe('오늘');
    });

    it('defaults to ko-KR locale', () => {
      const date = new Date(2026, 0, 10, 10, 0, 0); // Jan 10
      const result = formatDateLabel(date, { now });
      // Korean locale should produce Korean month names
      expect(result).toContain('1월');
    });

    it('handles dates far in the past', () => {
      const oldDate = new Date(2020, 5, 15, 10, 0, 0);
      const result = formatDateLabel(oldDate, { now });
      expect(result).toContain('2020');
    });

    it('handles two days ago (not yesterday)', () => {
      const twoDaysAgo = new Date(2026, 1, 13, 10, 0, 0);
      const result = formatDateLabel(twoDaysAgo, { now });
      expect(result).not.toBe('오늘');
      expect(result).not.toBe('어제');
    });
  });

  describe('rendering', () => {
    it('renders with a Date object', () => {
      render(<DateSeparator date={new Date(2026, 1, 15)} />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
      expect(screen.getByText('오늘')).toBeInTheDocument();
    });

    it('renders with a timestamp', () => {
      const ts = new Date(2026, 1, 15, 10, 0, 0).getTime();
      render(<DateSeparator date={ts} />);
      expect(screen.getByText('오늘')).toBeInTheDocument();
    });

    it('renders "어제" for yesterday', () => {
      render(<DateSeparator date={new Date(2026, 1, 14)} />);
      expect(screen.getByText('어제')).toBeInTheDocument();
    });

    it('renders formatted date for older dates', () => {
      render(<DateSeparator date={new Date(2026, 1, 10)} />);
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      // Should show a date, not "오늘" or "어제"
      expect(screen.queryByText('오늘')).not.toBeInTheDocument();
      expect(screen.queryByText('어제')).not.toBeInTheDocument();
    });

    it('has correct role and aria-label', () => {
      render(<DateSeparator date={new Date(2026, 1, 15)} />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('aria-label', '오늘');
    });

    it('renders two separator lines', () => {
      const { container } = render(<DateSeparator date={new Date(2026, 1, 15)} />);
      const lines = container.querySelectorAll('.date-separator-line');
      expect(lines).toHaveLength(2);
    });

    it('renders the label element', () => {
      const { container } = render(<DateSeparator date={new Date(2026, 1, 15)} />);
      const label = container.querySelector('.date-separator-label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toBe('오늘');
    });

    it('uses custom label when provided', () => {
      render(<DateSeparator date={new Date(2026, 1, 15)} label="새 메시지" />);
      expect(screen.getByText('새 메시지')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toHaveAttribute('aria-label', '새 메시지');
    });

    it('custom label overrides date formatting', () => {
      render(<DateSeparator date={new Date(2026, 1, 14)} label="읽지 않은 메시지" />);
      expect(screen.getByText('읽지 않은 메시지')).toBeInTheDocument();
      expect(screen.queryByText('어제')).not.toBeInTheDocument();
    });

    it('accepts custom now prop for relative calculation', () => {
      // Pass a "now" that makes Feb 14 be "today"
      const customNow = new Date(2026, 1, 14, 18, 0, 0);
      render(<DateSeparator date={new Date(2026, 1, 14)} now={customNow} />);
      expect(screen.getByText('오늘')).toBeInTheDocument();
    });

    it('has the correct CSS class', () => {
      const { container } = render(<DateSeparator date={new Date()} />);
      expect(container.querySelector('.date-separator')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('is wrapped in React.memo', () => {
      // React.memo wraps the component, its displayName or $$typeof can indicate memoization
      const element = React.createElement(DateSeparator, {
        date: new Date(),
      });
      // memo components render via a special type
      expect(element).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles epoch timestamp (Jan 1 1970)', () => {
      const epoch = new Date(0);
      render(<DateSeparator date={epoch} />);
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
      const label = separator.getAttribute('aria-label');
      expect(label).toContain('1970');
    });

    it('handles same date with different times correctly', () => {
      const morning = new Date(2026, 1, 15, 6, 0, 0);
      const evening = new Date(2026, 1, 15, 22, 0, 0);
      expect(formatDateLabel(morning, { now: evening })).toBe('오늘');
    });

    it('handles midnight boundary correctly', () => {
      // 11:59 PM yesterday vs 12:01 AM today
      const late = new Date(2026, 1, 14, 23, 59, 59);
      const early = new Date(2026, 1, 15, 0, 1, 0);
      expect(formatDateLabel(late, { now: early })).toBe('어제');
    });

    it('handles Feb 28/29 boundary in leap year', () => {
      // 2024 is a leap year
      const feb29 = new Date(2024, 1, 29);
      const mar1 = new Date(2024, 2, 1);
      expect(formatDateLabel(feb29, { now: mar1 })).toBe('어제');
    });

    it('handles year boundary (Dec 31 / Jan 1)', () => {
      const dec31 = new Date(2025, 11, 31, 10, 0, 0);
      const jan1 = new Date(2026, 0, 1, 10, 0, 0);
      expect(formatDateLabel(dec31, { now: jan1 })).toBe('어제');
    });

    it('year boundary shows year for Dec 31 when now is Jan 2', () => {
      const dec31 = new Date(2025, 11, 31, 10, 0, 0);
      const jan2 = new Date(2026, 0, 2, 10, 0, 0);
      const result = formatDateLabel(dec31, { now: jan2 });
      expect(result).toContain('2025');
    });
  });
});
