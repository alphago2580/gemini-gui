import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaRecorder } from './useMediaRecorder';

interface MockRecorder {
  state: string;
  mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
}

let mockRecorder: MockRecorder;

describe('useMediaRecorder', () => {
  beforeEach(() => {
    mockRecorder = {
      state: 'inactive',
      mimeType: 'audio/webm',
      ondataavailable: null,
      onstop: null,
      onerror: null,
      onpause: null,
      onresume: null,
      start: vi.fn(() => { mockRecorder.state = 'recording'; }),
      stop: vi.fn(() => { mockRecorder.state = 'inactive'; }),
      pause: vi.fn(() => { mockRecorder.state = 'paused'; }),
      resume: vi.fn(() => { mockRecorder.state = 'recording'; }),
    };

    vi.stubGlobal('MediaRecorder', vi.fn(function (this: MockRecorder) {
      Object.assign(this, mockRecorder);
      mockRecorder = this;
    }));
  });

  function createMockStream(): MediaStream {
    return {} as MediaStream;
  }

  it('initializes with inactive state', () => {
    const { result } = renderHook(() => useMediaRecorder());
    expect(result.current.status).toBe('inactive');
    expect(result.current.blob).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('starts recording', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));
    expect(mockRecorder.start).toHaveBeenCalled();
    expect(result.current.status).toBe('recording');
  });

  it('stops recording and creates blob', () => {
    const onStop = vi.fn();
    const { result } = renderHook(() => useMediaRecorder({ onStop }));
    act(() => result.current.startRecording(createMockStream()));

    act(() => {
      mockRecorder.ondataavailable?.({ data: new Blob(['chunk1']) });
    });

    act(() => {
      mockRecorder.onstop?.();
    });

    expect(result.current.status).toBe('inactive');
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(onStop).toHaveBeenCalled();
  });

  it('calls onDataAvailable for each chunk', () => {
    const onDataAvailable = vi.fn();
    const { result } = renderHook(() => useMediaRecorder({ onDataAvailable }));
    act(() => result.current.startRecording(createMockStream()));

    const chunk = new Blob(['data']);
    act(() => {
      mockRecorder.ondataavailable?.({ data: chunk });
    });
    expect(onDataAvailable).toHaveBeenCalledWith(chunk);
  });

  it('ignores empty data chunks', () => {
    const onDataAvailable = vi.fn();
    const { result } = renderHook(() => useMediaRecorder({ onDataAvailable }));
    act(() => result.current.startRecording(createMockStream()));

    act(() => {
      mockRecorder.ondataavailable?.({ data: new Blob([]) });
    });
    expect(onDataAvailable).not.toHaveBeenCalled();
  });

  it('pauses and resumes recording', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));

    act(() => {
      result.current.pauseRecording();
      mockRecorder.onpause?.();
    });
    expect(result.current.status).toBe('paused');
    expect(mockRecorder.pause).toHaveBeenCalled();

    act(() => {
      result.current.resumeRecording();
      mockRecorder.onresume?.();
    });
    expect(result.current.status).toBe('recording');
    expect(mockRecorder.resume).toHaveBeenCalled();
  });

  it('does not pause when not recording', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));
    mockRecorder.state = 'inactive';
    act(() => result.current.pauseRecording());
    expect(mockRecorder.pause).not.toHaveBeenCalled();
  });

  it('does not resume when not paused', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));
    mockRecorder.state = 'recording';
    act(() => result.current.resumeRecording());
    expect(mockRecorder.resume).not.toHaveBeenCalled();
  });

  it('handles error', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useMediaRecorder({ onError }));
    act(() => result.current.startRecording(createMockStream()));

    const errorEvent = new Event('error');
    act(() => {
      mockRecorder.onerror?.(errorEvent);
    });
    expect(result.current.error).toBe(errorEvent);
    expect(result.current.status).toBe('inactive');
    expect(onError).toHaveBeenCalledWith(errorEvent);
  });

  it('resets state', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));
    act(() => {
      mockRecorder.ondataavailable?.({ data: new Blob(['data']) });
      mockRecorder.onstop?.();
    });
    expect(result.current.blob).not.toBeNull();

    act(() => result.current.reset());
    expect(result.current.status).toBe('inactive');
    expect(result.current.blob).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('stopRecording does nothing when inactive', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.stopRecording());
    expect(mockRecorder.stop).not.toHaveBeenCalled();
  });

  it('passes mimeType to MediaRecorder', () => {
    const { result } = renderHook(() =>
      useMediaRecorder({ mimeType: 'video/webm' })
    );
    act(() => result.current.startRecording(createMockStream()));
    expect(vi.mocked(MediaRecorder)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ mimeType: 'video/webm' })
    );
  });

  it('clears previous blob on new recording', () => {
    const { result } = renderHook(() => useMediaRecorder());
    act(() => result.current.startRecording(createMockStream()));
    act(() => {
      mockRecorder.ondataavailable?.({ data: new Blob(['data']) });
      mockRecorder.onstop?.();
    });
    expect(result.current.blob).not.toBeNull();

    act(() => result.current.startRecording(createMockStream()));
    expect(result.current.blob).toBeNull();
  });
});
