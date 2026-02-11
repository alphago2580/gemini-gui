/**
 * Iterator/generator utility functions for lazy sequence processing.
 */

/** Generate a range of numbers [start, end) with optional step */
export function* range(start: number, end?: number, step = 1): Generator<number> {
  let s = start;
  let e = end;
  if (e === undefined) {
    e = s;
    s = 0;
  }
  if (step > 0) {
    for (let i = s; i < e; i += step) yield i;
  } else if (step < 0) {
    for (let i = s; i > e; i += step) yield i;
  }
}

/** Split an iterable into chunks of given size */
export function* chunk<T>(iterable: Iterable<T>, size: number): Generator<T[]> {
  let batch: T[] = [];
  for (const item of iterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

/** Zip multiple iterables together */
export function* zip<T>(...iterables: Iterable<T>[]): Generator<T[]> {
  const iterators = iterables.map((it) => it[Symbol.iterator]());
  while (true) {
    const results = iterators.map((it) => it.next());
    if (results.some((r) => r.done)) return;
    yield results.map((r) => r.value);
  }
}

/** Take the first n items from an iterable */
export function* take<T>(iterable: Iterable<T>, n: number): Generator<T> {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) return;
    yield item;
    count++;
  }
}

/** Skip the first n items from an iterable */
export function* skip<T>(iterable: Iterable<T>, n: number): Generator<T> {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) {
      yield item;
    }
    count++;
  }
}

/** Filter items from an iterable */
export function* filter<T>(
  iterable: Iterable<T>,
  predicate: (item: T, index: number) => boolean
): Generator<T> {
  let index = 0;
  for (const item of iterable) {
    if (predicate(item, index)) yield item;
    index++;
  }
}

/** Map items from an iterable */
export function* map<T, U>(
  iterable: Iterable<T>,
  transform: (item: T, index: number) => U
): Generator<U> {
  let index = 0;
  for (const item of iterable) {
    yield transform(item, index);
    index++;
  }
}

/** Flatten one level of nested iterables */
export function* flatten<T>(iterable: Iterable<Iterable<T>>): Generator<T> {
  for (const inner of iterable) {
    yield* inner;
  }
}

/** Enumerate items with their index */
export function* enumerate<T>(iterable: Iterable<T>, start = 0): Generator<[number, T]> {
  let index = start;
  for (const item of iterable) {
    yield [index, item];
    index++;
  }
}

/** Take items while predicate is true */
export function* takeWhile<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T> {
  for (const item of iterable) {
    if (!predicate(item)) return;
    yield item;
  }
}

/** Skip items while predicate is true */
export function* skipWhile<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T> {
  let skipping = true;
  for (const item of iterable) {
    if (skipping && predicate(item)) continue;
    skipping = false;
    yield item;
  }
}

/** Get unique items (by optional key function) */
export function* unique<T, K = T>(
  iterable: Iterable<T>,
  keyFn?: (item: T) => K
): Generator<T> {
  const seen = new Set<K | T>();
  for (const item of iterable) {
    const key = keyFn ? keyFn(item) : item;
    if (!seen.has(key)) {
      seen.add(key);
      yield item;
    }
  }
}

/** Reduce an iterable to a single value */
export function reduce<T, U>(
  iterable: Iterable<T>,
  reducer: (accumulator: U, item: T) => U,
  initial: U
): U {
  let acc = initial;
  for (const item of iterable) {
    acc = reducer(acc, item);
  }
  return acc;
}

/** Collect an iterable into an array */
export function toArray<T>(iterable: Iterable<T>): T[] {
  return [...iterable];
}

/** Create an infinite repeating cycle of an iterable */
export function* cycle<T>(iterable: Iterable<T>): Generator<T> {
  const items: T[] = [];
  for (const item of iterable) {
    items.push(item);
    yield item;
  }
  if (items.length === 0) return;
  while (true) {
    yield* items;
  }
}
