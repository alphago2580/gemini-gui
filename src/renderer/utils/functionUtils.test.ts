import {
  noop,
  identity,
  compose,
  pipe,
  once,
  memoize,
  debounce,
  throttle,
  negate,
  delay,
  times,
} from './functionUtils';

describe('functionUtils', () => {
  describe('noop', () => {
    it('returns undefined', () => {
      expect(noop()).toBeUndefined();
    });

    it('is a function', () => {
      expect(typeof noop).toBe('function');
    });
  });

  describe('identity', () => {
    it('returns the same value', () => {
      expect(identity(42)).toBe(42);
      expect(identity('hello')).toBe('hello');
    });

    it('returns the same object reference', () => {
      const obj = { a: 1 };
      expect(identity(obj)).toBe(obj);
    });
  });

  describe('compose', () => {
    it('composes functions right-to-left', () => {
      const add1 = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const composed = compose(add1, double);
      expect(composed(3)).toBe(7); // double(3)=6, add1(6)=7
    });

    it('handles single function', () => {
      const add1 = (x: number) => x + 1;
      expect(compose(add1)(5)).toBe(6);
    });

    it('handles multiple functions', () => {
      const add1 = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const sub3 = (x: number) => x - 3;
      expect(compose(sub3, double, add1)(4)).toBe(7); // add1(4)=5, double(5)=10, sub3(10)=7
    });
  });

  describe('pipe', () => {
    it('composes functions left-to-right', () => {
      const add1 = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const piped = pipe(add1, double);
      expect(piped(3)).toBe(8); // add1(3)=4, double(4)=8
    });

    it('handles single function', () => {
      const add1 = (x: number) => x + 1;
      expect(pipe(add1)(5)).toBe(6);
    });

    it('is the reverse of compose', () => {
      const add1 = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      expect(pipe(double, add1)(3)).toBe(compose(add1, double)(3));
    });
  });

  describe('once', () => {
    it('calls the function only once', () => {
      const fn = vi.fn().mockReturnValue(42);
      const onceFn = once(fn);
      expect(onceFn()).toBe(42);
      expect(onceFn()).toBe(42);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to the first call', () => {
      const fn = vi.fn((...args: unknown[]) => args);
      const onceFn = once(fn);
      onceFn(1, 2, 3);
      onceFn(4, 5, 6);
      expect(fn).toHaveBeenCalledWith(1, 2, 3);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('memoize', () => {
    it('caches results for same arguments', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('computes for different arguments', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);
      expect(memoized(5)).toBe(10);
      expect(memoized(3)).toBe(6);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('supports custom key resolver', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn, (a, b) => `${a}-${b}`);
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancel stops pending execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
    });

    it('passes arguments to the function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('a', 'b');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('a', 'b');
    });
  });

  describe('throttle', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('executes immediately on first call', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('ignores calls within throttle window', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled();
      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('allows call after throttle window expires', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled();
      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('cancel resets throttle state', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled();
      throttled.cancel();
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('negate', () => {
    it('negates predicate result', () => {
      const isEven = (n: number) => n % 2 === 0;
      const isOdd = negate(isEven);
      expect(isOdd(3)).toBe(true);
      expect(isOdd(4)).toBe(false);
    });
  });

  describe('delay', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('resolves after specified time', async () => {
      const fn = vi.fn();
      delay(100).then(fn);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      await Promise.resolve();
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('times', () => {
    it('calls function n times', () => {
      const result = times(3, (i) => i * 2);
      expect(result).toEqual([0, 2, 4]);
    });

    it('returns empty array for 0', () => {
      expect(times(0, () => 1)).toEqual([]);
    });

    it('passes index to callback', () => {
      const indices = times(4, (i) => i);
      expect(indices).toEqual([0, 1, 2, 3]);
    });

    it('negative n returns empty array', () => {
      expect(times(-3, () => 1)).toEqual([]);
    });
  });

  describe('functionUtils — additional coverage', () => {
    it('compose with no functions returns identity', () => {
      const empty = compose<number>();
      expect(empty(42)).toBe(42);
    });

    it('pipe with no functions returns identity', () => {
      const empty = pipe<string>();
      expect(empty('hello')).toBe('hello');
    });

    it('once returns same result for different arguments on subsequent calls', () => {
      const fn = vi.fn((x: unknown) => x);
      const onceFn = once(fn);
      expect(onceFn('first')).toBe('first');
      expect(onceFn('second')).toBe('first');
    });

    it('memoize with multiple args uses JSON.stringify as default key', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);
      memoized(1, 2);
      memoized(1, 2);
      memoized(2, 1); // different key
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('debounce uses last call args', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('first');
      debounced('second');
      debounced('third');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
      vi.useRealTimers();
    });

    it('throttle passes arguments to the function', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      throttled('x', 'y');
      expect(fn).toHaveBeenCalledWith('x', 'y');
      vi.useRealTimers();
    });

    it('negate preserves argument passing', () => {
      const startsWith = (s: string, prefix: string) => s.startsWith(prefix);
      const doesNotStartWith = negate(startsWith);
      expect(doesNotStartWith('hello', 'he')).toBe(false);
      expect(doesNotStartWith('hello', 'xy')).toBe(true);
    });
  });
});
