import { formatRelativeTime, getRelativeTimeParts } from './formatRelativeTime';

describe('formatRelativeTime', () => {
  const NOW = 1704067200000; // 2024-01-01T00:00:00.000Z

  const sec = 1000;
  const min = 60 * sec;
  const hour = 60 * min;
  const day = 24 * hour;
  const week = 7 * day;

  describe('past timestamps', () => {
    it('returns "지금" for less than 10 seconds ago', () => {
      const result = formatRelativeTime(NOW - 5 * sec, { now: NOW });
      expect(result).toBe('지금');
    });

    it('formats seconds ago', () => {
      const result = formatRelativeTime(NOW - 30 * sec, { now: NOW });
      expect(result).toBe('30초 전');
    });

    it('formats minutes ago', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW });
      expect(result).toBe('5분 전');
    });

    it('formats hours ago', () => {
      const result = formatRelativeTime(NOW - 3 * hour, { now: NOW });
      expect(result).toBe('3시간 전');
    });

    it('formats 1 day ago as "어제" with numeric auto', () => {
      const result = formatRelativeTime(NOW - day, { now: NOW, numeric: 'auto' });
      expect(result).toBe('어제');
    });

    it('formats days ago', () => {
      const result = formatRelativeTime(NOW - 3 * day, { now: NOW });
      expect(result).toBe('3일 전');
    });

    it('formats weeks ago', () => {
      const result = formatRelativeTime(NOW - 2 * week, { now: NOW });
      expect(result).toBe('2주 전');
    });

    it('formats 1 week ago as "지난주" with numeric auto', () => {
      const result = formatRelativeTime(NOW - week, { now: NOW, numeric: 'auto' });
      expect(result).toBe('지난주');
    });

    it('formats months ago', () => {
      const result = formatRelativeTime(NOW - 60 * day, { now: NOW });
      expect(result).toBe('2개월 전');
    });

    it('formats 1 month ago as "지난달" with numeric auto', () => {
      const result = formatRelativeTime(NOW - 30 * day, { now: NOW, numeric: 'auto' });
      expect(result).toBe('지난달');
    });

    it('formats years ago', () => {
      const result = formatRelativeTime(NOW - 400 * day, { now: NOW });
      expect(result).toBe('작년');
    });

    it('formats multiple years ago', () => {
      const result = formatRelativeTime(NOW - 800 * day, { now: NOW });
      expect(result).toBe('2년 전');
    });
  });

  describe('future timestamps', () => {
    it('returns "지금" for less than 10 seconds from now', () => {
      const result = formatRelativeTime(NOW + 5 * sec, { now: NOW });
      expect(result).toBe('지금');
    });

    it('formats seconds from now', () => {
      const result = formatRelativeTime(NOW + 30 * sec, { now: NOW });
      expect(result).toBe('30초 후');
    });

    it('formats minutes from now', () => {
      const result = formatRelativeTime(NOW + 10 * min, { now: NOW });
      expect(result).toBe('10분 후');
    });

    it('formats hours from now', () => {
      const result = formatRelativeTime(NOW + 2 * hour, { now: NOW });
      expect(result).toBe('2시간 후');
    });

    it('formats 1 day from now as "내일" with numeric auto', () => {
      const result = formatRelativeTime(NOW + day, { now: NOW, numeric: 'auto' });
      expect(result).toBe('내일');
    });

    it('formats days from now', () => {
      const result = formatRelativeTime(NOW + 5 * day, { now: NOW });
      expect(result).toBe('5일 후');
    });

    it('formats 1 week from now as "다음 주" with numeric auto', () => {
      const result = formatRelativeTime(NOW + week, { now: NOW, numeric: 'auto' });
      expect(result).toBe('다음 주');
    });

    it('formats weeks from now', () => {
      const result = formatRelativeTime(NOW + 3 * week, { now: NOW });
      expect(result).toBe('3주 후');
    });

    it('formats 1 month from now as "다음 달" with numeric auto', () => {
      const result = formatRelativeTime(NOW + 30 * day, { now: NOW, numeric: 'auto' });
      expect(result).toBe('다음 달');
    });

    it('formats months from now', () => {
      const result = formatRelativeTime(NOW + 90 * day, { now: NOW });
      expect(result).toBe('3개월 후');
    });

    it('formats 1 year from now as "내년" with numeric auto', () => {
      const result = formatRelativeTime(NOW + 365 * day, { now: NOW, numeric: 'auto' });
      expect(result).toBe('내년');
    });

    it('formats multiple years from now', () => {
      const result = formatRelativeTime(NOW + 730 * day, { now: NOW });
      expect(result).toBe('2년 후');
    });
  });

  describe('exact timestamp (now)', () => {
    it('formats current time as "지금"', () => {
      const result = formatRelativeTime(NOW, { now: NOW });
      expect(result).toBe('지금');
    });
  });

  describe('options', () => {
    it('defaults to ko-KR locale', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW });
      expect(result).toBe('5분 전');
    });

    it('uses provided now value', () => {
      const customNow = NOW + 10 * min;
      const result = formatRelativeTime(NOW, { now: customNow });
      expect(result).toBe('10분 전');
    });

    it('accepts numeric: always option', () => {
      const result = formatRelativeTime(NOW - day, { now: NOW, numeric: 'always' });
      expect(result).toBe('1일 전');
    });

    it('numeric: always forces numeric for week', () => {
      const result = formatRelativeTime(NOW - week, { now: NOW, numeric: 'always' });
      expect(result).toBe('1주 전');
    });

    it('numeric: always forces numeric for month', () => {
      const result = formatRelativeTime(NOW - 30 * day, { now: NOW, numeric: 'always' });
      expect(result).toBe('1개월 전');
    });

    it('numeric: always forces numeric for year', () => {
      const result = formatRelativeTime(NOW - 365 * day, { now: NOW, numeric: 'always' });
      expect(result).toBe('1년 전');
    });

    it('accepts style: short option', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW, style: 'short' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts style: narrow option', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW, style: 'narrow' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('defaults to Date.now() when now is not specified', () => {
      const result = formatRelativeTime(Date.now() - 5 * sec);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('supports en-US locale', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW, locale: 'en-US' });
      expect(result).toBe('5 minutes ago');
    });

    it('supports ja-JP locale', () => {
      const result = formatRelativeTime(NOW - 5 * min, { now: NOW, locale: 'ja-JP' });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('boundary values', () => {
    it('formats 59 seconds as seconds', () => {
      const result = formatRelativeTime(NOW - 59 * sec, { now: NOW });
      expect(result).toBe('59초 전');
    });

    it('formats 60 seconds as 1 minute', () => {
      const result = formatRelativeTime(NOW - 60 * sec, { now: NOW });
      expect(result).toMatch(/1분 전/);
    });

    it('formats 59 minutes as minutes', () => {
      const result = formatRelativeTime(NOW - 59 * min, { now: NOW });
      expect(result).toBe('59분 전');
    });

    it('formats 60 minutes as 1 hour', () => {
      const result = formatRelativeTime(NOW - 60 * min, { now: NOW });
      expect(result).toMatch(/1시간 전/);
    });

    it('formats 23 hours as hours', () => {
      const result = formatRelativeTime(NOW - 23 * hour, { now: NOW });
      expect(result).toBe('23시간 전');
    });

    it('formats 24 hours as "어제" with numeric auto', () => {
      const result = formatRelativeTime(NOW - 24 * hour, { now: NOW });
      expect(result).toBe('어제');
    });

    it('formats 6 days as days', () => {
      const result = formatRelativeTime(NOW - 6 * day, { now: NOW });
      expect(result).toBe('6일 전');
    });

    it('formats 7 days as "지난주" with numeric auto', () => {
      const result = formatRelativeTime(NOW - 7 * day, { now: NOW });
      expect(result).toBe('지난주');
    });

    it('formats 7 days as "1주 전" with numeric always', () => {
      const result = formatRelativeTime(NOW - 7 * day, { now: NOW, numeric: 'always' });
      expect(result).toBe('1주 전');
    });

    it('formats 29 days as 4 weeks', () => {
      const result = formatRelativeTime(NOW - 29 * day, { now: NOW });
      expect(result).toBe('4주 전');
    });

    it('formats 30 days as "지난달" with numeric auto', () => {
      const result = formatRelativeTime(NOW - 30 * day, { now: NOW });
      expect(result).toBe('지난달');
    });

    it('formats 364 days as 12 months', () => {
      const result = formatRelativeTime(NOW - 364 * day, { now: NOW });
      expect(result).toBe('12개월 전');
    });

    it('formats 365 days as "작년" with numeric auto', () => {
      const result = formatRelativeTime(NOW - 365 * day, { now: NOW });
      expect(result).toBe('작년');
    });
  });
});

