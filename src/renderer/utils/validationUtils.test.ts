import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  isInRange,
  isAlphanumeric,
  isNumeric,
  matchesPattern,
  validateAll,
} from './validationUtils';

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.name@domain.co.kr')).toBe(true);
      expect(isValidEmail('a+b@c.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });

    it('trims whitespace before validation', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('isValidUrl', () => {
    it('accepts valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org/path?q=1')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/a/b')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('  a  ')).toBe(true);
    });

    it('returns false for empty or whitespace-only strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty('\t\n')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('validates minimum length', () => {
      expect(hasMinLength('abc', 3)).toBe(true);
      expect(hasMinLength('abcd', 3)).toBe(true);
      expect(hasMinLength('ab', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
      expect(hasMinLength('', 0)).toBe(true);
    });
  });

  describe('hasMaxLength', () => {
    it('validates maximum length', () => {
      expect(hasMaxLength('abc', 3)).toBe(true);
      expect(hasMaxLength('ab', 3)).toBe(true);
      expect(hasMaxLength('abcd', 3)).toBe(false);
      expect(hasMaxLength('', 0)).toBe(true);
    });
  });

  describe('isInRange', () => {
    it('checks if number is in range (inclusive)', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });

    it('works with negative numbers', () => {
      expect(isInRange(-5, -10, 0)).toBe(true);
      expect(isInRange(-11, -10, 0)).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('accepts alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC')).toBe(true);
      expect(isAlphanumeric('123')).toBe(true);
    });

    it('rejects non-alphanumeric strings', () => {
      expect(isAlphanumeric('')).toBe(false);
      expect(isAlphanumeric('abc 123')).toBe(false);
      expect(isAlphanumeric('hello!')).toBe(false);
      expect(isAlphanumeric('한글')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('accepts numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
      expect(isNumeric('-5')).toBe(true);
      expect(isNumeric('3.14')).toBe(true);
      expect(isNumeric('1e10')).toBe(true);
    });

    it('rejects non-numeric strings', () => {
      expect(isNumeric('')).toBe(false);
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric('12a')).toBe(false);
      expect(isNumeric('   ')).toBe(false);
    });
  });

  describe('matchesPattern', () => {
    it('tests against a regex pattern', () => {
      expect(matchesPattern('abc123', /^[a-z]+\d+$/)).toBe(true);
      expect(matchesPattern('ABC', /^[a-z]+$/)).toBe(false);
      expect(matchesPattern('test', /test/)).toBe(true);
    });
  });

  describe('validateAll', () => {
    it('returns valid when all rules pass', () => {
      const result = validateAll('hello', [
        { validate: (v) => v.length > 0, message: 'Required' },
        { validate: (v) => v.length <= 10, message: 'Too long' },
      ]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('collects all error messages for failed rules', () => {
      const result = validateAll('', [
        { validate: (v) => v.length > 0, message: 'Required' },
        { validate: (v) => v.includes('@'), message: 'Must contain @' },
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Required', 'Must contain @']);
    });

    it('returns valid for empty rules', () => {
      const result = validateAll('anything', []);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('collects only failed rule messages', () => {
      const result = validateAll('test@', [
        { validate: (v) => v.length > 0, message: 'Required' },
        { validate: (v) => v.includes('@'), message: 'Must contain @' },
        { validate: (v) => v.length >= 10, message: 'Too short' },
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Too short']);
    });
  });
});
