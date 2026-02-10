import { describe, it, expect } from 'vitest';
import { countWords, countLines, countSentences, countParagraphs, getTextStats, estimateReadingTime } from './wordCount';

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('hello world foo')).toBe(3);
  });

  it('handles extra spaces', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });

  it('handles newlines as word separators', () => {
    expect(countWords('hello\nworld')).toBe(2);
  });

  it('handles tabs as word separators', () => {
    expect(countWords('hello\tworld')).toBe(2);
  });

  it('counts Korean words', () => {
    expect(countWords('안녕하세요 세계')).toBe(2);
  });
});

describe('countLines', () => {
  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0);
  });

  it('returns 1 for single line', () => {
    expect(countLines('hello')).toBe(1);
  });

  it('counts multiple lines', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3);
  });

  it('counts trailing newline as extra line', () => {
    expect(countLines('line1\n')).toBe(2);
  });
});

describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0);
  });

  it('returns 0 for text without sentence ending', () => {
    expect(countSentences('hello world')).toBe(0);
  });

  it('counts sentences ending with period', () => {
    expect(countSentences('Hello. World.')).toBe(2);
  });

  it('counts sentences ending with ! and ?', () => {
    expect(countSentences('Hello! Really? Yes.')).toBe(3);
  });

  it('handles Korean sentence endings', () => {
    expect(countSentences('안녕하세요。 감사합니다。')).toBe(2);
  });
});

describe('countParagraphs', () => {
  it('returns 0 for empty string', () => {
    expect(countParagraphs('')).toBe(0);
  });

  it('returns 1 for single paragraph', () => {
    expect(countParagraphs('Hello world')).toBe(1);
  });

  it('counts paragraphs separated by blank lines', () => {
    expect(countParagraphs('Paragraph 1\n\nParagraph 2\n\nParagraph 3')).toBe(3);
  });

  it('ignores trailing blank lines', () => {
    expect(countParagraphs('Paragraph 1\n\n')).toBe(1);
  });

  it('treats single newlines as same paragraph', () => {
    expect(countParagraphs('Line 1\nLine 2')).toBe(1);
  });
});

describe('getTextStats', () => {
  it('returns all stats for empty string', () => {
    const stats = getTextStats('');
    expect(stats.characters).toBe(0);
    expect(stats.charactersNoSpaces).toBe(0);
    expect(stats.words).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });

  it('computes all stats correctly', () => {
    const text = 'Hello world. Goodbye world.';
    const stats = getTextStats(text);
    expect(stats.characters).toBe(27);
    expect(stats.charactersNoSpaces).toBe(24);
    expect(stats.words).toBe(4);
    expect(stats.lines).toBe(1);
    expect(stats.sentences).toBe(2);
    expect(stats.paragraphs).toBe(1);
  });

  it('handles multiline text', () => {
    const text = 'First paragraph.\n\nSecond paragraph.';
    const stats = getTextStats(text);
    expect(stats.lines).toBe(3);
    expect(stats.paragraphs).toBe(2);
    expect(stats.sentences).toBe(2);
  });
});

describe('estimateReadingTime', () => {
  it('returns 1 for empty text', () => {
    expect(estimateReadingTime('')).toBe(1);
  });

  it('returns 1 for short text', () => {
    expect(estimateReadingTime('Hello world')).toBe(1);
  });

  it('estimates correctly at default 200 wpm', () => {
    const words = Array(400).fill('word').join(' ');
    expect(estimateReadingTime(words)).toBe(2);
  });

  it('respects custom wpm', () => {
    const words = Array(100).fill('word').join(' ');
    expect(estimateReadingTime(words, 100)).toBe(1);
  });

  it('rounds up partial minutes', () => {
    const words = Array(201).fill('word').join(' ');
    expect(estimateReadingTime(words, 200)).toBe(2);
  });
});
