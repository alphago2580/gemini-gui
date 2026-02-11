import { describe, it, expect, vi } from 'vitest';
import { FiniteStateMachine } from './finiteStateMachineUtils';

type LightState = 'red' | 'yellow' | 'green';
type LightEvent = 'NEXT' | 'RESET';

const trafficLightConfig = {
  initial: 'red' as LightState,
  context: {},
  states: {
    red: { on: { NEXT: 'green' as LightState, RESET: 'red' as LightState } },
    yellow: { on: { NEXT: 'red' as LightState, RESET: 'red' as LightState } },
    green: { on: { NEXT: 'yellow' as LightState, RESET: 'red' as LightState } },
  },
};

describe('FiniteStateMachine', () => {
  it('starts in initial state', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    expect(fsm.state).toBe('red');
  });

  it('transitions on event', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const result = fsm.send('NEXT');
    expect(result).toBe(true);
    expect(fsm.state).toBe('green');
  });

  it('follows full cycle', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    fsm.send('NEXT');
    expect(fsm.state).toBe('green');
    fsm.send('NEXT');
    expect(fsm.state).toBe('yellow');
    fsm.send('NEXT');
    expect(fsm.state).toBe('red');
  });

  it('returns false for unknown event', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const result = fsm.send('UNKNOWN' as LightEvent);
    expect(result).toBe(false);
    expect(fsm.state).toBe('red');
  });

  it('matches state', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    expect(fsm.matches('red')).toBe(true);
    expect(fsm.matches('green')).toBe(false);
  });

  it('reports available events', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const events = fsm.getAvailableEvents();
    expect(events).toContain('NEXT');
    expect(events).toContain('RESET');
  });

  it('can check event availability', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    expect(fsm.can('NEXT')).toBe(true);
  });

  it('tracks history', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    fsm.send('NEXT');
    fsm.send('NEXT');
    expect(fsm.getHistory()).toEqual(['red', 'green', 'yellow']);
  });

  it('resets to initial state', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    fsm.send('NEXT');
    fsm.send('NEXT');
    fsm.reset();
    expect(fsm.state).toBe('red');
    expect(fsm.getHistory()).toEqual(['red']);
  });

  it('fires transition listeners', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const listener = vi.fn();
    fsm.onTransition(listener);

    fsm.send('NEXT');
    expect(listener).toHaveBeenCalledWith('red', 'green', 'NEXT');
  });

  it('removes transition listeners', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const listener = vi.fn();
    const unsub = fsm.onTransition(listener);

    fsm.send('NEXT');
    unsub();
    fsm.send('NEXT');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe('guards', () => {
    type DoorState = 'locked' | 'unlocked' | 'open';
    type DoorEvent = 'UNLOCK' | 'OPEN' | 'CLOSE' | 'LOCK';
    type DoorContext = { hasKey: boolean };

    const doorConfig = {
      initial: 'locked' as DoorState,
      context: { hasKey: false } as DoorContext,
      states: {
        locked: {
          on: {
            UNLOCK: {
              target: 'unlocked' as DoorState,
              guard: (ctx: DoorContext) => ctx.hasKey,
            },
          },
        },
        unlocked: {
          on: {
            OPEN: 'open' as DoorState,
            LOCK: 'locked' as DoorState,
          },
        },
        open: {
          on: {
            CLOSE: 'unlocked' as DoorState,
          },
        },
      },
    };

    it('blocks transition when guard fails', () => {
      const fsm = new FiniteStateMachine<DoorState, DoorEvent, DoorContext>(doorConfig);
      const result = fsm.send('UNLOCK');
      expect(result).toBe(false);
      expect(fsm.state).toBe('locked');
    });

    it('can reports guard check', () => {
      const fsm = new FiniteStateMachine<DoorState, DoorEvent, DoorContext>(doorConfig);
      expect(fsm.can('UNLOCK')).toBe(false);
    });

    it('allows transition when guard passes', () => {
      const config = {
        ...doorConfig,
        context: { hasKey: true },
      };
      const fsm = new FiniteStateMachine<DoorState, DoorEvent, DoorContext>(config);
      const result = fsm.send('UNLOCK');
      expect(result).toBe(true);
      expect(fsm.state).toBe('unlocked');
    });
  });

  describe('actions and handlers', () => {
    type CountState = 'idle' | 'counting';
    type CountEvent = 'START' | 'INCREMENT' | 'STOP';
    type CountContext = { count: number; entered: boolean };

    it('executes transition actions', () => {
      const fsm = new FiniteStateMachine<CountState, CountEvent, CountContext>({
        initial: 'idle',
        context: { count: 0, entered: false },
        states: {
          idle: {
            on: {
              START: {
                target: 'counting',
                action: (ctx) => { ctx.count = 1; },
              },
            },
          },
          counting: {
            on: {
              INCREMENT: {
                target: 'counting',
                action: (ctx) => { ctx.count++; },
              },
              STOP: 'idle',
            },
          },
        },
      });

      fsm.send('START');
      expect(fsm.getContext().count).toBe(1);

      fsm.send('INCREMENT');
      expect(fsm.getContext().count).toBe(2);
    });

    it('calls onEnter and onExit handlers', () => {
      const onEnter = vi.fn();
      const onExit = vi.fn();

      const fsm = new FiniteStateMachine<CountState, CountEvent, CountContext>({
        initial: 'idle',
        context: { count: 0, entered: false },
        states: {
          idle: {
            onEnter,
            onExit,
            on: { START: 'counting' },
          },
          counting: {
            on: { STOP: 'idle' },
          },
        },
      });

      expect(onEnter).toHaveBeenCalledTimes(1); // initial entry
      fsm.send('START');
      expect(onExit).toHaveBeenCalledTimes(1);

      fsm.send('STOP');
      expect(onEnter).toHaveBeenCalledTimes(2);
    });

    it('getContext returns copy', () => {
      const fsm = new FiniteStateMachine<CountState, CountEvent, CountContext>({
        initial: 'idle',
        context: { count: 0, entered: false },
        states: {
          idle: { on: { START: 'counting' } },
          counting: { on: { STOP: 'idle' } },
        },
      });

      const ctx = fsm.getContext();
      ctx.count = 999;
      expect(fsm.getContext().count).toBe(0);
    });
  });

  it('getHistory returns copy', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent>(trafficLightConfig);
    const history = fsm.getHistory();
    history.push('green');
    expect(fsm.getHistory()).toEqual(['red']);
  });

  it('handles state with no transitions', () => {
    type EndState = 'start' | 'end';
    type EndEvent = 'GO';

    const fsm = new FiniteStateMachine<EndState, EndEvent>({
      initial: 'start',
      context: {},
      states: {
        start: { on: { GO: 'end' } },
        end: {},
      },
    });

    fsm.send('GO');
    expect(fsm.state).toBe('end');
    expect(fsm.send('GO')).toBe(false);
    expect(fsm.getAvailableEvents()).toEqual([]);
  });
});
