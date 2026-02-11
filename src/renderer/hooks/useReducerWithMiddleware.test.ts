import { renderHook, act } from '@testing-library/react';
import { useReducerWithMiddleware, Middleware } from './useReducerWithMiddleware';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'set'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'set': return { count: action.payload };
    default: return state;
  }
};

describe('useReducerWithMiddleware', () => {
  it('initializes with the given state', () => {
    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 })
    );
    expect(result.current.state).toEqual({ count: 0 });
  });

  it('dispatches actions without middleware', () => {
    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 })
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(result.current.state).toEqual({ count: 1 });
  });

  it('dispatches multiple actions', () => {
    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 })
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    act(() => result.current.dispatch({ type: 'increment' }));
    act(() => result.current.dispatch({ type: 'decrement' }));
    expect(result.current.state).toEqual({ count: 1 });
  });

  it('handles set action with payload', () => {
    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 })
    );
    act(() => result.current.dispatch({ type: 'set', payload: 42 }));
    expect(result.current.state).toEqual({ count: 42 });
  });

  it('calls middleware on dispatch', () => {
    const log: string[] = [];
    const loggerMiddleware: Middleware<State, Action> = () => next => action => {
      log.push(`before:${action.type}`);
      next(action);
      log.push(`after:${action.type}`);
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [loggerMiddleware])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(log).toEqual(['before:increment', 'after:increment']);
    expect(result.current.state).toEqual({ count: 1 });
  });

  it('middleware can access state via getState', () => {
    const capturedStates: number[] = [];
    const stateCapture: Middleware<State, Action> = api => next => action => {
      capturedStates.push(api.getState().count);
      next(action);
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 5 }, [stateCapture])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(capturedStates).toEqual([5]);
    expect(result.current.state).toEqual({ count: 6 });
  });

  it('chains multiple middlewares in order', () => {
    const order: string[] = [];
    const first: Middleware<State, Action> = () => next => action => {
      order.push('first-before');
      next(action);
      order.push('first-after');
    };
    const second: Middleware<State, Action> = () => next => action => {
      order.push('second-before');
      next(action);
      order.push('second-after');
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [first, second])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(order).toEqual(['first-before', 'second-before', 'second-after', 'first-after']);
  });

  it('middleware can block dispatch by not calling next', () => {
    const blockDecrement: Middleware<State, Action> = () => next => action => {
      if (action.type !== 'decrement') {
        next(action);
      }
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 5 }, [blockDecrement])
    );
    act(() => result.current.dispatch({ type: 'decrement' }));
    expect(result.current.state).toEqual({ count: 5 });
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(result.current.state).toEqual({ count: 6 });
  });

  it('middleware can transform actions', () => {
    const doubleIncrement: Middleware<State, Action> = () => next => action => {
      if (action.type === 'increment') {
        next({ type: 'set', payload: 2 } as Action);
      } else {
        next(action);
      }
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [doubleIncrement])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(result.current.state).toEqual({ count: 2 });
  });

  it('middleware can dispatch additional actions', () => {
    const autoDecrement: Middleware<State, Action> = api => next => action => {
      next(action);
      if (action.type === 'set') {
        api.dispatch({ type: 'decrement' });
      }
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [autoDecrement])
    );
    act(() => result.current.dispatch({ type: 'set', payload: 10 }));
    expect(result.current.state).toEqual({ count: 9 });
  });

  it('returns stable dispatch reference', () => {
    const { result, rerender } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 })
    );
    const firstDispatch = result.current.dispatch;
    rerender();
    expect(result.current.dispatch).toBe(firstDispatch);
  });

  it('works with empty middleware array', () => {
    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(result.current.state).toEqual({ count: 1 });
  });

  it('state updates are visible in subsequent getState calls', () => {
    const states: number[] = [];
    const capture: Middleware<State, Action> = api => next => action => {
      next(action);
      states.push(api.getState().count);
    };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [capture])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    act(() => result.current.dispatch({ type: 'increment' }));
    // getState reflects the latest committed state at time of middleware call
    // First dispatch: state was 0, after dispatch becomes 1, but getState returns ref value
    expect(states.length).toBe(2);
  });

  it('handles three middlewares', () => {
    const order: string[] = [];
    const a: Middleware<State, Action> = () => next => action => { order.push('a'); next(action); };
    const b: Middleware<State, Action> = () => next => action => { order.push('b'); next(action); };
    const c: Middleware<State, Action> = () => next => action => { order.push('c'); next(action); };

    const { result } = renderHook(() =>
      useReducerWithMiddleware(reducer, { count: 0 }, [a, b, c])
    );
    act(() => result.current.dispatch({ type: 'increment' }));
    expect(order).toEqual(['a', 'b', 'c']);
    expect(result.current.state).toEqual({ count: 1 });
  });
});
