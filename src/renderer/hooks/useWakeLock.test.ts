import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

let mockRelease: ReturnType<typeof vi.fn>;
let mockSentinel: { release: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; released: boolean; type: string };
let releaseListener: (() => void) | null;

beforeEach(() => {
  releaseListener = null;
  mockRelease = vi.fn().mockResolvedValue(undefined);
  mockSentinel = {
    release: mockRelease,
    addEventListener: vi.fn((event: string, cb: () => void) => {
      if (event === 'release') releaseListener = cb;
    }),
    released: false,
    type: 'screen',
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  // Clean up navigator.wakeLock mock
  if ('wakeLock' in navigator) {
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
});

function setupWakeLockSupported() {
  Object.defineProperty(navigator, 'wakeLock', {
    value: {
      request: vi.fn().mockResolvedValue(mockSentinel),
    },
    writable: true,
    configurable: true,
  });
}

function setupWakeLockUnsupported() {
  // Must delete the property so 'wakeLock' in navigator returns false
  if ('wakeLock' in navigator) {
    delete (navigator as unknown as Record<string, unknown>)['wakeLock'];
  }
}

describe('useWakeLock', () => {
  it('returns initial state', () => {
    setupWakeLockUnsupported();
    const { result } = renderHook(() => useWakeLock());

    expect(result.current.isActive).toBe(false);
    expect(result.current.type).toBeNull();
  });

  it('detects support when wakeLock API is available', () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    expect(result.current.isSupported).toBe(true);
  });

  it('detects no support when wakeLock API is unavailable', () => {
    setupWakeLockUnsupported();
    const { result } = renderHook(() => useWakeLock());

    expect(result.current.isSupported).toBe(false);
  });

  it('requests wake lock successfully', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.type).toBe('screen');
    expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
  });

  it('releases wake lock successfully', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.type).toBeNull();
    expect(mockRelease).toHaveBeenCalled();
  });

  it('handles release event from sentinel', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);

    // Simulate the browser releasing the wake lock
    act(() => {
      if (releaseListener) releaseListener();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.type).toBeNull();
  });

  it('does nothing when requesting without support', async () => {
    setupWakeLockUnsupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('does nothing when releasing without active lock', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('handles request error gracefully', async () => {
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('releases wake lock on unmount', async () => {
    setupWakeLockSupported();
    const { result, unmount } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    unmount();

    expect(mockRelease).toHaveBeenCalled();
  });

  it('adds release event listener to sentinel', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    expect(mockSentinel.addEventListener).toHaveBeenCalledWith(
      'release',
      expect.any(Function)
    );
  });

  it('type is screen when active', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    expect(result.current.type).toBeNull();

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.type).toBe('screen');
  });

  it('type returns to null after release', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.type).toBeNull();
  });

  it('returns all expected fields', () => {
    setupWakeLockUnsupported();
    const { result } = renderHook(() => useWakeLock());

    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('isActive');
    expect(result.current).toHaveProperty('request');
    expect(result.current).toHaveProperty('release');
    expect(result.current).toHaveProperty('type');
  });

  it('request and release are stable function references', () => {
    setupWakeLockSupported();
    const { result, rerender } = renderHook(() => useWakeLock());

    const request1 = result.current.request;
    const release1 = result.current.release;

    rerender();

    expect(result.current.request).toBe(request1);
    expect(result.current.release).toBe(release1);
  });

  it('can request again after releasing', async () => {
    setupWakeLockSupported();
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.request();
    });

    await act(async () => {
      await result.current.release();
    });

    await act(async () => {
      await result.current.request();
    });

    expect(result.current.isActive).toBe(true);
    expect((navigator.wakeLock.request as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2);
  });
});
