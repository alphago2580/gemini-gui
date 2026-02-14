export type Listener<S> = (state: S, prevState: S) => void;
export type Middleware<S, A> = (
  state: S,
  action: A,
  next: (action: A) => S
) => S;
export type Reducer<S, A> = (state: S, action: A) => S;
export type Selector<S, R> = (state: S) => R;

export interface Store<S, A = { type: string }> {
  getState: () => S;
  dispatch: (action: A) => void;
  subscribe: (listener: Listener<S>) => () => void;
  select: <R>(selector: Selector<S, R>) => R;
}

export function createStore<S, A = { type: string }>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
): Store<S, A> {
  let state = initialState;
  const listeners = new Set<Listener<S>>();

  const getState = (): S => state;

  const dispatch = (action: A): void => {
    const prevState = state;

    const baseDispatch = (act: A): S => {
      state = reducer(state, act);
      return state;
    };

    // Chain middlewares right-to-left
    const chain = middlewares.reduceRight(
      (next: (act: A) => S, mw: Middleware<S, A>) => {
        return (act: A) => mw(state, act, next);
      },
      baseDispatch
    );

    chain(action);

    if (state !== prevState) {
      for (const listener of listeners) {
        listener(state, prevState);
      }
    }
  };

  const subscribe = (listener: Listener<S>): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const select = <R>(selector: Selector<S, R>): R => {
    return selector(state);
  };

  return { getState, dispatch, subscribe, select };
}

// Combine multiple reducers into one
export function combineReducers<S extends object>(
  reducers: { [K in keyof S]: Reducer<S[K], { type: string }> }
): Reducer<S, { type: string }> {
  return (state: S, action: { type: string }): S => {
    let hasChanged = false;
    const nextState = {} as S;

    for (const key of Object.keys(reducers) as (keyof S)[]) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      if (nextStateForKey !== previousStateForKey) {
        hasChanged = true;
      }
    }

    return hasChanged ? nextState : state;
  };
}

// Logger middleware
export function loggerMiddleware<S, A extends { type: string }>(): Middleware<S, A> {
  return (_state: S, action: A, next: (action: A) => S): S => {
    const result = next(action);
    return result;
  };
}

// Thunk middleware — allows dispatching functions
export function thunkMiddleware<S, A>(): Middleware<S, A> {
  return (state: S, action: A, next: (action: A) => S): S => {
    if (typeof action === 'function') {
      (action as unknown as (getState: () => S) => void)(() => state);
      return state;
    }
    return next(action);
  };
}

// Create a selector with memoization
export function createSelector<S, R1, Result>(
  selector1: Selector<S, R1>,
  combiner: (r1: R1) => Result
): Selector<S, Result>;
export function createSelector<S, R1, R2, Result>(
  selector1: Selector<S, R1>,
  selector2: Selector<S, R2>,
  combiner: (r1: R1, r2: R2) => Result
): Selector<S, Result>;
export function createSelector<S>(
  ...args: (Selector<S, unknown> | ((...inputs: unknown[]) => unknown))[]
): Selector<S, unknown> {
  const combiner = args.pop() as (...inputs: unknown[]) => unknown;
  const selectors = args as Selector<S, unknown>[];

  let lastInputs: unknown[] | null = null;
  let lastResult: unknown = undefined;

  return (state: S): unknown => {
    const inputs = selectors.map((sel) => sel(state));

    if (
      lastInputs !== null &&
      inputs.length === lastInputs.length &&
      inputs.every((val, i) => val === lastInputs![i])
    ) {
      return lastResult;
    }

    lastInputs = inputs;
    lastResult = combiner(...inputs);
    return lastResult;
  };
}

// Action creator helper
type ActionCreator<P> = P extends void
  ? (() => { type: string }) & { type: string }
  : ((payload: P) => { type: string; payload: P }) & { type: string };

export function createAction<P = void>(type: string): ActionCreator<P> {
  const actionCreator = (payload?: P) => {
    if (payload !== undefined) {
      return { type, payload };
    }
    return { type };
  };
  actionCreator.type = type;
  return actionCreator as unknown as ActionCreator<P>;
}
