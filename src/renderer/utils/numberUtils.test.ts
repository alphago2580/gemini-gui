import { clamp, formatBytes, formatPercent, roundTo, lerp, mapRange, formatCompact } from './numberUtils';

describe('numberUtils', () => {
  describe('clamp', () => {
    it('clamps below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('clamps above max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('handles min equals max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });
  });

  describe('formatBytes', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('respects decimals parameter', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
    });
  });

  describe('formatPercent', () => {
    it('formats 100%', () => {
      expect(formatPercent(1)).toBe('100%');
    });

    it('formats 50%', () => {
      expect(formatPercent(0.5)).toBe('50%');
    });

    it('formats with decimals', () => {
      expect(formatPercent(0.3333, 1)).toBe('33.3%');
    });

    it('formats 0%', () => {
      expect(formatPercent(0)).toBe('0%');
    });
  });

  describe('roundTo', () => {
    it('rounds to 2 decimals', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
    });

    it('rounds to 0 decimals', () => {
      expect(roundTo(3.7, 0)).toBe(4);
    });

    it('rounds to 3 decimals', () => {
      expect(roundTo(1.2345, 3)).toBe(1.235);
    });
  });

  describe('lerp', () => {
    it('returns start at t=0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    it('returns end at t=1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('returns midpoint at t=0.5', () => {
      expect(lerp(10, 20, 0.5)).toBe(15);
    });

    it('extrapolates beyond range', () => {
      expect(lerp(0, 100, 1.5)).toBe(150);
    });
  });

  describe('mapRange', () => {
    it('maps value from one range to another', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    });

    it('maps to different range', () => {
      expect(mapRange(0.5, 0, 1, -10, 10)).toBe(0);
    });

    it('maps at boundaries', () => {
      expect(mapRange(0, 0, 10, 100, 200)).toBe(100);
      expect(mapRange(10, 0, 10, 100, 200)).toBe(200);
    });
  });

  describe('formatCompact', () => {
    it('formats small numbers as-is', () => {
      expect(formatCompact(42)).toBe('42');
    });

    it('formats thousands', () => {
      expect(formatCompact(1000)).toBe('1K');
    });

    it('formats with decimal', () => {
      expect(formatCompact(1500)).toBe('1.5K');
    });

    it('formats millions', () => {
      expect(formatCompact(1000000)).toBe('1M');
    });

    it('formats billions', () => {
      expect(formatCompact(2500000000)).toBe('2.5B');
    });

    it('handles negative numbers', () => {
      expect(formatCompact(-1500)).toBe('-1.5K');
    });

    it('handles zero', () => {
      expect(formatCompact(0)).toBe('0');
    });
  });

  describe('clamp edge cases', () => {
    it('clamps negative value below negative min', () => {
      expect(clamp(-100, -50, -10)).toBe(-50);
    });

    it('returns exact min when value equals min', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('returns exact max when value equals max', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('formatBytes edge cases', () => {
    it('formats terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('formats fractional megabytes', () => {
      expect(formatBytes(2621440, 2)).toBe('2.5 MB');
    });
  });

  describe('roundTo edge cases', () => {
    it('rounds to 1 decimal', () => {
      expect(roundTo(2.55, 1)).toBe(2.6);
    });

    it('rounds negative number', () => {
      expect(roundTo(-3.456, 2)).toBe(-3.46);
    });
  });

  describe('lerp edge cases', () => {
    it('handles negative t extrapolation', () => {
      expect(lerp(0, 100, -0.5)).toBe(-50);
    });
  });
});
