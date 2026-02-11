import { describe, it, expect, vi } from 'vitest';
import {
  createStore,
  combineReducers,
  loggerMiddleware,
  thunkMiddleware,
  createSelector,
  createAction,
  Reducer,
} from './stateManagementUtils';

interface CounterState {
  count: number;
}

type CounterAction = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'SET'; payload: number };

const counterReducer: Reducer<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET':
      return { ...state, count: (action as { type: 'SET'; payload: number }).payload };
    default:
      return state;
  }
};

describe('createStore', () => {
  it('should create a store with initial state', () => {
    const store = createStore(counterReducer, { count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should update state on dispatch', () => {
    const store = createStore(counterReducer, { count: 0 });
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
  });

  it('should handle multiple dispatches', () => {
    const store = createStore(counterReducer, { count: 0 });
    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'DECREMENT' });
    expect(store.getState().count).toBe(1);
  });

  it('should notify subscribers on state change', () => {
    const store = createStore(counterReducer, { count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('should not notify subscribers when state is unchanged', () => {
    const identityReducer: Reducer<CounterState, CounterAction> = (state) => state;
    const store = createStore(identityReducer, { count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should unsubscribe listener', () => {
    const store = createStore(counterReducer, { count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should support multiple subscribers', () => {
    const store = createStore(counterReducer, { count: 0 });
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    store.subscribe(listener1);
    store.subscribe(listener2);
    store.dispatch({ type: 'INCREMENT' });
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should select state with selector', () => {
    const store = createStore(counterReducer, { count: 42 });
    const result = store.select((s) => s.count);
    expect(result).toBe(42);
  });

  it('should apply middleware', () => {
    const log: string[] = [];
    const myMiddleware = <S, A extends { type: string }>() => {
      return (state: S, action: A, next: (a: A) => S): S => {
        log.push(`before:${action.type}`);
        const result = next(action);
        log.push(`after:${action.type}`);
        return result;
      };
    };

    const store = createStore(counterReducer, { count: 0 }, [myMiddleware()]);
    store.dispatch({ type: 'INCREMENT' });
    expect(log).toEqual(['before:INCREMENT', 'after:INCREMENT']);
    expect(store.getState().count).toBe(1);
  });

  it('should chain multiple middlewares in order', () => {
    const order: string[] = [];
    const mw1 = <S, A extends { type: string }>() => {
      return (_state: S, action: A, next: (a: A) => S): S => {
        order.push('mw1-before');
        const result = next(action);
        order.push('mw1-after');
        return result;
      };
    };
    const mw2 = <S, A extends { type: string }>() => {
      return (_state: S, action: A, next: (a: A) => S): S => {
        order.push('mw2-before');
        const result = next(action);
        order.push('mw2-after');
        return result;
      };
    };

    const store = createStore(counterReducer, { count: 0 }, [mw1(), mw2()]);
    store.dispatch({ type: 'INCREMENT' });
    expect(order).toEqual(['mw1-before', 'mw2-before', 'mw2-after', 'mw1-after']);
  });

  it('should dispatch SET action with payload', () => {
    const store = createStore(counterReducer, { count: 0 });
    store.dispatch({ type: 'SET', payload: 100 });
    expect(store.getState().count).toBe(100);
  });

  it('should provide prevState to listeners', () => {
    const store = createStore(counterReducer, { count: 5 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).toHaveBeenCalledWith({ count: 6 }, { count: 5 });
  });
});

describe('combineReducers', () => {
  interface AppState {
    counter: number;
    name: string;
  }

  const numberReducer: Reducer<number, { type: string }> = (state, action) => {
    if (action.type === 'INCREMENT') return state + 1;
    return state;
  };

  const nameReducer: Reducer<string, { type: string }> = (state, action) => {
    if (action.type === 'SET_NAME') return 'updated';
    return state;
  };

  it('should combine reducers', () => {
    const rootReducer = combineReducers<AppState>({
      counter: numberReducer,
      name: nameReducer,
    });
    const state = rootReducer({ counter: 0, name: 'init' }, { type: 'INCREMENT' });
    expect(state.counter).toBe(1);
    expect(state.name).toBe('init');
  });

  it('should return same reference when no reducer changes state', () => {
    const rootReducer = combineReducers<AppState>({
      counter: numberReducer,
      name: nameReducer,
    });
    const initial = { counter: 0, name: 'init' };
    const result = rootReducer(initial, { type: 'UNKNOWN' });
    expect(result).toBe(initial);
  });

  it('should return new reference when state changes', () => {
    const rootReducer = combineReducers<AppState>({
      counter: numberReducer,
      name: nameReducer,
    });
    const initial = { counter: 0, name: 'init' };
    const result = rootReducer(initial, { type: 'INCREMENT' });
    expect(result).not.toBe(initial);
    expect(result.counter).toBe(1);
  });

  it('should handle multiple slice changes', () => {
    const bothReducer: Reducer<number, { type: string }> = (state, action) => {
      if (action.type === 'BOTH') return state + 1;
      return state;
    };
    const bothNameReducer: Reducer<string, { type: string }> = (state, action) => {
      if (action.type === 'BOTH') return 'both';
      return state;
    };
    const rootReducer = combineReducers<AppState>({
      counter: bothReducer,
      name: bothNameReducer,
    });
    const result = rootReducer({ counter: 0, name: 'init' }, { type: 'BOTH' });
    expect(result.counter).toBe(1);
    expect(result.name).toBe('both');
  });
});

describe('loggerMiddleware', () => {
  it('should pass action through to next', () => {
    const store = createStore(counterReducer, { count: 0 }, [loggerMiddleware()]);
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
  });
});

describe('thunkMiddleware', () => {
  it('should handle function actions', () => {
    const store = createStore(counterReducer, { count: 5 }, [thunkMiddleware()]);
    const thunk = vi.fn((getState: () => CounterState) => {
      expect(getState().count).toBe(5);
    });
    store.dispatch(thunk as unknown as CounterAction);
    expect(thunk).toHaveBeenCalled();
  });

  it('should pass non-function actions through', () => {
    const store = createStore(counterReducer, { count: 0 }, [thunkMiddleware()]);
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
  });
});

describe('createSelector', () => {
  interface State {
    items: number[];
    filter: string;
  }

  it('should compute derived state', () => {
    const getItems = (s: State) => s.items;
    const selectSum = createSelector(getItems, (items: number[]) => items.reduce((a, b) => a + b, 0));
    const state: State = { items: [1, 2, 3], filter: '' };
    expect(selectSum(state)).toBe(6);
  });

  it('should memoize result when inputs are unchanged', () => {
    const getItems = (s: State) => s.items;
    const combiner = vi.fn((items: number[]) => items.reduce((a, b) => a + b, 0));
    const selectSum = createSelector(getItems, combiner);
    const state: State = { items: [1, 2, 3], filter: '' };
    selectSum(state);
    selectSum(state);
    expect(combiner).toHaveBeenCalledTimes(1);
  });

  it('should recompute when inputs change', () => {
    const getItems = (s: State) => s.items;
    const combiner = vi.fn((items: number[]) => items.reduce((a, b) => a + b, 0));
    const selectSum = createSelector(getItems, combiner);
    const state1: State = { items: [1, 2, 3], filter: '' };
    const state2: State = { items: [4, 5, 6], filter: '' };
    selectSum(state1);
    selectSum(state2);
    expect(combiner).toHaveBeenCalledTimes(2);
  });

  it('should support two-input selectors', () => {
    const getItems = (s: State) => s.items;
    const getFilter = (s: State) => s.filter;
    const selectFiltered = createSelector(
      getItems,
      getFilter,
      (items: number[], filter: string) =>
        filter === 'even' ? items.filter((n) => n % 2 === 0) : items
    );
    expect(selectFiltered({ items: [1, 2, 3, 4], filter: 'even' })).toEqual([2, 4]);
    expect(selectFiltered({ items: [1, 2, 3, 4], filter: '' })).toEqual([1, 2, 3, 4]);
  });

  it('should memoize two-input selector', () => {
    const getItems = (s: State) => s.items;
    const getFilter = (s: State) => s.filter;
    const combiner = vi.fn((items: number[], _f: string) => items.length);
    const selectCount = createSelector(getItems, getFilter, combiner);
    const items = [1, 2];
    const state: State = { items, filter: 'x' };
    selectCount(state);
    selectCount(state);
    expect(combiner).toHaveBeenCalledTimes(1);
  });
});

describe('createAction', () => {
  it('should create action without payload', () => {
    const increment = createAction('INCREMENT');
    expect(increment()).toEqual({ type: 'INCREMENT' });
  });

  it('should create action with payload', () => {
    const setCount = createAction<number>('SET_COUNT');
    expect(setCount(42)).toEqual({ type: 'SET_COUNT', payload: 42 });
  });

  it('should have type property on action creator', () => {
    const increment = createAction('INCREMENT');
    expect(increment.type).toBe('INCREMENT');
  });

  it('should create action with object payload', () => {
    const setUser = createAction<{ name: string; age: number }>('SET_USER');
    expect(setUser({ name: 'John', age: 30 })).toEqual({
      type: 'SET_USER',
      payload: { name: 'John', age: 30 },
    });
  });
});

describe('stateManagementUtils — additional coverage', () => {
  it('subscribe returns unique unsubscribe per listener', () => {
    const store = createStore(counterReducer, { count: 0 });
    const l1 = vi.fn();
    const l2 = vi.fn();
    const unsub1 = store.subscribe(l1);
    store.subscribe(l2);
    unsub1();
    store.dispatch({ type: 'INCREMENT' });
    expect(l1).not.toHaveBeenCalled();
    expect(l2).toHaveBeenCalledTimes(1);
  });

  it('duplicate subscribe same listener is idempotent (Set semantics)', () => {
    const store = createStore(counterReducer, { count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.subscribe(listener);
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('select with identity returns full state', () => {
    const store = createStore(counterReducer, { count: 99 });
    const result = store.select((s) => s);
    expect(result).toEqual({ count: 99 });
  });

  it('middleware can modify action before reaching reducer', () => {
    const interceptor = <S, A extends { type: string }>() => {
      return (_state: S, action: A, next: (a: A) => S): S => {
        if (action.type === 'INCREMENT') {
          return next({ ...action, type: 'DECREMENT' } as A);
        }
        return next(action);
      };
    };
    const store = createStore(counterReducer, { count: 10 }, [interceptor()]);
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(9);
  });

  it('thunk middleware does not notify listeners when only thunk runs', () => {
    const store = createStore(counterReducer, { count: 0 }, [thunkMiddleware()]);
    const listener = vi.fn();
    store.subscribe(listener);
    const thunk = vi.fn(() => {});
    store.dispatch(thunk as unknown as CounterAction);
    expect(listener).not.toHaveBeenCalled();
  });

  it('createSelector recomputes when second input changes', () => {
    interface S { a: number; b: number }
    const getA = (s: S) => s.a;
    const getB = (s: S) => s.b;
    const combiner = vi.fn((a: number, b: number) => a + b);
    const sel = createSelector(getA, getB, combiner);
    expect(sel({ a: 1, b: 2 })).toBe(3);
    expect(sel({ a: 1, b: 3 })).toBe(4);
    expect(combiner).toHaveBeenCalledTimes(2);
  });

  it('combineReducers handles single-key state', () => {
    const singleReducer = combineReducers<{ val: number }>({
      val: (state: number, action: { type: string }) =>
        action.type === 'INC' ? state + 1 : state,
    });
    const result = singleReducer({ val: 0 }, { type: 'INC' });
    expect(result).toEqual({ val: 1 });
  });

  it('createAction with undefined payload returns type only', () => {
    const noPayload = createAction('RESET');
    const action = noPayload();
    expect(action).toEqual({ type: 'RESET' });
    expect('payload' in action).toBe(false);
  });
});
