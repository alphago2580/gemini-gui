import { createEventBus } from './eventBusUtils';

type TestEvents = {
  message: string;
  count: number;
  data: { id: number; name: string };
  empty: undefined;
};

describe('eventBusUtils', () => {
  describe('createEventBus', () => {
    it('creates an event bus with all methods', () => {
      const bus = createEventBus<TestEvents>();
      expect(typeof bus.on).toBe('function');
      expect(typeof bus.off).toBe('function');
      expect(typeof bus.emit).toBe('function');
      expect(typeof bus.once).toBe('function');
      expect(typeof bus.clear).toBe('function');
      expect(typeof bus.listenerCount).toBe('function');
      expect(typeof bus.hasListeners).toBe('function');
    });
  });

  describe('on and emit', () => {
    it('calls listener when event is emitted', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('message', fn);
      bus.emit('message', 'hello');
      expect(fn).toHaveBeenCalledWith('hello');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('calls multiple listeners for the same event', () => {
      const bus = createEventBus<TestEvents>();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      bus.on('count', fn1);
      bus.on('count', fn2);
      bus.emit('count', 42);
      expect(fn1).toHaveBeenCalledWith(42);
      expect(fn2).toHaveBeenCalledWith(42);
    });

    it('does not call listeners of other events', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('message', fn);
      bus.emit('count', 1);
      expect(fn).not.toHaveBeenCalled();
    });

    it('passes complex data to listener', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('data', fn);
      bus.emit('data', { id: 1, name: 'test' });
      expect(fn).toHaveBeenCalledWith({ id: 1, name: 'test' });
    });

    it('calls listener on every emit', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('count', fn);
      bus.emit('count', 1);
      bus.emit('count', 2);
      bus.emit('count', 3);
      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn).toHaveBeenNthCalledWith(1, 1);
      expect(fn).toHaveBeenNthCalledWith(2, 2);
      expect(fn).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe('on returns unsubscribe', () => {
    it('returns an unsubscribe function', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      const unsub = bus.on('message', fn);
      expect(typeof unsub).toBe('function');
      unsub();
      bus.emit('message', 'after');
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('removes a specific listener', () => {
      const bus = createEventBus<TestEvents>();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      bus.on('count', fn1);
      bus.on('count', fn2);
      bus.off('count', fn1);
      bus.emit('count', 10);
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).toHaveBeenCalledWith(10);
    });

    it('does nothing when removing non-existent listener', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      expect(() => bus.off('message', fn)).not.toThrow();
    });

    it('does nothing when removing from event with no listeners', () => {
      const bus = createEventBus<TestEvents>();
      expect(() => bus.off('count', vi.fn())).not.toThrow();
    });
  });

  describe('once', () => {
    it('calls listener only once', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.once('message', fn);
      bus.emit('message', 'first');
      bus.emit('message', 'second');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');
    });

    it('returns an unsubscribe function', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      const unsub = bus.once('count', fn);
      unsub();
      bus.emit('count', 99);
      expect(fn).not.toHaveBeenCalled();
    });

    it('does not affect other listeners', () => {
      const bus = createEventBus<TestEvents>();
      const onceFn = vi.fn();
      const regularFn = vi.fn();
      bus.once('count', onceFn);
      bus.on('count', regularFn);
      bus.emit('count', 1);
      bus.emit('count', 2);
      expect(onceFn).toHaveBeenCalledTimes(1);
      expect(regularFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('clear', () => {
    it('clears all listeners for a specific event', () => {
      const bus = createEventBus<TestEvents>();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      bus.on('message', fn1);
      bus.on('message', fn2);
      bus.clear('message');
      bus.emit('message', 'test');
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });

    it('does not affect other events when clearing one', () => {
      const bus = createEventBus<TestEvents>();
      const msgFn = vi.fn();
      const countFn = vi.fn();
      bus.on('message', msgFn);
      bus.on('count', countFn);
      bus.clear('message');
      bus.emit('count', 5);
      expect(countFn).toHaveBeenCalledWith(5);
    });

    it('clears all events when called without argument', () => {
      const bus = createEventBus<TestEvents>();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      bus.on('message', fn1);
      bus.on('count', fn2);
      bus.clear();
      bus.emit('message', 'test');
      bus.emit('count', 1);
      expect(fn1).not.toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('returns 0 for event with no listeners', () => {
      const bus = createEventBus<TestEvents>();
      expect(bus.listenerCount('message')).toBe(0);
    });

    it('returns correct count', () => {
      const bus = createEventBus<TestEvents>();
      bus.on('count', vi.fn());
      bus.on('count', vi.fn());
      bus.on('count', vi.fn());
      expect(bus.listenerCount('count')).toBe(3);
    });

    it('decreases after off', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('message', fn);
      bus.on('message', vi.fn());
      expect(bus.listenerCount('message')).toBe(2);
      bus.off('message', fn);
      expect(bus.listenerCount('message')).toBe(1);
    });
  });

  describe('hasListeners', () => {
    it('returns false when no listeners', () => {
      const bus = createEventBus<TestEvents>();
      expect(bus.hasListeners('message')).toBe(false);
    });

    it('returns true when listeners exist', () => {
      const bus = createEventBus<TestEvents>();
      bus.on('message', vi.fn());
      expect(bus.hasListeners('message')).toBe(true);
    });

    it('returns false after all listeners removed', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('count', fn);
      bus.off('count', fn);
      expect(bus.hasListeners('count')).toBe(false);
    });
  });

  describe('emit with no listeners', () => {
    it('does not throw when emitting to event with no listeners', () => {
      const bus = createEventBus<TestEvents>();
      expect(() => bus.emit('message', 'test')).not.toThrow();
    });
  });

  describe('listener removal during emit', () => {
    it('handles listener removing itself during emit', () => {
      const bus = createEventBus<TestEvents>();
      const fn2 = vi.fn();
      const fn1 = vi.fn(() => {
        bus.off('count', fn1);
      });
      bus.on('count', fn1);
      bus.on('count', fn2);
      bus.emit('count', 1);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('undefined event data', () => {
    it('handles events with undefined data', () => {
      const bus = createEventBus<TestEvents>();
      const fn = vi.fn();
      bus.on('empty', fn);
      bus.emit('empty', undefined);
      expect(fn).toHaveBeenCalledWith(undefined);
    });
  });
});
