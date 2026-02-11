export type StateHandler<TContext> = {
  onEnter?: (context: TContext) => void;
  onExit?: (context: TContext) => void;
};

export type TransitionConfig<TState extends string, TContext> = {
  target: TState;
  guard?: (context: TContext) => boolean;
  action?: (context: TContext) => void;
};

export type StateConfig<TState extends string, TEvent extends string, TContext> = {
  on?: Partial<Record<TEvent, TransitionConfig<TState, TContext> | TState>>;
} & StateHandler<TContext>;

export type MachineConfig<TState extends string, TEvent extends string, TContext> = {
  initial: TState;
  context: TContext;
  states: Record<TState, StateConfig<TState, TEvent, TContext>>;
};

export type TransitionListener<TState extends string, TEvent extends string> = (
  from: TState,
  to: TState,
  event: TEvent
) => void;

export class FiniteStateMachine<
  TState extends string,
  TEvent extends string,
  TContext = Record<string, never>
> {
  private currentState: TState;
  private context: TContext;
  private config: MachineConfig<TState, TEvent, TContext>;
  private listeners: Set<TransitionListener<TState, TEvent>> = new Set();
  private history: TState[] = [];

  constructor(config: MachineConfig<TState, TEvent, TContext>) {
    this.config = config;
    this.currentState = config.initial;
    this.context = { ...config.context };
    this.history.push(config.initial);

    const initialState = config.states[config.initial];
    if (initialState?.onEnter) {
      initialState.onEnter(this.context);
    }
  }

  get state(): TState {
    return this.currentState;
  }

  getContext(): TContext {
    return { ...this.context };
  }

  getHistory(): TState[] {
    return [...this.history];
  }

  send(event: TEvent): boolean {
    const stateConfig = this.config.states[this.currentState];
    if (!stateConfig?.on) return false;

    const transition = stateConfig.on[event];
    if (!transition) return false;

    let target: TState;
    let guard: ((context: TContext) => boolean) | undefined;
    let action: ((context: TContext) => void) | undefined;

    if (typeof transition === 'string') {
      target = transition;
    } else {
      target = transition.target;
      guard = transition.guard;
      action = transition.action;
    }

    if (guard && !guard(this.context)) {
      return false;
    }

    const fromState = this.currentState;

    if (stateConfig.onExit) {
      stateConfig.onExit(this.context);
    }

    if (action) {
      action(this.context);
    }

    this.currentState = target;
    this.history.push(target);

    const targetConfig = this.config.states[target];
    if (targetConfig?.onEnter) {
      targetConfig.onEnter(this.context);
    }

    for (const listener of this.listeners) {
      listener(fromState, target, event);
    }

    return true;
  }

  can(event: TEvent): boolean {
    const stateConfig = this.config.states[this.currentState];
    if (!stateConfig?.on) return false;

    const transition = stateConfig.on[event];
    if (!transition) return false;

    if (typeof transition !== 'string' && transition.guard) {
      return transition.guard(this.context);
    }

    return true;
  }

  getAvailableEvents(): TEvent[] {
    const stateConfig = this.config.states[this.currentState];
    if (!stateConfig?.on) return [];

    return Object.keys(stateConfig.on) as TEvent[];
  }

  onTransition(listener: TransitionListener<TState, TEvent>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  matches(state: TState): boolean {
    return this.currentState === state;
  }

  reset(): void {
    const oldState = this.currentState;
    const oldConfig = this.config.states[oldState];
    if (oldConfig?.onExit) {
      oldConfig.onExit(this.context);
    }

    this.currentState = this.config.initial;
    this.context = { ...this.config.context };
    this.history = [this.config.initial];

    const initialConfig = this.config.states[this.config.initial];
    if (initialConfig?.onEnter) {
      initialConfig.onEnter(this.context);
    }
  }
}