describe('getRelativeTimeParts', () => {
  it('returns 0 seconds for very small differences', () => {
    const result = getRelativeTimeParts(5);
    expect(result).toEqual({ value: 0, unit: 'second' });
  });

  it('returns 0 seconds for negative small differences', () => {
    const result = getRelativeTimeParts(-3);
    expect(result).toEqual({ value: 0, unit: 'second' });
  });

  it('returns negative seconds for past (negative diff)', () => {
    const result = getRelativeTimeParts(-30);
    expect(result).toEqual({ value: -30, unit: 'second' });
  });

  it('returns positive seconds for future (positive diff)', () => {
    const result = getRelativeTimeParts(30);
    expect(result).toEqual({ value: 30, unit: 'second' });
  });

  it('returns negative minutes for past', () => {
    const result = getRelativeTimeParts(-300);
    expect(result).toEqual({ value: -5, unit: 'minute' });
  });

  it('returns positive minutes for future', () => {
    const result = getRelativeTimeParts(300);
    expect(result).toEqual({ value: 5, unit: 'minute' });
  });

  it('returns negative hours for past', () => {
    const result = getRelativeTimeParts(-7200);
    expect(result).toEqual({ value: -2, unit: 'hour' });
  });

  it('returns negative days for past', () => {
    const result = getRelativeTimeParts(-259200);
    expect(result).toEqual({ value: -3, unit: 'day' });
  });

  it('returns negative weeks for past', () => {
    const result = getRelativeTimeParts(-1209600);
    expect(result).toEqual({ value: -2, unit: 'week' });
  });

  it('returns negative months for past', () => {
    const result = getRelativeTimeParts(-5184000);
    expect(result).toEqual({ value: -2, unit: 'month' });
  });

  it('returns negative years for past', () => {
    const result = getRelativeTimeParts(-63072000);
    expect(result).toEqual({ value: -2, unit: 'year' });
  });

  it('returns positive years for future', () => {
    const result = getRelativeTimeParts(63072000);
    expect(result).toEqual({ value: 2, unit: 'year' });
  });

  it('floors the value rather than rounding', () => {
    // 89 seconds = 1.48 minutes, should floor to 1
    const result = getRelativeTimeParts(-89);
    expect(result).toEqual({ value: -1, unit: 'minute' });
  });

  it('handles exactly 0 seconds', () => {
    const result = getRelativeTimeParts(0);
    expect(result).toEqual({ value: 0, unit: 'second' });
  });
});
