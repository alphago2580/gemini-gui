type Listener<T> = (data: T) => void;

export interface EventBus<EventMap extends Record<string, unknown>> {
  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void;
  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void;
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
  once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void;
  clear<K extends keyof EventMap>(event?: K): void;
  listenerCount<K extends keyof EventMap>(event: K): number;
  hasListeners<K extends keyof EventMap>(event: K): boolean;
}

export function createEventBus<EventMap extends Record<string, unknown>>(): EventBus<EventMap> {
  const listeners = new Map<keyof EventMap, Set<Listener<unknown>>>();

  function getListeners<K extends keyof EventMap>(event: K): Set<Listener<unknown>> {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    return set;
  }

  function on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    const set = getListeners(event);
    set.add(listener as Listener<unknown>);
    return () => off(event, listener);
  }

  function off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    const set = listeners.get(event);
    if (set) {
      set.delete(listener as Listener<unknown>);
      if (set.size === 0) {
        listeners.delete(event);
      }
    }
  }

  function emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const set = listeners.get(event);
    if (set) {
      for (const listener of [...set]) {
        listener(data);
      }
    }
  }

  function once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    const wrapper = ((data: EventMap[K]) => {
      off(event, wrapper as Listener<EventMap[K]>);
      listener(data);
    }) as Listener<EventMap[K]>;
    return on(event, wrapper);
  }

  function clear<K extends keyof EventMap>(event?: K): void {
    if (event !== undefined) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  }

  function listenerCount<K extends keyof EventMap>(event: K): number {
    const set = listeners.get(event);
    return set ? set.size : 0;
  }

  function hasListeners<K extends keyof EventMap>(event: K): boolean {
    return listenerCount(event) > 0;
  }

  return { on, off, emit, once, clear, listenerCount, hasListeners };
}
