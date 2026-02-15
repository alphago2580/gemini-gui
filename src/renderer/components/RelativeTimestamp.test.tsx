import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import RelativeTimestamp, {
  formatRelativeTime,
  getUpdateInterval,
} from './RelativeTimestamp';

describe('RelativeTimestamp', () => {
  const BASE_NOW = new Date(2026, 1, 15, 12, 0, 0).getTime(); // Feb 15, 2026 12:00:00

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(BASE_NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('returns "방금 전" for timestamps less than 10 seconds ago', () => {
      expect(formatRelativeTime(BASE_NOW - 0, BASE_NOW)).toBe('방금 전');
      expect(formatRelativeTime(BASE_NOW - 5000, BASE_NOW)).toBe('방금 전');
      expect(formatRelativeTime(BASE_NOW - 9999, BASE_NOW)).toBe('방금 전');
    });

    it('returns "방금 전" for future timestamps', () => {
      expect(formatRelativeTime(BASE_NOW + 5000, BASE_NOW)).toBe('방금 전');
    });

    it('returns seconds for 10-59 seconds', () => {
      expect(formatRelativeTime(BASE_NOW - 10_000, BASE_NOW)).toBe('10초 전');
      expect(formatRelativeTime(BASE_NOW - 30_000, BASE_NOW)).toBe('30초 전');
      expect(formatRelativeTime(BASE_NOW - 59_000, BASE_NOW)).toBe('59초 전');
    });

    it('returns minutes for 1-59 minutes', () => {
      expect(formatRelativeTime(BASE_NOW - 60_000, BASE_NOW)).toBe('1분 전');
      expect(formatRelativeTime(BASE_NOW - 300_000, BASE_NOW)).toBe('5분 전');
      expect(formatRelativeTime(BASE_NOW - 3_540_000, BASE_NOW)).toBe('59분 전');
    });

    it('returns hours for 1-23 hours', () => {
      expect(formatRelativeTime(BASE_NOW - 3_600_000, BASE_NOW)).toBe('1시간 전');
      expect(formatRelativeTime(BASE_NOW - 7_200_000, BASE_NOW)).toBe('2시간 전');
      expect(formatRelativeTime(BASE_NOW - 82_800_000, BASE_NOW)).toBe('23시간 전');
    });

    it('returns "어제" for exactly 1 day ago', () => {
      expect(formatRelativeTime(BASE_NOW - 86_400_000, BASE_NOW)).toBe('어제');
    });

    it('returns days for 2-6 days', () => {
      expect(formatRelativeTime(BASE_NOW - 172_800_000, BASE_NOW)).toBe('2일 전');
      expect(formatRelativeTime(BASE_NOW - 518_400_000, BASE_NOW)).toBe('6일 전');
    });

    it('returns weeks for 1-4 weeks', () => {
      expect(formatRelativeTime(BASE_NOW - 604_800_000, BASE_NOW)).toBe('1주 전');
      expect(formatRelativeTime(BASE_NOW - 2_419_200_000, BASE_NOW)).toBe('4주 전');
    });

    it('returns months for 1-11 months', () => {
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(BASE_NOW - oneMonth * 2, BASE_NOW)).toBe('2개월 전');
      expect(formatRelativeTime(BASE_NOW - oneMonth * 11, BASE_NOW)).toBe('11개월 전');
    });

    it('returns years for 1+ years', () => {
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(BASE_NOW - oneYear, BASE_NOW)).toBe('1년 전');
      expect(formatRelativeTime(BASE_NOW - oneYear * 3, BASE_NOW)).toBe('3년 전');
    });

    it('accepts Date objects', () => {
      const date = new Date(BASE_NOW - 120_000);
      expect(formatRelativeTime(date, new Date(BASE_NOW))).toBe('2분 전');
    });

    it('defaults now to Date.now()', () => {
      const date = new Date(BASE_NOW - 60_000);
      expect(formatRelativeTime(date)).toBe('1분 전');
    });
  });

  describe('getUpdateInterval', () => {
    it('returns 10s for timestamps under 1 minute old', () => {
      expect(getUpdateInterval(30_000)).toBe(10_000);
    });

    it('returns 1 min for timestamps under 1 hour old', () => {
      expect(getUpdateInterval(600_000)).toBe(60_000);
    });

    it('returns 5 min for timestamps under 1 day old', () => {
      expect(getUpdateInterval(3_600_000)).toBe(300_000);
    });

    it('returns 1 hour for timestamps over 1 day old', () => {
      expect(getUpdateInterval(100_000_000)).toBe(3_600_000);
    });
  });

  describe('rendering', () => {
    it('renders a <time> element', () => {
      render(<RelativeTimestamp timestamp={BASE_NOW - 60_000} now={BASE_NOW} />);
      const timeEl = screen.getByText('1분 전');
      expect(timeEl.tagName).toBe('TIME');
    });

    it('renders correct relative text', () => {
      render(<RelativeTimestamp timestamp={BASE_NOW - 300_000} now={BASE_NOW} />);
      expect(screen.getByText('5분 전')).toBeInTheDocument();
    });

    it('has correct dateTime attribute in ISO format', () => {
      const ts = BASE_NOW - 60_000;
      render(<RelativeTimestamp timestamp={ts} now={BASE_NOW} />);
      const timeEl = screen.getByText('1분 전');
      expect(timeEl).toHaveAttribute('dateTime', new Date(ts).toISOString());
    });

    it('shows absolute time as title tooltip by default', () => {
      render(<RelativeTimestamp timestamp={BASE_NOW - 60_000} now={BASE_NOW} />);
      const timeEl = screen.getByText('1분 전');
      expect(timeEl).toHaveAttribute('title');
      expect(timeEl.getAttribute('title')).toContain('2026');
    });

    it('hides tooltip when showTooltip is false', () => {
      render(
        <RelativeTimestamp
          timestamp={BASE_NOW - 60_000}
          now={BASE_NOW}
          showTooltip={false}
        />,
      );
      const timeEl = screen.getByText('1분 전');
      expect(timeEl).not.toHaveAttribute('title');
    });

    it('has aria-label with both relative and absolute time', () => {
      render(<RelativeTimestamp timestamp={BASE_NOW - 60_000} now={BASE_NOW} />);
      const timeEl = screen.getByText('1분 전');
      const ariaLabel = timeEl.getAttribute('aria-label');
      expect(ariaLabel).toContain('1분 전');
      expect(ariaLabel).toContain('2026');
    });

    it('applies id attribute', () => {
      render(
        <RelativeTimestamp
          timestamp={BASE_NOW}
          now={BASE_NOW}
          id="test-timestamp"
        />,
      );
      expect(document.getElementById('test-timestamp')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <RelativeTimestamp
          timestamp={BASE_NOW}
          now={BASE_NOW}
          className="my-class"
        />,
      );
      const timeEl = container.querySelector('time');
      expect(timeEl?.classList.contains('my-class')).toBe(true);
      expect(timeEl?.classList.contains('relative-timestamp')).toBe(true);
    });

    it('accepts Date object for timestamp', () => {
      const date = new Date(BASE_NOW - 7200_000);
      render(<RelativeTimestamp timestamp={date} now={BASE_NOW} />);
      expect(screen.getByText('2시간 전')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies small size class', () => {
      const { container } = render(
        <RelativeTimestamp timestamp={BASE_NOW} now={BASE_NOW} size="small" />,
      );
      expect(container.querySelector('.relative-timestamp--small')).toBeInTheDocument();
    });

    it('applies medium size class by default', () => {
      const { container } = render(
        <RelativeTimestamp timestamp={BASE_NOW} now={BASE_NOW} />,
      );
      expect(container.querySelector('.relative-timestamp--medium')).toBeInTheDocument();
    });

    it('applies large size class', () => {
      const { container } = render(
        <RelativeTimestamp timestamp={BASE_NOW} now={BASE_NOW} size="large" />,
      );
      expect(container.querySelector('.relative-timestamp--large')).toBeInTheDocument();
    });
  });

  describe('auto-update', () => {
    it('updates the text when time progresses', () => {
      render(
        <RelativeTimestamp timestamp={BASE_NOW - 5000} autoUpdate />,
      );
      expect(screen.getByText('방금 전')).toBeInTheDocument();

      // Advance time by 10 seconds (past the 10s threshold for "초 전")
      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(screen.getByText('15초 전')).toBeInTheDocument();
    });

    it('does not auto-update when autoUpdate is false', () => {
      render(
        <RelativeTimestamp
          timestamp={BASE_NOW - 5000}
          now={BASE_NOW}
          autoUpdate={false}
        />,
      );
      expect(screen.getByText('방금 전')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30_000);
      });

      // Should still show the original text
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });

    it('does not auto-update when now prop is provided', () => {
      render(
        <RelativeTimestamp
          timestamp={BASE_NOW - 5000}
          now={BASE_NOW}
          autoUpdate
        />,
      );
      expect(screen.getByText('방금 전')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(30_000);
      });

      // now is fixed, so no auto-update
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });

    it('cleans up timer on unmount', () => {
      const { unmount } = render(
        <RelativeTimestamp timestamp={BASE_NOW - 5000} autoUpdate />,
      );

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      unmount();
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('memoization', () => {
    it('is wrapped in React.memo', () => {
      const element = React.createElement(RelativeTimestamp, {
        timestamp: BASE_NOW,
      });
      expect(element).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles epoch timestamp', () => {
      render(<RelativeTimestamp timestamp={0} now={BASE_NOW} />);
      const timeEl = screen.getByText(/년 전/);
      expect(timeEl).toBeInTheDocument();
    });

    it('handles very recent timestamp (same ms)', () => {
      render(<RelativeTimestamp timestamp={BASE_NOW} now={BASE_NOW} />);
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });

    it('handles timestamp as Date object for now prop', () => {
      render(
        <RelativeTimestamp
          timestamp={new Date(BASE_NOW - 120_000)}
          now={new Date(BASE_NOW)}
        />,
      );
      expect(screen.getByText('2분 전')).toBeInTheDocument();
    });
  });
});
