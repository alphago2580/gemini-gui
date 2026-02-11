import { describe, it, expect, vi } from 'vitest';
import {
  Observable,
  BehaviorSubject,
  ReplaySubject,
  map,
  filter,
  scan,
  distinctUntilChanged,
  take,
  skip,
  merge,
  combineLatest,
} from './observableUtils';

describe('Observable', () => {
  it('notifies subscribers', () => {
    const obs = new Observable<number>();
    const cb = vi.fn();
    obs.subscribe(cb);
    obs.next(1);
    obs.next(2);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(1);
    expect(cb).toHaveBeenCalledWith(2);
  });

  it('unsubscribes', () => {
    const obs = new Observable<number>();
    const cb = vi.fn();
    const unsub = obs.subscribe(cb);
    obs.next(1);
    unsub();
    obs.next(2);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('tracks getValue and hasEmitted', () => {
    const obs = new Observable<string>();
    expect(obs.hasEmitted()).toBe(false);
    expect(obs.getValue()).toBeUndefined();

    obs.next('hello');
    expect(obs.hasEmitted()).toBe(true);
    expect(obs.getValue()).toBe('hello');
  });

  it('tracks subscriberCount', () => {
    const obs = new Observable<number>();
    expect(obs.subscriberCount).toBe(0);

    const unsub1 = obs.subscribe(() => {});
    expect(obs.subscriberCount).toBe(1);

    const unsub2 = obs.subscribe(() => {});
    expect(obs.subscriberCount).toBe(2);

    unsub1();
    expect(obs.subscriberCount).toBe(1);

    unsub2();
    expect(obs.subscriberCount).toBe(0);
  });

  it('complete clears all subscribers', () => {
    const obs = new Observable<number>();
    const cb = vi.fn();
    obs.subscribe(cb);
    obs.subscribe(cb);
    obs.complete();
    obs.next(1);
    expect(cb).not.toHaveBeenCalled();
    expect(obs.subscriberCount).toBe(0);
  });

  it('supports multiple subscribers', () => {
    const obs = new Observable<number>();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    obs.subscribe(cb1);
    obs.subscribe(cb2);
    obs.next(42);
    expect(cb1).toHaveBeenCalledWith(42);
    expect(cb2).toHaveBeenCalledWith(42);
  });
});

describe('BehaviorSubject', () => {
  it('emits initial value to new subscribers', () => {
    const subject = new BehaviorSubject(10);
    const cb = vi.fn();
    subject.subscribe(cb);
    expect(cb).toHaveBeenCalledWith(10);
  });

  it('emits current value to late subscribers', () => {
    const subject = new BehaviorSubject(0);
    subject.next(5);
    const cb = vi.fn();
    subject.subscribe(cb);
    expect(cb).toHaveBeenCalledWith(5);
  });

  it('getValue returns current value', () => {
    const subject = new BehaviorSubject('start');
    expect(subject.getValue()).toBe('start');
    subject.next('updated');
    expect(subject.getValue()).toBe('updated');
  });
});

describe('ReplaySubject', () => {
  it('replays all values to new subscriber', () => {
    const subject = new ReplaySubject<number>();
    subject.next(1);
    subject.next(2);
    subject.next(3);

    const cb = vi.fn();
    subject.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
    expect(cb).toHaveBeenNthCalledWith(3, 3);
  });

  it('respects buffer size', () => {
    const subject = new ReplaySubject<number>(2);
    subject.next(1);
    subject.next(2);
    subject.next(3);

    const cb = vi.fn();
    subject.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenNthCalledWith(1, 2);
    expect(cb).toHaveBeenNthCalledWith(2, 3);
  });

  it('getBuffer returns copy of buffer', () => {
    const subject = new ReplaySubject<number>(3);
    subject.next(1);
    subject.next(2);
    const buffer = subject.getBuffer();
    expect(buffer).toEqual([1, 2]);
    buffer.push(999);
    expect(subject.getBuffer()).toEqual([1, 2]);
  });

  it('replays and continues emitting', () => {
    const subject = new ReplaySubject<string>();
    subject.next('a');
    const cb = vi.fn();
    subject.subscribe(cb);
    expect(cb).toHaveBeenCalledWith('a');

    subject.next('b');
    expect(cb).toHaveBeenCalledWith('b');
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe('map operator', () => {
  it('transforms values', () => {
    const source = new Observable<number>();
    const mapped = source.pipe(map(x => x * 2));
    const cb = vi.fn();
    mapped.subscribe(cb);

    source.next(3);
    source.next(5);
    expect(cb).toHaveBeenCalledWith(6);
    expect(cb).toHaveBeenCalledWith(10);
  });

  it('transforms types', () => {
    const source = new Observable<number>();
    const mapped = source.pipe(map(x => String(x)));
    const cb = vi.fn();
    mapped.subscribe(cb);

    source.next(42);
    expect(cb).toHaveBeenCalledWith('42');
  });
});

describe('filter operator', () => {
  it('filters values', () => {
    const source = new Observable<number>();
    const filtered = source.pipe(filter(x => x > 3));
    const cb = vi.fn();
    filtered.subscribe(cb);

    source.next(1);
    source.next(5);
    source.next(2);
    source.next(4);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(5);
    expect(cb).toHaveBeenCalledWith(4);
  });
});

describe('scan operator', () => {
  it('accumulates values', () => {
    const source = new Observable<number>();
    const scanned = source.pipe(scan((acc, val) => acc + val, 0));
    const cb = vi.fn();
    scanned.subscribe(cb);

    source.next(1);
    source.next(2);
    source.next(3);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 3);
    expect(cb).toHaveBeenNthCalledWith(3, 6);
  });
});

describe('distinctUntilChanged operator', () => {
  it('skips duplicate values', () => {
    const source = new Observable<number>();
    const distinct = source.pipe(distinctUntilChanged());
    const cb = vi.fn();
    distinct.subscribe(cb);

    source.next(1);
    source.next(1);
    source.next(2);
    source.next(2);
    source.next(1);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
    expect(cb).toHaveBeenNthCalledWith(3, 1);
  });

  it('uses custom comparator', () => {
    const source = new Observable<{ id: number }>();
    const distinct = source.pipe(
      distinctUntilChanged((a, b) => a.id === b.id)
    );
    const cb = vi.fn();
    distinct.subscribe(cb);

    source.next({ id: 1 });
    source.next({ id: 1 });
    source.next({ id: 2 });
    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe('take operator', () => {
  it('takes first N values', () => {
    const source = new Observable<number>();
    const taken = source.pipe(take(2));
    const cb = vi.fn();
    taken.subscribe(cb);

    source.next(1);
    source.next(2);
    source.next(3);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(1);
    expect(cb).toHaveBeenCalledWith(2);
  });
});

describe('skip operator', () => {
  it('skips first N values', () => {
    const source = new Observable<number>();
    const skipped = source.pipe(skip(2));
    const cb = vi.fn();
    skipped.subscribe(cb);

    source.next(1);
    source.next(2);
    source.next(3);
    source.next(4);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(3);
    expect(cb).toHaveBeenCalledWith(4);
  });
});

describe('merge', () => {
  it('merges multiple observables', () => {
    const obs1 = new Observable<number>();
    const obs2 = new Observable<number>();
    const merged = merge(obs1, obs2);
    const cb = vi.fn();
    merged.subscribe(cb);

    obs1.next(1);
    obs2.next(2);
    obs1.next(3);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb).toHaveBeenNthCalledWith(1, 1);
    expect(cb).toHaveBeenNthCalledWith(2, 2);
    expect(cb).toHaveBeenNthCalledWith(3, 3);
  });
});

describe('combineLatest', () => {
  it('emits when all have values', () => {
    const obs1 = new Observable<number>();
    const obs2 = new Observable<string>();
    const combined = combineLatest<[number, string]>(obs1, obs2);
    const cb = vi.fn();
    combined.subscribe(cb);

    obs1.next(1);
    expect(cb).not.toHaveBeenCalled();

    obs2.next('a');
    expect(cb).toHaveBeenCalledWith([1, 'a']);

    obs1.next(2);
    expect(cb).toHaveBeenCalledWith([2, 'a']);
  });

  it('emits new array on each update', () => {
    const obs1 = new Observable<number>();
    const obs2 = new Observable<number>();
    const combined = combineLatest<[number, number]>(obs1, obs2);
    const results: number[][] = [];
    combined.subscribe(val => results.push(val));

    obs1.next(1);
    obs2.next(2);
    obs1.next(3);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual([1, 2]);
    expect(results[1]).toEqual([3, 2]);
    expect(results[0]).not.toBe(results[1]);
  });
});
