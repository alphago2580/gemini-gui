/**
 * Function composition and higher-order function utilities.
 */

/** No-op function that does nothing. */
export function noop(): void {
  return;
}

/** Identity function — returns its argument unchanged. */
export function identity<T>(value: T): T {
  return value;
}

/** Composes functions right-to-left: compose(f, g)(x) = f(g(x)) */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

/** Composes functions left-to-right: pipe(f, g)(x) = g(f(x)) */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

/** Creates a function that is restricted to being called only once. Subsequent calls return the first result. */
export function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false;
  let result: unknown;
  return ((...args: unknown[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

/**
 * Returns a memoized version of the function.
 * Uses JSON.stringify of args as cache key by default.
 * Optionally pass a custom key resolver.
 */
export function memoize<T extends (...args: never[]) => unknown>(
  fn: T,
  keyResolver?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>();
  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = keyResolver
      ? keyResolver(...args)
      : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as ReturnType<T>;
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  };
  return memoized as T;
}

/**
 * Returns a debounced version of the function.
 * The function is delayed until `delay` ms have elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: unknown[]) => {
    if (timerId !== null) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }) as T & { cancel: () => void };
  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  return debounced;
}

/**
 * Returns a throttled version of the function.
 * Calls are limited to once per `limit` ms.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number,
): T & { cancel: () => void } {
  let inThrottle = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  const throttled = ((...args: unknown[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      timerId = setTimeout(() => {
        inThrottle = false;
        timerId = null;
      }, limit);
    }
  }) as T & { cancel: () => void };
  throttled.cancel = () => {
    inThrottle = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  return throttled;
}

/** Creates a function that negates the result of a predicate. */
export function negate<T extends (...args: never[]) => boolean>(predicate: T): (...args: Parameters<T>) => boolean {
  return (...args: Parameters<T>) => !predicate(...args);
}

/** Delays execution for the specified milliseconds. Returns a promise. */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Calls a function n times and returns an array of results. */
export function times<T>(n: number, fn: (index: number) => T): T[] {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(fn(i));
  }
  return result;
}
