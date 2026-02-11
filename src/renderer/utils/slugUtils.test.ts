import { describe, it, expect } from 'vitest';
import {
  slugify,
  unslugify,
  uniqueSlug,
  truncateSlug,
  isValidSlug,
  filePathToSlug,
  camelToSlug,
  slugToCamel,
} from './slugUtils';

describe('slugUtils', () => {
  describe('slugify', () => {
    it('converts basic string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('handles multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(slugify('Hello, World! How are you?')).toBe('hello-world-how-are-you');
    });

    it('handles diacritical marks', () => {
      expect(slugify('café résumé')).toBe('cafe-resume');
    });

    it('trims leading and trailing separators', () => {
      expect(slugify('  hello world  ')).toBe('hello-world');
    });

    it('handles custom separator', () => {
      expect(slugify('Hello World', '_')).toBe('hello_world');
    });

    it('returns empty string for empty input', () => {
      expect(slugify('')).toBe('');
    });

    it('handles string with only special characters', () => {
      expect(slugify('!@#$%')).toBe('');
    });

    it('handles hyphens in input', () => {
      expect(slugify('well-known-fact')).toBe('well-known-fact');
    });

    it('converts uppercase to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world');
    });

    it('handles numbers', () => {
      expect(slugify('version 2.0 release')).toBe('version-20-release');
    });

    it('handles mixed content', () => {
      expect(slugify('React 19 — New Features!')).toBe('react-19-new-features');
    });
  });

  describe('unslugify', () => {
    it('converts slug to title case', () => {
      expect(unslugify('hello-world')).toBe('Hello World');
    });

    it('handles single word', () => {
      expect(unslugify('hello')).toBe('Hello');
    });

    it('handles custom separator', () => {
      expect(unslugify('hello_world', '_')).toBe('Hello World');
    });

    it('handles multiple words', () => {
      expect(unslugify('this-is-a-test')).toBe('This Is A Test');
    });

    it('handles empty string', () => {
      expect(unslugify('')).toBe('');
    });
  });

  describe('uniqueSlug', () => {
    it('returns base slug when no conflicts', () => {
      expect(uniqueSlug('Hello World', [])).toBe('hello-world');
    });

    it('appends -1 when base slug exists', () => {
      expect(uniqueSlug('Hello World', ['hello-world'])).toBe('hello-world-1');
    });

    it('increments counter for multiple conflicts', () => {
      expect(uniqueSlug('Test', ['test', 'test-1', 'test-2'])).toBe('test-3');
    });

    it('handles custom separator', () => {
      expect(uniqueSlug('Hello World', ['hello_world'], '_')).toBe('hello_world_1');
    });

    it('handles empty existing array', () => {
      expect(uniqueSlug('Test', [])).toBe('test');
    });
  });

  describe('truncateSlug', () => {
    it('returns slug as-is when shorter than maxLength', () => {
      expect(truncateSlug('hello', 10)).toBe('hello');
    });

    it('truncates at separator boundary', () => {
      // 'hello-world-test-case' truncated to 16 = 'hello-world-test'
      // next char is '-' (separator), so keeps full word
      expect(truncateSlug('hello world test case', 16)).toBe('hello-world-test');
    });

    it('cuts back to separator when mid-word', () => {
      // 'hello-world-test' truncated to 13 = 'hello-world-t'
      // next char is 'e' (mid-word), so cuts back to 'hello-world'
      expect(truncateSlug('hello world test', 13)).toBe('hello-world');
    });

    it('truncates without separator boundary if needed', () => {
      expect(truncateSlug('abcdefghij', 5)).toBe('abcde');
    });

    it('returns full slug when exactly maxLength', () => {
      expect(truncateSlug('hello', 5)).toBe('hello');
    });

    it('handles long strings', () => {
      const result = truncateSlug('this is a very long title that needs truncation', 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result.endsWith('-')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('returns true for valid slug', () => {
      expect(isValidSlug('hello-world')).toBe(true);
    });

    it('returns true for single word slug', () => {
      expect(isValidSlug('hello')).toBe(true);
    });

    it('returns false for uppercase', () => {
      expect(isValidSlug('Hello-World')).toBe(false);
    });

    it('returns false for spaces', () => {
      expect(isValidSlug('hello world')).toBe(false);
    });

    it('returns false for special characters', () => {
      expect(isValidSlug('hello@world')).toBe(false);
    });

    it('returns false for leading separator', () => {
      expect(isValidSlug('-hello')).toBe(false);
    });

    it('returns false for trailing separator', () => {
      expect(isValidSlug('hello-')).toBe(false);
    });

    it('returns false for double separator', () => {
      expect(isValidSlug('hello--world')).toBe(false);
    });

    it('returns true for numbers', () => {
      expect(isValidSlug('version-2')).toBe(true);
    });

    it('handles custom separator', () => {
      expect(isValidSlug('hello_world', '_')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(isValidSlug('')).toBe(false);
    });
  });

  describe('filePathToSlug', () => {
    it('converts filename to slug', () => {
      expect(filePathToSlug('my-document.txt')).toBe('my-document');
    });

    it('handles full path', () => {
      expect(filePathToSlug('/home/user/My Document.pdf')).toBe('my-document');
    });

    it('handles windows-style path', () => {
      expect(filePathToSlug('C:\\Users\\docs\\My File.txt')).toBe('my-file');
    });

    it('handles file without extension', () => {
      expect(filePathToSlug('README')).toBe('readme');
    });

    it('handles custom separator', () => {
      expect(filePathToSlug('My Document.txt', '_')).toBe('my_document');
    });

    it('handles nested directory', () => {
      expect(filePathToSlug('src/components/MyComponent.tsx')).toBe('mycomponent');
    });
  });

  describe('camelToSlug', () => {
    it('converts camelCase to slug', () => {
      expect(camelToSlug('helloWorld')).toBe('hello-world');
    });

    it('converts PascalCase to slug', () => {
      expect(camelToSlug('HelloWorld')).toBe('hello-world');
    });

    it('handles consecutive capitals', () => {
      expect(camelToSlug('parseHTMLString')).toBe('parse-html-string');
    });

    it('handles single word', () => {
      expect(camelToSlug('hello')).toBe('hello');
    });

    it('handles custom separator', () => {
      expect(camelToSlug('helloWorld', '_')).toBe('hello_world');
    });

    it('handles multiple words', () => {
      expect(camelToSlug('myLongVariableName')).toBe('my-long-variable-name');
    });
  });

  describe('slugToCamel', () => {
    it('converts slug to camelCase', () => {
      expect(slugToCamel('hello-world')).toBe('helloWorld');
    });

    it('handles single word', () => {
      expect(slugToCamel('hello')).toBe('hello');
    });

    it('handles multiple words', () => {
      expect(slugToCamel('my-long-variable-name')).toBe('myLongVariableName');
    });

    it('handles custom separator', () => {
      expect(slugToCamel('hello_world', '_')).toBe('helloWorld');
    });

    it('handles empty string', () => {
      expect(slugToCamel('')).toBe('');
    });

    it('is inverse of camelToSlug for basic cases', () => {
      expect(slugToCamel(camelToSlug('helloWorld'))).toBe('helloWorld');
    });
  });
});
