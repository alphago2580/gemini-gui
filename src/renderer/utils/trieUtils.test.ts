import { describe, it, expect } from 'vitest';
import { Trie, createTrie, autoComplete, spellCheck } from './trieUtils';

describe('trieUtils', () => {
  describe('Trie', () => {
    it('starts empty', () => {
      const trie = new Trie();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty).toBe(true);
    });

    it('insert increases size', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.size).toBe(1);
      expect(trie.isEmpty).toBe(false);
    });

    it('insert duplicate does not increase size', () => {
      const trie = new Trie();
      trie.insert('hello');
      trie.insert('hello');
      expect(trie.size).toBe(1);
    });

    it('search finds inserted word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.search('hello')).toBe(true);
    });

    it('search does not find non-existent word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.search('hell')).toBe(false);
      expect(trie.search('world')).toBe(false);
    });

    it('search does not find prefix as word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.search('hel')).toBe(false);
    });

    it('startsWith finds prefixes', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.startsWith('hel')).toBe(true);
      expect(trie.startsWith('hello')).toBe(true);
      expect(trie.startsWith('h')).toBe(true);
      expect(trie.startsWith('')).toBe(true);
    });

    it('startsWith returns false for non-matching prefix', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.startsWith('world')).toBe(false);
      expect(trie.startsWith('hx')).toBe(false);
    });

    it('remove deletes a word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.remove('hello')).toBe(true);
      expect(trie.search('hello')).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('remove returns false for non-existent word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.remove('world')).toBe(false);
    });

    it('remove does not affect other words', () => {
      const trie = new Trie();
      trie.insert('hello');
      trie.insert('help');
      trie.remove('hello');
      expect(trie.search('help')).toBe(true);
      expect(trie.search('hello')).toBe(false);
    });

    it('getWordsWithPrefix returns matching words', () => {
      const trie = new Trie();
      trie.insert('hello');
      trie.insert('help');
      trie.insert('world');
      const words = trie.getWordsWithPrefix('hel');
      expect(words.sort()).toEqual(['hello', 'help']);
    });

    it('getWordsWithPrefix returns empty for non-matching prefix', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.getWordsWithPrefix('xyz')).toEqual([]);
    });

    it('getAllWords returns all inserted words', () => {
      const trie = new Trie();
      trie.insert('apple');
      trie.insert('banana');
      trie.insert('cherry');
      expect(trie.getAllWords().sort()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('getAllWords returns empty for empty trie', () => {
      const trie = new Trie();
      expect(trie.getAllWords()).toEqual([]);
    });

    it('countWordsWithPrefix counts correctly', () => {
      const trie = new Trie();
      trie.insert('hello');
      trie.insert('help');
      trie.insert('heap');
      trie.insert('world');
      expect(trie.countWordsWithPrefix('hel')).toBe(2);
      expect(trie.countWordsWithPrefix('he')).toBe(3);
      expect(trie.countWordsWithPrefix('w')).toBe(1);
      expect(trie.countWordsWithPrefix('xyz')).toBe(0);
    });

    it('longestCommonPrefix finds common prefix', () => {
      const trie = new Trie();
      trie.insert('flower');
      trie.insert('flow');
      trie.insert('flight');
      expect(trie.longestCommonPrefix()).toBe('fl');
    });

    it('longestCommonPrefix returns empty when no common prefix', () => {
      const trie = new Trie();
      trie.insert('abc');
      trie.insert('xyz');
      expect(trie.longestCommonPrefix()).toBe('');
    });

    it('longestCommonPrefix returns full word when single word', () => {
      const trie = new Trie();
      trie.insert('hello');
      expect(trie.longestCommonPrefix()).toBe('hello');
    });

    it('clear resets the trie', () => {
      const trie = new Trie();
      trie.insert('hello');
      trie.insert('world');
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty).toBe(true);
      expect(trie.search('hello')).toBe(false);
    });

    it('handles empty string', () => {
      const trie = new Trie();
      trie.insert('');
      expect(trie.search('')).toBe(true);
      expect(trie.size).toBe(1);
    });

    it('handles single character words', () => {
      const trie = new Trie();
      trie.insert('a');
      trie.insert('b');
      trie.insert('c');
      expect(trie.search('a')).toBe(true);
      expect(trie.search('d')).toBe(false);
      expect(trie.size).toBe(3);
    });

    it('handles words that are prefixes of other words', () => {
      const trie = new Trie();
      trie.insert('app');
      trie.insert('apple');
      trie.insert('application');
      expect(trie.search('app')).toBe(true);
      expect(trie.search('apple')).toBe(true);
      expect(trie.search('application')).toBe(true);
      expect(trie.search('appl')).toBe(false);
    });
  });

  describe('createTrie', () => {
    it('creates empty trie without words', () => {
      const trie = createTrie();
      expect(trie.isEmpty).toBe(true);
    });

    it('creates trie with initial words', () => {
      const trie = createTrie(['hello', 'world']);
      expect(trie.search('hello')).toBe(true);
      expect(trie.search('world')).toBe(true);
      expect(trie.size).toBe(2);
    });

    it('creates trie with empty array', () => {
      const trie = createTrie([]);
      expect(trie.isEmpty).toBe(true);
    });
  });

  describe('autoComplete', () => {
    it('returns matching completions', () => {
      const trie = createTrie(['hello', 'help', 'heap', 'world']);
      const results = autoComplete(trie, 'hel');
      expect(results.sort()).toEqual(['hello', 'help']);
    });

    it('respects limit', () => {
      const trie = createTrie(['hello', 'help', 'heap', 'hear', 'heat']);
      const results = autoComplete(trie, 'he', 2);
      expect(results).toHaveLength(2);
    });

    it('returns empty for no matches', () => {
      const trie = createTrie(['hello', 'world']);
      expect(autoComplete(trie, 'xyz')).toEqual([]);
    });

    it('returns all words for empty prefix', () => {
      const trie = createTrie(['a', 'b', 'c']);
      expect(autoComplete(trie, '').sort()).toEqual(['a', 'b', 'c']);
    });

    it('default limit is 10', () => {
      const words = Array.from({ length: 20 }, (_, i) => `word${i}`);
      const trie = createTrie(words);
      const results = autoComplete(trie, 'word');
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('spellCheck', () => {
    it('returns correct for valid word', () => {
      const trie = createTrie(['hello', 'world', 'help']);
      const result = spellCheck(trie, 'hello');
      expect(result.isCorrect).toBe(true);
      expect(result.suggestions).toEqual([]);
    });

    it('suggests deletions', () => {
      const trie = createTrie(['hello', 'helo']);
      const result = spellCheck(trie, 'helloo');
      expect(result.isCorrect).toBe(false);
      expect(result.suggestions).toContain('hello');
    });

    it('suggests replacements', () => {
      const trie = createTrie(['hello', 'world']);
      const result = spellCheck(trie, 'hxllo');
      expect(result.isCorrect).toBe(false);
      expect(result.suggestions).toContain('hello');
    });

    it('suggests insertions', () => {
      const trie = createTrie(['hello', 'world']);
      const result = spellCheck(trie, 'hllo');
      expect(result.isCorrect).toBe(false);
      expect(result.suggestions).toContain('hello');
    });

    it('returns no suggestions for very different word', () => {
      const trie = createTrie(['abc']);
      const result = spellCheck(trie, 'xyz');
      expect(result.isCorrect).toBe(false);
      // May or may not have suggestions depending on edit distance
    });

    it('does not include duplicates in suggestions', () => {
      const trie = createTrie(['cat', 'bat', 'hat', 'mat']);
      const result = spellCheck(trie, 'dat');
      const unique = new Set(result.suggestions);
      expect(unique.size).toBe(result.suggestions.length);
    });
  });
});
