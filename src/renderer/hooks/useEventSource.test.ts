import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventSource } from './useEventSource';

interface MockEventSource {
  url: string;
  withCredentials: boolean;
  onopen: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  close: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  readyState: number;
  CONNECTING: 0;
  OPEN: 1;
  CLOSED: 2;
}

let mockInstances: MockEventSource[];

function createMockEventSourceClass() {
  return class MockES {
    url: string;
    withCredentials: boolean;
    onopen: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    close = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    readyState = 0;
    CONNECTING = 0 as const;
    OPEN = 1 as const;
    CLOSED = 2 as const;

    constructor(url: string, init?: { withCredentials?: boolean }) {
      this.url = url;
      this.withCredentials = init?.withCredentials ?? false;
      mockInstances.push(this as unknown as MockEventSource);
    }
  };
}

beforeEach(() => {
  mockInstances = [];
  vi.useFakeTimers();
  (globalThis as Record<string, unknown>).EventSource = createMockEventSourceClass();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function getLastInstance(): MockEventSource {
  return mockInstances[mockInstances.length - 1];
}

function simulateOpen(instance: MockEventSource) {
  instance.readyState = 1;
  instance.onopen?.(new Event('open'));
}

function simulateError(instance: MockEventSource) {
  instance.readyState = 2;
  instance.onerror?.(new Event('error'));
}

function simulateMessage(instance: MockEventSource, data: string) {
  const event = new MessageEvent('message', { data });
  instance.onmessage?.(event);
}

describe('useEventSource', () => {
  it('returns closed status when url is undefined', () => {
    const { result } = renderHook(() => useEventSource(undefined));

    expect(result.current.status).toBe('closed');
    expect(result.current.lastMessage).toBeNull();
    expect(result.current.lastEventData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('connects when url is provided', () => {
    renderHook(() => useEventSource('http://localhost/events'));

    expect(mockInstances).toHaveLength(1);
    expect(getLastInstance().url).toBe('http://localhost/events');
  });

  it('sets connecting status initially', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));

    expect(result.current.status).toBe('connecting');
  });

  it('sets open status on successful connection', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));
    const instance = getLastInstance();

    act(() => {
      simulateOpen(instance);
    });

    expect(result.current.status).toBe('open');
  });

  it('sets error status on error', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));
    const instance = getLastInstance();

    act(() => {
      simulateError(instance);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).not.toBeNull();
  });

  it('receives messages', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));
    const instance = getLastInstance();

    act(() => {
      simulateOpen(instance);
    });

    act(() => {
      simulateMessage(instance, '{"hello":"world"}');
    });

    expect(result.current.lastEventData).toBe('{"hello":"world"}');
    expect(result.current.lastMessage).not.toBeNull();
  });

  it('calls onOpen callback', () => {
    const onOpen = vi.fn();
    renderHook(() =>
      useEventSource('http://localhost/events', { onOpen })
    );
    const instance = getLastInstance();

    act(() => {
      simulateOpen(instance);
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    renderHook(() =>
      useEventSource('http://localhost/events', { onError })
    );
    const instance = getLastInstance();

    act(() => {
      simulateError(instance);
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls onMessage callback', () => {
    const onMessage = vi.fn();
    renderHook(() =>
      useEventSource('http://localhost/events', { onMessage })
    );
    const instance = getLastInstance();

    act(() => {
      simulateOpen(instance);
      simulateMessage(instance, 'test');
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
  });

  it('closes connection with close()', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));
    const instance = getLastInstance();

    act(() => {
      simulateOpen(instance);
    });

    act(() => {
      result.current.close();
    });

    expect(instance.close).toHaveBeenCalled();
    expect(result.current.status).toBe('closed');
  });

  it('reopens connection with open()', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));

    act(() => {
      result.current.close();
    });

    act(() => {
      result.current.open();
    });

    expect(mockInstances.length).toBeGreaterThan(1);
  });

  it('passes withCredentials option', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', { withCredentials: true })
    );
    const instance = getLastInstance();

    expect(instance.withCredentials).toBe(true);
  });

  it('registers custom event listeners', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', { events: ['status', 'data'] })
    );
    const instance = getLastInstance();

    expect(instance.addEventListener).toHaveBeenCalledWith('status', expect.any(Function));
    expect(instance.addEventListener).toHaveBeenCalledWith('data', expect.any(Function));
  });

  it('closes on unmount', () => {
    const { unmount } = renderHook(() => useEventSource('http://localhost/events'));
    const instance = getLastInstance();

    unmount();

    expect(instance.close).toHaveBeenCalled();
  });

  it('auto-reconnects on error when enabled', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', {
        autoReconnect: true,
        reconnectInterval: 1000,
      })
    );
    const instance = getLastInstance();
    const initialCount = mockInstances.length;

    act(() => {
      simulateError(instance);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockInstances.length).toBeGreaterThan(initialCount);
  });

  it('does not auto-reconnect when disabled', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', { autoReconnect: false })
    );
    const instance = getLastInstance();
    const count = mockInstances.length;

    act(() => {
      simulateError(instance);
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockInstances).toHaveLength(count);
  });

  it('stops reconnecting after max attempts', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', {
        autoReconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 2,
      })
    );

    // First error + reconnect
    act(() => {
      simulateError(getLastInstance());
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const countAfterFirst = mockInstances.length;

    // Second error + reconnect
    act(() => {
      simulateError(getLastInstance());
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const countAfterSecond = mockInstances.length;

    // Third error — should NOT reconnect (max 2)
    act(() => {
      simulateError(getLastInstance());
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockInstances.length).toBe(countAfterSecond);
    expect(countAfterSecond).toBeGreaterThan(countAfterFirst);
  });

  it('resets reconnect attempts on successful connection', () => {
    renderHook(() =>
      useEventSource('http://localhost/events', {
        autoReconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 2,
      })
    );

    // First error + reconnect
    act(() => {
      simulateError(getLastInstance());
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Open successfully — resets counter
    act(() => {
      simulateOpen(getLastInstance());
    });

    // Error again — should reconnect (counter was reset)
    const countBefore = mockInstances.length;
    act(() => {
      simulateError(getLastInstance());
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockInstances.length).toBeGreaterThan(countBefore);
  });

  it('does not reconnect after manual close', () => {
    const { result } = renderHook(() =>
      useEventSource('http://localhost/events', {
        autoReconnect: true,
        reconnectInterval: 100,
      })
    );

    act(() => {
      result.current.close();
    });

    const countAfterClose = mockInstances.length;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockInstances.length).toBe(countAfterClose);
  });

  it('uses latest callback references', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { rerender } = renderHook(
      ({ onMessage }) => useEventSource('http://localhost/events', { onMessage }),
      { initialProps: { onMessage: cb1 } }
    );

    rerender({ onMessage: cb2 });

    const instance = getLastInstance();
    act(() => {
      simulateMessage(instance, 'test');
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useEventSource('http://localhost/events'));

    expect(result.current).toHaveProperty('status');
    expect(result.current).toHaveProperty('lastMessage');
    expect(result.current).toHaveProperty('lastEventData');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('close');
    expect(result.current).toHaveProperty('open');
  });

  it('clears error on successful reconnect', () => {
    const { result } = renderHook(() =>
      useEventSource('http://localhost/events', {
        autoReconnect: true,
        reconnectInterval: 100,
      })
    );

    act(() => {
      simulateError(getLastInstance());
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      simulateOpen(getLastInstance());
    });

    expect(result.current.error).toBeNull();
    expect(result.current.status).toBe('open');
  });
});
