import { renderHook } from '@testing-library/react';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('returns undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('hello'));
    expect(result.current).toBeUndefined();
  });

  it('returns previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'a' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'c' });
    expect(result.current).toBe('b');
  });

  it('works with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    );

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('works with objects', () => {
    const obj1 = { x: 1 };
    const obj2 = { x: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });

  it('tracks same value without change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'same' } }
    );

    rerender({ value: 'same' });
    expect(result.current).toBe('same');
  });

  it('works with boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: false } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: true });
    expect(result.current).toBe(false);

    rerender({ value: false });
    expect(result.current).toBe(true);
  });

  it('works with null and undefined', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    );

    rerender({ value: 'hello' });
    expect(result.current).toBeNull();

    rerender({ value: null });
    expect(result.current).toBe('hello');
  });

  it('works with array values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: arr1 } }
    );
    rerender({ value: arr2 });
    expect(result.current).toBe(arr1);
  });

  it('tracks four sequential updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 'second' });
    expect(result.current).toBe('first');
    rerender({ value: 'third' });
    expect(result.current).toBe('second');
    rerender({ value: 'fourth' });
    expect(result.current).toBe('third');
  });

  it('returns undefined for empty string initial', () => {
    const { result } = renderHook(() => usePrevious(''));
    expect(result.current).toBeUndefined();
  });

  it('preserves object reference identity', () => {
    const obj = { a: 1, b: { c: 2 } };
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj } }
    );
    rerender({ value: { a: 1, b: { c: 2 } } });
    expect(result.current).toBe(obj);
  });

  it('works with zero as a falsy value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );
    rerender({ value: 1 });
    expect(result.current).toBe(0);
  });

  it('undefined to defined transition', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: undefined as string | undefined } }
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 'defined' });
    expect(result.current).toBeUndefined();
    rerender({ value: 'next' });
    expect(result.current).toBe('defined');
  });

  it('same reference rerender tracks correctly', () => {
    const obj = { x: 1 };
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj } }
    );
    rerender({ value: obj });
    expect(result.current).toBe(obj);
  });

  it('works with NaN', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: NaN } }
    );
    rerender({ value: 42 });
    expect(result.current).toBeNaN();
  });
});
