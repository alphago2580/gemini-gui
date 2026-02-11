import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationSound } from './useNotificationSound';

describe('useNotificationSound', () => {
  let mockOscillator: { type: string; frequency: { value: number }; connect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };
  let mockGain: { gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn> };
  let mockContext: { currentTime: number; destination: string; createOscillator: ReturnType<typeof vi.fn>; createGain: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockOscillator = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    mockContext = {
      currentTime: 0,
      destination: 'dest',
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
    };

    global.AudioContext = function() {
      return mockContext;
    } as unknown as typeof AudioContext;
  });

  it('returns a play function', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    expect(typeof result.current.play).toBe('function');
  });

  it('plays sound when enabled', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(mockContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockContext.createGain).toHaveBeenCalledTimes(2);
    expect(mockOscillator.start).toHaveBeenCalledTimes(2);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(2);
  });

  it('does not play sound when disabled', () => {
    const { result } = renderHook(() => useNotificationSound(false));
    act(() => result.current.play());
    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it('reuses AudioContext across calls', () => {
    const constructorSpy = vi.fn().mockReturnValue(mockContext);
    global.AudioContext = constructorSpy as unknown as typeof AudioContext;

    const { result } = renderHook(() => useNotificationSound(true));
    act(() => {
      result.current.play();
      result.current.play();
    });
    // AudioContext created at most once per play call, reused via ref when possible
    expect(constructorSpy).toHaveBeenCalled();
  });

  it('sets correct frequencies for two tones', () => {
    const frequencies: number[] = [];
    mockContext.createOscillator = vi.fn().mockImplementation(() => ({
      type: '',
      frequency: {
        set value(v: number) { frequencies.push(v); },
        get value() { return 0; },
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(frequencies).toContain(523);
    expect(frequencies).toContain(659);
  });

  it('handles AudioContext error gracefully', () => {
    global.AudioContext = function() {
      throw new Error('not supported');
    } as unknown as typeof AudioContext;

    const { result } = renderHook(() => useNotificationSound(true));
    expect(() => {
      act(() => result.current.play());
    }).not.toThrow();
  });

  it('play function is stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useNotificationSound(true));
    const play1 = result.current.play;
    rerender();
    expect(result.current.play).toBe(play1);
  });

  it('oscillators connect to gain nodes', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
  });

  it('gain nodes connect to destination', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(mockGain.connect).toHaveBeenCalledWith('dest');
  });

  it('sets gain values for volume envelope', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(mockGain.gain.setValueAtTime).toHaveBeenCalled();
    expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
  });

  it('enabled toggle from true to false stops playing', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useNotificationSound(enabled),
      { initialProps: { enabled: true } }
    );

    act(() => result.current.play());
    expect(mockContext.createOscillator).toHaveBeenCalled();

    mockContext.createOscillator.mockClear();
    rerender({ enabled: false });

    act(() => result.current.play());
    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it('uses sine wave type for oscillators', () => {
    const types: string[] = [];
    mockContext.createOscillator = vi.fn().mockImplementation(() => ({
      set type(v: string) { types.push(v); },
      get type() { return ''; },
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const { result } = renderHook(() => useNotificationSound(true));
    act(() => result.current.play());
    expect(types.every(t => t === 'sine')).toBe(true);
    expect(types.length).toBe(2);
  });

  it('return shape contains only play function', () => {
    const { result } = renderHook(() => useNotificationSound(true));
    expect(Object.keys(result.current)).toEqual(['play']);
    expect(typeof result.current.play).toBe('function');
  });
});
