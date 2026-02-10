import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInlineSearch } from './useInlineSearch';

const makeMessages = (...contents: string[]) =>
  contents.map(content => ({ content }));

describe('useInlineSearch', () => {
  it('starts closed with empty query', () => {
    const { result } = renderHook(() => useInlineSearch(makeMessages('hello')));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.matches).toEqual([]);
  });

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useInlineSearch(makeMessages('hello')));
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('close() resets state', () => {
    const { result } = renderHook(() => useInlineSearch(makeMessages('hello')));
    act(() => {
      result.current.open();
      result.current.setQuery('hel');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.query).toBe('hel');

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.currentMatchIndex).toBe(0);
  });

  it('finds matches in messages', () => {
    const messages = makeMessages('hello world', 'say hello again', 'no match');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('hello'));
    expect(result.current.matches).toHaveLength(2);
    expect(result.current.matches[0].messageIndex).toBe(0);
    expect(result.current.matches[1].messageIndex).toBe(1);
  });

  it('finds multiple matches within one message', () => {
    const messages = makeMessages('aaa bbb aaa');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('aaa'));
    expect(result.current.matches).toHaveLength(2);
    expect(result.current.matches[0]).toEqual({ messageIndex: 0, matchIndex: 0 });
    expect(result.current.matches[1]).toEqual({ messageIndex: 0, matchIndex: 1 });
  });

  it('search is case-insensitive', () => {
    const messages = makeMessages('Hello World');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('hello'));
    expect(result.current.matches).toHaveLength(1);
  });

  it('returns no matches for whitespace-only query', () => {
    const messages = makeMessages('hello world');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('   '));
    expect(result.current.matches).toEqual([]);
  });

  it('goToNext cycles through matches', () => {
    const messages = makeMessages('aaa', 'aaa', 'aaa');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('aaa'));
    expect(result.current.currentMatchIndex).toBe(0);

    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(1);

    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(2);

    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(0); // wraps around
  });

  it('goToPrev cycles through matches backwards', () => {
    const messages = makeMessages('aaa', 'aaa', 'aaa');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('aaa'));
    expect(result.current.currentMatchIndex).toBe(0);

    act(() => result.current.goToPrev());
    expect(result.current.currentMatchIndex).toBe(2); // wraps to end

    act(() => result.current.goToPrev());
    expect(result.current.currentMatchIndex).toBe(1);
  });

  it('currentMatch returns the correct match object', () => {
    const messages = makeMessages('foo bar', 'baz foo');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('foo'));
    expect(result.current.currentMatch).toEqual({ messageIndex: 0, matchIndex: 0 });

    act(() => result.current.goToNext());
    expect(result.current.currentMatch).toEqual({ messageIndex: 1, matchIndex: 0 });
  });

  it('currentMatch is null when no matches', () => {
    const messages = makeMessages('hello');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('xyz'));
    expect(result.current.currentMatch).toBeNull();
  });

  it('resets currentMatchIndex when query changes', () => {
    const messages = makeMessages('aaa bbb', 'ccc aaa');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('aaa'));
    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(1);

    act(() => result.current.setQuery('bbb'));
    expect(result.current.currentMatchIndex).toBe(0);
  });

  it('goToNext/goToPrev does nothing with no matches', () => {
    const { result } = renderHook(() => useInlineSearch(makeMessages('hello')));
    act(() => result.current.setQuery('xyz'));
    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(0);
    act(() => result.current.goToPrev());
    expect(result.current.currentMatchIndex).toBe(0);
  });

  it('handles empty messages array', () => {
    const { result } = renderHook(() => useInlineSearch([]));
    act(() => result.current.setQuery('anything'));
    expect(result.current.matches).toEqual([]);
    expect(result.current.currentMatch).toBeNull();
  });

  it('handles messages with empty content', () => {
    const messages = makeMessages('', '', '');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('test'));
    expect(result.current.matches).toEqual([]);
  });

  it('finds overlapping-position matches correctly', () => {
    const messages = makeMessages('aaaa');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('aa'));
    // "aaaa" searching for "aa": pos=0 found, then searchFrom=2, pos=2 found
    expect(result.current.matches).toHaveLength(2);
  });

  it('matches special regex characters literally', () => {
    const messages = makeMessages('price is $10.00');
    const { result } = renderHook(() => useInlineSearch(messages));
    // indexOf is used, not regex, so $ and . should match literally
    act(() => result.current.setQuery('$10'));
    expect(result.current.matches).toHaveLength(1);
  });

  it('reacts to messages array changes', () => {
    let messages = makeMessages('hello world');
    const { result, rerender } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('hello'));
    expect(result.current.matches).toHaveLength(1);

    messages = makeMessages('hello world', 'hello again');
    rerender();
    // After rerender with new messages, matches should update
    expect(result.current.matches).toHaveLength(2);
  });

  it('open and close are idempotent', () => {
    const { result } = renderHook(() => useInlineSearch(makeMessages('test')));
    act(() => result.current.open());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('single match: goToNext wraps immediately', () => {
    const messages = makeMessages('hello');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('hello'));
    expect(result.current.matches).toHaveLength(1);
    expect(result.current.currentMatchIndex).toBe(0);

    act(() => result.current.goToNext());
    expect(result.current.currentMatchIndex).toBe(0); // wraps to 0
  });

  it('single match: goToPrev wraps immediately', () => {
    const messages = makeMessages('hello');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('hello'));
    expect(result.current.matches).toHaveLength(1);

    act(() => result.current.goToPrev());
    expect(result.current.currentMatchIndex).toBe(0); // wraps to 0
  });

  it('matchIndex increments for multiple matches within one message', () => {
    const messages = makeMessages('abcabcabc');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('abc'));
    expect(result.current.matches).toHaveLength(3);
    expect(result.current.matches[0].matchIndex).toBe(0);
    expect(result.current.matches[1].matchIndex).toBe(1);
    expect(result.current.matches[2].matchIndex).toBe(2);
  });

  it('mixed case query matches mixed case content', () => {
    const messages = makeMessages('HeLLo WoRLd');
    const { result } = renderHook(() => useInlineSearch(messages));
    act(() => result.current.setQuery('HELLO'));
    expect(result.current.matches).toHaveLength(1);
  });
});
