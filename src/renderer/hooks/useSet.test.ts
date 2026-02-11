import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSet } from './useSet';

describe('useSet', () => {
  it('initializes empty by default', () => {
    const { result } = renderHook(() => useSet<string>());
    expect(result.current.size).toBe(0);
    expect(result.current.values).toEqual([]);
  });

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useSet<number>([1, 2, 3]));
    expect(result.current.size).toBe(3);
    expect(result.current.has(1)).toBe(true);
    expect(result.current.has(2)).toBe(true);
    expect(result.current.has(3)).toBe(true);
  });

  it('adds a value', () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => {
      result.current.add('hello');
    });

    expect(result.current.size).toBe(1);
    expect(result.current.has('hello')).toBe(true);
  });

  it('does not duplicate existing values', () => {
    const { result } = renderHook(() => useSet<number>([1]));

    act(() => {
      result.current.add(1);
    });

    expect(result.current.size).toBe(1);
  });

  it('removes a value', () => {
    const { result } = renderHook(() => useSet<string>(['a', 'b', 'c']));

    act(() => {
      result.current.remove('b');
    });

    expect(result.current.size).toBe(2);
    expect(result.current.has('b')).toBe(false);
    expect(result.current.has('a')).toBe(true);
    expect(result.current.has('c')).toBe(true);
  });

  it('handles remove of non-existent value', () => {
    const { result } = renderHook(() => useSet<string>(['a']));

    act(() => {
      result.current.remove('z');
    });

    expect(result.current.size).toBe(1);
  });

  it('toggles a value — adds if absent', () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => {
      result.current.toggle('x');
    });

    expect(result.current.has('x')).toBe(true);
  });

  it('toggles a value — removes if present', () => {
    const { result } = renderHook(() => useSet<string>(['x']));

    act(() => {
      result.current.toggle('x');
    });

    expect(result.current.has('x')).toBe(false);
  });

  it('clears all values', () => {
    const { result } = renderHook(() => useSet<number>([1, 2, 3]));

    act(() => {
      result.current.clear();
    });

    expect(result.current.size).toBe(0);
    expect(result.current.values).toEqual([]);
  });

  it('checks existence with has', () => {
    const { result } = renderHook(() => useSet<string>(['yes']));
    expect(result.current.has('yes')).toBe(true);
    expect(result.current.has('no')).toBe(false);
  });

  it('provides values array', () => {
    const { result } = renderHook(() => useSet<number>([10, 20]));
    expect(result.current.values).toEqual([10, 20]);
  });

  it('resets to initial values', () => {
    const { result } = renderHook(() => useSet<number>([1, 2]));

    act(() => {
      result.current.add(3);
      result.current.add(4);
    });

    expect(result.current.size).toBe(4);

    act(() => {
      result.current.reset();
    });

    expect(result.current.size).toBe(2);
    expect(result.current.has(1)).toBe(true);
    expect(result.current.has(2)).toBe(true);
    expect(result.current.has(3)).toBe(false);
  });

  it('initializes with empty set when no initial values', () => {
    const { result } = renderHook(() => useSet<number>());
    expect(result.current.size).toBe(0);
    expect(result.current.values).toEqual([]);
  });

  it('toggle adds value when absent', () => {
    const { result } = renderHook(() => useSet<string>());
    act(() => result.current.toggle('x'));
    expect(result.current.has('x')).toBe(true);
    expect(result.current.size).toBe(1);
  });

  it('toggle removes value when present', () => {
    const { result } = renderHook(() => useSet(['x']));
    act(() => result.current.toggle('x'));
    expect(result.current.has('x')).toBe(false);
    expect(result.current.size).toBe(0);
  });

  it('remove on non-existent value does not change set', () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => result.current.remove(99));
    expect(result.current.size).toBe(2);
  });

  it('add duplicate value does not increase size', () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => result.current.add(1));
    expect(result.current.size).toBe(2);
  });

  it('clear then add works correctly', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    act(() => result.current.clear());
    expect(result.current.size).toBe(0);
    act(() => result.current.add(10));
    expect(result.current.size).toBe(1);
    expect(result.current.has(10)).toBe(true);
  });

  it('values returns array representation of the set', () => {
    const { result } = renderHook(() => useSet([3, 1, 2]));
    expect(result.current.values).toContain(1);
    expect(result.current.values).toContain(2);
    expect(result.current.values).toContain(3);
    expect(result.current.values.length).toBe(3);
  });

  it('has returns false after clear', () => {
    const { result } = renderHook(() => useSet(['a', 'b']));
    act(() => result.current.clear());
    expect(result.current.has('a')).toBe(false);
    expect(result.current.has('b')).toBe(false);
  });
});
