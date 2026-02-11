export type Observer<T> = (value: T) => void;
export type Unsubscribe = () => void;
export type OperatorFn<T, R> = (observable: Observable<T>) => Observable<R>;

export class Observable<T> {
  private observers: Set<Observer<T>> = new Set();
  private lastValue: T | undefined;
  private hasValue = false;

  subscribe(observer: Observer<T>): Unsubscribe {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  next(value: T): void {
    this.lastValue = value;
    this.hasValue = true;
    for (const observer of this.observers) {
      observer(value);
    }
  }

  getValue(): T | undefined {
    return this.lastValue;
  }

  hasEmitted(): boolean {
    return this.hasValue;
  }

  get subscriberCount(): number {
    return this.observers.size;
  }

  pipe<R>(operator: OperatorFn<T, R>): Observable<R> {
    return operator(this);
  }

  complete(): void {
    this.observers.clear();
  }
}

export class BehaviorSubject<T> extends Observable<T> {
  constructor(initialValue: T) {
    super();
    this.next(initialValue);
  }

  subscribe(observer: Observer<T>): Unsubscribe {
    const unsub = super.subscribe(observer);
    const currentValue = this.getValue();
    if (currentValue !== undefined || this.hasEmitted()) {
      observer(currentValue as T);
    }
    return unsub;
  }
}

export class ReplaySubject<T> extends Observable<T> {
  private buffer: T[] = [];
  private bufferSize: number;

  constructor(bufferSize: number = Infinity) {
    super();
    this.bufferSize = bufferSize;
  }

  next(value: T): void {
    this.buffer.push(value);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    super.next(value);
  }

  subscribe(observer: Observer<T>): Unsubscribe {
    for (const value of this.buffer) {
      observer(value);
    }
    return super.subscribe(observer);
  }

  getBuffer(): T[] {
    return [...this.buffer];
  }
}

export function map<T, R>(transform: (value: T) => R): OperatorFn<T, R> {
  return (source: Observable<T>): Observable<R> => {
    const result = new Observable<R>();
    source.subscribe(value => result.next(transform(value)));
    return result;
  };
}

export function filter<T>(predicate: (value: T) => boolean): OperatorFn<T, T> {
  return (source: Observable<T>): Observable<T> => {
    const result = new Observable<T>();
    source.subscribe(value => {
      if (predicate(value)) {
        result.next(value);
      }
    });
    return result;
  };
}

export function scan<T, R>(accumulator: (acc: R, value: T) => R, seed: R): OperatorFn<T, R> {
  return (source: Observable<T>): Observable<R> => {
    const result = new Observable<R>();
    let acc = seed;
    source.subscribe(value => {
      acc = accumulator(acc, value);
      result.next(acc);
    });
    return result;
  };
}

export function distinctUntilChanged<T>(comparator?: (prev: T, curr: T) => boolean): OperatorFn<T, T> {
  return (source: Observable<T>): Observable<T> => {
    const result = new Observable<T>();
    let hasPrev = false;
    let prev: T;
    const isEqual = comparator ?? ((a: T, b: T) => a === b);
    source.subscribe(value => {
      if (!hasPrev || !isEqual(prev, value)) {
        prev = value;
        hasPrev = true;
        result.next(value);
      }
    });
    return result;
  };
}

export function take<T>(count: number): OperatorFn<T, T> {
  return (source: Observable<T>): Observable<T> => {
    const result = new Observable<T>();
    let taken = 0;
    const unsub = source.subscribe(value => {
      if (taken < count) {
        taken++;
        result.next(value);
        if (taken >= count) {
          unsub();
        }
      }
    });
    return result;
  };
}

export function skip<T>(count: number): OperatorFn<T, T> {
  return (source: Observable<T>): Observable<T> => {
    const result = new Observable<T>();
    let skipped = 0;
    source.subscribe(value => {
      if (skipped >= count) {
        result.next(value);
      } else {
        skipped++;
      }
    });
    return result;
  };
}

export function merge<T>(...observables: Observable<T>[]): Observable<T> {
  const result = new Observable<T>();
  for (const obs of observables) {
    obs.subscribe(value => result.next(value));
  }
  return result;
}

export function combineLatest<T extends unknown[]>(
  ...observables: { [K in keyof T]: Observable<T[K]> }
): Observable<T> {
  const result = new Observable<T>();
  const values = new Array(observables.length) as T;
  const hasValue = new Array(observables.length).fill(false);

  observables.forEach((obs, index) => {
    obs.subscribe(value => {
      values[index] = value as T[number];
      hasValue[index] = true;
      if (hasValue.every(Boolean)) {
        result.next([...values] as T);
      }
    });
  });

  return result;
}
