import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClampedValue } from './useClampedValue';

describe('useClampedValue', () => {
  it('initializes with min by default', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10 }));
    expect(result.current.value).toBe(0);
    expect(result.current.min).toBe(0);
    expect(result.current.max).toBe(10);
    expect(result.current.isMin).toBe(true);
    expect(result.current.isMax).toBe(false);
    expect(result.current.percentage).toBe(0);
  });

  it('initializes with custom initial value', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 100, initialValue: 50 }));
    expect(result.current.value).toBe(50);
    expect(result.current.percentage).toBe(50);
  });

  it('clamps initial value to range', () => {
    const { result } = renderHook(() => useClampedValue({ min: 10, max: 20, initialValue: 30 }));
    expect(result.current.value).toBe(20);
  });

  it('clamps initial value below min', () => {
    const { result } = renderHook(() => useClampedValue({ min: 10, max: 20, initialValue: 5 }));
    expect(result.current.value).toBe(10);
  });

  it('throws if min > max', () => {
    expect(() => {
      renderHook(() => useClampedValue({ min: 20, max: 10 }));
    }).toThrow('min must not be greater than max');
  });

  it('increments by step', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 5, step: 2 }));
    act(() => result.current.increment());
    expect(result.current.value).toBe(7);
  });

  it('decrements by step', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 5, step: 3 }));
    act(() => result.current.decrement());
    expect(result.current.value).toBe(2);
  });

  it('increments by 1 by default', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 3 }));
    act(() => result.current.increment());
    expect(result.current.value).toBe(4);
  });

  it('clamps at max on increment', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 9, step: 5 }));
    act(() => result.current.increment());
    expect(result.current.value).toBe(10);
    expect(result.current.isMax).toBe(true);
  });

  it('clamps at min on decrement', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 2, step: 5 }));
    act(() => result.current.decrement());
    expect(result.current.value).toBe(0);
    expect(result.current.isMin).toBe(true);
  });

  it('sets value within range', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10 }));
    act(() => result.current.setValue(7));
    expect(result.current.value).toBe(7);
  });

  it('clamps setValue above max', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10 }));
    act(() => result.current.setValue(15));
    expect(result.current.value).toBe(10);
  });

  it('clamps setValue below min', () => {
    const { result } = renderHook(() => useClampedValue({ min: 5, max: 10 }));
    act(() => result.current.setValue(2));
    expect(result.current.value).toBe(5);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useClampedValue({ min: 0, max: 10, initialValue: 3 }));
    act(() => result.current.increment());
    act(() => result.current.increment());
    act(() => result.current.reset());
    expect(result.current.value).toBe(3);
  });

  it('calculates percentage correctly', () => {
    const { result } = renderHook(() => useClampedValue({ min: 10, max: 20, initialValue: 15 }));
    expect(result.current.percentage).toBe(50);
  });

  it('handles equal min and max', () => {
    const { result } = renderHook(() => useClampedValue({ min: 5, max: 5 }));
    expect(result.current.value).toBe(5);
    expect(result.current.isMin).toBe(true);
    expect(result.current.isMax).toBe(true);
    expect(result.current.percentage).toBe(100);
  });

  describe('loop mode', () => {
    it('loops from max to min on increment', () => {
      const { result } = renderHook(() =>
        useClampedValue({ min: 0, max: 3, initialValue: 3, loop: true })
      );
      act(() => result.current.increment());
      expect(result.current.value).toBe(0);
    });

    it('loops from min to max on decrement', () => {
      const { result } = renderHook(() =>
        useClampedValue({ min: 0, max: 3, initialValue: 0, loop: true })
      );
      act(() => result.current.decrement());
      expect(result.current.value).toBe(3);
    });

    it('does not loop when disabled', () => {
      const { result } = renderHook(() =>
        useClampedValue({ min: 0, max: 3, initialValue: 3, loop: false })
      );
      act(() => result.current.increment());
      expect(result.current.value).toBe(3);
    });
  });

  it('handles negative ranges', () => {
    const { result } = renderHook(() => useClampedValue({ min: -10, max: -5, initialValue: -7 }));
    expect(result.current.value).toBe(-7);
    expect(result.current.percentage).toBe(60);
    act(() => result.current.decrement());
    expect(result.current.value).toBe(-8);
  });
});
