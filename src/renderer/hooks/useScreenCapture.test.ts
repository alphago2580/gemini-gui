import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScreenCapture } from './useScreenCapture';

let mockTracks: Array<{ stop: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>; kind: string }>;
let mockStream: { getTracks: () => typeof mockTracks };
let endedListeners: Map<object, () => void>;

beforeEach(() => {
  endedListeners = new Map();
  mockTracks = [
    {
      stop: vi.fn(),
      addEventListener: vi.fn((event: string, cb: () => void) => {
        if (event === 'ended') endedListeners.set(mockTracks[0], cb);
      }),
      removeEventListener: vi.fn(),
      kind: 'video',
    },
  ];
  mockStream = {
    getTracks: () => mockTracks,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setupMediaDevices(supported: boolean = true) {
  if (supported) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });
  } else {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {},
      writable: true,
      configurable: true,
    });
  }
}

describe('useScreenCapture', () => {
  it('returns initial state', () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    expect(result.current.isCapturing).toBe(false);
    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('detects support when getDisplayMedia is available', () => {
    setupMediaDevices(true);
    const { result } = renderHook(() => useScreenCapture());

    expect(result.current.isSupported).toBe(true);
  });

  it('detects no support when getDisplayMedia is unavailable', () => {
    setupMediaDevices(false);
    const { result } = renderHook(() => useScreenCapture());

    expect(result.current.isSupported).toBe(false);
  });

  it('starts screen capture successfully', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    let stream: MediaStream | null = null;
    await act(async () => {
      stream = await result.current.start();
    });

    expect(result.current.isCapturing).toBe(true);
    expect(result.current.stream).toBe(mockStream);
    expect(result.current.error).toBeNull();
    expect(stream).toBe(mockStream);
  });

  it('stops screen capture', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.isCapturing).toBe(false);
    expect(result.current.stream).toBeNull();
    expect(mockTracks[0].stop).toHaveBeenCalled();
  });

  it('removes track ended listeners on stop', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    // A listener was added
    expect(mockTracks[0].addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    const addedListener = mockTracks[0].addEventListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'ended'
    )?.[1];

    act(() => {
      result.current.stop();
    });

    // The same listener should have been removed
    expect(mockTracks[0].removeEventListener).toHaveBeenCalledWith('ended', addedListener);
  });

  it('handles start error', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useScreenCapture());

    const stream = await act(async () => {
      return await result.current.start();
    });

    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toBe('Permission denied');
    expect(stream).toBeNull();
  });

  it('sets error when not supported', async () => {
    setupMediaDevices(false);
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBe('Screen capture is not supported');
    expect(result.current.isCapturing).toBe(false);
  });

  it('handles track ended event (user stops sharing)', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isCapturing).toBe(true);

    // Simulate user clicking "Stop sharing"
    act(() => {
      const listener = endedListeners.get(mockTracks[0]);
      if (listener) listener();
    });

    expect(result.current.isCapturing).toBe(false);
    expect(result.current.stream).toBeNull();
  });

  it('stops previous capture when starting new one', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    const firstTrackStop = mockTracks[0].stop;

    // Create new mock for second capture
    const newTracks = [
      {
        stop: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        kind: 'video',
      },
    ];
    const newStream = { getTracks: () => newTracks };
    (navigator.mediaDevices.getDisplayMedia as ReturnType<typeof vi.fn>).mockResolvedValue(newStream);

    await act(async () => {
      await result.current.start();
    });

    expect(firstTrackStop).toHaveBeenCalled();
    // Old track listeners should have been removed
    expect(mockTracks[0].removeEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    expect(result.current.stream).toBe(newStream);
  });

  it('passes options to getDisplayMedia', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    const options = { video: { displaySurface: 'monitor' as const } };
    await act(async () => {
      await result.current.start(options);
    });

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith(options);
  });

  it('uses default options when none provided', async () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith({ video: true });
  });

  it('clears error on successful start', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: vi.fn()
          .mockRejectedValueOnce(new Error('Failed'))
          .mockResolvedValueOnce(mockStream),
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBe('Failed');

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isCapturing).toBe(true);
  });

  it('stops tracks and removes listeners on unmount', async () => {
    setupMediaDevices();
    const { result, unmount } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    const addedListener = mockTracks[0].addEventListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'ended'
    )?.[1];

    unmount();

    expect(mockTracks[0].stop).toHaveBeenCalled();
    expect(mockTracks[0].removeEventListener).toHaveBeenCalledWith('ended', addedListener);
  });

  it('stop is safe to call when not capturing', () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    expect(() => {
      act(() => {
        result.current.stop();
      });
    }).not.toThrow();
  });

  it('returns all expected fields', () => {
    setupMediaDevices();
    const { result } = renderHook(() => useScreenCapture());

    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('isCapturing');
    expect(result.current).toHaveProperty('stream');
    expect(result.current).toHaveProperty('start');
    expect(result.current).toHaveProperty('stop');
    expect(result.current).toHaveProperty('error');
  });

  it('handles non-Error throws gracefully', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getDisplayMedia: vi.fn().mockRejectedValue('string error'),
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useScreenCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBe('Failed to start screen capture');
  });

  it('stop and start are stable function references', () => {
    setupMediaDevices();
    const { result, rerender } = renderHook(() => useScreenCapture());

    const stop1 = result.current.stop;
    const start1 = result.current.start;

    rerender();

    expect(result.current.stop).toBe(stop1);
    expect(result.current.start).toBe(start1);
  });
});
