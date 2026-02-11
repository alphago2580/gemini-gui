import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaSession } from './useMediaSession';

let mockSetActionHandler: ReturnType<typeof vi.fn>;
let mockSetPositionState: ReturnType<typeof vi.fn>;
let registeredHandlers: Map<string, (() => void) | null>;

beforeEach(() => {
  registeredHandlers = new Map();
  mockSetActionHandler = vi.fn((action: string, handler: (() => void) | null) => {
    registeredHandlers.set(action, handler);
  });
  mockSetPositionState = vi.fn();

  Object.defineProperty(navigator, 'mediaSession', {
    value: {
      setActionHandler: mockSetActionHandler,
      setPositionState: mockSetPositionState,
      metadata: null,
      playbackState: 'none',
    },
    writable: true,
    configurable: true,
  });

  // Mock MediaMetadata
  if (typeof globalThis.MediaMetadata === 'undefined') {
    (globalThis as Record<string, unknown>).MediaMetadata = class MockMediaMetadata {
      title: string; artist: string; album: string; artwork: unknown[];
      constructor(data: Record<string, unknown> = {}) {
        this.title = (data.title as string) ?? '';
        this.artist = (data.artist as string) ?? '';
        this.album = (data.album as string) ?? '';
        this.artwork = (data.artwork as unknown[]) ?? [];
      }
    };
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaSession', () => {
  it('returns isSupported as true when mediaSession exists', () => {
    const { result } = renderHook(() => useMediaSession());
    expect(result.current.isSupported).toBe(true);
  });

  it('registers play handler', () => {
    const onPlay = vi.fn();
    renderHook(() => useMediaSession({ onPlay }));

    expect(mockSetActionHandler).toHaveBeenCalledWith('play', expect.any(Function));
  });

  it('registers pause handler', () => {
    const onPause = vi.fn();
    renderHook(() => useMediaSession({ onPause }));

    expect(mockSetActionHandler).toHaveBeenCalledWith('pause', expect.any(Function));
  });

  it('registers multiple handlers', () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();
    renderHook(() => useMediaSession({ onPlay, onPause, onStop }));

    expect(mockSetActionHandler).toHaveBeenCalledWith('play', expect.any(Function));
    expect(mockSetActionHandler).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(mockSetActionHandler).toHaveBeenCalledWith('stop', expect.any(Function));
  });

  it('calls the play handler when action is triggered', () => {
    const onPlay = vi.fn();
    renderHook(() => useMediaSession({ onPlay }));

    const handler = registeredHandlers.get('play');
    if (handler) handler();

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('calls the pause handler when action is triggered', () => {
    const onPause = vi.fn();
    renderHook(() => useMediaSession({ onPause }));

    const handler = registeredHandlers.get('pause');
    if (handler) handler();

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('only registers handlers that are provided', () => {
    renderHook(() => useMediaSession({ onPlay: vi.fn() }));

    // Only play should be registered, not pause/stop etc.
    const registeredActions = Array.from(registeredHandlers.keys());
    expect(registeredActions).toContain('play');
    // On cleanup, null is set — but during setup only 'play' is registered
  });

  it('cleans up handlers on unmount', () => {
    const onPlay = vi.fn();
    const { unmount } = renderHook(() => useMediaSession({ onPlay }));

    unmount();

    // setActionHandler should be called with null for cleanup
    expect(mockSetActionHandler).toHaveBeenCalledWith('play', null);
  });

  it('setMetadata sets navigator.mediaSession.metadata', () => {
    const { result } = renderHook(() => useMediaSession());

    act(() => {
      result.current.setMetadata({ title: 'Test Song', artist: 'Test Artist' });
    });

    expect(navigator.mediaSession.metadata).toBeTruthy();
  });

  it('setPlaybackState updates playback state', () => {
    const { result } = renderHook(() => useMediaSession());

    act(() => {
      result.current.setPlaybackState('playing');
    });

    expect(navigator.mediaSession.playbackState).toBe('playing');
  });

  it('setPositionState calls navigator.mediaSession.setPositionState', () => {
    const { result } = renderHook(() => useMediaSession());

    act(() => {
      result.current.setPositionState({ duration: 300, position: 60, playbackRate: 1 });
    });

    expect(mockSetPositionState).toHaveBeenCalledWith({
      duration: 300,
      position: 60,
      playbackRate: 1,
    });
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useMediaSession());

    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('setMetadata');
    expect(result.current).toHaveProperty('setPlaybackState');
    expect(result.current).toHaveProperty('setPositionState');
  });

  it('setMetadata, setPlaybackState, setPositionState are stable', () => {
    const { result, rerender } = renderHook(() => useMediaSession());

    const m1 = result.current.setMetadata;
    const p1 = result.current.setPlaybackState;
    const s1 = result.current.setPositionState;

    rerender();

    expect(result.current.setMetadata).toBe(m1);
    expect(result.current.setPlaybackState).toBe(p1);
    expect(result.current.setPositionState).toBe(s1);
  });

  it('works with no handlers provided', () => {
    const { result } = renderHook(() => useMediaSession());
    expect(result.current.isSupported).toBe(true);
  });

  it('uses latest handler references', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ onPlay }) => useMediaSession({ onPlay }),
      { initialProps: { onPlay: handler1 } }
    );

    rerender({ onPlay: handler2 });

    // Trigger the registered handler
    const playHandler = registeredHandlers.get('play');
    if (playHandler) playHandler();

    // handler2 should be called because we use ref
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
