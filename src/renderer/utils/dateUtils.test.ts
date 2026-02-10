import { formatDate, formatTime, formatDateTime, timeAgo, isToday, isSameDay, formatDuration } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats a timestamp to a date string', () => {
      const result = formatDate(1704067200000); // 2024-01-01 UTC
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatTime', () => {
    it('formats a timestamp to a time string', () => {
      const result = formatTime(1704067200000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateTime', () => {
    it('formats a timestamp to a date+time string', () => {
      const result = formatDateTime(1704067200000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('timeAgo', () => {
    const NOW = 1704067200000; // fixed reference point

    it('returns 방금 for times less than 60 seconds ago', () => {
      expect(timeAgo(NOW - 30000, NOW)).toBe('방금');
    });

    it('returns 방금 for 0 seconds ago', () => {
      expect(timeAgo(NOW, NOW)).toBe('방금');
    });

    it('returns 방금 for future timestamps', () => {
      expect(timeAgo(NOW + 10000, NOW)).toBe('방금');
    });

    it('returns minutes ago', () => {
      expect(timeAgo(NOW - 5 * 60 * 1000, NOW)).toBe('5분 전');
    });

    it('returns hours ago', () => {
      expect(timeAgo(NOW - 3 * 60 * 60 * 1000, NOW)).toBe('3시간 전');
    });

    it('returns 어제 for 1 day ago', () => {
      expect(timeAgo(NOW - 24 * 60 * 60 * 1000, NOW)).toBe('어제');
    });

    it('returns days ago for 2-6 days', () => {
      expect(timeAgo(NOW - 3 * 24 * 60 * 60 * 1000, NOW)).toBe('3일 전');
    });

    it('returns weeks ago', () => {
      expect(timeAgo(NOW - 14 * 24 * 60 * 60 * 1000, NOW)).toBe('2주 전');
    });

    it('returns months ago', () => {
      expect(timeAgo(NOW - 60 * 24 * 60 * 60 * 1000, NOW)).toBe('2개월 전');
    });

    it('returns years ago', () => {
      expect(timeAgo(NOW - 400 * 24 * 60 * 60 * 1000, NOW)).toBe('1년 전');
    });

    it('returns 1분 전 at exactly 60 seconds', () => {
      expect(timeAgo(NOW - 60 * 1000, NOW)).toBe('1분 전');
    });
  });

  describe('isToday', () => {
    it('returns true for current timestamp', () => {
      expect(isToday(Date.now())).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('returns true for timestamps on the same day', () => {
      const t1 = new Date(2024, 0, 15, 10, 0, 0).getTime();
      const t2 = new Date(2024, 0, 15, 22, 30, 0).getTime();
      expect(isSameDay(t1, t2)).toBe(true);
    });

    it('returns false for timestamps on different days', () => {
      const t1 = new Date(2024, 0, 15).getTime();
      const t2 = new Date(2024, 0, 16).getTime();
      expect(isSameDay(t1, t2)).toBe(false);
    });

    it('returns false for same day different month', () => {
      const t1 = new Date(2024, 0, 15).getTime();
      const t2 = new Date(2024, 1, 15).getTime();
      expect(isSameDay(t1, t2)).toBe(false);
    });

    it('returns true for same timestamp', () => {
      const t = Date.now();
      expect(isSameDay(t, t)).toBe(true);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration(45)).toBe('00:45');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(125)).toBe('02:05');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatDuration(3661)).toBe('01:01:01');
    });

    it('formats zero', () => {
      expect(formatDuration(0)).toBe('00:00');
    });

    it('pads single digits', () => {
      expect(formatDuration(61)).toBe('01:01');
    });

    it('handles large durations', () => {
      expect(formatDuration(36000)).toBe('10:00:00');
    });

    it('truncates fractional seconds', () => {
      expect(formatDuration(90.7)).toBe('01:30');
    });
  });
});
