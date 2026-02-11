import { useReducer, useCallback, useRef, Reducer } from 'react';

export type MiddlewareAPI<S, A> = {
  getState: () => S;
  dispatch: (action: A) => void;
};

export type Middleware<S, A> = (
  api: MiddlewareAPI<S, A>
) => (next: (action: A) => void) => (action: A) => void;

export interface ReducerWithMiddlewareResult<S, A> {
  state: S;
  dispatch: (action: A) => void;
}

export function useReducerWithMiddleware<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
): ReducerWithMiddlewareResult<S, A> {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const middlewaresRef = useRef(middlewares);
  middlewaresRef.current = middlewares;

  const dispatch = useCallback((action: A) => {
    const api: MiddlewareAPI<S, A> = {
      getState: () => stateRef.current,
      dispatch: (a: A) => dispatch(a),
    };

    const chain = middlewaresRef.current.map(mw => mw(api));
    const composedDispatch = chain.reduceRight(
      (next, mw) => mw(next),
      rawDispatch as (action: A) => void
    );

    composedDispatch(action);
  }, [rawDispatch]);

  return { state, dispatch };
}
