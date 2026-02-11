import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

// Mock WebSocket
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  url: string;
  protocol: string;
  protocols: string | string[] | undefined;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  bufferedAmount = 0;
  extensions = '';
  binaryType: BinaryType = 'blob';

  sentMessages: (string | ArrayBufferLike | Blob | ArrayBufferView)[] = [];
  closeCalled = false;
  closeCode?: number;
  closeReason?: string;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = typeof url === 'string' ? url : url.toString();
    this.protocols = protocols;
    this.protocol = Array.isArray(protocols) ? protocols[0] || '' : protocols || '';
    instances.push(this);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string): void {
    this.closeCalled = true;
    this.closeCode = code;
    this.closeReason = reason;
    this.readyState = MockWebSocket.CLOSED;
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }

  // Helper to simulate events
  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  simulateClose(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }

  simulateError(): void {
    this.onerror?.(new Event('error'));
  }

  simulateMessage(data: string): void {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
}

let instances: MockWebSocket[] = [];

beforeEach(() => {
  instances = [];
  vi.useFakeTimers();
  (globalThis as Record<string, unknown>).WebSocket = MockWebSocket as unknown as typeof WebSocket;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function getLastInstance(): MockWebSocket {
  return instances[instances.length - 1];
}

describe('useWebSocket', () => {
  it('starts disconnected when url is null', () => {
    const { result } = renderHook(() => useWebSocket(null));
    expect(result.current.status).toBe('disconnected');
    expect(instances.length).toBe(0);
  });

  it('connects when url is provided', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    expect(result.current.status).toBe('connecting');
    expect(instances.length).toBe(1);
    expect(getLastInstance().url).toBe('ws://localhost');
  });

  it('sets status to connected on open', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    expect(result.current.status).toBe('connected');
  });

  it('sets status to disconnected on close', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    act(() => getLastInstance().simulateClose());
    expect(result.current.status).toBe('disconnected');
  });

  it('sets status to error on error', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateError());
    expect(result.current.status).toBe('error');
  });

  it('stores last message', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    act(() => getLastInstance().simulateMessage('hello'));
    expect(result.current.lastMessage).not.toBeNull();
    expect(result.current.lastMessage?.data).toBe('hello');
  });

  it('sends data through WebSocket', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    act(() => result.current.send('test'));
    expect(getLastInstance().sentMessages).toEqual(['test']);
  });

  it('does not send when not connected', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    // readyState is CONNECTING, not OPEN
    act(() => result.current.send('test'));
    expect(getLastInstance().sentMessages).toEqual([]);
  });

  it('calls onOpen callback', () => {
    const onOpen = vi.fn();
    renderHook(() => useWebSocket('ws://localhost', { onOpen }));
    act(() => getLastInstance().simulateOpen());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onClose callback', () => {
    const onClose = vi.fn();
    renderHook(() => useWebSocket('ws://localhost', { onClose }));
    act(() => getLastInstance().simulateOpen());
    act(() => getLastInstance().simulateClose(1000, 'normal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    renderHook(() => useWebSocket('ws://localhost', { onError }));
    act(() => getLastInstance().simulateError());
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls onMessage callback', () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket('ws://localhost', { onMessage }));
    act(() => getLastInstance().simulateOpen());
    act(() => getLastInstance().simulateMessage('data'));
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage.mock.calls[0][0].data).toBe('data');
  });

  it('disconnects manually', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    act(() => result.current.disconnect(1000, 'bye'));
    expect(result.current.status).toBe('disconnected');
    expect(instances[0].closeCalled).toBe(true);
  });

  it('disconnect passes code and reason', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost'));
    act(() => getLastInstance().simulateOpen());
    const ws = getLastInstance();
    act(() => result.current.disconnect(4000, 'custom'));
    expect(ws.closeCode).toBe(4000);
    expect(ws.closeReason).toBe('custom');
  });

  it('reconnects after close when reconnect is true', () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost', { reconnect: true, reconnectInterval: 1000, reconnectAttempts: 3 })
    );
    act(() => getLastInstance().simulateOpen());
    act(() => getLastInstance().simulateClose());
    expect(result.current.status).toBe('disconnected');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.reconnectCount).toBe(1);
    expect(instances.length).toBe(2);
  });

  it('stops reconnecting after max attempts', () => {
    renderHook(() =>
      useWebSocket('ws://localhost', { reconnect: true, reconnectInterval: 100, reconnectAttempts: 2 })
    );
    // Close 1
    act(() => getLastInstance().simulateClose());
    act(() => { vi.advanceTimersByTime(100); });
    expect(instances.length).toBe(2);
    // Close 2
    act(() => getLastInstance().simulateClose());
    act(() => { vi.advanceTimersByTime(100); });
    expect(instances.length).toBe(3);
    // Close 3 - no more reconnect
    act(() => getLastInstance().simulateClose());
    act(() => { vi.advanceTimersByTime(100); });
    expect(instances.length).toBe(3);
  });

  it('resets reconnect count on successful connect', () => {
    const { result } = renderHook(() =>
      useWebSocket('ws://localhost', { reconnect: true, reconnectInterval: 100, reconnectAttempts: 5 })
    );
    act(() => getLastInstance().simulateClose());
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.reconnectCount).toBe(1);
    act(() => getLastInstance().simulateOpen());
    expect(result.current.reconnectCount).toBe(0);
  });

  it('passes protocols to WebSocket constructor', () => {
    renderHook(() => useWebSocket('ws://localhost', { protocols: 'graphql-ws' }));
    expect(getLastInstance().protocols).toBe('graphql-ws');
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket('ws://localhost'));
    const ws = getLastInstance();
    unmount();
    expect(ws.closeCalled).toBe(true);
  });

  it('reconnects on url change', () => {
    const { rerender } = renderHook(
      ({ url }) => useWebSocket(url),
      { initialProps: { url: 'ws://localhost:1' } }
    );
    expect(instances.length).toBe(1);
    rerender({ url: 'ws://localhost:2' });
    expect(instances.length).toBe(2);
    expect(getLastInstance().url).toBe('ws://localhost:2');
  });

  it('returns stable send reference', () => {
    const { result, rerender } = renderHook(() => useWebSocket('ws://localhost'));
    const firstSend = result.current.send;
    rerender();
    expect(result.current.send).toBe(firstSend);
  });
});
