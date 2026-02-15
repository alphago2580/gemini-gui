import { renderHook, act, waitFor } from '@testing-library/react';
import { useScreenWakeLock } from './useScreenWakeLock';

let mockWakeLockRequest: ReturnType<typeof vi.fn>;
let mockSentinel: {
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  released: boolean;
  releaseHandler: (() => void) | null;
};

function createMockSentinel() {
  const sentinel = {
    release: vi.fn(async () => {
      sentinel.released = true;
      sentinel.releaseHandler?.();
    }),
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === 'release') {
        sentinel.releaseHandler = handler;
      }
    }),
    removeEventListener: vi.fn(),
    released: false,
    releaseHandler: null as (() => void) | null,
  };
  return sentinel;
}

function setupWakeLockAPI() {
  mockSentinel = createMockSentinel();
  mockWakeLockRequest = vi.fn(async () => mockSentinel);

  Object.defineProperty(navigator, 'wakeLock', {
    value: { request: mockWakeLockRequest },
    configurable: true,
    writable: true,
  });
}

function removeWakeLockAPI() {
  if ('wakeLock' in navigator) {
    delete (navigator as unknown as Record<string, unknown>).wakeLock;
  }
}

beforeEach(() => {
  setupWakeLockAPI();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useScreenWakeLock', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useScreenWakeLock());
    expect(result.current.isActive).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('requests wake lock', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
    expect(result.current.isActive).toBe(true);
  });

  it('releases wake lock', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(mockSentinel.release).toHaveBeenCalled();
    expect(result.current.isActive).toBe(false);
  });

  it('calls onAcquire callback', async () => {
    const onAcquire = vi.fn();
    const { result } = renderHook(() => useScreenWakeLock({ onAcquire }));

    await act(async () => {
      await result.current.request();
    });

    expect(onAcquire).toHaveBeenCalledTimes(1);
  });

  it('calls onRelease callback', async () => {
    const onRelease = vi.fn();
    const { result } = renderHook(() => useScreenWakeLock({ onRelease }));

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('handles request error', async () => {
    mockWakeLockRequest.mockRejectedValue(new Error('Permission denied'));
    const onError = vi.fn();
    const { result } = renderHook(() => useScreenWakeLock({ onError }));

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.error?.message).toBe('Permission denied');
    expect(onError).toHaveBeenCalled();
  });

  it('auto-requests on mount', async () => {
    renderHook(() => useScreenWakeLock({ autoRequest: true }));

    await waitFor(() => {
      expect(mockWakeLockRequest).toHaveBeenCalled();
    });
  });

  it('reports unsupported when API unavailable', () => {
    removeWakeLockAPI();

    const { result } = renderHook(() => useScreenWakeLock());
    expect(result.current.isSupported).toBe(false);

    setupWakeLockAPI();
  });

  it('handles request when unsupported', async () => {
    removeWakeLockAPI();
    const onError = vi.fn();

    const { result } = renderHook(() => useScreenWakeLock({ onError }));

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.error?.message).toBe('Screen Wake Lock API is not supported');
    expect(onError).toHaveBeenCalled();

    setupWakeLockAPI();
  });

  it('release does nothing when no active lock', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('listens for sentinel release event', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(mockSentinel.addEventListener).toHaveBeenCalledWith('release', expect.any(Function));
  });

  it('clears error on successful request', async () => {
    mockWakeLockRequest.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.request();
    });
    expect(result.current.error).not.toBeNull();

    mockWakeLockRequest.mockResolvedValue(createMockSentinel());
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.error).toBeNull();
  });

  it('removes release event listener on unmount', async () => {
    const { result, unmount } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.request();
    });

    const handler = mockSentinel.addEventListener.mock.calls.find(
      (call) => call[0] === 'release'
    )?.[1];

    unmount();

    expect(mockSentinel.removeEventListener).toHaveBeenCalledWith('release', handler);
  });
});
