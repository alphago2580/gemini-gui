import { renderHook, act } from '@testing-library/react';
import { useMediaCapture } from './useMediaCapture';

let mockGetUserMedia: ReturnType<typeof vi.fn>;
let mockRecorderInstances: Array<{
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  state: string;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onerror: (() => void) | null;
}>;

function createMockStream() {
  const tracks = [
    { stop: vi.fn(), kind: 'audio' },
    { stop: vi.fn(), kind: 'video' },
  ];
  return {
    getTracks: () => tracks,
    tracks,
  };
}

const MockMediaRecorder = class {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  state: string;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    this.state = 'inactive';
    this.start = vi.fn(() => {
      this.state = 'recording';
    });
    this.stop = vi.fn(() => {
      this.state = 'inactive';
    });
    this.pause = vi.fn(() => {
      this.state = 'paused';
    });
    this.resume = vi.fn(() => {
      this.state = 'recording';
    });
    mockRecorderInstances.push(this);
  }
};

beforeEach(() => {
  mockRecorderInstances = [];
  mockGetUserMedia = vi.fn();
  vi.stubGlobal('MediaRecorder', MockMediaRecorder);

  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
      writable: true,
    });
  } else {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: mockGetUserMedia,
      configurable: true,
      writable: true,
    });
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaCapture', () => {
  it('returns idle status initially', () => {
    const { result } = renderHook(() => useMediaCapture());
    expect(result.current.status).toBe('idle');
    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.chunks).toEqual([]);
  });

  it('reports isSupported based on navigator.mediaDevices', () => {
    const { result } = renderHook(() => useMediaCapture());
    expect(result.current.isSupported).toBe(true);
  });

  it('starts capture and transitions to active', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe('active');
    expect(result.current.stream).toBe(mockStream);
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(mockRecorderInstances).toHaveLength(1);
    expect(mockRecorderInstances[0].start).toHaveBeenCalled();
  });

  it('stops capture and releases tracks', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.status).toBe('stopped');
    expect(result.current.stream).toBeNull();
    for (const track of mockStream.tracks) {
      expect(track.stop).toHaveBeenCalled();
    }
  });

  it('pauses and resumes recording', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe('paused');
    expect(mockRecorderInstances[0].pause).toHaveBeenCalled();

    act(() => {
      result.current.resume();
    });
    expect(result.current.status).toBe('active');
    expect(mockRecorderInstances[0].resume).toHaveBeenCalled();
  });

  it('collects data chunks', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const onDataAvailable = vi.fn();
    const { result } = renderHook(() =>
      useMediaCapture({ onDataAvailable })
    );

    await act(async () => {
      await result.current.start();
    });

    const blob = new Blob(['audio-data'], { type: 'audio/webm' });
    act(() => {
      mockRecorderInstances[0].ondataavailable?.({ data: blob });
    });

    expect(result.current.chunks).toHaveLength(1);
    expect(result.current.chunks[0]).toBe(blob);
    expect(onDataAvailable).toHaveBeenCalledWith(blob);
  });

  it('ignores empty data chunks', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    const emptyBlob = new Blob([], { type: 'audio/webm' });
    act(() => {
      mockRecorderInstances[0].ondataavailable?.({ data: emptyBlob });
    });

    expect(result.current.chunks).toHaveLength(0);
  });

  it('handles getUserMedia rejection', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    const onError = vi.fn();
    const { result } = renderHook(() => useMediaCapture({ onError }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Permission denied');
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Permission denied' }));
  });

  it('handles recorder error', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const onError = vi.fn();
    const { result } = renderHook(() => useMediaCapture({ onError }));

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      mockRecorderInstances[0].onerror?.();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('MediaRecorder error');
    expect(onError).toHaveBeenCalled();
  });

  it('auto-stops after maxDuration', async () => {
    vi.useFakeTimers();
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() =>
      useMediaCapture({ maxDuration: 5000 })
    );

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe('active');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.status).toBe('stopped');
    vi.useRealTimers();
  });

  it('passes custom constraints', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() =>
      useMediaCapture({
        audio: { echoCancellation: true },
        video: { width: 1280, height: 720 },
      })
    );

    await act(async () => {
      await result.current.start();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: { echoCancellation: true },
      video: { width: 1280, height: 720 },
    });
  });

  it('getBlob returns combined blob', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    const blob1 = new Blob(['data1'], { type: 'audio/webm' });
    const blob2 = new Blob(['data2'], { type: 'audio/webm' });

    act(() => {
      mockRecorderInstances[0].ondataavailable?.({ data: blob1 });
    });
    act(() => {
      mockRecorderInstances[0].ondataavailable?.({ data: blob2 });
    });

    expect(result.current.chunks).toHaveLength(2);
    const combined = result.current.getBlob();
    expect(combined).toBeInstanceOf(Blob);
    expect(combined?.type).toBe('audio/webm');
  });

  it('getBlob returns null when no chunks', () => {
    const { result } = renderHook(() => useMediaCapture());
    expect(result.current.getBlob()).toBeNull();
  });

  it('cleans up on unmount', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result, unmount } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    unmount();

    for (const track of mockStream.tracks) {
      expect(track.stop).toHaveBeenCalled();
    }
  });

  it('pause does nothing when not recording', () => {
    const { result } = renderHook(() => useMediaCapture());
    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe('idle');
  });

  it('resume does nothing when not paused', async () => {
    const mockStream = createMockStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMediaCapture());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.resume();
    });
    // Should still be active, not error
    expect(result.current.status).toBe('active');
  });

  it('reports unsupported when mediaDevices unavailable', () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useMediaCapture());
    expect(result.current.isSupported).toBe(false);

    Object.defineProperty(navigator, 'mediaDevices', {
      value: original,
      configurable: true,
      writable: true,
    });
  });

  it('handles start when unsupported', async () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const onError = vi.fn();
    const { result } = renderHook(() => useMediaCapture({ onError }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('getUserMedia is not supported');
    expect(onError).toHaveBeenCalled();

    Object.defineProperty(navigator, 'mediaDevices', {
      value: original,
      configurable: true,
      writable: true,
    });
  });
});
