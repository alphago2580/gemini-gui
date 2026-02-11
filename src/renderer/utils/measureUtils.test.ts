import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  convertTemperature,
  convertLength,
  convertWeight,
  distance2D,
  distance3D,
  degreesToRadians,
  radiansToDegrees,
  formatDuration,
  percentage,
} from './measureUtils';

describe('measureUtils', () => {
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

    it('respects decimal precision', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });

    it('handles negative bytes', () => {
      expect(formatBytes(-1024)).toBe('-1 KB');
    });

    it('formats terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });
  });

  describe('convertTemperature', () => {
    it('same unit returns same value', () => {
      expect(convertTemperature(100, 'celsius', 'celsius')).toBe(100);
    });

    it('converts celsius to fahrenheit', () => {
      expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
      expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
    });

    it('converts fahrenheit to celsius', () => {
      expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
      expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBeCloseTo(100);
    });

    it('converts celsius to kelvin', () => {
      expect(convertTemperature(0, 'celsius', 'kelvin')).toBe(273.15);
    });

    it('converts kelvin to celsius', () => {
      expect(convertTemperature(273.15, 'kelvin', 'celsius')).toBe(0);
    });

    it('converts fahrenheit to kelvin', () => {
      expect(convertTemperature(32, 'fahrenheit', 'kelvin')).toBeCloseTo(273.15);
    });

    it('converts kelvin to fahrenheit', () => {
      expect(convertTemperature(273.15, 'kelvin', 'fahrenheit')).toBeCloseTo(32);
    });
  });

  describe('convertLength', () => {
    it('same unit returns same value', () => {
      expect(convertLength(5, 'm', 'm')).toBe(5);
    });

    it('converts meters to kilometers', () => {
      expect(convertLength(1000, 'm', 'km')).toBe(1);
    });

    it('converts km to miles', () => {
      expect(convertLength(1.609344, 'km', 'mi')).toBeCloseTo(1);
    });

    it('converts inches to centimeters', () => {
      expect(convertLength(1, 'in', 'cm')).toBeCloseTo(2.54);
    });

    it('converts feet to meters', () => {
      expect(convertLength(1, 'ft', 'm')).toBeCloseTo(0.3048);
    });

    it('converts yards to feet', () => {
      expect(convertLength(1, 'yd', 'ft')).toBeCloseTo(3);
    });

    it('converts mm to cm', () => {
      expect(convertLength(10, 'mm', 'cm')).toBeCloseTo(1);
    });
  });

  describe('convertWeight', () => {
    it('same unit returns same value', () => {
      expect(convertWeight(5, 'kg', 'kg')).toBe(5);
    });

    it('converts kg to grams', () => {
      expect(convertWeight(1, 'kg', 'g')).toBe(1000);
    });

    it('converts kg to pounds', () => {
      expect(convertWeight(1, 'kg', 'lb')).toBeCloseTo(2.205, 2);
    });

    it('converts pounds to kg', () => {
      expect(convertWeight(1, 'lb', 'kg')).toBeCloseTo(0.4536, 3);
    });

    it('converts ounces to grams', () => {
      expect(convertWeight(1, 'oz', 'g')).toBeCloseTo(28.3495);
    });

    it('converts grams to mg', () => {
      expect(convertWeight(1, 'g', 'mg')).toBe(1000);
    });

    it('converts tons to kg', () => {
      expect(convertWeight(1, 'ton', 'kg')).toBe(1000);
    });
  });

  describe('distance2D', () => {
    it('calculates zero distance', () => {
      expect(distance2D(0, 0, 0, 0)).toBe(0);
    });

    it('calculates horizontal distance', () => {
      expect(distance2D(0, 0, 3, 0)).toBe(3);
    });

    it('calculates vertical distance', () => {
      expect(distance2D(0, 0, 0, 4)).toBe(4);
    });

    it('calculates diagonal distance (3-4-5 triangle)', () => {
      expect(distance2D(0, 0, 3, 4)).toBe(5);
    });

    it('handles negative coordinates', () => {
      expect(distance2D(-1, -1, 2, 3)).toBe(5);
    });
  });

  describe('distance3D', () => {
    it('calculates zero distance', () => {
      expect(distance3D(0, 0, 0, 0, 0, 0)).toBe(0);
    });

    it('calculates distance along single axis', () => {
      expect(distance3D(0, 0, 0, 5, 0, 0)).toBe(5);
    });

    it('calculates 3D diagonal distance', () => {
      expect(distance3D(0, 0, 0, 1, 2, 2)).toBe(3);
    });
  });

  describe('degreesToRadians', () => {
    it('converts 0 degrees', () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it('converts 180 degrees', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    });

    it('converts 360 degrees', () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });

    it('converts 90 degrees', () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
    });
  });

  describe('radiansToDegrees', () => {
    it('converts 0 radians', () => {
      expect(radiansToDegrees(0)).toBe(0);
    });

    it('converts PI radians', () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
    });

    it('round-trips with degreesToRadians', () => {
      expect(radiansToDegrees(degreesToRadians(45))).toBeCloseTo(45);
    });
  });

  describe('formatDuration', () => {
    it('formats milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('formats seconds', () => {
      expect(formatDuration(5000)).toBe('5.0s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(90000)).toBe('1m 30s');
    });

    it('formats exact minutes', () => {
      expect(formatDuration(120000)).toBe('2m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(5400000)).toBe('1h 30m');
    });

    it('formats exact hours', () => {
      expect(formatDuration(3600000)).toBe('1h');
    });

    it('handles negative duration', () => {
      expect(formatDuration(-5000)).toBe('-5.0s');
    });

    it('handles zero', () => {
      expect(formatDuration(0)).toBe('0ms');
    });
  });

  describe('percentage', () => {
    it('calculates simple percentage', () => {
      expect(percentage(50, 100)).toBe(50);
    });

    it('handles zero total', () => {
      expect(percentage(10, 0)).toBe(0);
    });

    it('respects decimal places', () => {
      expect(percentage(1, 3, 2)).toBeCloseTo(33.33);
    });

    it('calculates 100%', () => {
      expect(percentage(100, 100)).toBe(100);
    });

    it('calculates over 100%', () => {
      expect(percentage(150, 100)).toBe(150);
    });

    it('handles zero value', () => {
      expect(percentage(0, 100)).toBe(0);
    });
  });
});
