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
});
