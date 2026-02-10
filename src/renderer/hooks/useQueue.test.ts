import { renderHook, act } from '@testing-library/react';
import { useQueue } from './useQueue';

describe('useQueue', () => {
  it('initializes with empty queue by default', () => {
    const { result } = renderHook(() => useQueue<number>());
    expect(result.current.items).toEqual([]);
    expect(result.current.size).toBe(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.peek).toBeUndefined();
  });

  it('initializes with provided items', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]));
    expect(result.current.items).toEqual([1, 2, 3]);
    expect(result.current.size).toBe(3);
    expect(result.current.isEmpty).toBe(false);
  });

  it('enqueues items to the end', () => {
    const { result } = renderHook(() => useQueue<number>());
    act(() => result.current.enqueue(1));
    act(() => result.current.enqueue(2));
    expect(result.current.items).toEqual([1, 2]);
    expect(result.current.size).toBe(2);
  });

  it('dequeues items from the front (FIFO)', () => {
    const { result } = renderHook(() => useQueue([10, 20, 30]));
    let removed: number | undefined;
    act(() => {
      removed = result.current.dequeue();
    });
    expect(removed).toBe(10);
    expect(result.current.items).toEqual([20, 30]);
  });

  it('dequeue returns undefined for empty queue', () => {
    const { result } = renderHook(() => useQueue<number>());
    let removed: number | undefined;
    act(() => {
      removed = result.current.dequeue();
    });
    expect(removed).toBeUndefined();
    expect(result.current.items).toEqual([]);
  });

  it('peek returns first item without removing', () => {
    const { result } = renderHook(() => useQueue([5, 10, 15]));
    expect(result.current.peek).toBe(5);
    expect(result.current.size).toBe(3);
  });

  it('peek returns undefined for empty queue', () => {
    const { result } = renderHook(() => useQueue<number>());
    expect(result.current.peek).toBeUndefined();
  });

  it('clears all items', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]));
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
    expect(result.current.size).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  it('contains checks for matching predicate', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]));
    expect(result.current.contains(item => item === 2)).toBe(true);
    expect(result.current.contains(item => item === 99)).toBe(false);
  });

  it('toArray returns a copy of items', () => {
    const { result } = renderHook(() => useQueue([1, 2, 3]));
    const arr = result.current.toArray();
    expect(arr).toEqual([1, 2, 3]);
    expect(arr).not.toBe(result.current.items);
  });

  it('works with string type', () => {
    const { result } = renderHook(() => useQueue<string>());
    act(() => result.current.enqueue('a'));
    act(() => result.current.enqueue('b'));
    expect(result.current.items).toEqual(['a', 'b']);
    expect(result.current.peek).toBe('a');
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useQueue<number>());
    const firstEnqueue = result.current.enqueue;
    const firstDequeue = result.current.dequeue;
    const firstClear = result.current.clear;
    rerender();
    expect(result.current.enqueue).toBe(firstEnqueue);
    expect(result.current.dequeue).toBe(firstDequeue);
    expect(result.current.clear).toBe(firstClear);
  });
});
